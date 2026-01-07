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

      // Rotate iPhone during scroll
      const phoneGroup = scope.current.querySelector("[data-phone-3d]");
      if (phoneGroup) {
        gsap.to(phoneGroup, {
          rotationY: 15,
          rotationX: -5,
          scrollTrigger: {
            trigger: scope.current,
            start: "top top",
            end: "+=100vh",
            scrub: 1,
          },
        });
      }

      // Animate value props in
      gsap.from("[data-value-prop]", {
        opacity: 0,
        y: 20,
        duration: 0.6,
        stagger: 0.1,
        scrollTrigger: {
          trigger: scope.current,
          start: "top 60%",
        },
      });

      // Screen swap animation (PDF → Scandish)
      const screenSwap = gsap.timeline({
        scrollTrigger: {
          trigger: scope.current,
          start: "top top",
          end: "+=100vh",
          scrub: 1,
        },
      });

      screenSwap
        .to("[data-pdf-screen]", { opacity: 0, scale: 0.9 }, 0.3)
        .to("[data-scandish-screen]", { opacity: 1, scale: 1 }, 0.3);

      // CTA pulse at end
      gsap.to("[data-cta-pulse]", {
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
    }, scope);

    return () => ctx.revert();
  }, []);

  return scope;
}

