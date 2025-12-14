const triggers = new Set();
let registeredGsap = null;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const computeBounds = (element) => {
  const rect = element.getBoundingClientRect();
  const scrollY = window.scrollY || window.pageYOffset;
  const start = scrollY + rect.top - window.innerHeight;
  const end = scrollY + rect.bottom;
  return { start, end: end <= start ? start + 1 : end };
};

const create = ({ trigger, target, scrub, onUpdate }) => {
  const el = trigger || target;
  if (!el) return null;

  let bounds = computeBounds(el);

  const update = () => {
    const scrollY = window.scrollY || window.pageYOffset;
    const progress = clamp((scrollY - bounds.start) / (bounds.end - bounds.start), 0, 1);
    onUpdate?.(progress);
  };

  const handleResize = () => {
    bounds = computeBounds(el);
    update();
  };

  const opts = scrub ? { passive: true } : undefined;
  window.addEventListener("scroll", update, opts);
  window.addEventListener("resize", handleResize);

  update();

  const api = {
    kill() {
      window.removeEventListener("scroll", update, opts);
      window.removeEventListener("resize", handleResize);
      triggers.delete(api);
    },
    refresh() {
      bounds = computeBounds(el);
      update();
    },
  };

  triggers.add(api);
  return api;
};

const refresh = () => triggers.forEach((trigger) => trigger.refresh());

const killAll = () => {
  Array.from(triggers).forEach((trigger) => trigger.kill());
  triggers.clear();
};

const register = (gsap) => {
  registeredGsap = gsap;
  if (registeredGsap) {
    registeredGsap.ScrollTrigger = api;
  }
};

const api = { create, refresh, killAll, register };

export { api as default, create, refresh, killAll, register };
