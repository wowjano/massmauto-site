import fs from "fs";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" }); // adjust if yours is different

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("Missing Supabase env vars (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).");
  process.exit(1);
}
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function slugify(v) {
  const base = [v.year, v.make, v.model, v.trim].filter(Boolean).join(" ");
  const slug = base.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return `${slug}-${v.id}`;
}

const today = new Date().toISOString().slice(0, 10);

const header = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;
const footer = `</urlset>\n`;

function url(loc, priority = "0.8") {
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

(async () => {
  const urls = [url("https://massmauto.com/", "1.0")];

  const { data, error } = await supabase
    .from("vehicles")
    .select("id, year, make, model, trim, status, updated_at, created_at")
    .neq("status", "sold"); // include only available; remove to include sold too

  if (error) {
    console.error(error);
    process.exit(1);
  }

  for (const v of data ?? []) {
    const slug = slugify(v);
    urls.push(url(`https://massmauto.com/inventory/${slug}`, "0.8"));
  }

  const xml = `${header}\n${urls.join("\n")}\n${footer}`;
  fs.writeFileSync("public/sitemap.xml", xml, "utf8");
  console.log(`Sitemap written with ${urls.length} URLs.`);
})();
