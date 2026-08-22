# Changelog

All notable changes to the [`@feugene/granularity-chrono`](.) package are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres
to [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [v0.9.1] 2026-08-23

### Fixed

- **The i18n docblock named the wrong block.** It said keys live under `gr`, «like the core», while
  the package declares `grChrono` (`GR_CHRONO_I18N_BLOCK`) and everything else — README, loaders,
  the integration gate — agrees with that. A consumer who trusted the comment registered `gr` and
  got no chrono translations, with a failure quiet enough to miss: the calendar grid still reads
  correctly because it comes from `Intl`, only panel labels and `aria-label`s stay English.

## [v0.9.0] 2026-08-20

### Added

- **Manual input in `GrDateTimePicker` and `GrDateRangePicker`.** `editable` now works on all four
  pickers. One string describes two values here — a date with a time, or two bounds — and that is a
  parser of its own, which is why these two came last.

  Parsing is driven by `Intl`, not by a pattern string. Which half of the string is the date and
  which is the time, in what order the parts come and what separates them is known by the locale:
  `vi` puts the time first (`15:30 12/8/26`), `ko` puts the day period before the hour
  (`오후 3:30`), `en-US` after it. Separators themselves are never matched — digit groups are
  counted instead. That is what makes `en-CA`, where the date is itself written with hyphens
  (`2026-08-12 - 2026-08-14`), split correctly; a list of range separators would have broken on the
  first such locale.

  For the range, the string is split in half by digit-group count and each half is parsed as a
  bound. Reversed order is normalised, exactly as clicking backwards is. **A single date is
  rejected**: one date is not a period, and inventing the other bound would make up something the
  user never entered. Time is accepted precisely when the picker shows it — required on both bounds
  with `enable-time`, refused without it. A parsed but disallowed period (`disabledDates`, `min`,
  `max`, `minRange`, `maxRange`) is not applied and **is announced**: the input was well formed, and
  silence would read as a lost `Enter`.

  For the datetime picker, a bare date keeps the model's time — what was not typed does not change.
  Typed text commits the model directly, bypassing `autoApply`: that prop governs the panel, where
  selection is multi-step, while `Enter` in the field is already a finished action.

  Neither field masks input: a mask would have to guess where the date ends and the time begins, and
  fight the caret on deletion.

- **The panel follows what is being typed.** In all four editable pickers, a fully typed date is
  highlighted in the grid and the grid moves to its month; a typed hour is highlighted in the hours
  column, minutes in the minutes column. The model is untouched until `Enter` or blur — this is a
  preview, not a commit. Parts that were not typed keep their current value.

  Typing into a panel that still shows the previous value is exactly the blind spot a text field was
  supposed to remove, so the draft is parsed on every keystroke: completely for the date, part by
  part for the time.

### Fixed

- **An editable field now shows what it can parse back.** With `editable`, values are rendered as
  digits (`08/12/2026`) instead of `Aug 12, 2026`. Editing a number in place used to leave the
  parser two digit groups instead of three, so the edit was silently rolled back although the user
  had done nothing wrong. An explicit `format` still wins. This also affects `GrDatePicker`, where
  the same defect had been present since `editable` was introduced.
- **A disallowed date is no longer accepted as text.** `disabledDates`, `min` and `max` now apply to
  `Enter` in the field the same way they apply to a click, in all three editable pickers. The grid
  refuses such a day; the field used to take it.
- **A time column now scrolls to a selection that changed while it was open.** Scrolling happened
  only when the panel opened, so a value set from anywhere else — typing in the field, an external
  `v-model` write — stayed off-screen and the highlight was useless. Jumping to a new value also
  centres it instead of stopping at the nearest edge: an hour pinned to the bottom of the column
  reads as "nothing below". Stepping with arrow keys still stops at the edge, so the list does not
  jump under the hand.
- **Clicking an editable field no longer moves focus into the panel.** The panel opens, as before,
  but focus stays where the user put it: they came to type. Keyboard opening (`↓`) still moves into
  the grid — that is what it means.
- **Quick ranges honour `enable-time`.** A footer preset committed two midnights while the same two
  dates picked by hand got 00:00 and the end of day, so "last 7 days" quietly dropped the final day.

## [v0.8.0] 2026-08-20

### Added

- **`enable-time` on `GrDateRangePicker` — a window, not two midnights.** A shift from 8:00 Monday to
  20:00 Wednesday, a maintenance window, a two-day room booking: until now this had to be assembled
  from separate fields, because the range picker gave two midnights and the datetime picker a single
  moment.

  A freshly picked pair gets **00:00 and 23:59** — the whole span of days. The end lands on the same
  grid as the columns, so `minute-step="15"` gives 23:45: otherwise the minutes column would have no
  selected option and the end could not be read where it is edited. At the default step of a minute
  it is exactly 23:59. Two midnights would look
  symmetrical, but "1 to 3 August" means all of the third to a person, and `[1 Aug 00:00, 3 Aug
  00:00)` quietly drops almost all of it: the classic reporting bug. With `enable-seconds` the end
  gets 23:59:59. Both values are visible and editable.

  **No four-step wizard**, which is what the spec had assumed this feature would need. Dates are
  picked with the same two clicks as before and the times are edited whenever, in any order. Stepping
  would introduce hidden "which step are we on" state that a person who mis-clicks can only escape by
  walking the whole thing again.

  **The panel no longer closes on the second date** when time is on: selection is not finished there,
  and closing would take away the very columns the prop was enabled for.

  **Inside a single day only the time keeps the ends in order.** An edit that would put the end
  before the start is not applied and is announced — the same way a disallowed length is refused
  today: the user simply mis-aimed, and there is nothing to reset.

  `minRange` and `maxRange` still count **days**. Changing the unit of existing props would break
  consumers; a minute-level limit is `minDuration`/`maxDuration`, and those arrive when asked for.

  `minuteStep`, `secondStep`, `enableSeconds` and `use12Hours` carry the same names they have on
  `GrDateTimePicker`, so the two pickers do not drift apart.

## [v0.7.0] 2026-08-20

### Added

- **`multiple` on `GrDatePicker` — a set of dates, not a range.** Class schedules, exception days,
  booked dates: an arbitrary set where adjacency means nothing. Until now this had no expression at
  all — `GrDatePicker` held one date and `GrDateRangePicker` two ends of a continuous span, leaving
  the application with its own grid or a list of fields.

  Clicking a selected date **removes** it: a set is a toggle, not an accumulator, or there would be
  no way to undo a mistaken pick. The panel stays open — a set is accumulated, whereas a single date
  is chosen once, and closing after the first click would turn ten dates into ten openings.

  The model always arrives sorted ascending, wherever you clicked. It has to be comparable:
  reordering must not read as a change, or "unsaved edits" fires on nothing.

  Manual entry is off in this mode even with `editable`. One string describing N dates is a separate
  parser with its own behaviour on partial input, and the package does not have it yet.

  The field shows the first three dates and the rest as a count ("and 2 more") — without a cap the
  label overflows by the fifth. The form receives one hidden field per date, sharing a name, as
  `FormData.getAll` reads them. `min`, `max` and `disabledDates` apply per date.

- **`selectedDates` on `GrCalendar`** — painting only, exactly like `rangeStart`/`rangeEnd`. The grid
  answers one question, how to colour a cell; adding, removing, sorting and length rules belong to
  the picker. Membership is tested against a `Set` rebuilt once per set change: walking the array for
  each of the forty-two cells would make highlighting quadratic.

- `separator` on `GrDatePicker` — what joins the dates of a set in the field.

## [v0.6.0] 2026-08-20

### Added

- **`GrTimePicker`'s footer hands the selection inward.** The `footer` slot now receives
  `select`, `canSelect` and `close` — the same trio the date pickers already pass — so an
  application can finally put a "now" button there. Until now the slot took no props at all: there
  was neither a way to pick a time nor a way to ask whether one was allowed.

  Time snaps **up** to the step: 14:37 with a 15-minute step gives 14:45, not 14:30. A time in a
  picker almost always means "starting from this moment" — a booking, a reminder, an appointment —
  and a value rounded down has already passed. This is the mirror of the columns, which round
  **down** when displaying an existing value; there the task is the opposite, not to invent a slot
  the column does not have.

  The coarsest declared step wins and finer units zero out, so `minuteStep: 15` yields `14:45:00`
  rather than `14:45:37`. With seconds switched off they stay out of the value too — otherwise the
  model would carry what was never on screen.

  **Bounds are checked after snapping, not before.** With `max` at 14:40 and a 15-minute step, a
  "now" of 14:37 snaps to 14:45 — already past the bound — and `canSelect` returns `false`. The
  button arrives disabled instead of silently doing nothing; checking before the snap would have let
  it through.

- **`quarter` mode** in `GrCalendar` and `GrDatePicker` — four cells in two columns (three would
  leave one cell alone on the second row). The value is the first day of the quarter. Labels come
  from the package's own locale strings: `Intl` does not name quarters at all, and `Q1` vs `1 кв.`
  is interface text rather than locale-dependent data.

- **`week` mode** — drawn with the **day grid**, not the period grid. Twelve cells in three columns
  would be twelve weeks on screen: a quarter of a year without a single month label, with nothing to
  aim at. Instead, clicking any day selects the week it belongs to and the whole row highlights.

  The value is the **start** of the week, so the shape of the model stays the same across all five
  modes and `valueAdapter` keeps working as before. The first day comes from the locale, as
  everywhere else — in the US the same date falls in a week starting on Sunday. Week numbers are not
  shown: ISO and US number them differently and `Intl` does not provide them.

- `startOfWeek(date, firstDayOfWeek)` and `ceilToStep(time, stepSeconds)` are exported — the twins
  of `leadingOffset` (which was internal) and `floorToStep`.

### Fixed

- **`GrTimePicker`'s footer had no container of its own.** Slot content sat flush against the
  columns and read as their continuation rather than a separate action. It now gets the same wrapper
  the date pickers' footer uses — a hairline rule and spacing — so the two pickers look alike, which
  was the point of giving the slot the same props.

## [v0.5.0] 2026-08-19

### Added

- **Quick ranges live in the picker panel.** `GrDateRangePicker` and `GrDatePicker` gained a
  `presets` prop — a row of shortcuts in the panel footer: «Today», «Last 7 days», «This month».
  Bounds may be given as a function, so «last 7 days» counts from today rather than from the day
  the prop was declared. A shortcut whose range falls outside `min`/`max`, touches `disabledDates`
  or breaks `minRange`/`maxRange` arrives disabled: a button that does nothing lies about what it
  does. The docs used to redirect this to `GrSegmented` next to the field, and for a single date
  that still holds — but a range shortcut has to set **both** bounds and respect the length limits,
  which is knowledge only the picker has.
- **The `footer` slot now carries the selection.** `GrDateRangePicker` passes `setRange`,
  `canSetRange` and `close`; `GrDatePicker` and `GrCalendar` pass `select`, `canSelect` (and
  `close` for the picker). A custom footer replaces the preset row entirely and gets exactly the
  same rules, so it cannot select a value the grid would refuse.
- **`GrDuration` — how long it lasted, not when it happened.** «2 h 30 min» from a number of
  seconds, from a pair of dates, or counted live from a starting moment. Unit names and numeral
  agreement come from `Intl`, so the component ships no strings of its own; the markup is `<time>`
  with an exact ISO 8601 duration in `datetime` even when the text is shortened.
- **Duration arithmetic is public**: `selectDurationParts`, `formatDuration`, `durationToIso` and
  `resetDurationFormatCache`. Units stop at days — months and years are calendar-bound, and
  deriving them from a count of seconds cannot be done without lying. `maxUnits` is a ceiling
  rather than a quota (exactly two hours reads «2 h», not «2 h 0 min»), and the smallest shown unit
  is truncated rather than rounded, so the display never runs ahead of the time that actually
  passed. Where `Intl.DurationFormat` is missing — the package declares Node `>=22`, which has no
  such API, and the SSR harness runs in Node — the same string is assembled from
  `Intl.NumberFormat` with `style: 'unit'`.

### Changed

- **The panel footer moved out of the calendar grid into the picker panel.** Rendered inside
  `[data-gr-calendar]` it had no padding of its own: the panel hands its background and spacing to
  the calendar. Anything already using the `footer` slot of `GrDatePicker` or `GrDateRangePicker`
  now sits one level higher in the DOM.

## [v0.4.0] 2026-08-19

### Changed

- **Control-scale font sizes now ship a paired line height.** The calendar, the time picker and
  the shared picker field set the matching `leading-*` next to every control font size, from the
  core's new `--gr-control-leading-*` steps. Before this the line height came from the host
  application's `body` as an absolute value, so a 12px picker caption inherited whatever the host
  had set. Requires core `>=0.27.0`.

### Added

- **`weekStart` can now be set once for the whole application** through
  `<GrConfigProvider :component-defaults="{ GrCalendar: { weekStart: 7 } }">`. The prop existed on the calendar and on
  all three pickers, but only per instance — an application whose working week starts on Sunday regardless of interface
  language had to repeat it at every call site, and miss one to get two different calendars on one screen. The key is
  `GrCalendar` and there is deliberately no per-picker one: the pickers render that same calendar, so a second key would
  be two names for one setting. Resolution order is the usual one — a prop on the spot beats the config, the config
  beats the locale — and with neither set `Intl` still decides, which is what makes the default right in every country
  without anybody configuring anything.

### Fixed

- **`showWeekNumbers` was typed as configurable and was not.** `GrCalendar` declared it in its defaults registry, so the
  key type-checked and the IDE suggested it, but the component read `props.showWeekNumbers ?? false` and never looked at
  the provider. Nothing failed: the setting was simply ignored, silently, which is the worst way for a contract to be
  broken. The gate did not catch it either — `defineComponentDefaultsGate` checks that a declaration exists, not that
  the component reads it.
- **The pickers overrode that setting even once it worked.** `GrDatePicker`, `GrDateRangePicker` and `GrDateTimePicker`
  defaulted `showWeekNumbers` to `false` rather than `undefined` and passed that value straight down, so an explicit
  "no" from the picker beat the application's "yes" from the provider. They now pass the prop through untouched and let
  the calendar resolve it.

## [v0.3.1] 2026-08-18

### Changed

- Release-only bump: the workspace playground apps still pinned the core at
  `^0.20.0`, so yarn resolved a published copy for them instead of linking the
  workspace, and their uno config scanned that copy's `dist`. The pins are
  updated to the current range; nothing in this package's runtime changed.

## [v0.3.0] 2026-08-18

### Fixed

- **A picker field clipped its value with no way to read the rest.** A range showed as "18 июл. 2026 г. — 17 …" and the
  end of the period was simply gone:
  the field is `readonly` and a click opens the panel, so it could not even be scrolled. All four pickers now hand the
  full value over as a native tooltip on hover, using `titleWhenTruncated` from the core package — and only when the
  value is actually clipped, so a field that fits stays quiet.

### Added

- Per-component documentation under `docs/components/` — one page per component, plus a
  `docs/components.md` index. Until now the only per-component description lived in the showcase app
  (`companionPackages.ts`), so it never reached the published tarball.
- `docs/a11y.md` — roles, what the live region announces and why, the `grid` pattern and the non-modal panel. The
  package was the only companion without it.
- `defineComponentDocsGate` from `@feugene/granularity-test-kit` wired in: a component without a page can no longer
  ship.

## [0.2.0] - 2026-08-12

### Fixed

- **The package's own strings could not be plugged into an app at all.** They shipped as a raw
  `grChronoMessages` object — no loader collection, no `./i18n` subpath — so there was nothing for
  `fint-i18n` to register, and every label, `aria-label` and panel title fell back to the English literal compiled into
  the component. In *every* language, not just the missing ones. The export existed, was used by nobody, and looked like
  localization. The package now mirrors the core: a block of its own (`grChrono` — squatting on the core's `gr` would
  collide silently on the first matching top-level key), one loader export per locale so bundlers can drop unused
  languages, an aggregate for demos, and the two subpaths (`./i18n`, `./i18n/all`) an app actually imports.

  It survived this long because nothing measured it. The package now carries the two gates the core has had all along:
  locale completeness (including "every key in the dictionary is asked for by a component, and vice versa") and an
  integration test on a **real** `fint-i18n` instance with a real component — the only thing that checks the seam
  between block name, loader shape, JSON structure and the keys components ask for. A mock adapter answers any key and
  would never have caught it.

## [0.1.0] - 2026-08-12

### Added

- **`GrRelativeTime` and `useChronoNow`.** The package could pick a moment but not show one:
  "3 minutes ago" was left to the consumer, along with a `setInterval` per instance. The unit is chosen in two modes,
  and that is the whole design: below a day by elapsed time — a second is a second and the calendar has no say — and
  from a day up by plain tuples. So a month stays a month in February and in July, while a day that lasted 23 hours
  because of a clock change is called hours, because that much time really did pass. The string comes from
  `Intl.RelativeTimeFormat`, so the component speaks every language the engine knows and adds not one string to the
  package locales. `cutoff` switches to a plain date once the relative form stops helping: "347 days ago"
  helps nobody.

  Live text needs a shared "now". `useChronoNow(interval)` keeps **one timer per tick**, not per component — a hundred
  rows of a feed cost one `setInterval` — drops the timer on a hidden tab and refreshes the value the moment the tab
  comes back, rather than an interval later. The tick is not a prop: the component derives it from the current unit
  (seconds every five seconds, months every hour), so an aging value slows itself down and the subscription moves
  between tickers on its own. A `0` tick means "do not tick", which is what `base` and `live=false` use to avoid
  starting a timer at all.

- **`differenceInMonths`** in the public arithmetic: **full** months between two dates, day of the month accounted for.
  It was the gap that made the rest of the date maths look complete and wasn't.

- **The `weekday` slot on the calendar header.** The grid advertised three slots — `day`,
  `header`, `weekday` — but only shipped the first two, so a consumer who wanted single-letter columns or their own
  header markup had nothing to override. The slot hands over the short label, the full name and `isoWeekday`: the ISO
  number is what tells a weekend column from a weekday one without guessing which day the locale starts the week on. It
  is forwarded by
  `GrDatePicker`, `GrDateTimePicker` and `GrDateRangePicker` — a slot the pickers declare but do not pass down is a slot
  that only works on the bare grid.

- **Selection is announced to screen readers.** Moving through the grid or a time column reads itself: the reader speaks
  the focused cell and the active option. Selection does not —
  `aria-selected` flips on the cell the focus is already on, so a click or `Enter` was indistinguishable from nothing at
  all. A chosen day is now announced as a full date, a chosen month or year as the whole period, and a chosen time as
  the assembled value: the columns are four, and "30" on its own says nothing. The range picker announces state rather
  than a date —
  "start selected, choose the end", both bounds when the period closes, and a refusal when the click missed `minRange`/
  `maxRange`, which used to be silent. The announcement comes after any view shift, because a period change announces
  itself and would overwrite it; and it is one message per action — inside the range the grid stays quiet
  (`announce-selection="false"`) and the shell does the talking, since two messages in one live region cut each other
  off.

- **Date and time arithmetic on plain tuples** (`{y, m, d}` / `{h, min, s}`): month and year shifts, month length, leap
  years, comparison, ranges, ISO weekday and week number, the month grid builder, cached `Intl` wrappers and the `Date`
  boundary with `date`/`isoDate`/
  `isoDateTime`/`timestamp` adapters. `Date` arithmetic is a source of DST bugs — on a transition day the tuple is
  immune by construction. No date library is involved, and everything locale-dependent comes from `Intl`, so the package
  speaks every language the engine knows rather than the ones we listed.

- **`GrCalendar`** — the month grid as the WAI-ARIA `grid` pattern: roving tabindex with exactly one tab stop, arrows
  across days and weeks, `Home`/`End` as week bounds,
  `PageUp`/`PageDown` for the month, `Shift` with them for the year. The grid edge pages the month instead of wrapping,
  and the month change is announced — otherwise arrow navigation is silent for a screen-reader user. Disabled days keep
  `aria-disabled` and stay in the traversal.

- **`GrDatePicker`** — a field with a calendar panel. The field is the package's boundary:
  it speaks `Date` (or whatever `valueAdapter` says) outward and tuples inward. It is a real form control — own `id`/
  `name`, `GrFormField` wiring, `aria-invalid`/`aria-required`, sizes from `GrConfigProvider`, `v-model:open` — all of
  which the predecessor could not do at all, because its `<input>` belonged to a third-party widget. The panel mounts on
  first open, not on page load: a form with several pickers would otherwise build a 42-cell grid per picker before
  anyone clicked anything.

- **The package is ready to publish.** It ships a `LICENSE` (the `license` field pointed at a file that did not exist),
  four documentation pages under `docs/` — the value and its adapters, the keyboard contract, the tokens, and SSR — and
  the release now runs from CI on a
  `granularity-chrono-v*` tag, npm and GitHub Packages alike.

- **Server rendering is covered by a gate.** The clock is read once per instance through a single `clockDate()`, never
  during a re-render; the one place where the markup depends on it — the shown month, when neither `today` nor
  `viewDate` nor a value is given — marks itself with
  `data-allow-mismatch="children"`, so hydration stays quiet and the fix is data rather than a flag: pass `today` and
  the attribute disappears. The stand renders all five components on a server and hydrates them, and the marker is
  verified by effect: distort the server HTML and the mismatch must stay silent where it is marked and must be reported
  where it is not.

- **Typing a date or a time by hand** (`editable` on `GrDatePicker` and `GrTimePicker`). The part order, the separator
  and the format hint come from `Intl`, not from a pattern string:
  `08/12/2026` in `en-US`, `12.08.2026` in `ru`. Parsing does not care which separator was typed — only the digits
  matter. While the user types, the model is left alone: the field holds a draft and commits on `Enter` or on blur
  (`applyOnBlur`), and text that does not parse falls back to the model's value rather than sitting in the field as a
  value that does not exist. Not offered where a single string would describe two values — the datetime and range
  pickers — nor in the month and year modes.

- **The provider now reports the right `packageBaseUrl`.** It was computed in the shared module from `import.meta.url`,
  and the bundler is free to either split that module into a chunk or inline it into the entry — one level apart.
  Inlined, the base pointed at the package root, so the preset looked for `components/<Name>/` where there are none and
  **silently skipped the scan**: only the safelist kept the CSS alive. The entry computes it now, and its location is
  fixed by the build config. The component registry is also re-exported from the browser entry, the way the core does
  it.

- Time columns scroll to the selected value when the panel opens. The navigation primitive puts the cursor there but
  never scrolls, so a 24-value column opened at midnight while 09:30 sat off-screen.

- **Replaces `@feugene/granularity-datepicker`,** which is removed from the repository in the same change. The
  predecessor was a wrapper over `@vuepic/vue-datepicker`: its failures were structural — the theme never applied
  because the widget redefined the same variables one level deeper, and `id`/`name`/`aria-*` could not be set at all
  because the `<input>` was not ours. Nothing here wraps anything.

- **Month and year grids** (`mode="month"` / `mode="year"` on `GrCalendar` and `GrDatePicker`)
  reuse the same roving-focus primitive — only the column count differs, seven days against three periods. A period is
  selectable when at least one of its days is within bounds, so a month with `min` in the middle stays available;
  February of a leap year is not cut off at the 28th. The decade grid pads with one neighbouring year on each side, the
  way the day grid pads with neighbouring months.

- **`inline` on every picker** — the panel is drawn in place, without a field or a popover, while the model, the value
  adapter and the `name` stay the picker's own. That is what separates it from a bare `GrCalendar`, which speaks tuples.
  The panel markup is still written once: what `inline` changes is only what wraps it.

- `GrCalendar` renames what stopped being about months: `goToMonth` → `goToPeriod`,
  `monthChange` → `periodChange`.

- **`GrDateRangePicker`** — a period picked with two clicks, previewed on hover, with
  `minRange`/`maxRange` limits counted inclusively. The highlight is computed at render from tuple comparisons: the grid
  builder still knows nothing about selection, which is what keeps mouse movement from rebuilding 42 cells per frame —
  now pinned by a test, not just a comment. Both bounds go to a native form as two hidden inputs sharing one name, the
  way
  `FormData.getAll` reads them.

- **`GrDateTimePicker`** — the month grid and the time columns in one panel, with `autoApply`. The prop lands here
  rather than on `GrDatePicker` because only here does confirmation stop being a tautology: picking a date is atomic,
  picking a date *and* a time is not. With
  `autoApply` every step goes out immediately; without it the panel edits a draft that is taken on open and only leaves
  through the confirm button. Time bounds apply inside the boundary day only — `min = 2026-08-12T09:00` says nothing
  about the 13th.

- **`GrTimePicker`** — a field with a panel of column listboxes: hours, minutes, optionally seconds, and a period column
  in 12-hour locales. Arrow keys, `Home`/`End` and
  `aria-activedescendant` come from the core's `useComboboxNavigation`, so the keyboard contract is the one `GrSelect`
  already implements. The panel does **not** close on a pick:
  a time takes several of them, and closing after the first would mean reopening for every unit. Which values are out of
  bounds is decided per unit — with `min = 09:30` the 9 o'clock hour stays selectable while the minutes before 30 do
  not.

- The picker shell — form-control contract, `v-model:open`, lazy panel mounting, field keyboard, clearing, serialization
  for the native form — now lives in one composable shared by the pickers. `GrDatePicker` moved onto it with its tests
  untouched.

- **Wired into the showcase** next to the package it replaces: its own companion section, four demos and hand-written
  API tables. Both packages ship a `GrDatePicker`, so the showcase demos import this one explicitly — the auto-import
  resolver matches by name and would silently hand over the other component, and the snippet under a preview is exactly
  the code a reader copies.

- **Package gates for tokens and accessibility**: no pixel literals or uno-scale utilities where the design system has a
  token, every own CSS variable declared in the component's
  `tokens.json`, and axe over the *open* panel — the showcase gate only ever captures the closed state, so the grid
  roles would go unchecked. The token gate paid for itself on its first run: the month title referenced
  `--gr-leading-md`, a step that does not exist in the scale, so its line-height had been silently falling back to
  `normal`.

- Package scaffold: build config with a per-component entry map, `granular-provider`
  (browser and node entries), `unplugin-vue-components` resolver, `granular doctor`
  options and the registry generator. No components yet.
- Registries are generated from the file system by
  `@feugene/unocss-preset-granular/codegen` from day one — the barrel, the subpath exports, the build entries, the
  provider registry and the name list shared by the resolver and the build config. The predecessor kept six such lists
  in sync by hand.
- `types` points at `dist/types/index.d.ts`, without the stray `src/` segment that
  `vue-tsc` emits by default; `exports` includes `./package.json`. Both were logged as breaking changes to make before
  1.0 in the audit of the predecessor.
- Package gates from day one: `vitest`, `eslint`, `typecheck`, a registry-drift check and `publint`, all wired into a CI
  job and into the repository's root
  `test` and `build` aggregates. The predecessor had none of them — no tests, no lint config, and a `typecheck` script
  CI never called.
- The registry gate reads what the generator wrote back from the built modules, not only its exit code: the provider
  registry, the name list shared by the resolver and the build config, the barrel, the subpath exports and the build
  entries must all agree with `src/components/`, in both directions.
