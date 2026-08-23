"use client";

import type { HTMLAttributes } from "react";

export type MediaGroupProps = HTMLAttributes<HTMLDivElement>;

export default function Group({ className = "", children, ...props }: MediaGroupProps) {
  return (
    <div className={`flex items-center gap-0.5 lg:gap-2 pointer-events-auto ${className}`} {...props}>
      {children}
    </div>
  );
}
