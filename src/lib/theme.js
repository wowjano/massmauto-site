// Brand palette, mirrored from the COLORS constant in src/Homepage.jsx.
// Kept as its own module so new pages can share it without importing the
// 2,400-line homepage. If you change a brand color, change it in both places.
export const COLORS = {
  charcoal: "#363732",
  sky: "#53d8fb",
  azure: "#66c3ff",
  mist: "#dce1e9",
  rose: "#d4afb9",
};

export const LOGO_URL =
  "https://i.postimg.cc/YSDXdHtW/1754711420035-3d1aa64b-85bd-4e3e-affb-011778aaf3e5-3.jpg";

// Google Business Profile identifiers for Mass Market Auto.
export const GOOGLE_PLACE_ID = "ChIJaZjmcKHl5IkRfM6hdWbCNF0";

// READ link: opens the listing so a shopper can browse existing reviews.
// This is what the "Read all reviews" link in the Testimonials section uses.
export const GOOGLE_MAPS_URL = "https://maps.google.com/?cid=6716206689632243324";

// WRITE link: opens the five-star rating box directly, no extra taps.
// Use this one in review requests — the post-sale text message above all.
export const REVIEW_URL = `https://search.google.com/local/writereview?placeid=${GOOGLE_PLACE_ID}`;
