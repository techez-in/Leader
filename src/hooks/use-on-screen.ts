
"use client";

import { useState, useEffect, type RefObject } from 'react';

export function useOnScreen(ref: RefObject<Element>, rootMargin: string = '0px'): boolean {
  const [isIntersecting, setIntersecting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Update our state when observer callback fires
        if (entry.isIntersecting) {
            setIntersecting(true);
            // We can unobserve after it has been seen once
            observer.unobserve(entry.target);
        }
      },
      {
        rootMargin,
      }
    );
    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [ref, rootMargin]);

  return isIntersecting;
}
