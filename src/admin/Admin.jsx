import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

/**
 * Inventory Admin
 * - Auth login/logout
 * - Add/Edit/Delete vehicles
 * - Upload photos to bucket `vehicle-images`
 * - Drag-and-drop photo ordering (first = Main photo shown on homepage)
 * - Featured Manager: pick up to 8 and drag to rank (featured_rank)
 */

export default function Admin() {
  // auth
  const [session, setSession] = useState(null);

  // data
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);

  // edit form
  const [form, setForm] = useState({
    id: null,
    vin: "",
    year: "",
    make: "",
    model: "",
    trim: "",
    price: "",
    miles: "",
    description: "",
    status: "available",
    featured: false,
    body_type: "",
  });

  // uploads + ordering
  const [files, setFiles] = useState([]);
  const [photoOrder, setPhotoOrder] = useState([]); // array of {id,url,sort}
  const [dragIndex, setDragIndex] = useState(null);

  // === Featured Manager state ===
  const [featuredIds, setFeaturedIds] = useState([]); // ordered array of up to 8 vehicle ids
  const [search, setSearch] = useState("");
  const [dragIdxFeatured, setDragIdxFeatured] = useState(null);

  // seed featuredIds from vehicles (ordered)
  useEffect(() => {
    const ordered = [...(vehicles || [])]
      .filter((v) => v.featured)
      .sort((a, b) => (a.featured_rank ?? 999) - (b.featured_rank ?? 999));
    setFeaturedIds(ordered.map((v) => v.id));
  }, [vehicles]);

  // --- auth lifecycle ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session || null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription?.unsubscribe?.();
  }, []);

  useEffect(() => {
    if (session) refresh();
  }, [session]);

  async function signIn(e) {
    e.preventDefault();
    const email = e.target.email.value.trim();
    const password = e.target.password.value;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
  }
  async function signOut() {
    await supabase.auth.signOut();
  }

  // --- data fetch ---
  async function refresh() {
    setLoading(true);
    const { data, error } = await supabase
      .from("vehicles")
      .select(
        `
        id, vin, year, make, model, trim, price, miles, description, status, featured, featured_rank, body_type,
        photos:photos ( id, url, sort )
      `
      )
      .order("featured", { ascending: false })
      .order("featured_rank", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) alert(error.message);
    setVehicles(data || []);
    setLoading(false);
  }

  // --- helpers ---
  function clearForm() {
    setForm({
      id: null,
      vin: "",
      year: "",
      make: "",
      model: "",
      trim: "",
      price: "",
      miles: "",
      description: "",
      status: "available",
      featured: false,
      body_type: "",
    });
    setPhotoOrder([]);
    setFiles([]);
  }

  function setEditingVehicle(v) {
    setForm({
      id: v.id,
      vin: v.vin || "",
      year: v.year || "",
      make: v.make || "",
      model: v.model || "",
      trim: v.trim || "",
      price: v.price || "",
      miles: v.miles || "",
      description: v.description || "",
      status: v.status || "available",
      featured: !!v.featured,
      body_type: v.body_type || "",
    });
    setPhotoOrder([...(v.photos || [])].sort((a, b) => (a?.sort ?? 0) - (b?.sort ?? 0)));
    setFiles([]);
  }

  // --- CRUD: vehicles ---
  async function saveVehicle() {
    const payload = {
      vin: form.vin || null,
      year: Number(form.year),
      make: form.make,
      model: form.model,
      trim: form.trim || null,
      price: Number(form.price),
      miles: Number(form.miles),
      description: form.description || null,
      status: form.status,
      featured: !!form.featured,
      body_type: form.body_type || null,
    };

    let res;
    if (form.id) {
      res = await supabase.from("vehicles").update(payload).eq("id", form.id).select().single();
    } else {
      res = await supabase.from("vehicles").insert(payload).select().single();
    }
    if (res.error) return alert(res.error.message);

    const saved = res.data;
    setForm((v) => ({ ...v, id: saved.id }));
    await refresh();

    const updated = (vehicles || []).find((x) => x.id === saved.id);
    if (updated) {
      setPhotoOrder([...(updated.photos || [])].sort((a, b) => (a?.sort ?? 0) - (b?.sort ?? 0)));
    }
    alert("Saved");
  }

  async function removeVehicle(id) {
    if (!confirm("Delete vehicle?")) return;
    const { error } = await supabase.from("vehicles").delete().eq("id", id);
    if (error) return alert(error.message);
    await refresh();
    if (form.id === id) clearForm();
  }

  // === Featured Manager helpers ===
  function addFeatured(id) {
    if (featuredIds.includes(id)) return;
    if (featuredIds.length >= 8) {
      alert("You can feature up to 8 vehicles.");
      return;
    }
    setFeaturedIds([...featuredIds, id]);
  }
  function removeFeatured(id) {
    setFeaturedIds(featuredIds.filter((x) => x !== id));
  }
  function moveFeatured(from, to) {
    if (to < 0 || to >= featuredIds.length) return;
    const next = [...featuredIds];
    const [m] = next.splice(from, 1);
    next.splice(to, 0, m);
    setFeaturedIds(next);
  }

  // Persist featured order to DB (sets featured=true + featured_rank; clears others)
  async function saveFeaturedOrder() {
    const notChosenIds = (vehicles || [])
      .filter((v) => !featuredIds.includes(v.id))
      .map((v) => v.id);

    const updates = [];

    if (notChosenIds.length) {
      updates.push(
        supabase.from("vehicles").update({ featured: false, featured_rank: null }).in("id", notChosenIds)
      );
    }

    for (let i = 0; i < featuredIds.length; i++) {
      updates.push(
        supabase.from("vehicles").update({ featured: true, featured_rank: i }).eq("id", featuredIds[i])
      );
    }

    const results = await Promise.all(updates);
    const err = results.find((r) => r?.error);
    if (err?.error) {
      alert(err.error.message);
      return;
    }

    await refresh();
    alert("Featured order saved");
  }

  // --- uploads ---
  async function uploadPhotos() {
    if (!form.id) return alert("Save vehicle first");

    for (const f of files) {
      try {
        const ext = f.name.split(".").pop();
        const path = `vehicle/${form.id}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

        const { error: upErr } = await supabase.storage.from("vehicle-images").upload(path, f, { upsert: true });
        if (upErr) {
          alert(`Upload failed: ${upErr.message}`);
          continue;
        }

        const { data: pub } = supabase.storage.from("vehicle-images").getPublicUrl(path);
        const publicUrl = pub?.publicUrl || pub?.data?.publicUrl;
        if (!publicUrl) {
          alert("Could not get a public URL for the uploaded file.");
          continue;
        }

        const { error: insErr } = await supabase
          .from("photos")
          .insert({ vehicle_id: form.id, url: publicUrl, sort: 999 });
        if (insErr) {
          alert(`Saving photo record failed: ${insErr.message}`);
          continue;
        }
      } catch (e) {
        alert(`Unexpected error: ${e.message}`);
      }
    }

    setFiles([]);
    await refresh();

    const v = (
      await supabase.from("vehicles").select("id, photos:photos ( id, url, sort )").eq("id", form.id).single()
    ).data;
    setPhotoOrder([...(v?.photos || [])].sort((a, b) => (a?.sort ?? 0) - (b?.sort ?? 0)));
    alert("Upload complete");
  }

  // --- save photo order (first = main) ---
  async function savePhotoOrder() {
    if (!form.id) return alert("Save vehicle first");
    if (!photoOrder.length) return;

    const updates = photoOrder.map((p, i) => supabase.from("photos").update({ sort: i }).eq("id", p.id));
    const results = await Promise.all(updates);
    const err = results.find((r) => r?.error);
    if (err?.error) return alert(`Save order failed: ${err.error.message}`);

    await refresh();
    alert("Photo order saved");
  }

  // --- UI ---
  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-md mx-auto p-6 md:p-8 mt-16 rounded-2xl border border-gray-200 bg-white/80 backdrop-blur shadow-sm">
          <h1 className="text-2xl font-bold mb-3">Admin Login</h1>
          <form onSubmit={signIn} className="grid gap-3">
            <input
              name="email"
              placeholder="Email"
              className="border border-gray-300 rounded-lg px-3 py-2 bg-white/80 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              className="border border-gray-300 rounded-lg px-3 py-2 bg-white/80 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
            />
            <button className="rounded-lg px-4 py-2 bg-gray-900 text-white shadow hover:shadow-md transition hover:-translate-y-0.5">
              Sign in
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-6xl mx-auto p-6 md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 rounded-2xl border border-gray-200 bg-white/70 backdrop-blur px-4 py-3 shadow-sm">
          <h1 className="text-2xl font-bold">Inventory Admin</h1>
          <button
            onClick={signOut}
            className="inline-flex items-center rounded-lg bg-gray-900 text-white px-3 py-1.5 text-sm shadow hover:shadow-md transition hover:-translate-y-0.5"
          >
            Sign out
          </button>
        </div>

        {/* === FEATURED ON HOMEPAGE (max 8) === */}
        <div className="border border-gray-200 rounded-2xl p-4 md:p-5 bg-white/80 backdrop-blur shadow-sm mb-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Featured on Homepage (max 8)</h2>
            <button
              onClick={saveFeaturedOrder}
              className="rounded-lg px-3 py-1.5 bg-gray-900 text-white shadow hover:shadow-md transition hover:-translate-y-0.5"
            >
              Save Featured Order
            </button>
          </div>

          <div className="mt-3 grid md:grid-cols-2 gap-4">
            {/* LEFT: Pick from all vehicles */}
            <div>
              <input
                className="border border-gray-300 rounded-lg px-3 py-2 w-full mb-2 bg-white/80 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
                placeholder="Search year, make, model..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <div className="max-h-72 overflow-auto border border-gray-200 rounded-xl">
                {(vehicles || [])
                  .filter((v) => {
                    const q = search.trim().toLowerCase();
                    const t = `${v.year} ${v.make} ${v.model} ${v.trim || ""}`.toLowerCase();
                    return !q || t.includes(q);
                  })
                  .map((v) => {
                    const picked = featuredIds.includes(v.id);
                    return (
                      <div
                        key={v.id}
                        className="flex items-center justify-between px-3 py-2 border-b last:border-b-0 hover:bg-gray-50/80 transition"
                      >
                        <div className="text-sm">
                          {v.year} {v.make} {v.model} {v.trim || ""}
                          <span className="text-gray-500"> · ${v.price?.toLocaleString?.()}</span>
                          {v.status !== "available" && (
                            <span className="ml-2 text-[11px] text-gray-500">({v.status})</span>
                          )}
                        </div>
                        {picked ? (
                          <button onClick={() => removeFeatured(v.id)} className="text-sm underline">
                            Remove
                          </button>
                        ) : (
                          <button onClick={() => addFeatured(v.id)} className="text-sm underline">
                            Add
                          </button>
                        )}
                      </div>
                    );
                  })}
              </div>
              <p className="text-xs text-gray-500 mt-1">Add up to eight; drag to order on the right.</p>
            </div>

            {/* RIGHT: Draggable featured list (ordered) */}
            <div>
              <div className="grid gap-2">
                {featuredIds.length === 0 && (
                  <div className="text-sm text-gray-500 border border-gray-200 rounded-xl p-3 bg-white/80">
                    No featured vehicles yet.
                  </div>
                )}
                {featuredIds.map((id, idx) => {
                  const v = vehicles.find((x) => x.id === id);
                  if (!v) return null;
                  const firstPhoto = (v.photos || [])[0]?.url;
                  return (
                    <div
                      key={id}
                      className="flex items-center gap-3 border border-gray-200 rounded-xl p-2.5 bg-white/90 shadow-sm hover:shadow transition"
                      draggable
                      onDragStart={() => setDragIdxFeatured(idx)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => {
                        moveFeatured(dragIdxFeatured, idx);
                        setDragIdxFeatured(null);
                      }}
                      style={{ cursor: "grab" }}
                    >
                      <div className="text-xs w-6 h-6 grid place-items-center rounded-full bg-gray-900 text-white">
                        {idx + 1}
                      </div>
                      <img
                        src={firstPhoto}
                        alt=""
                        className="h-12 w-16 object-cover rounded-lg border border-gray-200"
                      />
                      <div className="flex-1 text-sm">
                        {v.year} {v.make} {v.model} {v.trim || ""}
                      </div>
                      <button onClick={() => removeFeatured(id)} className="text-sm underline">
                        Remove
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Main two-column layout */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* LEFT: Editor */}
          <div className="border border-gray-200 rounded-2xl p-4 md:p-5 bg-white/80 backdrop-blur shadow-sm">
            <h2 className="font-semibold mb-2">{form.id ? "Edit Vehicle" : "Add Vehicle"}</h2>

            <div className="grid grid-cols-2 gap-3">
              <input
                placeholder="VIN"
                value={form.vin}
                onChange={(e) => setForm({ ...form, vin: e.target.value })}
                className="border border-gray-300 rounded-lg px-3 py-2 col-span-2 bg-white/80 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
              />
              <input
                placeholder="Year"
                value={form.year}
                onChange={(e) => setForm({ ...form, year: e.target.value })}
                className="border border-gray-300 rounded-lg px-3 py-2 bg-white/80 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
              />
              <input
                placeholder="Make"
                value={form.make}
                onChange={(e) => setForm({ ...form, make: e.target.value })}
                className="border border-gray-300 rounded-lg px-3 py-2 bg-white/80 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
              />
              <input
                placeholder="Model"
                value={form.model}
                onChange={(e) => setForm({ ...form, model: e.target.value })}
                className="border border-gray-300 rounded-lg px-3 py-2 bg-white/80 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
              />
              <input
                placeholder="Trim"
                value={form.trim}
                onChange={(e) => setForm({ ...form, trim: e.target.value })}
                className="border border-gray-300 rounded-lg px-3 py-2 bg-white/80 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
              />
              <input
                placeholder="Price"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="border border-gray-300 rounded-lg px-3 py-2 bg-white/80 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
              />
              <input
                placeholder="Miles"
                value={form.miles}
                onChange={(e) => setForm({ ...form, miles: e.target.value })}
                className="border border-gray-300 rounded-lg px-3 py-2 bg-white/80 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
              />
              <select
                value={form.body_type}
                onChange={(e) => setForm({ ...form, body_type: e.target.value })}
                className="border border-gray-300 rounded-lg px-3 py-2 bg-white/80 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
              >
                <option value="">— Body Type —</option>
                <option value="SUV">SUV</option>
                <option value="Sedan">Sedan</option>
                <option value="Truck">Truck</option>
                <option value="Van">Van</option>
              </select>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="border border-gray-300 rounded-lg px-3 py-2 bg-white/80 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
              >
                <option value="available">available</option>
                <option value="pending">pending</option>
                <option value="sold">sold</option>
              </select>
              <label className="flex items-center gap-2 text-sm select-none">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                />
                Featured
              </label>
              <textarea
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="border border-gray-300 rounded-lg px-3 py-2 col-span-2 bg-white/80 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
                rows={4}
              />
            </div>

            <div className="mt-3 flex gap-2">
              <button className="rounded-lg px-4 py-2 bg-gray-900 text-white shadow hover:shadow-md transition hover:-translate-y-0.5" onClick={saveVehicle}>
                Save
              </button>
              {form.id && (
                <button onClick={clearForm} className="underline">
                  New
                </button>
              )}
            </div>

            {/* Photos */}
            <div className="mt-5">
              <h3 className="font-semibold mb-2">Photos</h3>

              <div className="flex items-center gap-2">
                <input type="file" multiple onChange={(e) => setFiles([...e.target.files])} />
                <button
                  onClick={uploadPhotos}
                  className="rounded-lg px-3 py-1.5 border border-gray-300 bg-white hover:bg-gray-50 shadow-sm transition"
                >
                  Upload
                </button>
                <span className="text-xs text-gray-500">Tip: upload ~1200px JPG/WEBP.</span>
              </div>

              {/* Drag-and-drop grid */}
              {photoOrder.length > 0 ? (
                <>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {photoOrder.map((p, idx) => (
                      <div
                        key={p.id}
                        className="relative border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow transition"
                        style={{ cursor: "grab" }}
                        draggable
                        onDragStart={() => setDragIndex(idx)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => {
                          if (dragIndex === null || dragIndex === idx) return;
                          const next = [...photoOrder];
                          const [moved] = next.splice(dragIndex, 1);
                          next.splice(idx, 0, moved);
                          setPhotoOrder(next);
                          setDragIndex(null);
                        }}
                      >
                        <img src={p.url} alt="" className="h-28 w-full object-cover" />
                        {idx === 0 && (
                          <div className="absolute top-1 left-1 text-[10px] px-2 py-0.5 rounded-full bg-gray-900/85 text-white shadow">
                            Main photo
                          </div>
                        )}
                        <div className="absolute bottom-1 right-1 flex gap-1">
                          {idx !== 0 && (
                            <button
                              onClick={() => {
                                const next = [...photoOrder];
                                const [moved] = next.splice(idx, 1);
                                next.unshift(moved);
                                setPhotoOrder(next);
                              }}
                              className="text-[11px] px-2 py-0.5 rounded border border-gray-300 bg-white/95 hover:bg-gray-50 shadow-sm transition"
                            >
                              Make Main
                            </button>
                          )}
                          <button
                            onClick={async () => {
                              if (!confirm("Delete this photo?")) return;
                              const { error } = await supabase.from("photos").delete().eq("id", p.id);
                              if (error) return alert(error.message);
                              setPhotoOrder(photoOrder.filter((x) => x.id !== p.id));
                              await refresh();
                            }}
                            className="text-[11px] px-2 py-0.5 rounded border border-gray-300 bg-white/95 hover:bg-gray-50 shadow-sm transition"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3">
                    <button
                      onClick={savePhotoOrder}
                      className="rounded-lg px-3 py-1.5 border border-gray-300 bg-white hover:bg-gray-50 shadow-sm transition"
                    >
                      Save Photo Order
                    </button>
                  </div>
                </>
              ) : (
                <p className="text-xs text-gray-500 mt-2">
                  No photos yet. Upload above, then drag to reorder. The first photo is the <b>Main photo</b>.
                </p>
              )}
            </div>
          </div>

          {/* RIGHT: List */}
          <div className="border border-gray-200 rounded-2xl p-4 md:p-5 bg-white/80 backdrop-blur shadow-sm">
            <h2 className="font-semibold mb-2">Vehicles ({vehicles.length})</h2>
            {loading ? (
              <div>Loading…</div>
            ) : (
              <div className="grid gap-3">
                {vehicles.map((v) => (
                  <div
                    key={v.id}
                    className="border border-gray-200 rounded-2xl p-4 bg-white/80 backdrop-blur shadow-sm hover:shadow-md transition hover:-translate-y-0.5"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-semibold">
                        {v.year} {v.make} {v.model} {v.trim || ""}
                      </div>
                      <div className="text-sm">
                        ${v.price?.toLocaleString()} · {v.miles?.toLocaleString()} mi
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      <span className="inline-flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block"></span>
                        {v.status}
                      </span>
                      {v.featured && <span> · featured</span>}
                      {typeof v.featured_rank === "number" && <span> · rank {v.featured_rank + 1}</span>}
                      {v.body_type && <span> · {v.body_type}</span>}
                    </div>

                    <div className="flex flex-wrap gap-2 mt-2">
                      {(v.photos || []).map((p) => (
                        <img
                          key={p.id}
                          src={p.url}
                          alt=""
                          className="h-16 w-24 object-cover rounded-lg border border-gray-200"
                        />
                      ))}
                    </div>

                    <div className="mt-2 flex gap-2">
                      <button onClick={() => setEditingVehicle(v)} className="rounded-lg px-3 py-1.5 border border-gray-300 bg-white hover:bg-gray-50 shadow-sm transition">
                        Edit
                      </button>
                      <button onClick={() => removeVehicle(v.id)} className="rounded-lg px-3 py-1.5 border border-gray-300 bg-white hover:bg-gray-50 shadow-sm transition">
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
