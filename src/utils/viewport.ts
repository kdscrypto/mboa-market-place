export const setViewportUnit = () => {
  try {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  } catch (e) {
    // no-op in non-browser environments
  }
};

export const initViewportUnit = () => {
  setViewportUnit();
  const handler = () => setViewportUnit();
  window.addEventListener('resize', handler);
  window.addEventListener('orientationchange', handler);
  document.addEventListener('visibilitychange', handler);
  return () => {
    window.removeEventListener('resize', handler);
    window.removeEventListener('orientationchange', handler);
    document.removeEventListener('visibilitychange', handler);
  };
};
