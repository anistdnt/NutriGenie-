"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/src/lib/utils";

type RevealVariant = "up" | "left" | "right" | "zoom";

type ScrollRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  threshold?: number;
  variant?: RevealVariant;
};

export default function ScrollReveal({
  children,
  className,
  delay = 0,
  threshold = 0.2,
  variant = "up",
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [canObserve, setCanObserve] = useState(false);
  const effectiveDelay = delay + 120;

  useEffect(() => {
    const timer = window.setTimeout(() => setCanObserve(true), 180);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!canObserve) return;

    const element = ref.current;
    if (!element) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold,
        rootMargin: "0px 0px -6% 0px",
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [canObserve, threshold]);

  return (
    <div
      ref={ref}
      data-visible={isVisible}
      className={cn("scroll-reveal", `scroll-reveal--${variant}`, className)}
      style={{ transitionDelay: `${effectiveDelay}ms` }}
    >
      {children}
    </div>
  );
}
