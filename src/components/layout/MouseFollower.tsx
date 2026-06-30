"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const LERP = 0.11;

export function MouseFollower() {
  const pathname = usePathname();
  const glowRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });
  const raf = useRef<number | undefined>(undefined);
  const [active, setActive] = useState(false);

  const hidden =
    pathname.includes("/laporan") || pathname.includes("/maklum-balas");

  useEffect(() => {
    if (hidden) {
      setActive(false);
      return;
    }

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (reduced || coarse) return;

    setActive(true);
    target.current = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    };
    pos.current = { ...target.current };

    const onMove = (e: MouseEvent) => {
      target.current = { x: e.clientX, y: e.clientY };
    };

    const onLeave = () => {
      if (glowRef.current) glowRef.current.style.opacity = "0";
      if (dotRef.current) dotRef.current.style.opacity = "0";
    };

    const onEnter = () => {
      if (glowRef.current) glowRef.current.style.opacity = "1";
      if (dotRef.current) dotRef.current.style.opacity = "1";
    };

    const tick = () => {
      pos.current.x += (target.current.x - pos.current.x) * LERP;
      pos.current.y += (target.current.y - pos.current.y) * LERP;
      const transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0)`;
      if (glowRef.current) glowRef.current.style.transform = transform;
      if (dotRef.current) dotRef.current.style.transform = transform;
      raf.current = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    document.documentElement.addEventListener("mouseenter", onEnter);
    raf.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      document.documentElement.removeEventListener("mouseenter", onEnter);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [hidden]);

  if (hidden || !active) return null;

  return (
    <div className="mouse-follower no-print" aria-hidden>
      <div ref={glowRef} className="mouse-follower-glow" />
      <div ref={dotRef} className="mouse-follower-dot" />
    </div>
  );
}