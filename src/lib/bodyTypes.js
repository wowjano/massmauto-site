// Single list of body types used by the admin form and the homepage filter.
// Add a new type here and it shows up everywhere.
export const BODY_TYPES = [
  "Sedan",
  "SUV",
  "Truck",
  "Van",
  "Minivan",
  "Hatchback",
  "Coupe",
  "Wagon",
  "Convertible",
];

// Order a list of body types found in inventory to match BODY_TYPES,
// with any unexpected values (typos, legacy data) tacked on at the end.
export function orderBodyTypes(found) {
  const known = BODY_TYPES.filter((t) => found.includes(t));
  const extra = found.filter((t) => !BODY_TYPES.includes(t)).sort();
  return [...known, ...extra];
}
