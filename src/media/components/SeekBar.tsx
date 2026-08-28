"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import * as Slider from "@radix-ui/react-slider";
import { useMedia } from "../hooks/useMedia";
import { formatTime } from "../utils";

const PREVIEW_WIDTH = 160;
const PREVIEW_HEIGHT = 90;
const HOVER_LINE_WIDTH = 2;
const THUMBNAIL_COUNT = 40;
const THUMBNAIL_STEP_TIMEOUT_MS = 3000;
const THUMBNAIL_JPEG_QUALITY = 0.6;
// Generation is spread across this many hidden video elements seeking in
// parallel (each on its own interleaved slice of the timeline) instead of
// one element walking the whole duration sequentially — the dominant cost is
// waiting on each seek's decode, and that work is independent per position.
const THUMBNAIL_WORKER_COUNT = 4;

interface Thumbnail {
  time: number;
  url: string;
}

export default function SeekBar() {
  const { currentTime, duration, seekTo, src, isVideo, mediaElement } = useMedia();
  const playBarRef = useRef<HTMLDivElement | null>(null);
  const previewPoolRef = useRef<HTMLDivElement | null>(null);
  const hoverRafRef = useRef<number | null>(null);
  const pendingPointerRef = useRef<{ x: number; width: number; time: number } | null>(null);
  const thumbnailGenTokenRef = useRef(0);

  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [displayTime, setDisplayTime] = useState(0);
  const [hoverX, setHoverX] = useState(0);
  const [barWidth, setBarWidth] = useState(0);
  const [bufferedEnd, setBufferedEnd] = useState(0);
  const [thumbnails, setThumbnails] = useState<Thumbnail[]>([]);
  const [hoverThumbUrl, setHoverThumbUrl] = useState<string | null>(null);

  const isHovering = hoverTime !== null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferedProgress = duration > 0 ? (bufferedEnd / duration) * 100 : 0;

  useEffect(() => {
    if (!mediaElement) return;

    const updateBuffered = () => {
      const { buffered, currentTime: time } = mediaElement;
      let end = 0;

      for (let i = 0; i < buffered.length; i++) {
        if (buffered.start(i) <= time && time <= buffered.end(i)) {
          end = buffered.end(i);
          break;
        }
      }
      if (end === 0 && buffered.length > 0) {
        end = buffered.end(buffered.length - 1);
      }

      setBufferedEnd(end);
    };

    updateBuffered();
    mediaElement.addEventListener("progress", updateBuffered);
    mediaElement.addEventListener("timeupdate", updateBuffered);
    return () => {
      mediaElement.removeEventListener("progress", updateBuffered);
      mediaElement.removeEventListener("timeupdate", updateBuffered);
    };
  }, [mediaElement]);

  // Rather than seeking the hidden preview video live on every hover (which
  // requires a real decode per position and can't keep up with the cursor),
  // walk the whole duration once up front and cache a small JPEG per step.
  // Hovering afterwards is just a lookup against this cache — instant, and
  // immune to per-hover seek/decode stalls.
  useEffect(() => {
    if (!isVideo || !Number.isFinite(duration) || duration <= 0) return;
    const pool = previewPoolRef.current;
    if (!pool) return;

    const token = ++thumbnailGenTokenRef.current;
    setThumbnails([]);
    pool.replaceChildren();

    const interval = Math.max(1, duration / THUMBNAIL_COUNT);
    const steps: number[] = [];
    for (let t = 0; t <= duration; t += interval) steps.push(Math.min(t, duration));

    const waitForSeek = (video: HTMLVideoElement, time: number) =>
      new Promise<void>((resolve) => {
        let settled = false;
        const finish = () => {
          if (settled) return;
          settled = true;
          video.removeEventListener("seeked", onSeeked);
          window.clearTimeout(timeoutId);
          resolve();
        };
        const onSeeked = () => finish();
        video.addEventListener("seeked", onSeeked);
        // A single stalled seek (slow/flaky network) shouldn't block every
        // thumbnail after it — skip ahead if this step takes too long.
        const timeoutId = window.setTimeout(finish, THUMBNAIL_STEP_TIMEOUT_MS);
        video.currentTime = time;
      });

    // Each worker gets its own video + canvas and walks an interleaved slice
    // of `steps` (index, index + workerCount, index + 2*workerCount, ...) so
    // results land spread across the whole timeline as generation progresses,
    // rather than finishing the first chunk of the video before starting the
    // next.
    const runWorker = async (workerIndex: number, workerCount: number) => {
      const video = document.createElement("video");
      video.muted = true;
      video.preload = "auto";
      video.crossOrigin = "anonymous";
      video.className = "hidden";
      video.setAttribute("aria-hidden", "true");
      video.tabIndex = -1;
      video.src = src;
      pool.appendChild(video);

      const canvas = document.createElement("canvas");
      canvas.width = PREVIEW_WIDTH;
      canvas.height = PREVIEW_HEIGHT;
      const ctx = canvas.getContext("2d");

      try {
        for (let i = workerIndex; i < steps.length; i += workerCount) {
          if (thumbnailGenTokenRef.current !== token) return;
          const time = steps[i];

          await waitForSeek(video, time);
          if (thumbnailGenTokenRef.current !== token || !ctx) return;

          try {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const url = canvas.toDataURL("image/jpeg", THUMBNAIL_JPEG_QUALITY);
            setThumbnails((prev) => [...prev, { time, url }]);
          } catch {
            // Source lacks CORS headers, so frames can't be read back onto
            // the canvas; give up generating thumbnails for this source.
            return;
          }
        }
      } finally {
        video.remove();
      }
    };

    const workerCount = Math.min(THUMBNAIL_WORKER_COUNT, Math.max(1, steps.length));
    Promise.all(
      Array.from({ length: workerCount }, (_, i) => runWorker(i, workerCount))
    );

    return () => {
      thumbnailGenTokenRef.current += 1;
      pool.replaceChildren();
    };
  }, [isVideo, duration, src]);

  // A thumbnail is only shown if it's actually close enough to represent the
  // hovered position — e.g. while generation is still in progress and hasn't
  // reached that part of the timeline yet, the "nearest" cached frame could
  // be from a wildly different point in the video. Falling back to nothing
  // (a plain black box) is more honest than showing a misleading frame.
  const findNearestThumbnail = (time: number): Thumbnail | null => {
    if (thumbnails.length === 0 || duration <= 0) return null;

    let nearest = thumbnails[0];
    let minDiff = Math.abs(time - nearest.time);
    for (let i = 1; i < thumbnails.length; i++) {
      const diff = Math.abs(time - thumbnails[i].time);
      if (diff < minDiff) {
        minDiff = diff;
        nearest = thumbnails[i];
      }
    }

    const interval = Math.max(1, duration / THUMBNAIL_COUNT);
    const tolerance = interval * 0.6;
    return minDiff <= tolerance ? nearest : null;
  };

  const cancelPendingHoverUpdate = () => {
    if (hoverRafRef.current !== null) {
      cancelAnimationFrame(hoverRafRef.current);
      hoverRafRef.current = null;
    }
  };

  useEffect(() => cancelPendingHoverUpdate, []);

  const updateHoverTimeByPointer = (e: ReactPointerEvent<HTMLDivElement>) => {
    const bar = playBarRef.current;
    if (!bar || duration <= 0) return;

    const rect = bar.getBoundingClientRect();
    const x = Math.min(Math.max(e.clientX - rect.left, 0), rect.width);
    const percent = rect.width > 0 ? x / rect.width : 0;
    const time = percent * duration;

    pendingPointerRef.current = { x, width: rect.width, time };

    if (hoverRafRef.current === null) {
      hoverRafRef.current = requestAnimationFrame(() => {
        hoverRafRef.current = null;
        const pending = pendingPointerRef.current;
        if (!pending) return;

        setHoverX(pending.x);
        setBarWidth(pending.width);
        setHoverTime(pending.time);
        setDisplayTime(pending.time);

        if (isVideo) {
          const nearest = findNearestThumbnail(pending.time);
          setHoverThumbUrl(nearest ? nearest.url : null);
        }
      });
    }
  };

  const handlePointerLeave = () => {
    pendingPointerRef.current = null;
    cancelPendingHoverUpdate();
    setHoverTime(null);
  };

  const handleSliderChange = (value: number[]) => {
    if (duration <= 0) return;
    seekTo((value[0] / 100) * duration);
  };

  return (
    <div className="relative flex-1">
      <Slider.Root
        ref={playBarRef}
        className="relative flex items-center select-none touch-none w-full h-4 cursor-crosshair"
        value={[progress]}
        onValueChange={handleSliderChange}
        onPointerEnter={updateHoverTimeByPointer}
        onPointerMove={updateHoverTimeByPointer}
        onPointerLeave={handlePointerLeave}
        max={100}
        step={0.1}
      >
        <Slider.Track className="relative w-full h-1 bg-gray-600 rounded-full">
          <div
            className="absolute h-full bg-gray-300/50 rounded-full pointer-events-none"
            style={{ width: `${bufferedProgress}%` }}
          />
          <Slider.Range className="absolute h-full bg-white rounded-full" />
        </Slider.Track>
        <Slider.Thumb
          className="block size-1 bg-white rounded-full shadow hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-white"
          aria-label="Seek time"
        />
        <div
          className="absolute top-1/2 w-0.5 h-4 -mt-2 bg-white shadow pointer-events-none z-10 transition-opacity duration-150 ease-out"
          style={{
            left:
              barWidth > 0
                ? Math.min(
                    Math.max(hoverX, HOVER_LINE_WIDTH / 2),
                    barWidth - HOVER_LINE_WIDTH / 2
                  )
                : hoverX,
            transform: "translateX(-50%)",
            opacity: isHovering ? 1 : 0,
          }}
        />
      </Slider.Root>

      {isVideo && <div ref={previewPoolRef} className="hidden" aria-hidden="true" />}

      <div
        className="absolute bottom-6 pointer-events-none transition-opacity duration-150 ease-out"
        style={{
          left:
            barWidth > 0
              ? Math.min(Math.max(hoverX, PREVIEW_WIDTH / 2), barWidth - PREVIEW_WIDTH / 2)
              : hoverX,
          transform: `translateX(-50%) translateY(${isHovering ? 0 : 4}px)`,
          opacity: isHovering ? 1 : 0,
        }}
      >
        {isVideo ? (
          <div
            className="relative rounded overflow-hidden border border-white/20 bg-black shadow-lg"
            style={{ width: PREVIEW_WIDTH, height: PREVIEW_HEIGHT }}
          >
            {hoverThumbUrl && (
              <img
                src={hoverThumbUrl}
                alt=""
                draggable={false}
                className="block w-full h-full object-cover"
              />
            )}
            <span className="absolute bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded text-[10px] bg-black/80 text-white whitespace-nowrap">
              {formatTime(displayTime)}
            </span>
          </div>
        ) : (
          <div className="px-2 py-1 rounded text-xs bg-black text-white whitespace-nowrap">
            {formatTime(displayTime)}
          </div>
        )}
      </div>
    </div>
  );
}
