// Lead tracking for Google Analytics 4 (the gtag snippet lives in index.html).
//
// Events we send:
//   click_to_call   – someone tapped a phone number / "Call" button
//   click_text      – someone tapped an sms: link
//   click_email     – someone tapped an email link
//   generate_lead   – a test-drive or financing form was submitted successfully
//   view_item       – someone opened a car (Quick View or the full vehicle page)
//   search          – someone searched the inventory
//
// Events only go to Google from the live site, so testing on localhost or a
// Netlify preview never pollutes the real numbers.

const LIVE_HOSTS = ["massmauto.com", "www.massmauto.com"];

function isLive() {
  return typeof window !== "undefined" && LIVE_HOSTS.includes(window.location.hostname);
}

export function trackEvent(name, params = {}) {
  const payload = { page_path: window.location.pathname, ...params };
  if (isLive() && typeof window.gtag === "function") {
    window.gtag("event", name, payload);
  } else {
    // Visible in the browser console during local testing.
    console.debug("[track]", name, payload);
  }
}

// Shape a vehicle the same way everywhere so GA reports line up.
export function vehicleParams(v) {
  if (!v) return {};
  const name = [v.year, v.make, v.model, v.trim].filter(Boolean).join(" ");
  return {
    currency: "USD",
    value: Number(v.price) || 0,
    items: [
      {
        item_id: String(v.id ?? ""),
        item_name: name,
        item_brand: v.make || undefined,
        item_category: v.bodyType || v.body_type || undefined,
        price: Number(v.price) || 0,
      },
    ],
  };
}

// One listener for the whole site catches every phone / text / email link,
// including ones added to new pages later — no need to tag each button.
export function installContactClickTracking() {
  if (typeof document === "undefined" || window.__mmContactTracking) return;
  window.__mmContactTracking = true;

  document.addEventListener(
    "click",
    (e) => {
      const link = e.target.closest?.('a[href^="tel:"], a[href^="sms:"], a[href^="mailto:"]');
      if (!link) return;
      const href = link.getAttribute("href") || "";
      const label = (link.textContent || "").trim().slice(0, 60);
      if (href.startsWith("tel:")) trackEvent("click_to_call", { link_text: label });
      else if (href.startsWith("sms:")) trackEvent("click_text", { link_text: label });
      else trackEvent("click_email", { link_text: label });
    },
    { capture: true }
  );
}
