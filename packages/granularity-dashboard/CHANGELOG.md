# Changelog

All notable changes to `@feugene/granularity-dashboard` are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **First release.** A widget grid for the `@feugene/granularity` design system: users arrange
  widgets themselves, and the arrangement survives a reload. No runtime dependencies — collisions,
  compaction and grid geometry are integer arithmetic.
- **`GrDashboard`** — the grid. Holds a layout per breakpoint (`v-model:layout`), separates the
  view mode from the edit mode, and moves and resizes widgets by pointer and from the keyboard.
  Props: `cols`, `breakpoints`, `initialBreakpoint`, `rowHeight`, `gap`, `mode`, `draggable`,
  `resizable`, `compact`, `preventCollision`, `lazy`, `ariaLabel`. Emits `update:layout`,
  `layoutChange`, `itemMove`, `itemResize`, `breakpointChange`.
- **`GrDashboardItem`** — a widget on the grid, built on the core `GrCard`. Declares its own size
  bounds (`minW`, `minH`, `maxW`, `maxH`, `static`), takes slots `default`, `header`, `actions`,
  `footer` and `skeleton`.
- **`GrDashboardToolbar`** — mode switch and layout reset. Works both inside the grid and outside
  it, through `v-model:mode`.
- **`GrDashboardPalette`** — a catalogue of widgets that can be added. Adding is a plain button, so
  the keyboard path exists by construction rather than as an afterthought.
- **`useDashboardLayout`** — layout persistence behind a storage interface, with a schema version,
  a migration hook and debounced writes; a ready-made `localStorage` adapter ships with it. The
  storage is never read during `setup`, so hydration cannot diverge.
- **`./layout` subpath** — the pure arithmetic of the layout with no Vue and no DOM: collisions,
  vertical compaction, moving and resizing, grid geometry, breakpoint derivation and tolerant
  (de)serialisation. Usable on its own, including on the server.
- **Accessibility.** WAI-ARIA has no pattern for a widget grid, so the contract is invented and
  written down in `docs/a11y.md`. The grid is a single `Tab` stop with a roving tabindex across the
  drag handles; `Space` picks a widget up, arrows move it a cell at a time, `Esc` cancels, `Space`
  drops it; the resize handle is its own stop with arrows, `Shift` for a large step and `Home`/`End`
  for the bounds. Only keyboard moves are announced — a stream of announcements per pointer move
  makes a screen reader useless.
- **i18n** — the `grDashboard` block with `en`, `ru` and `es` dictionaries: handle names, toolbar
  labels, catalogue strings and announcement templates.
- **Theme tokens** — `--gr-dashboard-*` and `--gr-dashboard-frame-*`, all resolving to core roles
  rather than to values.

[Unreleased]: https://github.com/efureev/granularity/compare/granularity-dashboard-v0.1.0...HEAD
