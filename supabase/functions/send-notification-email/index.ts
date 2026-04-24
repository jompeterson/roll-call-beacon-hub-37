// Sends an email via Resend whenever a new notification row is inserted.
// Triggered by the notifications_send_email database trigger.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/resend";

interface Payload {
  notification_id?: string;
  record?: { id: string };
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

    const body = (await req.json().catch(() => ({}))) as Payload;
    const notificationId = body.notification_id ?? body.record?.id;
    if (!notificationId) {
      return new Response(JSON.stringify({ error: "notification_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

    // Fetch notification
    const { data: notification, error: notifErr } = await supabase
      .from("notifications")
      .select("id, user_id, type, title, message, related_content_type, related_content_id")
      .eq("id", notificationId)
      .single();

    if (notifErr || !notification) {
      console.error("Notification fetch failed:", notifErr);
      return new Response(JSON.stringify({ error: "notification not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch recipient profile (email + name)
    const { data: profile, error: profileErr } = await supabase
      .from("user_profiles")
      .select("email, first_name, last_name")
      .eq("id", notification.user_id)
      .single();

    if (profileErr || !profile?.email) {
      console.error("Profile fetch failed:", profileErr);
      return new Response(JSON.stringify({ error: "recipient email not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const greeting = profile.first_name ? `Hi ${profile.first_name},` : "Hello,";
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #1a1a1a;">
        <p style="font-size: 16px; margin: 0 0 16px;">${greeting}</p>
        <h2 style="font-size: 20px; margin: 0 0 12px; color: #111;">${escapeHtml(notification.title)}</h2>
        <p style="font-size: 15px; line-height: 1.5; margin: 0 0 24px; color: #333;">${escapeHtml(notification.message)}</p>
        <p style="font-size: 13px; color: #666; margin: 24px 0 0;">
          You received this email because you have notifications enabled on your account.
        </p>
      </div>
    `;

    const text = `${greeting}\n\n${notification.title}\n\n${notification.message}`;

    // Add a small jitter (0-1500ms) before sending to spread bursts across the
    // Resend 5 req/sec rate limit when many notification rows are inserted at once.
    await new Promise((r) => setTimeout(r, Math.floor(Math.random() * 1500)));

    const payload = JSON.stringify({
      from: "Notifications <onboarding@resend.dev>",
      to: [profile.email],
      subject: notification.title,
      html,
      text,
    });

    // Retry on 429 (rate limit) and 5xx with exponential backoff + jitter.
    const MAX_ATTEMPTS = 6;
    let resp: Response | null = null;
    let data: any = null;
    let lastError: any = null;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      resp = await fetch(`${GATEWAY_URL}/emails`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "X-Connection-Api-Key": RESEND_API_KEY,
        },
        body: payload,
      });

      data = await resp.json().catch(() => ({}));

      if (resp.ok) break;

      const retryable = resp.status === 429 || resp.status >= 500;
      lastError = { status: resp.status, data };

      if (!retryable || attempt === MAX_ATTEMPTS) {
        console.error("Resend send failed", resp.status, data);
        return new Response(JSON.stringify({ error: "send failed", details: data }), {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Backoff: 1s, 2s, 4s, 8s, 16s (+ up to 1s jitter), capped at 16s.
      const backoffMs = Math.min(1000 * Math.pow(2, attempt - 1), 16000) + Math.floor(Math.random() * 1000);
      console.warn(`Resend ${resp.status}, retrying in ${backoffMs}ms (attempt ${attempt}/${MAX_ATTEMPTS})`);
      await new Promise((r) => setTimeout(r, backoffMs));
    }

    if (!resp || !resp.ok) {
      return new Response(JSON.stringify({ error: "send failed after retries", details: lastError }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, id: data.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
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
