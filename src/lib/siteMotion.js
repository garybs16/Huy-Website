import { useEffect } from "react";

/* Presentation-only enhancements: a condensed header state on scroll and a
   scroll-reveal pass over existing sections. Nothing here adds, removes, or
   rewrites page content — elements are only hidden once this script has
   confirmed it can reveal them again, so a no-JS render stays fully readable. */

const SECTION_SELECTOR = "#main-content section, .site-cta-band .site-cta-panel";

const STAGGER_CONTAINERS = [
  ".card-grid",
  ".hero-pathway",
  ".hero-decision-strip",
  ".impact-stat-row",
  ".modern-trust-grid",
  ".support-feature-list",
  ".program-step-grid",
  ".metrics-grid",
  ".quiz-option-grid",
  ".handout-benefits",
  ".home-quiz-theme-grid",
  ".split-panel",
  ".home-program-schedule-grid",
  ".rg-pillar-grid",
  ".rg-guide-grid",
  ".rg-pricing-grid",
  ".rg-milestone-grid",
  ".rg-career-grid",
  ".rg-tool-grid",
  ".third-party-fee-grid",
  ".payment-choice-grid",
  ".policy-document-stack",
].join(",");

/* Safety valve: if an observer callback never lands (odd layouts, print, or a
   container the element never scrolls into) the page still shows everything. */
const FORCE_REVEAL_MS = 2600;

function prefersReducedMotion() {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

function markStaggerItems(section) {
  section.querySelectorAll(STAGGER_CONTAINERS).forEach((container) => {
    Array.from(container.children).forEach((child, index) => {
      if (index > 7 || child.hasAttribute("data-reveal-item")) {
        return;
      }
      child.setAttribute("data-reveal-item", "");
      child.style.setProperty("--reveal-i", String(index));
    });
  });
}

export function useSiteMotion(routeKey) {
  useEffect(() => {
    const root = document.documentElement;
    let frame = 0;

    const syncScrollState = () => {
      frame = 0;
      root.dataset.scrolled = window.scrollY > 24 ? "true" : "false";
    };

    const onScroll = () => {
      if (!frame) {
        frame = window.requestAnimationFrame(syncScrollState);
      }
    };

    syncScrollState();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
      delete root.dataset.scrolled;
    };
  }, []);

  useEffect(() => {
    if (typeof IntersectionObserver !== "function" || prefersReducedMotion()) {
      return undefined;
    }

    const tracked = new Set();
    let timer = 0;

    const reveal = (element) => {
      element.setAttribute("data-reveal", "shown");
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            reveal(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.04 }
    );

    const scan = () => {
      const fold = window.innerHeight * 0.92;

      document.querySelectorAll(SECTION_SELECTOR).forEach((section) => {
        if (section.hasAttribute("data-reveal") || section.parentElement?.closest("[data-reveal]")) {
          return;
        }

        section.setAttribute("data-reveal", "");
        markStaggerItems(section);

        /* Anything already on screen is shown in this same task, so it never
           paints hidden — only content below the fold animates in on scroll. */
        if (section.getBoundingClientRect().top < fold) {
          reveal(section);
          return;
        }

        tracked.add(section);
        observer.observe(section);
      });

      window.clearTimeout(timer);
      timer = window.setTimeout(() => tracked.forEach(reveal), FORCE_REVEAL_MS);
    };

    scan();

    /* Routes are lazy-loaded, so watch for sections that mount after this pass.
       The callback runs before the next paint, which keeps freshly mounted
       sections from flashing at full opacity before they are marked. */
    const main = document.getElementById("main-content");
    const mutations = main ? new MutationObserver(scan) : null;

    mutations?.observe(main, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutations?.disconnect();
      window.clearTimeout(timer);
      tracked.forEach((section) => section.removeAttribute("data-reveal"));
    };
  }, [routeKey]);
}
