"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";

export function HeroEntrance({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const targets = el.querySelectorAll(".hero-reveal");
      if (targets.length === 0) return;
      gsap.fromTo(
        targets,
        { opacity: 0, y: 26, filter: "blur(6px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.75,
          stagger: 0.09,
          ease: "expo.out",
          clearProps: "transform,filter",
        }
      );
    });

    return () => mm.revert();
  }, []);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}

export function StaggerGrid({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;

    const mm = gsap.matchMedia();
    let observer: IntersectionObserver | null = null;

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const cards = el.querySelectorAll(".stagger-card");
      if (cards.length === 0) return;

      gsap.set(cards, { opacity: 0, y: 22, scale: 0.96 });

      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              gsap.to(cards, {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.5,
                stagger: { each: 0.055, from: "start", grid: "auto" },
                ease: "back.out(1.25)",
                clearProps: "transform",
              });
              observer?.disconnect();
              break;
            }
          }
        },
        { threshold: 0.08 }
      );
      observer.observe(el);
    });

    return () => {
      observer?.disconnect();
      mm.revert();
    };
  }, []);

  return (
    <div ref={gridRef} className={className}>
      {children}
    </div>
  );
}

export function TiltShowcase({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const mm = gsap.matchMedia();
    let cleanup: (() => void) | undefined;

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const rx = gsap.quickTo(el, "rotateX", { duration: 0.35, ease: "power2.out" });
      const ry = gsap.quickTo(el, "rotateY", { duration: 0.35, ease: "power2.out" });
      const ty = gsap.quickTo(el, "y", { duration: 0.35, ease: "power2.out" });

      const onMove = (e: PointerEvent) => {
        const rect = el.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        ry(px * 12);
        rx(-py * 12);
        ty(-6);
      };

      const onLeave = () => {
        rx(0);
        ry(0);
        ty(0);
      };

      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerleave", onLeave);
      cleanup = () => {
        el.removeEventListener("pointermove", onMove);
        el.removeEventListener("pointerleave", onLeave);
      };
    });

    return () => {
      cleanup?.();
      mm.revert();
    };
  }, []);

  return (
    <div style={{ perspective: "1100px" }}>
      <div
        ref={cardRef}
        className={`will-change-transform ${className}`}
        style={{ transformStyle: "preserve-3d" }}
      >
        {children}
      </div>
    </div>
  );
}

export function AnimatedNumber({
  value,
  prefix = "",
  suffix = "",
}: {
  value: number;
  prefix?: string;
  suffix?: string;
}) {
  const spanRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = spanRef.current;
    if (!el) return;
    const obj = { current: 0 };
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.to(obj, {
        current: value,
        duration: 0.9,
        ease: "power2.out",
        onUpdate: () => {
          el.textContent = `${prefix}${Math.round(obj.current).toLocaleString("en-IN")}${suffix}`;
        },
      });
    });
    return () => mm.revert();
  }, [value, prefix, suffix]);

  return (
    <span ref={spanRef}>
      {prefix}
      {value.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}
