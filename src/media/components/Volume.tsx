"use client";

import { FaVolumeUp, FaVolumeMute } from "react-icons/fa";
import * as Slider from "@radix-ui/react-slider";
import { useMedia } from "../hooks/useMedia";

export default function Volume() {
  const { volume, isMuted, setVolume, toggleMute } = useMedia();
  const displayVolume = isMuted ? 0 : volume * 100;

  return (
    <div className="flex items-center space-x-2 w-10 sm:w-22 md:w-28 h-4 pointer-events-auto">
      <div className="text-white text-sm sm:text-xs cursor-pointer" onClick={toggleMute}>
        {isMuted || displayVolume === 0 ? <FaVolumeMute /> : <FaVolumeUp />}
      </div>
      <Slider.Root
        className="relative flex items-center select-none touch-none w-full h-4 cursor-pointer"
        value={[displayVolume]}
        onValueChange={(value) => setVolume(value[0] / 100)}
        max={100}
        step={1}
        aria-label="Volume"
      >
        <Slider.Track className="relative w-full h-1 rounded-full bg-gray-400">
          <Slider.Range className="absolute h-full bg-white rounded-full" />
        </Slider.Track>
        <Slider.Thumb className="block w-1 h-1 bg-white rounded-full shadow hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-white" />
      </Slider.Root>
    </div>
  );
}
