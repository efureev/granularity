# Changelog

All notable changes to the [`@feugene/granularity-datepicker`](.) package are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres
to [Semantic Versioning](https://semver.org/).

## [v0.1.0] 2026-07-19

### Added

- Initial release: an opt-in companion package for the granularity design system — a themed
  wrapper around [`@vuepic/vue-datepicker`](https://vue3datepicker.com/), so the core
  `@feugene/granularity` stays lean (the heavy dependency is pulled in only by consumers of
  this package).
- Components: `GrDateTimePicker` (base — `mode`: `date` / `datetime` / `time` / `month` /
  `year`, plus `range`) and the presets `GrDatePicker`, `GrTimePicker`, `GrDateRangePicker`.
- Granularity-owned prop contract: the public props/events (`GrDateTimeModel`, `mode`,
  `range`, `locale`, …) are the design system's own — `@vuepic/vue-datepicker` types are not
  re-exported, so the implementation can be swapped later without a breaking change. Escape
  hatches (`datepickerProps`, `ui`) expose the underlying library when needed.
- Theming through granularity tokens (maps `@vuepic`'s `--dp-*` variables onto `--gr-*` /
  semantic tokens, so light/dark follow automatically) and an own granular-provider for the
  UnoCSS safelist.
- Per-component subpath exports and a tree-shakeable build (`@vuepic/vue-datepicker` and
  `date-fns` stay external).
- `./resolver` entry — a `GranularityDatepickerResolver()` for `unplugin-vue-components`
  auto-import, built on `@feugene/unplugin-granularity`'s `createGranularResolver` factory
  (whitelist of the four components; register it before the core `GranularityResolver()`).
