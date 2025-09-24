export function slugifyVehicle(v) {
  const base = [v.year, v.make, v.model].filter(Boolean).join(" ");
  const slug = base.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return `${slug}-${v.id}`;
}
export function getIdFromSlug(slug) {
  const s = decodeURIComponent(slug);

  // 1) Try to grab a full UUID at the end of the slug
  const uuidMatch = s.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
  if (uuidMatch) return uuidMatch[0];

  // 2) Fallback: trailing number id
  const numMatch = s.match(/(\d+)$/);
  return numMatch ? numMatch[1] : null;
}
