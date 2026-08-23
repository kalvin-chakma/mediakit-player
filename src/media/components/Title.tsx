"use client";

import type { ReactNode } from "react";

export interface MediaTitleProps {
  children: ReactNode;
}

export default function Title({ children }: MediaTitleProps) {
  return (
    <div className="flex flex-wrap justify-between items-center text-xs sm:text-sm gap-2">
      <span className="font-semibold">{children}</span>
    </div>
  );
}
