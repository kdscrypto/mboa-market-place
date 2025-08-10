
// Utility to provide a reliable viewport height unit on mobile browsers
// Sets CSS variable --vh to 1% of the current innerHeight and updates it on changes

let rafId: number | null = null;
let timeoutId: number | null = null;

export const setViewportUnit = () => {
  try {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty("--vh", `${vh}px`);
  } catch (e) {
    // noop
  }
};

const scheduleUpdate = () => {
  if (rafId) cancelAnimationFrame(rafId);
  if (timeoutId) clearTimeout(timeoutId);

  // Wait a tick to let browser UI settle (address bar, etc.)
  timeoutId = window.setTimeout(() => {
    rafId = requestAnimationFrame(() => setViewportUnit());
  }, 150);
};

const onVisibilityChange = () => {
  if (document.visibilityState === "visible") scheduleUpdate();
};

export const attachViewportHandlers = () => {
  setViewportUnit();
  window.addEventListener("resize", scheduleUpdate, { passive: true });
  window.addEventListener("orientationchange", scheduleUpdate, { passive: true });
  document.addEventListener("visibilitychange", onVisibilityChange);
};

export const detachViewportHandlers = () => {
  window.removeEventListener("resize", scheduleUpdate as any);
  window.removeEventListener("orientationchange", scheduleUpdate as any);
  document.removeEventListener("visibilitychange", onVisibilityChange);
  if (rafId) cancelAnimationFrame(rafId);
  if (timeoutId) clearTimeout(timeoutId);
};
