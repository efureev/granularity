# Changelog

All notable changes to the [`@feugene/granularity-devtools`](.) package are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres
to [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [v0.3.2] 2026-08-31

### Fixed

- **Карта обязательных провайдеров пересобрана** после переезда `GrCodeBlock` из ядра в
  `@feugene/granularity-code`: панель больше не спрашивает провайдер у компонента, которого в ядре нет.

## [v0.3.1] 2026-08-28

### Changed

- The rationale for "tokens resolving to nothing" is corrected in the README. Preset `0.15.0` closed the
  `themes.tokensFile` blind spot the section was justified by — the fix landed on the feedback this package
  filed. Swapping the token file on `apps/playground` now moves `doctor` from 8 findings to 52.

  What the panel adds is no longer "the static check is blind here" but "the static check answers a different
  question": not «does any layer define this token in this configuration» but «is it empty right now, on this
  element». Measured on the same stand — healthy: `doctor` 8, panel 0; swapped: `doctor` 52, panel 11. The eight
  on a healthy stand are tokens `GrAlert` assigns itself with an inline style, which static analysis cannot tell
  apart from undefined.

## [v0.3.0] 2026-08-28

### Added

- **"Tokens resolving to nothing" section** on the component inspector — a `--gr-*` token that a rule of the
  component reads **without a fallback** while the browser resolves it to empty. Such a declaration is dropped
  at computed-value time, so the component renders with no background, no border, square corners — on a green
  build and valid CSS.

  The idea comes from `token-undefined`, added to `granular doctor` in preset `0.14.0`. The static check is
  blind where applications get it wrong most often: `themes.tokensFile` **replaces** the package's `tokens.css`,
  but the doctor treats the union of both files as defined. Measured on `apps/playground` against `0.14.1`,
  which closed the same gap for `themes.themeFiles` but not for `themes.tokensFile`: with the token file
  swapped, `getGranularThemeCss` drops from 22 504 to 15 703 bytes and loses `--gr-radius-control`, the doctor
  still reports the same 17 findings as before, and the panel names 11 empty typography and motion tokens.

  Only `--gr-*` counts. UnoCSS reads its own `--un-shadow-inset`, `--un-ring-inset` and `--un-space-y-reverse`
  without fallbacks across the utility layer; on a clean stand that is three findings of somebody else's
  internal machinery.

- **"Tokens the component reads" — four sections by owner**: `own`, `from other components` (named, so it is
  clear whose token a change would also touch), `foundation` and `unregistered`. Each row carries the value from
  computed style and a `has fallback` mark.

  This is the reverse of the existing "component tokens" section, and neither set contains the other: a declared
  token may go unconsumed, while what a component consumes is mostly somebody else's. A live `GrButton` on the
  playground reads twelve tokens, two of them its own. The chain is visible too — `--gr-button-primary-bg`, the
  customisation point, resolves to `#e546bd` because its fallback is `--gr-primary`, which the app repainted.

- The stylesheet index now also maps class → tokens its rules read, with a per-token "read without a fallback at
  least once" flag, reusing the same walk
  that backs "classes without rules": `@media` / `@supports` / `@layer` included, the last `var()` of a fallback
  chain counted (empty, it drops the declaration just the same).

## [v0.2.0] 2026-08-28

### Added

- **Console bridge `window.__GR_DEVTOOLS__`** with `snapshot()`, `waitFor(predicate, options)` and `version`.
  Tests see only the DOM, so "wait until the overlay layer is registered" used to be written as "wait 300 ms";
  the bridge answers that from the same snapshot the panel draws for a human. It works **without the panel
  being open**: the issue log and the channel subscription now live in `installGranularityDevtools()` rather
  than inside the DevTools setup, which only runs once someone opens the tab.
- E2E on the showcase covering the bridge — the overlay stack is asserted without a single `waitForTimeout`.

- **Layers are named after the component that opened them** — `GrPromptDialog #3` instead of `Modal #3` — in the
  tree, in the state and in the timeline.
- **Focus section for each layer**: whether focus is still inside, whether it will be restored on close and to which
  element. "Focus is inside" and "focus will be restored" are separate rows on purpose: they diverge for a layer
  opened with `restoreFocus: false`.
- The inspector and the bridge now read the stack **on demand** via `readLayers()` instead of replaying the last
  event, so focus is shown as it is now rather than as it was when the stack last changed.

- **"Granularity toasts" section** — the queue behind the visible stack: how many are alive, the ceiling
  (`maxToasts`) above which the oldest are evicted, each toast's tone, remaining timer and dedupe key. Without
  `app.use(granularityToastPlugin)` the queue lives in a module singleton and cannot be read from outside — the
  section says so instead of showing an empty list that reads as "no toasts".
- **Virtual list section on the component**: rendered against total, the window `[start, end)`, the size estimate
  and the measured average, with a note when the two drift far enough to make the list jump. Measured on the
  showcase: `GrDataTable` with 10 000 rows renders 14, window `[0, 14)`, estimate 49 px against 45 px measured.

- **"Granularity app" section** — state that belongs to the application rather than to a component: the theme
  with its **source** (saved by the user, system preference, or persistence off — the answer to "why is it dark,
  I picked light") and the toast queue.
- **"Classes without rules" section** — classes on the component's root and descendants that no CSS rule matches.
  This is what a safelist miss looks like from the browser: sizes work, colours are transparent, focus rings are
  gone. The selector index is built once per session and invalidated when `<style>`/`<link>` nodes change;
  cross-origin sheets cannot be read, and the section says the list is incomplete instead of staying silent.
- **Options**: `checks: 'all' | 'off'` turns off the missing-required-prop scan that runs on every tree node, and
  `eventLimit` sets the depth of the core's event buffer.
- **JSON report** action in the overlays section: layers, virtual lists, warnings and versions, copied to the
  console and — when the browser allows it — to the clipboard.

### Changed

- The console interception moved from the "Issues" section to `install`, and the log gained `subscribe()`:
  the section now follows the log instead of filling it. Restoring the console puts back the original
  functions, not `bind`-ed copies — the previous version layered a wrapper on every attach cycle.

## [v0.1.1] 2026-08-27

### Changed

- Inspector sections are now named after the package — `Granularity overlays` and `Granularity issues`. In the
  panel's plugin column only icons are visible, and the previous names (`Overlay layers`, `Issues`) were
  indistinguishable from other plugins' sections until you clicked one. The issues icon uses the canonical
  Material name `report_problem`: the panel expands `icon` into a `custom-ic-baseline-<icon>` class.

### Note

- The DevTools timeline does not record until you press its record button — an empty "Granularity overlays"
  timeline usually means recording is off, not that events are missing.

## [v0.1.0] 2026-08-27

### Added

- Package scaffold: `installGranularityDevtools()` registers a "Granularity" plugin in Vue DevTools via
  the plugin API of `@vue/devtools-api` 8.x. The descriptor sets `enableEarlyProxy` so that the setup
  runs before the user opens the DevTools tab — overlay layers and live-region announcements happen
  earlier than that, and without it the panel would start from an empty picture.
- **"Overlay layers" section.** A live inspector over the core's overlay stack: which layer owns Escape, which
  modals went `inert`, each modal's depth — plus a timeline of pushes, closes and Escape presses. An Escape
  that a layer swallowed (`closeOnEsc` off) is logged as a warning: that is exactly what "Escape does not
  work" looks like from the outside.
- **Component config section.** In the standard component inspector every prop is grouped by where its value
  came from: the markup, `componentDefaults` of the nearest `GrConfigProvider`, its global `size`, or the
  component's own default. "Was it passed?" is answered by `vnode.props` — the prop declaration cannot answer
  it, because a production SFC build strips `type` and `required`.
- **Component tokens section.** Declared tokens of the component with their computed values, the ones that
  stayed empty, and `--gr-*` variables set on the element that no registry knows — usually a typo.
- **Issues section.** Package warnings collected into one list with repeat counts, plus **missing required
  props**: the check Vue cannot perform after a production SFC build, restored from a map generated out of the
  core's `web-types.json` (38 components).
- **Announcements timeline.** What a screen reader would have said, observed through the live region's
  `data-gr-announcer-region` nodes — no core changes needed.
- **i18n check on startup.** With no adapter provided, components silently fall back to their built-in English
  strings; the panel now says so out loud. Key misses are out of scope — counting them would mean wrapping
  someone else's adapter.
- The plugin is a no-op on the server and under `NODE_ENV=production`. That guard alone is not enough under
  Vite, where `process` is undefined in the browser in both dev and production builds, so the documented way
  to mount the plugin wraps the call in `import.meta.env.DEV` — that is what keeps the call and the
  `@vue/devtools-api` import out of production bundles.
