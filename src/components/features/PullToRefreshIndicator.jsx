"use client";

import { ArrowsClockwiseIcon } from "@phosphor-icons/react";

export default function PullToRefreshIndicator({ progress, pulling, refreshing }) {
  const offset = refreshing ? 60 : progress > 0 ? progress / 1.5 : -60;
  const opacity = refreshing ? 1 : progress > 0 ? Math.min(progress / 60, 1) : 0;

  return (
    <div
      className="fixed top-0 left-0 w-full flex justify-center pointer-events-none z-100 sm:hidden"
      style={{
        transform: `translateY(${offset}px)`,
        opacity,
        transition: pulling ? "none" : "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      <div className="bg-secondary text-foreground p-2.5 rounded-full shadow-[0_4px_20px_rgb(0,0,0,0.15)] border border-border flex items-center justify-center">
        <ArrowsClockwiseIcon
          size={22}
          weight="bold"
          className={refreshing ? "animate-spin" : ""}
          style={{
            transform: !refreshing ? `rotate(${progress * 3}deg)` : "none",
          }}
        />
      </div>
    </div>
  );
}
