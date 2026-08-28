"use client";

import { useEffect, useRef, useState, type VideoHTMLAttributes } from "react";
import { FaForward, FaBackward } from "react-icons/fa";
import { useMedia } from "../hooks/useMedia";

const CLICK_DELAY = 250;
const SEEK_SECONDS = 10;
const SEEK_FLASH_VISIBLE_MS = 400;
const SEEK_FLASH_FADE_MS = 500;

type SeekFlash = { direction: "forward" | "backward"; key: number };

export interface VideoProps extends Omit<VideoHTMLAttributes<HTMLVideoElement>, "src"> {
  src: string;
}

export default function Video({ src, className = "", preload = "auto", ...props }: VideoProps) {
  const { attachMedia, togglePlay, seekBy } = useMedia();
  const elementRef = useRef<HTMLVideoElement | null>(null);
  const clickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seekFlashKeyRef = useRef(0);
  const [seekFlash, setSeekFlash] = useState<SeekFlash | null>(null);
  const [seekFlashVisible, setSeekFlashVisible] = useState(false);

  useEffect(() => {
    attachMedia(elementRef.current, src, true);
    return () => attachMedia(null, "", false);
  }, [attachMedia, src]);

  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (!seekFlash) return;

    setSeekFlashVisible(true);
    const fadeTimer = setTimeout(() => setSeekFlashVisible(false), SEEK_FLASH_VISIBLE_MS);
    const removeTimer = setTimeout(
      () => setSeekFlash(null),
      SEEK_FLASH_VISIBLE_MS + SEEK_FLASH_FADE_MS
    );

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, [seekFlash]);

  const triggerSeekFlash = (direction: "forward" | "backward") => {
    seekFlashKeyRef.current += 1;
    setSeekFlash({ direction, key: seekFlashKeyRef.current });
  };

  const handleClick = () => {
    if (clickTimeoutRef.current) return;
    clickTimeoutRef.current = setTimeout(() => {
      clickTimeoutRef.current = null;
      togglePlay();
    }, CLICK_DELAY);
  };

  const handleDoubleClick = (e: React.MouseEvent<HTMLVideoElement>) => {
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const isRightSide = e.clientX - rect.left > rect.width / 2;
    seekBy(isRightSide ? SEEK_SECONDS : -SEEK_SECONDS);
    triggerSeekFlash(isRightSide ? "forward" : "backward");
  };

  return (
    <>
      <video
        ref={elementRef}
        src={src}
        preload={preload}
        className={`w-full h-full aspect-video object-cover ${className}`}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        // Browser extensions (ad blockers, download helpers, etc.) commonly
        // inject attributes onto <video> elements before React hydrates,
        // which otherwise trips a false-positive hydration mismatch warning.
        suppressHydrationWarning
        {...props}
      />

      {seekFlash && (
        <div
          key={seekFlash.key}
          className={`absolute inset-y-0 ${
            seekFlash.direction === "forward" ? "right-0" : "left-0"
          } w-1/2 flex items-center justify-center pointer-events-none z-20`}
        >
          <div
            className={`flex flex-col items-center gap-1 rounded-full bg-black/70 text-white px-5 py-4 transition-opacity duration-500 ease-out ${
              seekFlashVisible ? "opacity-100" : "opacity-0"
            }`}
          >
            {seekFlash.direction === "forward" ? (
              <FaForward className="text-xl" />
            ) : (
              <FaBackward className="text-xl" />
            )}
            <span className="text-sm font-semibold whitespace-nowrap">
              {seekFlash.direction === "forward"
                ? `+${SEEK_SECONDS} seconds`
                : `-${SEEK_SECONDS} seconds`}
            </span>
          </div>
        </div>
      )}
    </>
  );
}
