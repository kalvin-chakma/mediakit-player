"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import * as Slider from "@radix-ui/react-slider";
import { useMedia } from "../hooks/useMedia";
import { formatTime } from "../utils";

const PREVIEW_WIDTH = 160;
const PREVIEW_HEIGHT = 90;

export default function SeekBar() {
  const { currentTime, duration, seekTo, src, isVideo } = useMedia();
  const playBarRef = useRef<HTMLDivElement | null>(null);
  const previewVideoRef = useRef<HTMLVideoElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const pendingPreviewTimeRef = useRef<number | null>(null);
  const isSeekingPreviewRef = useRef(false);

  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverX, setHoverX] = useState(0);
  const [barWidth, setBarWidth] = useState(0);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  useEffect(() => {
    const previewVideo = previewVideoRef.current;
    if (!previewVideo) return;

    const drawPreviewFrame = () => {
      const canvas = previewCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(previewVideo, 0, 0, canvas.width, canvas.height);
    };

    const handleSeeked = () => {
      drawPreviewFrame();
      isSeekingPreviewRef.current = false;

      if (pendingPreviewTimeRef.current !== null) {
        const nextTime = pendingPreviewTimeRef.current;
        pendingPreviewTimeRef.current = null;
        isSeekingPreviewRef.current = true;
        previewVideo.currentTime = nextTime;
      }
    };

    previewVideo.addEventListener("seeked", handleSeeked);
    return () => previewVideo.removeEventListener("seeked", handleSeeked);
  }, []);

  useEffect(() => {
    const previewVideo = previewVideoRef.current;
    if (!previewVideo || hoverTime === null) return;

    if (isSeekingPreviewRef.current) {
      pendingPreviewTimeRef.current = hoverTime;
    } else {
      isSeekingPreviewRef.current = true;
      previewVideo.currentTime = hoverTime;
    }
  }, [hoverTime]);

  const updateHoverTimeByPointer = (e: ReactPointerEvent<HTMLDivElement>) => {
    const bar = playBarRef.current;
    if (!bar || duration <= 0) return;

    const rect = bar.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = Math.min(Math.max(x / rect.width, 0), 1);

    setHoverX(x);
    setBarWidth(rect.width);
    setHoverTime(percent * duration);
  };

  const handleSliderChange = (value: number[]) => {
    if (duration <= 0) return;
    seekTo((value[0] / 100) * duration);
  };

  return (
    <div className="relative flex-1">
      <Slider.Root
        ref={playBarRef}
        className="relative flex items-center select-none touch-none w-full h-4"
        value={[progress]}
        onValueChange={handleSliderChange}
        onPointerEnter={updateHoverTimeByPointer}
        onPointerMove={updateHoverTimeByPointer}
        onPointerLeave={() => setHoverTime(null)}
        max={100}
        step={0.1}
      >
        <Slider.Track className="relative w-full h-1 bg-gray-600 rounded-full">
          <Slider.Range className="absolute h-full bg-white rounded-full" />
        </Slider.Track>
        <Slider.Thumb
          className="block size-1 bg-white rounded-full shadow hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-white"
          aria-label="Seek time"
        />
      </Slider.Root>

      {isVideo && (
        <video
          ref={previewVideoRef}
          src={src}
          muted
          preload="auto"
          className="hidden"
          aria-hidden="true"
          tabIndex={-1}
        />
      )}

      {hoverTime !== null && (
        <div
          className="absolute bottom-6 pointer-events-none"
          style={{
            left:
              barWidth > 0
                ? Math.min(Math.max(hoverX, PREVIEW_WIDTH / 2), barWidth - PREVIEW_WIDTH / 2)
                : hoverX,
            transform: "translateX(-50%)",
          }}
        >
          {isVideo ? (
            <div
              className="relative rounded overflow-hidden border border-white/20 bg-black shadow-lg"
              style={{ width: PREVIEW_WIDTH, height: PREVIEW_HEIGHT }}
            >
              <canvas
                ref={previewCanvasRef}
                width={PREVIEW_WIDTH}
                height={PREVIEW_HEIGHT}
                className="block w-full h-full"
              />
              <span className="absolute bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded text-[10px] bg-black/80 text-white whitespace-nowrap">
                {formatTime(hoverTime)}
              </span>
            </div>
          ) : (
            <div className="px-2 py-1 rounded text-xs bg-black text-white whitespace-nowrap">
              {formatTime(hoverTime)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
