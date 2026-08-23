"use client";

import { useEffect, useRef, type AudioHTMLAttributes } from "react";
import { useMedia } from "../hooks/useMedia";

export interface AudioProps extends Omit<AudioHTMLAttributes<HTMLAudioElement>, "src"> {
  src: string;
}

export default function Audio({ src, className = "", ...props }: AudioProps) {
  const { attachMedia } = useMedia();
  const elementRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    attachMedia(elementRef.current, src, false);
    return () => attachMedia(null, "", false);
  }, [attachMedia, src]);

  return (
    <audio
      ref={elementRef}
      src={src}
      className={`w-full ${className}`}
      {...props}
    />
  );
}
