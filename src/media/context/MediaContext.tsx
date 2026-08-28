"use client";

import { createContext, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import type { MediaContextValue, MediaElement } from "../types";

export const MediaContext = createContext<MediaContextValue | null>(null);

const SEEK_SECONDS = 10;

export function MediaProvider({ children }: { children: ReactNode }) {
  const mediaRef = useRef<MediaElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const previousVolumeRef = useRef(1);

  const [mediaElement, setMediaElement] = useState<MediaElement | null>(null);
  const [src, setSrc] = useState("");
  const [isVideo, setIsVideo] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRateState] = useState(1);
  const [showRemainingTime, setShowRemainingTime] = useState(true);

  const attachMedia = useCallback(
    (element: MediaElement | null, nextSrc: string, nextIsVideo: boolean) => {
      mediaRef.current = element;
      setMediaElement(element);
      setSrc(nextSrc);
      setIsVideo(nextIsVideo);
    },
    []
  );

  useEffect(() => {
    if (!mediaElement) return;

    const handleTimeUpdate = () => {
      setCurrentTime(mediaElement.currentTime);
      setDuration(mediaElement.duration || 0);
    };
    // "timeupdate" (and so the duration it also reports) doesn't fire until
    // playback actually starts. Tracking duration separately from these means
    // consumers relying on it before the user hits play — the buffered range,
    // remaining time, etc. — have a real value as soon as metadata loads.
    const handleDurationChange = () => setDuration(mediaElement.duration || 0);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);
    const handleVolumeChange = () => {
      setVolumeState(mediaElement.volume);
      setIsMuted(mediaElement.muted);
    };
    const handleRateChange = () => setPlaybackRateState(mediaElement.playbackRate);

    mediaElement.addEventListener("timeupdate", handleTimeUpdate);
    mediaElement.addEventListener("loadedmetadata", handleDurationChange);
    mediaElement.addEventListener("durationchange", handleDurationChange);
    mediaElement.addEventListener("play", handlePlay);
    mediaElement.addEventListener("pause", handlePause);
    mediaElement.addEventListener("ended", handleEnded);
    mediaElement.addEventListener("volumechange", handleVolumeChange);
    mediaElement.addEventListener("ratechange", handleRateChange);

    handleDurationChange();
    handleVolumeChange();
    handleRateChange();

    return () => {
      mediaElement.removeEventListener("timeupdate", handleTimeUpdate);
      mediaElement.removeEventListener("loadedmetadata", handleDurationChange);
      mediaElement.removeEventListener("durationchange", handleDurationChange);
      mediaElement.removeEventListener("play", handlePlay);
      mediaElement.removeEventListener("pause", handlePause);
      mediaElement.removeEventListener("ended", handleEnded);
      mediaElement.removeEventListener("volumechange", handleVolumeChange);
      mediaElement.removeEventListener("ratechange", handleRateChange);
    };
  }, [mediaElement]);

  const seekTo = useCallback((time: number) => {
    const media = mediaRef.current;
    if (!media) return;
    media.currentTime = Math.min(Math.max(time, 0), media.duration || 0);
  }, []);

  const seekBy = useCallback(
    (delta: number) => {
      const media = mediaRef.current;
      if (!media) return;
      seekTo(media.currentTime + delta);
    },
    [seekTo]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!mediaRef.current) return;
      if (e.key === "ArrowRight") seekBy(SEEK_SECONDS);
      if (e.key === "ArrowLeft") seekBy(-SEEK_SECONDS);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [seekBy]);

  const togglePlay = useCallback(() => {
    const media = mediaRef.current;
    if (!media) return;
    if (media.paused) media.play();
    else media.pause();
  }, []);

  const setVolume = useCallback((value: number) => {
    const media = mediaRef.current;
    if (!media) return;
    const clamped = Math.min(Math.max(value, 0), 1);
    media.volume = clamped;
    media.muted = clamped === 0;
    if (clamped > 0) previousVolumeRef.current = clamped;
  }, []);

  const toggleMute = useCallback(() => {
    const media = mediaRef.current;
    if (!media) return;
    if (media.muted || media.volume === 0) {
      media.muted = false;
      media.volume = previousVolumeRef.current || 1;
    } else {
      previousVolumeRef.current = media.volume;
      media.muted = true;
    }
  }, []);

  const setPlaybackRate = useCallback((rate: number) => {
    const media = mediaRef.current;
    if (!media) return;
    media.playbackRate = rate;
  }, []);

  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    if (!document.fullscreenElement) {
      container.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }, []);

  const togglePictureInPicture = useCallback(async () => {
    const media = mediaRef.current;
    if (
      !(media instanceof HTMLVideoElement) ||
      !document.pictureInPictureEnabled ||
      media.disablePictureInPicture
    ) {
      console.warn("Picture-in-Picture is not supported on this media.");
      return;
    }
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await media.requestPictureInPicture();
      }
    } catch (error) {
      console.error("Picture-in-Picture failed:", error);
    }
  }, []);

  const toggleShowRemainingTime = useCallback(() => {
    setShowRemainingTime((prev) => !prev);
  }, []);

  const value: MediaContextValue = {
    mediaRef,
    containerRef,
    mediaElement,
    attachMedia,
    src,
    isVideo,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    playbackRate,
    showRemainingTime,
    togglePlay,
    seekTo,
    seekBy,
    setVolume,
    toggleMute,
    setPlaybackRate,
    toggleFullscreen,
    togglePictureInPicture,
    toggleShowRemainingTime,
  };

  return <MediaContext.Provider value={value}>{children}</MediaContext.Provider>;
}
