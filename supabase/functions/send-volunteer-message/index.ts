// Sends a formatted message from the poster of a volunteer opportunity to
// everyone who showed interest (registered users + guest signups).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/resend";
const FROM = "HBF Roll Call <hello@notify.pacificcrest.us>";

function escapeHtml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Allow only simple formatting tags; strip everything else and all attributes.
const ALLOWED = ["b", "strong", "i", "em", "u", "p", "br", "ul", "ol", "li", "h1", "h2", "h3", "blockquote"];

function sanitizeHtml(input: string) {
  let out = input.replace(/<\s*(script|style)[\s\S]*?<\s*\/\s*\1\s*>/gi, "");
  out = out.replace(/<\s*\/?\s*([a-zA-Z0-9]+)((?:[^>"']|"[^"]*"|'[^']*')*)>/g, (_m, tag: string, attrs: string) => {
    const name = tag.toLowerCase();
    if (!ALLOWED.includes(name)) return "";
    const closing = /^<\s*\//.test(_m);
    if (closing) return `</${name}>`;
    // keep href on nothing (links not allowed) -> drop all attributes
    void attrs;
    return `<${name}>`;
  });
  return out;
}

function htmlToText(html: string) {
  return html
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\s*\/\s*(p|div|li|h1|h2|h3|blockquote)\s*>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY is not configured");
    if (!SUPABASE_URL || !SERVICE_ROLE) throw new Error("Supabase env not configured");

    const body = await req.json().catch(() => null);
    const sessionToken = typeof body?.sessionToken === "string" ? body.sessionToken : "";
    const volunteerId = typeof body?.volunteerId === "string" ? body.volunteerId : "";
    const subjectRaw = typeof body?.subject === "string" ? body.subject.trim() : "";
    const messageHtmlRaw = typeof body?.messageHtml === "string" ? body.messageHtml : "";

    if (!sessionToken || !volunteerId || !subjectRaw || !messageHtmlRaw) {
      return new Response(JSON.stringify({ error: "sessionToken, volunteerId, subject and messageHtml are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (subjectRaw.length > 200 || messageHtmlRaw.length > 20000) {
      return new Response(JSON.stringify({ error: "Subject or message is too long" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

    // Validate the custom session token
    const { data: sessionUser } = await supabase
      .from("users")
      .select("id, session_expires_at")
      .eq("session_token", sessionToken)
      .maybeSingle();

    if (!sessionUser || (sessionUser.session_expires_at && new Date(sessionUser.session_expires_at) < new Date())) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: volunteer } = await supabase
      .from("volunteers")
      .select("id, title, creator_user_id, start_date, end_date")
      .eq("id", volunteerId)
      .maybeSingle();

    if (!volunteer) {
      return new Response(JSON.stringify({ error: "Volunteer opportunity not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: isAdmin } = await supabase.rpc("user_is_admin", { _user_id: sessionUser.id });
    if (volunteer.creator_user_id !== sessionUser.id && !isAdmin) {
      return new Response(JSON.stringify({ error: "Not allowed" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const endsAt = new Date(volunteer.end_date || volunteer.start_date);
    if (endsAt > new Date()) {
      return new Response(JSON.stringify({ error: "This opportunity has not happened yet" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Collect recipients
    const { data: signups } = await supabase
      .from("volunteer_signups")
      .select("user_id, guest_info")
      .eq("volunteer_id", volunteerId);

    const userIds = [...new Set((signups || []).map((s: any) => s.user_id).filter(Boolean))];
    const recipients = new Map<string, string | null>(); // email -> first name

    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from("user_profiles")
        .select("email, first_name")
        .in("id", userIds);
      (profiles || []).forEach((p: any) => {
        if (p.email) recipients.set(String(p.email).toLowerCase(), p.first_name ?? null);
      });
    }

    (signups || []).forEach((s: any) => {
      const email = s.guest_info?.email;
      if (typeof email === "string" && email.includes("@")) {
        recipients.set(email.toLowerCase(), s.guest_info?.firstName ?? null);
      }
    });

    if (recipients.size === 0) {
      return new Response(JSON.stringify({ error: "No one has shown interest in this opportunity yet" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const safeMessage = sanitizeHtml(messageHtmlRaw);
    const plain = htmlToText(safeMessage);
    const subject = escapeHtml(subjectRaw);

    const emails = [...recipients.entries()].map(([email, firstName]) => {
      const greeting = firstName ? `Hi ${escapeHtml(firstName)},` : "Hello,";
      const html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #1a1a1a;">
          <p style="font-size: 16px; margin: 0 0 16px;">${greeting}</p>
          <h2 style="font-size: 20px; margin: 0 0 4px; color: #111;">${escapeHtml(volunteer.title)}</h2>
          <div style="font-size: 15px; line-height: 1.6; color: #333;">${safeMessage}</div>
          <p style="font-size: 13px; color: #666; margin: 24px 0 0;">
            You received this email because you showed interest in this volunteer opportunity.
          </p>
        </div>
      `;
      return {
        from: FROM,
        to: [email],
        subject: subjectRaw,
        html,
        text: `${firstName ? `Hi ${firstName},` : "Hello,"}\n\n${volunteer.title}\n\n${plain}`,
      };
    });
    void subject;

    const resp = await fetch(`${GATEWAY_URL}/emails/batch`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": RESEND_API_KEY,
      },
      body: JSON.stringify(emails),
    });

    if (!resp.ok) {
      const errorBody = await resp.text();
      console.error(`Resend batch failed [${resp.status}]: ${errorBody}`);
      return new Response(JSON.stringify({ error: "Failed to send emails", status: resp.status, details: errorBody }), {
        status: resp.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, sent: emails.length }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("send-volunteer-message error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
