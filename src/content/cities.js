// Single source of truth for the local landing pages.
//
// Both the React page (src/pages/CityPage.jsx) and the build-time prerenderer
// (scripts/prerender.mjs) read from this file, so the HTML that Google sees and
// the page a visitor sees always say the same thing. Add a town here and it
// automatically gets a route, a prerendered page, and a sitemap entry.

export const DEALER = {
  phoneDisplay: "(508) 371-6512",
  phoneHref: "tel:+15083716512",
  street: "20 Granfield St",
  city: "New Bedford",
  region: "MA",
  postalCode: "02746",
  email: "contact@massmauto.com",
};

export const CITIES = [
  {
    slug: "used-cars-new-bedford",
    city: "New Bedford",
    region: "MA",
    title: "Used Cars in New Bedford, MA | Mass Market Auto Sales",
    metaDescription:
      "Browse quality used cars, SUVs, and trucks in New Bedford, MA. Every vehicle inspected, financing available, trade-ins welcome. Visit our North End lot.",
    h1: "Used Cars for Sale in New Bedford, MA",
    intro:
      "We are a family-run, Massachusetts-licensed Class II dealer located right here in New Bedford's North End, just off Belleville Avenue near Market Basket. Every vehicle on our lot is inspected before it is listed, and because we are small, the person who answers the phone is the same person who will show you the car.",
    directions:
      "Our lot is at 20 Granfield St, a short drive from downtown New Bedford, the North End, and the Route 18 corridor. There is off-street parking, so you can pull in, look around, and take your time.",
    highlights: [
      "Massachusetts Class II licensed dealer",
      "Every vehicle inspected before it is listed for sale",
      "Financing available, including options for limited or rebuilt credit",
      "Trade-ins accepted and appraised on the spot",
      "We handle the registration and plate paperwork for you",
    ],
    faqs: [
      {
        q: "Do you offer financing in New Bedford?",
        a: "Yes. We work with a range of lenders and can often find an approval for buyers with limited, thin, or damaged credit history. You can start a secure application from our financing page before you ever come down to the lot.",
      },
      {
        q: "Can I trade in my current vehicle?",
        a: "Absolutely. Bring it with you and we will appraise it while you look. If you still owe money on it, we can work the remaining balance into the deal in most cases.",
      },
      {
        q: "Do you handle the registration and plates?",
        a: "Yes. We take care of the Massachusetts RMV paperwork on your behalf so you are not the one standing in line.",
      },
    ],
  },
  {
    slug: "used-cars-dartmouth",
    city: "Dartmouth",
    region: "MA",
    title: "Used Cars Near Dartmouth, MA | Mass Market Auto Sales",
    metaDescription:
      "Shopping for a used car in Dartmouth, MA? Mass Market Auto Sales is a short drive away in New Bedford. Inspected vehicles, financing, and trade-ins welcome.",
    h1: "Used Cars for Sale Near Dartmouth, MA",
    intro:
      "Dartmouth buyers have plenty of big-name lots to choose from along Route 6 and State Road, and those stores are fine if you want a payment quoted by a manager you will never meet again. We are the opposite of that. We are a small family-run lot in New Bedford where you deal directly with the owners.",
    directions:
      "We are roughly fifteen minutes from Dartmouth. Take Route 6 east or I-195 east into New Bedford and head for the North End; we are at 20 Granfield St, just off Belleville Avenue near Market Basket. Call ahead and we will have the car you want pulled up front and ready.",
    highlights: [
      "About a fifteen-minute drive from Dartmouth",
      "No sales floor, no manager shuffle, no four-square worksheet",
      "Every vehicle inspected before it is listed for sale",
      "Financing and trade-in appraisals handled in-house",
      "Call ahead and we will have the vehicle ready when you arrive",
    ],
    faqs: [
      {
        q: "Is it worth driving to New Bedford from Dartmouth?",
        a: "It is about fifteen minutes, and because our overhead is lower than the franchise stores on Route 6, our pricing usually reflects that. Look at our listings online first and decide whether the trip is worth it for the specific car you want.",
      },
      {
        q: "Can I get pre-approved before I drive over?",
        a: "Yes, and we recommend it. Start the application on our financing page and we can usually tell you where you stand before you get in the car.",
      },
    ],
  },
  {
    slug: "used-cars-fairhaven",
    city: "Fairhaven",
    region: "MA",
    title: "Used Cars Near Fairhaven, MA | Mass Market Auto Sales",
    metaDescription:
      "Looking for a used car in Fairhaven, MA? Mass Market Auto Sales is minutes across the river in New Bedford. Inspected vehicles, financing, and trade-ins welcome.",
    h1: "Used Cars for Sale Near Fairhaven, MA",
    intro:
      "Fairhaven is close enough that plenty of our customers come from across the bridge. We are a family-run Class II dealer in New Bedford's North End with a rotating selection of inspected, road-ready vehicles, and we price them to sell rather than to leave room for a long negotiation.",
    directions:
      "From Fairhaven, cross the Acushnet River on Route 6 or take I-195 west and head into the North End. We are at 20 Granfield St, just off Belleville Avenue near Market Basket. It is generally a ten-minute drive.",
    highlights: [
      "About ten minutes from Fairhaven, across the river",
      "Massachusetts Class II licensed dealer",
      "Every vehicle inspected before it is listed for sale",
      "Financing available, trade-ins accepted",
      "Family-run: you deal with the owners, not a rotating sales staff",
    ],
    faqs: [
      {
        q: "How long does it take to get there from Fairhaven?",
        a: "Usually about ten minutes. Cross on Route 6 or take I-195 west toward New Bedford and head for the North End.",
      },
      {
        q: "Do you have anything under ten thousand dollars?",
        a: "Our inventory turns over constantly and we regularly carry vehicles in that range. The most reliable way to check is our current inventory page, which updates as cars come in and go out.",
      },
    ],
  },
  {
    slug: "used-cars-acushnet",
    city: "Acushnet",
    region: "MA",
    title: "Used Cars Near Acushnet, MA | Mass Market Auto Sales",
    metaDescription:
      "Used cars near Acushnet, MA. Mass Market Auto Sales is just down the road in New Bedford's North End. Inspected vehicles, financing, and trade-ins welcome.",
    h1: "Used Cars for Sale Near Acushnet, MA",
    intro:
      "If you live in Acushnet, we are probably the closest independent used car lot to you. We sit at the top of New Bedford's North End, a few minutes down Main Street, and we are a small family operation rather than a chain store.",
    directions:
      "From Acushnet, head south on Main Street or Belleville Avenue into New Bedford's North End. We are at 20 Granfield St, near Market Basket. For most of Acushnet it is under ten minutes.",
    highlights: [
      "One of the closest used car lots to Acushnet",
      "Massachusetts Class II licensed dealer",
      "Every vehicle inspected before it is listed for sale",
      "Financing available, trade-ins accepted",
      "Small enough that you deal directly with the owners",
    ],
    faqs: [
      {
        q: "Are you the closest used car dealer to Acushnet?",
        a: "We are one of them. We sit at the northern end of New Bedford, which puts us a few minutes from most of Acushnet.",
      },
      {
        q: "Can I come look without an appointment?",
        a: "Yes. Walk-ins are welcome during business hours. If there is a specific vehicle you want to drive, a quick call ahead means we can have it up front and ready to go.",
      },
    ],
  },
];

export function getCityBySlug(slug) {
  return CITIES.find((c) => c.slug === slug) || null;
}
