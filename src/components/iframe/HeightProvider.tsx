"use client";

import { useEffect, useRef } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function HeightProvider({ children, ...props }: any) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const lastHeightRef = useRef(0);
  const rafRef = useRef<ReturnType<typeof requestAnimationFrame> | null>(null);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const postHeight = () => {
      // Cancel pending frame — we only want the latest
      if (rafRef.current) cancelAnimationFrame(rafRef.current);

      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        // getBoundingClientRect().height is the actual rendered height of our
        // wrapper — unaffected by the iframe viewport or any CSS on html/body.
        const height = Math.ceil(el.getBoundingClientRect().height);
        if (height > 0 && height !== lastHeightRef.current) {
          lastHeightRef.current = height;
          parent.postMessage({ type: "resize", height }, "*");
        }
      });
    };

    const resizeObserver = new ResizeObserver(postHeight);
    resizeObserver.observe(el);

    // fire once immediately
    postHeight();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div ref={wrapperRef} {...props}>
      {children}
    </div>
  );
}
