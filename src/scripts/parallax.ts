const DEFAULT_SPEED = 0.25;
const SPEED_FALLBACK_RANGE = { min: 0.05, max: 1 };
const BASE_SCALE = 1.05;

type ParallaxElement = HTMLElement & {
  dataset: {
    parallaxSpeed?: string;
  };
};

function parseSpeed(element: ParallaxElement): number {
  const raw = Number.parseFloat(element.dataset.parallaxSpeed || "");
  if (Number.isFinite(raw) && raw >= SPEED_FALLBACK_RANGE.min && raw <= SPEED_FALLBACK_RANGE.max) {
    return raw;
  }
  return DEFAULT_SPEED;
}

export default function initParallax(): void {
  if (typeof window === "undefined") return;

  const motionPrefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const candidates = Array.from(document.querySelectorAll<ParallaxElement>("[data-parallax='bg']"));

  console.log("[parallax] layers:", candidates.length, "reduce-motion:", motionPrefersReduced.matches);

  if (motionPrefersReduced.matches || !candidates.length) return;

  const activeElements = new Set<ParallaxElement>();
  let ticking = false;

  const update = () => {
    ticking = false;
    const scrollY = window.scrollY;

    activeElements.forEach((element) => {
      const speed = parseSpeed(element);
      const y = scrollY * speed;
      const transform = `translate3d(0, ${y}px, 0) scale(${BASE_SCALE})`;
      element.style.transform = transform;
      console.log("[parallax] update", { y, transform });
    });
  };

  const requestTick = () => {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(update);
    }
  };

  const observer = "IntersectionObserver" in window
    ? new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const el = entry.target as ParallaxElement;
            if (entry.isIntersecting) {
              activeElements.add(el);
            } else {
              activeElements.delete(el);
            }
          });
          requestTick();
        },
        { rootMargin: "0px 0px 20% 0px" }
      )
    : null;

  candidates.forEach((element) => {
    if (observer) {
      observer.observe(element);
    } else {
      activeElements.add(element);
    }
  });

  const onScroll = () => requestTick();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });

  const disableParallax = () => {
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onScroll);
    observer?.disconnect();
    motionPrefersReduced.removeEventListener("change", onMotionChange);
    activeElements.forEach((element) => {
      element.style.transform = "";
    });
  };

  const onMotionChange = (event: MediaQueryListEvent) => {
    if (event.matches) {
      disableParallax();
    }
  };

  motionPrefersReduced.addEventListener("change", onMotionChange);
  requestTick();
}
