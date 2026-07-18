# Changelog

All notable changes to the [`@feugene/granularity`](./packages/granularity) package are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [v0.11.0] 2026-07-18

## [v0.10.0] 2026-07-17

## [v0.9.4] 2026-06-23

### Added

- `GrSelect`: support for grouped options. The `options` prop now accepts groups
  in the standard shape `{ label, options: [{ value, label }] }` (mixed with
  plain options). Groups render as native `<optgroup>` in `optionsView="native"`
  and as group headers in `optionsView="panel"`. Value lookups, selection,
  custom-value handling and filtering operate over the flattened option list;
  filtering hides empty groups. New exported types `GrSelectOptionGroup` and
  `GrSelectOptionOrGroup`.

## [v0.9.3] 2026-06-09

### Added

- `GrImageViewer`: toolbar slots (`#toolbar` / `#toolbar-actions`) now expose the
  real image metrics, so consumers no longer have to read the DOM manually
  (`querySelector` + `requestAnimationFrame`): `naturalWidth` / `naturalHeight`
  (intrinsic image size), `renderedWidth` / `renderedHeight` (actual on-screen
  footprint with `scale` applied), and `realScale` / `realScalePercent` (the
  true scale relative to the natural size). Natural size is read on `@load`,
  the fitted (`object-contain`) layout size is tracked via `ResizeObserver`,
  and the real scale is a derived `computed` (rotation-independent). Metrics
  reset on index / `urlList` change.
- `GrImageViewer`: zoom with the mouse wheel / trackpad pinch gesture. Scrolling
  up zooms in, scrolling down zooms out, smoothly (exponential step, clamped to
  `minScale` / `maxScale`). Can be disabled with the new `wheelZoom` prop
  (defaults to `true`).
- `GrImageViewer`: drag-to-pan via the new `draggable` prop (defaults to
  `false`). When enabled, hovering the image shows a grab cursor and
  pressing + dragging moves the image (updates the translate offset). Uses
  pointer events with pointer capture (so dragging continues outside the image),
  switches the cursor to grabbing while active, and disables the CSS transition
  during the drag for 1:1 tracking. Drag state resets on index / `urlList`
  change, reset, and close.

### Fixed

- `GrImageViewer`: jitter and visual "overlapping" of the image during
  continuous wheel / trackpad zoom. Wheel deltas are now batched and applied
  once per animation frame (`requestAnimationFrame`) instead of re-rendering on
  every wheel event, and the CSS `transition-transform` is disabled while the
  zoom gesture is active (the per-frame updates already keep it smooth) and
  restored once the gesture ends.

## [v0.9.2] 2026-06-08

### Fixed

- `GrModal`: fixed focus handling when a dialog is opened over an already open
  modal in a separate render tree (e.g. `useDialogService` dialogs over a
  `GrModal`). HeadlessUI's per-`Dialog` focus trap is tree-scoped, so the lower
  modal kept its `FocusLock` and "stole" focus back — making it impossible to
  focus inputs (e.g. the `prompt` field) in the top dialog. Added a shared
  `grModalTopStack`: only the topmost (last-opened) modal keeps focus, lower
  modals are marked `inert`.
- `GrModal`: removed the HeadlessUI warning "There are no focusable elements
  inside the `<FocusTrap />`" by passing the panel (with `tabindex="-1"`) as the
  dialog's `initialFocus`.

## [v0.9.1] 2026-06-07

### Fixed

- `GrModal`: Esc now closes the topmost (last-opened) modal/dialog instead of
  the bottom one. Added a shared `grModalEscStack` (single capture-phase
  `window` listener) that pre-empts HeadlessUI's per-`Dialog` Escape handler,
  so Esc targets the top window even when a `useDialogService` dialog is opened
  over a `GrModal` (separate render tree).

## [v0.9.0] 2026-06-02

### Added

- `useDialogService` / `dialogService`: imperative dialog service (Element Plus
  `ElMessageBox`-style) to open `confirm` / `alert` / `prompt` dialogs from
  `<script>` / `.ts` without placing a component in the template. Supports
  async `onConfirm` with loading state, in-dialog server-error rendering via
  `ctx.setRawError` (reusing `GrResponseErrorBanner` parsers), `AbortSignal`,
  FIFO queueing and application-context inheritance (i18n / theme / provider).
- `GrResponseErrorBanner`: `coreResponseErrorParsers` (universal parser core) and
  `responseErrorParserPresets` for composing parser chains.

### Changed

- `GrConfirmDialog`: added backward-compatible `error`, `confirmLoading`,
  `confirmDisabled`, `closeOnConfirm` props and an `#error` slot.
- `GrPromptDialog`: added backward-compatible `error`, `fieldError`,
  `confirmLoading`, `confirmDisabled`, `closeOnConfirm` props and an `#error` slot.

## [v0.8.0] 2026-06-01

### Added

- `GrBadge`: new `xs` size.

### Changed

- `GrBadge`: size scale shifted (old `sm`→`xs`, `md`→`sm`, `lg`→`md`) with new `lg` values; default size changed to
  `sm`.

## [v0.1.0]

### Added

- Root repository artifacts: `README.md`, `LICENSE` (Apache-2.0), `CHANGELOG.md`, `CONTRIBUTING.md`.
- Added `repository`, `homepage`, `bugs`, `keywords`, `author`, `engines`, `publishConfig` metadata
  and an optional `unocss` peerDependency to `packages/granularity/package.json`.

### Changed

- Package license changed from `UNLICENSED` to `Apache-2.0`.
- CI split into separate jobs (`lint`, `test-granularity`, `build-granularity`,
  `test-showcase`, `build-showcase`, `deploy-showcase`, `publish`); publishing no longer depends on the showcase.
- `apps/showcase`: removed the duplicate package build — `generate:search` no longer rebuilds `@feugene/granularity`
  (for local development the preparation step runs in `yarn dev:showcase`).

### Removed

- Useless root-level `.npmignore` (publishing happens from `packages/granularity`, where `files` already applies).
