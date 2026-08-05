import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const BUCKET = "recommendation-letters";
const ALLOWED_EXT = ["pdf", "doc", "docx"];
const MAX_BYTES = 10 * 1024 * 1024;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    const sessionToken = req.headers.get("x-session-token");
    if (!sessionToken) return json({ error: "Unauthorized" }, 401);

    // Validate custom session
    const { data: sessionUser } = await supabase
      .from("users")
      .select("id, session_expires_at")
      .eq("session_token", sessionToken)
      .maybeSingle();

    if (!sessionUser || !sessionUser.session_expires_at ||
        new Date(sessionUser.session_expires_at) <= new Date()) {
      return json({ error: "Session expired" }, 401);
    }

    const body = await req.json().catch(() => ({}));
    const action = String(body.action || "");
    const studentId = String(body.studentId || "");
    if (!studentId || !/^[0-9a-f-]{36}$/i.test(studentId)) {
      return json({ error: "Invalid studentId" }, 400);
    }

    // Authorization: admin, or the graduate the letter belongs to
    const { data: isAdmin } = await supabase.rpc("user_is_admin", { _user_id: sessionUser.id });
    const isOwner = sessionUser.id === studentId;
    if (!isAdmin && !isOwner) return json({ error: "Forbidden" }, 403);

    if (action === "list") {
      const { data, error } = await supabase.storage.from(BUCKET).list(studentId, {
        sortBy: { column: "created_at", order: "desc" },
      });
      if (error) throw error;
      const files = (data || []).filter((f) => f.id);
      const letters = await Promise.all(
        files.map(async (f) => {
          const { data: signed } = await supabase.storage
            .from(BUCKET)
            .createSignedUrl(`${studentId}/${f.name}`, 60 * 60);
          return {
            name: f.name,
            createdAt: f.created_at,
            size: f.metadata?.size ?? null,
            url: signed?.signedUrl ?? null,
          };
        }),
      );
      return json({ letters });
    }

    if (action === "upload") {
      if (!isAdmin) return json({ error: "Only administrators can upload letters" }, 403);
      const filename = String(body.filename || "").trim();
      const fileBase64 = String(body.fileBase64 || "");
      const ext = filename.split(".").pop()?.toLowerCase() || "";
      if (!filename || !ALLOWED_EXT.includes(ext)) {
        return json({ error: "Only PDF, DOC, or DOCX files are allowed" }, 400);
      }
      const bytes = Uint8Array.from(atob(fileBase64), (c) => c.charCodeAt(0));
      if (bytes.byteLength === 0 || bytes.byteLength > MAX_BYTES) {
        return json({ error: "File must be between 1 byte and 10MB" }, 400);
      }
      const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `${studentId}/${Date.now()}-${safeName}`;
      const { error } = await supabase.storage.from(BUCKET).upload(path, bytes, {
        contentType: body.contentType || "application/octet-stream",
        upsert: false,
      });
      if (error) throw error;
      return json({ success: true, path });
    }

    if (action === "delete") {
      if (!isAdmin) return json({ error: "Only administrators can delete letters" }, 403);
      const name = String(body.name || "");
      if (!name || name.includes("/")) return json({ error: "Invalid file name" }, 400);
      const { error } = await supabase.storage.from(BUCKET).remove([`${studentId}/${name}`]);
      if (error) throw error;
      return json({ success: true });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (e) {
    console.error("recommendation-letters error", e);
    return json({ error: e instanceof Error ? e.message : "Unexpected error" }, 500);
  }
});
