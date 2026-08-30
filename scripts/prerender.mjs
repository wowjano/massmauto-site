/**
 * Post-build prerenderer for the local landing pages.
 *
 * Why this exists
 * ---------------
 * This site is a client-rendered React SPA. Every route is served the same
 * near-empty index.html, and the actual words only appear after the browser
 * downloads and runs the JavaScript bundle. Google can execute JavaScript, but
 * it does so on a slower second pass and with no guarantee — which is a bad bet
 * for the pages whose entire job is to rank for "used cars in <town>".
 *
 * So after `vite build` produces dist/, this script writes a real static HTML
 * file for each town at dist/<slug>/index.html, containing the finished copy,
 * the correct <title>/description/canonical, and the JSON-LD. Netlify serves a
 * matching static file before it consults the SPA redirect in public/_redirects,
 * so those URLs now return complete HTML on the first request.
 *
 * React still takes over on load — it clears #root and renders the normal
 * interactive page. The prerendered markup mirrors what CityPage renders, so
 * there is no visible swap.
 *
 * Everything else (the homepage, inventory pages) is deliberately left alone:
 * those are driven by live Supabase data, they are already indexed, and
 * prerendering them would add risk for very little gain.
 */
import fs from "fs";
import path from "path";
import { CITIES, DEALER } from "../src/content/cities.js";

const DIST = "dist";
const SITE = "https://massmauto.com";
const SHELL = path.join(DIST, "index.html");

/** Escape text destined for HTML body/attribute content. */
function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Build the static markup that goes inside #root for one town. */
function bodyFor(city, url) {
  const highlights = city.highlights.map((h) => `<li>${esc(h)}</li>`).join("");
  const faqs = city.faqs
    .map((f) => `<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`)
    .join("");
  const others = CITIES.filter((c) => c.slug !== city.slug)
    .map((c) => `<li><a href="${SITE}/${c.slug}">Used cars near ${esc(c.city)}, ${esc(c.region)}</a></li>`)
    .join("");

  return `
      <header>
        <a href="${SITE}/"><strong>Mass Market Auto Sales</strong></a>
        <p>${esc(DEALER.street)}, ${esc(DEALER.city)}, ${esc(DEALER.region)} ${esc(DEALER.postalCode)}
           &middot; <a href="${DEALER.phoneHref}">${esc(DEALER.phoneDisplay)}</a></p>
      </header>
      <main>
        <nav><a href="${SITE}/">Home</a> &rsaquo; ${esc(city.city)}</nav>
        <h1>${esc(city.h1)}</h1>
        <p>${esc(city.intro)}</p>
        <p><a href="${SITE}/">Browse current inventory</a> &middot; <a href="${SITE}/apply">Get pre-approved</a></p>
        <h2>Why buy from us</h2>
        <ul>${highlights}</ul>
        <h2>Getting here from ${esc(city.city)}</h2>
        <p>${esc(city.directions)}</p>
        <address>
          ${esc(DEALER.street)}<br />
          ${esc(DEALER.city)}, ${esc(DEALER.region)} ${esc(DEALER.postalCode)}<br />
          <a href="${DEALER.phoneHref}">${esc(DEALER.phoneDisplay)}</a>
        </address>
        <h2>Common questions</h2>
        ${faqs}
        <h2>We also serve</h2>
        <ul>${others}</ul>
      </main>`;
}

/** JSON-LD for one town: breadcrumb trail plus the FAQ block. */
function jsonLdFor(city, url) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
          { "@type": "ListItem", position: 2, name: city.h1, item: url },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: city.faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };
}

function main() {
  if (!fs.existsSync(SHELL)) {
    console.error(`[prerender] ${SHELL} not found — run "vite build" first.`);
    process.exit(1);
  }
  const shell = fs.readFileSync(SHELL, "utf8");

  for (const city of CITIES) {
    const url = `${SITE}/${city.slug}`;
    let html = shell;

    // Per-page <title>, description, canonical and Open Graph.
    html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(city.title)}</title>`);
    html = html.replace(
      /<meta name="description" content="[^"]*"\s*\/?>/,
      `<meta name="description" content="${esc(city.metaDescription)}" />`
    );
    html = html.replace(
      /<link rel="canonical" href="[^"]*"\s*\/?>/,
      `<link rel="canonical" href="${url}" />`
    );
    html = html.replace(
      /<meta property="og:url" content="[^"]*"\s*\/?>/,
      `<meta property="og:url" content="${url}" />`
    );
    html = html.replace(
      /<meta property="og:title" content="[^"]*"\s*\/?>/,
      `<meta property="og:title" content="${esc(city.title)}" />`
    );
    html = html.replace(
      /<meta property="og:description" content="[^"]*"\s*\/?>/,
      `<meta property="og:description" content="${esc(city.metaDescription)}" />`
    );

    // Page-specific structured data, appended alongside the site-wide AutoDealer block.
    html = html.replace(
      "</head>",
      `  <script type="application/ld+json">${JSON.stringify(jsonLdFor(city, url))}</script>\n</head>`
    );

    // Real content inside #root. React replaces this on hydration.
    const injected = html.replace('<div id="root"></div>', `<div id="root">${bodyFor(city, url)}</div>`);
    if (injected === html) {
      console.warn(`[prerender] could not find <div id="root"></div> in the shell — ${city.slug} has meta only.`);
    }
    html = injected;

    const dir = path.join(DIST, city.slug);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "index.html"), html, "utf8");
    console.log(`[prerender] wrote ${city.slug}/index.html`);
  }

  console.log(`[prerender] ${CITIES.length} local landing pages prerendered.`);
}

main();
