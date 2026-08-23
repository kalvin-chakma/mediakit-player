"use client";

import { FaPlay, FaPause } from "react-icons/fa";
import { useMedia } from "../hooks/useMedia";

export default function PlayButton() {
  const { isPlaying, togglePlay } = useMedia();

  return (
    <button
      onClick={togglePlay}
      className="p-2 hover:bg-neutral-600 rounded transition-colors text-xs sm:text-xs cursor-pointer pointer-events-auto"
      aria-label={isPlaying ? "Pause" : "Play"}
    >
      {isPlaying ? <FaPause /> : <FaPlay />}
    </button>
  );
}
