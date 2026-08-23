"use client";

import { AiOutlineFullscreen } from "react-icons/ai";
import { useMedia } from "../hooks/useMedia";

export default function Fullscreen() {
  const { toggleFullscreen } = useMedia();

  return (
    <div
      className="p-2 hover:bg-neutral-600 rounded transition-colors text-base sm:text-lg pointer-events-auto cursor-pointer"
      onClick={toggleFullscreen}
    >
      <AiOutlineFullscreen />
    </div>
  );
}
