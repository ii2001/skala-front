(() => {
  "use strict";

  const root = document.documentElement;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const revealSelector = ".reveal, .reveal-on-scroll";
  const canObserve = !reducedMotion.matches && typeof window.IntersectionObserver === "function";
  let observer = null;

  if (canObserve) {
    root.classList.add("motion-ready");
  }

  function revealElement(element) {
    element.classList.add("is-revealed");

    if (observer !== null) {
      observer.unobserve(element);
    }
  }

  function revealAll(elements) {
    elements.forEach((element) => {
      revealElement(element);
    });
  }

  function initializeReveal() {
    const revealElements = Array.from(document.querySelectorAll(revealSelector));

    if (revealElements.length === 0) {
      root.classList.remove("motion-ready");
      return;
    }

    if (!canObserve) {
      revealAll(revealElements);
      return;
    }

    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        revealElement(entry.target);
      });
    }, {
      rootMargin: "0px 0px -8% 0px",
      threshold: 0.12
    });

    revealElements.forEach((element) => {
      observer.observe(element);
    });

    document.addEventListener("focusin", (event) => {
      if (!(event.target instanceof Element)) {
        return;
      }

      const revealTarget = event.target.closest(revealSelector);

      if (revealTarget !== null) {
        revealElement(revealTarget);
      }
    });

    const handleReducedMotionChange = (event) => {
      if (!event.matches) {
        return;
      }

      observer.disconnect();
      revealAll(revealElements);
      root.classList.remove("motion-ready");

      if (typeof reducedMotion.removeListener === "function") {
        reducedMotion.removeListener(handleReducedMotionChange);
      }
    };

    if (typeof reducedMotion.addEventListener === "function") {
      reducedMotion.addEventListener("change", handleReducedMotionChange, { once: true });
    } else {
      reducedMotion.addListener(handleReducedMotionChange);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeReveal, { once: true });
  } else {
    initializeReveal();
  }
})();
