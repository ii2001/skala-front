(() => {
  "use strict";

  const scrollThreshold = 360;
  const tiltClasses = [
    "tilt-top-left",
    "tilt-top-right",
    "tilt-bottom-left",
    "tilt-bottom-right",
    "tilt-center"
  ];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(pointer: fine)");

  function initializeVisualEffects() {
    const scrollProgress = document.querySelector(".page-scroll-progress");
    const topbar = document.querySelector(".floating-topbar");
    const backToTop = document.querySelector(".back-to-top");
    const topFocusTarget = document.querySelector(".site-brand");
    const tiltElements = Array.from(document.querySelectorAll("[data-tilt]"));
    const activeTiltClasses = new WeakMap();
    const tiltFrames = new WeakMap();
    const pendingPointerPositions = new WeakMap();
    let scrollFrame = 0;

    function getScrollPosition() {
      return Math.max(window.scrollY, 0);
    }

    function updateScrollEffects() {
      const scrollPosition = getScrollPosition();
      const scrollRoot = document.scrollingElement ?? document.documentElement;
      const scrollableDistance = Math.max(scrollRoot.scrollHeight - window.innerHeight, 0);
      const scrollPercentage = scrollableDistance === 0
        ? 0
        : Math.min((scrollPosition / scrollableDistance) * 100, 100);
      const isPastThreshold = scrollPosition >= scrollThreshold;

      if (scrollProgress instanceof HTMLProgressElement) {
        scrollProgress.value = scrollPercentage;
      }

      if (topbar instanceof HTMLElement) {
        topbar.classList.toggle("is-condensed", isPastThreshold);
      }

      if (backToTop instanceof HTMLElement) {
        backToTop.classList.toggle("is-visible", isPastThreshold);
        backToTop.setAttribute("aria-hidden", String(!isPastThreshold));
        backToTop.tabIndex = isPastThreshold ? 0 : -1;

        if (!isPastThreshold
          && document.activeElement === backToTop
          && topFocusTarget instanceof HTMLAnchorElement) {
          topFocusTarget.focus({ preventScroll: true });
        }
      }
    }

    function requestScrollUpdate() {
      if (scrollFrame !== 0) {
        return;
      }

      scrollFrame = window.requestAnimationFrame(() => {
        scrollFrame = 0;
        updateScrollEffects();
      });
    }

    function canUseTilt() {
      return finePointer.matches && !reducedMotion.matches;
    }

    function clearTilt(element) {
      const tiltFrame = tiltFrames.get(element);

      if (tiltFrame !== undefined) {
        window.cancelAnimationFrame(tiltFrame);
      }

      element.classList.remove(...tiltClasses);
      activeTiltClasses.delete(element);
      tiltFrames.delete(element);
      pendingPointerPositions.delete(element);
    }

    function getTiltClass(element, event) {
      const bounds = element.getBoundingClientRect();

      if (bounds.width === 0 || bounds.height === 0) {
        return null;
      }

      const horizontalPosition = (event.clientX - bounds.left) / bounds.width;
      const verticalPosition = (event.clientY - bounds.top) / bounds.height;
      const isHorizontalCenter = horizontalPosition >= 0.35 && horizontalPosition <= 0.65;
      const isVerticalCenter = verticalPosition >= 0.35 && verticalPosition <= 0.65;

      if (isHorizontalCenter && isVerticalCenter) {
        return "tilt-center";
      }

      const verticalDirection = verticalPosition < 0.5 ? "top" : "bottom";
      const horizontalDirection = horizontalPosition < 0.5 ? "left" : "right";
      return `tilt-${verticalDirection}-${horizontalDirection}`;
    }

    function updateTilt(element, event) {
      if (!canUseTilt()) {
        clearTilt(element);
        return;
      }

      const nextTiltClass = getTiltClass(element, event);
      const currentTiltClass = activeTiltClasses.get(element);

      if (nextTiltClass === null) {
        clearTilt(element);
        return;
      }

      if (nextTiltClass === currentTiltClass) {
        return;
      }

      element.classList.remove(...tiltClasses);
      element.classList.add(nextTiltClass);
      activeTiltClasses.set(element, nextTiltClass);
    }

    function requestTiltUpdate(element, event) {
      if (!canUseTilt()) {
        clearTilt(element);
        return;
      }

      pendingPointerPositions.set(element, {
        clientX: event.clientX,
        clientY: event.clientY
      });

      if (tiltFrames.has(element)) {
        return;
      }

      const tiltFrame = window.requestAnimationFrame(() => {
        const pointerPosition = pendingPointerPositions.get(element);

        tiltFrames.delete(element);
        pendingPointerPositions.delete(element);

        if (pointerPosition !== undefined) {
          updateTilt(element, pointerPosition);
        }
      });

      tiltFrames.set(element, tiltFrame);
    }

    function clearAllTilts() {
      tiltElements.forEach(clearTilt);
    }

    if (scrollProgress instanceof HTMLProgressElement
      || topbar instanceof HTMLElement
      || backToTop instanceof HTMLElement) {
      window.addEventListener("scroll", requestScrollUpdate, { passive: true });
      window.addEventListener("resize", requestScrollUpdate);
      window.addEventListener("load", requestScrollUpdate, { once: true });
      updateScrollEffects();
    }

    if (backToTop instanceof HTMLButtonElement) {
      backToTop.hidden = false;

      backToTop.addEventListener("click", () => {
        const behavior = reducedMotion.matches ? "auto" : "smooth";

        if (topFocusTarget instanceof HTMLAnchorElement) {
          topFocusTarget.focus({ preventScroll: true });
        }

        window.scrollTo({ top: 0, left: 0, behavior });
      });
    }

    tiltElements.forEach((element) => {
      element.addEventListener("pointermove", (event) => {
        requestTiltUpdate(element, event);
      });
      element.addEventListener("pointerleave", () => {
        clearTilt(element);
      });
      element.addEventListener("pointercancel", () => {
        clearTilt(element);
      });
      element.addEventListener("blur", () => {
        clearTilt(element);
      });
    });

    const handleMotionCapabilityChange = () => {
      if (!canUseTilt()) {
        clearAllTilts();
      }
    };

    if (typeof reducedMotion.addEventListener === "function") {
      reducedMotion.addEventListener("change", handleMotionCapabilityChange);
      finePointer.addEventListener("change", handleMotionCapabilityChange);
    } else {
      reducedMotion.addListener(handleMotionCapabilityChange);
      finePointer.addListener(handleMotionCapabilityChange);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeVisualEffects, { once: true });
  } else {
    initializeVisualEffects();
  }
})();
