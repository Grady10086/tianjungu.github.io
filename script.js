const header = document.querySelector("[data-header]");
const navToggle = document.querySelector("[data-nav-toggle]");
const navLinks = document.querySelector("[data-nav-links]");
const navAnchors = [...document.querySelectorAll(".nav-links a[href^='#']")];
const themeToggle = document.querySelector("[data-theme-toggle]");
const newsFeed = document.querySelector("[data-news-feed]");
const newsToggle = document.querySelector("[data-news-toggle]");
const pageProgress = document.querySelector("[data-page-progress]");
const focusMode = document.querySelector("[data-focus-mode]");
const profile = document.querySelector(".profile");
const cycleLinks = [...document.querySelectorAll("[data-cycle-link]")];
const cycleLines = [...document.querySelectorAll(".hero-cycle > i")];
const atlasRows = [...document.querySelectorAll("[data-atlas-paper]")];
let activePublicationId = "paper-vsi";

const applyTheme = (theme, persist = false) => {
  const isDark = theme === "dark";
  document.documentElement.dataset.theme = isDark ? "dark" : "light";
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", isDark ? "#0E1015" : "#F3F7FB");

  if (themeToggle) {
    const nextTheme = isDark ? "light" : "dark";
    const label = `Switch to ${nextTheme} theme`;
    themeToggle.setAttribute("aria-label", label);
    themeToggle.setAttribute("aria-pressed", String(isDark));
    themeToggle.setAttribute("title", label);
    themeToggle.innerHTML = `<i data-lucide="${isDark ? "sun" : "moon"}" aria-hidden="true"></i>`;
    window.lucide?.createIcons();
  }

  if (persist) {
    try {
      localStorage.setItem("theme", isDark ? "dark" : "light");
    } catch (_) {
      // The theme still applies when storage is unavailable.
    }
  }
};

applyTheme(document.documentElement.dataset.theme);

themeToggle?.addEventListener("click", () => {
  applyTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark", true);
});

newsToggle?.addEventListener("click", () => {
  const expanded = !newsFeed.classList.contains("is-expanded");
  newsFeed.classList.toggle("is-expanded", expanded);
  newsToggle.setAttribute("aria-expanded", String(expanded));
  newsToggle.querySelector("span").textContent = expanded ? "Show fewer updates" : "Show all updates";
});

const setCycleState = (activeLink) => {
  if (!activeLink || !profile) return;
  const activeIndex = Number(activeLink.dataset.cycleIndex || 1);
  cycleLinks.forEach((link) => link.classList.toggle("is-cycle-active", link === activeLink));
  cycleLines.forEach((line, index) => line.classList.toggle("is-cycle-complete", index < activeIndex - 1));
  profile.dataset.cycleActive = activeLink.dataset.cycleLink;
  profile.style.setProperty("--cycle-progress", String(activeIndex / cycleLinks.length));
};

cycleLinks.forEach((link) => {
  link.addEventListener("pointerenter", () => setCycleState(link));
  link.addEventListener("focus", () => setCycleState(link));
  link.addEventListener("click", () => setCycleState(link));
});

setCycleState(cycleLinks[0]);

const setAtlasState = (paperId) => {
  atlasRows.forEach((row) => row.classList.toggle("is-atlas-active", row.dataset.atlasPaper === paperId));
};

atlasRows.forEach((row) => {
  row.addEventListener("pointerenter", () => setAtlasState(row.dataset.atlasPaper));
  row.addEventListener("pointerleave", () => setAtlasState(activePublicationId));
  row.addEventListener("focus", () => setAtlasState(row.dataset.atlasPaper));
  row.addEventListener("blur", () => setAtlasState(activePublicationId));
});

setAtlasState(activePublicationId);

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

  if (pageProgress) {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
    pageProgress.parentElement.style.setProperty("--page-progress", progress.toFixed(4));
  }
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

const scrollFocusGroups = [...document.querySelectorAll("[data-scroll-focus]")];
let focusModeTimer = null;

if (!reducedMotion && scrollFocusGroups.length) {
  const groups = scrollFocusGroups.map((group) => ({
    element: group,
    items: [...group.querySelectorAll("[data-scroll-item]")],
    counter: group.dataset.scrollCounter
      ? document.querySelector(group.dataset.scrollCounter)
      : null,
  })).filter((group) => group.items.length);

  const setScrollFocus = (group, activeIndex) => {
    group.items.forEach((item, index) => {
      item.classList.toggle("is-scroll-active", index === activeIndex);
    });

    const progress = `${((activeIndex + 1) / group.items.length) * 100}%`;
    group.element.style.setProperty("--focus-progress", progress);

    if (group.counter) {
      activePublicationId = group.items[activeIndex].id;
      setAtlasState(activePublicationId);
      group.counter.textContent = String(activeIndex + 1).padStart(2, "0");
      group.counter.closest(".publication-progress")?.style.setProperty("--publication-progress", progress);
    }

    const nextLabel = group.items[activeIndex]?.dataset.focusLabel;
    if (nextLabel && focusMode && focusMode.textContent !== nextLabel) {
      const matchingCycleLink = cycleLinks.find((link) => link.dataset.cycleLink === nextLabel.toLowerCase());
      setCycleState(matchingCycleLink);
      window.clearTimeout(focusModeTimer);
      focusMode.classList.add("is-changing");
      focusModeTimer = window.setTimeout(() => {
        focusMode.textContent = nextLabel;
        focusMode.classList.remove("is-changing");
      }, reducedMotion ? 0 : 120);
    }
  };

  const updateScrollFocus = () => {
    const focalLine = window.innerHeight * 0.52;

    groups.forEach((group) => {
      let closestIndex = 0;
      let closestDistance = Infinity;

      group.items.forEach((item, index) => {
        const rect = item.getBoundingClientRect();
        const distance = Math.abs(rect.top + rect.height / 2 - focalLine);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      setScrollFocus(group, closestIndex);
    });
  };

  let focusFrame = null;
  const requestScrollFocusUpdate = () => {
    if (focusFrame !== null) return;
    focusFrame = window.requestAnimationFrame(() => {
      updateScrollFocus();
      focusFrame = null;
    });
  };

  groups.forEach((group) => {
    group.element.classList.add("has-scroll-focus");
    group.items.forEach((item, index) => {
      item.addEventListener("mouseenter", () => setScrollFocus(group, index));
      item.addEventListener("focusin", () => setScrollFocus(group, index));
    });
  });

  updateScrollFocus();
  window.addEventListener("scroll", requestScrollFocusUpdate, { passive: true });
  window.addEventListener("resize", requestScrollFocusUpdate);
}

const companionTargets = [...document.querySelectorAll("[data-companion]")];
let companionLeaveTimer = null;

const setCompanionActive = (active) => {
  window.clearTimeout(companionLeaveTimer);
  if (active) {
    document.body.classList.add("companion-active");
    return;
  }

  companionLeaveTimer = window.setTimeout(() => {
    document.body.classList.remove("companion-active");
  }, 120);
};

companionTargets.forEach((target) => {
  target.addEventListener("mouseenter", () => setCompanionActive(true));
  target.addEventListener("mouseleave", () => setCompanionActive(false));
  target.addEventListener("focusin", () => setCompanionActive(true));
  target.addEventListener("focusout", () => setCompanionActive(false));
});

if (!reducedMotion && window.matchMedia("(pointer: fine)").matches) {
  document.querySelectorAll(".publication-thumb").forEach((thumb) => {
    thumb.addEventListener("pointermove", (event) => {
      const rect = thumb.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - 0.5) * -6;
      const y = ((event.clientY - rect.top) / rect.height - 0.5) * -6;
      thumb.style.setProperty("--media-x", `${x.toFixed(2)}px`);
      thumb.style.setProperty("--media-y", `${y.toFixed(2)}px`);
    });
    thumb.addEventListener("pointerleave", () => {
      thumb.style.removeProperty("--media-x");
      thumb.style.removeProperty("--media-y");
    });
  });
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
