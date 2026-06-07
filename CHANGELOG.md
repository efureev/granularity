# Changelog

All notable changes to the [`@feugene/granularity`](./packages/granularity) package are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

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
