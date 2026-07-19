# Changelog

All notable changes to the [`@feugene/unplugin-granularity`](.) package are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres
to [Semantic Versioning](https://semver.org/).

## [v0.4.0] 2026-07-19

### Added

- `createGranularResolver` — a generic `unplugin-vue-components` component-resolver factory for
  any granular package in the ecosystem (core or companion). Matches by `prefix` (greedy) or an
  explicit `components` whitelist, targets a configurable `packageName`, and optionally adds the
  per-component `styles.css` side-effect (`importStyle`, default `false` for CSS-inlined packages).
  Companion packages (e.g. `@feugene/granularity-datepicker`) build their own resolver on top of it.

### Changed

- `GranularityResolver` is now implemented on top of `createGranularResolver` — no behavior change.

## [v0.3.1] 2026-07-16
