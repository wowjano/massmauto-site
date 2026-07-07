# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Vite dev server (HMR)
npm run build    # prebuild (regenerates sitemap) then vite build → dist/
npm run lint     # ESLint over the repo
npm run preview  # serve the production build locally
```

There is no test runner configured. `npm run build` runs `scripts/build-sitemap.mjs` first via the `prebuild` hook, which queries Supabase, so `.env.local` must be present for a build to succeed.

## Environment

`.env.local` (gitignored) must define `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. These are read both by the browser client ([src/lib/supabaseClient.js](src/lib/supabaseClient.js), via `import.meta.env`) and by the sitemap script ([scripts/build-sitemap.mjs](scripts/build-sitemap.mjs), via `dotenv` + `process.env`).

## Architecture

Single-page marketing + inventory site for a used-car dealership (Mass Market Auto Sales, massmauto.com). Stack: **React 19 + Vite + Tailwind + react-router-dom v7**, plain `.jsx` (no TypeScript). Data and auth come from **Supabase**; the site is deployed on **Netlify**.

### Routing
[src/App.jsx](src/App.jsx) defines all routes: `/` (Homepage), `/inventory/:slug` (VehiclePage), `/admin` (Admin), `/apply` (FinancingApply). Routing is client-side; Netlify's [public/_redirects](public/_redirects) rewrites all paths to `index.html` (SPA fallback) and canonicalizes `www.` → apex.

### Data model (Supabase)
Two main tables, joined in queries as `photos:photos(...)`:
- **`vehicles`** — `id, vin, year, make, model, trim, price, miles, description, status, featured, featured_rank, body_type, created_at`. `status` of `"sold"` is excluded from the sitemap. Homepage ordering is `featured desc, featured_rank asc, created_at desc`.
- **`photos`** — `vehicle_id, url, sort`. Sorted client-side by `sort`; first photo is the card/hero image.

Images live in the Supabase **Storage bucket `vehicle-images`**; the admin uploads there and stores the resulting public URL in `photos.url`.

### Vehicle slugs
[src/lib/slug.js](src/lib/slug.js) builds URLs as `{year-make-model}-{id}` and `getIdFromSlug` parses the trailing UUID (or number) back out — so slug text is cosmetic and the ID is the source of truth. Note the sitemap script has its own copy of the slugify logic that also includes `trim`; keep the two in sync if the slug format changes.

### Admin
[src/admin/Admin.jsx](src/admin/Admin.jsx) is gated by Supabase Auth (`signInWithPassword`). It performs full CRUD on `vehicles`, uploads photos to storage + inserts `photos` rows, reorders photos by updating `sort`, and manages the homepage "featured" set (`featured` boolean + `featured_rank`). All writes go directly through the anon client, so **Supabase Row Level Security policies are what actually enforce access** — there is no server-side API layer.

### Lead capture (Netlify Forms)
Two forms — `test-drive` (in [src/Homepage.jsx](src/Homepage.jsx)) and `financing-application` (in [src/FinancingApply.jsx](src/FinancingApply.jsx)) — submit to **Netlify Forms**, not Supabase. Because forms are React-rendered, Netlify can't detect them at build time from the JSX; each has a **hidden static duplicate in [index.html](index.html)** (`data-netlify="true"`) so the Netlify build registers it. Submission is a `fetch("/", { method: "POST", "application/x-www-form-urlencoded" })` with a `form-name` field matching the declared form. SSN is deliberately **not** collected here — the financing flow hands off to a separate secure credit application after submit.

### SEO
Canonical `<title>`, Open Graph/Twitter meta, and JSON-LD structured data live in [index.html](index.html) (not injected at runtime, to avoid duplicates during client nav). `scripts/build-sitemap.mjs` regenerates `public/sitemap.xml` from live inventory on every build.

### Homepage specifics
[src/Homepage.jsx](src/Homepage.jsx) is a large single file (~2400 lines) containing the header, hero, filters (price/mileage range controls with custom logic), inventory grid, financing CTA/calculator, and lead form as local components. Financing estimates use `estimateMonthly()` (default 7.49% APR, 60 months, $1000 down). Tailwind config ([tailwind.config.js](tailwind.config.js)) adds custom breakpoints `lgFilters` (1024px, inline filters) and `nav` (1100px, hamburger switch).

## Business & Project Background

**Mass Market Auto Sales** — used car dealership in New Bedford, MA (also serving Dartmouth, Fairhaven, Wareham, Marion, Rochester).

- **Address:** 20 Granfield St, New Bedford, MA 02746 (verified in [src/Homepage.jsx](src/Homepage.jsx) footer/header).
- **Phone:** (508) 371-6512 — `tel:+15083716512` (verified, used consistently across Header/LeadForm/Footer).
- **Contact email:** contact@massmauto.com (verified across index.html JSON-LD and multiple components).
- **Business Gmail:** massmarketautogroup@gmail.com. **Admin login email:** admin@massmauto.com.
- **Brand colors** — `COLORS` const in [src/Homepage.jsx](src/Homepage.jsx): `charcoal #363732` (primary, also the `theme-color` meta), `sky #53d8fb`, `azure #66c3ff`, `mist #dce1e9`, `rose #d4afb9`. Font: Inter.
- **Domain history:** project/package name `massmarketautosales` throughout; an earlier domain `massmarketautogroup.com` was used before the site settled on the current production domain **massmauto.com** (confirmed live in [scripts/build-sitemap.mjs](scripts/build-sitemap.mjs) and [public/_redirects](public/_redirects)).

### Deployment & non-code workflow
- Deployed on **Netlify** via GitHub continuous deployment (push to `main` → auto build/deploy). DNS/registrar: Zoho Domains. SSL via Let's Encrypt.
- The site owner is a **non-coder** — local testing is done via `npm run dev`, and layout/UI issues are typically diagnosed from **screenshots** rather than by reading code. Favor visual, plain-language explanations and screenshots/step-by-step verification over code-first explanations when working with them.
- Netlify Forms requires the hidden static form mirrors in [index.html](index.html) to stay in sync with the live JSX forms (`test-drive`, `financing-application`) — see the Lead capture section above.

### DealerCenter (external DMS) integration — status
The dealership's inventory system of record is **DealerCenter**, separate from this repo/Supabase. An inventory sync was explored (FTP/SFTP feed export from DealerCenter — only `AccountID`/`StockNumber` are required fields, everything else optional) with a planned custom "middle layer" script to map the feed into Supabase. **This was still in the planning stage as of the last project review — not confirmed as built.** Known open risk: the feed spec has no clear field for sold/pending status. Separately, DealerCenter's **Credit App URL Generator** (Standalone link) is used as the destination for the `/apply` hand-off where the customer enters their SSN (see Lead capture section above) — this part of the integration is live.

### SEO/analytics stack (beyond the sitemap script)
Google Analytics 4, Google Search Console, and Google Tag Manager are wired up (GTM snippet in [index.html](index.html)). Google Business Profile reviews are pulled into the homepage; local "near me" map-pack SEO is an active, ongoing focus.

### Open items (unconfirmed / worth revisiting)
- "New Arrival" badge auto-expiry (intended: 1 week) — unclear if implemented or left manual; check `isNew` logic in [src/Homepage.jsx](src/Homepage.jsx) (currently computed as `created_at` within 7 days, so this appears done).
- Inventory search/filter by year range or body type beyond what's in `Filters()` — was previously an open ask.
- DealerCenter FTP/SFTP sync script — confirm whether this was ever built; not present in this repo as of this writing.
