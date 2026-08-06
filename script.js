const header = document.querySelector("[data-header]");
const navToggle = document.querySelector("[data-nav-toggle]");
const navLinks = document.querySelector("[data-nav-links]");
const navAnchors = [...document.querySelectorAll(".nav-links a[href^='#']")];

const setNavOpen = (open) => {
  if (!navToggle || !navLinks) return;

  navToggle.setAttribute("aria-expanded", String(open));
  navToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
  navLinks.classList.toggle("is-open", open);
  document.body.classList.toggle("nav-open", open);

  const icon = navToggle.querySelector("svg");
  if (icon) {
    icon.outerHTML = `<i data-lucide="${open ? "x" : "menu"}" aria-hidden="true"></i>`;
    window.lucide?.createIcons();
  }
};

navToggle?.addEventListener("click", () => {
  setNavOpen(navToggle.getAttribute("aria-expanded") !== "true");
});

navAnchors.forEach((anchor) => {
  anchor.addEventListener("click", () => setNavOpen(false));
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 760) setNavOpen(false);
});

const updateHeader = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 10);
};

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

const tabs = [...document.querySelectorAll("[role='tab']")];

const activateTab = (tab) => {
  tabs.forEach((candidate) => {
    const selected = candidate === tab;
    candidate.setAttribute("aria-selected", String(selected));
    document.getElementById(candidate.dataset.tab).hidden = !selected;
  });
};

tabs.forEach((tab, index) => {
  tab.addEventListener("click", () => activateTab(tab));
  tab.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;

    event.preventDefault();
    const direction = event.key === "ArrowRight" ? 1 : -1;
    const nextIndex = (index + direction + tabs.length) % tabs.length;
    tabs[nextIndex].focus();
    activateTab(tabs[nextIndex]);
  });
});

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const revealItems = document.querySelectorAll(".reveal");

if (reducedMotion || !("IntersectionObserver" in window)) {
  revealItems.forEach((item) => item.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px" });

  revealItems.forEach((item) => revealObserver.observe(item));
}

const sections = [...document.querySelectorAll("main section[id]")];

if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!visible) return;
    navAnchors.forEach((anchor) => {
      anchor.toggleAttribute("aria-current", anchor.getAttribute("href") === `#${visible.target.id}`);
    });
  }, { rootMargin: "-25% 0px -60%", threshold: [0.01, 0.2, 0.5] });

  sections.forEach((section) => sectionObserver.observe(section));
}

document.querySelectorAll("[data-year]").forEach((element) => {
  element.textContent = new Date().getFullYear();
});

window.addEventListener("DOMContentLoaded", () => {
  window.lucide?.createIcons();
});

const sendAnalyticsEvent = (name, parameters = {}) => {
  if (typeof window.gtag !== "function") return;
  window.gtag("event", name, parameters);
};

const outreachRef = new URLSearchParams(window.location.search).get("ref");
const validOutreachRef = outreachRef && /^[a-z0-9_-]{1,64}$/i.test(outreachRef)
  ? outreachRef
  : null;
const outreachEventName = validOutreachRef
  ? `outreach_${validOutreachRef.toLowerCase().replace(/-/g, "_").slice(0, 20)}`
  : null;

if (validOutreachRef) {
  sendAnalyticsEvent("outreach_visit", {
    outreach_ref: validOutreachRef,
    transport_type: "beacon",
  });
  sendAnalyticsEvent(outreachEventName, {
    transport_type: "beacon",
  });

  window.setTimeout(() => {
    if (document.visibilityState !== "visible") return;
    sendAnalyticsEvent(`${outreachEventName}_engaged`, {
      transport_type: "beacon",
    });
  }, 15000);
}

const classifyResourceLink = (anchor) => {
  const href = anchor.getAttribute("href") || "";

  if (href.startsWith("mailto:")) return "email";
  if (href.includes("Tianjun_Gu_CV.pdf")) return "cv";
  if (href.includes("scholar.google.")) return "scholar";
  if (href.includes("linkedin.com")) return "linkedin";
  if (href.includes("github.com")) return "github";
  if (href.includes("arxiv.org") || href.includes("doi.org") || href.includes("openaccess.thecvf.com")) return "paper";
  if (anchor.closest(".publication")) return "project";

  return null;
};

document.addEventListener("click", (event) => {
  const anchor = event.target.closest("a[href]");
  if (!anchor) return;

  const resourceType = classifyResourceLink(anchor);
  if (!resourceType) return;

  sendAnalyticsEvent("resource_click", {
    resource_type: resourceType,
    resource_label: anchor.textContent.trim().replace(/\s+/g, " ").slice(0, 80),
    transport_type: "beacon",
  });

  if (outreachEventName) {
    sendAnalyticsEvent(`${outreachEventName}_${resourceType}`, {
      transport_type: "beacon",
    });
  }
});
