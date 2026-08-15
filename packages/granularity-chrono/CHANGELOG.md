# Changelog

All notable changes to the [`@feugene/granularity-chrono`](.) package are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres
to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- Per-component documentation under `docs/components/` — one page per component, plus a
  `docs/components.md` index. Until now the only per-component description lived in the
  showcase app (`companionPackages.ts`), so it never reached the published tarball.
- `docs/a11y.md` — roles, what the live region announces and why, the `grid` pattern and the
  non-modal panel. The package was the only companion without it.
- `defineComponentDocsGate` from `@feugene/granularity-test-kit` wired in: a component
  without a page can no longer ship.

## [0.2.0] - 2026-08-12

### Fixed

- **The package's own strings could not be plugged into an app at all.** They shipped as a raw
  `grChronoMessages` object — no loader collection, no `./i18n` subpath — so there was nothing for
  `fint-i18n` to register, and every label, `aria-label` and panel title fell back to the English
  literal compiled into the component. In *every* language, not just the missing ones. The export
  existed, was used by nobody, and looked like localization. The package now mirrors the core: a
  block of its own (`grChrono` — squatting on the core's `gr` would collide silently on the first
  matching top-level key), one loader export per locale so bundlers can drop unused languages, an
  aggregate for demos, and the two subpaths (`./i18n`, `./i18n/all`) an app actually imports.

  It survived this long because nothing measured it. The package now carries the two gates the core
  has had all along: locale completeness (including "every key in the dictionary is asked for by a
  component, and vice versa") and an integration test on a **real** `fint-i18n` instance with a real
  component — the only thing that checks the seam between block name, loader shape, JSON structure
  and the keys components ask for. A mock adapter answers any key and would never have caught it.

## [0.1.0] - 2026-08-12

### Added

- **`GrRelativeTime` and `useChronoNow`.** The package could pick a moment but not show one:
  "3 minutes ago" was left to the consumer, along with a `setInterval` per instance. The unit is
  chosen in two modes, and that is the whole design: below a day by elapsed time — a second is a
  second and the calendar has no say — and from a day up by plain tuples. So a month stays a month
  in February and in July, while a day that lasted 23 hours because of a clock change is called
  hours, because that much time really did pass. The string comes from `Intl.RelativeTimeFormat`,
  so the component speaks every language the engine knows and adds not one string to the package
  locales. `cutoff` switches to a plain date once the relative form stops helping: "347 days ago"
  helps nobody.

  Live text needs a shared "now". `useChronoNow(interval)` keeps **one timer per tick**, not per
  component — a hundred rows of a feed cost one `setInterval` — drops the timer on a hidden tab and
  refreshes the value the moment the tab comes back, rather than an interval later. The tick is not
  a prop: the component derives it from the current unit (seconds every five seconds, months every
  hour), so an aging value slows itself down and the subscription moves between tickers on its own.
  A `0` tick means "do not tick", which is what `base` and `live=false` use to avoid starting a
  timer at all.

- **`differenceInMonths`** in the public arithmetic: **full** months between two dates, day of the
  month accounted for. It was the gap that made the rest of the date maths look complete and
  wasn't.

- **The `weekday` slot on the calendar header.** The grid advertised three slots — `day`,
  `header`, `weekday` — but only shipped the first two, so a consumer who wanted single-letter
  columns or their own header markup had nothing to override. The slot hands over the short
  label, the full name and `isoWeekday`: the ISO number is what tells a weekend column from a
  weekday one without guessing which day the locale starts the week on. It is forwarded by
  `GrDatePicker`, `GrDateTimePicker` and `GrDateRangePicker` — a slot the pickers declare but
  do not pass down is a slot that only works on the bare grid.

- **Selection is announced to screen readers.** Moving through the grid or a time column reads
  itself: the reader speaks the focused cell and the active option. Selection does not —
  `aria-selected` flips on the cell the focus is already on, so a click or `Enter` was
  indistinguishable from nothing at all. A chosen day is now announced as a full date, a chosen
  month or year as the whole period, and a chosen time as the assembled value: the columns are
  four, and "30" on its own says nothing. The range picker announces state rather than a date —
  "start selected, choose the end", both bounds when the period closes, and a refusal when the
  click missed `minRange`/`maxRange`, which used to be silent. The announcement comes after any
  view shift, because a period change announces itself and would overwrite it; and it is one
  message per action — inside the range the grid stays quiet (`announce-selection="false"`) and
  the shell does the talking, since two messages in one live region cut each other off.

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

- **The package is ready to publish.** It ships a `LICENSE` (the `license` field pointed at a
  file that did not exist), four documentation pages under `docs/` — the value and its adapters,
  the keyboard contract, the tokens, and SSR — and the release now runs from CI on a
  `granularity-chrono-v*` tag, npm and GitHub Packages alike.

- **Server rendering is covered by a gate.** The clock is read once per instance through a
  single `clockDate()`, never during a re-render; the one place where the markup depends on it —
  the shown month, when neither `today` nor `viewDate` nor a value is given — marks itself with
  `data-allow-mismatch="children"`, so hydration stays quiet and the fix is data rather than a
  flag: pass `today` and the attribute disappears. The stand renders all five components on a
  server and hydrates them, and the marker is verified by effect: distort the server HTML and
  the mismatch must stay silent where it is marked and must be reported where it is not.

- **Typing a date or a time by hand** (`editable` on `GrDatePicker` and `GrTimePicker`). The
  part order, the separator and the format hint come from `Intl`, not from a pattern string:
  `08/12/2026` in `en-US`, `12.08.2026` in `ru`. Parsing does not care which separator was
  typed — only the digits matter. While the user types, the model is left alone: the field
  holds a draft and commits on `Enter` or on blur (`applyOnBlur`), and text that does not parse
  falls back to the model's value rather than sitting in the field as a value that does not
  exist. Not offered where a single string would describe two values — the datetime and range
  pickers — nor in the month and year modes.

- **The provider now reports the right `packageBaseUrl`.** It was computed in the shared module
  from `import.meta.url`, and the bundler is free to either split that module into a chunk or
  inline it into the entry — one level apart. Inlined, the base pointed at the package root, so
  the preset looked for `components/<Name>/` where there are none and **silently skipped the
  scan**: only the safelist kept the CSS alive. The entry computes it now, and its location is
  fixed by the build config. The component registry is also re-exported from the browser entry,
  the way the core does it.

- Time columns scroll to the selected value when the panel opens. The navigation primitive
  puts the cursor there but never scrolls, so a 24-value column opened at midnight while 09:30
  sat off-screen.

- **Replaces `@feugene/granularity-datepicker`,** which is removed from the repository in the
  same change. The predecessor was a wrapper over `@vuepic/vue-datepicker`: its failures were
  structural — the theme never applied because the widget redefined the same variables one
  level deeper, and `id`/`name`/`aria-*` could not be set at all because the `<input>` was not
  ours. Nothing here wraps anything.

- **Month and year grids** (`mode="month"` / `mode="year"` on `GrCalendar` and `GrDatePicker`)
  reuse the same roving-focus primitive — only the column count differs, seven days against
  three periods. A period is selectable when at least one of its days is within bounds, so a
  month with `min` in the middle stays available; February of a leap year is not cut off at
  the 28th. The decade grid pads with one neighbouring year on each side, the way the day grid
  pads with neighbouring months.

- **`inline` on every picker** — the panel is drawn in place, without a field or a popover,
  while the model, the value adapter and the `name` stay the picker's own. That is what
  separates it from a bare `GrCalendar`, which speaks tuples. The panel markup is still
  written once: what `inline` changes is only what wraps it.

- `GrCalendar` renames what stopped being about months: `goToMonth` → `goToPeriod`,
  `monthChange` → `periodChange`.

- **`GrDateRangePicker`** — a period picked with two clicks, previewed on hover, with
  `minRange`/`maxRange` limits counted inclusively. The highlight is computed at render from
  tuple comparisons: the grid builder still knows nothing about selection, which is what keeps
  mouse movement from rebuilding 42 cells per frame — now pinned by a test, not just a comment.
  Both bounds go to a native form as two hidden inputs sharing one name, the way
  `FormData.getAll` reads them.

- **`GrDateTimePicker`** — the month grid and the time columns in one panel, with `autoApply`.
  The prop lands here rather than on `GrDatePicker` because only here does confirmation stop
  being a tautology: picking a date is atomic, picking a date *and* a time is not. With
  `autoApply` every step goes out immediately; without it the panel edits a draft that is
  taken on open and only leaves through the confirm button. Time bounds apply inside the
  boundary day only — `min = 2026-08-12T09:00` says nothing about the 13th.

- **`GrTimePicker`** — a field with a panel of column listboxes: hours, minutes, optionally
  seconds, and a period column in 12-hour locales. Arrow keys, `Home`/`End` and
  `aria-activedescendant` come from the core's `useComboboxNavigation`, so the keyboard
  contract is the one `GrSelect` already implements. The panel does **not** close on a pick:
  a time takes several of them, and closing after the first would mean reopening for every
  unit. Which values are out of bounds is decided per unit — with `min = 09:30` the 9 o'clock
  hour stays selectable while the minutes before 30 do not.

- The picker shell — form-control contract, `v-model:open`, lazy panel mounting, field
  keyboard, clearing, serialization for the native form — now lives in one composable shared
  by the pickers. `GrDatePicker` moved onto it with its tests untouched.

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
