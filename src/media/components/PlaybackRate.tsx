"use client";

import { useEffect, useState } from "react";
import { SiXstate } from "react-icons/si";
import { useMedia } from "../hooks/useMedia";

const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

export default function PlaybackRate() {
  const { playbackRate, setPlaybackRate } = useMedia();
  const [showSpeedOptions, setShowSpeedOptions] = useState(false);

  const toggleOptions = () => setShowSpeedOptions((prev) => !prev);

  const changePlaybackRate = (rate: number) => {
    setPlaybackRate(rate);
    setShowSpeedOptions(false);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".playback-rate-selector")) {
        setShowSpeedOptions(false);
      }
    };

    if (showSpeedOptions) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSpeedOptions]);

  return (
    <div className="relative playback-rate-selector pointer-events-auto group">
      <div
        className="p-2 hover:bg-neutral-600 rounded transition-colors text-xs sm:text-xs pointer-events-auto flex items-center cursor-pointer"
        onClick={toggleOptions}
      >
        <span>{playbackRate}</span>
        <SiXstate className="p-0.5 -ml-0.5" />
      </div>

      {showSpeedOptions && (
        <div className="absolute bottom-full bg-neutral-800 text-white rounded shadow-md overflow-hidden z-50">
          {PLAYBACK_RATES.map((rate) => (
            <div
              key={rate}
              className={`px-2 py-1 text-sm cursor-pointer hover:bg-neutral-600 ${
                rate === playbackRate ? "bg-neutral-700 font-semibold" : ""
              }`}
              onClick={() => changePlaybackRate(rate)}
            >
              {rate}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
