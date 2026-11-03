export interface Motion {
  play(element: Element, frames: Keyframe[], duration?: number): void;
  observe(): void;
  scrollBehavior(): ScrollBehavior;
}

const DEFAULT_DURATION_MS = 180;
const REVEAL_DURATION_MS = 240;
const REVEAL_THRESHOLD = 0.12;

// Small animations that respect prefers-reduced-motion.
export function createMotion(): Motion {
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const active = new Set<Animation>();
  const play = (
    element: Element,
    frames: Keyframe[],
    duration = DEFAULT_DURATION_MS,
  ) => {
    if (preference.matches || !('animate' in element)) return;
    const animation = element.animate(frames, { duration, easing: 'ease-out' });
    active.add(animation);
    animation.finished.catch(() => {}).finally(() => active.delete(animation));
  };
  preference.addEventListener('change', () => {
    if (preference.matches) {
      active.forEach((animation) => animation.cancel());
      active.clear();
    }
  });
  const observe = () => {
    if (!('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          play(
            entry.target,
            [
              { opacity: 0.6, transform: 'translateY(10px)' },
              { opacity: 1, transform: 'translateY(0)' },
            ],
            REVEAL_DURATION_MS,
          );
          observer.unobserve(entry.target);
        }),
      { threshold: REVEAL_THRESHOLD },
    );
    document
      .querySelectorAll('.section-heading, .customization, .about')
      .forEach((element) => observer.observe(element));
  };
  return {
    play,
    observe,
    scrollBehavior: () => (preference.matches ? 'instant' : 'smooth'),
  };
}
