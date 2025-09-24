import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getIdFromSlug } from "../lib/slug";
import { supabase } from "../lib/supabaseClient";

export default function VehiclePage() {
  const { slug } = useParams();
  const id = getIdFromSlug(slug);
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);

  console.debug("[VehiclePage] slug:", slug, "→ id:", id);

  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!id) return;
      const { data, error } = await supabase
        .from("vehicles")
        .select(`id, vin, year, make, model, trim, price, miles, description, status, body_type, created_at, photos:photos(url, sort)`)
        .eq("id", id)
        .maybeSingle();
      if (!ignore) {
        if (error) console.error(error);
        const photos = (data?.photos ?? []).sort((a,b)=>a.sort-b.sort).map(p=>p.url);
        setCar(data ? { ...data, photos } : null);
        setLoading(false);
      }
    })();
    return () => (ignore = true);
  }, [id]);

  useEffect(() => {
    if (!car) return;
    const title = `${car.year} ${car.make} ${car.model}${car.trim ? " " + car.trim : ""} for Sale in New Bedford, MA | Mass Market Auto`;
    const desc = `Shop this ${car.year} ${car.make} ${car.model}${car.trim ? " " + car.trim : ""} at Mass Market Auto — serving New Bedford, Dartmouth, Fairhaven, Wareham, and Rochester, MA.`;
    document.title = title;

    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }
    meta.content = desc;

    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = `https://massmauto.com/inventory/${slug}`;
  }, [car, slug]);

  if (loading) return <div className="p-6">Loading…</div>;
  if (!car) return <div className="p-6">Vehicle not found. <Link className="underline" to="/">Back to inventory</Link></div>;

  return (
    <main className="mx-auto max-w-6xl p-4">
      <nav className="text-sm mb-3">
        <Link to="/" className="underline">Home</Link> / <span>Inventory</span>
      </nav>

      <h1 className="text-3xl font-extrabold mb-2">
        {car.year} {car.make} {car.model}{car.trim ? ` ${car.trim}` : ""} – For Sale in New Bedford, MA
      </h1>
      <p className="text-gray-700 mb-4">
        Serving New Bedford, Dartmouth, Fairhaven, Wareham, and Rochester, MA.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="aspect-video bg-gray-100 rounded-2xl overflow-hidden">
          <img
            src={car.photos?.[0] ?? "https://placehold.co/1200x675?text=No+Image"}
            alt={`${car.year} ${car.make} ${car.model} primary photo at Mass Market Auto Sales New Bedford MA`}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="grid grid-cols-3 gap-2">
          {(car.photos ?? []).slice(1, 7).map((src, i) => (
            <div key={i} className="aspect-video rounded-xl overflow-hidden bg-gray-100">
              <img
                src={src}
                alt={`${car.year} ${car.make} ${car.model} photo ${i + 2}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-2xl border">
          <div className="text-2xl font-bold">${Number(car.price ?? 0).toLocaleString()}</div>
          <div className="text-sm text-gray-600">{Number(car.miles ?? 0).toLocaleString()} miles</div>
        </div>
        <div className="p-4 rounded-2xl border">
          <div className="font-semibold">Body</div>
          <div className="text-gray-700">{car.body_type ?? "—"}</div>
        </div>
        <div className="p-4 rounded-2xl border">
          <a href="/#finance" className="inline-block px-4 py-2 rounded-xl bg-sky-500 text-white font-semibold">
            Get Financing
          </a>
        </div>
      </div>

      {car.description && (
        <div className="prose max-w-none">
          <h2 className="text-xl font-bold mb-1">Vehicle Description</h2>
          <p className="whitespace-pre-line">{car.description}</p>
        </div>
      )}
    </main>
  );
}
