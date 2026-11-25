"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { BookOpen } from "lucide-react";

interface BookOpeningCoverProps {
  title: string;
  author: string;
  coverImageUrl: string;
  excerpt?: string;
  format?: string;
  className?: string;
}

export function BookOpeningCover({
  title,
  author,
  coverImageUrl,
  excerpt,
  format,
  className = "",
}: BookOpeningCoverProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const frontCoverRef = useRef<HTMLDivElement>(null);
  const midPageRef = useRef<HTMLDivElement>(null);
  const innerPageRef = useRef<HTMLDivElement>(null);
  const sheenRef = useRef<HTMLDivElement>(null);
  const spineShadowRef = useRef<HTMLDivElement>(null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const stage = stageRef.current;
    const front = frontCoverRef.current;
    const mid = midPageRef.current;
    const inner = innerPageRef.current;
    const sheen = sheenRef.current;
    const shadow = spineShadowRef.current;
    if (!stage || !front || !mid || !inner) return;

    const mm = gsap.matchMedia();
    let cleanup: (() => void) | undefined;

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const openBook = () => {
        gsap.killTweensOf([front, mid, inner, sheen, shadow]);
        gsap.to(front, {
          rotateY: -66,
          z: 10,
          duration: 0.55,
          ease: "power3.out",
        });
        gsap.to(mid, {
          rotateY: -26,
          duration: 0.58,
          delay: 0.04,
          ease: "power3.out",
        });
        gsap.to(inner, {
          scale: 1,
          opacity: 1,
          duration: 0.45,
          ease: "power2.out",
        });
        if (sheen) {
          gsap.fromTo(
            sheen,
            { xPercent: -120, opacity: 0 },
            { xPercent: 140, opacity: 0.5, duration: 0.65, ease: "power2.out" }
          );
        }
        if (shadow) {
          gsap.to(shadow, {
            opacity: 0.85,
            duration: 0.45,
            ease: "power2.out",
          });
        }
      };

      const closeBook = () => {
        gsap.killTweensOf([front, mid, inner, sheen, shadow]);
        gsap.to(front, {
          rotateY: 0,
          z: 0,
          duration: 0.45,
          ease: "power2.inOut",
        });
        gsap.to(mid, {
          rotateY: 0,
          duration: 0.4,
          ease: "power2.inOut",
        });
        gsap.to(inner, {
          scale: 0.98,
          opacity: 0.85,
          duration: 0.35,
          ease: "power2.inOut",
        });
        if (shadow) {
          gsap.to(shadow, {
            opacity: 0,
            duration: 0.35,
            ease: "power2.inOut",
          });
        }
      };

      stage.addEventListener("pointerenter", openBook);
      stage.addEventListener("pointerleave", closeBook);

      cleanup = () => {
        stage.removeEventListener("pointerenter", openBook);
        stage.removeEventListener("pointerleave", closeBook);
      };
    });

    return () => {
      cleanup?.();
      mm.revert();
    };
  }, []);

  const previewText =
    excerpt && excerpt.trim().length > 0
      ? excerpt.trim()
      : `${title} by ${author}. Open to explore full edition details and reader reviews.`;

  return (
    <div
      ref={stageRef}
      className={`relative h-full w-full p-3.5 ${className}`}
      style={{ perspective: "1300px" }}
    >
      {/* Book Body Container */}
      <div
        className="relative h-full w-full"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Layer 1: Inner Printed Right Page (revealed when front cover swings open) */}
        <div
          ref={innerPageRef}
          className="absolute inset-0 flex flex-col justify-between overflow-hidden rounded-r-xl rounded-l-sm border border-[#e2d9c8] bg-[#fcf8ef] p-4 text-[#1c1917] shadow-inner dark:border-white/15 dark:bg-[#171b2b] dark:text-[#f1f5f9]"
          style={{ transform: "scale(0.98)" }}
        >
          {/* Spine Crease Shadow */}
          <div
            ref={spineShadowRef}
            className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-black/30 via-black/10 to-transparent opacity-0"
          />

          <div className="relative z-10 pl-3">
            <div className="flex items-center justify-between border-b border-current/10 pb-2">
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--accent)]">
                Inside Preview
              </span>
              {format && (
                <span className="text-[9px] font-medium uppercase tracking-wider opacity-60">
                  {format}
                </span>
              )}
            </div>

            <h4 className="font-editorial mt-2.5 line-clamp-2 text-sm font-semibold leading-snug">
              {title}
            </h4>
            <p className="mt-0.5 text-[10px] opacity-65">{author}</p>

            <p className="font-editorial mt-3 line-clamp-6 text-[11px] leading-relaxed opacity-85">
              {previewText}
            </p>
          </div>

          <div className="relative z-10 flex items-center justify-between border-t border-current/10 pt-2 pl-3 text-[10px] font-semibold text-[var(--accent)]">
            <span className="inline-flex items-center gap-1">
              <BookOpen className="h-3 w-3" /> Read Edition
            </span>
            <span>&rarr;</span>
          </div>
        </div>

        {/* Layer 2: Middle Fanned Page */}
        <div
          ref={midPageRef}
          className="pointer-events-none absolute inset-0 rounded-r-xl rounded-l-sm border border-[#dfd5c3] bg-[#f4efe3] shadow-md will-change-transform dark:border-white/10 dark:bg-[#1f2438]"
          style={{
            transformOrigin: "left center",
            transformStyle: "preserve-3d",
          }}
        />

        {/* Layer 3: Front Cover Flap (hinged on left spine) */}
        <div
          ref={frontCoverRef}
          className="absolute inset-0 overflow-hidden rounded-r-xl rounded-l-sm bg-[var(--surface-subtle)] shadow-xl will-change-transform"
          style={{
            transformOrigin: "left center",
            transformStyle: "preserve-3d",
          }}
        >
          {!imgError ? (
            <img
              src={coverImageUrl}
              alt={title}
              onError={() => setImgError(true)}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center bg-[var(--surface-subtle)] p-4 text-center">
              <span className="font-editorial text-lg font-semibold text-[var(--text-primary)]">
                {title}
              </span>
              <span className="mt-1 text-xs text-[var(--text-muted)]">
                {author}
              </span>
            </div>
          )}

          {/* Realistic Book Spine Crease & Edge Highlight */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-black/45 via-white/15 to-transparent" />
          <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/15" />

          {/* Specular Sheen on Open */}
          <div
            ref={sheenRef}
            className="pointer-events-none absolute inset-y-0 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/35 to-transparent opacity-0"
          />
        </div>
      </div>
    </div>
  );
}
