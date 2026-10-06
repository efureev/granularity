# Changelog

All notable changes to `@feugene/granularity-media` are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- **Safelist компонентов пуст.** Все записи лежали в коде целыми литералами —
  в шаблонах и `.ts`-хелперах. granum извлекает такие классы сам, обходя от
  входа компонента все его чанки, общие включительно, и вычищал записи из
  манифеста как уже извлечённые. Списки пережили UnoCSS-пресет, который общий
  чанк не сканировал. Набор классов не изменился — проверено сверкой
  манифестов по селекции каждого компонента; расходятся только случайные
  токены, которые экстрактор выхватывает из минифицированного кода.
- Удалён `internal/classTokens.ts`: он служил только спискам.
- Подключён гейт `defineSafelistGate` из test-kit: запись safelist, которая
  лежит целым литералом в коде компонента, он называет лишней. Нужен safelist
  только классу, собранному в рантайме из частей.

## [v1.0.1] 2026-09-29

Гигиена сборки. Артефакт пакета не изменился — проверено побайтно.

### Changed

- **`libInjectCss` убран из конфига сборки.** Плагин вписывал в JS-чанк
  компонента `import '../styles.css'`; до granum это был единственный канал
  доставки стилей, а с granum тот же файл приезжает приложению через манифест —
  и потребитель получал два экземпляра, причём второй **вне слоёв `granum.*`**
  и потому сильнее всей библиотеки.

  У этого пакета компонентного CSS нет, и плагин стоял вхолостую: сборка с ним
  и без него совпадает побайтно, числа в `docs/entry-sizes.md` не сдвинулись.
  Убран до того, как появится первый компонент со стилями — тогда ловушка
  захлопнулась бы молча.

  Ядро сняло плагин при переезде на granum, `granularity-editor` и
  `granularity-code` — в 1.0.1, где он уже стрелял. Диагностика
  `css-double-delivery`, которая обязана была это назвать, не работала вовсе;
  починена в `@feugene/granum` 1.0.2.

- `vite-plugin-lib-inject-css` убран из devDependencies: больше не импортируется.

## [v1.0.0] 2026-09-28

Переезд на `@feugene/granum` 1.0 и первый мажор пакета.

Публичная поверхность не менялась — ломающий тут сам конвейер: peer-зависимость
уезжает с `@feugene/unocss-preset-granular` на `@feugene/granum`
(`>=1.0.0 <2.0.0`), а приложение переходит с `uno.config.ts` на
`granum.config.ts`. Версия выровнена с ядром: `@feugene/granularity` 1.0.0.

Перед обновлением стоит прочитать руководство по переезду в granum — в
частности про каскадные слои и сброс браузерных стилей, который теперь нужно
импортировать в слой.

### Changed

- **`yarn doctor` is `granum doctor --strict`, without a wrapper script.**
  `scripts/granum-doctor.mjs` existed for two reasons and both are gone. It muted
  `token-undefined` through the monorepo's token registry — granum 0.4.0 derives
  the same verdict from the code itself (a use with a fallback, a token the
  component assigns itself and `dynamicTokens` are not findings), so the registry
  is unnecessary. And it kept recorded debt from failing the gate — that is now
  `--allow=<codes>`. Findings across the eight packages went from 861 to 1, and
  that one is the deliberate `!important` on the drag cursor in `GrTransfer`,
  recorded through `--allow`.
- **Safelists in the manifests shrank from 3479 entries to 430** (zero in every
  companion): granum drops entries that static extraction already covers. Nothing
  in the sources changed and the CSS is byte-for-byte identical — the safelist
  there is derived from the component's own class constants, and whether
  extraction sees a given class is decided by chunking, not by the author.
- **The utility engine changed: `@feugene/granum-engine-wind` `^0.4.0` instead of
  `@feugene/granum-engine-mini`.** It vendors `preset-wind3` rather than
  `preset-mini`, so the vocabulary gained `border-collapse`, `list-none`,
  `touch-none`, `table-fixed` and `scroll-p*` — utilities that existed neither in
  `preset-mini` nor in the former extra rules, which is why a class in the markup
  silently produced no CSS. The package dialect is now
  `unocss/preset-wind3+granum@66`, and the peer on the core moved to
  `>=0.3.0 <1.0.0`. A consumer swaps the pair in dev dependencies and replaces
  `miniEngine()` with `windEngine()` in `granum.config.*`.
- **The package is built by `@feugene/granum`, not by the `@feugene/unocss-preset-granular` preset.** The
  `dist` layout and the component entries are driven by the
  `granumProvider({ provider, engine: miniEngine(), entries })` plugin: it builds them from the provider
  registry, extracts the classes and the consumed tokens by walking the bundle graph, and writes a
  machine-generated `granum.manifest.json` next to `dist`. The package's own `build.lib`,
  `granularChunkFileNames` and hand-written component entries are gone from `vite.config.ts`.
- **The manifest is exported as `./granum.manifest.json`.** An application resolves it through exactly that
  subpath — without the export the package's provider cannot be wired up. granum never scans
  `node_modules`: the component classes are computed when the package is built.
- **The peer changed: `@feugene/granum` `>=0.2.0 <1.0.0` instead of the preset.** The utility engine comes
  from the application (`@feugene/granum-engine-mini` sits in the package's dev dependencies), while the
  package declares a **vocabulary dialect** in the manifest — `unocss/preset-mini+granum@66`, the
  vocabulary its component classes are written against. An application running an engine of a different
  vocabulary gets `provider-dialect-mismatch` and every lost class listed by name instead of silently
  half-drawn components.
- **The descriptor contract was renamed without a change of meaning.** `defineGranularComponent` →
  `defineGranumComponent`, `defineGranularProvider` → `defineGranumProvider`, imported from
  `@feugene/granum/contract`. Donors are declared as **strings**
  (`dependencies: ['@feugene/granularity']`) rather than instances: an instance would pull the donor into
  the graph in object form and make the application scan its `dist` instead of reading the manifest.
  `packageBaseUrl` is gone — the manifest's directory is the base — so `granular-provider/node` is now a
  plain alias of the browser entry.
- **`granular.options.mjs` was replaced by `granum.config.mjs`**, and `yarn doctor` runs `granum doctor`
  against the package's manifests.
- **`cameraState.ts` moved from `components/GrCameraCapture/` to `components/shared/`.** The scanner reads
  it too, through the shared `useCameraStream`, and an import from another component's directory counts as
  a declared edge — declaring it would have made a consumer of the scanner pay for the camera's CSS and
  safelist in full. The public surface is unchanged: `GrCameraCapture/index.ts` re-exports from there.

## [v0.7.1] 2026-08-27

### Fixed

- Development warnings never reached the browser: the `__GR_DEV__` guard included a `typeof process` check, and
  `process` is undefined in the browser, so the whole expression collapsed to `false` in development too. The
  guard now matches the core package. Production bundles are unaffected — the branch is still dropped.

## [v0.7.0] 2026-08-27

### Changed

- **Peer floors on `@feugene/*` raised to the current minor.** Every peer this package
  declares on the ecosystem now starts at the version the monorepo actually ships:

  - `@feugene/fint-i18n` → `>=0.7.0 <1.0.0`
  - `@feugene/granularity` → `>=0.36.0 <1.0.0`
  - `@feugene/unocss-preset-granular` → `>=0.13.0 <1.0.0`
  - `@feugene/unplugin-granularity` → `>=0.7.0 <1.0.0`

  The floors had drifted far behind — some still admitted releases from a year of
  development ago — and a range that claims support it was never tested against is
  worse than a narrow one: the install succeeds and the breakage surfaces later, in
  the consumer's app.

  **This is breaking for anyone below a floor.** Installing against an older
  `@feugene/granularity` now produces a peer conflict instead of silence. The fix is
  to move the core up; nothing in this package's own API changed.

## [v0.6.1] 2026-08-25

### Fixed

- **The package tarball now ships `LICENSE`.** The manifest has always declared
  `"license": "SEE LICENSE IN LICENSE"`, and the file it points at was not there: `npm` adds
  `LICENSE` to a tarball on its own, but only when the file exists in the package directory.
  A consumer's compliance scanner reads a licence reference that resolves to nothing and flags
  the dependency as unlicensed — a refusal on formal grounds, before anyone reads the terms.

  The copy is byte-identical to the one at the repository root and is kept that way by
  `yarn check:licenses`, a gate in CI: eleven copies of a 598-line file drift silently, and they
  drift exactly when the licence text is being edited.


## [v0.6.0] 2026-08-24

### Added

- **`GrVideoPlayer` — video with controls of its own.** Native `controls` look different in every
  browser and know nothing about the design system's themes or sizes; these are drawn from tokens.
- **Full screen is requested on the frame, not on `<video>`.** Asking the video element hands the
  browser its own interface — our buttons, labels and keyboard would disappear exactly when they are
  needed most.
- **The buffered bar takes the range around the current position.** Browsers keep several loaded
  ranges, and after seeking backwards the last one belongs to a different part of the clip: a bar
  drawn from it would jump ahead and promise data that is not there.
- **Duration is not always known.** A stream recorded by `MediaRecorder`, or a live one, carries no
  duration in its header and the browser reports `NaN`. The progress bar is then not drawn at all
  and the label shows just the current time — "1:05 / 0:00" would promise an end the recording does
  not have.
- **Time is announced in words.** `aria-valuetext` reads "1:05 / 2:00"; a bare `aria-valuenow` would
  say "65 of 120" — correct and useless.

This completes the package: cropping, camera capture, code scanning and playback.


## [v0.5.0] 2026-08-24

### Fixed

- **`GrImageCrop` cropped a frame other than the one on screen.** The window's height was computed
  as `width / aspectRatio` while the real height comes from CSS — `aspect-ratio` plus the border,
  and under `box-sizing: border-box` the gap is systematic. The window is now measured, both sides,
  and measured **again** after the image loads: the frame only takes its ratio together with the
  image, so the first measurement lands on a transitional height.
- **A resize now reports a changed frame.** Responsive layouts resize the window without the user
  touching anything, and the first measurement arrives after `load`; a consumer building a file from
  the previous frame would get something other than what is on screen.

### Changed

- **Zoom works without `v-model:zoom`.** `zoom` was a controlled prop with no internal state, so the
  built-in slider was dead for everyone who had not wired the model — which is the common case. The
  component now keeps its own zoom and lets the prop override it, the same contract the core's
  overlays use for `v-model:open`.

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
