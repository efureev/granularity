# Changelog

All notable changes to the [`@feugene/granularity-chrono`](.) package are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres
to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- **Date and time arithmetic on plain tuples** (`{y, m, d}` / `{h, min, s}`): month and year
  shifts, month length, leap years, comparison, ranges, ISO weekday and week number, the
  month grid builder, cached `Intl` wrappers and the `Date` boundary with `date`/`isoDate`/
  `isoDateTime`/`timestamp` adapters. `Date` arithmetic is a source of DST bugs — on a
  transition day the tuple is immune by construction. No date library is involved, and
  everything locale-dependent comes from `Intl`, so the package speaks every language the
  engine knows rather than the ones we listed.

- **`GrCalendar`** — the month grid as the WAI-ARIA `grid` pattern: roving tabindex with
  exactly one tab stop, arrows across days and weeks, `Home`/`End` as week bounds,
  `PageUp`/`PageDown` for the month, `Shift` with them for the year. The grid edge pages the
  month instead of wrapping, and the month change is announced — otherwise arrow navigation
  is silent for a screen-reader user. Disabled days keep `aria-disabled` and stay in the
  traversal.

- **`GrDatePicker`** — a field with a calendar panel. The field is the package's boundary:
  it speaks `Date` (or whatever `valueAdapter` says) outward and tuples inward. It is a real
  form control — own `id`/`name`, `GrFormField` wiring, `aria-invalid`/`aria-required`,
  sizes from `GrConfigProvider`, `v-model:open` — all of which the predecessor could not do
  at all, because its `<input>` belonged to a third-party widget. The panel mounts on first
  open, not on page load: a form with several pickers would otherwise build a 42-cell grid
  per picker before anyone clicked anything.

- **Wired into the showcase** next to the package it replaces: its own companion section,
  four demos and hand-written API tables. Both packages ship a `GrDatePicker`, so the
  showcase demos import this one explicitly — the auto-import resolver matches by name and
  would silently hand over the other component, and the snippet under a preview is exactly
  the code a reader copies.

- **Package gates for tokens and accessibility**: no pixel literals or uno-scale utilities
  where the design system has a token, every own CSS variable declared in the component's
  `tokens.json`, and axe over the *open* panel — the showcase gate only ever captures the
  closed state, so the grid roles would go unchecked. The token gate paid for itself on its
  first run: the month title referenced `--gr-leading-md`, a step that does not exist in the
  scale, so its line-height had been silently falling back to `normal`.

- Package scaffold: build config with a per-component entry map, `granular-provider`
  (browser and node entries), `unplugin-vue-components` resolver, `granular doctor`
  options and the registry generator. No components yet.
- Registries are generated from the file system by
  `@feugene/unocss-preset-granular/codegen` from day one — the barrel, the subpath
  exports, the build entries, the provider registry and the name list shared by the
  resolver and the build config. The predecessor kept six such lists in sync by hand.
- `types` points at `dist/types/index.d.ts`, without the stray `src/` segment that
  `vue-tsc` emits by default; `exports` includes `./package.json`. Both were logged
  as breaking changes to make before 1.0 in the audit of the predecessor.
- Package gates from day one: `vitest`, `eslint`, `typecheck`, a registry-drift
  check and `publint`, all wired into a CI job and into the repository's root
  `test` and `build` aggregates. The predecessor had none of them — no tests, no
  lint config, and a `typecheck` script CI never called.
- The registry gate reads what the generator wrote back from the built modules,
  not only its exit code: the provider registry, the name list shared by the
  resolver and the build config, the barrel, the subpath exports and the build
  entries must all agree with `src/components/`, in both directions.
