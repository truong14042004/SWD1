import gsap from 'gsap';

/**
 * GSAP Animation Presets for DenimFlow BO
 * Modern, snappy, high-performance UI motion
 */

export const animateFadeIn = (element: HTMLElement | null, delay: number = 0) => {
  if (!element) return;
  gsap.fromTo(
    element,
    { opacity: 0, y: 12 },
    { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out', delay }
  );
};

export const animateStaggerCards = (container: HTMLElement | null, cardSelector: string = '.stagger-card') => {
  if (!container) return;
  const cards = container.querySelectorAll(cardSelector);
  if (cards.length === 0) return;

  gsap.fromTo(
    cards,
    { opacity: 0, y: 16 },
    {
      opacity: 1,
      y: 0,
      duration: 0.4,
      stagger: 0.05,
      ease: 'power2.out',
      clearProps: 'transform',
    }
  );
};

export const animateModalEnter = (modalContent: HTMLElement | null) => {
  if (!modalContent) return;
  gsap.fromTo(
    modalContent,
    { opacity: 0, scale: 0.96, y: 8 },
    { opacity: 1, scale: 1, y: 0, duration: 0.25, ease: 'back.out(1.4)' }
  );
};

export const animateKpiCounter = (targetElement: HTMLElement | null, targetValue: number) => {
  if (!targetElement) return;
  const obj = { val: 0 };
  gsap.to(obj, {
    val: targetValue,
    duration: 0.8,
    ease: 'power3.out',
    onUpdate: () => {
      targetElement.innerText = Math.round(obj.val).toLocaleString();
    },
  });
};
