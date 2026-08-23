"use client";

import type { HTMLAttributes } from "react";

export type MediaControlsProps = HTMLAttributes<HTMLDivElement>;

export default function MediaControls({ className = "", children, ...props }: MediaControlsProps) {
  return (
    <div
      className={`absolute inset-0 flex flex-col text-white p-4 sm:p-6 bg-black/50 transition-opacity hover:bg-black/70 pointer-events-none ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
