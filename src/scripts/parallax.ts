const DEFAULT_SPEED = 0.3;
const MIN_SPEED = 0.05;
const MAX_SPEED = 2;
const DEFAULT_START = "top bottom";
const DEFAULT_END = "bottom top";

let cleanupFns: Array<() => void> = [];
let gsapLoader: Promise<{ gsap: any; ScrollTrigger: any } | null> | null = null;

function parseSpeed(section: HTMLElement): number {
  const raw = Number.parseFloat(section.dataset.speed || "");
  if (!Number.isFinite(raw)) return DEFAULT_SPEED;
  return Math.min(MAX_SPEED, Math.max(MIN_SPEED, raw));
}

function parsePosition(value: string | undefined, fallback: string): string {
  return value && value.trim().length ? value : fallback;
}

async function loadGsap() {
  if (gsapLoader) return gsapLoader;

  gsapLoader = Promise.all([
    import(/* @vite-ignore */ "https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"),
    import(/* @vite-ignore */ "https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js"),
  ])
    .then(([core, scroll]) => {
      const gsap = (core as any).gsap || (core as any).default;
      const ScrollTrigger = (scroll as any).ScrollTrigger || (scroll as any).default;

      if (!gsap || !ScrollTrigger) {
        console.error("[parallax] GSAP failed to load");
        return null;
      }

      gsap.registerPlugin(ScrollTrigger);
      return { gsap, ScrollTrigger } as const;
    })
    .catch((error) => {
      console.error("[parallax] Failed to load GSAP", error);
      return null;
    });

  return gsapLoader;
}

function teardown() {
  cleanupFns.forEach((fn) => fn());
  cleanupFns = [];
}

async function setupParallax() {
  if (typeof window === "undefined") return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (reduceMotion.matches) {
    teardown();
    return;
  }

  const bundle = await loadGsap();
  if (!bundle) return;
  const { gsap, ScrollTrigger } = bundle;

  teardown();

  const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-parallax]"));
  if (!sections.length) return;

  sections.forEach((section) => {
    const background = section.querySelector<HTMLElement>("[data-parallax-bg]");
    if (!background) return;

    const speed = parseSpeed(section);
    const start = parsePosition(section.dataset.start, DEFAULT_START);
    const end = parsePosition(section.dataset.end, DEFAULT_END);
    const distance = speed * 100;

    background.style.willChange = "transform";

    const tween = gsap.fromTo(
      background,
      { yPercent: -distance, scale: 1.15 },
      {
        yPercent: distance,
        scale: 1.15,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start,
          end,
          scrub: true,
          invalidateOnRefresh: true,
        },
      }
    );

    const trigger = (tween as any).scrollTrigger as typeof ScrollTrigger | null;

    const clearTransform = () => {
      background.style.transform = "";
      background.style.willChange = "";
    };

    cleanupFns.push(() => {
      if (trigger && typeof trigger.kill === "function") {
        trigger.kill(false);
      }
      tween.kill?.();
      clearTransform();
    });
  });

  ScrollTrigger.refresh?.();

  const handleMotionChange = (event: MediaQueryListEvent) => {
    if (event.matches) {
      teardown();
    } else {
      setupParallax();
    }
  };

  reduceMotion.addEventListener("change", handleMotionChange, { once: true });
  cleanupFns.push(() => reduceMotion.removeEventListener("change", handleMotionChange));
}

function initParallax() {
  const boot = () => void setupParallax();

  if (document.readyState === "complete") {
    boot();
  } else {
    window.addEventListener("load", boot, { once: true });
  }

  document.addEventListener("astro:page-load", boot);
  document.addEventListener("astro:before-swap", teardown);
}

initParallax();
