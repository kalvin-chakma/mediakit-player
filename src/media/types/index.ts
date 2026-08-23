import type { RefObject } from "react";

export type MediaElement = HTMLVideoElement | HTMLAudioElement;

export interface MediaContextValue {
  mediaRef: RefObject<MediaElement | null>;
  containerRef: RefObject<HTMLDivElement | null>;
  mediaElement: MediaElement | null;
  attachMedia: (element: MediaElement | null, src: string, isVideo: boolean) => void;
  src: string;
  isVideo: boolean;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  playbackRate: number;
  showRemainingTime: boolean;
  togglePlay: () => void;
  seekTo: (time: number) => void;
  seekBy: (delta: number) => void;
  setVolume: (value: number) => void;
  toggleMute: () => void;
  setPlaybackRate: (rate: number) => void;
  toggleFullscreen: () => void;
  togglePictureInPicture: () => Promise<void>;
  toggleShowRemainingTime: () => void;
}

export type { VideoProps } from "../components/Video";
export type { AudioProps } from "../components/Audio";
export type { MediaViewProps } from "../components/View";
export type { MediaControlsProps } from "../components/Controls";
export type { MediaControlBarProps } from "../components/ControlBar";
export type { MediaGroupProps } from "../components/Group";
export type { MediaTimeGroupProps } from "../components/TimeGroup";
export type { MediaTitleProps } from "../components/Title";
