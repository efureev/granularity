# Changelog

All notable changes to `@feugene/granularity-media` are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [v0.4.0] 2026-08-24

### Added

- **`GrCodeScanner` — reading QR and barcodes with the camera.** What leaves the component is a
  string, not a file; the frame is never stored.
- **No decoder ships with the package.** `BarcodeDetector` exists in Chrome and Edge but in neither
  Safari nor Firefox — i.e. not on iPhone at all, which is where scanning mostly happens. Bundling a
  decoder would force the heaviest dependency in the package on everyone, including those who only
  took the cropper, so the native path is built in and everything else is covered by a `detector`
  the application passes; the component page carries a ready recipe. "Nothing can read codes here"
  is its own state: telling the user to "allow the camera" would send them to solve the wrong
  problem.
- **One code in frame is one event.** The camera yields dozens of frames per second and the same
  code is recognised in each; unfiltered, an application would place twenty orders instead of one.
  `continuous` lifts the filter for goods-in, where identical packages are scanned in a row. The
  symbology is part of a code's identity: the same digits as `qr_code` and as `ean_13` are two
  different codes.

### Changed

- Camera plumbing — permission, refusal states, frame ratio, stopping tracks — moved into a shared
  composable used by both `GrCameraCapture` and `GrCodeScanner`. Written twice, it would have
  drifted apart on the first fix.


## [v0.3.0] 2026-08-23

### Changed

- **`GrCameraCapture` no longer crops.** Cameras on different devices hand back different sizes and
  ratios, so fitting the frame to a fixed window is meaningless — one phone would lose the sides,
  another the top. The photo is now taken whole, in the camera's own proportions, and the preview
  frame follows the stream. Cropping to a required shape is the next step, not this component:
  `GrImageCrop` does it on the captured file.
- **`aspectRatio` became a request to the camera** rather than a crop. It goes into `getUserMedia`
  as `ideal`, so a device that can produce it will; one that cannot returns its own, and that is
  what gets shown and captured. `exact` is deliberately not used: it raises `OverconstrainedError`,
  i.e. reports "no camera" for a perfectly good camera with a different ratio.
- **`output` is a bounding box, not an exact size.** With both sides given, the frame is fitted
  inside them and keeps its proportions; taking the numbers literally stretched the picture whenever
  the ratios disagreed. `GrImageCrop` follows the same rule.

### Removed

- `cameraFrameRect` and `GrCameraFrameRect` — the centre-crop helper has no callers left, and a dead
  utility in the public surface is worse than none: it invites use.


## [v0.2.2] 2026-08-23

### Fixed

- **A single side in `output` no longer stretches the result.** Asking for one dimension is the
  common case — "an avatar 800 wide" — and the other was taken from the source area instead of being
  derived from its ratio: a 640×480 camera frame at `width: 800` produced an 800×480 canvas, an
  image stretched a quarter wider than reality. Both `GrCameraCapture` and `GrImageCrop` were
  affected; the calculation now lives in one place and is covered on its own.

## [v0.2.1] 2026-08-23

### Fixed

- **`GrCameraCapture`: the frame now takes the stream's own aspect ratio.** It was hard-wired to
  4:3, so a 16:9 camera was shown cropped — and the crop was presented as what the camera sees.
  Without `aspectRatio` the frame follows the stream (4:3 until the first frame arrives, since
  dimensions are zero before `loadedmetadata`); passing the prop still wins, because the application
  knows where the photo will go.

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
