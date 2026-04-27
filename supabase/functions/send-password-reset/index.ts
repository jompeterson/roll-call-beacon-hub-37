// Edge function: send a password reset email via Resend (through Lovable connector gateway).
// Always returns success (to avoid leaking which emails exist).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/resend";

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

    const body = await req.json().catch(() => ({}));
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const appUrl = typeof body?.appUrl === "string" ? body.appUrl : "";

    if (!email || !email.includes("@")) {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

    // Look up user (don't reveal whether or not they exist)
    const { data: user } = await supabase
      .from("users")
      .select("id, email")
      .eq("email", email)
      .maybeSingle();

    if (user) {
      // Get first name for greeting
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("first_name")
        .eq("id", user.id)
        .maybeSingle();

      // Generate a secure random token (raw → emailed; hashed → stored)
      const rawBytes = new Uint8Array(32);
      crypto.getRandomValues(rawBytes);
      const rawToken = btoa(String.fromCharCode(...rawBytes))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

      const hashBuf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(rawToken));
      const tokenHash = Array.from(new Uint8Array(hashBuf))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Invalidate any existing unused tokens for this user
      await supabase
        .from("password_reset_tokens")
        .delete()
        .eq("user_id", user.id)
        .is("used_at", null);

      const { error: insertErr } = await supabase
        .from("password_reset_tokens")
        .insert({
          user_id: user.id,
          token_hash: tokenHash,
          expires_at: expiresAt.toISOString(),
        });

      if (insertErr) {
        console.error("Failed to insert reset token:", insertErr);
        throw new Error("Failed to create reset token");
      }

      const baseUrl = appUrl || "https://roll-call-beacon-hub-37.lovable.app";
      const resetUrl = `${baseUrl.replace(/\/+$/, "")}/reset-password?token=${rawToken}`;
      const greeting = profile?.first_name ? `Hi ${profile.first_name},` : "Hello,";

      const html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #1a1a1a;">
          <p style="font-size: 16px; margin: 0 0 16px;">${greeting}</p>
          <h2 style="font-size: 20px; margin: 0 0 12px; color: #111;">Reset your password</h2>
          <p style="font-size: 15px; line-height: 1.5; margin: 0 0 24px; color: #333;">
            We received a request to reset your password. Click the button below to choose a new one. This link expires in 1 hour.
          </p>
          <p style="margin: 0 0 24px;">
            <a href="${resetUrl}" style="display: inline-block; background: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600;">Reset Password</a>
          </p>
          <p style="font-size: 13px; color: #666; margin: 0 0 8px;">Or copy and paste this link into your browser:</p>
          <p style="font-size: 13px; color: #2563eb; word-break: break-all; margin: 0 0 24px;">${resetUrl}</p>
          <p style="font-size: 13px; color: #666; margin: 24px 0 0;">
            If you didn't request a password reset, you can safely ignore this email.
          </p>
        </div>
      `;
      const text = `${greeting}\n\nReset your password:\n${resetUrl}\n\nThis link expires in 1 hour. If you didn't request this, ignore this email.`;

      const resp = await fetch(`${GATEWAY_URL}/emails`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "X-Connection-Api-Key": RESEND_API_KEY,
        },
        body: JSON.stringify({
          from: "Pacific Crest <hello@notify.pacificcrest.us>",
          to: [user.email],
          subject: "Reset your password",
          html,
          text,
        }),
      });

      if (!resp.ok) {
        const errBody = await resp.text();
        console.error("Resend send failed", resp.status, errBody);
        // Still return success to caller (don't leak)
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("send-password-reset error:", message);
    // Return 200 anyway to avoid leaking
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
