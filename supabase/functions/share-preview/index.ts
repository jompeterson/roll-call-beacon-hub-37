import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Serves a small page with post-specific link-preview tags, then forwards people to the real post.
const TYPES: Record<string, { table: string; path: string; label: string }> = {
  donations: { table: "donations", path: "donations", label: "In-Kind Donation" },
  requests: { table: "requests", path: "requests", label: "Donation Request" },
  events: { table: "events", path: "events", label: "Networking Event" },
  volunteers: { table: "volunteers", path: "volunteers", label: "Volunteer Opportunity" },
  scholarships: { table: "scholarships", path: "scholarships", label: "Scholarship" },
};

const DEFAULT_APP = "https://roll-call-beacon-hub-37.lovable.app";
const ALLOWED_APP = /^https:\/\/([a-z0-9-]+\.)*lovable\.app$|^http:\/\/localhost(:\d+)?$/;
const ID_RE = /^[0-9a-f-]{36}$/i;

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const type = url.searchParams.get("type") ?? "";
  const id = url.searchParams.get("id") ?? "";
  const appParam = url.searchParams.get("app") ?? "";
  const app = ALLOWED_APP.test(appParam) ? appParam : DEFAULT_APP;
  const conf = TYPES[type];

  let title = "Roll Call";
  let description = "Roll Call – In-Kind Donations, Volunteer Opportunities, Networking Events and Scholarships.";
  let image: string | null = null;
  let target = app;

  if (conf && ID_RE.test(id)) {
    target = `${app}/${conf.path}/${id}`;
    try {
      const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
      const { data } = await supabase.from(conf.table).select("title, description, images, is_approved").eq("id", id).maybeSingle();
      if (data && data.is_approved) {
        title = `${data.title} | ${conf.label} | Roll Call`;
        if (data.description) description = String(data.description).slice(0, 200);
        if (Array.isArray(data.images) && data.images[0]) image = data.images[0];
      } else {
        title = `${conf.label} | Roll Call`;
      }
    } catch (e) {
      console.error("share-preview lookup failed", e);
    }
  }

  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:type" content="article">
<meta property="og:url" content="${esc(target)}">
<meta property="og:site_name" content="Roll Call">
${image ? `<meta property="og:image" content="${esc(image)}"><meta name="twitter:image" content="${esc(image)}">` : ""}
<meta name="twitter:card" content="${image ? "summary_large_image" : "summary"}">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta http-equiv="refresh" content="0; url=${esc(target)}">
</head><body><p><a href="${esc(target)}">Open ${esc(title)}</a></p>
<script>location.replace(${JSON.stringify(target)})</script></body></html>`;

  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=300" } });
});
