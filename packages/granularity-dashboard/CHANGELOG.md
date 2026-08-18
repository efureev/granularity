# Changelog

All notable changes to `@feugene/granularity-dashboard` are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [v0.2.2] 2026-08-19

### Changed

- **Control-scale font sizes now ship a paired line height.** Every place that sets a control
  font size now sets the matching `leading-*` next to it, from the core's new
  `--gr-control-leading-*` steps. Before this the line height was inherited from the host
  application's `body`, and inherited as an absolute value — so how airy a caption looked was
  decided by someone else's CSS reset. Requires core `>=0.27.0`.

## [v0.2.1] 2026-08-18

### Changed

- Release-only bump: the workspace playground apps still pinned the core at
  `^0.20.0`, so yarn resolved a published copy for them instead of linking the
  workspace, and their uno config scanned that copy's `dist`. The pins are
  updated to the current range; nothing in this package's runtime changed.

## [v0.2.0] 2026-08-18

### Fixed

- **`compact: 'none'` was ignored on every breakpoint the app had not laid out
  by hand.** A layout is derived from a neighbouring breakpoint whenever one is
  missing, and that derivation hardcoded vertical compaction — so an app that
  had deliberately switched compaction off got it back the moment the viewport
  reached a breakpoint without its own layout, silently and only there. The mode
  now travels with the derivation (`deriveLayout` takes it as an optional fourth
  argument, `layoutFor` through `options.compact`), defaulting to `'vertical'`
  so existing callers are unaffected.

### Added

- Per-component documentation under `docs/components/` — one page per component, plus a
  `docs/components.md` index. Until now the only per-component description lived in the
  showcase app (`companionPackages.ts`), so it never reached the published tarball.
- `defineComponentDocsGate` from `@feugene/granularity-test-kit` wired in: a component
  without a page can no longer ship.

## [0.1.0] - 2026-08-14

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
  `editActions`, `footer` and `skeleton`.
  - **A widget may have no header at all.** The header appears only when there is something to put
    in it — a `title`, a `header` slot or `actions`. A widget holding a map or a single big number
    needs none, and entering the edit mode no longer grows one just to host the drag handle: the
    handle lives in a panel laid over the top of the content, so switching modes shifts nothing.
    The panel follows hover and focus-within, and stays visible where hovering does not exist
    (`hover: none`); hidden, it remains in the DOM and in the tab order.
  - **`padding`** (`none | xs | sm | md | lg`) — content insets; defaults to the `size` step.
    `none` gives the widget over to its content edge to edge, which is what a table wants. The
    footer keeps its own insets: it is a utility strip, not content.
  - **`draggable` and `resizable`** — per-widget overrides of the grid-wide rules. `:resizable="false"`
    drops the resize corner while the widget can still be moved, `:draggable="false"` does the
    opposite; `static` stays stronger than both because it is about the layout, not the interface.
    The grid enforces them itself rather than merely hiding a handle: the gesture and the keyboard
    both go through its context.
  - **`overflow`** (`auto | hidden`) — `hidden` drops both the scrollbar and the body's `Tab` stop
    (the body joins the tab order only when it actually overflows).
  - **`editActions`** — actions that belong to the edit mode (remove the widget, open its settings).
    They show up only in `mode="edit"`, in the header when there is one and in the overlay panel
    when there is not, while `actions` stays for product buttons that are visible at all times.
  - A widget with neither `title` nor `ariaLabel` no longer claims `role="group"`: a group without
    a name is announced as plain "group" and tells a screen reader nothing.
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
[0.1.0]: https://github.com/efureev/granularity/releases/tag/granularity-dashboard-v0.1.0
