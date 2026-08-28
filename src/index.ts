import "./index.css";
import { MediaProvider } from "./media/context";
import { useMedia } from "./media/hooks";
import {
  View,
  Controls,
  Title,
  ControlBar,
  Group,
  TimeGroup,
  PlayButton,
  SeekBar,
  Time,
  Duration,
  Volume,
  Captions,
  PlaybackRate,
  PictureInPicture,
  Fullscreen,
  Video,
  Audio,
} from "./media/components";

export const Media = {
  Provider: MediaProvider,
  View,
  Controls,
  Title,
  ControlBar,
  Group,
  TimeGroup,
  PlayButton,
  SeekBar,
  Time,
  Duration,
  Volume,
  Captions,
  PlaybackRate,
  PictureInPicture,
  Fullscreen,
};

export { useMedia, Video, Audio };

export type {
  VideoProps,
  AudioProps,
  MediaViewProps,
  MediaControlsProps,
  MediaControlBarProps,
  MediaGroupProps,
  MediaTimeGroupProps,
  MediaTitleProps,
  MediaContextValue,
  MediaElement,
} from "./media/types";
