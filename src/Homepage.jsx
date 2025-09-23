import React, { useEffect, useMemo, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone,
  MapPin,
  Filter,
  DollarSign,
  Car,
  CalendarCheck,
  Star,
  ChevronRight,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  Menu,
  X,
  Mail,
  ArrowUpDown,
  Gauge,
  Percent
} from "lucide-react";
import QuickViewIcon from "./assets/quickview.svg";
import { supabase } from "./lib/supabaseClient"; // ⬅️ your client

// Brand colors (kept)
const COLORS = {
  charcoal: "#363732",
  sky: "#53d8fb",
  azure: "#66c3ff",
  mist: "#dce1e9",
  rose: "#d4afb9",
};

const MILEAGE_STEPS = ["Any", "< 60k", "60–90k", "90–120k", "> 120k"];
const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
  { value: "miles_asc", label: "Mileage: Low → High" },
  { value: "year_desc", label: "Year: Newest" },
  { value: "year_asc", label: "Year: Oldest" },
];

// --- Price range config (add this) ---
const PRICE_MIN = 0;
const PRICE_MAX = 30000;   // bump higher later if your inventory needs it
const PRICE_STEP = 500;

const PRICE_PRESETS = [
  { label: "Under $10k", min: 0, max: 10000 },
  { label: "10–15k",     min: 10000, max: 15000 },
  { label: "15–20k",     min: 15000, max: 20000 },
  { label: "Under $20k", min: 0, max: 20000 },
];

// --- Mileage range config (new) ---
const MILES_MIN = 0;
const MILES_MAX = 250000;     // adjust if your inventory runs higher
const MILES_STEP = 5000;

const MILES_PRESETS = [
  { label: "Under 60k", min: 0,     max: 60000 },
  { label: "60–90k",    min: 60000, max: 90000 },
  { label: "90–120k",   min: 90000, max: 120000 },
  { label: "Over 120k", min: 120000, max: null },
];

function priceFilter(car, range) {
  if (!range || (range.min == null && range.max == null)) return true;
  const p = car.price ?? 0;
  if (range.min != null && p < range.min) return false;
  if (range.max != null && p > range.max) return false;
  return true;
}

function milesFilter(car, stepOrRange) {
  // Support new range object {min,max} and the old string steps for safety.
  if (stepOrRange && typeof stepOrRange === "object") {
    const { min, max } = stepOrRange;
    const m = car.miles ?? 0;
    if (min != null && m < min) return false;
    if (max != null && m > max) return false;
    return true;
  }
  const step = stepOrRange;
  if (step === "Any") return true;
  if (step === "< 60k") return car.miles < 60000;
  if (step === "60–90k") return car.miles >= 60000 && car.miles <= 90000;
  if (step === "90–120k") return car.miles > 90000 && car.miles <= 120000;
  if (step === "> 120k") return car.miles > 120000;
  return true;
}

// simple monthly estimate
function estimateMonthly(price, apr = 7.49, termMonths = 60, down = 1000) {
  const P = Math.max(price - down, 0);
  const r = apr / 100 / 12;
  const n = termMonths;
  return r === 0 ? P / n : (P * r) / (1 - Math.pow(1 + r, -n));
}

const Tag = ({ children }) => (
  <span
    className="inline-flex items-center rounded-full border px-2 py-1 text-xs mr-1 mb-1 bg-white"
    style={{ borderColor: COLORS.mist, color: COLORS.charcoal }}
  >
    {children}
  </span>
);

function Header() {
  const [open, setOpen] = useState(false);
  const PHONE = "+15083716512";
  const EMAIL = "contact@massmauto.com";

  return (
    <header
      className="sticky top-0 z-[60] relative backdrop-blur bg-white/70 border-b"
      style={{ borderColor: COLORS.mist }}
    >
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-4">
        
        {/* Left side: keep the full column for layout, but only the inner button is clickable */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Back to top"
            className="flex items-center gap-3 min-w-0 cursor-pointer bg-transparent p-0 m-0 border-0"
            style={{ WebkitAppearance: "none" }}
          >
            <img
              src="https://i.postimg.cc/YSDXdHtW/1754711420035-3d1aa64b-85bd-4e3e-affb-011778aaf3e5-3.jpg"
              alt="Mass Market Auto Sales Logo"
              className="h-12 w-12 rounded-xl object-cover border"
              style={{ borderColor: COLORS.mist }}
            />
            <div className="min-w-0">
              <div className="text-xl font-bold truncate" style={{ color: COLORS.charcoal }}>
                Mass Market Auto Sales
              </div>
              <div className="text-xs text-gray-500 flex items-center gap-2">
                <MapPin size={14} /> 20 Granfield St, New Bedford, MA
              </div>
            </div>
          </button>
        </div>

        {/* Desktop nav */}
        <nav className="hidden nav:flex items-center gap-4 text-sm">
          <a href="#inventory" className="hover:underline">Inventory</a>
          <a href="#finance" className="hover:underline">Financing</a>
          <a href="#contact" className="hover:underline">Contact</a>
          <a href="#reviews" className="hover:underline">Reviews</a>
          <a href="#about" className="hover:underline">About</a>
        </nav>

        <div className="hidden nav:flex items-center gap-2">
          <a
            href={`tel:${PHONE}`}
            className="inline-flex items-center gap-2 rounded-2xl px-4 py-2 font-medium shadow-sm"
            style={{ backgroundColor: COLORS.sky, color: "#0b2e3a" }}
          >
            <Phone size={16} /> Call / Text
          </a>
          <a
            href={`mailto:${EMAIL}`}
            className="inline-flex items-center gap-2 rounded-2xl px-4 py-2 font-medium shadow-sm border"
            style={{ borderColor: COLORS.mist, color: COLORS.charcoal }}
          >
            <Mail size={16} /> Email
          </a>
        </div>

        {/* Mobile menu button */}
        <button
          className="nav:hidden p-2 rounded-lg border"
          style={{ borderColor: COLORS.mist }}
          onClick={() => setOpen(v => !v)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile drawer (absolute dropdown under header) */}
      {open && (
        <div className="absolute inset-x-0 top-full nav:hidden z-[55]">
          <div
            className="mx-auto max-w-7xl px-4 py-3 grid gap-3 text-sm rounded-b-2xl border bg-white shadow-md"
            style={{ borderColor: COLORS.mist }}
          >
            <a href="#inventory" onClick={() => setOpen(false)} className="underline">Inventory</a>
            <a href="#finance" onClick={() => setOpen(false)} className="underline">Financing</a>
            <a href="#contact" onClick={() => setOpen(false)} className="underline">Contact</a>
            <a href="#reviews" onClick={() => setOpen(false)} className="underline">Reviews</a>
            <a href="#about" onClick={() => setOpen(false)} className="underline">About</a>

            <div className="flex gap-2 mt-1">
              <a
                href={`tel:${PHONE}`}
                className="inline-flex items-center gap-2 rounded-xl px-3 py-2 font-medium shadow-sm"
                style={{ backgroundColor: COLORS.sky, color: "#0b2e3a" }}
              >
                <Phone size={16} /> Call
              </a>
              <a
                href={`mailto:${EMAIL}`}
                className="inline-flex items-center gap-2 rounded-xl px-3 py-2 font-medium border"
                style={{ borderColor: COLORS.mist, color: COLORS.charcoal }}
              >
                <Mail size={16} /> Email
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        className="absolute inset-0"
        style={{ background: `linear-gradient(180deg, ${COLORS.azure}15, transparent 70%)` }}
      />
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex items-center justify-center gap-3 sm:gap-4 flex-nowrap text-center">
          {/* Headline */}
          <h1
            className="shrink min-w-0 text-[clamp(28px,4.2vw,44px)] font-extrabold leading-tight tracking-tight underline"
            style={{ color: COLORS.charcoal }}
          >
            Find your next car below
          </h1>

          {/* Rating pill (baseline aligned with headline) */}
          <div
            className="shrink-0 inline-flex items-center gap-2 rounded-full border px-5 py-2 text-base bg-white/90 shadow-sm self-center"
            style={{ borderColor: COLORS.mist, color: COLORS.charcoal }}
          >
            <Star size={22} className="text-yellow-500" fill="currentColor" />
            <span className="font-semibold text-base">4.9/5</span>
            <span className="hidden sm:inline text-gray-500 text-sm">customer rating</span>
          </div>
        </div>
      </div>
    </section>
  );
}

const Control = ({ label, children }) => (
  <div className="flex flex-col gap-1 shrink-0">
    <span className="text-[10px] uppercase tracking-wide text-gray-500 ml-1">
      {label}
    </span>
    {children}
  </div>
);

// helper
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

function useIsMobileDevice() {
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    const check = () =>
      setIsMobile(document.documentElement.classList.contains("mobile-device"));
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
}

// NEW PriceControl component
function PriceControl({ value, onChange }) {
  const ref = useRef(null);
  const [dragging, setDragging] = useState(null); // 'min' | 'max' | null
  const [open, setOpen] = useState(false);
  const [local, setLocal] = useState({
    min: value.min ?? PRICE_MIN,
    max: value.max ?? PRICE_MAX,
  });

  useEffect(() => {
    setLocal({
      min: value.min ?? PRICE_MIN,
      max: value.max ?? PRICE_MAX,
    });
  }, [value.min, value.max]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const apply = () => {
    const min = local.min === PRICE_MIN ? null : local.min;
    const max = local.max === PRICE_MAX ? null : local.max;
    onChange({ min, max });
    setOpen(false);
  };

  const clear = () => {
    onChange({ min: null, max: null });
    setLocal({ min: PRICE_MIN, max: PRICE_MAX });
    setOpen(false);
  };

  const label =
    value.min == null && value.max == null
      ? "Any"
      : `${value.min != null ? `$${value.min.toLocaleString()}` : "Min"} – ${value.max != null ? `$${value.max.toLocaleString()}` : "Max"}`;

  return (
    <div className="relative">
      <DollarSign
        size={16}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
      />
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="h-10 w-[180px] rounded-xl border px-3 text-sm bg-white text-left pl-9 focus:outline-none focus:ring-2"
        style={{ borderColor: COLORS.mist }}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        {label}
      </button>

      {open && (
        <div
          ref={ref}
          className="absolute z-40 mt-2 w-[320px] max-w-[calc(100vw-1rem)] rounded-2xl border bg-white p-3 shadow-lg right-0 left-auto"
          style={{ borderColor: COLORS.mist }}
        >
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] uppercase tracking-wide text-gray-500">Min</label>
              <div className="relative mt-1">
                <DollarSign
                  size={14}
                  className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  type="number"
                  min={PRICE_MIN}
                  max={local.max}
                  step={PRICE_STEP}
                  value={local.min}
                  onChange={(e) =>
                    setLocal(s => ({ ...s, min: clamp(Number(e.target.value || 0), PRICE_MIN, s.max) }))
                  }
                  className="w-full rounded-lg border px-2 py-1.5 pl-7 text-sm"
                  style={{ borderColor: COLORS.mist }}
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-wide text-gray-500">Max</label>
              <div className="relative mt-1">
                <DollarSign
                  size={14}
                  className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  type="number"
                  min={local.min}
                  max={PRICE_MAX}
                  step={PRICE_STEP}
                  value={local.max}
                  onChange={(e) =>
                    setLocal(s => ({ ...s, max: clamp(Number(e.target.value || 0), s.min, PRICE_MAX) }))
                  }
                  className="w-full rounded-lg border px-2 py-1.5 pl-7 text-sm"
                  style={{ borderColor: COLORS.mist }}
                />
              </div>
            </div>
          </div>

          <div className="mt-3 relative h-8">
            {/* gray track */}
            <div
              className="absolute left-1 right-1 top-1/2 h-1 -translate-y-1/2 rounded-full"
              style={{ backgroundColor: "#e9edf3" }}
            />
            {/* blue selected segment (PRICE constants) */}
            {(() => {
              const leftPct  = ((local.min - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;
              const rightPct = (1 - (local.max - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;
              return (
                <div
                  className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full"
                  style={{
                    left: `${Math.max(0, Math.min(100, leftPct))}%`,
                    right: `${Math.max(0, Math.min(100, rightPct))}%`,
                    backgroundColor: COLORS.azure,
                    pointerEvents: "none",
                  }}
                />
              );
            })()}

            {/* min thumb */}
            <input
              aria-label="Minimum price"
              type="range"
              min={PRICE_MIN}
              max={PRICE_MAX}
              step={PRICE_STEP}
              value={local.min}
              onChange={(e) =>
                setLocal(s => ({ ...s, min: Math.min(Number(e.target.value), s.max) }))
              }
              onMouseDown={() => setDragging('min')}
              onTouchStart={() => setDragging('min')}
              onMouseUp={() => setDragging(null)}
              onTouchEnd={() => setDragging(null)}
              className="dual-range absolute left-0 right-0 w-full appearance-none bg-transparent"
              style={{ top: "50%", transform: "translateY(-50%)", zIndex: dragging === 'min' ? 3 : 2 }}
            />

            {/* max thumb */}
            <input
              aria-label="Maximum price"
              type="range"
              min={PRICE_MIN}
              max={PRICE_MAX}
              step={PRICE_STEP}
              value={local.max}
              onChange={(e) =>
                setLocal(s => ({ ...s, max: Math.max(Number(e.target.value), s.min) }))
              }
              onMouseDown={() => setDragging('max')}
              onTouchStart={() => setDragging('max')}
              onMouseUp={() => setDragging(null)}
              onTouchEnd={() => setDragging(null)}
              className="dual-range absolute left-0 right-0 w-full appearance-none bg-transparent"
              style={{ top: "50%", transform: "translateY(-50%)", zIndex: dragging === 'max' ? 3 : 2 }}
            />
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {PRICE_PRESETS.map(p => (
              <button
                key={p.label}
                type="button"
                onClick={() => setLocal({ min: p.min, max: p.max })}
                className="rounded-full border px-3 py-1 text-xs"
                style={{ borderColor: COLORS.mist, color: COLORS.charcoal }}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between">
            <button type="button" onClick={clear} className="text-sm underline" style={{ color: COLORS.azure }}>
              Clear
            </button>
            <div className="flex gap-2">
              <button type="button" onClick={() => setOpen(false)} className="rounded-xl border px-3 py-1.5 text-sm"
                style={{ borderColor: COLORS.mist, color: COLORS.charcoal }}>
                Cancel
              </button>
              <button type="button" onClick={apply} className="rounded-xl px-3 py-1.5 text-sm font-semibold shadow-sm"
                style={{ backgroundColor: COLORS.sky, color: "#0b2e3a" }}>
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MileageControl({ value, onChange }) {
  const ref = useRef(null);
  const [dragging, setDragging] = useState(null); // 'min' | 'max' | null
  const [open, setOpen] = useState(false);
  const [local, setLocal] = useState({
    min: value?.min ?? MILES_MIN,
    max: value?.max ?? MILES_MAX,
  });

  useEffect(() => {
    setLocal({
      min: value?.min ?? MILES_MIN,
      max: value?.max ?? MILES_MAX,
    });
  }, [value?.min, value?.max]);

  // click-outside to close
  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // ESC to close
  useEffect(() => {
    function onKey(e) { if (open && e.key === "Escape") setOpen(false); }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const toLabel = (r) => {
    const rawMin = r.min == null ? MILES_MIN : r.min;
    const rawMax = r.max == null ? MILES_MAX : r.max;
    const isAny = r.min == null && r.max == null;
    if (isAny) return "Any";
    const f = (n) => `${Math.round(n/1000)}k`;
    return `${r.min != null ? f(rawMin) : "Min"} – ${r.max != null ? f(rawMax) : "Max"}`;
  };

  const apply = () => {
    const min = local.min === MILES_MIN ? null : local.min;
    const max = local.max === MILES_MAX ? null : local.max;
    onChange({ min, max });
    setOpen(false);
  };

  const clear = () => {
    onChange({ min: null, max: null });
    setLocal({ min: MILES_MIN, max: MILES_MAX });
    setOpen(false);
  };

  return (
    <div className="relative">
      <Gauge
        size={16}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
      />
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="h-10 w-[180px] rounded-xl border px-3 text-sm bg-white text-left pl-9 focus:outline-none focus:ring-2"
        style={{ borderColor: COLORS.mist }}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        {toLabel(value ?? {min:null, max:null})}
      </button>

      {open && (
        <div
          ref={ref}
          className="absolute z-40 mt-2 w-[320px] rounded-2xl border bg-white p-3 shadow-lg"
          style={{ borderColor: COLORS.mist }}
        >
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] uppercase tracking-wide text-gray-500">Min</label>
              <div className="relative mt-1">
                <Gauge
                  size={14}
                  className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  type="number"
                  min={MILES_MIN}
                  max={local.max}
                  step={MILES_STEP}
                  value={local.min}
                  onChange={(e) =>
                    setLocal(s => ({
                      ...s,
                      min: Math.max(MILES_MIN, Math.min(Number(e.target.value || 0), s.max))
                    }))
                  }
                  className="w-full rounded-lg border px-2 py-1.5 pl-7 text-sm"
                  style={{ borderColor: COLORS.mist }}
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-wide text-gray-500">Max</label>
              <div className="relative mt-1">
                <Gauge
                  size={14}
                  className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  type="number"
                  min={local.min}
                  max={MILES_MAX}
                  step={MILES_STEP}
                  value={local.max}
                  onChange={(e) =>
                    setLocal(s => ({
                      ...s,
                      max: Math.min(MILES_MAX, Math.max(Number(e.target.value || 0), s.min))
                    }))
                  }
                  className="w-full rounded-lg border px-2 py-1.5 pl-7 text-sm"
                  style={{ borderColor: COLORS.mist }}
                />
              </div>
            </div>
          </div>

          {/* slider track + dual thumbs */}
          <div className="mt-3 relative h-8">
            {/* gray track */}
            <div className="absolute left-1 right-1 top-1/2 h-1 -translate-y-1/2 rounded-full" style={{ backgroundColor: "#e9edf3" }} />
            {/* blue selected segment (MILES constants) */}
            {(() => {
              const leftPct  = ((local.min - MILES_MIN) / (MILES_MAX - MILES_MIN)) * 100;
              const rightPct = (1 - (local.max - MILES_MIN) / (MILES_MAX - MILES_MIN)) * 100;
              return (
                <div
                  className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full"
                  style={{
                    left: `${Math.max(0, Math.min(100, leftPct))}%`,
                    right: `${Math.max(0, Math.min(100, rightPct))}%`,
                    backgroundColor: COLORS.azure,
                    pointerEvents: "none",
                  }}
                />
              );
            })()}

            {/* min thumb */}
            <input
              aria-label="Minimum miles"
              type="range"
              min={MILES_MIN}
              max={MILES_MAX}
              step={MILES_STEP}
              value={local.min}
              onChange={(e) =>
                setLocal(s => ({ ...s, min: Math.min(Number(e.target.value), s.max) }))
              }
              onMouseDown={() => setDragging('min')}
              onTouchStart={() => setDragging('min')}
              onMouseUp={() => setDragging(null)}
              onTouchEnd={() => setDragging(null)}
              className="dual-range absolute left-0 right-0 w-full appearance-none bg-transparent"
              style={{ top: "50%", transform: "translateY(-50%)", zIndex: dragging === 'min' ? 3 : 2 }}
            />

            {/* max thumb */}
            <input
              aria-label="Maximum miles"
              type="range"
              min={MILES_MIN}
              max={MILES_MAX}
              step={MILES_STEP}
              value={local.max}
              onChange={(e) =>
                setLocal(s => ({ ...s, max: Math.max(Number(e.target.value), s.min) }))
              }
              onMouseDown={() => setDragging('max')}
              onTouchStart={() => setDragging('max')}
              onMouseUp={() => setDragging(null)}
              onTouchEnd={() => setDragging(null)}
              className="dual-range absolute left-0 right-0 w-full appearance-none bg-transparent"
              style={{ top: "50%", transform: "translateY(-50%)", zIndex: dragging === 'max' ? 3 : 2 }}
            />
          </div>

          {/* presets */}
          <div className="mt-3 flex flex-wrap gap-2">
            {MILES_PRESETS.map(p => (
              <button
                key={p.label}
                type="button"
                onClick={() => setLocal({ min: p.min ?? MILES_MIN, max: p.max ?? MILES_MAX })}
                className="rounded-full border px-3 py-1 text-xs"
                style={{ borderColor: COLORS.mist, color: COLORS.charcoal }}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* actions */}
          <div className="mt-3 flex items-center justify-between">
            <button type="button" onClick={clear} className="text-sm underline" style={{ color: COLORS.azure }}>
              Clear
            </button>
            <div className="flex gap-2">
              <button type="button" onClick={() => setOpen(false)} className="rounded-xl border px-3 py-1.5 text-sm"
                style={{ borderColor: COLORS.mist, color: COLORS.charcoal }}>
                Cancel
              </button>
              <button type="button" onClick={apply} className="rounded-xl px-3 py-1.5 text-sm font-semibold shadow-sm"
                style={{ backgroundColor: COLORS.sky, color: "#0b2e3a" }}>
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function useContainerWidth(threshold = 980) {
  const ref = useRef(null);
  const [condense, setCondense] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const obs = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      setCondense(w < threshold); // flip to “More filters” sooner
    });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, condense };
}

function Filters({
  makes, make, setMake,
  bodyTypes, bodyType, setBodyType,
  priceRange, setPriceRange,
  miles, setMiles,
  sort, setSort,
  total,
  onClear
}) {
  const [moreOpen, setMoreOpen] = useState(false);

  const baseSel =
    "h-10 w-[160px] sm:w-[180px] rounded-lg border px-3 text-sm bg-white focus:outline-none focus:ring-2";
  const baseBoxStyle = { borderColor: COLORS.mist };

  const Pill = ({ children }) => (
    <div
      className="inline-flex items-center gap-2 text-sm font-semibold rounded-full border px-3 py-1.5 bg-white"
      style={{ borderColor: COLORS.mist, color: COLORS.charcoal }}
    >
      {children}
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 sticky top-20 lgFilters:top-16 z-30 backdrop-blur-[2px]">
      <div
        className="
          rounded-xl border p-1.5 sm:p-2.5 lgFilters:p-3
          bg-white/80 backdrop-blur-sm
          shadow-[0_6px_24px_-8px_rgba(0,0,0,0.18),_0_2px_8px_-2px_rgba(0,0,0,0.08)]
          mx-auto w-full lgFilters:w-fit
          flex flex-wrap items-center justify-center
          gap-x-2 sm:gap-x-3 lgFilters:gap-x-4
          gap-y-1 sm:gap-y-1 lgFilters:gap-y-2
        "
        style={baseBoxStyle}
      >
        {/* LEFT: title with results + clear stacked under it */}
        <div className="flex flex-col items-center justify-center text-center">
          <div
            className="inline-flex items-center gap-2 text-sm font-semibold"
            style={{ color: COLORS.charcoal }}
          >
            <Filter size={16} /> Refine Results
          </div>

          <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
            <span>{total} results</span>
            <button
              type="button"
              onClick={onClear}
              className="underline"
              style={{ color: COLORS.azure }}
            >
              Clear
            </button>
          </div>
        </div>

        {/* WIDE: full inline controls (>= 1024px) */}
        <div className="hidden lgFilters:flex items-center gap-3">
          {/* Sort by */}
          <Control label="Sort by">
            <div className="relative">
              <ArrowUpDown
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
              />
              <ChevronRight
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-gray-500 pointer-events-none"
                aria-hidden="true"
              />
              <select
                aria-label="Sort by"
                className={`select-reset ${baseSel} pl-9 pr-8`}
                style={{ ...baseBoxStyle, WebkitAppearance: "none", appearance: "none" }}
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </Control>

          {/* Make */}
          <Control label="Make">
            <div className="relative">
              <Car
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
              />
              <ChevronRight
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-gray-500 pointer-events-none"
                aria-hidden="true"
              />
              <select
                aria-label="Filter by make"
                className={`select-reset ${baseSel} pl-9 pr-8`}
                style={{ ...baseBoxStyle, WebkitAppearance: "none", appearance: "none" }}
                value={make}
                onChange={(e) => setMake(e.target.value)}
              >
                <option value="">All Makes</option>
                {makes.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </Control>

          {/* Body Type */}
          <Control label="Body type">
            <div className="relative">
              <Car
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
              />
              <ChevronRight
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-gray-500 pointer-events-none"
                aria-hidden="true"
              />
              <select
                aria-label="Filter by body type"
                className={`select-reset ${baseSel} pl-9 pr-8`}
                style={{ ...baseBoxStyle, WebkitAppearance: "none", appearance: "none" }}
                value={bodyType}
                onChange={(e) => setBodyType(e.target.value)}
              >
                <option value="">All Body Types</option>
                <option value="SUV">SUV</option>
                <option value="Sedan">Sedan</option>
                <option value="Truck">Truck</option>
                <option value="Van">Van</option>
              </select>
            </div>
          </Control>

          {/* Mileage */}
          <Control label="Mileage">
            <MileageControl value={miles} onChange={setMiles} />
          </Control>

          {/* Price */}
          <Control label="Price range">
            <PriceControl value={priceRange} onChange={setPriceRange} />
          </Control>
        </div>

        {/* NARROW: compact row (sort + more filters) */}
        <div className="flex lgFilters:hidden items-center gap-2">
          <Pill>
            <ArrowUpDown size={16} />
            <select
              aria-label="Sort by"
              className="bg-transparent outline-none"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Pill>

          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold bg-white"
            style={{ borderColor: COLORS.mist, color: COLORS.charcoal }}
            aria-haspopup="dialog"
            aria-expanded={moreOpen}
          >
            <Filter size={16} />
            More filters
          </button>
        </div>
      </div>

      {/* MORE FILTERS SHEET (mobile / narrow) */}
      {moreOpen && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMoreOpen(false)} />
          <div
            className="absolute left-1/2 -translate-x-1/2 top-24 w-[min(92vw,720px)] rounded-2xl border bg-white p-4 shadow-xl"
            style={{ borderColor: COLORS.mist }}
            role="dialog"
            aria-modal="true"
            aria-label="More filters"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-base font-semibold" style={{ color: COLORS.charcoal }}>
                Filters
              </div>
              <button
                onClick={() => setMoreOpen(false)}
                className="rounded px-2 py-1 hover:bg-gray-100"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {/* Make */}
              <Control label="Make">
                <div className="relative">
                  <Car size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                  <ChevronRight size={16} className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-gray-500 pointer-events-none" />
                  <select
                    aria-label="Filter by make"
                    className={`select-reset ${baseSel} pl-9 pr-8 w-full`}
                    style={{ ...baseBoxStyle, WebkitAppearance: "none", appearance: "none" }}
                    value={make}
                    onChange={(e) => setMake(e.target.value)}
                  >
                    <option value="">All Makes</option>
                    {makes.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </Control>

              {/* Body Type */}
              <Control label="Body type">
                <div className="relative">
                  <Car size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                  <ChevronRight size={16} className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-gray-500 pointer-events-none" />
                  <select
                    aria-label="Filter by body type"
                    className={`select-reset ${baseSel} pl-9 pr-8 w-full`}
                    style={{ ...baseBoxStyle, WebkitAppearance: "none", appearance: "none" }}
                    value={bodyType}
                    onChange={(e) => setBodyType(e.target.value)}
                  >
                    <option value="">All Body Types</option>
                    <option value="SUV">SUV</option>
                    <option value="Sedan">Sedan</option>
                    <option value="Truck">Truck</option>
                    <option value="Van">Van</option>
                  </select>
                </div>
              </Control>

              {/* Mileage */}
              <Control label="Mileage">
                <MileageControl value={miles} onChange={setMiles} />
              </Control>

              {/* Price */}
              <Control label="Price range">
                <PriceControl value={priceRange} onChange={setPriceRange} />
              </Control>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={onClear}
                className="text-sm underline"
                style={{ color: COLORS.azure }}
              >
                Clear all
              </button>
              <button
                type="button"
                onClick={() => setMoreOpen(false)}
                className="rounded-xl px-4 py-2 text-sm font-semibold shadow-sm"
                style={{ backgroundColor: COLORS.sky, color: "#0b2e3a" }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function VehicleCard({ car, onOpen }) {
  const monthly = estimateMonthly(car.price);
  const notAvailable = car.status && car.status !== "available";
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="rounded-2xl overflow-hidden border bg-white shadow-sm flex flex-col"
      style={{ borderColor: COLORS.mist }}
    >
      <button onClick={onOpen} className="relative text-left group">
        <img
          src={car.img}
          alt={`${car.year} ${car.make} ${car.model}`}
          className={`h-44 xs:h-48 sm:h-56 md:h-52 lg:h-56 w-full object-cover object-center transition-transform duration-200 group-hover:scale-[1.01] ${car.status === "sold" ? "opacity-70" : ""}`}
          loading="lazy"
          decoding="async"
        />
        {/* Status / New badge */}
        {notAvailable ? (
          <div
            className="absolute top-3 left-3 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide"
            style={{ backgroundColor: car.status === "sold" ? "#fecaca" : "#fde68a", color: COLORS.charcoal }}
          >
            {car.status}
          </div>
        ) : car.isNew ? (
          <div
            className="absolute top-3 left-3 rounded-full px-3 py-1 text-xs font-medium"
            style={{ backgroundColor: "rgba(187, 247, 208, 0.7)", color: COLORS.charcoal }}
          >
            New Arrival
          </div>
        ) : null}
      </button>
      <div className="p-4 flex-1 flex flex-col">
        <div className="text-sm text-gray-500">{car.year} · {car.make}</div>
        <div className="text-lg font-semibold" style={{ color: COLORS.charcoal }}>{car.model}</div>
        <div className="mt-2 flex items-center justify-between">
          <div className="text-xl font-bold" style={{ color: COLORS.charcoal }}>${car.price.toLocaleString()}</div>
          <div className="text-xs text-gray-500">{car.miles?.toLocaleString?.() ?? car.miles} mi</div>
        </div>
        <div className="mt-2">
          {(car.features || []).map((f) => <Tag key={f}>{f}</Tag>)}
        </div>
        <div className="mt-3 text-xs text-gray-500">Est. from ${Math.round(monthly).toLocaleString()}/mo*</div>
        {/* Actions */}
        <div className="mt-4 grid grid-cols-1 gap-2">
          {/* Quick View (TOP) */}
          <button
            onClick={onOpen}
            className="action-btn action-btn--primary w-full h-12 text-base"
          >
            <img src={QuickViewIcon} alt="" className="h-5 w-5" />
            <span className="label">Quick View</span>
          </button>

          {/* Test Drive / Unavailable (BOTTOM) */}
          <button
            disabled={notAvailable}
            onClick={() => {
              if (notAvailable) return;
              // 1) Broadcast details to the lead form
              const details = {
                id: car.id,
                title: `${car.year} ${car.make} ${car.model}${car.trim ? " " + car.trim : ""}`,
                price: car.price,
                miles: car.miles
              };
              window.dispatchEvent(new CustomEvent("lead:prefill", { detail: details }));

              // 2) Smooth-scroll to the contact form
              const el = document.getElementById("contact");
              if (el) {
                el.scrollIntoView({ behavior: "smooth", block: "start" });
              } else {
                // fallback anchor if element not found
                location.hash = "#contact";
              }
            }}
            className={`action-btn action-btn--ghost w-full h-12 text-base ${notAvailable ? "is-disabled" : ""}`}
            aria-disabled={notAvailable}
            title={notAvailable ? "Unavailable for test drives" : "Book a test drive"}
          >
            <CalendarCheck size={16} />
            <span className="label">{notAvailable ? "Unavailable" : "Test Drive"}</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function InventoryGrid({ cars, onOpen }) {
  return (
    <div className="mx-auto max-w-7xl px-4">
      <div className="inventory-grid mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {cars.map((c) => <VehicleCard key={c.id} car={c} onOpen={() => onOpen(c)} />)}
      </div>
    </div>
  );
}

// Animated number for the monthly payment
const AnimatedNumber = ({ value }) => (
  <motion.span
    key={Math.round(value)}
    initial={{ opacity: 0, y: 6 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.18 }}
  >
    {Math.round(value).toLocaleString()}
  </motion.span>
);

function FinancingCTA() {
  // --- state ---
  const [price, setPrice] = useState("20000");
  const [down,  setDown]  = useState("2000");
  const [apr,   setApr]   = useState("8.49");
  const [term,  setTerm]  = useState(60);
  
  // Auto-prefill when Quick View broadcasts a price (but never while user is editing)
  useEffect(() => {
    function onSetPrice(e) {
      // if any finance input is focused, skip the prefill
      const id = document.activeElement?.id || "";
      if (["finance-price", "finance-down", "finance-apr"].includes(id)) return;

      const p = Number(e.detail?.price || 0);
      if (!Number.isFinite(p) || p <= 0) return;
      setPrice(p);
      setDown(Math.round(p * 0.10)); // default 10% down
    }
    window.addEventListener("estimator:setPrice", onSetPrice);
    return () => window.removeEventListener("estimator:setPrice", onSetPrice);
  }, []);
  const TERMS = [36, 48, 60, 72];

  // credit tiers → default APR
  const CREDIT_TIERS = [
    { id: "rebuild", labelTop: "Rebuilding", labelSub: "<640",    apr: 12.99 },
    { id: "fair",    labelTop: "Fair",       labelSub: "641–699", apr: 10.49 },
    { id: "good",    labelTop: "Good",       labelSub: "700–749", apr: 8.49 },
    { id: "excel",   labelTop: "Excellent",  labelSub: "750–850", apr: 7.49 },
  ];
  const [tier, setTier] = useState("good");
  const isMobileDevice = useIsMobileDevice();

  // derived
  const monthly = estimateMonthly(Number(price) || 0, Number(apr) || 0, Number(term) || 0, Number(down) || 0);
  const amountFinanced = Math.max((Number(price) || 0) - (Number(down) || 0), 0);
  const totalPaid      = Math.round(monthly * Number(term || 0));
  const totalInterest  = Math.max(totalPaid - amountFinanced, 0);

  // Calm, focus-aware numeric input: only commits on blur, never steals cursor while typing
  const NumInput = ({
    label,
    prefix,
    suffix,
    value,            // string or number from parent
    onChange,         // parent setter (e.g., setPrice)
    allowDecimal = false, // true for APR
    inputId
  }) => {
    const [local, setLocal] = React.useState(value?.toString?.() ?? "");
    const focusedRef = React.useRef(false);

    // Keep local in sync with parent ONLY when we're not focused (prevents cursor jumps)
    React.useEffect(() => {
      if (focusedRef.current) return;
      const next = value == null ? "" : String(value);
      if (next !== local) setLocal(next);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    const commit = () => {
      focusedRef.current = false;
      let raw = local;
      // sanitize softly on commit
      raw = allowDecimal
        ? raw.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1")
        : raw.replace(/[^0-9]/g, "");
      if (!allowDecimal) raw = raw.replace(/^0+(?=\d)/, "");
      const num = raw === "" ? "" : (allowDecimal ? parseFloat(raw) : parseInt(raw, 10));
      onChange(num === "" || Number.isNaN(num) ? "" : num);
    };

    return (
      <label className="text-sm">
        <span className="text-[11px] uppercase tracking-wide text-gray-500">{label}</span>
        <div className="relative mt-1">
          {prefix && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
              {prefix}
            </span>
          )}
          <input
          id={inputId}
          type="text"
          inputMode={allowDecimal ? "decimal" : "numeric"}
          pattern={allowDecimal ? "[0-9]*\\.?[0-9]*" : "[0-9]*"}
          value={local}
          onChange={(e) => {
            // keep only allowed chars while typing
            const val = allowDecimal
              ? e.target.value.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1")
              : e.target.value.replace(/[^0-9]/g, "");
            setLocal(val);         // ← update local buffer only (NO parent call here)
          }}
          onKeyDown={(e) => {
            const block = allowDecimal ? ["e", "E", "+", "-"] : ["e", "E", "+", "-", "."];
            if (block.includes(e.key)) e.preventDefault();
            if (e.key === "Enter") {
              e.preventDefault();
              commit();            // commit to parent
              e.currentTarget.blur(); // exit field (optional… remove if you want to stay focused)
            }
          }}
          onBlur={commit}          // commit on blur
          className={`w-full rounded-xl border px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#66c3ff]/50 ${prefix ? "pl-7" : ""} ${suffix ? "pr-10" : ""}`}
          style={{ borderColor: COLORS.mist, boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.02)" }}
        />
          {suffix && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
              {suffix}
            </span>
          )}
        </div>
      </label>
    );
  };

  const SegBtn = ({ active, children, onClick }) => (
    <button
      type="button"
      onClick={onClick}
      className={`w-full px-3 py-3 text-sm font-semibold border transition cursor-pointer ${active ? "text-white" : ""}`}
      style={{
        borderColor: COLORS.mist,
        background: active ? `linear-gradient(180deg, ${COLORS.azure}, ${COLORS.sky})` : "#fff",
        color: active ? "#0b2e3a" : COLORS.charcoal,
        transform: active ? "translateY(-1px)" : "none",
        boxShadow: active ? "0 10px 22px -12px rgba(0,0,0,.35)" : "none",
      }}
    >
      {children}
    </button>
  );

  // credit tier → sets a typical APR; APR field remains editable
  function selectTier(id) {
    setTier(id);
    const t = CREDIT_TIERS.find((x) => x.id === id);
    if (t) setApr(t.apr);
  }

  return (
    <section
      id="finance"
      className="mx-auto max-w-7xl px-4 mt-14 scroll-mt-20"
      style={{ background: `radial-gradient(1200px 420px at 50% -10%, ${COLORS.azure}22, transparent 60%)` }}
    >
      <div
        className="rounded-[26px] border overflow-hidden shadow-sm"
        style={{ borderColor: COLORS.mist, background: `linear-gradient(135deg, ${COLORS.azure}35, ${COLORS.sky}25)` }}
      >
        <div className="p-6 md:p-8">
          <h2 className="text-2xl font-bold mb-4" style={{ color: COLORS.charcoal }}>
            Fast, flexible financing
          </h2>

          {/* Estimate card */}
          <div
            className="mb-6 rounded-2xl border bg-white/70 backdrop-blur p-5 shadow-[0_14px_34px_-16px_rgba(0,0,0,0.28),_0_4px_14px_-6px_rgba(0,0,0,0.12)]"
            style={{ borderColor: COLORS.mist }}
          >
            <div className="text-sm text-gray-600">Estimated monthly payment</div>
            <div className="mt-1 text-[34px] md:text-[40px] leading-none font-extrabold" style={{ color: COLORS.charcoal }}>
              <span aria-live="polite" aria-atomic="true">
                ${<AnimatedNumber value={monthly} />}
              </span>
              <span className="text-base font-semibold text-gray-600">/mo</span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border p-3 bg-white" style={{ borderColor: COLORS.mist }}>
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-gray-500">
                  <DollarSign size={14} /> AMOUNT FINANCED
                </div>
                <div className="mt-0.5 font-semibold">${amountFinanced.toLocaleString()}</div>
              </div>

              <div className="rounded-xl border p-3 bg-white" style={{ borderColor: COLORS.mist }}>
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-gray-500">
                  <CalendarCheck size={14} /> TOTAL OF PAYMENTS
                </div>
                <div className="mt-0.5 font-semibold">${totalPaid.toLocaleString()}</div>
              </div>

              <div className="rounded-xl border p-3 bg-white" style={{ borderColor: COLORS.mist }}>
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-gray-500">
                  <Percent size={14} /> EST. INTEREST
                </div>
                <div className="mt-0.5 font-semibold">${totalInterest.toLocaleString()}</div>
              </div>
            </div>

            <div className="my-4 pb-2 border-b" style={{ borderColor: COLORS.mist }} />

            <div className="text-xs text-gray-500">
              * Estimates for illustration only. Taxes, fees, and actual lender terms may vary.
            </div>
          </div>

          {/* Inputs (row 1): price, down, APR in one row */}
          <div className="grid md:grid-cols-3 gap-3">
            <NumInput
              label="Vehicle price"
              prefix="$"
              value={price}
              onChange={setPrice}
              inputId="finance-price"
            />

            <NumInput
              label={`Down payment (${Math.round(((Number(down)||0) / (Number(price)||1)) * 100)}%)`}
              prefix="$"
              value={down}
              onChange={setDown}
              inputId="finance-down"
            />

            <NumInput
              label="APR"
              suffix="%"
              value={apr}
              onChange={setApr}
              allowDecimal
              inputId="finance-apr"
            />
          </div>

          {/* Term (row 2) */}
          <div className="mt-4 text-sm">
            <div className="text-[11px] uppercase tracking-wide text-gray-500 mb-1.5">Term</div>

            {isMobileDevice ? (
              <div className="relative">
                <select
                  className="select-reset w-full pr-8"
                  value={term}
                  onChange={(e) => setTerm(Number(e.target.value))}
                  aria-label="Select loan term"
                >
                  {TERMS.map((m) => (
                    <option key={m} value={m}>{m} months</option>
                  ))}
                </select>
                <ChevronRight
                  size={16}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-gray-500 pointer-events-none"
                  aria-hidden="true"
                />
              </div>
            ) : (
              // desktop segmented buttons stay the same…
              <div className="grid grid-cols-4 rounded-md overflow-hidden border" style={{ borderColor: COLORS.mist }}>
                {TERMS.map((m) => (
                  <SegBtn key={m} active={term === m} onClick={() => setTerm(m)}>
                    {m} mo
                  </SegBtn>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6">
            <div className="text-[11px] uppercase tracking-wide text-gray-500 mb-2">Credit score</div>

            {isMobileDevice ? (
              <div className="relative">
                <select
                  className="select-reset w-full pr-8"
                  value={tier}
                  onChange={(e) => selectTier(e.target.value)}
                  aria-label="Select credit score tier"
                >
                  {CREDIT_TIERS.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.labelTop} ({t.labelSub})
                    </option>
                  ))}
                </select>
                <ChevronRight
                  size={16}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-gray-500 pointer-events-none"
                  aria-hidden="true"
                />
              </div>
            ) : (
              // desktop segmented buttons stay the same…
              <div className="grid grid-cols-4 rounded-md overflow-hidden border" style={{ borderColor: COLORS.mist }}>
                {CREDIT_TIERS.map((t) => (
                  <SegBtn key={t.id} active={tier === t.id} onClick={() => selectTier(t.id)}>
                    <div className="leading-none">{t.labelTop}</div>
                    <div className="text-xs font-normal opacity-80 mt-1">{t.labelSub}</div>
                  </SegBtn>
                ))}
              </div>
            )}

            <div className="mt-2 text-xs text-gray-600">
              Selecting a credit tier sets a typical APR for that range — you can still adjust APR manually above.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function LeadForm() {
  const PHONE = "+15083716512";
  const EMAIL = "contact@massmauto.com";
  const [vehicle, setVehicle] = useState("");
  const [message, setMessage] = useState("");

  // Listen for prefill events from VehicleCard
  useEffect(() => {
    function onPrefill(e) {
      const v = e.detail || {};
      const title = v.title || "";
      setVehicle(title);
      const parts = [];
      if (v.price != null) parts.push(`Price: $${Number(v.price).toLocaleString()}`);
      if (v.miles != null) parts.push(`Miles: ${Number(v.miles).toLocaleString()} mi`);
      const tail = parts.length ? " · " + parts.join(" · ") : "";
      setMessage(`Hi, I'm interested in a test drive. Vehicle: ${title}${tail}`);
    }
    window.addEventListener("lead:prefill", onPrefill);
    return () => window.removeEventListener("lead:prefill", onPrefill);
  }, []);
  return (
    <section id="contact" className="mx-auto max-w-7xl px-4 mt-14 scroll-mt-28">
      <div className="rounded-3xl border p-6 md:p-8 bg-white/80 shadow-sm grid md:grid-cols-2 gap-6" style={{ borderColor: COLORS.mist }}>
        <div>
          <div className="text-2xl font-bold" style={{ color: COLORS.charcoal }}>Have a question? Book a test drive.</div>
          <p className="mt-2 text-gray-700">We’ll respond fast — usually within the hour.</p>
          <div className="mt-4 text-sm text-gray-600 flex items-center gap-2"><Phone size={16}/> <a className="underline" href={`tel:${PHONE}`}> (508) 371-6512</a></div>
          <div className="mt-1 text-sm text-gray-600 flex items-center gap-2"><Mail size={16}/> <a className="underline" href={`mailto:${EMAIL}`}>{EMAIL}</a></div>
          <div className="mt-1 text-sm text-gray-600 flex items-center gap-2"><MapPin size={16}/> 20 Granfield St, New Bedford, MA</div>
        </div>
        <form className="grid grid-cols-1 gap-3" onSubmit={(e) => e.preventDefault()}>
          <input className="rounded-xl border px-3 py-2" placeholder="Full name" style={{ borderColor: COLORS.mist }} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input className="rounded-xl border px-3 py-2" placeholder="Phone" style={{ borderColor: COLORS.mist }} />
            <input className="rounded-xl border px-3 py-2" placeholder="Email" style={{ borderColor: COLORS.mist }} />
          </div>
          <input
            className="rounded-xl border px-3 py-2"
            placeholder="Vehicle (optional): e.g., 2016 Toyota Camry"
            style={{ borderColor: COLORS.mist }}
            value={vehicle}
            onChange={(e) => setVehicle(e.target.value)}
          />
          <textarea
            className="rounded-xl border px-3 py-2"
            rows={4}
            placeholder="Message"
            style={{ borderColor: COLORS.mist }}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <div className="flex flex-wrap gap-2 items-center">
            <button type="button" className="rounded-2xl px-4 py-2 font-semibold shadow-sm" style={{ backgroundColor: COLORS.sky, color: "#0b2e3a" }}>
              Send Message
            </button>
            <a href={`tel:${PHONE}`} className="text-sm underline" style={{ color: COLORS.azure }}>Prefer to call? Tap here.</a>
            <a href={`mailto:${EMAIL}`} className="text-sm underline" style={{ color: COLORS.azure }}>Or email us.</a>
          </div>
          <p className="text-xs text-gray-500">By submitting, you agree to be contacted by Mass Market Auto Sales.</p>
        </form>
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section id="reviews" className="mx-auto max-w-7xl px-4 mt-16 scroll-mt-24">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold" style={{ color: COLORS.charcoal }}>
          What customers say
        </h2>
        <a
          href="https://www.google.com/maps/place/Mass+Market+Auto/@41.6567758,-70.9244164,17z/data=!4m8!3m7!1s0x89e4e5a170e69869:0x5d34c26675a1ce7c!8m2!3d41.6567758!4d-70.9244164!9m1!1b1!16s%2Fg%2F11ln25t63j?entry=ttu&g_ep=EgoyMDI1MDkwOS4wIKXMDSoASAFQAw%3D%3D"
          target="_blank"
          rel="noopener"
          className="text-sm underline"
          style={{ color: COLORS.azure }}
        >
          Read all reviews
        </a>
      </div>

      <div className="mt-4 grid md:grid-cols-3 gap-4">
        {/* Review 2 - Vlad Zachary */}
        <div className="rounded-2xl border p-4 bg-white/80 shadow-sm" style={{ borderColor: COLORS.mist }}>
          <div className="flex items-center gap-1 text-yellow-500">
            {Array.from({ length: 5 }).map((_, idx) => (
              <Star key={idx} size={16} fill="currentColor" />
            ))}
          </div>
          <p className="mt-2 text-gray-700 text-sm">
            “Super professional, a really great selection of cars and fast, efficient service.
            I’d recommend it to anyone looking for a good vehicle and at a fair price.”
          </p>
          <div className="mt-2 text-xs text-gray-500">— Vlad Zachary</div>
        </div>
       
        {/* Review 1 - Andres Suarez */}
        <div className="rounded-2xl border p-4 bg-white/80 shadow-sm" style={{ borderColor: COLORS.mist }}>
          <div className="flex items-center gap-1 text-yellow-500">
            {Array.from({ length: 5 }).map((_, idx) => (
              <Star key={idx} size={16} fill="currentColor" />
            ))}
          </div>
          <p className="mt-2 text-gray-700 text-sm">
            “What can I say about John and his family! Amazing people, pleasure doing business,
            will recommend to anyone. As soon as I stepped in the facility they greeted me with
            respect, showed me the car I wanted, made sure the whole process went smooth and easy.
            Will buy from them anytime!!”
          </p>
          <div className="mt-2 text-xs text-gray-500">— Andres Suarez</div>
        </div>

        {/* Review 3 - Dasan J */}
        <div className="rounded-2xl border p-4 bg-white/80 shadow-sm" style={{ borderColor: COLORS.mist }}>
          <div className="flex items-center gap-1 text-yellow-500">
            {Array.from({ length: 5 }).map((_, idx) => (
              <Star key={idx} size={16} fill="currentColor" />
            ))}
          </div>
          <p className="mt-2 text-gray-700 text-sm">
            “Was helping my buddy find a car. These guys did right by us — easy and fair.”
          </p>
          <div className="mt-2 text-xs text-gray-500">— Dasan J</div>
        </div>
      </div>
    </section>
  );
}

function AboutTeaser() {
  return (
    <section id="about" className="mx-auto max-w-7xl px-4 mt-16 grid scroll-mt-20 md:grid-cols-2 gap-6 items-center">
      <div>
        <h2 className="text-2xl font-bold" style={{ color: COLORS.charcoal }}>Family-run. Community-focused.</h2>
        <p className="mt-2 text-gray-700">
          We’re a local Massachusetts Class II dealer offering quality, inspected vehicles. Our renovated office and 3-bay shop
          mean every car gets attention before it hits the lot. Conveniently located off the highway near Market Basket — with
          access from Granfield St and Belleville Ave.
        </p>
      </div>
      <div className="rounded-2xl overflow-hidden border" style={{ borderColor: COLORS.mist }}>
        <img src="https://images.pexels.com/photos/4489717/pexels-photo-4489717.jpeg?auto=compress&cs=tinysrgb&w=1200" alt="Dealership lot" className="w-full h-64 object-cover" />
      </div>
    </section>
  );
}

function Footer() {
  const PHONE = "+15083716512";
  const EMAIL = "contact@massmauto.com";
  return (
    <footer id="footer" className="mt-20">
      <div className="mx-auto max-w-7xl px-4 py-10 rounded-t-3xl" style={{ background: COLORS.charcoal, color: "white" }}>
        <div className="grid md:grid-cols-4 gap-6">
          <div>
            <div className="font-bold text-lg">Mass Market Auto Sales</div>
            <div className="text-sm opacity-80 mt-1">Quality used cars in New Bedford, MA.</div>
            <div className="mt-3 text-sm flex items-center gap-2 opacity-90"><MapPin size={16}/> 20 Granfield St, New Bedford 02746</div>
            <div className="text-sm flex items-center gap-2 opacity-90"><Phone size={16}/> <a className="underline" href={`tel:${PHONE}`}>(508) 371-6512</a></div>
            <div className="text-sm flex items-center gap-2 opacity-90"><Mail size={16}/> <a className="underline" href={`mailto:${EMAIL}`}>{EMAIL}</a></div>
          </div>
          <div>
            <div className="font-semibold">Shop</div>
            <ul className="mt-2 space-y-2 text-sm opacity-90">
              <li><a href="#inventory" className="underline">All inventory</a></li>
              <li><a href="#finance" className="underline">Financing</a></li>
            </ul>
          </div>
          <div>
            <div className="font-semibold">Dealership</div>
            <ul className="mt-2 space-y-2 text-sm opacity-90">
              <li><a href="#about" className="underline">About us</a></li>
              <li><a href="#reviews" className="underline">Reviews</a></li>
              <li><a href="#contact" className="underline">Contact</a></li>
            </ul>
          </div>
          <div>
            <div className="font-semibold">Hours</div>
            <ul className="mt-2 space-y-1 text-sm opacity-90">
              <li>Mon–Fri: 9:00a – 6:00p</li>
              <li>Sat: 10:00a – 4:00p</li>
              <li>Sun: Closed</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 text-xs opacity-70">© {new Date().getFullYear()} Mass Market Auto Sales · Class II MA Dealer</div>
      </div>
    </footer>
  );
}

function RangeCSS() {
  return (
    <style>{`
      /* Make the input itself ignore pointer events.
         Only the thumbs will be interactive. */
      .dual-range {
        -webkit-appearance: none;
        appearance: none;
        background: transparent;
        pointer-events: none;        /* <-- add this */
        touch-action: none;          /* nicer on mobile */
      }

      /* Tracks should not receive events either (belt & suspenders) */
      .dual-range::-webkit-slider-runnable-track { pointer-events: none; }
      .dual-range::-moz-range-track { pointer-events: none; }
      .dual-range::-ms-track { pointer-events: none; }

      /* Thumbs ARE interactive */
      .dual-range::-webkit-slider-thumb {
        -webkit-appearance: none;
        height: 16px; width: 16px; border-radius: 9999px;
        background: #66c3ff; border: 2px solid #fff;
        box-shadow: 0 0 0 1px #dce1e9;
        pointer-events: auto;        /* <-- keep this */
      }
      .dual-range::-moz-range-thumb {
        height: 16px; width: 16px; border-radius: 9999px;
        background: #66c3ff; border: 2px solid #fff;
        box-shadow: 0 0 0 1px #dce1e9;
        pointer-events: auto;        /* <-- keep this */
      }
      .dual-range::-ms-thumb {
        height: 16px; width: 16px; border-radius: 9999px;
        background: #66c3ff; border: 2px solid #fff;
        box-shadow: 0 0 0 1px #dce1e9;
        pointer-events: auto;        /* <-- keep this */
      }

      /* 👇 ADD THIS: Normalize selects so Safari doesn't force native styling */
      .select-reset {
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
        background-color: #fff;      /* ensure no gray bevel */
        background-image: none;      /* hide native arrow */
        border: 1px solid #dce1e9;   /* COLORS.mist */
        height: 40px;                /* match your h-10 */
        border-radius: 12px;         /* match rounded-xl */
        padding: 0 2.25rem 0 2.25rem;/* room for left icon + right chevron */
        line-height: 1.2;            /* stabilizes Safari’s text box height */
      }
      .select-reset:focus {
        outline: none;
        box-shadow: 0 0 0 2px rgba(102,195,255,.35); /* subtle focus ring */
      }

      /* Force 2-up grid ONLY on real mobile devices we mark above */
      .mobile-device .inventory-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
      }
      
      /* Hide scrollbars for horizontal filter scroller */
      .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
      .scrollbar-none::-webkit-scrollbar { display: none; }

      /* === Inventory action buttons — BASE (applies to desktop & mobile) === */
      .action-btn{
        display:inline-flex; align-items:center; justify-content:center; gap:.5rem;
        border-radius:12px; padding:.5rem .75rem; font-weight:600;
        line-height:1; min-height:44px; width:auto;
      }
      .action-btn .label{ overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }

      .action-btn--ghost{ background:#fff; border:1px solid #dce1e9; color:#363732; }
      .action-btn--primary{ background:#53d8fb; color:#0b2e3a; border:none; }
      .action-btn.is-disabled{ opacity:.6; cursor:not-allowed; }

      @media (hover:hover){
        .action-btn--ghost:hover{ background:#f8fafc; }
        .action-btn--primary:hover{ filter:brightness(0.98); }
      }

      /* --- Inventory action buttons (MOBILE ONLY tweaks) --- */
      /* Slightly smaller on very narrow phones */
      @media (max-width: 390px){
        .mobile-device .action-btn{ font-size:13px; min-height:42px; }
      }
      /* Default mobile size (>=391px) */
      @media (min-width: 391px){
        .mobile-device .action-btn{ font-size:14px; min-height:44px; }
      }
    `}</style>
  );
}

export default function Homepage() {
  const [query, setQuery] = useState("");
  const [make, setMake] = useState("");
  const [bodyType, setBodyType] = useState("");
  const [priceRange, setPriceRange] = useState({ min: null, max: null }); // null = no limit
  const [miles, setMiles] = useState({ min: null, max: null });
  const [sort, setSort] = useState("featured");

  // ✅ Device detector hook – runs once when Homepage mounts
  useEffect(() => {
    const ua = navigator.userAgent || "";
    const isMobileUA = /Android|iPhone|iPad|iPod|iPod touch|Mobile/i.test(ua);
    const hasTouch = navigator.maxTouchPoints && navigator.maxTouchPoints > 0;
    if (isMobileUA && hasTouch) {
      document.documentElement.classList.add("mobile-device");
    } else {
      document.documentElement.classList.remove("mobile-device");
    }
  }, []);

  // LIVE INVENTORY FROM SUPABASE
  const [inventory, setInventory] = useState([]);

  // NEW: modal state
  const [active, setActive] = useState(null); // active car object (with photos)
  const [slide, setSlide] = useState(0);      // current photo index

  // Lock body scroll when modal is open (but allow scrolling *inside* the modal)
useEffect(() => {
  if (!active) return;

  const scrollY = window.scrollY;

  // freeze the body in place
  document.body.style.position = "fixed";
  document.body.style.top = `-${scrollY}px`;
  document.body.style.left = "0";
  document.body.style.right = "0";
  document.body.style.width = "100%";
  document.body.style.overflow = "hidden";

  // On iOS, block background touches but allow them inside the modal panel
  function onTouchMove(e) {
    const panel = document.querySelector('[data-modal-panel="true"]');
    if (panel && panel.contains(e.target)) {
      // touches inside the modal should scroll normally
      return;
    }
    // touches outside the panel are background → prevent
    e.preventDefault();
  }
  document.addEventListener("touchmove", onTouchMove, { passive: false });

  return () => {
    // restore scroll
    const top = document.body.style.top;
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    document.body.style.width = "";
    document.body.style.overflow = "";
    document.removeEventListener("touchmove", onTouchMove);
    window.scrollTo(0, top ? -parseInt(top, 10) : 0);
  };
}, [active]);

  // ---- Pagination ----
  const PAGE_SIZE = 8;                      // number of cars per "page"
  const [page, setPage] = useState(1);

  // Reset to first page whenever filters/search change
  useEffect(() => {
    setPage(1);
  }, [query, make, bodyType, priceRange, miles]);

  // Keyboard navigation for modal
  useEffect(() => {
    const onKey = (e) => {
      if (!active) return;
      if (e.key === "ArrowRight") nextSlide();
      if (e.key === "ArrowLeft") prevSlide();
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  useEffect(() => {
    // Title & meta description
    document.title = "Mass Market Auto Sales | Used Cars in New Bedford, MA";
    const meta = document.createElement("meta");
    meta.name = "description";
    meta.content =
      "Shop quality used cars in New Bedford, MA. Transparent pricing, financing options, and fast approvals at Mass Market Auto Sales.";
    document.head.appendChild(meta);

    // JSON-LD Business schema (email set to admin for structured data)
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "AutoDealer",
      name: "Mass Market Auto Sales",
      telephone: "+1-508-555-0137",
      email: "admin@massmauto.com",
      address: {
        "@type": "PostalAddress",
        streetAddress: "20 Granfield St",
        addressLocality: "New Bedford",
        addressRegion: "MA",
        postalCode: "02746",
        addressCountry: "US"
      },
      openingHours: ["Mo-Fr 9:00am-5:00pm", "Sa 10:00am-4:00pm"],
      image:
        "https://i.postimg.cc/YSDXdHtW/1754711420035-3d1aa64b-85bd-4e3e-affb-011778aaf3e5-3.jpg",
      url: "https://massmauto.com"
    });
    document.head.appendChild(script);

    // Fetch vehicles + photos
    let ignore = false;
    (async () => {
      const { data, error } = await supabase
        .from("vehicles")
        .select(`id, vin, year, make, model, trim, price, miles, description, status, featured, body_type, created_at, photos:photos(url, sort)`)
        .order("featured", { ascending: false })
        .order("featured_rank", { ascending: true }) 
        .order("created_at", { ascending: false });

      if (!ignore) {
        if (error) {
          console.error(error);
        } else {
          const mapped = (data ?? []).map((v) => {
            const photos = (v.photos ?? []).sort((a, b) => a.sort - b.sort).map((p) => p.url);
            const isNew =
              v.created_at &&
              (Date.now() - new Date(v.created_at).getTime()) < 7 * 24 * 60 * 60 * 1000;
            return {
              id: v.id,
              year: v.year,
              make: v.make,
              model: [v.model, v.trim].filter(Boolean).join(" "),
              price: v.price,
              miles: v.miles,
              img: photos[0] || "",
              photos, // ⬅️ important for the modal
              vin: v.vin,
              description: v.description,
              features: [], // add later if you store them in DB
              bodyType: v.body_type || null, 
              status: v.status,           // <— carry status forward
              isNew,
            };
          });
          setInventory(mapped);
        }
      }
    })();

    return () => {
      document.head.removeChild(meta);
      document.head.removeChild(script);
      ignore = true;
    };
  }, []);

  // Build the Make list from live data
  const ALL_MAKES = useMemo(
    () => [...new Set(inventory.map((c) => c.make))],
    [inventory]
  );

  const ALL_BODY_TYPES = useMemo(
    () => [...new Set(inventory.map((c) => c.bodyType).filter(Boolean))],
    [inventory]
  );

  const filtered = useMemo(() => {
    const arr = inventory.filter((c) => {
      const q = query.trim().toLowerCase();
      const base = `${c.year} ${c.make} ${c.model} ${(c.features || []).join(" ")}`.toLowerCase();
      return (
        (!q || base.includes(q)) &&
        (!make || c.make === make) &&
        (!bodyType || c.bodyType === bodyType) &&  
        priceFilter(c, priceRange) &&
        milesFilter(c, miles)
      );
    });

    // sorting
    const score = (s) => (s === "available" ? 0 : s === "pending" ? 1 : 2);
    const sorted = [...arr]
     .sort((a, b) => score(a.status) - score(b.status)) // status priority first
     .sort((a, b) => {
       switch (sort) {
        case "price_asc":  return (a.price ?? Infinity) - (b.price ?? Infinity);
        case "price_desc": return (b.price ?? -Infinity) - (a.price ?? -Infinity);
        case "miles_asc":  return (a.miles ?? Infinity) - (b.miles ?? Infinity);
        case "year_desc":  return (b.year ?? 0) - (a.year ?? 0);
        case "year_asc":   return (a.year ?? 0) - (b.year ?? 0);
        case "newest":     return (b.id ?? 0) - (a.id ?? 0);
        default:           return 0; // featured
      }
    });

    return sorted;
  }, [inventory, query, make, bodyType, priceRange, miles, sort]);

  // Cars currently visible given the page
  const visibleCars = useMemo(
    () => filtered.slice(0, page * PAGE_SIZE),
    [filtered, page]
  );

  // Modal helpers
  const openModal = (car) => {
    setActive(car);
    setSlide(0);

    // 🔔 Tell the estimator to use this car's price and a 10% default down
    if (typeof car?.price === "number" && car.price > 0) {
      window.dispatchEvent(
        new CustomEvent("estimator:setPrice", { detail: { price: car.price } })
      );
    }
  };
  const closeModal = () => {
    setActive(null);
    setSlide(0);
  };
  const nextSlide = () => {
    if (!active?.photos?.length) return;
    setSlide((i) => (i + 1) % active.photos.length);
  };
  const prevSlide = () => {
    if (!active?.photos?.length) return;
    setSlide((i) => (i - 1 + active.photos.length) % active.photos.length);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f7f9fb" }}>
      <RangeCSS />
      <Header />
      <Hero />

      <section id="inventory" className="mt-2 scroll-mt-24 sm:scroll-mt-28">
        <Filters
          makes={ALL_MAKES}
          make={make}
          setMake={setMake}
          bodyTypes={ALL_BODY_TYPES}
          bodyType={bodyType}
          setBodyType={setBodyType}
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          miles={miles}
          setMiles={setMiles}
          sort={sort}
          setSort={setSort}
          total={filtered.length}
          onClear={() => {
            setMake("");
            setBodyType("");       
            setPriceRange({ min: null, max: null });
            setMiles({ min: null, max: null });
            setSort("featured");
            setQuery("");
          }}
        />
        <InventoryGrid cars={visibleCars} onOpen={openModal} />

        {visibleCars.length < filtered.length && (
          <div className="mx-auto max-w-7xl px-4 mt-4 mb-2">
            <button
              onClick={() => setPage((p) => p + 1)}
              className="w-full sm:w-auto rounded-2xl px-5 py-2.5 font-semibold shadow-sm"
              style={{ backgroundColor: COLORS.sky, color: "#0b2e3a" }}
            >
              Load more cars
            </button>
          </div>
        )}
      </section>

      {/* MODAL GALLERY (full-height, mobile-friendly, scrollable) */}
      <AnimatePresence>
        {active && (
          <motion.div
            className="fixed inset-0 z-[100]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60" onClick={closeModal} />

            {/* Panel (fills viewport with small margins on all sides) */}
            <motion.div
              data-modal-panel="true"
              className="absolute inset-x-2 sm:inset-x-6 inset-y-2 sm:inset-y-6 rounded-2xl overflow-hidden bg-white shadow-xl flex flex-col"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.18 }}
              style={{ border: `1px solid ${COLORS.mist}` }}
              role="dialog"
              aria-modal="true"
              aria-label="Vehicle quick view"
            >
              {/* Header */}
              <div
                className="flex items-start justify-between border-b p-4 flex-none"
                style={{ borderColor: COLORS.mist }}
              >
                <div>
                  <div className="text-xl font-semibold" style={{ color: COLORS.charcoal }}>
                    {[active.year, active.make, active.model].filter(Boolean).join(" ")}
                  </div>
                  {active.vin && (
                    <div className="text-xs text-gray-500">VIN {active.vin}</div>
                  )}
                </div>
                <button
                  onClick={closeModal}
                  className="rounded p-2 hover:bg-gray-100"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Scrollable content area */}
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain" style={{ WebkitOverflowScrolling: "touch" }}>
                <div className="grid gap-4 p-4 lg:grid-cols-5">
                  {/* Gallery */}
                  <div className="lg:col-span-3">
                    <div
                      className="relative h-[50vh] sm:h-[60vh] overflow-hidden rounded-xl"
                      style={{ background: "#0a0a0a" }}
                    >
                      <AnimatePresence mode="wait">
                        <motion.img
                          key={active.photos?.[slide] ?? "placeholder"}
                          src={active.photos?.[slide] ?? "https://placehold.co/1200x675?text=No+Image"}
                          alt="Vehicle"
                          className="absolute inset-0 m-auto max-h-full max-w-full object-contain"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          draggable={false}
                        />
                      </AnimatePresence>

                      {/* Controls */}
                      <button
                        onClick={prevSlide}
                        className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full px-3 py-2 shadow"
                        style={{ backgroundColor: "#fff", color: COLORS.charcoal }}
                        aria-label="Previous photo"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={nextSlide}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full px-3 py-2 shadow"
                        style={{ backgroundColor: "#fff", color: COLORS.charcoal }}
                        aria-label="Next photo"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>

                      {/* Dots */}
                      {active?.photos?.length > 1 && (
                        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1">
                          {active.photos.map((_, i) => (
                            <button
                              key={i}
                              onClick={() => setSlide(i)}
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: i === slide ? "#fff" : "rgba(255,255,255,0.6)" }}
                              aria-label={`Go to slide ${i + 1}`}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Thumbnails */}
                    {active?.photos?.length > 1 && (
                      <div className="mt-3 grid grid-cols-5 gap-2">
                        {active.photos.slice(0, 10).map((src, i) => (
                          <button
                            key={i}
                            onClick={() => setSlide(i)}
                            className="overflow-hidden rounded-lg border"
                            style={{
                              borderColor: i === slide ? COLORS.charcoal : COLORS.mist,
                              boxShadow: i === slide ? `0 0 0 2px ${COLORS.charcoal}` : "none",
                              aspectRatio: "4 / 3",
                              background: "#0a0a0a",
                            }}
                            aria-label={`Open photo ${i + 1}`}
                          >
                            <img src={src} alt="thumb" className="h-full w-full object-contain" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="lg:col-span-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {typeof active.price === "number" && (
                        <div className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm font-medium">
                          <DollarSign className="h-4 w-4" />{" "}
                          {active.price.toLocaleString("en-US", {
                            style: "currency",
                            currency: "USD",
                            maximumFractionDigits: 0,
                          })}
                        </div>
                      )}
                      {typeof active.miles === "number" && (
                        <div
                          className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm"
                          style={{ borderColor: COLORS.mist }}
                        >
                          <Car className="h-4 w-4" /> {active.miles.toLocaleString()} mi
                        </div>
                      )}
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                      {row("Year", active.year, COLORS)}
                      {row("Make", active.make, COLORS)}
                      {row("Model", active.model, COLORS)}
                      {row("VIN", active.vin, COLORS)}
                    </div>

                    <div className="mt-5">
                      <button
                        type="button"
                        onClick={() => {
                          // 1) Send vehicle details to the contact form
                          const details = {
                            id: active.id,
                            title: `${active.year} ${active.make} ${active.model}${active.trim ? " " + active.trim : ""}`,
                            price: active.price,
                            miles: active.miles,
                          };
                          window.dispatchEvent(new CustomEvent("lead:prefill", { detail: details }));

                          // 2) Close the modal
                          closeModal();

                          // 3) Smooth-scroll to the contact section
                          setTimeout(() => {
                            const el = document.getElementById("contact");
                            if (el) {
                              el.scrollIntoView({ behavior: "smooth", block: "start" });
                            } else {
                              location.hash = "#contact";
                            }
                          }, 50);
                        }}
                        className="inline-flex w-full items-center justify-center rounded-xl px-4 py-2 font-semibold"
                        style={{ backgroundColor: COLORS.sky, color: "#0b2e3a" }}
                      >
                        Ask About This Car
                      </button>
                    </div>

                    {active?.description && (
                      <div className="mt-5 text-sm text-gray-600">{active.description}</div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <FinancingCTA />
      <LeadForm />
      <Testimonials />
      <AboutTeaser />
      <Footer />
    </div>
  );
}

function row(label, value, COLORS) {
  if (!value) return null;
  return (
    <div className="rounded-xl border p-3" style={{ borderColor: COLORS.mist }}>
      <div className="text-[11px] uppercase tracking-wide text-gray-500">{label}</div>
      <div className="mt-0.5 text-sm font-medium" style={{ color: COLORS.charcoal }}>{value}</div>
    </div>
  );
}
