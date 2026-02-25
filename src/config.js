const PREFERS_REDUCED_MOTION = (() =>
{
    const prefersReducedMotionMediaQuery = window.matchMedia('(prefers-reduced-motion)');
    prefersReducedMotionMediaQuery.addEventListener('change', () => { window.location.reload() });
    return prefersReducedMotionMediaQuery.matches;
})()

const ENV = Object.freeze(
{
    PREFERS_REDUCED_MOTION
})

export { ENV }