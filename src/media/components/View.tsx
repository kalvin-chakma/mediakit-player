"use client";

import { forwardRef, type HTMLAttributes } from "react";
import { useMedia } from "../hooks/useMedia";

export type MediaViewProps = HTMLAttributes<HTMLDivElement>;

const MediaView = forwardRef<HTMLDivElement, MediaViewProps>(
  ({ className = "", children, ...props }, forwardedRef) => {
    const { containerRef } = useMedia();

    return (
      <div
        ref={(node) => {
          containerRef.current = node;
          if (typeof forwardedRef === "function") forwardedRef(node);
          else if (forwardedRef) forwardedRef.current = node;
        }}
        className={`relative w-full max-w-6xl mx-auto bg-black-900 rounded-lg overflow-hidden flex items-center justify-center aspect-video ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

MediaView.displayName = "Media.View";

export default MediaView;
