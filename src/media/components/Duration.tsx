"use client";

import { useMedia } from "../hooks/useMedia";
import { formatTime } from "../utils";

export default function Duration() {
  const { currentTime, duration, showRemainingTime, toggleShowRemainingTime } = useMedia();

  return (
    <span
      className="w-12 text-center shrink-0 cursor-pointer pointer-events-auto"
      onClick={toggleShowRemainingTime}
    >
      {showRemainingTime ? `-${formatTime(duration - currentTime)}` : formatTime(duration)}
    </span>
  );
}
