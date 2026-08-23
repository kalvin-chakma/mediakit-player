"use client";

import { FaClosedCaptioning } from "react-icons/fa";

export default function Captions() {
  return (
    <div className="p-2 hover:bg-neutral-600 rounded transition-colors text-sm sm:text-base pointer-events-auto cursor-pointer">
      <FaClosedCaptioning />
    </div>
  );
}
