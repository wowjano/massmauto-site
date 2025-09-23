import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X, DollarSign, Gauge } from "lucide-react";

/**
 * HomepageInventory (plain Tailwind + framer-motion + lucide)
 * - Responsive grid of cards
 * - Click card → Modal with gallery, thumbnails, keyboard nav
 * - Uses your existing Supabase schema: vehicles + photos(url, sort)
 *
 * Usage: <HomepageInventory vehicles={filteredVehiclesArray} />
 * Each vehicle should be: { id, year, make, model, trim, price, miles, vin, description, photos: [url, ...] }
 */

const currency = (n) =>
  typeof n === "number"
    ? n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 })
    : n;

const milesFmt = (n) => (typeof n === "number" ? `${n.toLocaleString()} mi` : n);

export default function HomepageInventory({ vehicles = [] }) {
  const [active, setActive] = useState(null); // vehicle
  const [slide, setSlide] = useState(0); // photo index

  const open = (v) => {
    setActive(v);
    setSlide(0);
  };
  const close = () => {
    setActive(null);
    setSlide(0);
  };
  const next = () => {
    if (!active?.photos?.length) return;
    setSlide((i) => (i + 1) % active.photos.length);
  };
  const prev = () => {
    if (!active?.photos?.length) return;
    setSlide((i) => (i - 1 + active.photos.length) % active.photos.length);
  };

  // keyboard navigation inside modal
  useEffect(() => {
    const onKey = (e) => {
      if (!active) return;
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  return (
    <div className="w-full">
      {/* Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {vehicles.map((v) => (
          <motion.div key={v.id} layout>
            <VehicleCard v={v} onOpen={() => open(v)} />
          </motion.div>
        ))}
        {vehicles.length === 0 && (
          <div className="col-span-full rounded-2xl border p-8 text-center text-sm text-gray-500">
            No vehicles to display.
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {active && (
          <motion.div
            className="fixed inset-0 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/60" onClick={close} />
            <motion.div
              className="relative mx-auto my-6 w-[95vw] max-w-5xl overflow-hidden rounded-2xl bg-white shadow-lg"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <div className="flex items-start justify-between border-b p-4">
                <div>
                  <div className="text-xl font-semibold">
                    {[active.year, active.make, active.model, active.trim].filter(Boolean).join(" ")}
                  </div>
                  {active.vin && (
                    <div className="text-xs text-gray-500">VIN {active.vin}</div>
                  )}
                </div>
                <button onClick={close} className="rounded p-2 hover:bg-gray-100" aria-label="Close">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid gap-4 p-4 sm:grid-cols-5">
                {/* Gallery */}
                <div className="sm:col-span-3">
                  <div className="relative aspect-video overflow-hidden rounded-xl bg-gray-100">
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={active.photos?.[slide] ?? "placeholder"}
                        src={active.photos?.[slide] ?? "https://placehold.co/1200x675?text=No+Image"}
                        alt="Vehicle"
                        className="h-full w-full object-cover"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        draggable={false}
                      />
                    </AnimatePresence>
                    {/* Controls */}
                    <button
                      onClick={prev}
                      className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow hover:bg-white"
                      aria-label="Previous photo"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={next}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow hover:bg-white"
                      aria-label="Next photo"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                    {active?.photos?.length > 1 && (
                      <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1">
                        {active.photos.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setSlide(i)}
                            className={`h-2 w-2 rounded-full ${i === slide ? "bg-white" : "bg-white/50"}`}
                            aria-label={`Go to slide ${i + 1}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  {/* Thumbs */}
                  {active?.photos?.length > 1 && (
                    <div className="mt-3 grid grid-cols-5 gap-2">
                      {active.photos.slice(0, 10).map((src, i) => (
                        <button
                          key={i}
                          onClick={() => setSlide(i)}
                          className={`aspect-video overflow-hidden rounded-lg border ${i === slide ? "ring-2 ring-black" : ""}`}
                          aria-label={`Open photo ${i + 1}`}
                        >
                          <img src={src} alt="thumb" className="h-full w-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {typeof active.price === "number" && (
                        <div className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm font-medium">
                          <DollarSign className="h-4 w-4" /> {currency(active.price)}
                        </div>
                      )}
                      {typeof active.miles === "number" && (
                        <div className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm">
                          <Gauge className="h-4 w-4" /> {milesFmt(active.miles)}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                    {row("Year", active.year)}
                    {row("Make", active.make)}
                    {row("Model", active.model)}
                    {row("Trim", active.trim)}
                    {row("VIN", active.vin)}
                  </div>

                  <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <a
                      href={`#/vehicle/${active.id}`}
                      className="inline-flex w-full items-center justify-center rounded-xl bg-black px-4 py-2 font-medium text-white"
                    >
                      View Full Details
                    </a>
                    <a
                      href={`mailto:contact@massmauto.com?subject=I'm interested in ${encodeURIComponent(
                        `${active.year ?? ""} ${active.make ?? ""} ${active.model ?? ""}`.trim()
                      )}`}
                      className="inline-flex w-full items-center justify-center rounded-xl border px-4 py-2 font-medium"
                    >
                      Ask About This Vehicle
                    </a>
                  </div>

                  {active?.description && (
                    <div className="mt-5 text-sm text-gray-600">{active.description}</div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function VehicleCard({ v, onOpen }) {
  const title = [v.year, v.make, [v.model, v.trim].filter(Boolean).join(" ")].filter(Boolean).join(" ");
  const cover = v?.photos?.[0] ?? "https://placehold.co/800x600?text=No+Image";

  return (
    <div className="group overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-lg">
      <button onClick={onOpen} className="block w-full text-left">
        <div className="relative">
          <motion.img
            src={cover}
            alt={title}
            className="aspect-[4/3] w-full object-cover"
            initial={{ scale: 1 }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
            draggable={false}
          />
          {typeof v.price === "number" && (
            <div className="absolute left-3 top-3 rounded-xl bg-white/90 px-3 py-1 text-sm font-semibold">
              {currency(v.price)}
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between">
            <h3 className="line-clamp-1 text-lg font-semibold">{title}</h3>
            {typeof v.miles === "number" && (
              <span className="text-sm text-gray-500">{milesFmt(v.miles)}</span>
            )}
          </div>
          <div className="mt-3">
            <div className="inline-flex w-full items-center justify-center rounded-xl bg-black px-3 py-2 text-sm font-semibold text-white">
              Quick View
            </div>
          </div>
        </div>
      </button>
    </div>
  );
}

function row(label, value) {
  if (!value) return null;
  return (
    <div className="rounded-xl border p-3">
      <div className="text-[11px] uppercase tracking-wide text-gray-500">{label}</div>
      <div className="mt-0.5 text-sm font-medium">{value}</div>
    </div>
  );
}
