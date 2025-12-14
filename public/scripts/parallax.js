(function initParallax() {
  if (typeof window === "undefined") return;

  const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const mediaNodes = Array.from(document.querySelectorAll(".parallax-media"));

  if (!mediaNodes.length) return;

  const clampSpeed = (value) => {
    const numeric = Number.parseFloat(value);
    if (!Number.isFinite(numeric)) return 0.4;
    return Math.min(0.6, Math.max(0.3, numeric));
  };

  const entries = mediaNodes.map((media) => ({
    media,
    frame: media.closest(".parallax-frame") || media.parentElement,
    speed: clampSpeed(media.dataset.speed),
    frameHeight: 0,
    mediaHeight: 0,
    extra: 0,
    start: 0,
    total: 1,
  }));

  const measure = () => {
    const scrollY = window.scrollY || window.pageYOffset;
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

    entries.forEach((entry) => {
      const frame = entry.frame || entry.media.parentElement;
      const frameRect = frame.getBoundingClientRect();
      const mediaRect = entry.media.getBoundingClientRect();

      entry.frameHeight = frameRect.height;
      entry.mediaHeight = mediaRect.height;
      entry.extra = Math.max(0, entry.mediaHeight - entry.frameHeight);
      entry.start = frameRect.top + scrollY - viewportHeight;
      entry.total = entry.frameHeight + viewportHeight;
    });
  };

  const apply = () => {
    if (reduceMotionQuery.matches) {
      entries.forEach((entry) => entry.media.style.removeProperty("transform"));
      return;
    }

    const scrollY = window.scrollY || window.pageYOffset;

    entries.forEach((entry) => {
      const progress = Math.min(1, Math.max(0, (scrollY - entry.start) / entry.total));
      const offset = -progress * entry.extra * entry.speed;
      entry.media.style.transform = `translate3d(0, ${offset}px, 0)`;
    });
  };

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      apply();
      ticking = false;
    });
  };

  let resizeTick = false;
  const onResize = () => {
    if (resizeTick) return;
    resizeTick = true;
    requestAnimationFrame(() => {
      measure();
      apply();
      resizeTick = false;
    });
  };

  const init = () => {
    measure();
    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
  };

  reduceMotionQuery.addEventListener("change", () => {
    if (reduceMotionQuery.matches) {
      apply();
      return;
    }
    measure();
    apply();
  });

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
