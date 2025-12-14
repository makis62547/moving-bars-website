const isNumber = (value) => typeof value === "number" && Number.isFinite(value);

const normalizeVars = (vars = {}) => ({
  yPercent: isNumber(vars.yPercent) ? vars.yPercent : 0,
  scale: isNumber(vars.scale) ? vars.scale : 1,
});

const applyTransform = (target, values) => {
  const { yPercent, scale } = normalizeVars(values);
  target.style.transform = `translate3d(0, ${yPercent}%, 0) scale(${scale})`;
  target.style.willChange = target.style.willChange || "transform";
};

const buildTween = (target, fromVars, toVars, ScrollTrigger) => {
  const start = normalizeVars(fromVars);
  const end = normalizeVars(toVars);
  const update = (progress = 0) => {
    const yPercent = start.yPercent + (end.yPercent - start.yPercent) * progress;
    const scale = start.scale + (end.scale - start.scale) * progress;
    applyTransform(target, { yPercent, scale });
  };

  update(0);

  if (!toVars.scrollTrigger || !ScrollTrigger || typeof ScrollTrigger.create !== "function") {
    return { kill: () => {}, scrollTrigger: null };
  }

  const trigger = ScrollTrigger.create({ ...toVars.scrollTrigger, target, onUpdate: update });

  return {
    scrollTrigger: trigger,
    kill: () => {
      trigger?.kill?.();
    },
  };
};

const gsap = {
  registerPlugin(plugin) {
    plugin?.register?.(gsap);
  },
  fromTo(target, fromVars, toVars) {
    if (!target) return { kill: () => {} };
    return buildTween(target, fromVars, toVars, gsap.ScrollTrigger);
  },
  set(target, vars) {
    if (target) applyTransform(target, vars);
  },
};

export { gsap };
export default gsap;
