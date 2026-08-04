// Officially ends a volunteer opportunity: records accomplishments and emails
// all participants (registered users + guest signups) a thank-you summary.
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
    const rawList = Array.isArray(body?.accomplishments) ? body.accomplishments : [];
    const accomplishments = rawList
      .filter((a: unknown) => typeof a === "string")
      .map((a: string) => a.trim())
      .filter((a: string) => a.length > 0 && a.length <= 500)
      .slice(0, 50);

    if (!sessionToken || !volunteerId || accomplishments.length === 0) {
      return new Response(
        JSON.stringify({ error: "sessionToken, volunteerId and at least one accomplishment are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

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
      .select("id, title, creator_user_id, is_ended")
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

    if (volunteer.is_ended) {
      return new Response(JSON.stringify({ error: "This opportunity has already been ended" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { error: updateError } = await supabase
      .from("volunteers")
      .update({
        is_ended: true,
        ended_at: new Date().toISOString(),
        accomplishments: accomplishments.join("\n"),
      })
      .eq("id", volunteerId);

    if (updateError) throw new Error(updateError.message);

    // Collect recipients
    const { data: signups } = await supabase
      .from("volunteer_signups")
      .select("user_id, guest_info")
      .eq("volunteer_id", volunteerId);

    const userIds = [...new Set((signups || []).map((s: any) => s.user_id).filter(Boolean))];
    const recipients = new Map<string, string | null>();

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
      return new Response(JSON.stringify({ success: true, ended: true, sent: 0 }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const listHtml = accomplishments.map((a: string) => `<li>${escapeHtml(a)}</li>`).join("");
    const listText = accomplishments.map((a: string) => `- ${a}`).join("\n");
    const subject = `Thank you for volunteering: ${volunteer.title}`;

    const emails = [...recipients.entries()].map(([email, firstName]) => {
      const greeting = firstName ? `Hi ${escapeHtml(firstName)},` : "Hello,";
      const html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #1a1a1a;">
          <p style="font-size: 16px; margin: 0 0 16px;">${greeting}</p>
          <p style="font-size: 15px; line-height: 1.6; color: #333; margin: 0 0 16px;">
            Thank you for giving your time to <strong>${escapeHtml(volunteer.title)}</strong>. Because of you, here is what we accomplished together:
          </p>
          <ul style="font-size: 15px; line-height: 1.7; color: #333; padding-left: 20px; margin: 0 0 20px;">${listHtml}</ul>
          <p style="font-size: 15px; line-height: 1.6; color: #333; margin: 0;">We truly appreciate your support.</p>
          <p style="font-size: 13px; color: #666; margin: 24px 0 0;">
            You received this email because you showed interest in this volunteer opportunity.
          </p>
        </div>
      `;
      return {
        from: FROM,
        to: [email],
        subject,
        html,
        text: `${firstName ? `Hi ${firstName},` : "Hello,"}\n\nThank you for giving your time to ${volunteer.title}. Here is what we accomplished together:\n\n${listText}\n\nWe truly appreciate your support.`,
      };
    });

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
      return new Response(
        JSON.stringify({ error: "Opportunity ended but emails failed to send", status: resp.status, details: errorBody }),
        { status: resp.status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(JSON.stringify({ success: true, ended: true, sent: emails.length }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("end-volunteer-opportunity error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
