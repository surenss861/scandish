import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function useHeroPin() {
  const scope = useRef(null);

  useLayoutEffect(() => {
    if (!scope.current) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      // Pin hero for ~1 viewport height
      ScrollTrigger.create({
        trigger: scope.current,
        start: "top top",
        end: "+=100vh",
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
      });

      // Animate value props in
      const valueProps = scope.current.querySelectorAll("[data-value-prop]");
      if (valueProps.length > 0) {
        gsap.from(valueProps, {
          opacity: 0,
          y: 20,
          duration: 0.6,
          stagger: 0.1,
          scrollTrigger: {
            trigger: scope.current,
            start: "top 60%",
          },
        });
      }

      // CTA pulse at end of pin
      const ctaPulse = scope.current.querySelector("[data-cta-pulse]");
      if (ctaPulse) {
        gsap.to(ctaPulse, {
          scale: 1.05,
          repeat: -1,
          yoyo: true,
          duration: 2,
          ease: "power2.inOut",
          scrollTrigger: {
            trigger: scope.current,
            start: "bottom top",
            end: "bottom center",
            toggleActions: "play none none reverse",
          },
        });
      }
    }, scope);

    return () => ctx.revert();
  }, []);

  return scope;
}
