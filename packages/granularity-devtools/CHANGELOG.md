# Changelog

All notable changes to the [`@feugene/granularity-devtools`](.) package are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres
to [Semantic Versioning](https://semver.org/).

## [Unreleased]

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
