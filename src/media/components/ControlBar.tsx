"use client";

import type { HTMLAttributes } from "react";

export type MediaControlBarProps = HTMLAttributes<HTMLDivElement>;

export default function ControlBar({ className = "", children, ...props }: MediaControlBarProps) {
  return (
    <div
      className={`mt-auto flex sm:flex-row items-center gap-0.5 lg:gap-5 text-xs sm:text-sm w-full sm:w-[90%] md:w-[90%] mx-auto rounded-lg pointer-events-auto ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
