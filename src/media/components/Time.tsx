"use client";

import { useMedia } from "../hooks/useMedia";
import { formatTime } from "../utils";

export default function Time() {
  const { currentTime } = useMedia();
  return <span className="w-12 text-center shrink-0">{formatTime(currentTime)}</span>;
}
