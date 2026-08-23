"use client";

import { useContext } from "react";
import { MediaContext } from "../context/MediaContext";
import type { MediaContextValue } from "../types";

export function useMedia(): MediaContextValue {
  const ctx = useContext(MediaContext);
  if (!ctx) {
    throw new Error("Media components must be used within <Media.Provider>");
  }
  return ctx;
}
