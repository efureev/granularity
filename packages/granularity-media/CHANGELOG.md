# Changelog

All notable changes to `@feugene/granularity-media` are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [v0.1.0] 2026-08-23

### Added

- **`GrImageCrop` — picking a frame out of an image before upload.** The frame stays put and the
  picture moves under it: the reverse model needs two gestures instead of one, and its corner
  handles are smaller than a finger on a phone. Dragging runs on the core's `useDragGesture`, so an
  interrupted gesture rolls back instead of committing; the keyboard moves the frame with arrows,
  zooms with `+`/`-` and resets with `Home`.
- **Export in source pixels.** Without `output` the result takes the size of the captured area of
  the *original file* rather than of the on-screen window — the window is almost always smaller, so
  exporting by it would silently halve the resolution.
- **A named failure for tainted canvases.** An image served cross-origin without
  `Access-Control-Allow-Origin` makes the canvas unreadable, and `toBlob` throws *after* the user has
  already chosen the frame. The component emits `error` and, in development, prints a warning that
  names the cause.
- **Crop geometry as pure functions** (`cropRect`, `clampOffset`, `coverScale`, …), exported and
  covered by tests without mounting: a crop fails invisibly — the frame drifts by a couple of
  percent, and it shows only in the result.
