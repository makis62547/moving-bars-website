import { gsap } from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

const START_Y = -20;
const END_Y = 20;
const SCALE = 1.15;

function initParallax() {
  if (typeof window === "undefined") return;

  const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-parallax]"));
  if (!sections.length) return;

  gsap.registerPlugin(ScrollTrigger);

  sections.forEach((section) => {
    const background = section.querySelector<HTMLElement>("[data-parallax-bg]");
    if (!background) return;

    gsap.fromTo(
      background,
      { yPercent: START_Y, scale: SCALE },
      {
        yPercent: END_Y,
        scale: SCALE,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          scrub: true,
          start: "top bottom",
          end: "bottom top",
        },
      }
    );
  });

  ScrollTrigger.refresh?.();
}

const boot = () => initParallax();

if (document.readyState === "complete") {
  boot();
} else {
  window.addEventListener("load", boot, { once: true });
}

document.addEventListener("astro:page-load", boot);
document.addEventListener("astro:before-swap", () => ScrollTrigger.killAll?.());
