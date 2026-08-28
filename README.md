# mediakit-player

[![npm version](https://img.shields.io/npm/v/mediakit-player.svg)](https://www.npmjs.com/package/mediakit-player)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![types](https://img.shields.io/badge/types-included-3178c6.svg)](./src/index.ts)

A headless, composable React video/audio player. `mediakit-player` gives you a `<Media.Provider>` and a set of unstyled building-block components (play button, seek bar, volume, captions toggle, playback rate, picture-in-picture, fullscreen) that you compose and style yourself, plus a `useMedia()` hook for full custom UI.

## Features

- **Looks right out of the box** — the components render fully styled the moment you import them, no CSS import and no Tailwind setup required in your app
- **Composable** — build your own control bar from small primitives instead of fighting a monolithic `<VideoPlayer />`
- **Full playback control** — play/pause, seek, volume/mute, playback rate, duration/remaining time toggle
- **Picture-in-picture & fullscreen** built in
- **Double-tap/click to seek** ±10s with an animated forward/backward indicator
- **Hover scrubbing preview** on the seek bar
- **Video and audio** via the same `<Media.Provider>` context
- **Fully typed** — ships its own `.d.ts` files, no `@types` package needed
- **Tree-shakeable** ESM + CJS builds via `tsup` — unused components are still dropped by your bundler; only the stylesheet is marked as a side effect so it survives

## Installation

```bash
npm install mediakit-player
# or
yarn add mediakit-player
# or
pnpm add mediakit-player
# or
bun add mediakit-player
```

### Peer dependencies

`mediakit-player` expects `react` and `react-dom` (>=17) to be provided by your app:

```bash
npm install react react-dom
```

## Quick start

Just import and compose the pieces you want — the package's styles load automatically the moment you import it, no CSS import and no Tailwind setup required in your app:

```tsx
"use client";

import { Media, Video } from "mediakit-player";

export default function Player() {
  return (
    <Media.Provider>
      <Media.View className="media-view">
        <Video src="/videos/sample.mp4" />

        <Media.Controls>
          <Media.ControlBar>
            <Media.Group>
              <Media.PlayButton />
              <Media.Volume />
            </Media.Group>

            <Media.TimeGroup>
              <Media.Time />
              <Media.SeekBar />
              <Media.Duration />
            </Media.TimeGroup>

            <Media.Group>
              <Media.Captions />
              <Media.PlaybackRate />
              <Media.PictureInPicture />
              <Media.Fullscreen />
            </Media.Group>
          </Media.ControlBar>
        </Media.Controls>
      </Media.View>
    </Media.Provider>
  );
}
```

Everything under `<Media.Provider>` shares playback state through React context, so you can rearrange, omit, or restyle any control without touching the others — skip `<Media.Captions />`, drop a `<Media.Group>`, whatever your layout needs; the rest keeps working and keeps its default look. Every component still accepts `className` and forwards remaining DOM props, so overriding the look with your own Tailwind, CSS Modules, or plain CSS works too.

### How the styling works

`mediakit-player`'s entry point has a built-in `import "./index.css"`, so any bundler-based app (Next.js, Vite, Create React App, etc.) that imports from `mediakit-player` picks up its stylesheet automatically and extracts a real `<link>` at build time — nothing for you to import. If you're in an environment without a bundler processing CSS from `node_modules` (a bare Node script, or Jest without a CSS transform configured), either add a CSS mock for your test runner (e.g. Jest's `moduleNameMapper` pointing `\.css$` at `identity-obj-proxy`) or fall back to importing the stylesheet explicitly:

```tsx
import "mediakit-player/style.css";
```

## Audio

Swap `<Video>` for `<Audio>` — same provider, same controls:

```tsx
import { Media, Audio } from "mediakit-player";

<Media.Provider>
  <Media.View>
    <Audio src="/audio/track.mp3" />
    <Media.Controls>
      <Media.ControlBar>
        <Media.PlayButton />
        <Media.SeekBar />
        <Media.Volume />
      </Media.ControlBar>
    </Media.Controls>
  </Media.View>
</Media.Provider>
```

## Components

| Component                 | Description                                                             |
| -------------------------- | ------------------------------------------------------------------------ |
| `Media.Provider`           | Context provider that holds playback state; wrap everything else in it   |
| `Video` / `Audio`          | The underlying `<video>` / `<audio>` element, wired into the provider    |
| `Media.View`                | Container that owns the fullscreen target ref                            |
| `Media.Controls`            | Overlay that hosts the control bar                                       |
| `Media.ControlBar`          | Flex row that lays out control groups                                    |
| `Media.Group` / `Media.TimeGroup` | Layout helpers for clustering related controls                    |
| `Media.Title`               | Displays a title/label over the player                                   |
| `Media.PlayButton`          | Play/pause toggle                                                        |
| `Media.SeekBar`             | Draggable progress bar with hover scrub preview                          |
| `Media.Time` / `Media.Duration` | Elapsed time / duration (click `Duration` to toggle remaining time) |
| `Media.Volume`              | Mute toggle + volume slider                                              |
| `Media.Captions`            | Closed captions toggle button                                            |
| `Media.PlaybackRate`        | Playback speed selector (0.5x–2x)                                        |
| `Media.PictureInPicture`    | Toggles native picture-in-picture                                        |
| `Media.Fullscreen`          | Toggles fullscreen on `Media.View`                                       |

`Media.View`, `Media.Controls`, `Media.ControlBar`, `Media.Group`, `Media.TimeGroup`, `Video`, and `Audio` accept `className` and forward remaining DOM props, so styling those with Tailwind, CSS Modules, or plain CSS works. The individual controls (`PlayButton`, `SeekBar`, `Time`, `Duration`, `Volume`, `Captions`, `PlaybackRate`, `PictureInPicture`, `Fullscreen`, `Title`) don't accept `className` or props yet — restyling them currently means overriding their built-in classes globally.

## `useMedia()`

For fully custom controls, drop down to the hook (must be called under `<Media.Provider>`):

```tsx
import { useMedia } from "mediakit-player";

function CustomButton() {
  const { isPlaying, togglePlay, currentTime, duration, setPlaybackRate } = useMedia();
  // ...
}
```

`useMedia()` exposes `mediaElement`, `isPlaying`, `currentTime`, `duration`, `volume`, `isMuted`, `playbackRate`, `showRemainingTime`, and the corresponding actions (`togglePlay`, `seekTo`, `seekBy`, `setVolume`, `toggleMute`, `setPlaybackRate`, `toggleFullscreen`, `togglePictureInPicture`, `toggleShowRemainingTime`).

## TypeScript

Types are exported alongside the components:

```ts
import type {
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
} from "mediakit-player";
```

## License

MIT © [Kalvin Chakma](https://github.com/kalvin-chakma)
