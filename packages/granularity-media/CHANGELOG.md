# Changelog

All notable changes to `@feugene/granularity-media` are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [v0.2.0] 2026-08-23

### Added

- **`GrCameraCapture` — a photo taken now instead of a file picked from disk.** The camera only
  starts on a button press: a permission prompt that appears on its own gets dismissed without
  reading, and the browser will not ask twice — the answer is remembered for the whole site.
- **Four distinct refusals instead of one "no access".** `denied`, `missing`, `busy` and `insecure`
  each call for a different action from the user, and telling someone to "allow camera access" when
  the device has no camera sends them looking for a setting that does not exist. On plain `http://`
  `navigator.mediaDevices` is absent altogether, which is not a refusal at all. The exception is
  read by name, not by message: messages are localised by the browser and change between versions,
  and browsers disagree on names — Safari calls a busy device `NotReadableError`, Firefox
  `AbortError`.
- **The preview is mirrored, the photo is not.** People expect to see themselves as in a mirror, but
  carrying that flip into the capture would send text on a card or document into looking-glass land
   — and that is exactly what the rear camera is used for.
- **The stream dies with the component.** A live track keeps the camera indicator lit even after the
  component is gone: the browser only turns it off when every track is stopped.

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
