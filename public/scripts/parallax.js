function initParallax() {
  if (typeof window === "undefined") {
    return;
  }

  const PARALLAX_STRENGTH = 6.4;

  const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  const getSpeed = (el) => {
    const speedAttr = parseFloat(el.dataset.speed || "0.3");
    return Number.isFinite(speedAttr) ? speedAttr : 0.3;
  };

  const parallaxElements = Array.from(document.querySelectorAll("[data-parallax]"));

  if (!parallaxElements.length) {
    return;
  }

  const entries = parallaxElements.map((el) => {
    const container = el.closest(".parallax-section") || el.parentElement;
    const speed = getSpeed(el);
    el.classList.add("is-js-parallax");

    return {
      el,
      container,
      speed,
      top: 0,
      height: 0,
      start: 0,
      total: 1,
      maxOffset: 0,
    };
  });

  const measure = () => {
    const scrollY = window.scrollY || window.pageYOffset;
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

    entries.forEach((entry) => {
      const target = entry.container || entry.el;
      const rect = target.getBoundingClientRect();
      const height = rect.height || target.offsetHeight || 0;
      const top = rect.top + scrollY;

      entry.height = height;
      entry.top = top;
      entry.start = top - viewportHeight;
      entry.total = height + viewportHeight || 1;
      entry.maxOffset = height * 0.3;
    });
  };

  const applyTransforms = () => {
    if (reduceMotionQuery.matches) {
      entries.forEach((entry) => {
        entry.el.style.removeProperty("--parallax-offset");
      });
      return;
    }

    const scrollY = window.scrollY || window.pageYOffset;

    entries.forEach((entry) => {
      const progress = Math.min(1, Math.max(0, (scrollY - entry.start) / entry.total));
      const offset = progress * entry.speed * entry.maxOffset * PARALLAX_STRENGTH;

      entry.el.style.setProperty("--parallax-offset", `${offset}px`);
    });
  };

  let ticking = false;
  const onScroll = () => {
    if (ticking || reduceMotionQuery.matches) return;
    ticking = true;
    requestAnimationFrame(() => {
      applyTransforms();
      ticking = false;
    });
  };

  let resizeTick = false;
  const onResize = () => {
    if (resizeTick) return;
    resizeTick = true;
    requestAnimationFrame(() => {
      measure();
      applyTransforms();
      resizeTick = false;
    });
  };

  const init = () => {
    if (!entries.length) return;
    measure();
    applyTransforms();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
  };

  reduceMotionQuery.addEventListener("change", () => {
    if (reduceMotionQuery.matches) {
      applyTransforms();
      return;
    }
    measure();
    applyTransforms();
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
}

initParallax();
