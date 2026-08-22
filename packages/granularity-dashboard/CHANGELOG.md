# Changelog

All notable changes to `@feugene/granularity-dashboard` are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [v0.5.1] 2026-08-22

### Fixed

- **The grabbed drag handle used a tone as a foreground colour.** `--gr-primary` gives 3.70 against
  the dark theme's surfaces — below AA — so the handle dimmed exactly while being dragged. It uses
  `--gr-primary-text` now.

## [v0.5.0] 2026-08-20

### Added

- **A widget can be dragged from one dashboard to another.** Two boards on a page — working and
  archive, mine and the team's — had no way to exchange widgets except a "delete here, add there"
  button the application wrote itself.

  The gesture starts as an ordinary in-grid drag and **escalates** once the pointer leaves its own
  grid and lands over another one. Merely leaving the edge does not count: on a long page the
  pointer exits the grid constantly, and a widget that detached on every scroll-past would be
  unusable.

  While the widget is being carried it is **out of the source layout** — neighbours compact, and the
  preview honestly shows what will remain. The markup is still rendered by the application, so the
  element hides itself rather than losing its grid placement.

- **`itemTransferOut`** — the source grid removes the widget from its own layout and says so. This
  departs from the package's usual "the grid says where, the application places it" rule, and
  deliberately: removal is unambiguous — unlike insertion it needs no markup — and leaving it to the
  application would mean the same three `removeItem` lines in every consumer, with a widget on two
  dashboards at once for anyone who forgot.

  Only after a successful landing. Releasing between grids, pressing `Esc`, or coming back into the
  source grid carry nothing away — and the return does not interrupt the gesture: the in-grid drag
  continues from where it was.

- **`transferable`** on the grid — giving away and receiving are separate permissions. An archive
  board accepts widgets but hands none back. `static` widgets do not travel; they have no handle to
  begin with.

- `GrDashboardTransfer` gained `source: 'dashboard'` and `from` — the id of the grid a widget came
  from, so a receiver can tell a catalogue drop from a neighbour's widget.

### Changed

- `useDashboardTransfer` can now run a session it does not own: `adopt`, `moveTo`, `release` and
  `hasTargetAt` drive the same machinery as `start` (target resolution, per-frame flush, `Esc`,
  cleanup) while the points come from outside. A cross-grid transfer grows out of a drag the source
  grid already owns, and starting a second gesture on top of the first would split one stream of
  `pointermove` between two state machines.

## [v0.4.0] 2026-08-20

### Added

- **A widget can size itself to its content.** `auto-height` on `GrDashboardItem` measures what the
  widget actually renders and asks the grid for as many rows as it needs. Until now the height was a
  number the application had to guess on the user's behalf, and it guessed wrong every time the data
  changed: a twenty-row table got clipped by `overflow: auto`, a single big number left dead space
  underneath.

  What is measured is a **wrapper around the content**, not the widget body. The body's height is
  dictated by the grid cell, and its `scrollHeight` is `max(content, container)` — a widget could
  grow to fit its content but, once taller than it, would report its own height and never shrink
  back. The wrapper is only rendered when the prop is on, so widgets without it keep the DOM they
  had.

  Height is rounded **up** to a whole row: the grid is integral (`docs/model.md`, invariant 1), and
  a few pixels of slack at the bottom beat a clipped last row. This is the one place that rounds up
  — dragging the corner still snaps to the nearest cell, because there the user is aiming.

  `minH` and `maxH` still apply, `static` still refuses, and the measured height goes into the
  layout through the same `resizeItem` as every other size change — collisions and compaction
  included. The resize corner on such a widget changes width only: a height set by hand would be
  overwritten by the next measurement.

- **`itemAutoResize`** — emitted when content, rather than a person, changed a widget's height. The
  change still travels through `update:layout` (the layout stays the single source of truth), but an
  application that treats an edit as "unsaved changes" would otherwise prompt after a plain data
  load. `itemResize` remains user-only.

  Measurements arriving in one observer callback are applied as a single batch: ten widgets settling
  at once produce one `update:layout`, not ten.

### Documentation

- **Exporting and importing a layout as a file** — a recipe in `docs/model.md`. The package side was
  already complete (`serializeLayout`/`parseLayout` carry a version); what was missing was the thirty
  lines every application writes again: `Blob` download, `<input type="file">` upload, and what to do
  with a file that does not parse — `null` is a working answer, not a failure.

## [v0.3.0] 2026-08-19

### Added

- **Horizontal compaction.** `compact` now takes `'horizontal'` and `'both'` alongside
  `'vertical'` and `'none'`. `'horizontal'` slides widgets to the left edge and leaves their rows
  alone; `'both'` runs the two passes until neither moves anything. The iteration is not
  ceremony: a widget that slides left frees the cell above its neighbour, so a single
  up-then-left pass is not idempotent, and `compact(compact(l)) === compact(l)` is an invariant
  of this package. Overlapping input is still separated **downwards** in every mode — rows are
  unbounded, while `x + w <= cols` means a rightward push is not always resolvable. The mode
  travels through `moveItem`, `resizeItem`, `addItem`, `removeItem`, `deriveLayout` and
  `layoutFor` exactly as before: no signature changed.

- **`GrDashboardItemSettings`** — a dialog for one widget's settings, built on the core
  `GrDialog`. Its own content is the widget size in cells; everything the application owns
  arrives through the default slot. The size fields are bounded by what the grid will actually
  accept — `min(maxW, cols - x)`, not `cols`, because a widget grows rightwards and stops at the
  edge — and the change is committed through the grid, so compaction, `preventCollision` and
  `static` all still apply. A refusal keeps the dialog open with a message instead of closing
  over a change that never happened.
- **`GrDashboardItem` gained `showSettings` and a `settings` emit**; `GrDashboard` re-emits it as
  `itemSettings(id)`. The gear button lands where `#editActions` lands — the header when there is
  one, the overlay panel otherwise — and, unlike `#actions`, does not bring a header into
  existence. It exists only in `mode="edit"`.
- **Widgets can be dragged from the catalog into the grid.** `GrDashboardPalette` gained
  `draggable` (on by default), a `#ghost` slot and slot props on `#item`; `GrDashboard` gained
  `droppable` and an `itemDrop` event. The button stays exactly where it was and remains the
  keyboard path — dragging is an addition on top of a working route, not a replacement for it,
  because a catalog you can only drag from is a catalog you cannot use from a keyboard.
  The drop reports where it landed and the application places the widget, same as with the
  button: a grid that wrote the layout itself would produce a widget the application never
  rendered markup for. `breakpoint` and the grid's own `options` ride along in the event so that
  `addItem` reproduces exactly the cell the placeholder showed.
  Dragging by touch is deliberately not supported: it would need `touch-action: none` on a tile
  inside a list that has to scroll on a phone, and the button already does the job there.
- **`useDashboardTransfer`** — the model behind it, on a new subpath. The catalog sits outside
  `<GrDashboard>` and cannot sit inside (the grid root is a CSS Grid; any direct child becomes a
  cell), so the channel is module-level state next to the component tree rather than
  provide/inject. Nothing is ever written to it on the server: targets register from `onMounted`,
  a session starts from `pointerdown`.
- **`cellFromPoint`** in the `./layout` subpath: which cell a point falls into, treating the point
  as the centre of the incoming widget — the ghost hangs under the cursor, and the place has to
  land under it.
- `GrDashboardContext` gained `requestSettings`, `canResize` and `resizeItemTo`. The last is the
  only programmatic resize path and returns whether the layout actually changed: `resizeItem`
  refuses silently by handing back the original layout, and a caller that showed a form would
  otherwise read the refusal as success.

### Changed

- **In `'horizontal'` and `'both'` a widget cannot be parked in empty space to the right** — it
  slides back to the left edge. This mirrors the existing "you cannot drop a widget into empty
  space below"; `compact: 'none'` is still the free grid.
- `docs/model.md` no longer states that horizontal holes are deliberate. That paragraph described
  the absence of this feature, not a decision about it.

### Fixed

- **Moving and resizing from the keyboard did not emit `itemMove` / `itemResize`.** Both paths
  committed the layout and announced the result but stayed silent on the dedicated events, so an
  application listening to them saw pointer gestures only. Cancelling a keyboard move now emits
  the return trip too: every arrow press before it already reported a move, and without this the
  event trail ended somewhere the widget no longer is.

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

[Unreleased]: https://github.com/efureev/granularity/compare/granularity-dashboard-v0.3.0...HEAD
[v0.3.0]: https://github.com/efureev/granularity/compare/granularity-dashboard-v0.2.2...granularity-dashboard-v0.3.0
[v0.2.2]: https://github.com/efureev/granularity/compare/granularity-dashboard-v0.2.1...granularity-dashboard-v0.2.2
[v0.2.1]: https://github.com/efureev/granularity/compare/granularity-dashboard-v0.2.0...granularity-dashboard-v0.2.1
[v0.2.0]: https://github.com/efureev/granularity/compare/granularity-dashboard-v0.1.0...granularity-dashboard-v0.2.0
[0.1.0]: https://github.com/efureev/granularity/releases/tag/granularity-dashboard-v0.1.0
