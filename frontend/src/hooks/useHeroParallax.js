import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function useHeroParallax() {
  const scope = useRef(null);

  useLayoutEffect(() => {
    if (!scope.current) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      // Subtle parallax for hero content
      gsap.to("[data-parallax]", {
        y: (i, el) => {
          return ScrollTrigger.create({
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          }).progress * 30;
        },
        ease: "none",
      });
    }, scope);

    return () => ctx.revert();
  }, []);

  return scope;
}

