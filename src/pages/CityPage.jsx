import React, { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { MapPin, Phone, Check, ChevronRight } from "lucide-react";
import { CITIES, DEALER, getCityBySlug } from "../content/cities.js";
import { COLORS, LOGO_URL, GOOGLE_MAPS_URL } from "../lib/theme.js";

const SITE = "https://massmauto.com";

/** Create or update a <meta name="..."> tag. */
function setMeta(name, content) {
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

/** Create or update the canonical link tag. */
function setCanonical(href) {
  let el = document.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.rel = "canonical";
    document.head.appendChild(el);
  }
  el.href = href;
}

/**
 * Inject a JSON-LD block that we own and can clean up on unmount, so client-side
 * navigation never leaves two competing blocks in the head.
 */
function useJsonLd(id, data) {
  // Depend on the serialized payload, not the object identity, so this effect
  // does not re-run on every single render.
  const payload = data ? JSON.stringify(data) : null;
  useEffect(() => {
    if (!payload) return undefined;
    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement("script");
      el.type = "application/ld+json";
      el.id = id;
      document.head.appendChild(el);
    }
    el.textContent = payload;
    return () => {
      const node = document.getElementById(id);
      if (node) node.remove();
    };
  }, [id, payload]);
}

export default function CityPage({ slug: slugProp }) {
  // The routes in App.jsx are static paths (e.g. "/used-cars-dartmouth"), so
  // there is no URL parameter to read. Each route passes its slug in as a prop.
  // useParams() stays as a fallback in case this is ever mounted on a dynamic
  // route like "/:citySlug".
  const params = useParams();
  const slug = slugProp || params.slug;
  const city = getCityBySlug(slug);
  const url = `${SITE}/${slug}`;

  useEffect(() => {
    if (!city) return;
    document.title = city.title;
    setMeta("description", city.metaDescription);
    setCanonical(url);
    window.scrollTo(0, 0);
  }, [city, url]);

  useJsonLd(
    "ld-city-page",
    city
      ? {
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
        }
      : null
  );

  if (!city) {
    return (
      <main className="mx-auto max-w-3xl p-8">
        <h1 className="text-2xl font-bold mb-2">Page not found</h1>
        <Link to="/" className="underline">
          Back to inventory
        </Link>
      </main>
    );
  }

  const otherCities = CITIES.filter((c) => c.slug !== city.slug);

  return (
    <div className="min-h-screen bg-white">
      {/* ---------------------------------------------------------------- */}
      {/* Header                                                            */}
      {/* ---------------------------------------------------------------- */}
      <header className="sticky top-0 z-50 backdrop-blur bg-white/80 border-b" style={{ borderColor: COLORS.mist }}>
        <div className="mx-auto max-w-4xl px-4 py-3 flex items-center gap-4">
          <Link to="/" className="flex items-center gap-3 min-w-0">
            <img
              src={LOGO_URL}
              alt="Mass Market Auto Sales logo"
              className="h-11 w-11 rounded-xl object-cover border"
              style={{ borderColor: COLORS.mist }}
            />
            <div className="min-w-0">
              <div className="text-lg font-bold truncate" style={{ color: COLORS.charcoal }}>
                Mass Market Auto Sales
              </div>
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <MapPin size={13} /> {DEALER.street}, {DEALER.city}, {DEALER.region}
              </div>
            </div>
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <Link
              to="/"
              className="hidden sm:inline-block px-3 py-2 rounded-xl text-sm font-semibold border"
              style={{ borderColor: COLORS.mist, color: COLORS.charcoal }}
            >
              View Inventory
            </Link>
            <a
              href={DEALER.phoneHref}
              className="px-3 py-2 rounded-xl text-sm font-semibold text-white flex items-center gap-2"
              style={{ backgroundColor: COLORS.charcoal }}
            >
              <Phone size={15} /> {DEALER.phoneDisplay}
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-4 flex items-center gap-1" aria-label="Breadcrumb">
          <Link to="/" className="underline">
            Home
          </Link>
          <ChevronRight size={14} />
          <span>{city.city}</span>
        </nav>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4" style={{ color: COLORS.charcoal }}>
          {city.h1}
        </h1>

        <p className="text-lg text-gray-700 leading-relaxed mb-6">{city.intro}</p>

        <div className="flex flex-wrap gap-3 mb-10">
          <Link
            to="/"
            className="px-5 py-3 rounded-xl font-semibold text-white"
            style={{ backgroundColor: COLORS.charcoal }}
          >
            Browse Current Inventory
          </Link>
          <Link
            to="/apply"
            className="px-5 py-3 rounded-xl font-semibold border"
            style={{ borderColor: COLORS.mist, color: COLORS.charcoal }}
          >
            Get Pre-Approved
          </Link>
        </div>

        {/* Highlights */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4" style={{ color: COLORS.charcoal }}>
            Why buy from us
          </h2>
          <ul className="space-y-3">
            {city.highlights.map((h) => (
              <li key={h} className="flex items-start gap-3 text-gray-700">
                <Check size={20} className="mt-0.5 shrink-0" style={{ color: COLORS.azure }} />
                <span>{h}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Directions */}
        <section className="mb-10 rounded-2xl border p-6" style={{ borderColor: COLORS.mist }}>
          <h2 className="text-2xl font-bold mb-3" style={{ color: COLORS.charcoal }}>
            Getting here from {city.city}
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">{city.directions}</p>
          <div className="text-gray-700">
            <div className="font-semibold" style={{ color: COLORS.charcoal }}>
              {DEALER.street}
            </div>
            <div>
              {DEALER.city}, {DEALER.region} {DEALER.postalCode}
            </div>
            <div className="mt-3 flex flex-wrap gap-4">
              <a href={GOOGLE_MAPS_URL} target="_blank" rel="noopener" className="underline" style={{ color: COLORS.azure }}>
                Open in Google Maps
              </a>
              <a href={DEALER.phoneHref} className="underline" style={{ color: COLORS.azure }}>
                Call {DEALER.phoneDisplay}
              </a>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4" style={{ color: COLORS.charcoal }}>
            Common questions
          </h2>
          <div className="space-y-5">
            {city.faqs.map((f) => (
              <div key={f.q}>
                <h3 className="font-semibold mb-1" style={{ color: COLORS.charcoal }}>
                  {f.q}
                </h3>
                <p className="text-gray-700 leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Nearby towns */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4" style={{ color: COLORS.charcoal }}>
            We also serve
          </h2>
          <div className="flex flex-wrap gap-3">
            {otherCities.map((c) => (
              <Link
                key={c.slug}
                to={`/${c.slug}`}
                className="px-4 py-2 rounded-xl border text-sm font-medium"
                style={{ borderColor: COLORS.mist, color: COLORS.charcoal }}
              >
                {c.city}, {c.region}
              </Link>
            ))}
          </div>
        </section>
      </main>

      {/* ---------------------------------------------------------------- */}
      {/* Footer                                                            */}
      {/* ---------------------------------------------------------------- */}
      <footer className="border-t mt-6" style={{ borderColor: COLORS.mist }}>
        <div className="mx-auto max-w-4xl px-4 py-8 text-sm text-gray-600 flex flex-wrap gap-6 justify-between">
          <div>
            <div className="font-bold mb-1" style={{ color: COLORS.charcoal }}>
              Mass Market Auto Sales
            </div>
            <div>{DEALER.street}</div>
            <div>
              {DEALER.city}, {DEALER.region} {DEALER.postalCode}
            </div>
          </div>
          <div>
            <div className="font-semibold mb-1" style={{ color: COLORS.charcoal }}>
              Contact
            </div>
            <div>
              <a href={DEALER.phoneHref} className="underline">
                {DEALER.phoneDisplay}
              </a>
            </div>
            <div>
              <a href={`mailto:${DEALER.email}`} className="underline">
                {DEALER.email}
              </a>
            </div>
          </div>
          <div>
            <div className="font-semibold mb-1" style={{ color: COLORS.charcoal }}>
              Browse
            </div>
            <div>
              <Link to="/" className="underline">
                Inventory
              </Link>
            </div>
            <div>
              <Link to="/apply" className="underline">
                Financing
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
