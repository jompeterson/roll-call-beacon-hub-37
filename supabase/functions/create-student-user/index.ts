// Admin-only: create a B2S Graduate (student) user with full profile data,
// then email them a link to set their password and sign in.
import { createClient } from "npm:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-session-token",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/resend";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
const nullable = (v: unknown) => {
  const s = str(v);
  return s === "" ? null : s;
};
const num = (v: unknown) => {
  const n = typeof v === "number" ? v : parseFloat(str(v));
  return Number.isFinite(n) ? n : null;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    const sessionToken = req.headers.get("x-session-token");
    if (!sessionToken) return json({ error: "Unauthorized" }, 401);

    const { data: sessionUser } = await supabase
      .from("users")
      .select("id, session_expires_at")
      .eq("session_token", sessionToken)
      .maybeSingle();

    if (
      !sessionUser || !sessionUser.session_expires_at ||
      new Date(sessionUser.session_expires_at) <= new Date()
    ) {
      return json({ error: "Session expired" }, 401);
    }

    const { data: isAdmin } = await supabase.rpc("user_is_admin", {
      _user_id: sessionUser.id,
    });
    if (!isAdmin) return json({ error: "Forbidden" }, 403);

    const body = await req.json().catch(() => ({}));

    const email = str(body.email).toLowerCase();
    const firstName = str(body.firstName);
    const lastName = str(body.lastName);
    const phone = str(body.phone);
    const address = str(body.address);

    if (!email || !email.includes("@")) return json({ error: "A valid email is required" }, 400);
    if (!firstName || !lastName) return json({ error: "First and last name are required" }, 400);
    if (!phone) return json({ error: "Phone number is required" }, 400);
    if (!address) return json({ error: "Address is required" }, 400);

    // Reject duplicates (case-insensitive)
    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .ilike("email", email)
      .maybeSingle();
    if (existing) return json({ error: "A user with that email already exists" }, 409);

    // Resolve role: explicit roleId from the admin, otherwise default to B2S Graduate
    const requestedRoleId = nullable(body.roleId);
    const roleQuery = supabase.from("user_roles").select("id, name");
    const { data: role, error: roleErr } = requestedRoleId
      ? await roleQuery.eq("id", requestedRoleId).maybeSingle()
      : await roleQuery.eq("name", "student").maybeSingle();
    if (roleErr || !role) return json({ error: "Selected role not found" }, 500);
    const isStudentRole = role.name === "student";

    // Placeholder password — the user sets their own via the emailed link
    const { data: salt } = await supabase.rpc("generate_salt");
    const randomPassword = crypto.randomUUID() + crypto.randomUUID();
    const { data: passwordHash } = await supabase.rpc("hash_password", {
      password: randomPassword,
      salt,
    });
    if (!salt || !passwordHash) return json({ error: "Failed to prepare account" }, 500);

    const { data: newUser, error: userErr } = await supabase
      .from("users")
      .insert({
        email,
        password_hash: passwordHash,
        salt,
        email_verified: true,
      })
      .select("id, email")
      .single();
    if (userErr || !newUser) {
      console.error("user insert failed", userErr);
      return json({ error: "Failed to create user account" }, 500);
    }

    const userId = newUser.id as string;

    const cleanup = async () => {
      await supabase.from("users").delete().eq("id", userId);
    };

    const { error: profileErr } = await supabase.from("user_profiles").insert({
      id: userId,
      email,
      first_name: firstName,
      last_name: lastName,
      phone,
      address,
      role_id: role.id,
      organization_id: nullable(body.organizationId),
      profile_image_url: nullable(body.profileImageUrl),
      is_approved: true,
      approval_decision_made: true,
    });
    if (profileErr) {
      console.error("profile insert failed", profileErr);
      await cleanup();
      return json({ error: "Failed to create user profile" }, 500);
    }

    // Student profile (bio / skills / resume)
    const skills = Array.isArray(body.skills)
      ? body.skills.map((s: unknown) => str(s)).filter(Boolean)
      : [];
    const { error: spErr } = await supabase.from("student_profiles").insert({
      user_id: userId,
      bio: nullable(body.bio),
      skills,
      resume_url: nullable(body.resumeUrl),
      resume_filename: nullable(body.resumeFilename),
    });
    if (spErr) console.error("student_profiles insert failed", spErr);

    // Work experience
    const work = Array.isArray(body.workExperience) ? body.workExperience : [];
    const workRows = work
      .filter((w: any) => str(w?.job_title) && str(w?.company))
      .map((w: any) => ({
        user_id: userId,
        job_title: str(w.job_title),
        company: str(w.company),
        location: nullable(w.location),
        start_date: nullable(w.start_date),
        end_date: w.currently_working ? null : nullable(w.end_date),
        currently_working: !!w.currently_working,
        description: nullable(w.description),
      }));
    if (workRows.length) {
      const { error } = await supabase.from("student_work_experience").insert(workRows);
      if (error) console.error("work insert failed", error);
    }

    // Education
    const education = Array.isArray(body.education) ? body.education : [];
    const eduRows = education
      .filter((e: any) => str(e?.school))
      .map((e: any) => ({
        user_id: userId,
        school: str(e.school),
        degree: nullable(e.degree),
        field_of_study: nullable(e.field_of_study),
        start_date: nullable(e.start_date),
        end_date: e.currently_studying ? null : nullable(e.end_date),
        currently_studying: !!e.currently_studying,
        description: nullable(e.description),
      }));
    if (eduRows.length) {
      const { error } = await supabase.from("student_education").insert(eduRows);
      if (error) console.error("education insert failed", error);
    }

    // B2S courses
    const courses = Array.isArray(body.courses) ? body.courses : [];
    const courseRows = courses
      .filter((c: any) => str(c?.course_name))
      .map((c: any) => ({
        user_id: userId,
        course_name: str(c.course_name),
        completed_on: nullable(c.completed_on),
      }));
    if (courseRows.length) {
      const { error } = await supabase.from("student_courses").insert(courseRows);
      if (error) console.error("courses insert failed", error);
    }

    // Certifications
    const certs = Array.isArray(body.certifications) ? body.certifications : [];
    const certRows = certs
      .filter((c: any) => str(c?.name))
      .map((c: any) => ({
        user_id: userId,
        name: str(c.name),
        issuer: nullable(c.issuer),
        issued_on: nullable(c.issued_on),
        expires_on: nullable(c.expires_on),
      }));
    if (certRows.length) {
      const { error } = await supabase.from("student_certifications").insert(certRows);
      if (error) console.error("certifications insert failed", error);
    }

    // Optional B2S class assignment
    const classId = nullable(body.classId);
    if (classId) {
      const { error } = await supabase
        .from("b2s_class_students")
        .insert({ class_id: classId, student_user_id: userId });
      if (error) console.error("class assignment failed", error);
    }

    // Waiver (optional, admin-recorded)
    if (body.waiverAgreed) {
      await supabase
        .from("user_profiles")
        .update({
          waiver_agreed: true,
          waiver_agreed_at: new Date().toISOString(),
          waiver_signature_name: nullable(body.waiverSignatureName) ||
            `${firstName} ${lastName}`,
        })
        .eq("id", userId);
    }

    // --- Invite email: token to set password ---
    const rawBytes = new Uint8Array(32);
    crypto.getRandomValues(rawBytes);
    const rawToken = btoa(String.fromCharCode(...rawBytes))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
    const hashBuf = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(rawToken),
    );
    const tokenHash = Array.from(new Uint8Array(hashBuf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    const { error: tokenErr } = await supabase.from("password_reset_tokens").insert({
      user_id: userId,
      token_hash: tokenHash,
      expires_at: expiresAt.toISOString(),
    });
    if (tokenErr) {
      console.error("invite token insert failed", tokenErr);
      return json({ success: true, emailSent: false, userId }, 200);
    }

    const baseUrl = str(body.appUrl) || "https://rollcall.buildhopepdx.org";
    const setupUrl = `${baseUrl.replace(/\/+$/, "")}/reset-password?token=${rawToken}`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    let emailSent = false;

    if (LOVABLE_API_KEY && RESEND_API_KEY) {
      const html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #1a1a1a;">
          <p style="font-size: 16px; margin: 0 0 16px;">Hi ${firstName},</p>
          <h2 style="font-size: 20px; margin: 0 0 12px; color: #111;">Set up your HBF Roll Call account</h2>
          <p style="font-size: 15px; line-height: 1.5; margin: 0 0 24px; color: #333;">
            An account has been created for you as a B2S Graduate. Click the button below to choose your password and sign in. This link expires in 7 days.
          </p>
          <p style="margin: 0 0 24px;">
            <a href="${setupUrl}" style="display: inline-block; background: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600;">Set Your Password</a>
          </p>
          <p style="font-size: 13px; color: #666; margin: 0 0 8px;">Or copy and paste this link into your browser:</p>
          <p style="font-size: 13px; color: #2563eb; word-break: break-all; margin: 0 0 24px;">${setupUrl}</p>
          <p style="font-size: 13px; color: #666; margin: 24px 0 0;">Your sign-in email is ${email}.</p>
        </div>
      `;
      const text =
        `Hi ${firstName},\n\nAn account has been created for you on HBF Roll Call. Set your password here:\n${setupUrl}\n\nThis link expires in 7 days. Your sign-in email is ${email}.`;

      const resp = await fetch(`${GATEWAY_URL}/emails`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "X-Connection-Api-Key": RESEND_API_KEY,
        },
        body: JSON.stringify({
          from: "HBF Roll Call <hello@notify.pacificcrest.us>",
          to: [email],
          subject: "Set up your HBF Roll Call account",
          html,
          text,
        }),
      });
      emailSent = resp.ok;
      if (!resp.ok) console.error("invite email failed", resp.status, await resp.text());
    } else {
      console.error("Email not configured: missing LOVABLE_API_KEY or RESEND_API_KEY");
    }

    return json({ success: true, userId, emailSent });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("create-student-user error:", message);
    return json({ error: message }, 500);
  }
});
