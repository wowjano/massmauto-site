import fs from "fs";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" }); // adjust if yours is different

import { createClient } from "@supabase/supabase-js";
import { CITIES } from "../src/content/cities.js";

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

function url(loc, priority = "0.8", changefreq = "daily") {
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

(async () => {
  const urls = [url("https://massmauto.com/", "1.0")];

  // Local landing pages. Weekly rather than daily: the copy on these is stable,
  // and claiming "daily" on a page that rarely changes just trains crawlers to
  // ignore the hint.
  for (const c of CITIES) {
    urls.push(url(`https://massmauto.com/${c.slug}`, "0.9", "weekly"));
  }

  const { data, error } = await supabase
    .from("vehicles")
    .select("id, year, make, model, trim, status, updated_at, created_at");

  if (error) {
    console.error(error);
    process.exit(1);
  }

  const all = data ?? [];

  // Why we filter here instead of with .neq("status", "sold"):
  // in Postgres, NULL != 'sold' evaluates to NULL rather than true, so a .neq()
  // filter silently drops every vehicle whose status was never set. Those cars
  // show up fine on the homepage (which applies no status filter at all) but
  // vanished from the sitemap, so Google never learned their pages existed.
  const counts = {};
  for (const v of all) {
    const key = v.status == null || v.status === "" ? "(no status set)" : v.status;
    counts[key] = (counts[key] || 0) + 1;
  }
  console.log("Vehicle status breakdown:", counts);

  const listable = all.filter((v) => String(v.status ?? "").toLowerCase() !== "sold");
  console.log(`Including ${listable.length} of ${all.length} vehicles in the sitemap.`);

  for (const v of listable) {
    const slug = slugify(v);
    urls.push(url(`https://massmauto.com/inventory/${slug}`, "0.8"));
  }

  const xml = `${header}\n${urls.join("\n")}\n${footer}`;
  fs.writeFileSync("public/sitemap.xml", xml, "utf8");
  console.log(`Sitemap written with ${urls.length} URLs.`);
})();
