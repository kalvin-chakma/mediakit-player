"use client";

import type { HTMLAttributes } from "react";

export type MediaTimeGroupProps = HTMLAttributes<HTMLDivElement>;

export default function TimeGroup({ className = "", children, ...props }: MediaTimeGroupProps) {
  return (
    <div
      className={`flex items-center w-full gap-0.5 lg:gap-2 pointer-events-auto cursor-pointer ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
