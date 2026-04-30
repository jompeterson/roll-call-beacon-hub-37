// Batched notification email dispatcher.
// Triggered every 30 seconds by a pg_cron job. Pulls up to 100 unsent
// notifications, fetches recipient profiles in one query, and sends them
// all in a single Resend POST /emails/batch request (counts as 1 against
// the 5 req/sec rate limit).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/resend";
const BATCH_SIZE = 100; // Resend batch endpoint allows up to 100 emails per request
const MAX_ATTEMPTS = 5; // Stop retrying a notification after this many failed sends

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

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

    const APP_BASE_URL = Deno.env.get("APP_BASE_URL") || "https://roll-call-beacon-hub-37.lovable.app";

    // Pull a batch of unsent notifications, oldest first
    const { data: notifications, error: fetchErr } = await supabase
      .from("notifications")
      .select("id, user_id, title, message, email_attempts, related_content_type, related_content_id")
      .eq("email_sent", false)
      .lt("email_attempts", MAX_ATTEMPTS)
      .order("created_at", { ascending: true })
      .limit(BATCH_SIZE);

    if (fetchErr) {
      console.error("Failed to fetch notifications:", fetchErr);
      return new Response(JSON.stringify({ error: "fetch failed", details: fetchErr.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!notifications || notifications.length === 0) {
      return new Response(JSON.stringify({ success: true, processed: 0 }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch all recipient profiles in one query
    const userIds = [...new Set(notifications.map((n) => n.user_id))];
    const { data: profiles, error: profileErr } = await supabase
      .from("user_profiles")
      .select("id, email, first_name")
      .in("id", userIds);

    if (profileErr) {
      console.error("Failed to fetch profiles:", profileErr);
      return new Response(JSON.stringify({ error: "profile fetch failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const profileMap = new Map(profiles?.map((p) => [p.id, p]) ?? []);

    // Build the batch payload
    type EmailItem = {
      from: string;
      to: string[];
      subject: string;
      html: string;
      text: string;
    };

    const emails: EmailItem[] = [];
    const includedIds: string[] = [];
    const skippedIds: string[] = [];

    for (const n of notifications) {
      const profile = profileMap.get(n.user_id);
      if (!profile?.email) {
        skippedIds.push(n.id);
        continue;
      }
      const greeting = profile.first_name ? `Hi ${profile.first_name},` : "Hello,";
      const postUrl = buildPostUrl(APP_BASE_URL, n.related_content_type, n.related_content_id);
      const buttonHtml = postUrl
        ? `<p style="margin: 0 0 24px;"><a href="${postUrl}" style="display: inline-block; background-color: #111; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-size: 15px; font-weight: 500;">View Post</a></p>`
        : "";
      const buttonText = postUrl ? `\n\nView post: ${postUrl}` : "";
      const html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #1a1a1a;">
          <p style="font-size: 16px; margin: 0 0 16px;">${greeting}</p>
          <h2 style="font-size: 20px; margin: 0 0 12px; color: #111;">${escapeHtml(n.title)}</h2>
          <p style="font-size: 15px; line-height: 1.5; margin: 0 0 24px; color: #333;">${escapeHtml(n.message)}</p>
          ${buttonHtml}
          <p style="font-size: 13px; color: #666; margin: 24px 0 0;">
            You received this email because you have notifications enabled on your account.
          </p>
        </div>
      `;
      const text = `${greeting}\n\n${n.title}\n\n${n.message}${buttonText}`;

      emails.push({
        from: "HBF Roll Call <hello@notify.pacificcrest.us>",
        to: [profile.email],
        subject: n.title,
        html,
        text,
      });
      includedIds.push(n.id);
    }

    // Mark recipients-not-found as sent (with attempts++) so we don't keep retrying forever
    if (skippedIds.length > 0) {
      await supabase
        .from("notifications")
        .update({ email_sent: true, email_last_attempt_at: new Date().toISOString() })
        .in("id", skippedIds);
    }

    if (emails.length === 0) {
      return new Response(JSON.stringify({ success: true, processed: 0, skipped: skippedIds.length }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Send the batch via Resend's batch endpoint with retry on 429/5xx
    let resp: Response | null = null;
    let respData: any = null;
    const RETRY_ATTEMPTS = 4;

    for (let attempt = 1; attempt <= RETRY_ATTEMPTS; attempt++) {
      resp = await fetch(`${GATEWAY_URL}/emails/batch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "X-Connection-Api-Key": RESEND_API_KEY,
        },
        body: JSON.stringify(emails),
      });

      respData = await resp.json().catch(() => ({}));

      if (resp.ok) break;

      const retryable = resp.status === 429 || resp.status >= 500;
      if (!retryable || attempt === RETRY_ATTEMPTS) {
        console.error("Resend batch failed", resp.status, respData);
        // Bump attempt counter so we don't infinitely retry broken notifications
        await Promise.all(
          includedIds.map((id) =>
            supabase
              .from("notifications")
              .update({
                email_attempts: (notifications.find((n) => n.id === id)?.email_attempts ?? 0) + 1,
                email_last_attempt_at: new Date().toISOString(),
              })
              .eq("id", id)
          )
        );
        return new Response(JSON.stringify({ error: "send failed", details: respData }), {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const backoffMs = Math.min(1000 * Math.pow(2, attempt - 1), 8000) + Math.floor(Math.random() * 500);
      console.warn(`Resend batch ${resp.status}, retrying in ${backoffMs}ms (attempt ${attempt}/${RETRY_ATTEMPTS})`);
      await new Promise((r) => setTimeout(r, backoffMs));
    }

    // Mark all included notifications as successfully sent
    const { error: updateErr } = await supabase
      .from("notifications")
      .update({ email_sent: true, email_last_attempt_at: new Date().toISOString() })
      .in("id", includedIds);

    if (updateErr) {
      console.error("Failed to mark notifications as sent:", updateErr);
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: emails.length,
        skipped: skippedIds.length,
        batch_id: respData?.id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("send-notification-email error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function escapeHtml(str: string): string {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function buildPostUrl(baseUrl: string, contentType: string | null, contentId: string | null): string | null {
  if (!contentType || !contentId) return null;
  const base = baseUrl.replace(/\/+$/, "");
  switch (contentType) {
    case "donation":
      return `${base}/donations/${contentId}`;
    case "request":
      return `${base}/donations/requests/${contentId}`;
    case "scholarship":
      return `${base}/scholarships/${contentId}`;
    case "event":
      return `${base}/events/${contentId}`;
    case "volunteer":
      return `${base}/volunteers/${contentId}`;
    default:
      return null;
  }
}
