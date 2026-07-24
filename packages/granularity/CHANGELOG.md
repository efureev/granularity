# Changelog

All notable changes to the [`@feugene/granularity`](.) package are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- **`GrToaster` action button.** `useToast().push` now accepts an optional
  `action: { label, onClick, dismissOnClick? }` — the toast renders a button in its body. By default a
  click runs `onClick` and dismisses the toast; `dismissOnClick: false` keeps it open (e.g. a "Retry"
  action on a sticky error). New exported type `ToastAction`.
- **`GrPagination` compact variant and page jumper.** New `compact` prop replaces the numbered page
  buttons with a "current / total" indicator for tight spots (mobile, table toolbars). New `show-jumper`
  prop adds a "go to page" input that jumps on Enter/blur, clamping the value to `[1, pageCount]`
  (label via `jumper-label` / the new `gr.pagination.jumpTo` string, localized en/ru/es).

## [v0.13.0] 2026-07-23

### Changed

- **Unified CSS token namespace under `--gr-*`.** The previously unprefixed shadcn-style semantic roles
  (`--bg`, `--fg`, `--card`, `--muted`, `--brd`, `--ring`, `--primary`, `--secondary`, `--accent`,
  `--destructive`, `--chart-*`, `--sidebar-*` and their `-fg`/`-hover`/`-active` variants) could collide
  with the consuming app's own CSS variables. Every token now lives in a single `--gr-*` namespace with
  three layers (primitives → semantic roles → per-component tokens), defined in the themes
  (`light.css`/`dark.css`) and formulas (`tokens.css`); all components reference only `--gr-*`. Theme
  customization is done via `--gr-*` (e.g. set `--gr-primary` to re-theme).

### Added

- New `GrForm` — form validation orchestration on top of `GrFormField`. Takes a reactive `model` and
  declarative `rules` keyed by field name (`required`, `min`/`max`/`len`, `pattern`, `type` email/url,
  and custom/async `validator` with access to the whole model). `GrFormField` gained a `name` prop:
  inside a `GrForm` it auto-sources its error message and required marker from the form and triggers
  validation on blur — so the actual controls (`GrInput` / `GrSelect` / `GrAutocomplete` / …) need **no
  changes**, they keep reading `invalid` / `id` / `aria-describedby` from the field context as before.
  Validation triggers (blur / change / submit) are configurable per form and per rule; `submit` only
  fires when valid; validation scrolls/focuses the first invalid field. Imperative API via template
  ref: `validate()` / `validateField()` / `clearValidate()` / `resetFields()` / `scrollToField()`.
  Default messages (`gr.form.*`) are localized (en/ru/es) and overridable per rule.
- New `GrSlider` — a WAI-ARIA slider for picking a number or a range by dragging. Supports single
  value and `range` (two thumbs that never cross), `step`, `min`/`max`, tick `marks` with labels, a
  value tooltip (`show-tooltip` + `format-tooltip`), sizes (`sm`/`md`/`lg`) and `disabled`. Each thumb
  is `role="slider"` with `aria-valuemin`/`max`/`now` and full keyboard support (Arrow, PageUp/Down,
  Home/End); clicking the track moves and focuses the nearest thumb. Integrates with `GrFormField`.
- New `GrAutocomplete` — a WAI-ARIA *editable combobox* for type-ahead search over options. Unlike
  `GrSelect` (a select-only combobox with a button trigger), here the text `<input role="combobox">`
  itself is the combobox: the typed text is the search query and choosing an option fills the field.
  Features:
  - Local filtering (`filterable`, default on) with an optional custom matcher (`filter`).
  - Remote / async loading via a debounced `search` event (`debounce`, `minQueryLength`) plus an
    externally-controlled `loading` prop — the component renders the spinner and the
    loading / no-results / "type at least N characters" states, the consumer owns the data fetch.
  - Free-text values (`allowCustomValue`) — commit a value that is not in `options` with Enter.
  - `multiple` with removable **chips** before the input (Backspace on an empty query removes the
    last one), replacing `GrSelect`'s "a, b, c" string presentation for multi-select.
  - Full keyboard support with `aria-activedescendant` (Arrow / Home / End / Enter), `clearable`,
    `#option` / `#empty` / `#loading` slots, and `GrFormField` integration (`id` /
    `aria-describedby` / `aria-invalid` / `aria-required`).

  It reuses the shared floating/dismiss infrastructure (`useFloating`, `useEscapeToClose`,
  `vClickOutside`) and does not depend on `GrSelect`. The search/async concerns were split out of
  `GrSelect` deliberately: the two components implement different ARIA patterns (select-only vs.
  editable combobox) and merging remote loading, races and min-query handling into `GrSelect` would
  overload its focus/aria semantics.
- `GrAutocomplete` translations (`gr.autocomplete.*`: `loading` / `noResults` / `addOption` /
  `typeMore`) added to the `en` / `ru` / `es` locale payloads.

### Testing / infrastructure

- Added an end-to-end **accessibility (axe) + visual-regression (Playwright)** layer in `apps/showcase`
  (`e2e/`, scripts `test:e2e` / `test:a11y` / `test:visual`). It runs against every component's live
  demos, so each new component is covered automatically (the list is derived from the generated API
  contract).
  - **a11y:** `axe-core` scans each component's rendered preview (`[data-example-preview]`) and gates
    on `serious`/`critical` violations minus a recorded baseline (`e2e/a11y-baseline.ts`) — catching
    regressions, new components with a11y gaps and debt growth, while existing debt is tracked openly
    for burn-down. `color-contrast` is handled as a separate design-token track (the `--muted-fg`
    token). Manual-ARIA components (`GrSlider`, `GrAutocomplete`, `GrTabs`, `GrTree`, `GrDropdown`,
    `GrModal`) pass the gate clean.
  - **visual:** screenshots the "Live examples" region of a representative component set in both light
    and dark themes, with committed baselines, to catch unintended token/style drift.

## [v0.12.0] 2026-07-20

### Added

- New `GrKbd` — a `<kbd>` primitive for keys/shortcuts (`size="sm" | "md"`).
- New `GrDivider` — content separator: horizontal line, optional centered/aligned label,
  or `orientation="vertical"` for inline separation.
- New `GrTabPanels` / `GrTabPanel` — accessible companion to `GrTabs`: pass a shared `idBase`
  to both and the panels link to their tabs via ARIA (`role="tabpanel"`, `aria-labelledby`
  ↔ tab `aria-controls`). `GrTabs` gained an optional `idBase` prop for this.
- `GrFormField`: now auto-generates the control `id` (linked to the label) and provides a
  field context so `GrInput` / `GrSelect` / `GrTextarea` inside it receive `aria-describedby`
  (hint + error), `aria-invalid` and `aria-required` automatically — no manual `forId`. Added
  `hint` (+ `#hint` slot) and `required` (marker), and the error now uses `role="alert"`.
- `GrDataTable`: controlled sort via `v-model:sortKey` / `v-model:sortDir` and a
  `sort-change` event, plus an `externalSort` prop that disables internal sorting for
  server-side / URL-synced sorting.
- `GrNumberInput`: WAI-ARIA spinbutton semantics (`role="spinbutton"`,
  `aria-valuenow`/`min`/`max`) and keyboard support (Arrow to step, Home/End to `min`/`max`).
- `GrNumberInput`: locale-aware display formatting — `useGrouping` groups thousands via
  `Intl.NumberFormat` (with an optional `locale`), showing the grouped value when blurred and
  the raw value on focus for editing.
- `GrInput`: `clearable` (clear button), `showCount` + `maxlength` character counter,
  `passwordToggle` (show/hide password visibility) and a `readonly` state. Clear/show-password
  labels are localized and overridable (`clearLabel` / `passwordShowLabel` / `passwordHideLabel`).

### Changed

- `GrImageViewer`: decomposed the 822-line SFC into composables (`useZoomPan`,
  `useWheelGesture`, `useViewerKeyboard`) — behaviour unchanged, now testable in isolation.

### Fixed

- Overlay scroll-lock is now global and reference-counted (shared `useScrollLock`), fixing a
  LIFO bug where closing one modal out of order restored `<body>` scrolling while another was
  still open; it also compensates for scrollbar width so content no longer shifts. Reused
  across `GrModal`, `GrDrawer` and `GrImageViewer`.
- `GrDrawer`: now locks background scroll, participates in the shared Esc stack (Esc closes the
  topmost overlay across render trees), and SSR-guards its teleport (`:disabled` on the server).
  `GrImageViewer` teleport is SSR-guarded too.
- `GrNumberInput`: `min`/`max` are now clamped on manual input (on `change`), a leading `-`
  can be typed for negative values, and the caret no longer jumps to the end when editing the
  middle of a number; large values are no longer formatted in scientific notation.
- `GrSelect` (panel mode): implemented the WAI-ARIA combobox/listbox pattern — keyboard
  navigation (Arrow/Home/End, Enter to select, typeahead), `aria-activedescendant` active-option
  tracking, `aria-haspopup="listbox"` + `aria-controls`, and removed the invalid `aria-readonly`.
- `GrDropdown`: now keyboard-accessible — exposes `triggerProps` (with `aria-haspopup="menu"`,
  `aria-expanded`, `aria-controls` and `@keydown`) to bind on a real trigger button; the menu
  supports Arrow/Home/End navigation and returns focus to the trigger on close.
- `GrTree`: implemented the WAI-ARIA tree pattern — roving `tabindex`, Arrow navigation with
  expand/collapse (Left/Right), Home/End, Enter/Space to select, and `aria-selected` on nodes;
  the default branch-line color now derives from `var(--brd)` so it adapts to dark themes.

## [v0.11.0] 2026-07-19

### Breaking

- Renamed the CSS namespace across the whole package: design tokens `--ds-*` → `--gr-*`
  and component attributes `data-ds-*` → `data-gr-*`. No aliases or fallbacks — consumers
  overriding tokens or querying `data-ds-*` must migrate.
- Theme storage key renamed `fint-ds-theme` → `gr-theme` (legacy-key migration removed).

### Added

- `GrSidebar` / `GrSidebarItem`: collapsible navigation rail with `v-model:collapsed`,
  icon fallback and badges.
- `GrButton`: polymorphism via `as` / `href` (+ `target` / `rel` / `external`) — renders as
  `<a>` or a custom element; during `loading` the element now keeps focus via
  `aria-disabled` instead of the native `disabled` attribute.
- `vHotkey`: `scope: 'global' | 'element'` option (`element` listens on the bound element,
  firing only when focus is inside it).
- `GrSelect`: per-option `disabled` and a labeled clear-option.
- `GrDialogService`: now a public subpath export (`./components/GrDialogService`) and
  registered in the granular-provider.
- `useToast` / `GrToaster`: per-toast `timeoutMs` auto-dismiss with pause-on-hover/focus
  (WCAG 2.2.1) and a shared toast-state plugin.

### Changed

- Theme system: `[data-theme]` is the canonical selector (`.theme-dark` / `.dark` kept as
  deprecated aliases) and `useTheme` is the single runtime API (persistence, cross-tab sync,
  `prefers-color-scheme`).
- Reworked design tokens, themes and base/preflight styles.
- `GrTree`: accessible labels for the drag handle and expand/collapse controls.

### Fixed

- `GrSelect`: duplicate Vue keys for same-value options across groups; native `multiple`
  selection now reflects the bound model (`:selected` per option).

## [v0.10.0] 2026-07-17

### Changed

- Overlay positioning migrated to `@floating-ui/dom` via a new internal `useFloating`:
  `GrSelect` (panel), `GrDropdown`, `GrTooltip` and `GrTreeSelect` panels now flip/shift and
  stay within the viewport instead of overflowing.
- Tighter `@feugene/fint-i18n` integration and expanded locale coverage (en/es/ru).

### Fixed

- `GrPagination`: page-range edge cases.

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
