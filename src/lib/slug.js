export function slugifyVehicle(v) {
  const base = [v.year, v.make, v.model].filter(Boolean).join(" ");
  const slug = base.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return `${slug}-${v.id}`;
}
export function getIdFromSlug(slug) {
  const m = slug.match(/-(\d+|[a-f0-9-]{8,})$/i);
  return m ? m[1] : null;
}
