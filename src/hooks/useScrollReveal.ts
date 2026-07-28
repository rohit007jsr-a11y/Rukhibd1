import { useEffect } from 'react';

export function useScrollReveal(dependency?: any) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('opacity-100', 'translate-y-0');
            entry.target.classList.remove('opacity-0', 'translate-y-6');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: '0px 0px 50px 0px' }
    );

    const elements = document.querySelectorAll('.scroll-reveal');
    elements.forEach((el) => observer.observe(el));

    // Fallback: Reveal all elements after 1.5s in case observer didn't trigger
    const timer = setTimeout(() => {
      elements.forEach((el) => {
        el.classList.add('opacity-100', 'translate-y-0');
        el.classList.remove('opacity-0', 'translate-y-6');
      });
    }, 1500);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [dependency]);
}
