# Changelog

All notable changes to the [`@feugene/granularity`](.) package are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres
to [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [v0.44.0] 2026-09-03

### Added

- **New `GrScrollSpy` and `useScrollSpy` — a table of contents that knows where you are
  reading.** The audit row this closes was one line with two halves; `GrAffix` took the
  first (keep the contents in view), this takes the second (say which section is being
  read). Nothing in the repository highlighted an anchor before: the showcase sidebar
  computes activity from `route.path` alone, so an anchor item was never active, and there
  was not a single scroll listener in the whole app.

  **The composable owns everything that follows from scroll position; the component owns
  everything that follows from an item being a link.** That is why there are two: an
  application with its own contents markup takes `useScrollSpy` and writes the rest, the
  way `GrSortableList` sits on `useDragSort`. The pure arithmetic lives in
  `composables/internal/`, not beside the component — a module in a component directory
  ends up in that component's chunk, and `libInjectCss` puts the component's CSS there too.

  **Active is the section whose heading you passed last, not the most visible one.**
  Ratio-based rules fail twice over: a long section beats a short one regardless of what
  is being read, and the highlight jumps backwards the moment the next section peeks in
  from below. A separate rule covers the last section — shorter than the remaining
  viewport, its top never reaches the activation line, because scrolling ends first.
  The declared order does not affect the answer either; a list that disagrees with the
  page still highlights correctly rather than producing something impossible to debug.

  **The observer alone is not enough, and that is not redundancy.** `IntersectionObserver`
  answers "did anything cross the line" and is never called for the last stretch of
  scrolling, where no edge crosses anything. So a cheap `scroll` listener reads exactly one
  number — whether the bottom is reached — and doubles as the release for the pin below.

  **A click pins rather than suppresses.** The chosen section becomes active immediately
  and stays that way until scrolling settles; otherwise the highlight would run through
  every section on the way. Four mechanisms, each covering the previous one's blind spot:
  `scrollend` where it exists, an idle detector where it does not, `wheel`/`touch`/`keydown`
  for a user takeover (the browser cancels smooth scrolling then, so the target is never
  reached), and release on the first scroll after settling — which is the answer for
  dragging the scrollbar, where no wheel or touch event ever arrives. A fixed timeout was
  rejected: the browser picks smooth-scroll duration from the distance, so any constant is
  either too short or too long.

  **`aria-current="location"`, not `page`.** The package writes `page` everywhere, but its
  real invariant is "the token names what changes": breadcrumbs, bottom navigation and the
  sidebar change the page, `GrSteps` changes the step, this changes the location. The risk
  is nil — ARIA treats an unrecognised token as `true` — while `page` on an in-page anchor
  announces "current page" on a page that never changed.

  The item stays `<a href="#id">`: only a plain left click is intercepted, so `Cmd`-click
  and the middle button keep working. Scrolling is our own arithmetic rather than
  `scrollIntoView`, which moves every ancestor and cannot take the offset. The address is
  updated with `replaceState`, not `pushState` — a history entry per item would turn Back
  into an undo for scrolling. Focus moves to the section, restoring what `preventDefault`
  takes away from the anchor: without it a keyboard reader keeps tabbing inside the
  contents instead of continuing from the section.

### Fixed

- **`GrAffix` inside a grid or flex parent needs a wrapper, and the page now says so.**
  The component is a fragment — sentinel plus sticky box — so in a grid the sentinel takes
  a cell of its own and pushes the neighbours around; found while building the pair demo,
  where the contents column ended up on the second row. The page previously stated flatly
  that a wrapper is impossible. It is impossible only when the wrapper is sized by the
  panel; a grid cell stretches to the row, so a wrapper there keeps its height and stays a
  containing block the panel can travel inside.

## [v0.43.0] 2026-09-02

### Added

- **New `GrAffix` — a panel that stays in view, and knows that it does.** A section heading
  in a long list, a table of contents, the Save/Cancel bar under a long form: the panel
  travels with the page and stops at the edge — of its own scrolling block or of the window.
  Three implementations of this already lived in the package (`GrNavbar`, `stickyHeader` in
  `GrTable`, pinned columns in `GrDataTable`) and each author rediscovered the same three
  rules; consumers meanwhile wrote `sticky top-28` by hand, magic constant included.

  **`position: sticky` does the positioning; the observer only reports.** A one-pixel
  sentinel next to the panel marks where it would stand if it were not sticky, and an
  `IntersectionObserver` whose root edge is pulled in by exactly the offset turns that root
  edge into the line of attachment. State is read from the entry's rectangles rather than
  from `isIntersecting`, which means both "has not arrived yet" and "has already left". The
  component root is the sticky box itself, never a wrapper: a wrapper is the containing
  block, and a panel that cannot travel inside it does not stick at all.

  **The surface arrives with the state.** A detached action bar sits inside the form and has
  to look like part of it, so background and shadow appear only once the panel is attached —
  unlike `GrNavbar` and the `GrTable` header, which are opaque always. The background is not
  optional: without it the content sliding underneath shows straight through. The separator
  is a shadow rather than a border, because a border adds height exactly at the moment of
  attachment and the layout would jump by a pixel.

  **The offset can belong to a group.** The `offset` prop is instance data; a shared offset
  for a whole region is `--gr-affix-offset` on the container or on `:root`. The measurement
  reads the computed style, so the cascade, `4rem`, `var(--gr-navbar-height)` and `calc(…)`
  all work the same way and are all picked up by the observer — which is why the component
  has no `defaults.ts`. `remeasure()` re-reads an offset that moved without the prop moving.

  **The layer stays local — `z-index: 10` inside the panel's own stacking context.** The
  50-step gap in the `--gr-z-*` scale exists so an application can wedge its own sticky
  header between levels, and this is that header; there is no package-wide answer to
  "above or below the bottom navigation". An application that needs a scale layer writes
  `--gr-affix-z: var(--gr-z-navbar)`.

  **State is readable without JavaScript.** `data-stuck` on the attached panel, `stuck` in
  the default slot, `stickyChange` on the way out. `disabled` turns attachment off without
  unmounting, so focus and typed text survive a breakpoint change.

  **Where sticky dies silently, the component says so.** An ancestor with an `overflow`
  other than `visible` and nothing to scroll becomes a scrollport in which `sticky` never
  moves — the build stays green, the class is in the markup, and nothing tells you. In dev
  the offending ancestor is named. The walk reads the computed `overflow-y`, stops at the
  first real scroller and never reaches `<body>`, so neither an `overflow-x: hidden` wrapper
  nor the scroll lock of an open modal produces a false alarm.

- **New `GrTransfer` — two lists side by side and a way across.** Assigning members to a
  project, permissions to a role, columns to a report: the directory stays on the left, what
  has been picked stands on the right, and both are visible at once. `GrSelect` with
  `multiple` remains the neighbour it was — folding the selection into the trigger is the
  right trade when space is short and the selection is short with it. Here the selection is
  the point: it is a list of its own, and it is ordered.

  **`v-model` is an ordered array of keys, not of items.** The right panel is `modelValue`
  read in order, so reordering it *is* editing the value, and the consumer stores one array
  rather than a set plus a sort. A key present in the model but absent from `items` is kept
  and reported in dev rather than dropped: a directory often arrives after the saved
  selection, and dropping it would delete on the first render what the server still has.
  Every mutation emits a new array — the input is never touched.

  **Three ways across, and all three are equal.** Buttons move the current selection; a
  pointer drag moves a block and drops it at a position; the keyboard does both. `Space`
  toggles a row and does nothing else, `Shift` with an arrow extends the range from the
  anchor, `Enter` transfers — and inside the right panel `Alt` with an arrow moves the whole
  selection at once. That last one is why `GrSortableList` is not embedded here: its `Space`
  enters a "row grabbed" mode, and in a multi-select list both keys would be claimed twice.
  Making reordering a command rather than a mode keeps `Space` meaning exactly one thing, and
  moves several rows in one keystroke, which grab-and-drop cannot do at all.

  **Search narrows the view, never the value.** Each panel filters independently; a row that
  is selected and then hidden by a query stays selected and still travels with the rest —
  otherwise typing in a search field would silently undo work already done. The header
  counter therefore counts the whole panel rather than the visible part, and a transfer
  announces how many moved. While a search is active in the right panel, reordering is off
  and says so: "move down" over a filtered list either skips invisible rows or produces an
  order nobody could predict.

  **The transfer buttons are never natively `disabled`.** With nothing to move they carry
  `aria-disabled`, stay in the tab order and dim through a background token — a control
  dropped from the tab order cannot explain why it is unavailable, and the focus would land
  in `<body>` right after the last click.

  **Reordering is a visible control, not only a chord.** `Alt` with an arrow is the
  accelerator; the buttons in the target panel's header are the contract. A chord nobody
  can discover is not an interface, and on macOS nearly every modifier is already spoken
  for by the system. Those buttons point left and right while the chord stays vertical, and
  the mismatch is deliberate: the order of the right-hand panel is a *sequence* — report
  columns, export fields, things read left to right — not a position on screen. Giving the
  chord the same axis was not an option, because `Alt` with a horizontal arrow is Back and
  Forward in Chrome and Firefox on Windows and Linux. (Safari puts that on `Cmd`, so the
  combination is free there — but the package ships to everyone.) A drag also *shows* itself at every step. The row offers a `grab`
  cursor before the press and the whole component switches to `grabbing` once the gesture
  starts; a preview rides with the pointer, naming the first row and counting the rest;
  the place it left keeps a dashed outline; the receiving panel lights up by border **and**
  fill, since a border alone sits outside the eye that is following the cursor. Text
  selection is suppressed on the whole document for the duration, not just on the rows: a
  selection *starts* inside the component but stretches across the page, so dragging a row
  used to highlight unrelated headings and paragraphs on the way. The previous value is put
  back on release rather than cleared — the consumer may have set one. Without the
  preview the row simply stayed where it was under a pale tint, and the whole gesture looked
  like nothing was happening — which is exactly what it was reported as. The arriving rows
  then light up briefly, because the static outcome — a checked row, a changed counter —
  says what happened but not that anything moved. A panel whose list runs past its edge
  fades that edge, since the scrollbar is invisible on some systems and a row cut in half
  reads as a rendering bug rather than as "scroll me".

  Overriding `#header` does not cost a panel its name: the heading *is* the accessible name,
  so when the consumer replaces it the name comes straight from `sourceTitle`/`targetTitle`
  instead of pointing at markup that no longer exists. Nothing about that is visible on
  screen — only a screen reader would have noticed.

  Each panel is a `listbox` with `aria-multiselectable`, its rows are `option`s carrying
  `aria-selected`, and each panel holds one `Tab` stop with roving focus inside it. Panels are
  named, because there are two of them. The row's own mark is decorative: a `GrCheckbox`
  inside `role="option"` would be `nested-interactive`, so state lives on the row and the real
  checkbox sits in the header, where "select everything shown" belongs. Integrates with
  `GrFormField` — the field's `id`, label, description, `aria-invalid`, `aria-required` and
  `aria-readonly` land on the right panel, which is the value — and reads `size` and
  `draggable` from `GrConfigProvider`.
- **`GrCarousel`: own arrow icons and a tone for the picker.** `#prev` and `#next` replace
  the *content* of the arrow buttons rather than the buttons themselves — the accessible
  name, `aria-disabled` and the edge behaviour stay with the component, because a custom
  arrow otherwise inherits the duty of restating the whole contract, and it rarely does.
  `tone` colours the current dot or thumbnail border from the package-wide scale; the
  `--gr-carousel-dot-active` hook still overrides it point-blank, so the prop names the role
  and the hook names the value.

- **i18n:** `gr.transfer.sourceTitle`, `targetTitle`, `search`, `toTarget`, `toSource`,
  `selectAll`, `selected`, `shown`, `empty`, `emptyFiltered`, `moved`, `reordered`,
  `reorderFiltered` and `cancelled` in `en`, `ru` and `es`.

- **New `GrCarousel` — a band of slides in the page flow.** A product gallery, an onboarding
  run, a row of testimonials wider than the screen: full-width frames with arrows, dots, a
  thumbnail strip and a swipe, none of which needed a gesture library. Slides come from the
  slot as `GrCarouselSlide`, not from an `items` prop — the markup of a frame differs in every
  consumer, and an array would have forced either a render function or one template prop per
  kind of frame. `GrImageViewer` stays the neighbour it was: it opens a frame *over* the page
  with zoom and rotation, the carousel keeps the page working underneath, and the pair is the
  normal composition — the carousel emits the click, the application opens the viewer.

  **The band is a transform track, not a scroller.** A native scroller with `scroll-snap` would
  have added a second, continuous source of truth next to the index that already drives the
  model, the autoplay, the looping and the announcements — and `scrollLeft` and `clientWidth`
  are both zero under jsdom, so "which slide is current" would have stopped being provable in
  unit tests and moved wholesale into end-to-end. The track also gets `prefers-reduced-motion`
  for free: the global clamp in `base.css` shortens its CSS transition, whereas
  `scrollTo({ behavior: 'smooth' })` overrides `scroll-behavior` by specification and the clamp
  never reaches it.

  **Dots and thumbnails are one `tablist` in two skins.** Had the dots been a group of buttons
  and the thumbnails a tablist, the role of the *slides* would have depended on a cosmetic prop
  — `tab` requires a paired `tabpanel` — and an accessibility contract cannot change with the
  shape of a control. What does change the slide's role is whether a picker exists at all:
  with one the slide is a `tabpanel`, with `indicators="none"` it is a `group`. Either way it
  carries `aria-roledescription="slide"`, and every slide that is not current is `inert` —
  without it `Tab` walks into a clipped, invisible frame and the browser scrolls the container
  out of step with the track.

  **Autoplay stops on its own.** Hover, an active gesture and a hidden tab *pause* the
  countdown and keep the remainder; focus entering the band *stops* it and does not resume,
  because a frame sliding away while someone reads a link inside it is the defect the APG rule
  exists for. The pause button is always rendered when `autoplay` is set — a moving carousel
  without a way to stop it is a violation, not a configuration. Under `prefers-reduced-motion`
  the show does not start, but the button stays and offers to start it: asking for less motion
  is not the same as being denied the choice. That path is the component's own — the global
  clamp covers CSS, and the scroll a timer performs is JavaScript.

  **A single slide and a shrinking band are states, not edge cases.** With one frame the
  arrows, dots and thumbnails are not rendered at all rather than rendered disabled — a
  disabled control claims there is somewhere to go. When a slide disappears from under the
  current index, the index is clamped **and** emitted: silently diverging from the consumer's
  model is how the picture and the data drift apart.
- **`GrCarouselSlide`** — the frame itself. It carries its position and name, registers with
  the band on mount, and renders whatever the consumer puts inside. Its `#thumbnail` slot is
  drawn by the strip rather than by the slide, so a thumbnail can be arbitrary markup; a
  `thumbnail` URL prop and, failing both, the frame number cover the simpler cases. It has no
  entry of its own — the subpath `@feugene/granularity/components/GrCarouselSlide` is an alias
  for the parent's module, the way `GrCollapseItem` and `GrTimelineItem` already are.
- **i18n:** `gr.carousel.roledescription`, `slideRoledescription`, `slidePosition`, `previous`,
  `next`, `play`, `pause`, `indicators` and `autoplayStopped` in `en`, `ru` and `es`.

### Fixed

- **`GrCarousel`: the current dot is now actually distinguishable.** It differed from its
  neighbours by hue alone, and at eight pixels across that is not a difference — on a muted
  `tone` it all but vanished. The current dot now carries a ring in the same colour, so the
  cue is a shape as well as a colour and survives for anyone who does not separate the two.
  The ring is drawn with `outline` rather than a `ring`: it sits outside the layout and needs
  no colour behind its gap, whereas `ring-offset` would have to be painted in a page
  background the component does not know. Widths are hooks
  (`--gr-carousel-dot-ring-width`, `--gr-carousel-dot-ring-offset`).
- **`GrCarousel`: an autoplaying carousel no longer drags the page back to itself.** Scrolling
  the current thumbnail into view went through `scrollIntoView`, which moves *every* ancestor
  including the document: with the carousel below the fold, each automatic step yanked the
  reader back up — measured at nearly four thousand pixels a step on the showcase page. The
  strip now computes the offset itself and assigns its own `scrollLeft`, so nothing outside it
  moves.

## [v0.42.0] 2026-09-01

### Added

- **A missing required prop now names itself in dev.** `GrBreadcrumbs`, `GrDataTable`,
  `GrInputTag`, `GrNumberInput`, `GrSegmented`, `GrSortableList`, `GrSteps` and `GrTabs` threw
  `Cannot read properties of undefined` and nothing else: neither the component nor the prop
  appeared anywhere in the message. Vue's own "Missing required prop" never fires here — the
  production SFC compiler strips `type` and `required` from the runtime declaration, so the whole
  `dist` carries `required: true` exactly zero times.

  Each of the eight now warns under `__GR_DEV__` before the crash, naming component, prop and the
  value received. The crash itself stays: the component genuinely cannot render, and hiding that
  behind a substituted default would trade a loud defect for a quiet one.

  This closes the class. Re-measured on the built `dist` by rendering all 77 components without
  props: eight crash and all eight are guarded, four warn without crashing (`GrPagination`,
  `GrProgressBar`, `GrSlider`, `GrStatistic` — guarded earlier), the remaining 65 render clean.

- `gr.filePreview.label` and `gr.delta.increase` in all three locales.

### Fixed

- **`GrKbd`: modifier glyphs no longer render smaller than the letters.** The keycap declared no
  font of its own, so it inherited whatever the host gives `<kbd>`: the UA monospace default, or a
  reset's mono stack on top of it. Monospace faces draw those symbols small — measured in
  JetBrains Mono, `⌘` is 73% of the letter's ink height, `⇧` 76%, `⌥` 66% — and next to a `K`
  that reads as a different size, most visibly at `xs`. The same glyphs in `--gr-font-ui` come out
  at 103%, 103% and 100%.

  The font is declared on the keycap now, and on the inner key as well: a key inside a merged plate
  is a `<kbd>` too, and a host reset that styles the tag by name beats inheritance from the parent.
  Typography of the component no longer depends on the host.

- **`GrDescriptionList`: `stackBelow` only worked when it was set at mount.** The observer was
  created once in `onMounted` and skipped entirely when the prop was still `undefined`, so a
  threshold arriving later — from app config, from a toggle — never took effect. Two more holes came
  from the same root: the observer stored the *verdict* rather than the measurement, so changing the
  threshold or dropping it left the previous answer standing until the next resize, which in a still
  window never comes. The observer now records the width only; "is it narrow" is derived, and both
  cases apply immediately.

- **`GrJsonViewer`: refreshing the data no longer collapses the tree.** A polled response arrives as
  a new object every time, and the whole expansion set was rewritten on each change. Worse, expansion
  by click was never tracked at all — `nodeExpand` from the tree was ignored, so the set and the
  picture disagreed and `defaultExpandedKeys`, which the tree applies wholesale, pulled the tree back
  to what the viewer remembered. The set now mirrors the tree: both events are heard, a data update
  only drops branches that disappeared, and the default depth applies to the first tree that has
  branches and again only when the depth itself changes.

- **`GrFilePreview`: an interactive tile is never nameless.** The name comes from content — the
  image `alt` or the fallback caption, both fed by `name`. Without it a clickable tile shipped as a
  button with an empty `alt` and a linked tile as an empty `<a>`: `button-name` and `link-name`.
  A generic localized name is worse than a meaningful one but better than none, and a dev guard now
  asks for the file name out loud.

- **`GrDelta`: growth was carried by colour alone, and a forgotten `value` looked deliberate.**
  With `showSign: false` the plus is dropped while `Intl` still prints the minus, so only increases
  lost their direction — a screen reader heard a bare number. Increases now carry a visually hidden
  direction word. Separately, an omitted required `value` rendered the same dash as an explicit
  `null`; `undefined` now warns under `__GR_DEV__` while `null` stays silent, as documented.

- **`GrFilePreview`: a tile opening in a new tab no longer hands over `window.opener`.**
  The component declared neither `target` nor `rel`, so `target="_blank"` reached the `<a>`
  through fallthrough attrs and `rel` stayed empty — reverse tabnabbing on any attachment tile
  linking to the original. `GrLink` and `GrButton` have guarded this for a while, deriving the
  protection from the actual target rather than from an `external` prop; the tile now follows the
  same rule. Both are props now, so the attribute can no longer slip past the component.

## [v0.41.0] 2026-08-31

### Removed

- **`GrCodeBlock` moved to `@feugene/granularity-code`.** Breaking: the
  `@feugene/granularity/components/GrCodeBlock` subpath and the root-barrel export are gone.

  ```diff
  - import { GrCodeBlock } from '@feugene/granularity'
  + import { GrCodeBlock } from '@feugene/granularity-code/components/GrCodeBlock'
  ```

  Props are unchanged and so are the `--gr-code-block-*` tokens, so an application that themed the block keeps
  its overrides; the import is the whole migration.

  The reason is a ceiling, not tidiness. Inside the core the block could never gain highlighting for an
  arbitrary language: that needs a dependency, and the core takes none for this — hence its own
  `tokenizeJson` and a `language` prop that only ever accepted `'json' | 'text'`. In the companion the
  ceiling lifts, and the same component now shows TypeScript, SQL or a Dockerfile through a highlighter the
  application supplies.

  Doing it before 1.0 is the point: `PACKAGES.md` states that taking something out of a frozen core costs a
  major, and after 1.0 this move would cost one across the whole ecosystem. Technically it was cheap — the
  block was a leaf here, nothing in the core depended on it, and `GrJsonViewer` (which stays) never used it.

## [v0.40.0] 2026-08-30

### Added

- **Components now declare the tokens whose names they build at runtime.** A
  `var()` assembled from a variable is invisible to every static analysis: the
  name arrives as a parameter and `var(--gr-z-dropdown)` never appears in the
  sources. A consumer who turns on token pruning in the preset
  (`pruneTokens`, `@feugene/unocss-preset-granular` 0.16.0) therefore sees such
  a token as unused and drops its declaration — silently. The build stays
  green, `z-index` resolves to `unset`, and a panel slides under its
  neighbour. No existing gate could see that, because the CSS remains valid.

  The package has exactly three such sites and all of them lead into
  `composables/internal/overlayStack.ts`. Eight components declare what they
  read: `GrPopover`, `GrAutocomplete`, `GrTreeSelect` and `GrSelect` their own
  dropdown layer, `GrTooltip` its tooltip layer, and `GrModal`, `GrDrawer` and
  `GrImageViewer` the modal one. Every caller of `useFloating` also declares
  `gr-z-modal`: the `calc(var(--gr-z-modal) + N)` branch is what lifts a panel
  opened *inside* a modal above it.

  The field is about **consumption, not ownership** — `GrPopover` declares a
  token owned by `GrModal` because it reads it. And it lives on the component
  rather than on the provider on purpose: a provider-level list would hold the
  token in every application, including the ones that never pull the component,
  which is exactly the overhead granular selection exists to remove.

  `GrLoading` deliberately declares nothing: its `zIndexVar` prop is documented
  as an escape hatch, the name belongs to the **application**, and keeping it is
  the consumer's business. Its own layer is a static `z-[var(--gr-z-loading)]`.

  The gate is `src/__tests__/dynamicTokens.test.ts`. It knows about both
  composables, catches any new source of runtime `var()` assembly, and checks
  that every declared name still exists. Verified by falsification: removing one
  declaration turns two tests red.


## [v0.39.0] 2026-08-29

### Added

- **A gate for what the package is named after.** Taking `@feugene/granularity/components/GrX` is supposed to bring
  `GrX` and its declared dependencies — and nobody's markup beyond that. Nothing checked it. The existing gates look
  elsewhere: `componentDependencies` reads the sources and watches the opposite direction (that `config.dependencies`
  does not fall behind the imports), and an edge that only appears at build time — a shared chunk that took a
  stranger along with what was needed — is invisible in sources. `granular doctor` reads `dist` but diagnoses tokens
  and classes, not module reach.

  The new gate reads `dist` and walks the module graph from every component entry. A foreign `.ts` is not a leak:
  the `GrConfigProvider` context, the scales in `components/shared/`, the composables are the package's shared
  runtime and ship by definition (`docs/packaging.md`). A leak is foreign **markup** — an SFC drags along its
  layout, its classes and its safelist, which is exactly the weight the subpath exists to avoid. Attribution goes
  through source maps, since a minified chunk holds no component name.

  A gate that cannot see must not report success, so blindness is a failure of its own: a chunk with no map and code
  of its own fails the run rather than passing quietly. Build helpers with no file on disk (`\0`-prefixed virtual
  modules) are recognised structurally, from the module ids the build writes into the chunk, not from a file name —
  the name carries a content hash and changes on every build.

  Runs as part of `yarn build`; `yarn isolation` runs it alone for diagnosis. All 78 entries pass today, so the gate
  freezes a property that already holds rather than fixing a defect. Verified by falsification: dropping one declared
  dependency turns 4 entries red through the transitive closure.

- **The weight report is no longer the core's alone.** `scripts/entrySizes.mjs` and its runner moved to the repository
  root and take a package as an argument, the way `granular doctor` already does. Six companion packages sell the same
  subpath granularity and measured nothing; they measure now. The walk is worth sharing rather than copying — a
  component entry is nearly empty and the code lives in shared chunks, so a report that stops at the entry file is
  wrong by a factor, and six copies of that walk would drift apart silently.

  `yarn sizes:check` at the root keeps a package with component subpaths from shipping unmeasured: it reads manifests,
  needs no `dist`, and runs beside the other cheap checks. Without it the next companion is founded unmeasured in
  silence — which is exactly how all six got there.

- **The granularity claim now carries a number, on the npm page itself.** A subpath export is the reason this package
  exists, and the README argued it in prose. `yarn sizes:docs` puts a generated block there instead: the barrel, the
  lightest component, the median one, and the five heaviest taken together. Every package with component subpaths gets
  the same block; the per-component table lands in `docs/entry-sizes.md`, which is generated whole, like `docs/tokens.md`.

  The number published is a **union, not a sum**. Per-entry weights do not add up — shared code is counted again in
  every row but paid for once — and a list of them invites the reader to add five rows of the core, land on 381 kB and
  walk away from a set that actually costs 171. Publishing them without the union would make the package look heavier
  than it is, which is the opposite of what the block is for.

  The rows are derived, not chosen: picking "representative" components would be fitting the shop window to the number
  we wanted. The worst case, named as the worst case, argues better anyway — the five heaviest components of the core
  together are 32 % of the barrel. And the figure is stated for what it is: an upper bound, the gzip of everything a
  subpath pulls out of `dist`, before the application bundler shakes it further.

  What CI gates is the version in the table header and the set of components in it, not the kilobytes: `zlib`
  compresses one and the same `dist` differently across environments — the barrel measures 542.9 kB on macOS and
  549.3 kB on a Linux runner, off a module graph identical down to the file. A gate no two environments can satisfy
  at once is fixed by changing what it checks, not by fudging the number. Freshness rides on the version instead:
  a bump forces a regeneration, so the weights are never more than one release old.

### Fixed

- **The family roster is now generated, like every other registry in this package.** `docs/getting-started.md` — the
  page a consumer starts from — was frozen at core `0.20.0` with 68 subpaths, listed four packages out of eleven, and
  every version in its table was several minors behind: chrono `0.2.1` against `0.10.0`, the preset `0.9.1` against
  `0.15.0`. The README shipped to npm mentioned no companion package at all, so nothing on the package page said the
  other ten exist.

  A roster is a registry, and this repository generates its registries. `yarn docs:ecosystem` now derives one from the
  workspace — name, version, components, i18n block, resolver — and writes it into all three places that need it: this
  README, the repository README and the getting-started page. Descriptions come from each `package.json#description`,
  the same text npm shows, so the two cannot say different things about one package.

  `yarn docs:ecosystem:check` gates it in CI, and additionally rejects any `@feugene/*` version named anywhere in the
  docs that excludes the version in the repository. That is the failure mode a reader hits first and a writer never
  sees: an example range stays syntactically valid forever and only breaks at `yarn add`. It found three on the first
  run, all of them fixed here.

## [v0.38.0] 2026-08-28

### Added

- **Dev channel now carries who opened a layer and what happens to focus.** A layer used to be a bare `id`, so on a
  page with a dozen selects "which one holds the top layer" had no answer. The snapshot now names the component
  (`GrSelect`, `GrModal`) and describes focus: is it still inside the layer, will it be restored on close, and to
  what element. The restore rule is non-trivial — "only if focus is still inside at closing time" — and was
  unobservable from outside; the predicate is now one function used both by the restore itself and by the observer,
  so the two cannot drift apart.
- **Virtual lists register themselves in the dev channel.** A registry rather than events: the window changes on
  every scroll frame, and streaming that would flood the channel. Each entry reports the owning component, the
  rendered range against the total, the size estimate the window is computed from and the average measured size —
  a drift between the last two is what makes a list jump while the DOM still holds the "correct dozens" of nodes.
- The event buffer depth is now configurable through the hook: how much history is needed is known only by whoever
  reads it.
- `__GR_DEV_HOOK__.readLayers()` — a fresh snapshot on demand. Events describe the stack at the moment it changed,
  but focus moves on an ordinary click with no stack event at all: an observer reading only the event log would show
  a stale picture. All of it stays behind `__GR_DEV__`.

## [v0.37.0] 2026-08-27

### Fixed

- **Development warnings never reached the browser.** The `__GR_DEV__` guard expanded to
  `typeof process !== 'undefined' && process.env.NODE_ENV !== 'production'`, and `process` is undefined in the
  browser, so the whole expression collapsed to `false` — in development too. Measured on `apps/playground`:
  the consumer's bundler replaces the text `process.env.NODE_ENV` with `"development"` but leaves
  `typeof process` alone. The guard now expands to `process.env.NODE_ENV !== 'production'`, the same shape Vue
  uses in its esm-bundler build; the substitution also removes the `ReferenceError` risk the `typeof` check
  appeared to guard against. All 36 guarded warnings across 29 files start working for consumers; production
  bundles are unaffected — the branch is still dropped.

### Added

- **Dev channel (`internal/devHook.ts`).** Under `__GR_DEV__` the overlay layer stack now publishes what it
  does — `overlay:push`, `overlay:remove`, `overlay:escape` and a full `overlay:sync` snapshot (who owns Esc,
  which modals go `inert`, each modal's depth) — to `globalThis.__GR_DEV_HOOK__`. The stack stays private:
  observers see the picture, not the levers. The hook buffers the last 50 events so an observer attaching
  later does not start from an empty screen, and a throwing listener cannot break the package it watches.
  Consumed by `@feugene/granularity-devtools`.

## [v0.36.0] 2026-08-27

### Fixed

- **`GrModal` swallowed clicks for 150 ms after closing.** While the leave animation played, the
  layer stayed in the DOM stretched across the viewport and kept `pointer-events: auto`, so a click
  landing in that window went to the disappearing overlay instead of the element beneath it and was
  lost — no error, no trace, and the user simply clicks again. The root now carries
  `pointer-events: none` while the layer is present but no longer visible.

  Taking hit-testing off the backdrop alone would not have been enough: the layer has three
  full-viewport elements (root, shell, backdrop), and neutralising the topmost one just hands the
  interception to its neighbour one level up — measured. `GrDrawer` and `GrImageViewer` share the
  structure and the defect; they are left as they are for now, recorded with the measurement.

- **`GrSelect` never emitted `change` in its default rendering mode.** The event is declared on the
  type and documented as "the same value on a separate channel", with no exception noted — but it
  was emitted from exactly one place, `emitValue`, and the native `<select>` handler went straight
  past it to `emit('update:modelValue')`. Since `optionsView` defaults to `native`, the defect sat
  on the most travelled path: a consumer's `@change` simply never fired.

  It failed silently rather than loudly, which is why it survived. A declared emit is removed from
  `$attrs`, so `@change` never becomes a native listener on the root either, and the `<select>`'s own
  bubbling `change` does not reach the consumer. Not a wrong payload — nothing at all. Found on live
  consumer code (a locale switcher that changed value and did nothing), where the silence cost
  several rounds of diagnosis. The native branch now goes through `emitValue`, so both rendering
  modes share one event channel, and a gate covers both — the panel-only tests were green throughout.

- **A missing required prop no longer renders plausible-looking nonsense.** `GrPagination` given no
  `page` printed `Page NaN of 5` and a page row of `1 2 4 5` — the number three simply absent out of
  five — because `Math.trunc(undefined)` is `NaN` and it spread through the clamp, the status line
  and the boundary/sibling algorithm. `GrProgressBar` emitted `aria-valuenow="NaN"`, which a screen
  reader announces and axe flags: its guard tested `Number.isNaN(value)`, and `Number.isNaN(undefined)`
  is `false`. `GrSlider` did the same, and put `left: NaN%` on the thumb as well. `GrStatistic`
  printed the word `undefined` on the tile. All four now substitute a sane default — page one, zero,
  the lower bound, an em dash — and say what went wrong under `__GR_DEV__`.

  These four are the whole silent class, established by rendering every one of the 37 components
  that declare a required prop with no props at all: eight others throw outright, which a consumer
  sees immediately, and the rest render cleanly. `GrJsonViewer` shows `undefined` on purpose —
  it inspects arbitrary data, and `undefined` is part of what it is asked to display.

  Nothing warned before. The production SFC compile strips `type` and `required` from the runtime
  props declaration, so `required: true` does not appear anywhere in `dist`: the consumer never gets
  Vue's "Missing required prop", in development or in production. `vue-tsc` catches it only in
  projects with template type-checking — a JS project, a `v-bind` spread or an auto-import catches
  nothing. Restoring it at build level is not an option: `@vitejs/plugin-vue` feeds one
  `isProduction` flag to both the script and the template compiler, and the template side would lose
  static hoisting and start shipping source comments.

- **`GrPagination` explains the `v-model` mistake instead of rendering it.** The prop is named `page`,
  so `v-model="page"` sends `modelValue`, which falls through to the root element as
  `modelvalue="2"` and leaves the component without a page. In development the component now names
  the mistake directly. This is the call that produced every symptom above.

### Changed

### Changed

- **Clearing a `GrInput` now emits `change` as well.** Clearing is a value commitment just like
  losing focus, and a listener watching `change` for "the value settled" was missing exactly that.
  `GrInput` was the only control in the ecosystem whose clear button stayed silent: `GrAutocomplete`,
  `GrFormFile`, `GrInputTag`, `GrNumberInput`, `GrSelect`, `GrTextarea`, `GrTreeSelect`, `GrRating`
  and all four `chrono` pickers already emitted it — including `GrTextarea`, whose event contract is
  worded identically. The native analogue agrees: the clear affordance on `<input type="search">`
  fires `input` and `change`.

  The order is `update:modelValue` → `change` → `clear`. If you subscribe to `change` on a text field
  and treat every occurrence as user typing, the clear button now reaches that handler too.

## [v0.35.0] 2026-08-25

### Fixed

- **`GrTabs`: the height scale now matches `GrButton`, as its own code claimed it did.**
  `grTabsStyles.ts` states "the tab height repeats the `GrButton` scale: tabs often stand next to one
  in the same row". That held for `xs` and `sm` and had quietly drifted for the other two: `md` was
  36px against the button's 40, `lg` was 40 against 44.

  Two consequences, and the second is the one that bit. A tab row next to a button was four pixels
  short, which reads as a layout mistake. And **no step reached 44px** — the target size WCAG 2.5.5
  and Apple HIG ask for on touch — so a consumer could not get one out of `GrTabs` by any prop.

  `md` is now `h-10` and `lg` is `h-11`. Type sizes were already correct and are untouched, so this
  restores a stated invariant rather than introducing a new one. A gate in
  `src/__tests__/componentSize.test.ts` compares the two scales step by step, because a comment does
  not check itself.

  Tab rows get taller wherever `md` or `lg` is in use.

### Added

- **`GrNavbar`: a `size` prop for the menu button.** The burger was rendered with a hardcoded
  `size="sm"`, and `GrNavbar` had neither a `size` prop nor a `defaults.ts` — so it was absent from
  the `componentDefaults` registry and a consumer had no way to reach it short of fighting the
  cascade through `menuButtonClass`. On a phone that left a 32×32 target with no lever.

  The prop resolves through `GrConfigProvider` like everywhere else, and the icon inside now follows
  the step instead of a hardcoded 16px.

  Its fallback is `sm`, not the package-wide `md`: the button has been 32px since it was introduced,
  and raising it by default would have shifted every consumer's header. `size="lg"` gives 44px and
  fits the 56px row.


## [v0.34.2] 2026-08-25

### Fixed

- **`GrTabs` now shows that the row continues past the edge.** The tab row scrolls, but its
  scrollbar is hidden on purpose, so a row that did not fit gave no sign of it: tabs beyond the edge
  stayed reachable with the arrow keys, yet nothing suggested they were there. Measured on a 375px
  screen, a five-tab row was 487px wide against 341px of space — two tabs invisible and unannounced.

  The edge that has more tabs behind it now fades out: the right one at the start of the row, the
  left one at the end, both in the middle, none at all when the row fits.

  It is a mask rather than a gradient underlay, and that follows from the row's own background
  differing per variant: `pills` carries an opaque `--gr-muted` of its own, while `line` is
  transparent and sits on whatever the parent paints — which the component cannot know. A gradient
  would have nowhere to take that colour from; a mask fades the content regardless of what is behind
  it.

  The fade width is the `--gr-tabs-scroll-fade` hook (`1.5rem` by default). The same value is the
  row's `scroll-padding`, so a tab pulled into view by keyboard navigation never comes to rest under
  the fade and its focus ring stays readable.

  The keyboard contract is untouched: tabs were always reachable, and `scrollIntoView` on focus and
  on external `modelValue` changes already worked. A vertical row does not scroll and has no fade.


- **`GrTimeline` now shrinks in a narrow column instead of pushing itself out of it.** Every row is
  a grid whose flexible tracks were declared as a bare `1fr`. That is `minmax(auto, 1fr)`, and the
  minimum of such a track is the largest minimum contribution of its items — which, for a grid item
  with `overflow: visible`, is its min-content size. With `white-space: nowrap` coming from a
  consumer's `truncate`, that is the full width of the string.

  So the track grew to fit the text and the row overflowed its container, while the `truncate` that
  was supposed to prevent exactly this never engaged: there was nothing to truncate. Measured on a
  260px column, an `layout="time"` timeline overflowed by 278px.

  Flexible tracks are now `minmax(0, 1fr)` and the items standing in them
  (`[data-gr-timeline-content]`, `[data-gr-timeline-group-title]`, `[data-gr-timeline-aside]`) carry
  `min-width: 0`. Both are needed: the first lifts the track's minimum, the second lifts the item's.
  Truncation stays where it belongs — with the consumer — but it now works.

  Nothing changes at widths where the content fits: `minmax(0, 1fr)` differs from `1fr` only once
  the content no longer does.


## [v0.34.1] 2026-08-25

### Fixed

- **An anchored panel is no longer taller than the space it has.** `flip` moves a panel to the
  opposite side and `shift` slides it along the edge, but neither can shrink it: a panel taller than
  the viewport stayed taller than the viewport, and because the layer is positioned `fixed`, the page
  could not scroll to its bottom. A long `GrContextMenu` or `GrDropdown` opened near the bottom edge
  slid upwards instead of compressing, and past a certain length its last items were simply
  unreachable.

  `useFloating` now runs the `size` middleware unconditionally and publishes the measurement on the
  floating element as `--gr-floating-available-height` — the distance to the viewport edge on the
  side the panel actually ended up on. It is computed after `flip`, so that side is final, and it is
  refreshed with the position, on scroll and resize included.

  The layer reports the measurement but does not apply it: what to constrain and what to scroll
  belongs to the panel, because the scroll belongs to its content. `GrPopover` consumes it, which
  covers everything built on top of it — `GrDropdown` and `GrContextMenu`.

  Previously the middleware was installed only under `matchWidth`, so every panel that did not ask
  for trigger-matched width got no measurement at all — that is, most of them.

### Added

- **`GrPopover`: a height ceiling as the `--gr-popover-max-height` hook.** It mirrors the width
  ceiling, with one difference that is not cosmetic: the second operand of `min()` is not a constant
  but the layer's measurement. `100vw` is known in advance; how much room sits below a trigger is
  not.

  The default is `100vh` — no opinion, the measurement decides. Set it when a panel must be *shorter*
  than the available room. Like the width hook it is delivered through `contentClass`, because the
  panel is teleported into the portal and an inline style would land on the trigger wrapper and
  silently never reach it.

  The ceiling ships together with `overflow-y: auto` on purpose: a ceiling without a scroll does not
  constrain, it truncates — content slips under the panel's bottom edge with no way to reach it.
  Until the ceiling binds there is no scrollbar, so nothing changes for short panels.


## [v0.34.0] 2026-08-25

### Fixed

- **`GrDropdown` rebuilt on top of `GrPopover`.** It was a second implementation of the same
  primitive: the panel, the layer, the portal, positioning, hover with delays and focus return all
  duplicated the popover, and its `transform-origin` map matched the popover's word for word across
  all twelve entries. They would have drifted apart silently — a difference in one easing or one
  token is visible only next to the original.

  The menu kept what makes it a menu: the focus ring across items, type-ahead, the keyboard for
  opening, and panel width. Same approach as `GrContextMenu`, which has been built that way from the
  start. The component went from 360 lines down to 256.

  **The public API did not change:** same props, events, slots and `defineExpose`. One divergence is
  kept deliberately — the menu trigger declares `aria-disabled` rather than native `disabled`: the
  native one removes the button from tab order, and a menu trigger must stay focusable. For a form
  control (`GrColorPicker`) the opposite is true, so the primitive keeps the native one and the menu
  overrides it.

  The internal markup gained one level: `v-show`, `role="menu"` and positioning now live on the
  `GrPopover` panel, and `[data-gr-dropdown-panel]` is the item container inside it, carrying width
  and the keyboard. Nothing changed visually: 144 baselines green without re-shooting.

- **`GrPopover`: the trigger click moved from the slot wrapper into `triggerProps`.** The wrapper
  caught any click inside `#trigger` — including one on a nested button, a link in a card trigger, or
  the dismiss cross on a chip: the panel opened against the user's intent. Verified by mounting — a
  slot with two buttons, `triggerProps` on the first, and a click on the **second** opened the panel.
  `GrDropdown` never made this mistake, and its code records why.

  **Compatibility is preserved.** A slot without `v-bind="triggerProps"` used to open on a click
  anywhere in the wrapper, and taking that away silently is not an option: the wrapper now fires
  exactly when there is no bound trigger inside. That is detected via `aria-expanded`, which
  `triggerProps` always set whatever the role, and it is checked at click time rather than on mount,
  because slot content is reactive. Such a trigger now warns about itself in dev builds: it has a
  click, but no keyboard and no ARIA.

- **The popup panel surface and its `transform-origin` moved into shared modules.** The origin map
  lived as copies in `GrPopover` and `GrDropdown` — twelve entries, identical word for word. The
  panel surface — six utilities — had been copied five times: in the popover, the dropdown menu and
  three select lists. They would have drifted apart silently: a difference in one token is visible
  only next to the original, and each component had its own.

  A theme contract that had come apart is fixed along the way. Four of the five took `--gr-card` as
  their background, while `--gr-popover` is described in `tokens/themes/*.json` as "background of
  popover, dropdown and overlay surfaces" — that is, introduced for exactly this case. The values
  match in both themes, so the difference was invisible; the first person to recolour `--gr-popover`
  in order to tell popup surfaces from cards would have seen it. All five are on it now.

  There are two modules, not one: the select lists take the surface but have no growth animation of
  their own, and a single module would have dragged eight origin classes they never use into their
  chunk. The `safelist.test.ts` gate named them one by one — and it was right.

  No visual changes: 144 baselines green without re-shooting.

- **`GrPopover`: `trigger="hover"` with `openDelay` and `closeDelay`.** The opening mode belongs to
  the primitive — it already owns `trigger` — yet until now hover existed only inside `GrDropdown`.
  The panel listens for hover as well, so a cursor moving from the trigger onto it across the
  `offsetPx` gap does not dismiss it. Click keeps working in this mode: there is no hover from a
  keyboard or a touchscreen.

- **`GrColorPicker`: the trigger takes the full width of the field, like every other form control.**
  Its `triggerBaseClass` always declared `w-full` — like `GrInput`, `GrSelect` and `GrNumberInput` —
  but the `GrPopover` trigger wrapper is an `inline-block` that shrinks to its content, and `w-full`
  resolved against it. Inside a 384px `GrFormField` the picker rendered at 113px next to a text field
  taking the full 384px: the code declared one thing and the page showed another.

  `GrPopover` gained a `block` prop — the wrapper stretches to the full width of its parent. The name
  is the same as in `GrButton` and `GrSegmented`. The picker panel did not change, only the trigger
  width; visual baselines were re-shot.

- **`GrContextMenu`: the menu's `minWidth` can no longer escape the panel.** The prop puts
  `min-width` on the list **inside** the panel, while the panel is capped at `22rem` by default — two
  limits on one width, outside and inside, contradicting each other by construction. The list does
  not shrink, and the panel has `overflow: visible`, so a `minWidth` larger than the ceiling pushed
  content out over the rounded edge. Measured on a live panel: `min-width: 500px` against a 352px
  ceiling spills by 161px.

  The outer limit is lifted with the `--gr-popover-max-width` hook: the menu's width is decided by
  its own `minWidth` and its content. The "no wider than the viewport" limit stays. The consumer's
  `contentClass` is not lost in the process — it arrives together with the hook.

  Nothing visible changed: `minWidth` defaults to `11rem`, and the 22rem ceiling was never reached.
  Verified by visual regression — 144 baselines green in both themes.

### Added

- **`GrPopover`: the width ceiling became the `--gr-popover-max-width` hook, and width from the
  trigger became the `matchWidth` prop.** The primitive is declared as "an anchored overlay with
  arbitrary content, and what goes inside the panel is the consumer's business" — while deciding the
  content's width itself: a 22rem `max-width` was baked into the panel's base class. There was no way
  to control it from outside — `contentClass` arrives as a class of equal specificity, and the winner
  would have been decided by rule order in the generated CSS.

  Panel width is two independent axes, and previously there was not one. The content ceiling became a
  value (`--gr-popover-max-width`, default `22rem`) and the source of width became behaviour
  (`matchWidth: boolean | 'min'`, passed through to `useFloating`, where it was already implemented
  and already used by `GrSelect`, `GrAutocomplete` and `GrTreeSelect`). They compose rather than
  compete: the trigger sets the width, the ceiling caps it.

  The ceiling is a hook rather than a prop for three reasons: no specificity argument arises at all,
  because a custom property is resolved by the cascade on the element itself; the ceiling can be
  changed per breakpoint and per theme, which a prop cannot do; and the component's vocabulary does
  not grow. The list height in `GrCommandPalette` is built the same way.

  The "no wider than the viewport" limit became **non-negotiable by construction**: it stands as the
  second operand of `min()` and cannot be removed by anything, including
  `--gr-popover-max-width: 100vw`. It used to live in the same utility as the ceiling, so anyone
  overriding `max-width` would have taken it out along the way.

  Default behaviour did not change: with no overrides the panel class still yields the same `22rem`.

  **The hook is delivered through `contentClass`, not an inline style.** The panel is teleported into
  the portal, so the trigger wrapper is not its ancestor:
  `<GrPopover style="--gr-popover-max-width: …">` lands on the wrapper and never reaches the panel —
  silently, without an error. The working form is
  `content-class="[--gr-popover-max-width:100vw]"`; globally (in a theme, on `:root`) the hook works
  as usual, because the portal lives in `body`. Both facts are locked down by tests.

  One more non-obvious point worth knowing up front: `matchWidth="min"` sets a **floor**, not a
  width, and in CSS `min-width` beats `max-width` — a trigger wider than the ceiling will outweigh
  the ceiling. That is the meaning of the mode, not a flaw; if you want a ceiling, use `matchWidth`
  without `min`.

## [v0.33.0] 2026-08-25

### Fixed

- **`GrTable`: the scroller is now a containing block.** Its wrapper had `overflow-x-auto`
  without `relative`, so an absolutely positioned descendant resolved its coordinates against
  the document instead of the scroller and escaped the box. Inside the table itself only the
  `sr-only` hint on the sort button is positioned that way, but cell markup belongs to the
  consumer — any absolute element in a cell landed outside. The visible symptom is not a
  misplaced element: on a narrow screen a wide table stopped dragging only itself sideways and
  started dragging the whole page.

### Added

- **`GrBadge` — slot `#icon`.** A status is rarely just a word: «processing»
  without a spinner reads as a final state rather than as work in progress. The
  badge had a single `default` slot, so the only way to get an icon in was to
  hand-roll an `inline-flex` wrapper inside the label — and with nothing sizing
  the icon, a `GrProgressCircle` dropped in there rendered at its smallest step,
  `2rem`, inside an 18px line box: the arc escaped the pill and pushed the text
  out of its own background. That is exactly what happened downstream, in
  `@efureev/ft-extra-granularity`.

  The slot follows `GrChip`, which already solved this: the wrapper carries the
  size class for the step (`badgeIconSizeClassBySize`), and the slot content
  stretches to it with `h-full w-full`. Sizes grow slower than the type scale —
  at the lower steps an icon matched one-to-one with the text would stretch the
  pill. The icon is a *sibling* of the trimmed label, not its content, so
  `text-box-trim` never reaches it and the badge keeps its height.

  A badge without the slot is unchanged: the `gap` added to the label is on a
  flex container with a single child.

### Changed

- **Peer range for `@feugene/fint-i18n` widened to `>=0.6.0 <1.0.0`.** On `0.x`
  versions a caret does not admit the next minor, so `^0.6.0` excluded `0.7.0` —
  the release consumers had already moved to. The peer is optional, so nothing
  ever failed to install; the mismatch surfaced as a warning in every consumer's
  install log.

  Nothing was removed in `0.7.0`: it adds locale negotiation and changes how a
  regional tag falls back to its base language, and this package touches
  neither. Compatibility is verified rather than assumed — the dev dependency
  now points at `^0.7.0`, so the suite runs against the version the peer range
  claims to support.

## [v0.32.0] 2026-08-24

### Fixed

- **A modal opened later is now painted above one opened earlier.** Every modal layer — `GrModal`
  and everything built on it, `GrDrawer`, `GrImageViewer` — used the same `z-index`
  (`--gr-z-modal`), so what ended up on top was decided by node order inside the portal container.
  That order is fixed when a component is *created*, not when it opens: `<teleport>` reserves its
  slot immediately. A dialog declared statically in the template therefore sat below a modal
  mounted later, while the overlay stack — which tracks the last *opened* layer — marked that modal
  `inert`. The result was the worst of both: the window on top does not respond, and the one that
  does respond is invisible. The stack now hands each modal layer its own depth and the layer
  renders at `calc(var(--gr-z-modal) + depth)`, so «topmost for painting» and «topmost for `inert`»
  come from one list. A closed window keeps its depth while its subtree is still in the DOM,
  otherwise it would dive under its neighbour during the leave animation. `zIndexVar` on
  `GrImageViewer` still works — the depth is added on top of the substituted variable.

## [v0.31.1] 2026-08-23

### Fixed

- **`GrSlider`: the rail is visible again.** Its default was
  `color-mix(in srgb, var(--gr-muted) 45%, transparent)` — on a light theme that is `#f1f5f9` at
  45 % over a surface of nearly the same colour, so the unfilled part of the scale did not read at
  all: the control looked like a dot on empty space, with no way to tell its range or the position
  inside it. The default is now `--gr-brd`, the token that exists for exactly this — a quiet but
  visible line — and it holds in both themes. Consumers overriding `--gr-slider-rail` are
  unaffected.

## [v0.31.0] 2026-08-23

### Added

- **`GrInput` — `addon="inline"`: a decoration inside the border.** `#prefix` and `#suffix` were
  segments only — an compartment cut off by a border and sized to the step of the control, which is
  right for «₽» and «USD» but wrong for a search field: a magnifier in a compartment reads as a field
  with a button glued to it, not as one field. There was no way to express an icon inside the border,
  so consumers dropped the icon altogether. The new mode removes the divider and the reserved width;
  the field still indents by the measured width, so the text starts right after the decoration.

## [v0.30.0] 2026-08-23

### Added

- **`GrCard` — an `#actions` slot in the card's own header.** Until now there were two cases: a title
  from props, or `#header` replacing the header entirely. A single button in the header forced the
  second one — and with it a hand-written title, its level and the padding scale. `GrDashboardItem`
  in this very ring and consumers' wrappers arrived at that workaround independently, both losing a
  real `h2…h6`. Actions turn the header on the same way `title` does; `#header` still wins over
  everything.

- **`GrBadge` / `GrChip` — a development warning for the removed `variant` prop.** The rename to
  `tone` passed silently: Vue drops an unknown attribute into `$attrs` and puts it on the root node,
  so neither types nor runtime complain and the component simply renders with the default tone. Ten
  places across six files broke that quietly in a consumer package. The warning does not fix it —
  an alias would outlive 1.0 — it only says which name to use.

- **`GrSelect` — an option carries its own chip tone.** `tone` and `dark` on the option override
  `tagTone`/`tagDark` for that tag. Tags with their own colour are an ordinary model — labels,
  categories, statuses — and without this the consumer had to render the selection through the
  `#value` slot, losing exactly what `tags` gets right: chips outside `role="combobox"`, removal by
  the close button, the «+N» rollup and the keyboard path.

- **`GrDropdownMenu` — the declarative model matches the composition.** An action now carries `as`
  and `align`, a section carries `titleAlign`, `dividers` and `uppercase`. `as` is the one that
  matters: without it a link built from `:items` stayed a plain `<a>`, so in an SPA the item
  navigated with a full page reload — and there was no way around it, since the model is unfolded
  into props inside the component and the entries have no per-item slot. A consumer who needed both
  a data-driven menu and router links had to rewrite the traversal, which is exactly what a 213-line
  wrapper in `@efureev/ft-extra-granularity` did.

### Documentation

- **«Quick start» no longer asks for `@headlessui/vue`.** It was dropped in 0.15.0 — the overlay
  family runs on the package's own primitives — and it is not among the peer dependencies, yet the
  README kept it in the install line and called it required. A new consumer installed a package they
  did not need; an upgrading one could not tell whether removing it was safe.

## [v0.29.1] 2026-08-22

### Fixed

- **The saturated tone no longer paints foreground.** `GrIcon` with `tone="primary"`, the selection
  check in `GrSelect` / `GrTreeSelect` / `GrAutocomplete`, the spinner of `GrLoading` and the grabbed
  drag handle of `GrDashboardFrame` used `--gr-primary` as a text colour. On the light theme that
  reads fine (5.74), on the dark one it is 3.70 — below AA, and nobody noticed because the rule
  existed only as a comment. They all use `--gr-primary-text` now: 9.07 light, 6.94 dark, and the
  colour stays in the same violet family.

  The rule turned out to be unconditional: **every** tone fails AA in one theme or the other —
  `success` 2.32 on light, `primary` 3.70 on dark — while every paired `-text` role holds everywhere
  (5.46 at worst). Reported by a consumer of `@efureev/ft-extra-granularity`, who counted fifteen such
  usages in their own package with nothing to warn them.

## [v0.29.0] 2026-08-22

### Added

- **`GrTree` — `v-model:current-key`.** The current node was settable only through an instance method,
  so a wrapper had to keep a `ref` on the tree and push state into it outside its own reactive loop,
  with a `nextTick` the types never mentioned. Worse, one notion had two owners: the tree painted the
  row from its internal key while the wrapper drew everything else from its own prop — a tick apart
  and the row is highlighted while the panel says otherwise. The prop is optional: unset, the tree
  keeps leading the current node itself.

- **`GrTree` — `filterValue` prop and a `filter` event.** Filtering was an instance method that
  reported nothing back, so «no data» and «the search found nothing» looked the same from the
  outside — and they are different screens, one of which the user can fix. The event carries
  `visibleCount` (rows actually on screen, matches plus the parents opened for them) and
  `matchedCount` (nodes that matched on their own).

### Fixed

- **`GrTree` — the drag handle is reachable by touch.** It appeared on hover only, and a touch device
  has no hover: the key was never set, the class never applied, so dragging did not exist there at
  all — while `touch-action: none` sat on the handle precisely for that gesture. `dragHandleVisibility`
  now decides: `hover`, `always`, or `auto` (the default) — always shown where hovering does not
  happen, via `@media (hover: none)` rather than `matchMedia`, so the answer holds on the server too.
  Reported by a consumer of `@efureev/ft-extra-granularity`.

## [v0.28.4] 2026-08-22

### Fixed

- **`GrTree` — the row highlight no longer covers the row.** The row surface is a separate
  `::before` layer, and the label, the chevron and the checkmark sit in normal flow: within one
  stacking context a positioned layer paints **over** flow content. With the package defaults — 5–16 %
  `color-mix` — that only tinted the text, so nothing here caught it; give the public
  `--gr-tree-row-hover-bg` (or `--gr-tree-row-current-bg`) an opaque value, as a consumer naturally
  would, and the row went blank on hover and on selection. At depth zero the layer spans the whole
  row, so the chevron disappeared too.

  The layer now sits under the content (`z-index: -1`) and the row is isolated
  (`isolation: isolate`). The second half is not optional: without its own stacking context a negative
  layer slides behind the nearest ancestor with a background, and the highlight vanishes entirely.
  Branch guides stay above the layer, as before. Reported by a consumer of
  `@efureev/ft-extra-granularity`.

## [v0.28.3] 2026-08-22

### Fixed

- **`@feugene/granularity/styles.css` works again.** The path the README, the docs and the showcase
  all point at was not in `exports`: it disappeared during the `Ds*` → `Gr*` move, and the working
  one was `styles/index.css`. Both resolve now.

- **The README no longer promises entrypoints that do not exist.** `foundation.css`,
  `components/<Name>/styles.css`, `uno` and `uno-node` were never exported. A component's own CSS
  needs no import at all — its chunk carries it — and the UnoCSS integration goes through
  `granular-provider`.

  A new build step (`check-dist-exports`) walks every subpath in `exports` and fails the build if one
  leads nowhere. It only checks the direction that hurts the consumer: a declared path with no file
  behind it.

- **`@feugene/granularity/directives/globalDirectives` is exported.** `docs/directives.md` tells IDE
  users to `import type {}` from it; the subpath did not exist. It is types-only — the file carries
  the `GlobalDirectives` augmentation and no runtime.

## [v0.28.2] 2026-08-22

### Fixed

- **Parts of composite components can now be imported granularly.** `GrTimelineItem`, `GrListItem`,
  menu items and seventeen more live in the parent's directory and are not public components: no
  `index.ts`, no `config.ts`, no entry of their own — their code ships in the parent's chunk. But
  they had no subpath either, so `@feugene/granularity/components/GrTimelineItem` failed with
  `ERR_PACKAGE_PATH_NOT_EXPORTED`: on those twenty names the whole point of the package did not
  apply, even though a template spells them like any other component.

  `package.json#exports` now carries an alias for each: the part's own key, the parent's module.
  Generated, not hand-written — `generate:registry` builds them from the parent's barrel, and the
  registry gate checks that each alias points at its owner and that no part claims an entry.

## [v0.28.1] 2026-08-22

### Fixed

- **`GrDropdownMenu` — `borderTop` / `borderBottom` no longer run into the panel's rounded corner.**
  The rule was the list box's own border, and the list sits 5 px deep inside the panel (1 px border
  + 4 px padding) while the corner is rounded by 16 px: at that depth the arc is still going, so the
  end of the line landed on top of it and each corner showed a wedge instead of two separate lines.
  The line is now drawn by a pseudo-element inset by 8 px — the same inset as
  `GrDropdownMenuDivider :inset`. Items keep their full width: that width is what puts their
  highlight inside the panel's padding. Reported by a consumer of `@efureev/ft-extra-granularity`.

- **The `Intl` instance cache no longer resets in full.** On overflow it wiped every entry, so a
  working set larger than the limit — a table with a dozen columns in a few locales — rebuilt hot
  formatters on every insert, and building one costs about ten times the formatting itself. The
  cache now evicts by least recent read.

- **`v-click-outside` keeps one listener per document and event.** Every element used to add its
  own — a page with ten overlays put ten `click` listeners on the document — and the `updated` hook
  removed and re-added them on **every** re-render of the host, while the set of events almost never
  changes. Subscriptions are now shared and counted, and a re-render with an unchanged set touches
  nothing.

### Added

- **`GrBreadcrumbs` — `iconOnly` on an item.** The classic home icon at the start of a trail: the
  icon is shown, the label is hidden visually but stays in the markup under `sr-only`. It is neither
  dropped nor moved into `aria-label` on purpose — a trail is read by search engines and screen
  readers alike, and an unnamed house makes the first item empty for a blind user.

  Without `icon` the flag is ignored and warns in development: hiding the label while showing
  nothing in its place erases the item, and in the markup everything still looks fine.

- **`GrBreadcrumbs` — `currentIndex`.** Which item is the current page; unset keeps the previous
  behaviour (the last one). `-1` states that the current page is not in the path at all — its name
  lives in the page `h1` and the trail shows parents only. Then no item gets `aria-current` and the
  last one stays an ordinary link.

### Fixed

- **`GrBreadcrumbs` — `as` no longer turns an item into a link.** It says *what* to render a link
  with, not that the item *is* one. A menu section without `href` used to render as a link, and a
  router component without a target navigates to the current address. Links are made by `href` / `to`.
- **`GrBreadcrumbs` — an item with an icon no longer sits 1.5px off.** The wrapper `li` was a block
  box, so the `inline-flex` item took its baseline from the first flex child — a block icon — and the
  line box grew by the descender space. The item came out 3px taller than its icon-less neighbours and
  `align-items: center` on the list shifted its content by half of that. The wrapper is a flex
  container now.

## [v0.27.2] 2026-08-20

### Fixed

- **Two dev warnings no longer reach production.** `createGranularity` warns when a component or a
  directive arrives without `install`, `name` or `__name` — both calls sat outside any condition, so the
  message shipped in consumers' builds. The comment above one of them had claimed a dev-mode check that
  was never there.

### Changed

- The dev-guard gate moved to `@feugene/granularity-test-kit` (`defineEnvGuardGate`), and
  `scripts/check-dist-dev-guard.mjs` was replaced by the `gr-check-dist-dev-guard` bin the kit ships. The
  rule itself got stricter — a `console.*` call now needs a guard above it — which is what exposed the
  two warnings above.

## [v0.27.1] 2026-08-19

### Changed

- **`GrSwitch` and `GrInput` no longer require `modelValue`.** Both declared it as a
  required prop, so neither control could be used without `v-model` — even where the
  switch is presentational or the field is read-only. `GrCheckbox` already had it
  optional. The default is `false` and `''` respectively; the input reads the value's
  length directly, and `undefined` there would break the render.

### Fixed

- **`GrRadioGroupOrientation` is exported.** The `orientation` prop was public while its
  type was not, so it could not be named in consumer code.

## [v0.27.0] 2026-08-19

### Changed

- **Control-scale font sizes now ship a paired line height.** The scale gained
  `--gr-control-leading-3xs…lg`, and every place that sets a control font size sets the
  matching `leading-*` next to it. Before this the line height was inherited from the host
  application's `body` — and inherited as an absolute value, so a 10px caption rendered with a
  24px line box whenever the host used the common `line-height: 1.5`. How airy a control looked
  was decided by someone else's CSS reset. Steps are tighter than the content scale, and `lg`
  (16 → 24px) matches the most common inherited value, so large controls did not move. The
  content scale gained the two missing steps (`--gr-leading-2xs`, `--gr-leading-lg`) and is now
  paired everywhere too. **Visible change:** captions, panel text, list rows and table cells
  that are not height-locked get a tighter line box.
- **Chips inside `GrInputTag`, `GrAutocomplete` and `GrSelect` are now `GrChip`, not `GrBadge`.**
  One chip, one keyboard contract, one set of colours. The `tagSize` prop keeps its badge scale —
  it is public API, so `md` still means the font size it always meant; the mapping lives in
  `chipSizeForBadgeScale`. The remove button is now addressed as `[data-gr-chip-close]` in all
  three; the old per-component selectors (`data-gr-input-tag-remove` and friends) are gone.
- **`GrChip` gained `removeTabindex` and exposes `removeEl`** — what a chip needs to live inside a
  text field, where the tab stop belongs to the `<input>` and the row of chips is walked with
  arrows. `GrInputTag` keeps exactly one tab stop in the row; `GrAutocomplete` keeps none.

### Added

- **Typed slots for every SFC that has them.** All 81 slot-bearing components now declare
  `defineSlots` with a JSDoc line per member. This is not cosmetic: the slot descriptions in the
  showcase API tables and in `web-types.json` for IDEs are read from exactly that JSDoc and from
  nowhere else, so 38 components previously showed an empty description column and a `{}` type.

### Fixed

- **A failed validation crashed the test run of anyone testing a form in jsdom.** `GrForm` called
  `scrollIntoView` unconditionally when scrolling to the first invalid field, and jsdom does not
  implement that method at all — the call surfaced as an unhandled rejection, so the suite reported
  every test as passing and still exited non-zero. Both calls are optional now. The core's own
  tests never saw it: they stub `Element.prototype.scrollIntoView` globally, and that stub hid the
  defect from us while it reached consumers.
- **`GrTree` typeahead lost matches when Shift was held.** The buffer stored the raw character and
  normalised only the query, so `Shift+F` followed by `f` searched for `"Ff"` and found nothing —
  the focus silently stayed put. Both `GrTree` and `GrSelect` now use the shared `useTypeahead`,
  which normalises before comparing.
- **`GrTooltip` took its easing curve from the preset, not from the design system.** Its transition
  declared a duration but no `ease-*` at all, so `presetMini` supplied the curve.

### Internal

- Transition classes of the five floating panels moved to a single shared preset
  (`panelPopTransition`); each panel declares its classes in its own safelist, because a module in
  `components/shared/` has no directory of its own in `dist` and the preset never scans it.
- The safelist gate now walks component imports into `components/shared/**` and reads nested helper
  directories, closing a blind spot in which such a module's classes were checked by nothing at
  all — not the gate, not `doctor`, and not the showcase, where a neighbour masks the defect.
- The paired-leading rule is enforced by `defineStyleTokensGate({ requirePairedLeading: true })`,
  with an explicit list of exceptions (`GrKbd`, where `leading-none` centres the glyph).
- `PageUp`/`PageDown` step size is shared by `GrSlider` and `GrNumberInput`
  (`components/shared/numericStep.ts`). `GrSplitter` keeps its own: different trigger, different
  unit, and its `bigStep` is a public prop.

## [v0.26.0] 2026-08-18

### Added

- **`isEmpty`, `getByPath` and `setByPath` are now exported from the `GrForm` entry**, next to
  `runFieldRules` and `createGrFormMessageResolver`. They are what the form itself judges by, and
  anything that builds rules from the outside — a schema compiler, a generated form — has to read
  the model and decide "is this empty" exactly the same way. A private copy would drift silently,
  and the failure mode is the quiet kind: a `min` rule stops firing on a field the form considers
  filled. `setByPath` creates intermediate objects, never arrays, so a consumer writing into an
  array path prepares the array itself — that is documented rather than changed, since the form's
  own reset path depends on the current behaviour.

## [v0.25.0] 2026-08-18

### Added

- **New `GrChip` — a tag you can act on.** Removable with a cross, selectable as a toggle, with an
  icon in front of the label. `GrBadge` stays what it is — a label that shows a status — because an
  interactive tag needs a role, a keyboard and a hit target, and bolting those onto a label would
  have made every badge in the package pay for them. Tones and radii are `GrBadge`'s own maps
  reused unchanged, since the two stand side by side and must not drift apart in colour; the size
  ladder is the chip's own, on the control scale rather than the finer label one, because a chip is
  something you press.

  **The cross is a button only when the chip itself is not.** A plain removable tag renders a
  `<span>` root with a real `<button>` cross that has its own name and its own Tab stop. A
  selectable chip renders a `<button>` root — and there the cross cannot be a button at all: the
  role declares its descendants presentational (axe: `nested-interactive`), and `<button>` inside
  `<button>` is invalid by HTML's content model regardless of ARIA. So it becomes an
  `aria-hidden` `<span>`, removal moves to `Delete`/`Backspace`, and the chip advertises that with
  `aria-keyshortcuts`. Closable tabs already work this way; the rule is the same one, applied
  again. Practical consequence worth knowing before you reach for it: **a link cannot go inside a
  selectable chip**.

  **A selected chip takes the dense variant of its own tone** — the same fill `dark` gives. Not a
  neighbouring hue: a filter set where the selected item changes colour reads as a rainbow rather
  than as a state. An outline and a slightly heavier label were tried first and did not carry it —
  in a row of five filters the selected one was not findable at a glance. A shift in lightness is,
  and it survives monochrome and colour blindness. The non-colour channel stays regardless:
  selected chips are `font-weight: 600`, which also covers the case where the whole set is `dark`
  and the fills coincide.

  Removal is a request, not a fact: `remove` fires and nothing disappears, because the array lives
  with the consumer. The chip announces nothing to the live region for the same reason — saying
  "removed" before it happened would be a lie.
- **New `GrChipGroup` — a set of chips sharing one value.** List filters, record labels, a quick
  pick of period or status. A composite widget: one Tab stop, arrows on both axes (chips wrap, so
  "down" means the next chip just as "right" does), `Home`/`End` to the edges, `Delete` to drop the
  chip under focus. Roles follow the selection mode — `radiogroup`/`radio` for single,
  `listbox` with `aria-multiselectable` plus `option` for multiple — and the chips take their role
  from the group rather than choosing it, so a set never announces itself as several different
  widgets at once.

  **An arrow moves focus and never the value, single mode included.** Chips have a second action
  bound to `Delete`, and carrying the selection along with focus would mean changing the model just
  by walking to the chip you wanted. In a form's `radiogroup` the opposite is conventional, but
  there the elements have one action each.

  Re-picking the selected chip in single mode clears the value: a filter set with nothing selected
  is meaningful ("any"), and there would be no other way to say it. The value reaches a native form
  through hidden inputs rendered beside the chips — inside a widget role they would be one more
  piece of nested interactive content.
- **i18n:** `gr.chip.remove` and `gr.chip.removeNamed` in `en`, `ru` and `es`. The named form is the
  default whenever the chip has a `label`: twenty buttons all called "Remove" give a screen-reader
  user no way to pick the right one.
- **New `GrSteps` — the indicator for a multi-step wizard.** Checkout, sign-up, an import run:
  where the user is in the process, what is behind them and where they may return to. `steps` is a
  plain array of `{ value, label, description?, icon?, status?, disabled? }`; `linear` limits
  forward movement to the first unfinished step while leaving the way back open, because going
  back to correct something already filled in is ordinary editing, not a way around the rule.
  Horizontal for a wizard header, vertical for a side panel, and `variant="compact"` — the current
  step's label, a counter and a `GrProgressBar` — for a column too narrow for seven markers.
  `next()`, `back()` and `goTo()` are exposed through the ref, since the wizard's own buttons
  belong in the page footer next to "Cancel", not inside the indicator.

  **Step validation goes through the `beforeLeave(from, to)` gate, not through knowing about
  `GrForm`.** Return `false` and the transition does not happen; inside it the consumer calls
  `validate()` or `validateField()` on whichever fields belong to the step. So `GrSteps` never
  reads the form's context, and the form's public API did not have to grow a batch-validation
  method to serve one component. Every transition the component initiates passes the gate —
  a click on a step, `next()`, `back()`, `goTo()`. Changing `v-model` from the outside does not,
  because that is already the application's decision and intercepting it would be a lie.

  **The `error` status is set from the outside.** Three statuses follow from position — before the
  current one is `complete`, the current one is `current`, after it is `upcoming` — but the fourth
  cannot: an error lives in the form, not in the order of steps. Mark it yourself when a step was
  passed but did not hold, and the wizard becomes able to say "step 2 still has errors". A step in
  error is not the edge of what is done: under `linear` nothing past it is reachable.

  **This is navigation, not a tablist.** The root is a `<nav>` with an `<ol>`, and the items carry
  no roles at all: `role="tab"` without a `tabpanel` is a broken pattern, and a wizard's step
  content is ordinary markup. A completed step is a `<button>` with its own Tab stop, the current
  one is a `<span aria-current="step">`, and a future or disabled step stays out of the tab order —
  the shape `GrBreadcrumbs` and `GrBottomNav` already hold. There is no roving tabindex, and that
  is deliberate: the one-Tab-stop rule covers widgets that select a value, whereas here the ring of
  arrows would mostly walk over what is unreachable. "Step 2 of 4" lives in its own
  `role="status"` region in the markup rather than going through the announcer, because it is
  state, not an event.
- **i18n:** `gr.steps.label`, `gr.steps.status`, `gr.steps.completed` and `gr.steps.error` in `en`,
  `ru` and `es`. The last two are the hidden state captions inside a step: without them a completed
  step and a step in error sound exactly alike — the marker's colour is not available to a screen
  reader.
- **New `GrContextMenu` — actions at the pointer.** Right-click a table row, a tree node or a
  canvas instead of travelling to a "⋯" button at the end of the line. Items are the same flat
  model `GrDropdownMenu` already uses, so groups, dividers, icons, shortcuts, links and the danger
  variant come along unchanged; the layer is `GrPopover` in its new anchored mode. Nested submenus
  are deliberately out of scope — they need their own navigation and a safe-triangle for the mouse,
  which is a separate component rather than a prop.

  **`beforeOpen` fires before the panel opens**, and that is the only moment a menu can be built
  for whatever was clicked: a folder and a file deserve different actions. Take the target from the
  DOM rather than from the mouse event and the same handler also serves the keyboard, which has no
  mouse event at all. No separate way to cancel opening is needed — an empty model simply does not
  open, and an empty panel would be a focus trap with `Esc` as its only exit.

  **A menu reachable only by right-click does not exist for the keyboard.** The wrapper listens for
  `Shift+F10` and the `ContextMenu` key, and there the anchor becomes the *rectangle* of the focused
  element rather than a point: the menu belongs to the row and flips together with it when there is
  no room below. `trigger="manual"` disables opening by pointer only — the keyboard path always
  stays, otherwise every consumer would rewrite that handler. Inside a text field the call is not
  intercepted: the browser's own menu, with spellcheck and clipboard, is more useful there.

  `Shift`+right-click is handed to the browser (`allowNativeMenu`) — in Firefox that is the
  documented escape hatch to the native menu. `Ctrl` is deliberately not part of it: on macOS
  Ctrl+click *is* the right click. Scrolling closes the menu, as native menus do, because the
  anchor is a viewport point with no element behind it.
- **`GrPopover` gained `anchor` and `padding`.** `anchor` positions the panel by a viewport
  rectangle instead of the `#trigger` wrapper — the wrapper is not rendered at all when the slot is
  absent, and no ARIA is emitted in that mode, since `aria-haspopup` is invalid outside an
  interactive element. `padding="none"` drops the panel's own padding for content that draws its
  own, which `contentClass` could not do reliably: padding and type size ship in one class string
  of equal specificity, so the winner depended on rule order in the generated CSS.
- **`useFloating` accepts a virtual anchor.** The reference may now be a getter returning either an
  element or a `{ x, y, width?, height? }` rectangle, and the subscription is only rebuilt when the
  reference itself changes — so moving a context menu to a new point costs one reposition instead
  of tearing `autoUpdate` down and setting it up again.
- **i18n:** `gr.contextMenu.label` in `en`, `ru` and `es` — the accessible name of the menu panel.

### Fixed

- **A dev warning could crash the component instead of being skipped.** Eleven guards read
  `process.env.NODE_ENV` bare, without the `typeof process !== 'undefined'` insurance the package's
  own canon declares. That is not a style question: this package ships unminified and with no
  `define` for `NODE_ENV` — folding is the consumer's bundler's job — so the bare form travelled
  into `dist` verbatim, and in any runtime where `process` is not defined (a worker, an edge
  runtime, a plain ESM import) it is a `ReferenceError` during setup. The component died where it
  was supposed to print a hint.
- **Six more warnings were invisible outside Vite.** `GrList`, `GrListItem`, `GrSelect`,
  `GrTabPanel`, `GrTimeline` and `selectValue` guarded on `import.meta.env?.DEV`, which is
  `undefined` for anyone not building with Vite — so the warning never appeared, silently, and the
  defect it was written to catch reached production unannounced. This was drift rather than a
  decision: the comment above one of them names `GrFormField` as its model, and `GrFormField` was
  written the other way.

### Changed

- **Menu typeahead now normalises case before comparing.** `GrDropdown` compared the raw character,
  so a letter typed with `Shift` held did not count as a repeat of the same letter and the search
  silently missed. The buffer, the 600 ms window and the "repeat a letter to reach the next match"
  rule are unchanged — they now live in one place shared with `GrContextMenu`, together with the
  arrow ring, `Home`/`End` and the `Space`-activates-when-the-buffer-is-empty rule, instead of a
  fourth verbatim copy. Menu items are also focused with `preventScroll`: the panel is already
  inside the viewport, so scrolling the page to reach an item was never anything but a side effect.
- **All 23 dev guards are now one symbol, `__GR_DEV__`, expanded at build time.** Three dialects had
  accumulated because the guard was written by hand at every site, and hand-written guards have two
  mirrored shapes — `&&` under a condition, `||` before an early `return`. Getting the shape wrong
  is worse than forgetting the guard: an early return written with `&&` stops firing exactly where
  `process` is undefined, which sends the warning to production on the very runtimes the insurance
  was added for. One symbol removes the choice; `!` does the mirroring.

  **It is a compile-time substitution, not a helper, and that distinction is the whole point.** A
  runtime `isDev()` would read better and cost the consumer real bytes: bundlers do not inline
  across module boundaries. Measured with esbuild at `--minify` with `NODE_ENV` defined as
  production — the inline form collapses to `function warn(n){typeof process<"u"}`, body, dedup
  `Set` and message text all gone; through a helper the condition folds to `!1` but the call
  survives, and the `Set` and the message ship with it. The substitution produces byte-for-byte
  what a hand-written guard would, so nothing is lost.

  Two gates hold it: `src/__tests__/envGuard.test.ts` forbids any environment check in `src` that
  is not `__GR_DEV__`, and `scripts/check-dist-dev-guard.mjs` — wired into `yarn build` — verifies
  the name actually expanded in `dist`. The second is not redundant: unit tests run with
  `__GR_DEV__` defined as `true`, so a broken `define` would leave them green while consumers got
  `__GR_DEV__ is not defined` on import.

## [v0.24.1] 2026-08-18

### Changed

- Release-only bump: the workspace playground apps still pinned the core at
  `^0.20.0`, so yarn resolved a published copy for them instead of linking the
  workspace, and their uno config scanned that copy's `dist`. The pins are
  updated to the current range; nothing in this package's runtime changed.


## [v0.24.0] 2026-08-18

### Added

- **New `GrValue` — a quantity with its affixes, and nothing else.** Prefix, value, suffix: the primitive `GrDelta` and
  `GrStatistic` now both stand on. It formats nothing — "2 h 15 min" and "—" are quantities too, and a component that
  tried to parse them would ruin both — and it has no size scale of its own: type size and colour are inherited from
  wherever the quantity sits. **What kind of affix it is, the component does not decide.** That question was answered in
  code until now — prefix set as the number, suffix set as a unit — and the answer was right for `$14.99` and `42 %` but
  wrong for the rouble, which is written after the amount and is just as much part of it. The defaults are unchanged,
  but they are defaults now rather than rules, expressed as six tokens: `--gr-value-{prefix,suffix}-{color,size,gap}`. A
  right-hand currency is two of them. Which side the symbol goes on stays the consumer's call, deliberately: `Intl`
  places it **by locale, not by currency** — `ru-RU` puts every currency on the right, dollar included; `en-US` puts
  every one on the left, rouble included — so the familiar "₽ right, $ and € left" is a product rule that cannot be
  derived from anywhere.

### Changed

- **BREAKING: affix `data`-attributes moved to `GrValue`.** `GrStatistic` and
  `GrDelta` render the primitive now, so `data-gr-statistic-prefix`,
  `data-gr-statistic-suffix`, `data-gr-statistic-number`, `data-gr-delta-prefix`,
  `data-gr-delta-value` and `data-gr-delta-suffix` are gone; those nodes carry
  `data-gr-value-prefix`, `data-gr-value-number` and `data-gr-value-suffix`
  instead. Consumer styles written against the old names stop matching — silently, the way CSS does. `GrStatistic`'s
  page used to promise those attributes would keep working; the promise is withdrawn here rather than quietly broken.
  `data-gr-delta-sign`, `data-gr-statistic-final` and everything outside the value record are untouched.

### Fixed

- **Elevation was a single set shared by both themes, and in the dark one it produced no shadow at all.** The levels
  were painted with a translucent
  `rgba(15, 23, 42, …)` — the exact colour of the dark theme's own background — so a raised surface lost one of its two
  lift channels and stood on lightness alone. That is the real cause behind "cards do not separate, the page is one dark
  sheet": the reported culprit, the `--gr-card`/`--gr-bg` pair, measures **further apart** in dark than in light (ΔL\*
  8.4 against 1.8), so it was never the problem. Each theme now declares its own elevation, and the dark one is blacker
  and denser. `GrCard` and `GrLoading` also stopped taking their shadow from a uno-scale utility: that utility carries
  its own hardcoded colour, is not themeable, and was the reason the card's shadow could not follow the theme at all.
  Gate: `src/__tests__/elevationPerTheme.test.ts`.

  **This makes elevation a theme role, which a theme built from scratch must
  now declare.** `createTheme({ tokens })` without a `base` fails at build time
  with the three missing names listed — the same way it already behaves for any
  other role, and for the same reason: an undeclared role does not come from
  nowhere, it comes from `:root`, i.e. from the light theme. Themes built with
  `extendTheme({ base })` inherit the new values and need no change.
- **Soft tone backdrops shouted in the dark theme.** The same `-light` role sat 1.5–2.8× further from its card than in
  light, and up to 4× higher in chroma:
  `danger` screamed where its light-theme counterpart whispered. All six tones are now damped to about three quarters of
  that distance. Matching the light theme exactly was measured and rejected — it turns the backdrops grey, because a
  colour on a dark ground needs more chroma to read as a colour at all. Text contrast improves rather than suffers
  (worst case 5.28 → 5.82), and the tones stay apart by ΔE ≥ 8.4, well over the gate's threshold of 4.

### Changed

- **`GrStatistic` no longer renders a currency sign as a caption.** The prefix was drawn muted, a step smaller and
  separated by a gap, which on screen read as "$ 14,99" — a label standing next to a number rather than one amount. The
  distinction is not about this component: a *currency prefix* is part of the quantity, while a *unit suffix* (`%`,
  `ms`, `pcs`) is not, and drawing both the same way left every consumer overriding it through the slot. The prefix now
  takes the number's own size, colour and weight and sits flush against it; the suffix keeps its muted treatment and
  gains the spacing the shared `gap`
  used to hand out indiscriminately. Tone travels to the prefix too, so a negative amount turns red as one value instead
  of half of one. `GrDelta`
  already worked this way — it is the same rule, now in both places.

### Added

- **`titleWhenTruncated` — the full text of a clipped line, on hover.** A label cut to "Включе…" cannot be read at all,
  and that is data loss rather than a cosmetic issue: `truncate` is a paint-time rule, so the string stays whole in the
  DOM and a screen reader still gets all of it — the only reader who loses it is the one looking at the screen.
  `GrSegmented` now hands its label over on hover, and the handler is exported because the rule belongs to any markup
  with
  `truncate`, not to this package's components. The tooltip appears **only when the text is genuinely clipped**:
  measuring happens on the hover itself, so there are no observers and no subscriptions, and a tooltip that merely
  repeats a fully visible label — noise nobody asked for — never appears.

### Changed

- **`GrDescriptionList` now sizes its columns by the container, not the viewport.** This changes behaviour released in
  0.23.0 without changing the shape of the prop: `columns` was a ladder of media queries
  (`sm:grid-cols-2 lg:grid-cols-4`), and media queries measure the screen while the list lives in a card. In a 290px
  column on a wide monitor two columns switched on with nowhere to go, a fixed `labelWidth` took what little space there
  was, and `break-words` — deliberate, so hashes and request ids wrap instead of blowing up the layout — split the
  remainder character by character:
  "30" printed as "3" and "0" on two lines. The card was showing a number that was not the number. `columns` is now a
  **ceiling**: `columns: 4` means "up to four", and how many actually appear is decided by the width available. Anything
  narrower than `--gr-description-list-column-min` (12rem, overridable)
  gets one column. Under `inline` the floor is higher, because there the label sits *beside* the value and the column
  has to fit both: `labelWidth` plus
  `--gr-description-list-value-min` (5rem). Without that term a column exactly as wide as one label leaves the value a
  few pixels and wraps it per character — the same defect in different numbers, and it was still reproducible at
  460–500px until this was added. It is plain CSS — `repeat(auto-fit, …)` — so there is no measurement, no observer and
  no difference between the server render and the first client one. `stackBelow` is untouched and keeps doing its own
  job: it switches the *label* layout, not the number of columns.

### Fixed

- **A card's own heading sat flush against its border.** `<GrCard title="…">`
  with no explicit `padding` printed the heading, and the `border-b` under it, hard against the frame — on the default
  value of its own prop, which is how it reached 29 cards in one admin panel. The cause was one computed feeding all
  three sections: `padding` resolves to `none` by default, `paddingClass.none`
  is an empty string, and the divider is drawn unconditionally. The `none`
  default is not the mistake and has not moved — it exists because `GrCollapse`,
  `GrList` and `GrSortableList` are built on `GrCard`, and because a card wrapping a table wants that table edge to
  edge. What was wrong is that the argument "the content knows its own padding" was applied to a header that has no
  content: the card draws it. **A card now pads what it draws itself.** The heading from `title`/`description` gets its
  own inset at any `padding`; the
  `#header` and `#footer` slots keep taking theirs from `padding`, because the consumer filled them and a slot with its
  own insets would otherwise end up with double. That split is the same one already documented for precedence —
  `#header` overrides the props, and with them the responsibility.

## [v0.23.0] 2026-08-17

### Fixed

- **`GrDelta` printed the sign after the currency symbol.** With `prefix` and
  `showSign` together the output was `$+0.0280`, while the component's own page had promised `+$0.0280` since the day it
  was written — the sign belongs to the quantity as a whole, not to the number standing after the currency mark, and no
  typographic tradition sets it the other way. The invariant that produced the defect is untouched: the sign is still
  placed by `Intl` through
  `signDisplay`, never by string concatenation, which once cost `GrStatistic`
  its digit grouping. The component now **extracts** the sign from
  `formatToParts` into its own node ahead of the prefix instead of appending one — the digits are never reassembled.
  Without a `prefix` there is nowhere to move the sign to and the markup is byte-for-byte what it was. One subtlety
  worth naming: in RTL locales an invisible direction mark precedes the sign and is what flips it relative to the
  digits, so it travels with the sign rather than being stranded in the number it no longer governs.

### Added

- **`GrDescriptionList` lays out up to four columns and can run its pairs along a line.** Eight short pairs in two
  columns stretch a card to twice its needed height and leave half of it empty, so `columns` now accepts `3` and `4`.
  The breakpoint ladder is baked into the step rather than handed to the caller:
  four columns of short pairs are unreadable on a phone, so `columns: 4` means
  "up to four" — one column on a narrow screen, two on a tablet, four when there is room. Separately, a third `layout`,
  `flow`, sends pairs along a line with wrapping: `inline` and `stacked` both stack pairs vertically, which is wrong for
  metadata that captions something else — "Messages: 3 · Created: 12.04"
  inside a list item. It stays a real `<dl>` with `dt`/`dd` pairs, not text with colons. `columns`, `divided` and
  `labelWidth` do not apply there, because a line has neither columns nor a row to rule off; and `stackBelow` leaves it
  alone, since a line already wraps by itself.
- **`GrStatistic` derives its tone from the sign of the value.** A margin tile has to turn red when the margin is
  negative, and until now the consumer wrote that `computed` by hand next to two class literals. `polarity` reuses
  exactly the rule `GrDelta` already applies: `positive-good` for revenue,
  `negative-good` for cost of goods and churn, `none` when the sign says nothing about quality. Zero stays neutral under
  every polarity — "unchanged" is a third state that two colours cannot express — and a non-numeric value
  (`"2 h 15 min"`, `"—"`) has no sign to read. An explicit `tone` still wins: a derived tone is a default, not a
  dictate. The tone follows the prop rather than the count-up frame, so an animating tile does not flash neutral on its
  way to the answer.
- **`deltaTone` / `deltaDirection` and `fileKindOf` / `isPreviewableKind` are public.** Both rules were already
  implemented and tested inside the package and both were being rewritten in consuming apps, which is where they drift:
  one copy of the tone rule painted a zero green, like income. The tone is needed precisely where the delta's markup
  does not fit — `tone` on
  `GrStatistic` and `GrBadge` in report tiles — and the file classifier is needed because `GrFilePreview` deliberately
  does not open the viewer, so deciding which files to hand to `GrImageViewer` falls to the consumer.

## [v0.22.0] 2026-08-17

### Added

- **New `GrJsonViewer` — an unknown value as a tree you can walk.** `GrCodeBlock`
  answers "read this and paste it into a ticket"; this one answers "find the field", which is the other half of every
  integration screen — webhook bodies, model responses, audit payloads. It is built on `GrTree`, so the expensive
  parts — the WAI-ARIA `tree` pattern, the keyboard contract, roving tabindex, virtualisation and node filtering —
  arrive already written and already tested; what is new is the walk from `unknown` to nodes. Node keys are readable
  paths (`$.items[3].name`), not ordinals, because the path is what goes into the ticket and what drives expansion; a
  key containing a dot is escaped so the address stays an address. **Long values are truncated on sight, and that is not
  cosmetic**: a request carrying a base64 image is a single leaf of several hundred thousand characters, which neither
  node collapse nor row virtualisation can help with — there is one node and one string. Copying still yields the value
  whole, because truncation belongs to the display. Cycles are marked only on a genuine ancestor: unlike a
  `JSON.stringify` replacer, which never sees the ancestor stack and so has to brand every repeated reference, a tree
  walk has that stack — an object honestly placed in the data twice now renders twice.

## [v0.21.1] 2026-08-17

### Fixed

- **A menu item's highlight spilled past the rounded corners of its panel.**
  `GrDropdownMenu` painted `hover:bg-*` on a full-width item that had no radius of its own, inside a `GrDropdown` panel
  that is rounded and does not clip — so the first and last rows flooded the very corner segments the radius had cut
  away, and a `disabled` row showed it without any hover at all. The item now carries a radius one step below the
  panel's, the way `GrSelect` and `GrAutocomplete`
  options already do. The menu also stopped trying to cancel the panel's padding with a `p-0` of its own: both classes
  land in the same attribute with equal specificity, so which one wins is decided by the order of the generated CSS
  rules rather than by the markup — a silent coin flip that had been resolving against the intent. Suppressing another
  component's spacing needs its own channel, never a competing class.
- **`GrList` rows flooded the corners of the card beneath them** for the same reason: no padding on the card, no radius
  on the row, no clip anywhere. The list container now clips to the card's radius, inheriting the value rather than
  repeating it, so the two cannot drift apart.

## [v0.21.0] 2026-08-17

### Added

- **New `GrFilePreview` — a stored file as a tile.** An attachment feed mixes receipts, contracts and exports, and one
  rule does not show them all: an `<img>`
  pointed at a PDF renders a broken-image icon, which is the defect this replaces. The kind comes from `mime`, never the
  extension — extensions lie, the backend does not. Six kinds, one icon each; an empty type, `application/octet-stream`
  and an unknown type all land on the placeholder rather than a hole, because "no type recorded" is an ordinary row in
  the database. A failed load degrades into that same placeholder with a different glyph — "the image did not open", not
  "this is a file" — and a new `src` does not inherit the old error. `alt` is never invented: a `name` becomes the
  `alt`, and without one the image is decorative, since a description the component made up is read out as fact. The
  tile is a control only when asked (`clickable`, `href`, `as`); otherwise it is a `<div>`
  and takes no tab stop. It does not open the viewer itself — it emits `click`, because a grid of tiles and a fullscreen
  viewer are different page states. While an image is in flight the tile holds its place with a skeleton: a feed of a
  dozen attachments arrives out of order, and an empty cell reads as "this file has no preview" when the request is
  merely still on the wire. The image stays in the DOM throughout and simply waits invisible — remove it and the browser
  never starts the download, so the loading state would never end.
- **New `GrCodeBlock` — raw JSON or text, shown as it is.** The consumer case is a service response pasted into a
  ticket, and until now that meant `<pre>` copied across pages with three different sets of classes, none of them
  keyboard-reachable despite scrolling. `code` takes `unknown` because the data comes out of a database:
  a circular reference becomes `[Circular]` instead of hanging the tab, `BigInt`
  prints with an `n` suffix instead of throwing, and a hostile `toJSON` yields
  `[Unserializable]`. A string passes through untouched — it is already text. The copy button puts the **source** in the
  clipboard, not the rendered node; line numbers are a CSS counter, so they exist in no selection and no paste. Without
  a secure context the button is not rendered at all, since one that silently does nothing is worse than none — and
  because the check runs after mount, server and first client render agree. Highlighting is a four-role tokenizer of our
  own; a highlighter dependency for two admin pages would not be proportionate. The block joins the tab order when it is
  a scroller **by props** (`maxHeight` set, or `wrap`
  off), which is how `GrTable` and `GrList` already decide — measuring overflow would make the tab stop flicker on every
  data change. The copy button sits beside the scroller rather than on top of it: a browser paints the scrollbar at the
  scroller's right edge, and a button covering it takes away the very pixels you grab it by. The block therefore
  reserves a gutter on the right, and drops it when there is no button to put there.
- **New `GrDelta` — a signed value with sign and tone inside a line of text.**
  «Margin −$12.50» is a fragment of a sentence, not a tile: `GrStatistic` owns the block-level metric, this one owns the
  inline one. Zero is neutral under every polarity, and `null` prints a dash with no tone, no arrow and no affixes —
  "no data" and "zero" are different claims, and `$—` reads as zero dollars.
  `polarity` inverts the tone without touching the sign, so a 15% drop in response time is green and still negative. The
  sign comes from `Intl`'s `signDisplay`
  rather than string concatenation, which is what used to turn `1234.5` into the un-groupable string `'+1234.5'`. Tone
  selection lives in a pure module tested without mounting — that `switch` is exactly what consumers were copying by
  hand, and the copies had already drifted into painting zero green. The default step sets no font size at all, so the
  value is typeset in the size of the line it stands in — large in a heading, small in a caption under a chart — and the
  arrow, sized in `em`, grows with it. The outer steps stay explicit for the opposite case: a value standing in a row of
  controls has to match them, not the prose.
- **New `GrDescriptionList` — label-value pairs as a real `<dl>`.** Renders
  `dl > div > dt + dd`, which is valid HTML5 and gives the layout something to hang on; hand-written markup kept
  producing a `<dl>` full of bare `<div>`s that looked like a list but carried neither term nor definition for a parser
  or a screen reader. An empty value prints a dash instead of dropping the row, since a missing row breaks both the
  alignment and the reading. `inline` keeps labels in a fixed column so values stop drifting with label length, and
  `stackBelow` measures the **container** — pairs live inside narrow cards on wide screens. `columns: 2`
  lays pairs out on a grid rather than `column-count`, so a pair can never be split across columns. Tone applies to the
  value only: a red label reads as "this field is broken" when the problem is the number.
- **`GrCard` gained `title`, `description` and `headingLevel`.** The heading is a real `h2`…`h6` (default `h3`), not a
  bold `<span>`: a report built from six cards had nothing but the page `h1` to navigate by. `#header` still wins over
  the props when the header is non-standard, and a card-link takes its accessible name from the heading instead of its
  entire contents. A `clickable` card degrades the heading to a `<span>` and warns in dev — `<button>` only admits
  phrasing content, so a heading inside it is invalid; use `hoverable` plus a link in the heading.
- **`useToast().push()` accepts `dedupeKey`.** A repeat push under a live key replaces that toast and restarts its
  dismissal timer instead of stacking a duplicate — the usual source being navigation that replays the same page props.
  The key is only held **while the toast is on screen**: remembering the last text shown instead never releases, and the
  second "Saved" would never appear.
- **`GrDataTable` takes a typed summary row.** `summaryRow` maps column keys to values and renders them in `<tfoot>` on
  the same column grid as the body — same paddings, alignment, widths and pinning, because it reuses the very functions
  the body cells use. Hand-built footer rows cannot: `GrTable` leaves
  `<tfoot>` cells unstyled on purpose, so a hardcoded `px-3 py-2` silently drifts four pixels off the body the moment
  the table changes `size`. A column absent from the object stays an empty cell, and `0` still prints — "the total is
  zero"
  and "there is no total" are different claims. Styling is the `#summary-<key>`
  slot (scoped with `value` and `column`); the row carries no tone of its own, since "refunds" and "profit" are
  different messages and the component cannot pick between them. Under `virtual`, the row joins `aria-rowcount` and gets
  its own `aria-rowindex`.
- **`GrDataTable`'s `#footer` slot is scoped** with `columns` (in current order)
  and `totalColumns` (including the selection column), and now renders after the summary row — it is the escape hatch
  for what a single typed row cannot carry:
  several totals, a note, a `colspan`.

- **Every component page now answers "when do I reach for this one?"** Two required sections — `## Когда брать` (3–5
  user situations, not a feature list) and
  `## Когда взять другое` (a table of redirects, each row ending in a live link to a neighbour) — across all 68 pages.
  Picking between `GrSelect` and `GrAutocomplete`, or between `GrDialog`, `GrModal` and `GrDrawer`, no longer means
  reading both sources.
- `defineComponentDocsGate` from `@feugene/granularity-test-kit` wired in. It holds the **shape**: a page per registry
  component, no orphans, `H1` matching the component, both sections present and non-empty, redirect links resolving to
  real components, the name linked from the index, and no hand-written API table — the listing is generated, and a
  manual copy drifts silently.

### Changed

- **`GrForm.model` is now generic** (`GrForm<TModel extends object>`), and `submit`
  emits that same type. An external form object — Inertia's `useForm`, a store — no longer needs `as unknown as` in
  every form; `Record<string, unknown>` stays the default type argument, so existing usage is unchanged. Type a `ref` to
  the form as
  `GrFormInstance`: a generic component compiles to a function, and
  `InstanceType<typeof GrForm>` does not resolve for it.
- **`GrCard.title` is a prop now, not a passthrough attribute.** `<GrCard title="…">`
  used to land on the root element as a native tooltip; it renders a heading instead. For a tooltip, use `GrTooltip`
  around the card.
- `docs/components.md` §"Страница компонента" now specifies the four places a page has and the question each one
  answers, so redirects to a neighbour and genuinely missing capabilities stop bleeding into each other.
- `ADDING_COMPONENTS.md` gained the documentation step it never had: the page, the index link and the fork entry in the
  cross-package map, all in the same change as the component.

### Fixed

- **`href` was dropped whenever `as` named a component** — `GrCard`,
  `GrSidebarItem` and `GrStatistic` all gated it on `rootTag === 'a'`, which is false for a component. Inertia's `Link`
  and `RouterLink` render an `<a>` of their own and need the prop, so `<GrCard :as="Link" href="…">` produced a link to
  nowhere and consumers wrapped the card from the outside instead. The attribute is now suppressed only for string tags
  other than `a`, where it would be invalid HTML — `as="article"` still gets nothing.
- **`GrForm.resetFields()` deleted the methods of an external model.** The snapshot is built by cloning, the clone drops
  functions, and any key missing from the snapshot was removed — so resetting a form built on Inertia's `useForm`
  stripped
  `post`, `reset` and `errors` off the object and the form silently stopped working. Function-valued keys are now left
  alone.
- **Prop docs that contradicted their own implementation.** `GrSegmented.name`
  promised "hidden radio-inputs" while the component emits exactly one hidden field — deliberately, since `role="radio"`
  declares its children presentational and a nested interactive control breaks the widget for screen readers.
  `GrTimelineItem.pending` claimed the dashed run starts *after* the marker, while the CSS dashes the segment *leading
  to* it and its own. Both strings had already travelled into `componentApi.generated.json`,
  `web-types.json` and IDE tooltips, so the fix is in the source, not the page.
- **Behaviour that existed only in code.** `GrTimeline` auto-detects emptiness (and why `v-for` over an empty array does
  not count as content) and renders skeleton rows while loading; `GrFileUpload` keeps the progress bar for
  `hideProgressOnSuccess` ms after success, because a bar vanishing on the same frame it fills reads as a failure;
  `GrDataTable` separates
  `initialSortKey`/`initialSortDir` from the controlled `sortKey`/`sortDir`. None of it was on the pages.
- **`GrTimeline`: the axis jogged sideways and broke apart at every group heading.** Three defects, one root cause — the
  rail geometry assumed a rail always contains a marker, and a group heading's rail contains only the line.

    1. The heading row and an event row are *separate grid containers*, so each resolved the `auto` rail column against
       its own content: 10px (the dot) in an event, 2px (the bare line) in a heading. The axis shifted 4px sideways at
       every heading. The rail now takes its floor from
       `--gr-timeline-marker-size`, so both agree by construction.
    2. `[data-gr-timeline-rail] > :first-child { flex: none }` was written for the dot, but in a heading the *line* is
       the first child — it stopped growing, stalled at its `min-height` and left an 11.6px hole below the heading. The
       rule now targets everything except the line.
    3. The air above a heading sat on the heading row, and the rail spans that row — so the padding punched a 2.4px hole
       above the date. It now sits on the heading text instead.

  Only the first heading hid all three: its line is `visibility: hidden`, so the damage showed from the second group
  onward. Geometry is not observable in jsdom, so the regression gate lives in the browser —
  `apps/showcase/e2e/interaction.spec.ts` asserts that the axis neither drifts sideways nor breaks anywhere except the
  one deliberate gap under each dot.

## [v0.20.0] 2026-08-13

The release that freezes the public contract before `1.0`. Every breaking change below costs one edit today and a major
version with a migration guide after the
`1.0` tag — which is the only reason they are grouped into a single release.

### Removed

- **The deprecated `visibleChange` emit is gone** (`GrSelect`, `GrTreeSelect`). Use `@update:open` / `v-model:open`,
  which have carried the same signal since 0.14.0.

  ⚠️ **This one breaks silently.** Vue does not distinguish "the emit is not declared" from "the emit did not fire": a
  template that still says
  `@visible-change="…"` produces no error, no warning, and no console output — the handler simply stops running. Grep
  your templates for both spellings (`@visible-change` and `@visibleChange`) rather than waiting for a test to catch it.
  A gate in `deprecatedApi.test.ts` now keeps the name out of the package for good.

- **The public export surface is narrower: 832 names → 767.** Component barrels were leaking their own internals —
  splitter geometry, hex parsing, cell comparison, injection keys, runtime variant tuples — and `1.0` would have frozen
  all of it as API. What went: 65 value exports with no consumer anywhere in this repository or its docs, plus the two
  transitive `export *` re-exports (`GrCollapse` → its context module, `GrFileUpload` → the whole
  `fileValidation` barrel).

  Untouched: every component, `GrXProps` / `GrXEmits` / `GrXInstance`,
  `grXConfig`, `grXSafelist`, the documented variant types (`GrButtonVariant`,
  `GrTabsOrientation`, `GrBadgeTone` and the rest), every `use*` composable, and the error classes you catch
  (`GrUploadAbortError`, `GrUploadHttpError`,
  `FileValidationError`).

  **The one migration you may actually need:** file-validation values (`acceptValidator`, `maxFileSize`,
  `normalizeFiles`, `runFileValidators`,
  `matchAccept`, …) reached the root barrel only through `GrFileUpload`'s
  `export *`. They now live where the docs always pointed —
  `@feugene/granularity/fileValidation`. Types are unaffected: the root barrel re-exports them as before.

  A new gate (`publicSurface.test.ts`) keeps the surface from growing back: a value leaving a component barrel must be
  the component, its config, its safelist, a composable, or an entry in a closed allow-list with a stated consumer.

### Changed

- **`types` now resolves to `dist/types/index.d.ts`, and `main` is present.**
  The old path carried a `src` segment (`dist/types/src/index.d.ts`) — an artefact of `vue-tsc` compiling with the
  package root as `rootDir`, which broke tools that resolve declarations by convention. If you hard-coded the old path
  anywhere, drop the `src`. The same fix landed in `@feugene/extra-granularity`
  and `@feugene/unplugin-granularity`.

- **`exports` gained `"./package.json"`.** Bundler analyzers, resolver plugins and metadata checks read it directly, and
  Node refuses paths that are not exported.

- **`peerDependencies.vue` lowered from `^3.5.40` to `^3.5.0`.** This widens compatibility rather than breaking it: the
  real floor is `useId`, available since 3.5.0, and nothing in the package uses an API from 3.5.1–3.5.40. The narrow
  range was excluding consumers for no reason.

- **RTL is explicitly unsupported.** Components lay out with physical directions (112 occurrences across 27 components)
  and never read `dir`; a right-to-left document renders mirrored. Moving to logical properties changes how every
  component looks, so it belongs in a major release, not a patch. Recorded in
  `README.md` and `docs/styling.md` so the answer is findable instead of inferred.

### Added

- **Coverage is a gate, not a suggestion.** The `coverage-granularity` CI job is enabled with per-metric thresholds
  (lines 89, statements 87, functions 89, branches 81 — measured values minus ~3 pp of headroom, because v8 counts SFC
  coverage slightly differently between vitest patches and a zero-margin gate is just a flake generator). The job could
  never have run before: the root
  `coverage:granularity` script called `test:coverage`, which the package did not define. Data files (generated
  registries, safelists, defaults, locales) are excluded — with them in the denominator the number measures how much of
  `src`
  is data, not how well it is tested.

- **Negative form-control contract tests** (`formControlNegative.test.ts`). The suite had 3200 tests proving components
  *do* things and almost none proving what they must *refuse* to do — which is exactly why the readonly bypasses and IME
  commits found in the 2026-08-08 audit walked past all of them. Two classes, both asserted in **both** directions,
  because "no event was emitted" is free for a component that ignores the keyboard entirely: every key that changes a
  value must stop changing it under `readonly`, and `Enter` during IME composition must not commit what plain `Enter`
  does. The control registry moved to `src/__tests__/formControls.ts` so contract and negative gates read one list.

- **`keydown` and `composingKeydown` in `@feugene/granularity/testing`.**
  `isComposing` is read-only on `KeyboardEvent` and silently lost by
  `wrapper.trigger('keydown', …)`, so the obvious way to write an IME test actually tests a plain `Enter` — it stays
  green on broken code. The helper sets both `isComposing` and `keyCode: 229`, matching the predicate the package reads.

- **Keyboard e2e for seven components** — `GrInput`, `GrTextarea`,
  `GrFileUpload`, `GrTable`, `GrSidebar`, `GrBottomNav`, `GrList` — in
  `interaction.spec.ts` (8 scenarios → 17). All seven were unverified for the same reason: their contract is tab order,
  focus return after an action, arrow scrolling and `aria-disabled` semantics — none of which exist in jsdom.

- **Two showcase demos that were missing outright:** `clearable` on `GrTextarea`
  and a labelled scroll region on `GrTable` (`maxHeight` + `stickyHeader` +
  `regionLabel`). Both features shipped long ago with nowhere to see them.

## [v0.19.0] 2026-08-13

### Added

- **`createTheme`: a theme with no base.** `extendTheme` inherits from `light`, `dark` or another theme, which is the
  wrong deal for a theme that shares nothing with the package palette — a high-contrast theme, a brand theme, a print
  theme. Worth being precise about what "from scratch"
  can mean: in CSS a theme cannot inherit from nothing. A role the theme does not declare comes from
  `:root`, and `:root` is the package's light theme, so a hand-written file that declares 74 of the 90 roles is not
  independent — it is 16 roles of light theme in disguise. `createTheme` makes independence a build-time guarantee:
  leave a role out and the build fails, naming the roles and where they would otherwise have come from.

  `tone` now derives `-solid-hover` / `-solid-active` too — those are theme roles, not `color-mix`
  derivatives, so a from-scratch theme could not be completed without them — and picks its suffixes from the role
  registry (`--gr-accent` only has `-fg`, `--gr-primary` has no `-light`), so its output drops into either builder
  unedited. `validateTheme` gained a matching rule: solid text must stay readable on all three solid states.

- **Theme composition: `@feugene/granularity/theme`.** A custom theme used to mean writing out all 90 semantic roles by
  hand, because a role you leave out does not fall back to *your* base — it inherits from `:root`, which is the light
  theme. A dark theme with one forgotten role gets a bright patch, and nothing catches it until a user does. Worse,
  themes rot: the package adds a role, your theme silently stays behind (our own sample theme was 28 roles behind before
  this change).

  `extendTheme({ name, base, tokens })` builds the full set from the package's own token data: you declare only what
  differs, everything else comes from `light`, `dark` or another custom theme, and roles added later arrive on the next
  build. It also emits the `@supports not (color-mix)` fallback computed from **your** colours — a hand-written theme
  has none, so such browsers used to fall back to the light theme's hover/active values.

  `tone('success', '#3ddc97', { base })` derives a whole tone family (`-fg`, `-solid`, `-solid-fg`,
  `-light`, `-text`) by the rules in `docs/theming.md`, checking every contrast threshold on the way and throwing — with
  the role name and the ratio it reached — rather than handing back something unreadable. `validateTheme` checks WCAG
  contrast and tone distinguishability (ΔE); `extendTheme`
  runs it and fails the build, unless `validate: false`.

  Runtime application lives at `@feugene/granularity/theme/apply` (`applyTheme(css)`), a separate subpath that pulls in
  no token data — themes that only exist in the browser (a theme editor, user settings) should not cost the app a token
  reference. Docs: `docs/theming.md`.

- **Test utilities: `@feugene/granularity/testing`.** Testing a UI kit means fighting the same jsdom gaps in every
  file — and the package's own suite had seven verbatim copies of one pointer helper, eleven hand-written
  `getBoundingClientRect` mocks and nine copies of a live-region reader. The new entry ships them: `press`/`move`/
  `release`/`cancelPointer`/`drag` for pointer gestures, `mockRect`
  and `stackRects` for geometry, `granularityGlobal` and `i18nAdapter` for mounting inside the package's config and
  translation context without rendering `GrConfigProvider`, `announced` for the live region, `resetGranularityDom` for
  cleanup, `stubMatchMedia` for reduced-motion checks.

  Each helper carries knowledge a local copy loses: `pointermove`/`pointerup` are listened for on **`window`** (that is
  how `useDragGesture` works, so a test dispatching them at the element silently asserts nothing), and clearing `body`
  without resetting the portal root leaves the next mount teleporting into a detached node. Depends on neither `vitest`
  nor `@vue/test-utils` — it hands you data and DOM actions, you keep your runner. Docs: `docs/testing.md`.

### Fixed

- **The package no longer needs an icon preset in your config.** Its own icons — the select chevron, the clear cross,
  the checkmark on a chosen option, spinners, drag grips, trend arrows — were shipped as `i-lucide-*` utility classes,
  and those classes are generated by the **application's**
  UnoCSS config, not by ours. An app that followed the documented setup got components with the space for an icon
  reserved and nothing in it: the build stayed green, types were intact, and only someone opening the page could see it.
  Those icons are now compiled into `dist` at build time and no longer depend on how you configure UnoCSS. The same
  class of defect twice bit `sr-only` and
  `tabular-nums`; a gate (`src/__tests__/iconContract.test.ts`) now keeps the package's own icons from drifting back
  into classes.

### Changed

- **`icon` props accept a Vue component, not just a class.** `GrTabs`, `GrBreadcrumbs`,
  `GrStatistic`, `GrCommandPalette`, `GrRating` and `GrTree` (`expandIcon` / `collapseIcon` /
  `dragHandleIcon`) now take `string | Component`, matching what `GrSidebarItem` and `GrBottomNav`
  already did. Passing a class keeps working and stays the shortest path — it just needs
  `presetIcons` plus an icon collection on your side, which is now written down in
  `docs/installation.md`. A component needs nothing at all.
- **`GrTree` icon props default to the built-in icons** instead of the `i-lucide-chevron-right` /
  `i-lucide-grip-vertical` class literals. Passing your own icon overrides them exactly as before.

## [v0.18.0] 2026-08-12

### Added

- **`GrToaster` toasts can be swiped away.** A notification now leaves the way it does on a phone:
  drag it toward its own edge of the screen — right for a right-hand stack, left for a left-hand one — and past a
  quarter of its width it goes. Short drags spring back, and so does an **interrupted**
  gesture: if the browser takes the pointer (a system gesture, a call, a lost window) the user never finished the swipe,
  and finishing it for them would dismiss a message they were still reading. Dragging the other way meets resistance
  rather than a second, hidden way to the same action, and while a toast is held its timer stops — otherwise it could
  burn down under the finger.

  The keyboard equivalent is `Delete` / `Backspace` on a focused toast (reach one with `F6`), with focus moving to its
  neighbour. `Escape` is deliberately left alone: the toaster is not a modal layer, and claiming it would dismiss a
  notification instead of the dialog underneath.
  `swipe-dismiss="false"` turns the gesture off and leaves the keyboard path intact.

  A released toast flies out past its edge and only then closes. The fly-out is the component's own transition rather
  than a new animation, so `prefers-reduced-motion` needs nothing extra: the global clamp collapses it, and dragging
  itself is direct manipulation rather than motion.

### Fixed

- **An interrupted gesture no longer flips the frame in `GrImageViewer`.** `pointercancel` — the browser taking the
  pointer back on a system gesture, a call, a lost window — went into the same handler as `pointerup`, which saw a swipe
  candidate and paged the viewer. A cancelled gesture is now its own path: it ends the pan, clears the pinch state and
  counts as nothing.

- **Releasing outside the image ends the drag.** Panning was held by `setPointerCapture` bound to the `<img>`; when the
  frame changed mid-gesture the element was replaced, no `pointerup` arrived anywhere and `isDragging` stayed up — the
  cursor stuck at `grabbing` and CSS transitions stayed off. The pan now runs on `useDragGesture` with listeners on
  `window`, so the end of a gesture is caught wherever it happens.

### Added

- **`GrDataTable` columns resize and pin.** `resizable-columns` puts a grip on the right edge of every header cell: the
  width follows a pointer, and from the keyboard the grip behaves as a window splitter (`role="separator"`) — arrows
  step by 16px, `Shift` by 48px, `Enter` (or a double click)
  returns the column to auto layout. Widths live in `v-model:column-widths` keyed by column, with a
  `columnResize` event alongside; 48px is the floor, and an aborted gesture restores the width from before the press.
  The mode switches the table to a fixed layout on purpose — on auto layout the browser recomputes columns from content
  and a user's width disappears on the next data update.

  `pinned: 'left' | 'right'` on a column sticks it to the edge during horizontal scrolling. Offsets inside a pinned
  group are measured from neighbours rather than declared, so a pinned column does not need a `width`; they are
  recomputed on data changes and through a `ResizeObserver`. Pinned columns always sit as a group at their edge —
  reordering across a group boundary is refused, otherwise "pinned left" would stop meaning "left" — and the selection
  column pins together with the left group so a checkbox never scrolls away from its row. Adds
  `gr.dataTable.resizeColumn` and
  `gr.dataTable.columnResized` to all three locales, plus `--gr-datatable-resizer*` and
  `--gr-datatable-pinned-shadow*` tokens.

- **`GrDataTable` lets people reorder columns.** `reorderable-columns` puts a drag handle in every header cell; the
  column follows a pointer — mouse or finger — and moves from the keyboard with
  `Shift`+`←`/`→`, each move announced in the live region. The handle is its own button rather than the header itself,
  so clicking a header still sorts and dragging never steals that click; in the tab order all handles share **one** stop
  for the whole header row (roving tabindex), with plain arrows walking between them.

  `v-model:column-order` holds the order as an array of keys — without it the table remembers the order itself, exactly
  as it already does for sorting. `columnReorder` (`{ key, from, to }`) is emitted alongside for callers that persist a
  single operation. The set of columns still belongs to
  `columns`: an unknown key in the order is ignored and a column missing from it lands at the end, so editing `columns`
  can never drop a column silently. Adds `gr.dataTable.moveColumn` and
  `gr.dataTable.columnMoved` to all three locales, and `--gr-datatable-drag-*` tokens for the handle and the insertion
  line.

- **New `GrSortableList`** — a list whose order the user changes: task priorities, report fields, route steps. It drags
  with a mouse, with a finger, and — the reason it belongs in a design system rather than in every application — **from
  the keyboard**: `Space` picks a row up, arrows move it,
  `Space` drops it, `Esc` cancels, and every one of those is announced through the shared live region. One `Tab` stop
  for the whole list (roving tabindex), the handle is a button outside the tab order, `v-model` returns a **new** array
  instead of mutating the input, and `move(from, to)`
  is emitted alongside for callers that persist a single operation rather than the whole list.
  `orientation="horizontal"` switches both the layout and the arrow axis; `maxHeight` turns the list into a scroller
  with edge auto-scrolling. No virtualization by design — a drop target has to be rendered. Adds `gr.sortable.*` to all
  three locales.

- **`useDragSort`** — the reorder model behind it, built on `useDragGesture`. It owns the mechanics (drag threshold,
  hit-testing, edge auto-scroll, `Esc` cancellation, pointer/keyboard session state) and deliberately not the meaning:
  what counts as a target, which keys move it and what to announce stay with the component. That split is what lets a
  list treat a target as an insertion index while a tree treats it as a node plus a `prev`/`inner`/`next` zone. See
  `docs/drag-sort.md`.

- **`useDragGesture`** — the pointer-drag skeleton every draggable control was writing for itself. It owns the plumbing
  and nothing else: subscribe on `pointerdown`, ignore anything but the primary button, listen on `window` (a pointer
  leaves the element constantly, and capture would tie the gesture to a DOM node that may re-render mid-drag), and
  unsubscribe on both endings and on scope disposal.

  The reason it exists is that a drag has **two** endings, not one. `pointerup` finishes the gesture and commits;
  `pointercancel` — the browser taking the pointer back, which is routine on touch when a vertical swipe turns into a
  page scroll — aborts it and restores the state from before the press. That rule lived in two copies (`GrSlider`,
  `GrSplitter`) and would have drifted on the first edit. Both components now run on the primitive with no change in
  behaviour, proven by their existing suites: 24 and 32 tests, untouched.

  Deliberately absent: `preventDefault` (a slider suppresses text selection, an image pan must not), coordinate math, a
  drag threshold, and multi-pointer tracking. See `docs/drag-gesture.md`.

### Changed

- **`GrTree` drag and drop runs on pointer events.** It used to be built on the HTML5 drag and drop API, which sends no
  events on touch and has no keyboard equivalent — so reordering a tree worked with a mouse, on a desktop, and nowhere
  else. It now shares `useDragSort` with `GrSortableList`:
  the same drag threshold, the same edge auto-scrolling, the same `Esc` to abort, plus an outliner keymap — `Shift`+`↑`/
  `↓` reorders among siblings, `Shift`+`→` makes the node a child of the previous sibling, `Shift`+`←` lifts it to the
  parent level, each move announced in the live region. The public API is unchanged: `draggable`, `allowDrag`,
  `allowDrop`, `nodeDrop` and the three drop zones behave exactly as before. Adds `gr.tree.moved` to all three locales.

## [v0.17.0] 2026-08-12

### Fixed

- **A version bump no longer invalidates every visual baseline.** v0.16.0 masked the sticky showcase header for exactly
  this reason, and it was not enough: a mask paints over an element's box, not over what the element draws outside it.
  The active navigation pill has a glow that reaches some fifteen pixels below the header, and the version chip is what
  moves it — a wider string widens the chip, the chip shifts the navigation, the navigation carries the glow. So the
  difference landed just *below* the mask, and bumping to 0.17.0 broke 81 of 86 baselines with nothing but antialiasing
  under a magenta rectangle. The header is now hidden rather than masked: `visibility` drops the whole paint at once and
  leaves the layout alone, since a sticky header takes no space in the flow. Proven by running the gate against three
  different version strings, one of them longer.

### Changed

- **A key combination is one chip now.** `<GrKbd keys="mod+K" />` used to render `[⌘] [K]` — two bordered keys — which
  is honest markup but not how the systems themselves write a shortcut. The default is `variant="merged"`:
  `⌘K` on macOS, `Ctrl+K` elsewhere. `variant="split"` brings the old look back, and a single key in the slot
  (`<GrKbd>Esc</GrKbd>`) is untouched. The markup stays nested `<kbd>` in every variant — only the border moves from the
  inner keys to the outer chip, so the readable names of symbol keys survive.

  The `separator` default changes with it: it is no longer `+` but **auto**. In a merged chip a separator is inserted
  only after a word, which yields `⌘⇧K` and `Ctrl+Shift+K` — within one platform the set is homogeneous (macOS gives
  symbols, the rest give words), so "glue after a symbol" is exactly "write it the way the OS does". An explicit
  `separator` still wins.

### Added

- **`GrKbd` knows the rest of the keyboard**: `tab`, `backspace`, `delete`, `pageup`/`pagedown`, `home`, `end` and the
  four arrows, each with a readable name behind the glyph. Until now those keys were written as bare glyphs in markup,
  and a screen reader announced `↑` as a symbol rather than as a key.

- **The key catalogue is public**: `GR_KBD_TOKENS` (with `findKbdToken`) lists every token `keys` accepts — the
  canonical name, its aliases and how it looks on each platform. The formatter reads the same table, so the list in the
  docs and in the showcase cannot drift from the behaviour.

- **`variant="sequence"`** for chords typed one key after another (`G` then `I`), with the connecting word coming from
  the locale.

- **`v-hotkey` understands the `mod` token** — the same one `GrKbd` and `GrCommandPalette` already spoke. A binding and
  its hint are now written identically (`v-hotkey="{ 'mod+K': open }"` next to `<GrKbd keys="mod+K" />`); before, the
  directive needed `Meta+K` and `Ctrl+K` spelled out separately, and the two drifted apart silently.

- New i18n keys `gr.kbd.*` for the added keys and for the sequence connector, in all three locales.

### Fixed

- **A popover opened inside a modal no longer hides behind it.** The panel is teleported into the shared portal, so it
  ends up next to the modal's root rather than inside it — the modal's own stacking context never covered it, and a
  static `--gr-z-dropdown` (1000) lost to
  `--gr-z-modal` (1100). It affected every floating component in the package — `GrSelect`,
  `GrAutocomplete`, `GrDropdown`, `GrTreeSelect`, `GrTooltip`, `GrPopover` — and everything built on them. `useFloating`
  now takes the height from the overlay stack: with `N` modal layers open a panel gets `calc(var(--gr-z-modal) + N)`,
  which keeps nested dialogs working and leaves the fullscreen loading overlay and toasts on top. A popover opened
  *outside* a modal is unaffected:
  while a modal is open the page behind it is `inert`, so a non-zero count means "opened from inside the modal". The
  showcase gained a demo with a select, an autocomplete, a dropdown, a tooltip and a date picker inside one modal — the
  case that had no coverage at all, which is why the regression lived unnoticed.

- **`componentDefaults` typing now survives in companion packages.** The `GrComponentDefaultsRegistry` interface was
  declared in `GrConfigProvider/context` and only re-exported from the public subpaths, so an outside package had no way
  to name the module that declares it. Augmenting a re-export works — but only while it is the sole augmentation in the
  program: as soon as a `defaults.d.ts` of this package joined the same type graph, the outside augmentation was dropped
  silently, leaving `componentDefaults` unaware of that component and `useGrComponentProp` untyped. No error, just types
  drifting from runtime. The declaration moved to the public `composables/useGrComponentConfig`, where both this
  package's components and companions augment it directly. A gate (`src/__tests__/componentDefaults.test.ts`) now pins
  the address for every `defaults.ts`.

- **`GrColorPicker` and `GrFormFile` no longer put `aria-required`/`aria-readonly` on a button.** Neither attribute is
  supported by role `button`, and axe reports them as a critical `aria-allowed-attr` violation — the colour picker hit
  it as soon as a form rule made its field required. The states are not dropped, though: both controls now announce them
  in the accessible description of their widget, since `GrFormField`'s `*` marker is decorative and hidden. The contract
  gate learned the distinction rather than the exception — a control whose widget is a button is checked for the
  description, and for the *absence* of the forbidden attribute.

- New i18n key `gr.form.readonly` in all three locales: without it the read-only state of those two controls had nothing
  to be announced with.

- **Visual baselines no longer capture the showcase header.** It is `position: sticky`, so it painted over the top of
  the snapshot region — version badge included — and a version bump alone invalidated every baseline without a single
  component having changed. The header is masked now, and the gate is about components again.

## [v0.16.0] 2026-08-11

### Changed — BREAKING

- **`GrNumberInput` models a number.** `v-model` was a `string`, which made the numeric control the only one in the
  package handing the parsing back to its consumer — `GrSlider` has worked with numbers all along. It is now
  `number | null`, with `null` for empty; `update:modelValue` and `change` carry the same type, and `clear` empties the
  field to `null` rather than to `''`.

  ```vue
  <!-- было -->
  <GrNumberInput v-model="qty" />        <!-- const qty = ref('3') -->
  <!-- стало -->
  <GrNumberInput v-model="qty" />        <!-- const qty = ref<number | null>(3) -->
  ```

  The objection that kept the string was real: a half-typed `-` or `1,` is not a number, and coercing it every keystroke
  would produce `NaN`. It is answered by separating the two roles rather than by widening the model. What is being typed
  lives in the field as a **draft** — the exact string, shown as-is — while the model reports `null`
  until that draft parses. A commit (`change`, blur, or any step from a button or a key) drops the draft and applies
  `min`/`max` and `precision`, which is why `precision="2"` no longer rewrites `7` into `7.00` under the cursor.

  One consequence worth reading twice: `decimalSeparator` stops being part of the value and goes back to being what it
  always was — how the fraction is shown and typed. With `decimal-separator=","` the value `1,25` on screen is
  `1.25` in the model.

### Fixed

- **A file survives `GrForm`'s snapshot.** The snapshot cloned the model through `JSON.parse(JSON.stringify(...))`, and
  a `File` does not survive that: it has no enumerable own properties and no `toJSON`, so it collapsed into `{}`. Two
  consequences, both silent. `resetFields()` put that `{}` into the field — the control looked reset, but the model now
  held junk that would be posted to the server; `setSnapshot()` recorded the same `{}`. And `isDirty` could not see
  files at all: every file serialized identically, so "picked a document" and "did not touch anything" were the same
  string. The snapshot now keeps `File`/`Blob` by reference (identity is the point — reset must return *that*
  file), and the dirty comparison fingerprints them by name, size and modification time. Everything else keeps its JSON
  semantics, `Date` included.

- **`GrSwitch` thumb sits evenly on every step.** The offsets were measured against the track's outer size, but the
  thumb moves inside its content box — 2px narrower because of the 1px border. The vertical gap is fixed by geometry at
  1px, so the horizontal one had to match; instead it was 2px at rest on three steps out of four and 1–2px at the far
  end, which read as a thumb pressed against one edge. All four steps now keep 1px on every free side, and the
  arithmetic is a gate:
  the test recomputes both gaps from `trackSizes`/`thumbSizes`, so changing any step shows the drift immediately.

- **Chips of `GrAutocomplete` and `GrSelect` are visible in the light theme.** They painted their own plate — for the
  autocomplete a 35% mix of `--gr-muted` with no border, which is **1.02:1** against the field behind it: three units
  out of 255. Both now render `GrBadge`, the way `GrInputTag` always did, so a chip is a soft badge with a border, and
  its look is a prop rather than a hardcoded class: `tagTone`, `tagDark`, `tagSize`, `tagRadius` (`sm` by default — a
  chip lives inside a control, not in running text). The `+N` pill of `GrSelect` joins the same family.

  The reason this shipped at all is that no gate asked whether a plate is **visible**: the contrast gate only checks
  text on its own background, and 3:1 from WCAG 1.4.11 fails even for our own `--gr-muted`/`--gr-brd` pair. `GrBadge`
  now has a second gate measuring perceptual distance (ΔE against the page, threshold 2.3 — the just-noticeable
  difference already used by the tone-palette gate), which is exactly what the old chip would have failed.

- **Panel state rows line up with the panel.** In `GrAutocomplete` and `GrTreeSelect` "Loading…", "Nothing found" and
  "type at least N" sat 4px left of the options (the row is a sibling of the listbox and missed its padding), and an
  empty listbox still rendered its own padding above them, so the text looked pinned to the bottom. They are centred
  with double vertical padding now — the language `GrSelect` and the command palette already spoke — and an empty
  listbox is not rendered at all.

- **`GrTree` row highlight no longer eats the parent's branch line.** Hover and the current-row background started at
  the left edge of the tree on every level and painted over the guides of the ancestors — the line disappeared exactly
  where it carries meaning. The surface moved to a layer inset by the row's own indent, so each level's highlight starts
  after its parent's line; the focus ring moved with it, otherwise the row read as two different rectangles. This
  restores what the nested markup did before it became a flat row list.

- **A toast whose timer is restarted while it waits no longer burns out unseen.** `toast.promise` and `update` re-arm
  the timer of an existing toast without touching the list or the pause flag — and the toaster's effect, which is the
  one place that knows about both, did not depend on `timeoutMs` and never woke up. Two consequences, both silent: a
  promise settling under the cursor started counting down under the cursor, defeating the pause that WCAG 2.2.1 asks
  for; and a promise settling while its toast still queued behind `maxVisible` counted down and closed **without ever
  being shown**. The effect now reads `timeoutMs`, so the decision "tick or not" stays where the visibility and pause
  live.

- **`GrResponseErrorBanner` retry button takes the banner's tone.** It was always `primary`, so a blue outline button
  sat on the red of a server error and the orange of a validation one. Banner and button share the same `GrTone` scale,
  so this is a pass-through, not a mapping — and it applies to the `tone` prop, `toneByKind` and the kind default alike.

- **Expanding a collapsed `GrBreadcrumbs` no longer breaks the path.** In `autoCollapse` the list is a single
  `overflow: hidden` row — that is what makes collapsing necessary — and expanding it kept the row: the tail was cut
  off, taking the current page with it, and focusing a revealed crumb scrolled the head out of view with no way back.
  Expanding now returns wrapping, so the whole path stays readable, and a width change collapses it again (the "…"
  button is gone once expanded, so a phone rotation used to leave the path expanded for good). Two neighbours of the
  same bug: the fit arithmetic ignored the list's `gap`, which made it optimistic by ~40px on a six-crumb path, and the
  measured ellipsis width outlived a change of `items`.

- **`GrCollapse` row highlight reaches the `#extra` slot.** The slot lives next to the trigger rather than inside it (a
  `<button>` in a `<button>` is `nested-interactive`), and the hover background painted by the button stopped 12px short
  of it — with `divided: false` that highlight is the only thing structuring the rows. Hover and the disabled background
  moved to the row itself, and the right inset of `#extra` now comes from the size scale instead of a hardcoded `pr-4`.

- **`GrPagination` page hover is visible in the light theme.** `--gr-muted` on white is 1.10:1, while the neighbouring
  "previous/next" ghost buttons tint their hover — the row read as two different controls. Page buttons now use the same
  tonal roles as a `GrDropdownMenu` item (`--gr-accent` / `--gr-accent-fg`).

- **A fractional `step` no longer drifts.** Rounding only ever happened when `precision` was set, so a field stepping by
  `0.1` showed `0.30000000000000004` on the third press of `↑`, and `2.2 + 1.1` came out as
  `3.3000000000000003`. The step now rounds to the decimal count of the larger operand, which leaves `precision`
  free to mean what it means — how the committed value is shown — instead of doubling as the only guard against binary
  drift. The suite missed this because its one fractional-step test set `precision`, taking the branch where rounding
  already existed.

- **`GrNumberInput` steppers are disabled in `readonly`.** `stepBy` refused to act, so nothing changed on click — but
  the buttons looked alive, while the clear button in the same component already hides itself in that state.

### Changed

- **`GrSelect` is no longer one 1700-line file.** The largest SFC in the package kept everything in one script:
  values, panel composition, virtualization and keyboard, all sharing one scope of ~90 top-level bindings, where the
  only way to learn what a computed depended on was to read the whole thing. Its logic now lives where the package
  already puts it — `GrSelect/composables/` (`useSelectValues`, `useSelectPanelItems`, `useSelectVirtualization`,
  `useSelectNavigation`), the same shape `GrImageViewer` uses, plus a Vue-free `selectValue.ts` for value comparison
  with tests of its own. Each takes getters and callbacks and returns computeds, so the dependencies of a block are its
  signature rather than a guess.

  **Behaviour is untouched, and that is the point:** all 86 existing tests, the overlay and a11y e2e suites, and the
  visual baselines passed without a single edit. Public types, props, emits and the generated component API are
  identical.

  One gate had to follow the code: `virtualSpacer.test.ts` looked for `useVirtualList(` in `.vue` files, and after the
  move `GrSelect.vue` no longer contains that call. It now treats the **component** as the consumer — scanning the whole
  directory for the call while still demanding the spacer contract from the markup — so a component whose virtualization
  lives in a composable cannot quietly drop out of the gate.

- **`GrStatistic` renders the label and the value as a pair.** They were two adjacent `div`s — a screen reader read them
  in order and the meaning survived, but "term — value" was nowhere in the markup. It is now `<dl>` → `<dt>` →
  `<dd>`, and only when there is a label: a definition list without a `<dt>` would be the same disconnection with a
  claim to semantics. The trend line stays **outside** the `<dl>` (only `dt`/`dd` groups are allowed inside), its place
  in the DOM unchanged. Every `data-` attribute is kept, so consumer styles written against them keep working;
  `<dl>`/`<dd>` margins are zeroed explicitly, since the package preflight only resets `body`.

### Added

- **New `GrSplitter`** — two panels with a divider between them: a tree on the left and content on the right, an editor
  above a console. `GrSidebar` has exactly two widths, both fixed by a prop, so an application that wanted a draggable
  boundary wrote the drag by hand every time — window listeners, clamping, keyboard and ARIA from scratch.

  The size is a **share**, not a pixel width: `modelValue` is the percentage taken by the first panel. Percentages
  survive a change of window width, and — the part that matters more — they are known before the render, so the server
  markup matches the client and hydration stays clean. The component measures the DOM in exactly one place:
  turning a pointer coordinate into a percentage. Keyboard, `Home`/`End` and collapsing need no measurement at all.
  `v-model` is optional — without it the splitter remembers the size itself — and `change` fires at the end of a gesture
  and on every keyboard step, which is where an application hangs its layout persistence.

  It holds exactly two panels; a three-pane layout is composition, the way code editors do it — a vertical splitter
  inside the `#end` slot of a horizontal one. `min` and `max` bound the first panel and `minEnd` bounds the second, so
  neither can be squeezed to nothing; when `min` and `minEnd` conflict, `min` wins, because the alternative is a panel
  the user cannot get back.

  The divider is a real `role="separator"` in the tab order: arrows step, `Shift`+arrow steps by ten, `Home`/`End`
  go to the bounds, and with `collapsible` `Enter` collapses the first panel and restores it to the size it had —
  collapsing is a state of its own, not `modelValue: 0`. Double-click resets the boundary to `defaultSize`, and dragging
  tight against the edge collapses the panel with the mouse. One detail worth stating: `aria-orientation`
  describes the divider, not the layout, so a horizontal layout — panels side by side — carries
  `aria-orientation="vertical"`.

- New i18n key `gr.splitter.label` in all three locales.

- **New `GrProgressCircle`** — progress as a ring or a gauge, for the places a full-width bar does not fit: a dashboard
  tile, an avatar upload, a metric card. `shape="dashboard"` cuts a quarter out of the bottom so a caption fits under
  the value, and the reading stays the same in both shapes — the share of work done; only the length of the track
  changes.

  The markup is deliberately two-layered: `role="progressbar"` carries the SVG alone, and the centre sits next to it as
  an absolutely positioned sibling. That is not cosmetic. A widget role makes its descendants presentational, so a
  Cancel button inside the ring — the first thing an upload needs — would become `nested-interactive` and cost the
  screen reader both the button and the indicator. The centre layer itself is inert to the pointer; interactive content
  inside it turns events back on.

  What shows in the middle follows a fixed precedence — slot, then status icon, then value. `showValue` prints the
  percentage and `formatValue` replaces it with your own text (and drives `aria-valuetext` with it); `statusIcon`
  swaps the number for a check at `value >= 100` and for a cross on `tone="danger"`, that is, only in terminal states.
  An empty slot does not claim the centre: what counts is the content, not the fact that a slot was passed.

  Tones come from the same theme layer as `GrProgressBar` (`--gr-progress-bg` and its siblings), each read with a
  fallback to the theme role, so a granular import of the circle alone still gets its colour. `indeterminate` runs the
  arc around the ring and announces no value at all; under `prefers-reduced-motion` it shows a closed neutral ring
  rather than a frozen quarter arc, which would read as "25 % done".

- **New `GrTimeline`** — an event feed with an axis, markers and day headings: order history, audit log, delivery
  status. Until now that shape was assembled by hand out of `GrList` plus home-made `::before` lines, and every
  application drew it differently.

  Items come in either of the two ways `GrList` already established. A heterogeneous feed is written as
  `GrTimelineItem` children; a uniform set is passed as `items` and rendered through `#item` — and only then does the
  timeline know the shape of the data, which is what makes `groupBy` possible. Grouping only *cuts* the set: the order
  of events and of groups stays exactly as it arrived, and no date is parsed anywhere. What counts as a day is the
  application's call — a field name or a function — because the alternative is a component that owns time zones and
  locale formats the library does not have.

  A flat feed is an `<ol>`; a grouped one is a sequence of `<section>`s, each with its own heading (`<h3>` by default,
  `groupHeadingLevel` to fit the page) and its own list. The day heading is deliberately not a list item — a `<li>`
  holding a date would be announced as one of the events. The axis and the markers are `aria-hidden`: the text carries
  the meaning and the tone only reinforces it. A time label is a `<time>`, machine-readable when
  `datetime` is given.

  Beyond the default single axis, `layout` offers a left-hand time column and an alternating two-sided feed, and
  `orientation="horizontal"` turns the axis sideways — the feed becomes a scroller and takes `tabindex="0"`, since a
  scrollable region has to be reachable from the keyboard. Vertical layouts do not apply there and say so in DEV. The
  alternating layout folds back to one side on a narrow screen. Markers take a `tone`, an `outlined` variant or a
  `#marker` slot of their own, and `pending` marks an event that has not happened yet: hollow dot, and the stretch of
  axis *leading to it* dashed — leading, not following, because the unfinished event is normally the last one and its
  own segment is not visible at all.

  There is no keyboard of its own, no clickable row and no virtualisation: the feed displays, and anything interactive
  is placed inside it by the consumer.

- New i18n key `gr.timeline.empty` in all three locales.

- **New `GrColorPicker`** — a colour field for theming and branding screens, where the colour used to be typed into a
  plain `GrInput` and validated by eye. The trigger is a button carrying a swatch and the current value; the panel holds
  the H/S/L channels, an optional opacity channel, a hex field and a grid of presets.

  The model is a hex string — `#RRGGBB`, or `#RRGGBBAA` with `alpha` — which is the form a colour already has in theme
  tokens, in an API payload and in CSS, so nothing needs converting on either side. An unparseable value neither crashes
  the component nor gets rewritten: the panel falls back to `#000000` and the model is left alone until the user picks
  something. Internally the colour is kept as HSLA, separately from the model, because hex is a lossy projection — grey
  has no hue, and a picker that re-derived its state from the model would snap the hue slider back to 0° the moment
  saturation reached zero.

  Channels are ordinary `GrSlider`s rather than the usual 2D saturation/value square: that square is a widget of its
  own, with its own gestures and two axes of keyboard, and its accessibility would have to be built from scratch. What
  ships instead is a real `role="slider"` per channel, each with its own name and `aria-valuetext`. The panel is a
  `GrPopover` dialog and stays non-modal, so `Tab` leaves it for the rest of the page while `Esc` closes it and returns
  focus to the trigger through the shared layer stack. `Enter`/`Space` on the trigger opens the panel.

  The full form-control contract is implemented — `disabled`, `readonly`, `invalid`, `required`, `ariaLabel`,
  `update:modelValue`/`change`/`focus`/`blur`, exposed `focus()`/`blur()` — plus `v-model:open`, `placement`, `size`
  from `GrConfigProvider`, `presets` (invalid entries are dropped, the selected one carries `aria-pressed`) and
  `name`, which posts the value to a native form through a hidden input. There is deliberately no `clearable`: a colour
  has no empty state.

- New i18n keys `gr.colorPicker.*` (`panelLabel`, `hue`, `saturation`, `lightness`, `opacity`, `hexLabel`,
  `presetsLabel`, `swatchLabel`) in all three locales.

- **`GrSegmented` goes vertical.** Sidebar filters are the reason the orientation exists, and the component was one prop
  short of them. `orientation="vertical"` turns the row into a column and declares `aria-orientation`.

  Nothing had to be invented for the indicator: it is measured in two dimensions (`translate3d` plus `width`/
  `height`), so it slides down the column exactly as it slides across the row — only the grid tracks change, and a
  watcher recomputes the geometry when the orientation flips, so the indicator does not stay in the coordinates of the
  previous layout. Keyboard is untouched too, and deliberately so: both axes of arrow keys already work in either
  orientation, which is what APG asks of a `radiogroup` — a vertical row does not disable the horizontal arrows.

  In the vertical layout there is a single column, so segments share a width by construction and `block` only decides
  whether the group fills its container. One thing did need adjusting: the track radius. `9999px` is tuned for a short
  row and turns a tall column into an ellipse, so vertically it is computed from the segment height instead — the column
  gets the rounding of a single row, and the segments inside stay pills because they derive their radius from the same
  value.

- **`GrSkeleton` knows its shape, and can repeat itself.** One default radius served every case: a pill is right for a
  line of text and wrong for a block, so every rectangular placeholder passed `rounded` by hand — the showcase demo did
  it three times on one screen. `variant` now names the shape — `text` (pill), `rect` (`--gr-radius-md`),
  `circle` (round, height following width so a single given side cannot turn it into an oval) — while `width` and
  `height` stay with the consumer, because the height of a placeholder is dictated by the content it stands in for, not
  by a scale inside the component.

  `count` draws a block of N placeholders in one prop instead of a hand-rolled `v-for`; for `text` the last line is
  shorter, so the block reads as a paragraph rather than a list of identical bars. A single placeholder still renders
  without a wrapper, and a bare `<GrSkeleton />` is unchanged to the pixel — which is what `GrTable` and `GrList`
  render in their loading rows.

- **`GrStatistic` counts, and can lead somewhere.** The one thing a dashboard expects from a "statistic" was the one
  thing it could not do. `animate` now tweens the number when the tile appears and on every change — **from the previous
  number**, not from zero: counting from zero on each refresh reads as a data reset. `animateDuration` sets the length
  in milliseconds; deliberately not a token, because the `--gr-duration-*` scale tops out at 300 ms and describes state
  changes, while walking a number is a different genre and its number belongs where the tween is.

  This is the package's first JS-driven motion, so it carries the obligation the global clamp in `base.css` cannot:
  the component reads `prefers-reduced-motion` itself, at tween start rather than in `setup` (there is no `matchMedia`
  on the server, and the first client render would diverge). Under `reduce` the value is simply there, with no
  intermediate frame. And while the tween runs, the visible number is `aria-hidden` and a visually hidden node carries
  the final value — "1,284,500" on screen and "743,210" in the ears is not noise, it is wrong data.

  Getting to the details is the same pattern `GrCard` and `GrListItem` already speak: `href` renders a link,
  `clickable` a button, `as` your own tag or router component, plus a `click` emit.

- **`GrTabs` closes tabs, and knows what to say when there are none.** Two gaps that were really one: the row had no
  dictionary of its own, so an empty tab list rendered nothing at all — not even a place for the consumer to put a
  message — and there was no way to close a tab. `closable` now puts a ✕ on the tabs and binds `Delete`/`Backspace`;
  `closable: false` on a single tab pins it, `closable: true` opts one in when the row-level prop is absent.

  The ✕ is deliberately **not** a button. `role="tab"` makes its descendants presentational, so a nested `<button>`
  disappears for a screen reader (axe: `nested-interactive`). It is an `aria-hidden` `<span>`, the tab's own click
  handler tells the two hit areas apart, and closable tabs carry `aria-keyshortcuts="Delete"` — otherwise only a sighted
  mouse user would ever learn the shortcut. A disabled tab closes by neither route: `aria-disabled` covers all
  interaction, and closing is interaction.

  The component emits `close(value)` and touches neither `tabs` nor `modelValue`: the list belongs to the consumer, and
  closing may not go through ("save changes?") — switching the tab in advance would be a lie. What it does take care of
  is focus: once the list has actually shrunk, focus returns to the tab that took the closed one's place, instead of
  falling into `<body>` with the button that vanished.

  An empty row no longer renders an empty `role="tablist"` — a role that must own `tab` children, with a text node
  inside it, is an `aria-required-children` violation rather than an empty state. In its place is a block carrying the
  new `gr.tabs.empty` (en/ru/es), overridable by `emptyText` and by the `#empty` slot, and it keeps the tab's height so
  neighbours don't jump when the last tab closes.

- **`GrForm` validates files with a rule.** File constraints lived only on the field (`accept`, `limit`,
  `validators` on `GrFormFile`), so the form knew nothing about them: `validate()` called the field valid, `invalid`
  never mentioned it, scroll-to-error skipped it, and "the contract is required and must be a PDF under 5 MB" could not
  be written down in one place. The new `file` rule says it in `rules`, next to everything else:

  ```ts
  const rules: GrFormRules = {
    contract: [{ required: true, file: { accept: '.pdf', maxSizeMb: 1 } }],
  }
  ```

  Keys: `accept`, `extensions`, `mimeTypes`, `maxSizeMb` / `maxSizeBytes`, `maxCount`, `maxTotalSizeMb`, plus a
  `validators` hatch for your own (including async) `FileValidator`. The rule contains no checks of its own — it
  assembles the very validators from `@feugene/granularity/fileValidation` that `GrFormFile` and `v-dropzone` already
  run, so a constraint moved from field props into the rule changes neither the behaviour nor the wording: the message
  comes from the validator and is localized by its own `gr.fileValidation.*` key. `GrFormFile` is untouched — field
  props stay the fast feedback that keeps a bad file out of the model, the rule is the guarantee at submit. Several bad
  files report the first one; a form field has one error line, and files are no exception.

- **`FileValidatorSource` gained `'form'`.** A validator can now tell "the user is picking a file" from "the form is
  checking before submit" — the distinction an expensive validator needs to run on submit and stay quiet on every pick.
  Widening the union is a typing break only for a consumer with an exhaustive `switch` over `source`.

- **`GrBadgeWrap` can mark an arriving count.** A message that lands while the page is open looked exactly like a number
  that had been sitting there all along. The new `animate` prop pops the counter when it **appears** or **grows** — the
  events the user does not know about yet. Counting down stays silent: that is the trace of their own action ("read"),
  and highlighting it would blink the badge on every read message. The prop is off by default, because whether the pulse
  fits is the application's call, not the library's.

  The obvious failure mode is answered by design: a burst of changes produces **one** pop, not five. While the animation
  plays a new value does not restart it, and the flag is released by `animationend` rather than by a duration duplicated
  in script — under `prefers-reduced-motion` the package's global clamp compresses the animation to `0.01ms` instead of
  removing it, so that event still arrives and the badge stays in its normal frame. Timing comes from
  `--gr-duration-base` / `--gr-ease-out`, so a theme retunes it along with the rest of the motion.

- **`GrRadio` scales in the `radiobox` variant too.** The box was `h-4 w-4` in the template and the label was pinned to
  `--gr-text-sm`, so `size` did nothing outside `variant="button"` — the component was on the size scale in name only.
  Box, dot, label and description now come from maps aligned with the button ladder, and `GrRadio`/`GrRadioGroup` left
  the
  `KNOWN_FLAT_SIZE` list of the size gate — that list checks itself for staleness, so it demanded the change as soon as
  the scale became real.

- **`GrTextarea` counts lines.** `showLineCount` prints a second caption in the same row: lines on the left, characters
  on the right. Lines are **logical** — separated by newlines, not by visual wrapping — so with `autosize` the number
  does not depend on the field's width. The caption is localized and declines properly (`gr.textarea.lines`), and
  `maxLines` turns it into `3 / 10`. It deliberately does not limit input: showing `12 / 10` is the honest answer,
  trimming what the user typed is not the component's call.

- **`GrImageViewer` can zoom to the actual pixel size.** `scale` is nominal — 1 means "fitted into the window" — so on a
  4752 px photo the toolbar's "100%" is really 21% and no grain is visible at all. The new "1:1" button
  (`actions.zoomToNatural`, also on the imperative API) goes to **real** 100%, pixel for pixel; the data to compute it
  was already in the toolbar slot, but every consumer had to do the arithmetic itself. It works in both directions: a
  frame smaller than its place on screen zooms out to 1:1. `maxScale` still applies — it caps zooming on purpose, and
  the actual size is not a reason to ignore it, which is why a large photo needs a higher cap than the default 5.
  Nominal versus real scale is now written down in `docs/components/GrImageViewer.md`.

- **A filled `GrBadge` stops being a black plaque in the light theme.** The badge got its own theme layer,
  `--gr-badge-{tone}-bg` / `-fg`, because the weight a filled badge needs differs between themes. In the light theme
  `--gr-{tone}` is a bright fill meant for **dark** ink — `-fg` there has to be dark, white on `--gr-success` is 2.54:
  1 — so the badge read as a heavy near-black plaque; the layer moves it to `-solid`/`-solid-fg`, the button-weight fill
  under light text (5.48:1 on success, 5.18:1 on warning), which also puts filled badges and solid buttons in one
  family. The dark theme keeps the roles it had, where a pastel fill with dark ink is the convention. Only `success`,
  `warning` and
  `azure` actually change: for the other tones `-solid` is a reference to the tone itself.

  The AA gate now resolves component theme layers too — it used to measure the class fallback, which is not what the
  user sees. `GrBadgeWrap` deliberately stays on the plain tone: a dot over an avatar is judged against the page (3:1),
  not against a paragraph on top of it. The weights are written down in `docs/theming.md` so the next component does not
  pick a role by eye.

- **`GrProgressBar` can drop the track border** — `borderless`, also configurable through `GrConfigProvider`. The border
  earns its place on a bare background, where the `--gr-muted` track barely differs from the page; inside a card it is a
  second border next to the card's own.

- **`GrProgressBar` says "unknown" instead of "zero".** Half of all progress is indeterminate — the request is out and
  the server never said how big the answer is — and the component had no way to show it. `indeterminate` runs a stripe
  along the track and stops publishing a value: `aria-valuenow` and `aria-valuetext` are dropped, which is what the role
  uses to mean "unknown", so no extra `aria-busy` is needed. `GrFileUpload` switches to it on its own now, wherever XHR
  reports no `lengthComputable` — until this it drew an empty bar sitting at 0% for the whole upload.

  The stripe is one of the two animations in the package that carry state, so it does not rely on the global
  reduced-motion clamp. Frozen in its first frame it would sit 40% wide at the left edge and read as "40% done"; under
  `reduce` it becomes a neutral full-width fill instead, which claims neither zero nor completion. The reasoning now
  lives in `docs/motion.md` next to the toast timer, and the second signal is written down: a resting frame that shows
  the wrong state earns a component-level block just as `fill-mode: forwards` does.

  Two more things the bar used to leave to its callers. `showValue` prints the percentage itself — right of the track,
  fixed width, tabular figures, so `9%` → `10%` does not nudge the bar — and `formatValue` drives both that label and
  `aria-valuetext` ("184 of 512 MB" instead of a bare "36"); without a format of its own the attribute stays off, since
  a screen reader already reads the value against `aria-valuemax`. `buffer` adds the layer behind the fill for
  played-versus-buffered and uploaded-versus-confirmed; it is clamped like `value` and deliberately does not follow
  `tone` — `-light` roles exist for six of the eight tones, and a neutral layer between track and fill reads correctly
  under all of them.

  Full contract: `docs/components/GrProgressBar.md`, the component's first page of its own. The suite went from three
  render-level assertions to 21 covering both modes, the label, the buffer and the value bounds.

- **`PageUp`/`PageDown` in `GrNumberInput`** — the last unclaimed key of the spinbutton pattern. The large step follows
  the rule `GrSlider` already uses: ten steps or a tenth of the range, whichever is larger. A number field need not have
  bounds, and without them there is no range to take a tenth of, so ten steps it is.

- **`GrFormFile` shows image thumbnails.** Previews were the one capability separating the form field from
  `GrFileUpload`, and the gap was the reason consumers rewrote the file list on top of the slot. `preview` turns them on
  in both modes: a thumbnail sits next to the name for a single file and in front of each row of a multiple set. Only
  `image/*` gets one — anything else stays a plain row rather than an empty frame. The machinery is the uploader's, not
  a second copy: `useFilePreviews` moved to the package's shared internals, so the two file components agree on what
  counts as an image and on when a blob is released. Object URLs are tied to the set itself rather than to the places
  that edit it — a file leaving the set frees its URL whether it was removed by a row button, by "clear all", by a new
  selection or by an external `v-model` reset, and unmounting frees the rest.

- **`GrCollapse` has an empty state, and its own locale namespace to fill it.** An accordion with no sections drew an
  empty bordered card — a state that reads as breakage rather than "nothing here yet" — and there was no text to put in
  it: the component had no i18n namespace, so a consumer had to detect emptiness and supply the copy themselves. It now
  behaves like `GrList` and `GrTable`: the text comes from `gr.collapse.empty` (all three locales), `emptyText`
  overrides it, the `empty` slot overrides both, and `:empty="false"` suppresses the automatic detection for the case
  where sections arrive asynchronously and a flash of placeholder would be wrong. Emptiness is decided by the slot's
  content rather than by your data, through the shared `hasMeaningfulSlotContent` helper, which is why it survives the
  usual traps: a `v-for` over an empty array leaves a fragment, a `v-if` leaves a comment node, and the template leaves
  whitespace — none of that is content. Markup for a non-empty accordion is byte-for-byte what it was.

- **`GrBreadcrumbs` can collapse by the space it actually has.** `maxItems` counts items, and on a narrow screen a count
  predicts badly: three short levels fit where two long ones do not. `autoCollapse` measures instead — the path becomes
  a single line and hides as much of its middle as it must, no more. Two boundaries are deliberate: the head is never
  squeezed (`itemsBeforeCollapse` is usually the root, and it is cheap), and the tail never drops below one item,
  because the last one answers "where am I" and a path reading "Home / …" is useless. The props compose:
  `maxItems` stays a hard ceiling, width squeezes further. Off by default — wrapping onto a second line and collapsing
  are different answers, and the second cannot be imposed on anyone already living with the first. The arithmetic is a
  pure exported function (`resolveBreadcrumbsFit`), so the decision can be made outside the component, and it is tested
  by table rather than by mounting.
- **A gate that runs in a real browser.** `apps/showcase/e2e/interaction.spec.ts` plus the `Interaction gate` step in
  CI. The package's unit tests live in jsdom, which has neither `Tab` nor `Enter`-activates-a-button, so
  `trigger('click')` was proving the handler and nothing about the path to it — half of the contract written down in
  `docs/keyboard.md` had never been verified at all. `GrBreadcrumbs` is covered first: Tab reaches the "…" button,
  `Enter` expands the path, focus moves to the first revealed item, and the next Tab continues forward instead of
  jumping back to the start — plus the width-driven collapsing above, which jsdom cannot exercise either: it has no
  `ResizeObserver` and no layout. The file is the place where the remaining interactive components go.

- **`GrBottomNav` joins the size scale and opens up its items.** The panel was the one navigation component that never
  read `GrConfigProvider` at all: `<GrConfigProvider size="sm">` resized everything around it and left the bottom bar
  alone. It scales now — but the interesting part is what it deliberately does *not* scale. A step moves the bar height
  (48/56/56/64px), the glyph (16/20/20/24px) and the label type, while the item itself keeps
  `min-width`/`min-height` of 44px on every step: a touch target below 44×44 fails WCAG 2.5.5, and "make the bar more
  compact" is not a reason to fall through that floor. `md` reproduces the previous look exactly, so nothing changes
  without the prop. Alongside it, the new scoped slot `item` replaces the icon/label/badge markup — the case that
  prompted it is an avatar instead of an icon on a profile section. The slot takes the content, not the behaviour:
  tag choice (`button` / `a` / the component from `as`), `aria-current`, `aria-disabled` and click handling stay with
  the component, so a custom item cannot accidentally stop being navigation. The badge's screen-reader string comes in
  as a slot prop, so a custom item does not lose the announcement together with the default markup.

- **`GrAlert` opens up: a custom icon, a place for actions, and self-dismissal.** Everything the component could do was
  fixed at build time — the icon came from a private tone → glyph map with no way to replace or remove it, action
  buttons had to go into the message text, and the announcement mode (`live`) was the one prop of four that
  `GrConfigProvider` could not set globally, so an app that wanted calm alerts had to spell `live="polite"` on every
  one. Now: slot `#icon` replaces the glyph and `:icon="false"` drops it (useful in a dense form, where a column of
  icons shouts); slot `#actions` gives "Retry"/"Open logs" their own row under the text instead of breaking the
  sentence; `live` joins `tone`, `variant` and `closable` in `componentDefaults`. Added `v-model:visible` as well — and
  deliberately **without** internal state: with no prop the alert still does not disappear on click, it only emits
  `close` as before, because turning that button into an irreversible action would break every consumer who asks for
  confirmation on `close` first. Nothing about the existing markup or `@close` changed. Full contract:
  `docs/components/GrAlert.md`, the component's first page of its own.

- **A solid-fill role per tone: `--gr-{tone}-solid`, `-solid-hover`, `-solid-active`, `-solid-fg`.** A tone had one fill
  role, and it was doing two incompatible jobs. A badge or an indicator needs 3:1 against the page and carries dark text
  on a light fill; a solid button needs light text, which only holds on a darker fill — white on
  `--gr-success` is 2.54:1. `GrButton` had solved this privately, with forty hex literals in its own theme layer, so a
  theme repainting `--gr-success` moved every component except the button. The values now live where values belong:
  in the global themes, generated from `tokens/themes/*.json` with the AA arithmetic in a `note`, and
  `GrButton/themes/*.css` is nothing but references — the same shape `GrProgressBar` already had. Two things worth
  knowing: `-solid` also exists where a tone is already dark enough (`primary`, `danger`, `info`, `slate` in light
  simply alias it), because solid buttons of different tones have to read as one family; and `-solid-hover`/`-active`
  are declared values rather than the usual mix formula, because they were picked as palette steps — deriving them would
  have shifted azure's pressed state by 32 units per channel and, in dark, lightened buttons on hover instead of
  darkening them. Nothing moved on screen.

- **One slot vocabulary across the controls.** A slot is a role, and the same role now carries the same name everywhere
  in the package. `prefix`/`suffix` — until now an `GrInput`-only contract — are available on every control with a text
  shell: `GrAutocomplete`, `GrTreeSelect`, `GrInputTag` and `GrSelect` in `optionsView="panel"` (a native
  `<select>` takes no markup inside it, and using the slots there warns in dev). Each of them gained the same six width
  props — `prefixMinWidth`/`prefixMaxWidth`/`prefixFixed` and the suffix trio — so an addon behaves identically no
  matter which control it sits in, and `*Fixed` keeps a column of fields from drifting when their addons differ in
  width. The geometry behind it was written twice, in `GrInput` and `GrNumberInput`; it now lives once in
  `useControlAddons` and reserves space rather than replacing padding, so a field with an addon is inset from the edge
  exactly like a field without one. Vocabulary and ownership of the domain slots (`option`, `tag`, `symbol`,
  `value`, …) are held by `src/__tests__/slotContract.test.ts`: a common name cannot mean two things, and a domain name
  cannot spread to a component that is not its owner. Documented in `docs/form-controls.md`.
- **Typed slots on every form control.** `defineSlots` was declared by one control out of sixteen, so slot names reached
  neither the `.d.ts` nor the IDE, and the only way to learn one was to read the component source. All sixteen now
  declare their slots, scoped ones together with the types of their props; the gate fails a control that renders a slot
  without declaring it. Two mismatches surfaced while typing them and are fixed: `GrSelect`'s
  `displayLabel` promised a string and could hand out a raw non-string value, and `GrFileUpload` passed its default slot
  a different set of props depending on where it was rendered from.
- **`GrPopover` gains a modal mode.** A popover with a form inside had no way to isolate the page under it: the only
  option was to swap the anchored panel for `GrModal`, changing the shape of the UI just to get isolation. `modal`
  turns on the full modal contract — background goes `inert`, Tab cycles inside the panel, page scroll is locked, and
  the layer registers as modal so windows below it step down. The default is unchanged and deliberately non-modal: a
  focus trap on a layer that has not blocked the page locks the user inside a panel they are entitled to Tab out of. One
  nuance worth knowing: in modal mode focus moves into the panel regardless of `autoFocus`, because the background is
  unreachable and a layer with focus left outside would be a keyboard trap. Built on the same `useModalOverlay`
  assembly as the window, the drawer and the viewer — no second implementation of modality exists in the package.
- **`docs/overlays.md`.** The overlay contract — portal, layer stack, Esc ordering, `inert`, focus restoration, the
  focus trap, modal versus non-modal, and how to build your own overlay — used to live inside the document about the
  z-index scale, where nobody looking for Esc semantics would think to open it. It now has its own page;
  `docs/z-index.md` keeps the scale.
- **Per-component tokens are a declared contract.** Around 170 variables (`--gr-tree-*`, `--gr-button-*`,
  `--gr-segmented-*` and the rest) were read through `var(--gr-x, fallback)` and were, in practice, public theming API —
  yet they were declared nowhere: not in `tokens/*.json`, not in `docs/tokens.md`. Renaming one broke no test, and the
  only way to learn a name was to read the source. Every component that has its own variables now ships a
  `tokens.json` next to its code (name, `kind`, default, purpose); the generator turns those into a new
  "Покомпонентные точки кастомизации" section of `docs/tokens.md` and into `grComponentTokens` in
  `@feugene/granularity/tokens`. `kind` says what happens when the token is left alone: `theme` / `css` / `inline`
  are assigned by the component itself, `hook` is never assigned and falls back to the default written in `var()`. No
  CSS is generated from the registry — that would break exactly those fallbacks. Gate:
  `src/__tests__/componentTokens.test.ts`, which fails both on an unregistered variable and on a registry entry whose
  variable is gone.
- **Invalid is its own theme role: `--gr-invalid-brd`, `--gr-invalid-ring`, `--gr-invalid-text`.** A failed validation
  reused the decorative `danger` tone, so a theme could not paint an error differently from a `state="danger"`
  highlight, and a developer using that highlight was visually reporting a validation verdict. The roles default to
  references to the danger tone — same look out of the box, separate knob when a theme needs one. Applied across
  `GrInput`, `GrSelect`, `GrTextarea`, `GrTreeSelect`, `GrAutocomplete`, `GrInputTag`, `GrNumberInput` and the error
  text and required mark of `GrFormField`. Gate: a parametrized block in `src/__tests__/formControlContract.test.ts`.
- **A type scale for components: `--gr-control-text-*`.** Font sizes lived as 105 literals (`text-[13px]`,
  `text-[11px]`) across 26 components, because the 13px and 11px steps do not exist in the content scale and should not.
  The new scale (`3xs` 10px … `lg` 16px) is deliberately denser than the four size steps — each component picks its
  four — and is themed independently of `--gr-text-*`. Values are unchanged, so nothing moved on screen.
- **`--gr-radius-xs` (3px) and `--gr-radius-chip` (6px).** The former also fixes a dangling reference: `GrSelect`
  already read `--gr-radius-xs`, which never existed, so its clear button rendered with no rounding at all. The latter
  covers small interactive chrome inside a control — chips, `×` buttons, the link focus ring, the slider tooltip.

- **`GrTable` exposes `scrollToRow(index, options?)`** — scrolls the container to a content row by its markup index and
  returns `false` when the row is not rendered (loading/empty state or index out of range). Rows are the consumer's own
  markup with no keys, so the addressing is positional; service skeleton/empty rows are not addressable, and a nested
  table inside a cell does not shift the indices. Parity with `GrDataTable.scrollToRow`, which addresses rows by key.
- **One opening contract for panel overlays: `v-model:open`.** The package had three conventions at once: modal surfaces
  used `v-model`, `GrPopover`/`GrTooltip` used `v-model:open`, `GrSelect`/`GrTreeSelect` only *notified* via
  `visibleChange`, and `GrAutocomplete`/`GrDropdown` emitted nothing at all — a combobox could not be opened from the
  outside, and identical panels were listened to differently. Now `GrSelect`, `GrTreeSelect`, `GrAutocomplete`,
  `GrDropdown` and `GrDropdownMenu` follow the `GrPopover` pattern: an optional `open` prop (absent — uncontrolled, as
  before), `update:open` on every change, and in controlled mode the parent owns the state. `visibleChange` on
  Select/TreeSelect still fires but is deprecated and will be removed after 1.0.
- **Native-form `name` on every value-bearing control.** Half the controls already submitted through hidden inputs
  (checkbox, radio, segmented, switch); `GrSelect`, `GrAutocomplete`, `GrTreeSelect`, `GrInputTag`, `GrRating` and
  `GrSlider` did not participate in `FormData` at all. Each now takes `name`: the native select gets it directly,
  everything else renders hidden inputs — one per selected value (the standard repeated-key serialization), a `range`
  slider submits two values under one name, an empty selection submits nothing.
- **`GrTextarea` gains `clearable`** — the same anatomy as `GrInput`: a `×` button on a non-empty value, hidden under
  `disabled`/`readonly`, the `clear` event, `clearLabel` for AT and a `GrConfigProvider` default. The bare textarea
  stays the root element when the option is off — the attribute-fallthrough contract is untouched.
- **Every public composable is a subpath again.** `useAnnouncer` and `useVirtualList` lived only in the root barrel, and
  `useGrFormControl` — the form-control contract the repository rules point third-party controls to — was not exported
  anywhere at all. All three got `package.json#exports` subpaths, vite entries and barrel exports, and a new gate
  (`src/__tests__/composablesGranularity.test.ts`) keeps every file in `src/composables/*` present in all three
  registries from now on.

- **Overlays answer to `open()`, `close()` and `toggle()`.** `GrModal`, `GrDialog`, `GrDropdown` and
  `GrCommandPalette` exposed nothing at all and could only be opened through `v-model`, while `GrPopover` had the three
  methods all along — one layer of the library behaving two different ways, which a consumer only discovered by running
  into it. The controlled ones (modal, dialog, palette) emit `update:modelValue`: the state stays in the parent's
  `v-model`, because a second copy inside the component would drift from it. `GrDropdown` has no model and changes its
  own state, and its `disabled` is not bypassed — an imperative call must not open what a click and the keyboard cannot.
  The set is held by a gate (`src/__tests__/overlayImperativeApi.test.ts`).
- **Every component exports the types of its props, events and instance.** `GrXProps` was missing from twelve SFCs —
  `GrButton` and `GrInput` among them — so a wrapper written as `defineProps<GrInputProps & { … }>` was impossible
  around the most-used components of the package. `GrXEmits` existed nowhere at all, and an instance type on exactly one
  component. All three are now exported next to the component, and their presence is held by
  `src/__tests__/publicTypes.test.ts`.

  `GrXInstance` is derived from the component rather than written by hand, so it cannot drift from `defineExpose`. It is
  also the only way to type a `ref` to a generic component — `InstanceType<typeof GrSelect>` does not work there,
  because such a component compiles to a function rather than a class. `GrTreeInstance` stays hand-written: it is
  parameterised (`GrTreeInstance<T>`), and a derived type would not be.
- **Form controls answer to one set of events.** `update:modelValue`, `change`, `focus`, `blur` — and `clear`
  wherever there is a `clearable` prop — are now declared by all sixteen of them. Before, the full set existed on two
  controls and `focus`/`blur` on three, so a wrapper written over `GrInput` did not work over `GrCheckbox`. The methods
  `focus()`/`blur()` had been unified long ago; this is the other half of the same contract, and the composition is held
  by `src/__tests__/formControlContract.test.ts`.

  For a group — a radio group, segments, a set of checkboxes, a range slider, tag input, a file drop zone — `focus`
  and `blur` fire only when focus crosses the control's boundary. An arrow key moving focus from one item to the next
  emits nothing; otherwise a wrapper would receive `blur` + `focus` on every keystroke. For the comboboxes the
  teleported panel counts as part of the control, so moving into its filter field is not a `blur`.
- **`GrTable` exposes `scrollTo()`.** The same signature `GrDataTable` has had; the table's own scroll container was
  unreachable from the outside. `scrollToRow` is deliberately absent — rows come from a slot and the table knows no row
  keys.
- **New `granularityThemePlugin` gives each application its own theme state.** `useTheme()` kept its state at module
  level, which on a server is one state shared by every request. The plugin provides it through `app.provide`, the way
  `granularityToastPlugin` already does; `GRANULARITY_THEME_STATE` is exported for anyone building on top. A plain SPA
  needs nothing — the module singleton is still the fallback.
- **`granularityThemePlugin` and `useTheme` accept a `target` root.** The plugin isolated the *state* of each
  application, but `data-theme` was still always written to `<html>` — two applications with independent themes
  overwrote one attribute and the last writer won, so the promised independence did not actually exist. `target` is a
  getter (`() => HTMLElement | null`, the root is not mounted yet at `app.use(...)` time) naming the element that
  receives `data-theme`; the theme selector is attribute-based, so it works from any container. Cross-tab sync and the
  `prefers-color-scheme` listener follow the same root. Default is unchanged: `<html>`.
- **`useVirtualList` gains `invalidate(from?)` and a `source` option.** Measurements are keyed by index, so sorting,
  filtering or replacing the data array would leave them describing other rows' heights — and there was no way to reset
  them at all. `source` names the data identity (usually the array itself): a new identity drops all measurements, while
  mutating the same reactive array in place — the infinite-scroll append — keeps the still-valid prefix. All six
  virtualized components pass their `source` themselves; `invalidate()` stays for heights that change without the array
  being replaced (density switch, column resize). Docs: `docs/virtual-list.md`.
- **New `useVirtualList` — one virtualization primitive for the whole package.** Keeps only a window around the viewport
  in the DOM: the composable computes the geometry and returns what to render plus how much is cut above and below,
  while the consumer builds the markup — it renders nothing and knows neither the roles nor the keyboard of your list.
  Row heights start from an estimate and are refined by measurement, with scroll compensated so a row measured above the
  viewport does not jerk the content under the cursor. Browser scroll anchoring is switched off (
  `overflow-anchor: none`): it holds a visible node in place by adjusting `scrollTop` when the height above it changes,
  and the window changes exactly that on every frame — left on, the two fight each other and the list drifts further the
  coarser the estimate. Docs: `docs/virtual-list.md`.
- **`virtual` on `GrTree`, `GrAutocomplete`, `GrSelect`, `GrCommandPalette`, `GrDataTable` and `GrList`.** Off by
  default — on a list of a hundred rows there is nothing to win, and the markup changes. Where the set in the DOM
  becomes incomplete, its size is announced explicitly (`aria-setsize`/`aria-posinset`, and `aria-rowcount`/
  `aria-rowindex` in the table): a screen reader derives it from the DOM, and the DOM now holds only the window. In
  `GrDataTable` the spacers are service `<tr>` rows with `aria-hidden` and a full-width cell, because `<tbody>` ignores
  `padding`; the layout is fixed (`GrTable` gained `rowCount` and `fixedLayout`, `GrDataColumn` gained `width`) so the
  column widths stop being computed from the rendered window.
- **`GrList`: data mode.** `items` + the `#item` scoped slot render the set without a hand-written `v-for`;
  `itemKey` sets the key, `maxHeight` turns the container into a scroller reachable from the keyboard. `virtual`
  requires both. The item is drawn by the consumer's slot, so the ARIA set arrives as the `aria` slot prop and is passed
  on with `v-bind` — a forgotten bind is caught by a dev warning after mount instead of silently making a list of five
  thousand announce «1 of 12». Instance API: `scrollToIndex(index, align?)`.
- **New `useAnnouncer` — live regions for imperative announcements.** A single host with a polite and an assertive
  region, shared by the whole package; the message is cleared before being written so a repeated string is announced
  again. Docs: `docs/announcer.md`.
- **`GrFormSection`: heading level and header slots.** `headingLevel` (`h2`…`h6`, default `h3`, readable from
  `GrConfigProvider`) makes the section title a real heading — that is how a long form is navigated by anyone using a
  screen reader. New slots: `#title` and `#description` build those parts from markup instead of a string, `#actions`
  puts controls («Add», «Reset») into the right side of the header, which now wraps under the title on a narrow screen.
  Without a title, a description and actions the header is not rendered at all.
- **`GrButtonGroup`: shared styling, orientation and a spaced mode.** `size`, `variant` and `tone` set on the group
  reach its buttons through context, so the props stop being repeated on every one of them; the resolution order is
  button prop → group → `GrConfigProvider` → default, because the group sits closer to the button than a global
  provider. `orientation="vertical"` stacks the buttons and moves the rounding to the top and bottom edges;
  `:attached="false"` keeps the row but drops the gluing, leaving every button with its own radii and borders. The group
  context is public — `useGrButtonGroup()` — for controls built on top of it.
- **`GrTree`: checkboxes and multiple selection.** `show-checkbox` turns on tri-state boxes,
  `v-model:checked-keys` carries the set, `check-strictly` unlinks parents from children. A checked parent checks its
  whole subtree, a partially checked one reports `aria-checked="mixed"`, and the incoming `checked-keys` may list only
  leaves — parents are derived. The state is announced on the node itself; the visible box is decorative, because an
  interactive checkbox inside `role="treeitem"` would make the widget disappear for a screen reader. `Space` toggles the
  mark when boxes are on (`Enter` still selects). Instance API: `getCheckedKeys({ leafOnly })`, `setCheckedKeys()`,
  `getHalfCheckedKeys()`, `setChecked()`; events `update:checkedKeys` and `check`.
- **`GrTree`: lazy branches.** `lazy` + `load(node, resolve)` fetch children when a branch is first expanded — the row
  shows a spinner and is marked `aria-busy` while the request is in flight, and re-expanding never asks again. A leaf is
  declared by the `isLeaf` field of the data (its name is configurable through the `props` map); until proven a leaf, a
  node stays expandable. Loaded children live in the component's own state instead of being written into `data`: the
  prop is not required to be reactive, and the tree must show what it fetched either way.
- **New `GrBreadcrumbs` — the path to the current page.** Built on `GrLink`, so any router plugs in the usual way:
  `as` takes the link component and each item's `to` reaches it as a prop. The last item is the current page: it is not
  a link and is announced with `aria-current="page"` (`linkCurrent` keeps it clickable without losing the announcement).
  A long path collapses in the middle — `maxItems`, `itemsBeforeCollapse`, `itemsAfterCollapse` — and the «…» button
  expands it **in place**, then moves focus onto the first revealed item, because the button disappears together with
  the collapse. Separators live in their own list items and are `aria-hidden`: the list already conveys the structure,
  and a screen reader would otherwise read every slash out loud. `separator` and `size` are read from
  `GrConfigProvider`; slots `#item`, `#separator` and `#ellipsis` replace the parts. The layout is also exported as a
  pure `resolveBreadcrumbsLayout()` for anyone who wants to compute it outside the component.
- **`GrFileUpload`: optional `v-model` for the file set.** `modelValue` is not required — without it the component keeps
  the set itself, exactly as before; passed, the set follows the prop, so it can be replaced or cleared from the outside
  once a form is submitted. `update:modelValue` fires when the set itself changes (a new selection, a removal);
  `change` keeps its own meaning — «the upload finished» — because those are different moments.
- **`GrEmptyState`: `variant`, `size`, `headingLevel` and content slots.** `variant="ghost"` drops the border, the
  background and the radius — inside an existing card (`GrDataTable #empty`, `GrList #empty`, any layout of your own)
  the default `outlined` drew a second border around the same surface; the vocabulary is `GrCard`'s, where `ghost`
  already means exactly that. `size` (`xs`…`lg`, readable from `GrConfigProvider`) scales the padding, the icon box, the
  icon, the heading and the vertical rhythm, so a table cell or a dropdown panel no longer gets a full-page placeholder.
  New slots `#title` and `#description` take markup where only strings used to fit, and `title` becomes optional:
  without it and without the slot the heading falls back to the locale (`gr.emptyState.title`, all three locales), so
  `<GrEmptyState />` is no longer an empty card.
- **`GrBottomNav`: icons, badges, disabled destinations, links, and a configurable breakpoint.** An item grows to
  `{ label, value, icon?, badge?, badgeLabel?, disabled?, href?, to?, ariaLabel? }`: without icons a bottom bar does not
  do its job, and the showcase used to work around that by hand. A numeric badge is announced in words — a bare «12»
  means nothing to a screen reader. A `disabled` destination stays visible but leaves the `Tab` order and is dimmed with
  `--gr-disabled-fg`. `href`, or the component-level `as` together with an item's `to`, turns items into real links, so
  a right click and «open in new tab» work as anywhere else; `GrLink` is deliberately not imported, because the
  dependency would ship its CSS for the sake of one tag. New props `hideAbove` (`sm` by default, plus `md`, `lg`,
  `none`) and `position` (`fixed` by default, `static`) replace the hardcoded `sm:hidden`: a kiosk or PWA keeps the bar
  on screen, and it can now be embedded in a layout instead of the viewport. New i18n keys `gr.bottomNav.label` and
  `gr.bottomNav.badge` in all three locales.
- **New `--gr-z-bottom-nav` token (850).** The lowest step of the layering scale: a bar pinned to the bottom edge must
  go under an open dropdown, tooltip or modal.
- **`GrBadgeWrap`: `max`, `showZero`, `tone` and `placement`.** `max` collapses a large count into «99+» while the
  screen reader still hears the real number — «99 plus» tells nobody anything. Zero is now hidden by default (an empty
  circle on an icon reads as a bug) and `showZero` brings it back where zero is a meaningful state. `tone` picks the
  badge colour from the package scale instead of the hardcoded red, and `placement` moves the badge to any of the four
  corners; the offset is a customisation point — `--gr-badge-wrap-offset-x/y`. The pure `formatBadgeValue(value, max)`
  is exported. New i18n key `gr.badgeWrap.count` in all three locales.
- **`GrAvatar`: `name`, `status`, `fallbackSrc` and a new `GrAvatarGroup`.** `name` produces the initials and the
  accessible name — a circle of initials used to be nameless for a screen reader. `status` draws a dot and announces it
  in words, because colour alone carries no meaning. `GrAvatarGroup` stacks avatars with a «+N» counter and names itself
  along with the number of hidden people, instead of leaving a row of anonymous pictures.
- **`GrNavbar`: `sticky`, `#left`/`#center` zones and a configurable height.** The bar can now stick to the top of the
  page on the new `--gr-z-navbar` layer (900) — below anchored panels, so an open dropdown or modal covers the bar
  instead of disappearing under it. `#center` adds a middle zone for search or breadcrumbs; when it is used the side
  zones split the remainder evenly, because a lone `flex-1` centre is centred within the remainder and drifts after the
  wider side. Height comes from `--gr-navbar-height` (default `56px`) instead of a hardcoded class.
- **`GrNumberInput`: `clearable`, hold-to-repeat, `focus`/`blur`.** Holding a ± button now steps repeatedly (400 ms
  before the first repeat, then every 60 ms) and stops at the boundary, on release and when the pointer leaves;
  `clearable` adds a clear button that returns focus to the field and emits `clear`; `focus` and `blur` complete the
  event contract shared with `GrInput`.
- **`GrNumberInput` reads its locale from the i18n adapter.** `Intl.NumberFormat` was only ever given the `locale`
  prop, so a multilingual app had to pass it to every field.
- **`GrRating`: labels per step and a compact read-only view.** `texts` gives each step a word, which goes both into the
  visible text and into `aria-valuetext` — «4 of 5, good» instead of a bare number, which is the whole point of a
  rating. `compact` (with `readonly`) draws only the filled symbols, for tables and lists where five stars per row eat
  the width; a half counts as a symbol.
- **`GrSelect`: `state` and object values.** `state` (`default | success | warning | danger`) tints the border like the
  rest of the form row, and `invalid` overrides it. Option values may now be objects: pass `valueKey` with the name of
  the identifying field, and the component compares by that key instead of by reference — a model that arrives from
  outside as a separate copy with the same `id` still matches its option. The object itself is emitted, not the DOM
  string.
- **`--gr-primary-text` joins the theme tokens.** The primary tone had no text-safe pair, so components painted text
  with the saturated `--gr-primary`, which is not meant for it.
- **`GrSegmented`: a segment can be busy.** `loading` on an option puts a spinner where its icon goes and marks the
  segment `aria-busy`; the segment stops accepting selection and arrow keys step over it. It deliberately does **not**
  get `aria-disabled` or the native `disabled`: a busy segment is available, it is just working — a distinction a screen
  reader can hear. The default slot now also receives `loading`.
- **`GrSlider`: vertical orientation and `lazy`.** `orientation="vertical"` puts the minimum at the bottom, moves the
  tooltip aside (above the thumb it would sit on the track) and the mark labels to the right; the track's length is a
  new customisation point, `--gr-slider-length`. `lazy` holds `update:modelValue` until the gesture ends — one event on
  release instead of one per mouse move — while the keyboard still commits immediately, because a key press is discrete
  and there is nothing to hold back.
- **New `GrSidebarGroup` — sections with a heading.** Fifteen navigation items in a row are unreadable; a group is
  announced as `role="group"` and tied to its heading through `aria-labelledby`. In a collapsed sidebar the heading has
  nowhere to go: it is removed (along with the `aria-labelledby` that would otherwise point at nothing) and the sections
  are separated by a rule instead, so the icons of neighbouring groups do not merge into one column.
- **`GrSidebar`: `landmark`, `ariaLabel` and `position`.** The root renders as `<aside>` (`complementary`, the default)
  or `<nav>` (`navigation`) — no nested `<nav>` inside `<aside>`, because two landmarks per panel clutter the outline
  and a rail of filters is not navigation at all. `ariaLabel` names the landmark, which two sidebars on one page need to
  be distinguishable. `position="right"` moves the border to the other side and mirrors the toggle chevron: on a
  right-hand panel «collapse» points right.
- **`GrTreeSelect`: checkboxes for multiple selection.** `show-checkbox` (together with `multiple`) swaps the
  component's own tick for `GrTree`'s checkboxes: checking a parent cascades over its subtree and a partially checked
  parent is announced as `aria-checked="mixed"`. The cascade is computed by the tree itself, so a click on the row, a
  click on the box and `Space` all travel the same path and cannot double-toggle. `check-strictly` unlinks parents from
  children. All checked keys — parents included — end up in `modelValue`.
- **`toast.promise` and `toast.update`.** `promise(p, { loading, success, error })` runs a request's whole lifecycle in
  one toast — the loading toast is rewritten into the result instead of being closed in favour of a new one, so the
  stack does not jump. Messages may be strings, toast inputs, or functions of the resolved value / rejection reason. The
  promise is returned as-is and **the rejection is not swallowed**: a toast does not replace error handling. If the user
  dismissed the toast while the request was in flight, the result does not resurrect it. The underlying
  `update(id, patch)` is public too and restarts the auto-dismiss timer when `timeoutMs` is part of the patch.
- **`GrTextarea` emits `change`, `focus` and `blur`.** It used to emit only `update:modelValue`, so a wrapper around the
  control could not be written the same way as one around `GrInput`, which has had the full set for a while. The native
  events are re-emitted explicitly: a declared emit leaves `$attrs`, and without that `@change` on the component would
  silently stop working.
- **`GrTabs`: `variant`, tab icons and a `#tab` slot.** `variant="line"` renders the classic underlined row next to the
  existing `pills` (the name is shared with `GrSegmented`, which has the same role); it is also readable from
  `GrConfigProvider`. A tab may carry an `icon` class, and the `#tab` slot replaces the tab's content entirely,
  receiving `{ tab, active, disabled }`.
- **`GrSwitch` can take part in a native form.** `name`, `value` (default `'on'`) and `form` render a hidden field with
  checkbox semantics: a switch that is on submits its value, a switch that is off submits nothing, so the server reads
  «off» from the missing key. The field is a sibling of the button rather than a child — interactive content inside
  `<button>` is invalid — which makes the component's root a fragment; attributes a consumer passes still land on the
  button.
- **`GrSwitch`: `loading`, `labelPosition` and a `change` event.** `loading` puts a spinner in the thumb, marks the
  control `aria-busy` and blocks toggling while a request is in flight; `loadingText` (default `gr.switch.loading`)
  says what is being saved, because `aria-busy` alone is not announced. `labelPosition="start"` moves the label to the
  left of the track by reversing the row, leaving the DOM order — and therefore the reading order — intact. `change`
  is emitted alongside `update:modelValue`.
- **`--gr-disabled-bg`, `--gr-disabled-fg` and `--gr-disabled-brd` join the theme tokens.** Disabled states had no token
  to sit on, which is why eleven components dimmed themselves with `opacity` against the package's own rule.
- **`GrStatistic`: `locale` and number formatting through `Intl`.** Separators now come from the locale — taken from the
  i18n adapter automatically, overridable per card with `locale`, and still overridable outright with
  `groupSeparator`/`decimalSeparator`, which replace only their own part and leave the rest of the locale's rules
  (grouping style, minus sign) intact. Without an adapter and without the prop, formatting is byte-for-byte what it was:
  a narrow space and a dot.
- **`--gr-text-2xs` (10px) joins the type scale.** The smallest captions had no token to sit on, so components spelled
  them out in px.
- **`GrPagination`: `showTotal`, `ariaLabel` and `disabled`.** `showTotal` renders the visible range («41–60 of 137»)
  next to the navigation, and the `#total` slot replaces it with markup, receiving `from`, `to` and `total`.
  `ariaLabel` names the navigation landmark — without it two paginations around a table produce two identically named
  landmarks in a screen reader's outline. `disabled` shuts the whole widget down at once: page numbers, the nav buttons,
  the page-size select and the jumper.
- **`GrList`: the surface is now selectable.** `variant` reaches the `GrCard` the list draws underneath, so
  `variant="ghost"` drops the border and the shadow for a list placed inside an existing card instead of stacking a card
  in a card. Without the prop the card keeps resolving its variant from `GrConfigProvider`.
- **i18n:** `gr.breadcrumbs.label` and `gr.breadcrumbs.expand` in all three locales.

### Changed — BREAKING

- **`--gr-radius-chip` is renamed to `--gr-radius-control`.** The 6px step is the corner radius of every field shell in
  the package — `GrInput`, `GrSelect`, `GrTextarea`, `GrTreeSelect`, `GrNumberInput`, `GrAutocomplete`, `GrInputTag`,
  plus `GrTooltip` and `GrKbd` — and a name saying "chip" described one of its smallest consumers. Chips and `×`
  buttons keep using it. Migration is a rename: `var(--gr-radius-chip)` → `var(--gr-radius-control)`, same 6px.

- **Slots renamed to fit the vocabulary: `errors` → `error`, `foot` → `footer`, `head` → `header`.** One role was going
  by two names — `errors` in `GrFormFile` against `error` in `GrFormField` and the dialogs, `foot`/`head` in
  `GrTable` and `GrDataTable` against `footer`/`header` in seven other components — so a consumer moving between them
  rewrote the template for no reason other than the spelling. Migration is mechanical: `<template #errors>` →
  `#error`, `<template #foot>` → `#footer`, `<template #head>` → `#header`. Scoped props are unchanged.

- **`setTheme`/`toggleTheme` throw during SSR unless `granularityThemePlugin` is installed.** Reading the theme on the
  server keeps working without it — `theme` and `isDark` return `light`, which is what a template that merely branches
  on the theme needs. Only the mutation leaks between requests, so only the mutation is refused, and the error says what
  to install. Client-side behaviour is unchanged.
- **Seven internal helpers are no longer exported from the package root.** `grButtonClassTokens`,
  `grModalClassTokens`, `getGrModalPanelClass`, `resolveGrAlertColors`, `applyGrAlertOverrides`, `grAlertCssVars` and
  `grAlertIconKey` were class maps and colour resolvers that the components use on themselves; none of them had a single
  call site outside its own component, in this repository or in the docs. The types that only described their
  signatures — `GrAlertColors`, `GrAlertColorOverrides`, `GrAlertIconKey` — go with them. What stays public is what a
  consumer actually composes with: `grButtonClass`, `grXSafelist` (required by the UnoCSS preset contract),
  `GR_ALERT_VARIANTS` and every prop type. `resolveBreadcrumbsLayout` also stays — computing the layout outside the
  component is an advertised contract.
- **`maxSizeMbValidator` and `maxFileSizeBytesValidator` are replaced by a single `maxFileSize({ bytes?, mb? })`.** The
  two were one check with two different `code` values (`maxSize` and `maxFileSize`), so an error handler on the
  consumer's side had to branch on which unit the limit happened to be written in. The new validator always reports
  `maxFileSize`; the limit is given in whichever unit reads better at the call site, and when both are given the smaller
  one wins — silently ignoring one of two declared limits is worse than applying the stricter. The `maxSize`
  code and its `gr.fileValidation.maxSize` key are gone from all three locales.

### Changed

- **A disabled `GrButton` now dims the way everything else in the package dims.** Its `--gr-button-disabled-*` trio
  pointed at `--gr-muted`/`--gr-muted-fg`/`--gr-brd` — the roles of ordinary secondary text — while ten components
  (`GrTabs`, `GrSegmented`, `GrSlider`, `GrSidebar`, `GrBottomNav`, `GrRating`, `GrSwitch`, `GrNumberInput`,
  `GrCommandPalette`) use the dedicated `--gr-disabled-*` roles. A disabled button standing next to a disabled tab read
  as the active one. The trio survives as a customization point, but it is now a plain alias, declared once in
  `:root` rather than repeated per theme. **This is a visible change**: the label of a disabled button goes from a
  contrast of 5.65 to 2.34 in the light theme (5.04 → 2.61 in dark). That was a deliberate trade — WCAG 1.4.3 exempts
  disabled controls, and looking unavailable is what the state is for — and it retires the one test in the package that
  required a disabled control to stay at AA. In its place is a gate asserting the button's tokens resolve to the same
  colours as the shared roles, because that is the thing that can drift silently: the classes in the markup do not
  change, only what `var()` expands to. Fixed along the way: the token registry described these three as
  `var(--gr-disabled-solid)`, a role that never existed.

- **The `info` tone is blue now, not a second indigo.** `--gr-info` (`#5850ec`) sat ΔE 4.3 away from `--gr-primary`
  (`#4f46e5`) — the just-noticeable threshold is about 2.3 — and the two tones' text roles were the same value down to
  the digit, so a link with `tone="info"` and one with `tone="primary"` rendered identically. Nothing caught it:
  contrast passed for both, and no test ever compared two tones against each other. The tone now occupies its own part
  of the palette (blue-600 in light, blue-400 in dark, with `-light`, `-text` and the solid family moved along with it),
  which puts it ΔE 21/29 from `primary` and 48/22 from `azure`. The intent was always this — the dark theme already
  refused to move `primary` toward indigo-400 precisely because "solid badges of primary and info would become
  indistinguishable"; only the tone itself had never been moved. Every contrast guarantee is unchanged and verified:
  5.17 for white on the light fill, 8.34 for `-text` on the page, 7.02 for dark text on the dark fill, 6.41 for the
  solid button. New gate: `src/__tests__/tonePalette.test.ts` measures perceptual distance between every pair of tones
  in every role and separately forbids two tones sharing a value outright. Anything painted `info` — alerts, badges,
  buttons, toasts, progress bars, the statistic trend — changes colour.

- **`GrLink` tones `primary` and `neutral` now take their colour from `-text`, like the other six.** Seven of the eight
  tones already read `var(--gr-{tone}-text)` — the role meant for text on the page background — while `primary`
  used the saturated `var(--gr-primary)` and `neutral` reached for the same on hover. Contrast happened to pass, which
  is exactly why it survived: the exception was invisible to every test. Links of tone `primary` are now noticeably
  darker in the light theme (6.01 → 9.49) and paler in the dark one (6.38 → 11.97), in line with the other tones
  (7.2–9.9). If you relied on the old hue, `--gr-primary-text` is the role to repaint. The rule is now held by
  `GrLink.contrast.test.ts`, which checks every tone against `--gr-bg` and `--gr-card` in both themes and refuses a tone
  that reads its colour from a fill role. Icons are deliberately out of its reach: `text-[var(--gr-primary)]` on an
  `aria-hidden` checkmark is a graphical object at a 3:1 threshold, not text.

- **Font sizes and radii now come from tokens everywhere, including the ones that looked fine.** Around a hundred places
  still styled themselves with UnoCSS scale utilities — `text-sm`, `rounded-md`, `leading-6`. Their values matched the
  tokens, which is exactly what made them dangerous: nothing looked wrong, yet overriding `--gr-text-sm`
  in a theme moved nothing, because `text-sm` had baked `.875rem` into the stylesheet. Every one of them is now
  `text-[length:var(--gr-*)]` / `rounded-[var(--gr-radius-*)]`, so the type and shape scales are finally themeable end
  to end. Two details were easy to get wrong and are worth knowing if you have the same utilities in your own code.
  First, `text-*` in UnoCSS sets font-size *and* line-height, so each converted site also carries a paired
  `leading-[var(--gr-leading-*)]` — a new set of absolute steps (`xs`, `sm`, `base`, `xl`, `3xl`) alongside the existing
  ratio tokens, which stay for prose. Second, the radius steps are offset by one name: `rounded-md` is 6px, not 8px, so
  the shells of every field map to `--gr-radius-control`, and `rounded-lg` (8px) is what `--gr-radius-md`
  means. Nothing moved on screen — the visual baselines were not re-shot. The gate `styleTokens.test.ts` now refuses
  scale utilities the same way it already refused pixel literals, and reads all of `src` rather than components only.
  One consequence worth knowing if you restyle a component from outside: a class like `label-class="text-xs"` used to
  set the font size and the line height in one go, and now sets only the size — the component's own
  `leading-[var(--gr-leading-*)]` keeps the interval. Override the pair, not half of it.

- **One modal shell instead of three hand-wired copies.** `GrModal`, `GrDrawer` and `GrImageViewer` each assembled
  modality by hand out of six primitives — overlay stack, focus trap, `inert`, scroll lock, portal and DOM presence —
  and the assembly was repeated verbatim, comments about the pitfalls included. The danger was never the line count:
  the wiring carries invariants that fail silently when one is missed. `restoreFocus: false` on the trap (focus
  restoration belongs to the layer stack, whose rule is stricter), `containers: rootsAbove` (a select panel opened
  *inside* a window is teleported to `body` and the trap would otherwise steal its focus), trap and `inert` active only
  while the layer is topmost. All of it now lives in `useModalOverlay`, so a modal component is assembled in one call
  and cannot be assembled partially. Behaviour is unchanged — the three components' suites pass untouched — and markup
  deliberately stayed with the components: their roots differ in substance (scroll wrappers, pass-through clicks, viewer
  chrome), and a shared component may not own a single class literal under the preset's safelist contract.
- **One option matcher instead of three copies.** The same case-insensitive substring predicate was written three
  times — `GrSelect`, `GrAutocomplete` and `GrCommandPalette` — and each copy normalized the query differently: one
  lowercased it at the call site, another inside the matcher, the third trimmed and lowercased its own way. That kind of
  drift is invisible until a user notices that search is case-sensitive in one component and not in another.
  `components/shared/optionFilter.ts` now holds one normalization contract, the default matcher, flat filtering and the
  values-to-chips lookup (which also stops being quadratic in `GrAutocomplete`). Public API is unchanged: the
  `filter` prop still receives the raw trimmed query, and the entire existing test suite of all three components passes
  untouched.
- **Animations run on `--gr-duration-*` / `--gr-ease-*`.** Both token groups were generated and used exactly zero times:
  the package's motion looked configurable but was not. All 60 `duration-N` utilities and 30 `ease-in`/
  `ease-out` ones now read the tokens. Note the curve actually changes: `presetMini`'s `ease-out` is
  `cubic-bezier(0, 0, 0.2, 1)`, the package token is `cubic-bezier(0.16, 1, 0.3, 1)` — motion is now defined by the
  design system rather than by the preset. Durations that were off the scale (100/120/130/180ms) snap to `fast`/`base`.
  Gate: `src/__tests__/styleTokens.test.ts`.
- **`GrLoading` scrim reacts to the theme.** It was a literal `bg-black/25`; it is now `--gr-overlay-bg`, the same role
  `GrModal` and `GrDrawer` use.
- **`GrNumberInput` reads `invalid` from the field context.** The border only reacted to the component's own prop, so a
  field marked invalid by `GrForm`/`GrFormField` stayed visually valid — the other six controls already did this right.

- **One combobox engine instead of four copies.** The active-option machinery — `activeIndex`, cyclic clamping,
  `aria-activedescendant`, scroll-to-active, init-on-open — existed as four hand-written copies (`GrSelect`,
  `GrAutocomplete`, `GrCommandPalette`, partially `GrDropdown`) and had already drifted apart badly enough to produce
  the Select Enter bug. Two internal composables now hold it: `useControlledOpen` (the `v-model:open` contract, also
  adopted by `GrPopover`/`GrTreeSelect`/`GrDropdown`) and `useComboboxNavigation` (active item + mechanical keys;
  activation — Enter, typeahead — deliberately stays per-component). No behavioural or API change: the entire existing
  test suite passes untouched.
- **Comments no longer narrate their own edit history.** Twenty-six places across the package explained an invariant by
  telling what the code used to do («раньше каждый оверлей хранил…»); they now state the invariant in the present tense,
  and the story stays where it belongs — in git. Along the way one comment in `grAlertStyles.ts` turned out to be
  truncated mid-sentence and to describe a `light` variant that has not existed for a while.
- **Emit declarations name their parameter `e` everywhere.** Three components used `(event: 'x')` against `(e: 'x')`
  in the rest; a reader of a neighbouring component had to decide each time whether the difference meant anything.
  `src/__tests__/emitNaming.test.ts` now holds the name — a formatting linter does not catch this, because it is not
  formatting.
- **`ResponseErrorTone` is an alias of `GrTone`.** It used to spell the same eight tones out as a string union, so a
  tone added to the scale would not have reached the banner and the divergence would have surfaced at runtime. The set
  of values is unchanged, so nothing to migrate.
- **`defineOptions({ name })` is gone from `GrFormFile` and `GrTree`.** The SFC compiler infers the name from the
  filename and it survives minification; nothing in the package depended on the runtime name. Two declarations out of
  eighty-two were noise either way.
- **`GrListItem` renders one structure for every row.** The content block (prefix, title, description, default slot)
  used to be written twice — once inside the interactive branch, once inside the plain one — and the copies could drift
  apart in silence. Now the wrapper always carries `role="listitem"` and the row is always a nested element:
  `<a>`, `<button>` or the tag from `as` when the row is clickable, a plain `<div>` when it is not; the two are told
  apart by `data-gr-list-item-action`, which only a clickable row has. A plain row therefore gains one nested element —
  worth knowing if you select `[data-gr-list-item] > *` from the outside. Rendering, spacing and dividers are unchanged,
  down to the pixel.
- **The toast queue is now capped.** `maxVisible` only ever limited the *visible* toasts while the queue behind them
  grew without bound, so a burst of events (a reconnecting socket, a loop of errors) piled up notifications that then
  spilled onto the user once the stack drained. The queue keeps at most 20 toasts by default — configurable with
  `app.use(granularityToastPlugin, { maxToasts: 50 })` — dropping the oldest ones and clearing their timers.
- **`GrToaster`: the toast title and message moved from `13px` literals to `--gr-text-sm`.**
- **`GrSidebar`: the header, the collapsed-item letter and the badge moved from px literals to `--gr-text-*`.**
- **`GrSlider` accepts `xs` from `GrConfigProvider`.** The `xs` classes existed while the component still declared
  `supported: ['sm', 'md', 'lg']`, so a global `size="xs"` silently fell back to `md`.
- **`GrTreeSelect`: the panel's loading and empty rows moved from `13px` literals to `--gr-text-sm`.**
- **`GrTabs` scrolls an overflowing row instead of wrapping it.** A wrapped row pushed tabs under the panel and broke
  the alignment; the row now scrolls horizontally with the scrollbar hidden, and the active tab pulls itself into view —
  including when it was selected from outside. Vertical orientation is unaffected.
- **`GrTabs` declares its props as a named interface.** `GrTabsProps` was a type alias, so
  `defineProps<GrTabsProps & {…}>` in a consumer's wrapper did not work.
- **`GrTabs`: the size ladders moved from px literals to `--gr-text-*`.** Tabs run `xs/xs/sm/base`, the badge
  `2xs/2xs/2xs/xs`; the `lg` tab grows from 15px to 16px and the `sm` tab shrinks from 13px to 12px.
- **`GrSwitch` accepts `xs` from `GrConfigProvider`.** The `xs` classes existed, but the component still declared
  `supported: ['sm', 'md', 'lg']`, so a global `size="xs"` silently fell back to `md`.
- **`GrStatistic`: the four size ladders moved from px literals to `--gr-text-*`.** Captions and the trend line run
  `2xs/xs/xs/sm`, affixes `xs/xs/base/xl`, the value `base/xl/3xl/4xl` — the value at `md` grows from 28px to 30px, the
  only visual shift.
- **`GrPagination` no longer renders the page-size select by default.** It is now behind `showPageSize`, because a bare
  pagination is «just the page numbers» far more often than not; add `show-page-size` to keep the previous look.
- **`GrPagination` announces the page numbers as a list.** They moved into a `<ul role="list">` inside the navigation
  landmark, so a screen reader reports how many pages there are instead of reading a stream of buttons; the ellipses are
  excluded from it. Page changes are announced through one live region — the visible indicator carries it in
  `compact` mode, a visually hidden «Page N of M» does in the default one (`gr.pagination.status`).
- **`GrPagination`: the size scale moved from px literals to `--gr-text-*`.** The `sm` step was `13px`, a value the type
  scale does not have; it now shares `--gr-text-xs` with `xs` and stays distinguishable from `md` by box height and
  weight.
- **i18n:** `gr.pagination.total` and `gr.pagination.status` in all three locales.
- **`GrTree` renders one flat list instead of nested component instances.** Every node is a `treeitem` in a single
  `role="tree"` container, indentation is the row's `padding-left`, and the hierarchy is carried by `aria-level`,
  `aria-posinset` and `aria-setsize`. Before, each expanded branch created a full `GrTree` instance with its own
  computations and subscriptions — 2 000 visible nodes meant 2 000 components. Two visible consequences: the row
  highlight (hover, current node) now spans the full width at any depth instead of starting at the indent, and branch
  lines are drawn per row rather than by a bordered wrapper. The `indent` prop became real — it was declared but never
  used — and sets the indentation step in pixels (`--gr-tree-indent-step` in the theme).
- **`GrFormSection` is no longer a landmark by default.** A `<section>` with an accessible name is exposed as a
  `region`, so five sections of one form produced five landmarks and buried the useful ones. The name is now attached
  only when `landmark` is set; structure is carried by the heading. The description keeps its `aria-describedby` link in
  both modes.
- **`GrSwitch` dimmed its disabled state with `opacity`.** Transparency waters down text tokens that were tuned for AA
  contrast, so the label of a disabled switch was harder to read than it should be. It is now dimmed with the new
  `--gr-disabled-*` tokens, and they take precedence over custom track colours — a disabled switch no longer looks like
  a working one.
- **`GrFileUpload` announced `readonly` and then ignored it.** `aria-readonly` was set and the remove/retry buttons were
  hidden, but the file dialog still opened, drag&drop was still accepted and files were still uploaded: every input
  handler guarded on `disabled` alone. They now use the `locked` state of the form-control contract, so a read-only
  uploader shows its set and sends it with the form without letting anyone change it. `<input type="file">`
  has no `readonly` attribute in HTML, so the system dialog is suppressed by preventing the default action — the input
  stays in the `Tab` order and is still announced as read-only.
- **`GrFileUpload` ignored `disabled` coming from `GrFormField` or `GrForm`.** Five places in the template read the raw
  prop instead of the resolved state, so a field disabled through context dimmed only the native input: the zone kept
  its pointer cursor, hover and focus ring, and the remove/retry buttons stayed clickable while their handlers silently
  did nothing.
- **`GrEmptyState`'s title was not a heading.** It rendered as a `<div class="font-700">`, so the one element that
  explains why the screen is empty could not be reached by heading navigation. It is now a real heading (`h3` by
  default) with the browser's bottom margin reset, which keeps the previous vertical rhythm exactly.
- **`GrFileUpload` hardcoded its font sizes and radii.** Fourteen literals — `rounded-[8|10|12|14px]` and ten
  `text-[10|11|12|13px]` — ignored the scales. They now come from `--gr-text-*` and `--gr-radius-*`. Steps coincide in
  places, and deliberately so: a 1px difference in font size is not perceivable, and the size of the component is
  carried by padding, gaps and the icon, which keep all four steps.
- **`GrEmptyState` hardcoded its radius and font sizes.** `rounded-[12px]`, `text-[14px]` and `text-[13px]` ignored the
  scales; they now come from `--gr-radius-*` and `--gr-text-*`. The description moves from 13px to `--gr-text-sm`,
  because there is no 13px step and inventing one for a single component is worse than the round-off.
- **`GrBottomNav` could not say where the user was.** The active destination differed by colour alone (`--gr-primary`
  against `--gr-muted-fg`) with no `aria-current`, `aria-pressed` or `aria-selected`: a screen reader heard a row of
  identical buttons, and the distinction disappeared for anyone with monochrome vision (WCAG 1.4.1). The active item is
  now announced with `aria-current="page"` and carries three cues at once — a pill background, a heavier label and the
  accent colour, which moves to `--gr-primary-text` for AA contrast.
- **`GrBottomNav`'s landmark had no name and no layer.** Two `<nav>` elements on a page were announced identically, and
  the bar's `fixed bottom-0` sat outside the layering scale, so a sticky footer or tooltip covered it in DOM order. The
  landmark now always has a name (`ariaLabel`, or the locale), and the bar sits on `--gr-z-bottom-nav`.
- **`GrBottomNav` was invisible everywhere but a phone.** `fixed` combined with a hardcoded `sm:hidden` meant the
  component rendered nothing above 640px — including in the showcase, where all three demos showed only their
  description card. `hideAbove` and `position` make both decisions the application's.
- **`GrBadgeWrap`'s counter did not exist for a screen reader.** The number was marked `aria-hidden` with no text
  alternative next to it, so «Inbox» was announced and «3 unread» was silently dropped — on the one component whose
  entire job is to report unread items. The number stays decorative, but a visually hidden label now carries the count
  in words; `ariaLabel` overrides the wording and also gives the dot mode a voice, which it never had.
- **`GrBadgeWrap` hardcoded its font size and colour.** The counter used a literal `text-[11px]` and `--gr-danger`
  regardless of context; it now takes the new `--gr-text-2xs` step and the tone scale, with the text colour coming from
  the paired `--gr-<tone>-fg` token so the badge survives a theme switch.
- **`GrAvatar` showed the browser's broken-image icon.** The `<img>` had no `@error` handler and the fallback slot sat
  under `v-else` of `src`, so a dead CDN link — the usual failure for avatars — rendered a broken image and the slot
  never appeared. The component now falls through `fallbackSrc` to initials, resets that state when `src`
  changes, and holds the space with a skeleton while the image loads.
- **`GrAvatar`'s `shape` could not be set globally** — it went past `useGrComponentProp` and is now part of
  `componentDefaults.GrAvatar`.
- **`GrNavbar` required a `title` even when its `#title` slot was used.** Markup in the slot still had to be paired with
  a string prop, or Vue complained about a missing required prop — the showcase demo literally passed
  `title="Ignored by slot"` to work around it. The prop is optional now, and without a title (string or slot) the
  heading block is not rendered at all.
- **`GrNumberInput`'s ± buttons stole focus.** `stepBy` ended with `focus()` on the field, so a keyboard user who tabbed
  to «+» lost the button after the first Enter and could not press it again. The step no longer touches focus; the field
  is focused only when the step came from the field itself.
- **`GrNumberInput`'s ± buttons stayed active at the boundary.** At `max` the «+» button did nothing visible — `clamp`
  swallowed the result. Each button is now disabled on its own boundary.
- **`GrNumberInput` could drift out of sync with its model.** `onInput` writes into `el.value` directly to preserve the
  caret; if the parent did not apply `update:modelValue`, the DOM and the vnode disagreed and later renders never
  reconciled the field. The field is realigned with the model on the next tick.
- **`GrNumberInput` announced a raw number while showing a grouped one** — the formatted value now goes into
  `aria-valuetext`.
- **`GrNumberInput` dimmed its disabled state with `opacity`** and now uses the `--gr-disabled-*` tokens; its ± buttons
  are drawn with `GrIcon` instead of inline SVG.
- **`GrRating`'s preview stuck when the cursor moved onto its label.** `mouseleave` was bound to the outer container,
  which includes the text, so leaving the scale for the label never fired it. The handler now lives on the scale itself,
  and losing focus clears the preview too.
- **`GrRating` dimmed its disabled state with `opacity`** and now uses `--gr-disabled-fg`.
- **`GrRating` accepts `xs` from `GrConfigProvider`.** With this the mismatch is gone from the package: no component
  declares a truncated size scale while shipping the classes for it.
- **`GrSelect` showed an invalid field as a normal one.** `invalid` only ever reached `aria-invalid`: the border kept
  its neutral colour, so an error was audible to a screen reader and invisible to everyone else. Every other control of
  the form row has done this for a while.
- **`GrSelect`: the `primary` link variant used the saturated tone as text colour.** It now uses `--gr-primary-text`,
  hover and active included.
- **`GrSegmented` ignored `readonly` on click.** The prop was declared, exposed as `aria-readonly` and honoured by the
  keyboard, but the click path never checked it — so a read-only control changed its value under the mouse. Both paths
  now share one guard.
- **`GrSegmented` dimmed disabled state with `opacity`.** The control and its segments now use `--gr-disabled-fg`.
- **`GrSlider` announced range bounds in English only.** «min» / «max» were baked into the thumb's accessible name past
  the i18n layer, so a Russian user heard «Громкость (min)». They now come from `gr.slider.min` / `gr.slider.max`, added
  to all three locales.
- **A collapsed range could not be pulled apart with the mouse.** When both thumbs met at one point, a click always went
  to the lower one, which was already blocked by the upper — so the range stayed collapsed unless you reached for the
  keyboard. A click now goes to the thumb on the side you clicked.
- **Right and middle clicks started a drag.** `pointerdown` did not check `event.button`; only the primary button moves
  the slider now.
- **`aria-valuetext` was missing.** With a `formatTooltip` of «$1 200» a screen reader still read the bare number; the
  formatted text is now exposed. Without a custom format the attribute stays absent — a plain number needs no help.
- **`aria-orientation` was hardcoded to `horizontal`** and now follows the prop.
- **Mark labels were read out as stray text.** The ticks were `aria-hidden` but their labels were not, so a screen
  reader announced them on top of the value it already reads from the thumb.
- **`GrSlider` dimmed its disabled state with `opacity`.** The fill, the thumb and the mark labels now use the
  `--gr-disabled-*` tokens.
- **`GrSidebar`'s toggle button spoke English in every locale.** «Expand sidebar» / «Collapse sidebar» were hardcoded
  past the i18n layer, and the only way out was passing `toggleLabel` by hand. The default now comes from
  `gr.sidebar.expand` / `gr.sidebar.collapse`, added to all three locales.
- **`GrSidebar`'s content could not be scrolled from the keyboard.** The scrolling container had no `tabindex`, so a
  sidebar holding plain text was unreachable without a mouse; it is now a `Tab` stop with a visible focus ring.
- **`GrSidebarItem` dimmed its disabled state with `opacity`.** It now uses the `--gr-disabled-fg` token, which does not
  water down text tuned for AA contrast.
- **`GrStatistic` did not tell a screen reader whether the metric went up or down.** The trend icon is decorative and
  «+12.5%» carries no direction on its own, so growth and decline were indistinguishable — colour conveys it to sighted
  users only. The trend line now carries a visually hidden «Increase» / «Decrease» / «No change», which survives a
  custom `#trend` slot.
- **`GrStatistic`'s loading region announced nothing.** The placeholder was `role="status" aria-busy="true"` with no
  text inside, so the live region stayed silent; it now holds a hidden loading string.
- **`GrPagination` hung the tab on `pageSize: 0`.** The page count came out as `Infinity` and the loop building the
  number range never finished. The divisor is clamped to at least `1` now.
- **`GrPagination` rendered no active page when `page` was out of range.** The clamp used to arrive only through a
  watcher, which stays silent on the first render, so a stale page from a URL produced a pagination with nothing
  highlighted and misleading prev/next states. The render is driven by the clamped page; the watcher still asks the
  parent to catch up.
- **`GrList`: the item title, the item description and the empty state moved from `13px` literals to
  `--gr-text-sm`.** They are 1px larger than before and follow the theme's type scale; the hierarchy inside a row is
  carried by weight and colour. Both class strings live in `grListStyles.ts` and are declared in the safelist, so the
  two branches of a row cannot drift apart.
- **`GrFormSection`: the description moved from a `13px` literal to `--gr-text-sm`.** It is 1px larger than before — the
  title and the description now share a size, and the hierarchy is carried by weight and colour.

### Fixed

- **Images crop instead of stretching — `object-*` classes finally emit CSS.** `@unocss/preset-mini` ships no
  `object-fit` rule at all (both families live in `presetWind*`), so `object-cover` on the `GrAvatar` image, on
  `GrFileUpload` thumbnails and `object-contain` in `GrImageViewer` sat in the markup with nothing behind them: the
  build succeeded, the tests stayed green, and a non-square photo was squashed to fill its box. The rules now arrive
  through `@feugene/unocss-mini-extra-rules` 0.7.0, which is why the peer range on
  `@feugene/unocss-preset-granular` moved to **`^0.8.1`** — on an older preset those classes are still dead. Two gates
  were widened so this cannot come back quietly: `object-` joined the families scanned out of component sources (until
  now only the safelist was checked, and these literals live in templates), and `object-cover` /
  `object-contain` joined the list of utilities asserted to survive the consumer's preset pair.

- **`GrFormFile` now honours `readonly` instead of merely announcing it.** The prop was declared, `aria-readonly`
  reached the button and the value reached the form — but exactly one of the four ways to change the set checked it. A
  read-only field still accepted a dropped file (`v-dropzone` was gated on `disabled` alone), still rendered a working
  "Remove"/"Clear all", and still removed individual rows. It now routes every mutating path through the
  `locked` state of `useGrFormControl` — the same one `GrFileUpload` has used all along — and the buttons that could
  only ever be refused are no longer rendered. The select button stays focusable and keeps `aria-readonly`: a field has
  to be reachable from the keyboard to explain why it will not budge. `disabled` is unchanged.

- **A `GrDropdown` panel that holds content rather than a menu is usable from the keyboard again.** With
  `closeOnContentClick={false}` the panel is a place for fields and checkboxes — the package's own "persistent content"
  example is a filter panel — and none of it could be reached without a mouse. `Tab` closes the panel by design, arrow
  navigation only ever looked for `[role=menuitem]`, links and buttons, and every printable key was swallowed by the
  menu typeahead, so a focused checkbox could not even be toggled with `Space`. Three things changed. The focus ring is
  now collected by the package's shared focusable rules, so anything focusable in the panel — inputs, textareas,
  selects, `contenteditable` — is reachable with arrows, and elements hidden by a
  `position: fixed` ancestor are no longer dropped by the old `offsetParent` heuristic. Keys a focused control owns stay
  with it: printable characters and `Home`/`End` no longer reach the typeahead while focus is in a field.
  `Space` on an empty typeahead buffer activates the focused item instead of starting a search, which is both the native
  behaviour of the buttons menu items are made of and the WAI-ARIA APG rule; it still joins the buffer once a search is
  under way. Arrows are the deliberate exception and remain the panel's — since `Tab` closes the panel, they are the
  only way out of a field inside it.
- **`readonly` is now airtight.** Two controls declared `aria-readonly` yet still accepted changes: the native
  `<select>` of `GrSelect` (no native `readonly` exists there — the DOM value is now reverted to the model, the same
  trick `GrCheckbox` uses for `<label for>`), and `GrNumberInput`, where Home/End jumped to `min`/`max`. A readonly
  number field now behaves like readonly text: arrows and Home/End go to the native caret.
- **Delegated tree keyboard respects interactive targets.** `GrTree` intercepted every key at the root: Enter on the
  expand toggle activated the *focused* row instead of clicking the button, and typing into an input inside a custom
  node slot was swallowed by typeahead's `preventDefault`. A **tabbable** target inside a node — a link, a slot button,
  an input — now owns the keyboard outright. The row's own toggle and drag-handle are not tabbable (`tabindex="-1"`; a
  tree of fifty nodes was fifty-plus Tab stops instead of one), and they are reachable by mouse only, so they keep just
  the activation keys: arrows, `Home`/`End` and typeahead stay with the tree, and clicking the toggle no longer kills
  navigation until the next click on a row. And when virtualization unmounts the row **that holds focus**, focus lands
  on the tree root (where the delegated keyboard lives) instead of `<body>`, so the first arrow key recovers the row —
  scrolling a tree nobody focused leaves the page's focus alone.
- **Hold-and-release on the `GrNumberInput` steppers.** The auto-repeat did not listen for `pointercancel`, so a touch
  scroll that took the pointer away left the interval stepping to the boundary; and releasing after a hold fired the
  trailing `click` as one extra step. Both fixed: `pointercancel` stops the repeat, and a click that tails a repeat
  gesture is consumed. Only a *pointer* click can be that tail — a keyboard activation (Enter/Space, `detail:
  0`) always steps, so a hold that ended without a click (released off the button, cancelled by touch) can no longer
  swallow the next keystroke from a keyboard or AT user.
- **A click on the row-selection checkbox of `GrDataTable` no longer also emits `rowClick`.** Selecting a row and
  navigating away in one click is not a thing. The suppression sits on the checkbox itself, not on the service cell:
  on a row excluded by `selectableRow` that cell holds no checkbox, and it stays as clickable as every other cell of the
  row instead of becoming a dead zone.
- **`GrToaster` pause survives a passing cursor.** Hover and focus-within were one flag, so a mouse crossing the stack
  and leaving resumed countdowns under keyboard focus (WCAG 2.2.1). They are now independent flags OR-ed together.
- **`GrForm` async validation is race-free.** Two overlapping runs of the same field applied results in promise
  *resolution* order — a slow answer about a stale value could overwrite a fresh one. A per-field sequence counter (the
  `searchSeq` pattern from `GrAutocomplete`) now discards stale results, and a superseded run returns the verdict of the
  run that superseded it instead of reading a not-yet-written error map — otherwise `validate()` could aggregate
  "valid" for a value nobody had checked yet and `submit` would fire on it. `clearValidate()` and `resetFields()`
  cancel in-flight runs: their answer describes the pre-reset state, it no longer lands in the freshly cleared form, and
  the field stops being marked "validating" at once instead of waiting for the server.
- **`GrSelect`/`GrAutocomplete` polish.** Chip remove buttons hide under form-context `disabled`, not only the local
  prop; typeahead searches cyclically from the active option (APG) instead of from the top, and repeating one letter
  walks to the next option starting with it instead of searching for "aa" — the same rule `GrTree` and `GrDropdown`
  already followed; option hover updates the active index via a precomputed map — O (1) per mousemove instead of O (n)
  on virtualized thousands. The autocomplete clear button is Tab-reachable (the `GrSelect` convention); below
  `minQueryLength` the panel shows the "type at least N characters" hint instead of stale results — including under
  `allowCustomValue`, where the hint now sits next to the
  "Add …" row; and replacing `options` in remote mode makes the new list the source again until the next fetch answers,
  aborting the in-flight request for the previous data set. That reset keys on the list's *contents*, not on array
  identity, so an inline `:options="[...]"` literal is safe: a re-render that rebuilds the same options — including one
  the component itself triggered with `update:modelValue` — no longer wipes fetched results mid-interaction.
- **`GrList` no longer measures skeletons.** In the loading state the virtualizer recorded loading-row heights under the
  indices of future data rows, skewing the scroll extent right after load.
- **`GrButton` exposes `blur()`** — the last control returning only half of the `focus`/`blur` pair.
- **`GrToaster` showed the newest toasts and bumped the oldest visible one off screen.** The docs promised a queue —
  "extras wait, their timers paused" — but the visible window was the newest `maxVisible` entries, so every push
  displaced a toast the user might still be reading, which then came *back* later. The window is now the oldest entries:
  visible toasts finish their countdown, new ones wait their turn and enter FIFO as slots free up. The module-level cap
  of 20 stays a flood guard and may still evict a visible toast on overflow — a deliberate trade-off, now stated in the
  code.
- **Theme listeners outlived their application.** The app-scoped theme state subscribed to `storage` and
  `prefers-color-scheme` with anonymous closures and nothing ever removed them: every mount/unmount cycle of a
  micro-frontend left another pair of listeners on `window`, each holding its dead `ThemeState` alive.
  `granularityThemePlugin` now tears them down in `app.onUnmount()`; the module singleton keeps its listeners — it lives
  as long as the page does.
- **`useToast()`/`useTheme()` outside setup silently bypassed the app plugin.** A call from a router guard or an axios
  interceptor fell back to the module singleton even when the application had installed the plugin — the toast landed in
  a state no `GrToaster` reads and vanished without a trace. Two changes: the resolvers now use
  `hasInjectionContext()`, so `app.runWithContext(() => useToast())` reaches the app-scoped state; and when the fallback
  still happens while a plugin is installed, a one-time dev warning names the fix instead of staying silent.
- **`useFloating` kept its `autoUpdate` subscription on a panel closed before the deferred start.** Opening schedules
  `start()` on the next tick; closing within that window ran `stop()` first — with nothing to stop — and the queued
  `start()` then subscribed ResizeObserver/scroll listeners to a closed panel until the next open or unmount. The
  deferred callback now re-checks `open` before starting.
- **`toast.promise()` stages inherited leftovers from the loading stage.** `update()` is a patch — fields it does not
  mention stay — so a success message shorter than the loading one kept the loading `message` and its action buttons
  forever. A promise stage now *replaces* the toast content: what success/error does not set is cleared. The public
  `update()` keeps its patch semantics — that is its contract.
- **Keys pressed during IME composition were treated as commands.** Nothing in the package checked
  `event.isComposing`: the Esc that cancels a Japanese/Chinese/Korean composition closed the overlay on top of it, and
  the Enter that commits a composition selected an option in `GrSelect`/`GrAutocomplete`, added a tag in `GrInputTag`
  and ran a command in `GrCommandPalette`. A composition key now belongs to the composition alone — guarded in the
  overlay stack, both hotkey matchers and the four input-owning components, via the shared `isComposingEvent()`
  (`src/internal/keyboard.ts`).
- **Hotkeys only worked on the Latin layout, and Shift-reached symbols could not be bound at all.** Both matchers —
  `v-hotkey` and the command-palette one — compared `event.key` only, so on a Cyrillic layout `Ctrl/Cmd+K` arrived as
  `key: 'л'` and matched nothing; combos with a modifier now also match the physical `event.code` (`KeyK`), while single
  plain keys deliberately stay layout-dependent — they are typed, not positional. And a hotkey like `'?'` could never
  fire, because the matcher demanded `shiftKey: false` for a symbol that cannot be typed without Shift; a non-letter
  symbol equal to `event.key` now satisfies the check.
- **`GrSelect`: removing a tag chip did nothing for object values.** Every comparison in the component goes through
  `valueKey`, except the chip's remove button, which filtered the model with `!==` — and the model usually holds copies
  of the option objects, so nothing ever matched and the «×» was dead. It now uses the same key comparison as the rest
  of the component.
- **`GrSelect`: Enter with `allowCustomValue` could not select the highlighted option.** The Enter branch checked
  `canAddCustom` first, so typing “ap”, arrowing down to “Apple” and pressing Enter committed the raw “ap”. The «Add …»
  row is now the first element of keyboard navigation — the model `GrAutocomplete` has always used: Enter activates
  whatever is highlighted, the row got its own id for `aria-activedescendant`, active styling and mouse hover.
- **`GrSlider` was uncontrollable by touch.** The track had no `touch-action`, so a finger drag started a page scroll,
  the browser reclaimed the pointer with `pointercancel` — which the slider did not handle — and the gesture died with
  the drag state stuck. The track now sets `[touch-action:none]` and `pointercancel` cleanly aborts the gesture: the
  `lazy` draft is discarded without an emit and the thumb returns to the model value.
- **Two kinds of server state leaked between SSR requests.** The theme lived in a module-level `ref`, so a theme set
  while rendering one request was visible to the next — one user's choice in another user's response. And an overlay
  opened during SSR registered a layer in the module-level stack that nothing ever removed: `onUnmounted` does not run
  under `renderToString`, so every server render of an open modal left behind a closure holding that request's
  components. The theme is now application-scoped (see the plugin above) and the layer stack is not touched on the
  server at all — Esc, `inert` and focus restoration are browser concepts, so nothing is lost. The overlay leak was
  invisible in the rendered HTML, because overlays do not render on the server in the first place; it is now held by a
  gate that runs in a real Node environment.
- **`GrCommandPalette` dimmed a disabled command with `opacity`.** It was the last such address in the package:
  transparency dilutes text tokens that were checked against AA and drops the contrast. The command now sits on
  `--gr-disabled-bg` with `--gr-disabled-fg`, and its icon and description follow it — left on `--gr-muted-fg` they
  would have ended up darker than the label of the very row they belong to. The base class no longer sets a text colour:
  two `text-[…]` in one class list are resolved by rule order in the generated CSS rather than by order in the
  attribute, so the state token lost the moment it was added.
- **`GrListItem` dropped `href` when `as` was a component.** The attribute was bound by the resolved tag being literally
  `'a'`, and `href` is a declared prop, so it does not leak through attribute fallthrough either:
  `<GrListItem :as="RouterLink" href="/x">` rendered a link with no address at all. It is now bound whenever the row is
  interactive, the way `GrLink` has always done it.
- **`GrListItem`: a non-interactive tag in `as` no longer passes in silence.** `as="span"` together with `clickable`
  produces a control for the mouse and nothing else — a `<span>` is not in the tab order and does not answer `Enter`
  (WCAG 2.1.1). A tag named as a string that cannot take focus (anything but `button` and `a` **with** an `href`) now
  warns in a dev build. Router components stay silent: they render an `<a>`, and there is no way to know that before the
  render.
- **`GrButtonGroup` fell apart when a button was wrapped.** The gluing was written against direct children
  (`> [data-gr-button]`), so a button inside a tooltip, a `v-if` wrapper or a router link kept its own radii and a
  doubled border. It now works with «group links» — direct children that are a button *or* contain one — so wrappers no
  longer break the row, and a non-button child (a divider, a label) no longer steals the rounding from the first button:
  the edges are computed from link adjacency instead of `:first-child`/`:last-child`. Hover and focus raise the button
  above its neighbours at any nesting depth, so the focus ring is not clipped by an overlapping border.
- **`GrButtonGroup` duplicated the button radius as a literal.** Both the button and the group now read
  `--gr-button-radius` (default `0.375rem`, exactly today's value), so a consumer can change the radius of buttons and
  their groups with one variable instead of overriding two places that could drift apart.
- **`GrSelect`: Tab used to walk into the option list instead of leaving the widget.** Options are
  `<button role="option">` and were focusable, so Tab from the trigger went into the panel and then through every
  option — the opposite of the combobox contract, where focus stays on the trigger and the active option is named by
  `aria-activedescendant`. They are `tabindex="-1"` now, and `mousedown` on an option is prevented so picking with the
  mouse cannot drop focus.
- **`GrSelect`: the option list was not a valid `listbox`.** A group heading and the empty-result block were direct
  children of `role="listbox"` (`aria-required-children`). Group options now live inside their own `role="group"` named
  by the heading, and the empty result moved out into a `role="status" aria-live="polite"` region next to the loading
  one — which also gives both states the announcement they never had. New slots `#empty` and `#loading` replace them.
- **`GrSelect`: a filterable panel dropped focus on close.** The search field inside the panel takes focus while the
  panel is open; when it closed, the field was destroyed and focus landed on `<body>`, putting a keyboard user back at
  the start of the document. Focus returns to the trigger — but only if it is still inside the panel.
- **`GrSelect`: an option id was built from its value.** A value containing a space produced an invalid id, and
  `aria-activedescendant` pointed at two tokens instead of one reference. Ids follow the position in the list now.
- **`GrSelect`: disabled styling no longer uses `opacity`.** The disabled control and the disabled option are muted with
  tokens, like `GrInput`; the `danger` variant of `view="link"` moved from the saturated `--gr-danger` to the paired
  `--gr-danger-text` (hover and active are derived from it the same way `GrLink` does it).
- **`GrTree`: `appendNode` into a node without children didn't show up.** The adapter returned the freshly created array
  instead of reading it back through the data object, so `push` went past reactivity and the new child appeared only
  after an unrelated re-render.

## [v0.15.0] 2026-08-07

### Added

- **`GrAutocomplete`: `fetchOptions` — remote search run by the component.** The prop takes
  `(query, signal) => Promise<options>`: the component debounces it, aborts the previous request through its
  `AbortController` and ignores the answer to an aborted one, so a slow reply to an earlier query can no longer
  overwrite the list built for the current one. Until now the component only emitted a debounced `search` and gave the
  consumer nothing to match a response against its request — the race was theirs to lose. Internal `loading` comes with
  it, local filtering steps aside (the server filters), and a failure other than an abort is reported as `searchError`.
  The `search` event stays for applications that own the request themselves.
- **`GrAutocomplete`: keyboard access to individual chips, and `open`/`close` on the instance.** In `multiple`, `←`
  from an empty query moves onto the last chip, arrows walk between them, `Delete`/`Backspace` removes the one under
  focus and keeps focus on its neighbour, `Esc`/`→`/any printable character returns to the field. The remove buttons
  stay out of the tab order on purpose: a combobox keeps focus on its `<input>`, and twenty selected values must not
  mean twenty Tab stops. Until now only `Backspace` worked, and only on the last chip.

  With `allowCustomValue`, the «Add …» entry became a real option of the list and a stop for the arrows — committing a
  custom value from the keyboard was impossible whenever the filtered list was not empty, because Enter always went to
  the active option.

- **One portal for every overlay.** Modals, drawers, the image viewer, floating panels (select, autocomplete,
  tree-select, tooltip, popover, dropdown), toasts, the imperative dialog host and the fullscreen loader now mount into
  a single `<div id="gr-portal">` created in `body` on first use — nine independent `teleport to="body"` and two
  hand-rolled `body.appendChild` calls are gone. `GrConfigProvider` gained `portalTarget`, and the new public
  `usePortalTarget()` resolves the destination for a consumer's own overlay: local prop → provider → shared root. A
  layer that lives outside the portal branch gets marked `inert` together with the page the moment a modal opens, so a
  custom overlay has to travel with the rest.

  The portal root deliberately carries no styles and no classes: `transform`, `filter`, `contain` and friends create a
  containing block for `position: fixed`, and every `useFloating` panel would start measuring against the portal instead
  of the viewport.
- **`GrImageViewer`: touch gestures, cursor-anchored zoom and a download button.** Two pointers pinch-zoom around the
  point between them; a single pointer swipes between frames on a fitted image and pans a zoomed one — so a phone is no
  longer limited to the chrome buttons. The wheel now zooms **into the point under the cursor** instead of the centre,
  which is what makes reaching a corner of a zoomed image possible at all. `showDownload` adds a toolbar button: it
  downloads the current frame (`<a download>`) and emits `download` with `{ src, alt, index }`; a cross-origin address
  is not always downloadable, so signed links stay a job for `#toolbar-actions`.
- **`GrDrawer`: sides `top`/`bottom`, a `#header` slot and a non-modal mode.** `side` now takes four values, and the
  axis decides the rest: a side panel is stretched vertically and takes its **width** from the scale, a top or bottom
  one is stretched horizontally and takes its **height** — so `size="sm"` on a bottom sheet means 280px tall, not wide.
  A custom length follows the same axis: `width` for `left`/`right`, the new `height` for `top`/`bottom`; the prop for
  the wrong axis is ignored **and warns in dev**, because silently doing nothing looks like a bug in the component
  rather than a mistake in the call.

  `#header` replaces the header as a whole — the close button included, which the consumer then draws themselves; the
  slot receives `title` and `close`. `:modal="false"` drops the backdrop, the scroll lock, the `inert` and the focus
  trap: the page keeps scrolling, clicking and taking Tab while the panel stays open, which is what a filter panel over
  a table needs. What remains in that mode is a place in the layer stack (Esc still closes the top layer), focus return
  to the trigger and `role="dialog"` — now without `aria-modal`. The layer root passes clicks through
  (`pointer-events: none`); without that a «non-modal» panel would silently kill the whole page.
- **`useFocusTrap` — the focus trap is now a primitive of this package.** Public, next to `useOverlayLayer` and
  `useDismissible`, with its own subpath export (`@feugene/granularity/composables/useFocusTrap`). While active, Tab
  cycles inside the layer and focus that leaks out comes back; `initialFocus` is a default rather than an order — a
  focus the layer's own content has already placed (a dialog aiming at «Cancel», a prompt aiming at its field) is left
  alone. It is built on `keydown`/`focusin` **without sentinel nodes**: the widespread two-focus-guard-buttons approach
  puts interactive elements inside a container that carries an ARIA role, which the role forbids (axe:
  `nested-interactive`).
- **The overlay stack feeds the trap.** Every layer now registers its `root`, and `useOverlayLayer` returns
  `rootsAbove()` — the roots of layers opened on top. A modal passes them to the trap as extra containers, so a
  `GrSelect` panel opened inside a dialog keeps focus: in the DOM it is teleported to `body`, outside the dialog's
  subtree, while for the user it is the same layer.
- **A modal now takes the rest of the page out of the accessibility tree.** While a window is open, the other children
  of `body` get `inert` and `aria-hidden`; covering the page visually was never enough — Tab still walked into a form
  nobody could see, and a screen reader read it as usual. Roots of other layers (toasts, a panel opened from inside the
  window) are deliberately left alone.
- **`GrLoading`: `delay`, a panel slot and a spinner on the icon scale.** `delay` (ms) holds the overlay back, so a
  request that answers faster never flashes one; the countdown starts when the component mounts, and the content is not
  blocked until the overlay is actually shown. The default slot replaces the panel body as a whole — progress with
  percentages, a cancel button for a long operation. `spinnerSize` and `spinnerTone` now go through `GrIcon`
  (theme tokens instead of px literals in the markup), and the component's own `@keyframes gr-loading-spin` is gone:
  the package spins one way. The component also got its own page, `docs/components/GrLoading.md`.
- **`v-loading` blocks the content it covers.** Visually the overlay covered the container, but Tab still walked into
  the form nobody could see and a screen reader read it as usual. The directive now marks the host `aria-busy` and sets
  `inert` on its other children at the moment the overlay appears; on close it removes only what it added, and focus —
  which Chrome leaves inside a subtree that just became inert — is taken out and returned where it was, unless the user
  has moved it themselves.
- **`--gr-z-loading` (`1150`).** A layer of its own between the modal (`1100`) and toasts (`1200`): a fullscreen loader
  blocks the whole application, including an open dialog, but must not hide a notification about a background failure.
- **`GrIcon`: `label`, `tone`, `spin` and size tokens.** A meaningful icon no longer needs hand-written ARIA — `label`
  turns it into `role="img"` with a name; `tone` paints it with the palette's **text** roles (a saturated tone as text
  colour is forbidden in this package — contrast drops to about 2:1), and `spin` covers spinners. The size scale moved
  from px literals in the component to `--gr-icon-size-xs…lg` tokens, so icons now scale with the theme rather than with
  a rebuild. The component also got its own page, `docs/components/GrIcon.md`.
- **`GrForm`: whole-form `disabled`, dirty/valid state and async-rule feedback.** `disabled` travels through the field
  context down to the controls, so «switch the form off while submitting» no longer means walking the controls by hand —
  and every control that reads `useGrFormControl` now honours the resolved value instead of only its own prop.
  `setSnapshot()` re-takes the baseline (an editing form fills its model after the server answers, and the snapshot
  taken in `setup` was empty), `isDirty` and `isValid` are exposed and passed to the default slot, and a field with a
  running async rule is marked `aria-busy` and says so (new `gr.form.validating` key in all three locales) instead of
  silently showing the previous error. The component also got its own page,
  `docs/components/GrForm.md`.
- **`GrForm` emits `invalid`.** A failed submit now reports the map of messages: «the form is invalid» and «nothing
  happened» used to look identical from the outside.
- **`GrFileUpload`: per-file uploads, a response generic and image previews.** `uploadMode="per-file"` sends every file
  with its own request — `request` is still called as `(files, ctx)`, just with a single-element array, so an existing
  uploader keeps working — and `concurrency` (default 3) caps parallel connections. Each row then carries its own status
  and percent, plus `retryFile(file)` / `abortFile(file)`; `success`, `error` and `progress` gained an optional trailing
  `file` argument that only appears in this mode. The aggregate state is derived from the rows by the worst outcome, and
  cancelling one file is not an error — the row returns to the queue. `TResponse` is inferred from `request` and types
  the `success` payload, removing `any` from the public signature. `preview` renders thumbnails for `image/*` and
  revokes every object URL on removal, on a new selection and on unmount. A dev warning now fires at mount when neither
  `action` nor `request` is set, instead of throwing on the first picked file.
- **`GrCommandPalette`: recent commands and match highlighting.** `recentIds` lifts commands into a leading group — in
  the order of that array, with no duplicates below — while the query is empty; the first typed character hands the list
  back to relevance. Matched fragments of the label and description are wrapped in `<mark>` (tint via
  `--gr-command-match-bg`); a custom `filter` that matches on `keywords` alone simply highlights nothing, because there
  is nothing to highlight. Duplicate `item.id` now warns in dev: identical DOM ids make
  `aria-activedescendant` point at the wrong command. The component finally has its own page,
  `docs/components/GrCommandPalette.md`.
- **`GrConfigProvider`: subtree theming, a layer-scale base and a `locale` prop.** `theme` puts `data-theme` on the
  wrapper — a dark island inside a light page needs no extra styles, because themes are declared with an attribute
  selector. Teleported panels leave the wrapper in the DOM but stay inside the component tree, so they now read the
  theme from context and set it on themselves (modal, drawer, dropdown, popover, tooltip, select, autocomplete,
  tree-select, toaster, image viewer) — otherwise the island broke on the first open panel. `zIndexBase` recomputes
  `--gr-z-*` from a base and writes them on `<html>`, restoring the previous values on unmount; it is deliberately
  document-wide for the same teleport reason, and a second provider with its own base warns in dev. `locale` asks the
  active adapter to switch (`syncLocale`) without becoming a second source of truth.
- **The dialog family finally reads the provider.** `GrModal`, `GrDialog`, `GrConfirmDialog`, `GrPromptDialog` and
  `GrCommandPalette` resolve `size` through `componentDefaults` like every other component; the control scale
  (`size="xs"`) still does not touch overlay panels, since the two scales are different by design. The size gate now
  covers them, comparing the panel markup so that buttons inside a dialog may keep following the control scale.
- **`GrResponseErrorBanner`: the parser pipeline is finally covered by tests.** 17 tests became 85 across four files: a
  table per parser (input → `kind`/`message`/`status`/`details`/`fieldErrors`/`stop`), transport cases for
  `normalizeError` (axios, `fetch Response` incl. non-JSON bodies, `XMLHttpRequest`, abort, bare `Error`), the
  `useResponseError` composable, and the banner itself together with both presets. Two defects surfaced while writing
  them and are fixed below. The component also got its own page —
  `docs/components/GrResponseErrorBanner.md` — replacing the two READMEs that lived inside the component folder.
- **`GrDropdownMenu`: пункты стали пунктами меню, а не списком кнопок.** Roving tabindex (`tabindex="-1"`
  у пунктов, табируем только триггер) — раньше `Tab` ходил по пунктам мимо паттерна menu. Выключенный пункт больше не
  выпадает из обхода стрелками: вместо нативного `disabled` — `aria-disabled`, и пользователь узнаёт, что действие
  существует, но сейчас недоступно. `href` сам делает пункт ссылкой (`as="a"` не нужен), появились `target`/`rel`/
  `external`, а у выключенной ссылки `href` снимается — перехват клика не спасал от средней кнопки мыши и «открыть в
  новой вкладке». Те же поля добавлены в декларативную модель. Меню перестало быть беднее примитива: `trigger`,
  `openDelay`, `closeDelay`,
  `disabled` и `teleportTo` проксируются в `GrDropdown`.
- **`GrDropdown`: typeahead, `disabled`, открытие по наведению — и честный триггер.** Клик переехал из обёртки слота в
  `triggerProps`: раньше панель переключал любой клик внутри обёртки, включая вложенные кнопки и ссылки. Теперь
  `v-bind="triggerProps"` обязателен (забыли — dev-сборка скажет об этом вслух), зато вместе с кликом на триггер
  приезжают `aria-haspopup`/`aria-expanded` и клавиатура. Печатный символ в открытой панели ищет пункт по первой букве
  (буфер 600 мс, повтор буквы — следующий на неё);
  `disabled` не даёт открыть меню ничем, оставляя триггер фокусируемым; `trigger="hover"` с
  `openDelay`/`closeDelay` открывает по наведению, не отменяя ни клик, ни клавиатуру.
- **`GrDivider`: начертание, отступы, толщина, длина и имя для скринридера.** `variant`
  (`solid`/`dashed`/`dotted`), `spacing` по шкале пакета (дефолт `none` — раскладки не едут),
  `thickness` через `--gr-divider-thickness` и `length` для вертикального разделителя вне flex-родителя, где ему не от
  чего растянуться. `variant` и `spacing` читаются из
  `GrConfigProvider`. Подпись перестала пропадать из дерева доступности: `role="separator"`
  делает потомков презентационными, поэтому имя теперь приходит атрибутом `aria-label` — из
  `label` или из нового пропа `ariaLabel` для подписи, собранной слотом.
- **`useDialogService`: изоляция по приложениям, вложенные окна и `priority`.**
  `granularityDialogServicePlugin` даёт приложению собственную очередь и собственный хост и снимает их по
  `app.unmount()` — модульные синглтоны `mounted`/`container`/`cachedAppContext` больше не общие на страницу, а
  контейнер не переживает приложение (микрофронтенды, HMR). Без плагина всё работает по-прежнему, на ленивом модульном
  состоянии; готовый синглтон `dialogService` подхватывает единственный зарегистрированный инстанс, а при нескольких
  печатает предупреждение. Диалог, открытый из `onConfirm` другого диалога, теперь показывается **поверх** него: раньше
  он вставал в очередь за тем, кто его ждёт, и внешнее окно висело в загрузке до ручного закрытия. `priority` двигает
  заявку среди ожидающих, не прерывая показанное окно. Состояние заявки переехало из хоста в новый
  `GrDialogServiceItem`, поэтому у каждого окна свои загрузка, ошибки и мост конфига с i18n.
- **`GrDialog`: закреплённые шапка и подвал, фуллскрин, фокус и жизненный цикл.** `scrollBehavior="inside"`
  оставляет шапку и подвал на месте и скроллит только тело — форма на двадцать полей больше не уносит кнопки за экран;
  `initialFocus`, `opened` и `closed` пробрасываются в `GrModal`. Технически это два новых layout-слота у `GrModal` —
  `#header` и `#footer` — вне скроллящегося тела, а само тело при
  `inside` попадает в таб-порядок (`scrollable-region-focusable`). `size="full"` теперь означает «во весь экран»:
  оболочка без полей, панель `h-full` без скруглений, лишний скролл на узком вьюпорте ушёл.
- **`GrConfirmDialog`: `focusAction` и `persistent`.** Фокус при открытии уходит на «Отмена» (`focusAction`: `cancel` —
  по умолчанию, `confirm`, `none`), поэтому `Enter` сразу после открытия больше не запускает подтверждаемое действие; со
  своим слотом `#footer` фокус тихо остаётся на панели. `persistent` (есть и у `GrPromptDialog`) на время
  `confirmLoading` снимает `Esc` и клик по бэкдропу, оставляя крестик и «Отмена»; `useDialogService` теперь просто
  включает его вместо собственного расчёта в хосте. `GrButton` получил `focus()` в `defineExpose`.
- **`GrImageViewer`: alt text, an accessible name and an imperative API.** `urlList` now takes
  `{ src, alt }` next to a plain string (mixed lists included), and `alt` reaches both the `<img>`
  and the toolbar slot; the layer names itself from the locale or from the new `ariaLabel` prop; a live region announces
  the current frame ("Image 2 of 5", new `gr.imageViewer.position` key); a template ref exposes `close`, `prev`, `next`,
  `zoomIn`, `zoomOut`, `reset`, `rotateLeft`,
  `rotateRight`. The chrome is painted by per-component tokens (`--gr-image-viewer-scrim`,
  `-chrome-bg`, `-chrome-bg-hover`, `-chrome-bg-soft`, `-chrome-fg`, `-chrome-fg-muted`,
  `-chrome-brd`, `-ring`), and its buttons use `GrIcon` instead of the text glyphs `✕ ‹ › − ↺ ↻`.
- **`GrInput`: события, `loading`, `select()` и новые типы.** Поле объявляет `change` (по blur/Enter),
  `focus`, `blur` и отдельный `clear` — по одному лишь `update:modelValue` очистку кнопкой от ручного стирания не
  отличить. `loading` рисует спиннер в trailing-области и ставит `aria-busy`, не блокируя ввод; `select()`
  присоединяется к `focus()`/`blur()` в `defineExpose`; `type` принимает `tel` и `url`. Счётчик символов теперь связан с
  полем через `aria-describedby`, а исчерпание лимита объявляется живым регионом (новый ключ `gr.input.limitReached`).
- **`GrInputTag`: проверка тега, `clearable`, `loading` и размер из провайдера.** `beforeAdd` отсеивает тег до
  добавления (в том числе асинхронно — со спиннером и `aria-busy`, устаревшая проверка не дописывает свой результат),
  отказ уходит в событие `reject`. `clearable` добавляет кнопку «снести все» и событие `clear`, `clear()` появился в
  `defineExpose`. `size` и `clearable` читаются из
  `GrConfigProvider` (новый `defaults.ts`). Добавление, удаление, очистка и исчерпание `max`
  объявляются живым регионом (`gr.inputTag.added`, `.addedMany`, `.removed`, `.cleared`,
  `.limitReached`).
- **`GrKbd`: сочетание одним пропом и платформозависимый `mod`.** `keys` принимает строку (`"mod+shift+K"`) или набор
  токенов и рисует сочетание вложенными `<kbd>` — склеивать `⌘` и `K`
  из двух компонентов и `<span>+</span>` больше не нужно. Токен `mod` показывается как Cmd на macOS и как Ctrl на
  остальных платформах; `platform` (`auto` / `apple` / `other`) фиксирует её вручную.
  `separator` управляет разделителем. Символьные клавиши получают скрытое читаемое имя (`gr.kbd.*`) — без него диктор
  произносит `⌘` как значок. Разбор сочетаний переехал в общий
  `components/shared/hotkey.ts`, откуда его берёт и `GrCommandPalette`.
- **`GrLink` объявляет смену контекста (WCAG 3.2.5).** Ссылка, открывающаяся в новой вкладке, получает иконку внешней
  ссылки и скрытую подсказку «откроется в новой вкладке» — условием служит фактическое поведение (`target="_blank"`), а
  не проп `external`, ровно как у автоматического
  `rel="noopener noreferrer"`. Иконка выключается `:external-icon="false"` и включается вручную для внутренних ссылок;
  текст подсказки — `newTabLabel` или ключ `gr.link.opensInNewTab`. Заданный
  `ariaLabel` больше не съедает предупреждение: имя собирается вместе с ним.
- **`GrList`: пустое состояние, загрузка и кликабельные строки.** Пустоту список определяет сам по содержимому слота —
  `v-if` вокруг него больше не нужен; слот `#empty`, `emptyText` (ключ
  `gr.list.empty`) и проп `empty` как escape-hatch. `loading` рисует `loadingRows` строк-скелетонов и помечает контейнер
  `aria-busy`; слот `#loading` заменяет их целиком. `GrListItem` получил `href`,
  `as`, `clickable`, `hoverable`, `disabled` и событие `click`: строка сама становится ссылкой или кнопкой, а
  `role="listitem"` остаётся на обёртке — обёртка-кнопка снаружи пункта (так это делалось раньше) разрывала связку
  `role="list"` с `role="listitem"`.
- **`GrSelect` держал четыре дефекта доступности разом.** Крестик тега был `<span tabindex="-1">`
  **внутри** `role="combobox"` — и вложенный интерактив, и полная недостижимость с клавиатуры; чипы переехали наружу и
  стали настоящими кнопками в таб-порядке. `aria-controls` при `loading` указывал на listbox, которого в DOM нет, —
  теперь ссылка снимается, а состояние объявляет `aria-busy`.
  `aria-activedescendant` висел на триггере, когда фокус уходил в поле поиска: связка с активной опцией переехала на
  элемент, который реально держит фокус. Кнопка «добавить своё значение» получила
  `role="option"` — без неё она была чужеродным потомком `role="listbox"`. Плюс: таймер typeahead снимается при
  размонтировании, шеврон больше не исчезает вместе с появлением кнопки очистки,
  `readonly` действительно блокирует открытие и выбор.
- **`GrTable` нельзя было проскроллить с клавиатуры.** `tabindex="0"` появлялся только вместе с
  `regionLabel`, то есть широкая таблица без метки была недоступна (WCAG 2.1.1). Теперь скролл в таб-порядке всегда, а
  `regionLabel` отвечает только за `role="region"` и имя области.
- **`GrTabs` терял фокус после сокращения списка вкладок.** Массив ссылок на кнопки не чистился: в нём оставались
  отсоединённые от DOM узлы, и `focus()` молча проваливался в `<body>`. Отключённая вкладка перестала получать нативный
  `disabled` — по APG она остаётся достижимой и объявленной, а недоступность выражает `aria-disabled`.
- **`GrTabPanels` не обновлял id при смене `idBase`.** Он вычислялся один раз при setup: панели оставались со старыми
  id, `GrTabs` уезжал на новые, и связка `aria-controls` ↔ `aria-labelledby`
  разъезжалась молча. В dev-сборке панель теперь предупреждает, если вкладки с таким id в документе нет.
- **`GrTextarea` экспортировал некорректный тип пропов.** `typeof props` отдавал тип **разрешённых**
  пропов: после `withDefaults` поля с дефолтами становились обязательными и `readonly`, и
  `const p: GrTextareaProps = { modelValue: '' }` падал на ровном месте. Теперь это объявленный
  `interface`. Отключённое поле гасится токенами вместо `opacity`.
- **`GrRadio` не выделял выбранный вариант текстом и гасил disabled прозрачностью.** Подпись всегда была
  `--gr-muted-fg`, в том числе у выбранного: приглушённый токен на основном контенте — это ещё и вопрос к контрасту.
  Теперь выбранная подпись — `--gr-fg`. Прозрачность (`opacity-50`/`opacity-70`) заменена токенами; отключённая
  кнопка-радио при этом **сохраняет видимый выбор** — вид `GrButton`-а состояние стирает, поэтому у радио своя пара
  классов (поймано визуальным гейтом на отключённой группе в конструкторе `GrSelect`).
- **`GrButton` гасил отключённое состояние прозрачностью — и только у `<button>`.** `disabled:opacity-50`
  разбавляет выверенные на AA цвета, а кнопка чаще других стоит на цветной подложке, где разбавленный текст
  проваливается первым; кнопке-ссылке нативный `disabled` вообще не достаётся, поэтому она не гасла никак. Появились
  токены `--gr-button-disabled-bg` / `-fg` / `-brd`, и классы применяются вместо вариантных, а не поверх (два `bg-*`
  одной специфичности разрулил бы порядок в сгенерированном CSS). Прозрачные варианты остаются прозрачными: у `ghost`/
  `outline` отключённая кнопка не превращается в залитую плашку — поймано визуальным гейтом на стрелках `GrPagination`.
  Квадратный режим перестал задаваться дважды: инлайн-стиль с px-литералами убран, размер приходит из
  `--gr-button-square-size` с размерным дефолтом в fallback, так что его можно переопределить из CSS приложения.
- **`GrCard` перестал быть семью строками шаблона.** Появились `padding`
  (`none`/`sm`/`md`/`lg`), `variant` (`elevated`/`outlined`/`ghost`), слоты `#header`/`#footer` с разделителями,
  `bodyClass`, полиморфный корень (`as` → `href` → `clickable`) и `hoverable`.
  `padding` и `variant` читаются из `GrConfigProvider`. Дефолт неизменен намеренно: без пропов карточка рендерит тот же
  единственный `<div>` с теми же классами — на ней стоят `GrCollapse` и
  `GrList`, и сдвинутый дефолт поехал бы у них (зафиксировано тестом и визуальными эталонами, которые у обоих остались
  байт в байт).
- **`GrButton`: `block`, `#prefix`/`#suffix`, `loadingText`.** Кнопка на всю ширину контейнера; иконка и текст больше не
  валятся в один слот (во время загрузки спиннер занимает место префикса — две иконки рядом читались бы как ошибка);
  `aria-busy` дополнен скрытым текстом, потому что сам по себе его объявляет не всякая AT (`loadingText` или ключ
  `gr.button.loading`).
- **`GrRadio`: `Home`/`End`, `invalid`, слот `#description` и значения не только строкой.** Клавиатура дополнена краями
  набора (отключённые варианты пропускаются, как и на стрелках); `invalid` можно поставить переключателю или всей
  группе — состояния складываются по «или»; описание под подписью связывается через `aria-describedby`; `value`/
  `modelValue` принимают `string | number | boolean`
  (`GrRadioValue`) — перечисления в формах это обычно id числом.
- **`GrRadioGroup`: опции с `disabled`/`description`, `orientation` и `readonly` до переключателей.**
  `GrRadioGroupOption` вырос до `{ value, label, disabled?, description? }` — отключить один вариант или дать ему
  пояснение больше не значит переходить на слот. `orientation` (`vertical`/`horizontal`)
  управляет раскладкой варианта `radiobox`; кнопочный собирает `GrButtonGroup`, и там раскладка своя.
  `readonly` теперь виден и переключателям: группа объявляет `aria-readonly` (у роли `radio` такого атрибута нет), а
  сами переключатели перестают обещать клик курсором.
- **`GrSelect`: `v-model:search`, события и `maxTagCount`.** Текст поиска уходит наружу (`update:search` + `search`) —
  без этого `loading` был декоративным пропом: сходить за опциями на сервер было не с чем. Добавлены `change`, `clear`,
  `visible-change` (паритет с `GrTreeSelect`) и
  `maxTagCount` — хвост чипов сворачивается в «+N».
- **`GrTable`: `#empty`, `loading`, `striped`/`hoverable`.** Пустоту таблица определяет сама по содержимому слота
  (`columnCount` растягивает служебную строку), `loading` рисует скелетоны и помечает контейнер `aria-busy`.
- **`GrTabs`: `activationMode` и `orientation`.** `manual` двигает стрелками только фокус, выбор подтверждается `Enter`/
  `Space` — вкладки с тяжёлой загрузкой перестают тянуть каждую панель при переборе. `orientation="vertical"`
  разворачивает список в колонку и переводит навигацию на `↑`/`↓`.
- **`GrTabPanel`: `lazy`.** Вместе с `keepAlive` даёт «смонтировать один раз по требованию и больше не разрушать».
- **Витрина показывает новую функциональность:** удалённый поиск `GrSelect` (`v-model:search` + `@search`
  с гонкой запросов, `maxTagCount`, журнал событий), ручной режим активации и вертикальные вкладки
  `GrTabs`, `keepAlive` + `lazy` у `GrTabPanels`, автовысота и счётчик `GrTextarea`. Демо `GrTable` для пустоты и
  загрузки переписаны на новые пропы — они собирали руками ровно то, что компонент теперь умеет сам.
- **`GrTextarea` догнал `GrInput`:** `maxlength` + `showCount` (счётчик связан через
  `aria-describedby`), `autosize` поверх уже существовавшей директивы `v-autosize` и `resize`.
- **`GrCheckboxGroup`** — the multi-select counterpart of `GrRadioGroup`: `v-model: string[]`,
  `role="group"`, and shared `name` / `size` / `disabled` / `readonly` / `invalid` for the nested
  `GrCheckbox`. `GrCheckbox` also gains `labelPosition` (label before the control).
- **`GrCollapse`: `borderless`, `headingLevel`, `expandIconPosition`, `beforeChange`, `size`** plus the `#extra` and
  `#icon` slots on `GrCollapseItem`. The accordion now reads `GrConfigProvider`
  (`size`, `divided`, `borderless`, `expandIconPosition`, `headingLevel`).
- **`GrDataTable`: `@row-click`, `rowClass`, `rowProps`, `selectableRow`, `emptyText`,
  `sortCycle="asc-desc-none"`, the `#header-<key>` and `#loading` slots**, and an imperative API (`scrollToRow`,
  `scrollTo`, `clearSort`, `toggleAll`). Columns are now typed against the row (`GrDataColumn<TRow>`), so a typo in
  `key` is a type error instead of a silently empty column.
- **`GrDrawer` caught up with `GrDialog`**: `showHeader`, `showCloseButton`,
  `headerConfig` / `bodyConfig` / `footerConfig`, plus `persistent`, `width`, `initialFocus`,
  `@opened` / `@closed` and an imperative `close()` / `focus()`. `size` and `side` now come from
  `GrConfigProvider` through `componentDefaults`.
- **`--gr-overlay-bg`** — the scrim token behind modal layers, shared by `GrModal` and `GrDrawer`
  and darker in the dark theme.
- **`GrDropdownMenu` can be built from a model**: `:items` accepts actions, groups and dividers and emits `select`;
  items gained `role="menuitemcheckbox"` / `menuitemradio` with `aria-checked`, plus `icon` and `shortcut` (props or
  slots). Composition of the sub-components stays for everything a model cannot express.
- **`GrFileUpload`: `accept`, `capture`, `directory`**, an `exceed` event, and control over the selected set —
  `retry()`, `removeFile()` and a remove button in `showFileList`, plus `retry` /
  `removeFile` in the slot scopes.
- **`GrFormFile`: `v-model:errors` and `limit`**, file size in the list, and a remove button that names its file.
  `maxCountValidator` joins the public `fileValidation` API — `limit` is sugar on top of it.
- **`GrFormField`: `size`, `labelPosition` / `labelWidth`, `showMessage`, an array of `error`s**, and the `#label` /
  `#error` slots. `size` and `labelPosition` are readable from `GrConfigProvider`.
- **`GrTooltip`: `placement`, задержки, слот и управление снаружи.** Появились `placement` и
  `offsetPx` (`useFloating` умел их с самого начала, наружу они не выходили), `openDelay` /
  `closeDelay` — на плотной панели кнопок подсказка перестаёт мигать, — `disabled`,
  `v-model:open` и слот `#content` рядом с пропом `text`. На тач-устройствах, где нет hover, подсказка открывается тапом
  и закрывается тапом вне.
- **`GrToaster`: `F6` в стек уведомлений, ширина пропом, `focus()`.** Тосты телепортированы в конец
  `body`, и кнопка «Отменить» лежала за пределами разумного числа нажатий `Tab`; `focusHotkey`
  (по умолчанию `F6`) переводит фокус на верхний тост, дальше действия обходятся `Tab`. Сам тост остановкой `Tab` не
  становится (`tabindex="-1"`). `width` (число или CSS-длина) уезжает в
  `--gr-toaster-width`, `focus()` добавлен в `defineExpose`.
- **`GrTree`: typeahead, `*`, режимы раскрытия и `focus()`.** Клавиатурный контракт паттерна tree закрыт целиком:
  печатные символы переводят фокус по первым буквам (повтор одной буквы идёт по кругу), `*` раскрывает всех соседей
  уровня. Добавлены `defaultExpandAll` (раскрывает узел в момент появления в данных, не отменяя ручное сворачивание),
  `expandOnClickNode`, `accordion` и событие `nodeContextMenu`. `focus(key?)` в `defineExpose` — им пользуется
  `GrTreeSelect`.
- **`GrTreeSelect`: `loading` и размер из провайдера.** Панель показывает индикатор вместо «Нет данных», пока данные
  едут (новый ключ `gr.treeSelect.loading`, слот `#loading`). `size` читается через `useGrComponentSize()` (новый
  `defaults.ts`) и доезжает до дерева внутри панели.
- **`GrModal`: `scrollBehavior`, `initialFocus`, `opened`/`closed`.** `scrollBehavior="inside"`
  ограничивает панель высотой вьюпорта и скроллит только её тело — слоты `#title`/`#description`
  при этом остаются на месте; `outside` (по умолчанию) сохраняет прежнее поведение. `initialFocus`
  задаёт элемент, получающий фокус при открытии (раньше это всегда была панель). `opened`/`closed`
  приходят **после** анимации: по `update:modelValue` размонтировать содержимое нельзя — оборвётся анимация закрытия.
  Слоты типизированы через `defineSlots`. Всё это уже умел `GrDrawer` — примитив, на котором стоит вся модальная семья,
  отставал от него.
- **`GrPromptDialog`: `rules`, многострочный режим, тип поля и счётчик.** Проверки сверх `required`
  описываются пропом `rules` — тем же движком, что у `GrForm` (`type`, `min`/`max`/`len`, `pattern`, свой в том числе
  асинхронный `validator`); третьего частного случая валидации в пакете не появилось. `multiline` переключает поле на
  `GrTextarea` (`rows`, `autosize`), есть `inputType`,
  `inputmode`, `maxlength` и `showCount`. Всё это же доступно императивному
  `useDialogService().prompt()`.
- **`createGrFormMessageResolver` — публичный.** Дефолтный резолвер сообщений жил внутри
  `GrForm.vue`, из-за чего публичный `runFieldRules` был снаружи бесполезен: прогнать те же правила вне формы можно было
  только написав свой резолвер.
- **`useDialogService`: `ctx.setFieldError` стал адресным, alert берёт подпись кнопки из локали.**
  Ошибки полей складываются в карту по именам (новый ключ `gr.dialog.ok` в трёх локалях вместо хардкода `'OK'`).
  `GrPromptDialog` показывает ошибку своего поля, а единственную запись — какой бы ни было имя.

### Fixed

- **`GrAutocomplete`: Tab used to walk into the option list instead of leaving the widget.** Options are
  `<button role="option">` and were focusable, so Tab from the field went into the panel and then through every option —
  the opposite of the combobox contract, where focus stays on the `<input>` and the active option is named by
  `aria-activedescendant`. They are `tabindex="-1"` now, and `mousedown` on an option is prevented, which also fixes the
  second half: picking an option with the mouse in single mode used to drop focus on `<body>`, because the button
  holding it disappeared together with the panel.
- **`GrAutocomplete`: the option list was not a valid `listbox`.** The «Add …» button and the loading, hint and empty
  rows were direct children of `role="listbox"` (`aria-required-children`). The states moved out of the list into one
  `role="status" aria-live="polite"` region below it — which also gives them the announcement they never had: loading,
  «type at least N characters» and «no results» changed in complete silence for a screen reader.
- **`GrAutocomplete`: `readonly` was an ARIA attribute with no behaviour, and `disabled` from `GrFormField` was ignored
  by the markup.** The panel opened on focus, options were selectable and chips removable in a read-only control; a
  field-level `disabled` left the shell looking enabled and kept the chip remove buttons in place. Both states now lock
  the control the same way.
- **`GrAutocomplete`: an option id was built from its value.** A value containing a space produced an invalid id, and
  `aria-activedescendant` pointed at two tokens instead of one reference — the active option stopped being announced.
  Ids follow the position in the list now.
- **`GrAutocomplete`: disabled styling no longer uses `opacity`.** Transparency dilutes text tokens tuned for AA and
  drops the contrast; the disabled shell and the disabled option are muted with tokens, like `GrInput`. The panel also
  stopped hard-coding `text-[13px]` and `rounded-[10px]` instead of `--gr-text-sm` / `--gr-radius-md`, and the chip
  remove button stopped borrowing `gr.inputTag.removeTag` from another component's namespace — it has its own
  `gr.autocomplete.removeValue`, with the value in the label.
- **Toasts, select panels and the imperative dialog host were being marked `inert` by an open modal.** The rule skipped
  only elements carrying `data-gr-overlay-root`, and exactly three components had it — so a toast raised while a dialog
  was open was silently removed from the accessibility tree and its action button became unreachable, which is the one
  thing the top layer of the z-index scale exists to prevent. Every overlay root is marked now, and the rule itself
  walks from the layer up to `body` instead of assuming all overlays are direct children of it.
- **`GrImageViewer` preloaded neighbours while closed.** `onMounted` warmed up two full-size images regardless of
  `modelValue`, so any page that merely contained a viewer paid for it on load. Preloading now starts on open, and
  outdated requests are aborted when the frame changes, on close and on unmount — fast paging through a gallery no
  longer piles up downloads nobody needs.
- **`GrImageViewer`: panning had no bounds.** The image could be dragged off-screen entirely and only reset would bring
  it back. Offsets are now clamped to the frame's own overflow — as far as the picture sticks out of the viewport, that
  far it moves — recomputed on zoom, rotation and resize. A zoomed frame is draggable regardless of
  `draggable`, which previously left the default configuration (wheel zoom on, dragging off) unable to reach the edges
  of a zoomed image.
- **`GrDrawer`: the scrollable body was unreachable from the keyboard.** `overflow-y-auto` without `tabindex="0"`
  means a long text with no focusable element inside cannot be scrolled at all without a mouse (axe:
  `scrollable-region-focusable`). `GrModal` has had this; the drawer had not.
- **`GrDrawer` lost the window name when the header was hidden.** `<GrDrawer title="Filters" :show-header="false">`
  announced itself as the generic «Drawer» from the locale instead of its own title, because the name was bound to the
  header being rendered. The title is now rendered `sr-only` whenever the header is hidden or replaced by the
  `#header` slot, and the generic name stays a fallback only for a panel with no title at all.
- **A field marked `required` on `GrFormField` was never validated.** Validation walked `Object.keys(rules)` only, so
  such a field drew the asterisk, announced `aria-required` — and let submit through while empty. The field now
  registers its own requirement with the form, which applies an implicit `{ required: true }` with the same localized
  message as an explicit rule.
- **`resetFields()` restored the wrong thing in editing forms.** The baseline was captured in `setup`, so a model filled
  from a server response reset back to the empty object; there was no way to re-take it. Use `setSnapshot()`. Reset also
  walks the union of snapshot and model keys now: a key added after the snapshot is **removed** instead of being set to
  `undefined`.
- **Per-field watchers were recreated on every render.** The watcher keyed on `Object.keys(props.rules)` — a new array
  identity each time the getter recomputed. It now keys on the joined names.
- **`GrCommandPalette` violated `aria-required-children`, and the panel is always expanded.** The group heading and the
  empty-state block sat as direct children of `role="listbox"`. The heading moved inside its `role="group"` and is
  presentational now (it still names the group through `aria-labelledby`), and the state block left the listbox
  entirely.
- **The loading state was announced by nothing at all.** `aria-label` hung on a generic `<span>`, where most assistive
  tech ignores it. Loading and «nothing found» now share one live region (`role="status"`, `aria-live="polite"`), and
  the spinner icon is marked decorative.
- **The arrow-key selection reset on any unrelated re-render.** The watcher fired on array *identity*, so a parent
  passing `:items` as an inline expression threw the highlighted command back to the top of the list. It now watches the
  content (ids joined by a space — an id may legitimately contain a comma).
- **`GrConfigProvider` decided the fate of the i18n adapter once, in `setup`.** `if (props.i18n != null) provide(…)`
  meant an adapter created asynchronously — the usual «load the locale, then build the adapter» — never reached the
  children at all, and swapping adapters on a language change did not propagate either, because a value was provided
  instead of a reactive source. The adapter is now always provided through a façade that delegates to a computed source
  and falls back to the adapter installed higher up; `te` is forwarded by a getter, since an always-defined
  `te` would mean «no translation» for every key.
- **`GrResponseErrorBanner` silently dropped a server message that matched a default.** Fallback detection compared
  strings against the built-in English texts, so a server literally answering `"Network error."` lost its message to the
  translated default. `ResponseErrorInfo` now carries `isFallbackMessage`, set in exactly one place — the classifier,
  when no parser supplied a message — and the banner substitutes a translation only for such messages. Consequently
  parsers no longer fill `message` with generic `kind` texts: `httpStatus`, `abort`
  and `network` return only what they learned, and the specialised ones (Laravel, JSON:API, Problem Details, file
  validation) fall back to the classifier instead of hardcoding a text the banner could not translate.
- **A transport error's message was shown as if it came from the server.** With an empty response body,
  `plainMessageParser` picked up `Error.message` — for axios that is `Request failed with status 500`, so users saw a
  technical English string instead of the localized text for the `kind`. That source is now used only when there was no
  response at all (no status, no body).
- **`useResponseError` wrapped the raw error in a reactive proxy.** `lastRaw` was a deep `ref`, which broke identity
  comparisons and made a stored `Response` throw on `clone()` when handed back for a retry; it is a
  `shallowRef` now, like `currentError`.
- **The HTTP status badge was the last hardcoded string in the component.** It now reads `statusLabel` from the texts
  (new `gr.responseError.statusLabel` key in all three locales), so it is both translatable and overridable through the
  `texts` prop.
- **`GrImageViewer` threw the user back to the first frame and painted over toasts.** Any change to
  `urlList` — a gallery loading its next page — reset the index to `initialIndex` together with zoom and rotation; the
  viewer now holds on to the *frame*, keeping it on screen even when it shifts position, and clamps to the list bounds
  only when the frame is gone. Its layer moved from the hard-coded `z-index: 2000` (above the toast layer, the one thing
  that must stay visible) to
  `--gr-z-modal`, with the `zIndex` prop left as an escape hatch — the entry is gone from the
  `layering.test.ts` allowlist and from the deviations table in `docs/z-index.md`. The modal layer also had no
  accessible name at all (`aria-dialog-name`), and every image was `alt=""` with no way to pass a description.
  `useZoomPan`, `useWheelGesture` and `useViewerKeyboard` are now covered by tests.
- **`GrList` держал safelist рукописными строками.** `config.ts` перечислял `'px-4'`, `'py-2'`, `'py-3'`
  копией карты плотности из `GrListItem.vue` — расходиться они могли молча. Классы уехали в
  `grListStyles.ts`, safelist собирается от них. Разбор слотов (`flattenSlotNodes`,
  `isWhitespaceTextNode`) переехал из `GrFileUpload` в общий `components/shared/slotNodes.ts`:
  импорт из чужой компонентной директории дал бы на сборке ребро между компонентами, которого в разметке нет.
- **`GrLink` гасил отключённую ссылку прозрачностью.** `opacity-60` поверх `--gr-muted-fg` разбавляла выверенный на AA
  токен и роняла контраст ниже нормы; остался только цвет. Заодно из
  `grLinkStyles.ts` убран комментарий-история (правило «Комментарии в коде» из `CLAUDE.md`) и снят экспорт
  `linkToneColors` вместе с лишним реэкспортом `GR_TONES` — оба использовались только внутри модуля, но утекали в
  публичный `.d.ts`.
- **`GrKbd` знал только два размера из четырёх.** Проп обещал шкалу пакета (`xs…lg`), а в разметке стояло
  `size === 'sm' ? … : …`: `xs` и `lg` молча рендерились как `md`. Шкала полная, классы уехали в
  `grKbdStyles.ts` с safelist, а компонент вышел из списка неполных шкал в `componentSize.test.ts`.
- **`GrInputTag` запирал клавиатуру на пределе набора и врал о валидности.** При достижении `max`
  инпут получал `disabled`: он выпадал из таб-порядка и переставал принимать `Backspace` — единственный способ убрать
  тег с клавиатуры, так что выйти из тупика можно было только мышью. Поле остаётся живым, лишние теги просто не
  добавляются. Рамка красилась сырым пропом `invalid`, тогда как `aria-invalid`
  брался из контекста: внутри `GrFormField` с ошибкой поле было объявлено невалидным для скринридера и выглядело
  обычным; `readonly` поля до инпута не доходил вовсе. Крестики чипов переведены на roving tabindex (двадцать тегов
  давали двадцать одну остановку `Tab`): между ними ходят `←`/`→`, `Home`/`End`, удаляет `Delete`, а из пустого поля на
  последний чип уводит `←`. Кнопка удаления называет свой тег, набор объявлен списком (`role="list"`/`listitem`).
  Заблокированное поле гасится фоном `--gr-muted`
  вместо `opacity-50`, крестик чипа больше не теряет контраст на тёмном тоне, а `safelist.ts` ссылается на классы
  хелпера вместо строковых копий.
- **`GrInput` не отдавал очистку и показ пароля клавиатуре.** На обеих trailing-кнопках стоял
  `tabindex="-1"`: виджет был объявлен доступным (`aria-label`, `aria-pressed`), но воспользоваться им без мыши было
  нельзя — очистить поле или посмотреть введённый пароль клавиатурный пользователь не мог. Атрибут снят, обе кнопки
  после нажатия возвращают фокус в поле. Заблокированное поле гасится фоном
  `--gr-muted` с текстом `--gr-muted-fg` вместо `opacity-50`, которая разбавляла выверенные на AA токены. Заодно ожил
  `grInputStyles.ts`: карты размеров, выравнивания и состояний были продублированы инлайн в SFC, копии разошлись
  (`focus-visible:` против `focus-within:`), и safelist декларировал классы, которых в разметке нет.
- **`GrFormField` announced errors unreliably and validated too eagerly.** The error box appeared and disappeared with
  `v-if` while the control's `aria-describedby` changed composition at the same moment — assistive tech that does not
  re-read the description after an attribute change stayed silent. The box now lives in the DOM permanently (visually
  hidden while empty) and only its text changes, so the attribute is stable. Blur validation no longer fires when focus
  moves *within* the field (input → its own clear button, checkbox → checkbox), which used to flag a field before it was
  filled in. The required marker and the error text moved from the saturated `--gr-danger` to
  `--gr-danger-text`, and a field whose control never read the context now warns in dev — until now
  `<label for>` silently pointed at nothing.
- **`GrFormFile` validation errors were invisible to assistive tech.** The error list had no
  `role="alert"` and was not tied to the control, so "dropped the wrong file type" produced red text and nothing else —
  on the component whose headline feature is validation. Errors are now announced, referenced from the upload button
  through `aria-describedby` (next to the field's own description) and reflected in `aria-invalid`. The error text moved
  from the saturated
  `--gr-danger` to `--gr-danger-text`, the container no longer dims itself with `opacity-60`, and the validator chain is
  assembled once instead of being duplicated between the file dialog and drag&drop — the two could drift apart on the
  first edit.
- **`GrFileUpload` kept working after it was gone.** Unmounting left the XHR running and the
  "hide progress on success" timer armed, so a finished upload called `emit` on a destroyed instance — the everyday case
  is "upload succeeds, user leaves the page". Both are now released in
  `onBeforeUnmount`.
- **`GrFileUpload` ignored `accept` and lost races.** The attribute was never bound, so a consumer's
  `accept` landed on the root `<div>` and the file dialog showed everything; it is now a prop that goes both to the
  input and into the validator chain (the dialog filters, drag&drop does not). Two quick selections in a row overlapped:
  the one whose validators finished *later* won and aborted the upload already started by the newer one — each run now
  carries a sequence number. A custom `request` that never calls `onProgress` no longer reports "100%" with `total: 0`,
  the file list keys by identity instead of by name, and the upload phase is announced through a live region.
- **`GrDropdownMenu` wrappers broke the menu pattern.** `role="menu"` on the panel makes every descendant
  presentational, so the list, columns, column, group and header divs sitting between the panel and its items violated
  `aria-required-children` — the items lost their menu. They are now `role="none"` / `presentation`, and a group is a
  real `role="group"` named by its header. The catalog also got its missing `safelist.ts`: its class maps live in a
  `.ts` helper the bundler moves into a shared chunk, outside the component's scan area, so alignment, columns and
  colors would have silently vanished for an isolated consumer. `variant="danger"` now uses
  `--gr-danger-text` instead of the saturated tone, disabled is painted with background tokens instead of `opacity-60`,
  and a disabled item is no longer activated by handlers bound on the item itself (`stopImmediatePropagation`, matching
  `GrButton`).
- **`GrDrawer` sat below the whole z-index scale.** The panel used a literal `z-50`, so a dropdown or select panel
  (`--gr-z-dropdown` = 1000) painted over the open drawer and its backdrop did not cover them. It now uses
  `--gr-z-modal`, like every other modal layer — the entry is gone from the
  `layering.test.ts` allowlist and from the deviations table in `docs/z-index.md`. The backdrop moved from the
  hard-coded `bg-black/40` to `--gr-overlay-bg`, and an empty `title` no longer renders the word "Drawer" as a heading
  (the header is dropped, the layer keeps an
  `aria-label`). Focus, scroll-lock, `persistent` and the interaction with other overlays are now covered by tests.
- **`GrDataTable` no longer gives every keyless row the same key.** With the default
  `rowKey: 'id'` a row without `id` resolved to `''`, so Vue reused DOM across rows and selecting one row marked all of
  them selected. Such rows now get a stable synthetic key (plus a dev warning). Sorting stopped treating `null` and `''`
  as `0` — empty cells always sort last, and
  `Date` / `boolean` / numeric strings compare by value; string comparison uses the i18n adapter's locale rather than
  the browser's. The sort button is named by the column label with the hint as hidden text, so `<th>` keeps its name in
  screen readers; loading and empty states are announced through a live region that exists from the first render. Row
  checkboxes are `GrCheckbox`, not native inputs.
- **Utilities missing from `presetMini` no longer fail silently.** `sr-only` (the `GrTable`
  caption, the `GrDialog` a11y title) and `tabular-nums` (`GrInput`, `GrKbd`, `GrPagination`,
  `GrFileUpload`) generated no CSS at all: the "hidden" text was plain visible text and the digits never got tabular
  figures. `sr-only` now comes from `@feugene/unocss-mini-extra-rules` via
  `presetGranular` (v0.7.1); `tabular-nums` has no rule anywhere and was replaced with the arbitrary-value form already
  used by `GrRating`. New gate
  `src/__tests__/presetUtilities.test.ts` asserts every utility the package leans on beyond
  `presetMini` is actually generated by the combination consumers configure, and the safelist gate now uses that same
  combination as its "is this a utility?" oracle.
- **`GrCheckbox` no longer breaks native form submit when `required` is set.** The attribute is gone from the hidden
  `aria-hidden` input (Chrome cancels the submit for a non-focusable invalid control) and is declared through
  `aria-required`; validation belongs to `GrForm` rules. Disabled is now painted with background tokens instead of
  `opacity`, and `invalid` is visible, not just announced.
- **`GrCollapse` arrow keys no longer jump into a nested accordion.** `↑`/`↓`/`Home`/`End` now walk only the headers of
  their own `[data-gr-collapse]`; a nested collapse inside an expanded panel was part of the same roving list. Disabled
  headers are painted with background tokens instead of
  `opacity-50`, and the keyboard contract, ARIA wiring and `inert` panel are finally covered by tests (the suite only
  checked the model before).
- **`config.dependencies` no longer under-declares what a component renders.** `GrSidebar` declared no dependencies at
  all while rendering `GrButton` and `GrIcon`; `GrConfirmDialog` and
  `GrPromptDialog` rendered `GrResponseErrorBanner` without declaring it. Nothing failed at build time — but a consumer
  selecting only `GrSidebar` got a scan limited to
  `dist/components/GrSidebar/**` and an empty safelist, so the collapse button inside it rendered with no background and
  no focus ring. With the fix that selection resolves to
  `GrButton, GrIcon, GrSidebar` and 173 safelist entries.

  Stale declarations removed in the other direction: `GrInputTag` no longer claims `GrInput` (it stopped using it), and
  `GrDialogService` no longer repeats `GrDialog` /
  `GrResponseErrorBanner` — both come transitively through `GrConfirmDialog` / `GrPromptDialog`, and the preset expands
  the graph itself.

  New package gate `src/__tests__/componentDependencies.test.ts` derives the dependency set from sources and asserts it
  matches each `config.ts` in both directions, so the lists cannot drift again silently.
- **`GrTreeSelect` не давал добраться до дерева с клавиатуры.** `↓`/`↑`/`Enter`/`Space` на триггере только открывали
  панель — фокус оставался на месте, а панель телепортирована в `body`, так что и
  `Tab` вёл мимо. `docs/keyboard.md` при этом обещал «внутри дерева — клавиши `GrTree`». Теперь эти клавиши открывают
  панель **и** переводят фокус в дерево (при `filterable` — сначала в поле поиска, оттуда в дерево уводит `↓`/`↑`),
  `Tab` из панели её закрывает, а `Escape` закрывает и возвращает фокус на триггер, не открывая панель заново этим же
  фокусом. Триггер получил `aria-haspopup="tree"`
  и `aria-controls` на дерево, `disabled` красится токенами вместо `opacity-50`, `readonly` убирает кнопку очистки.
  Мёртвая ветка `typeof window` в обработчике указателя и второй `watch(open, …)`
  убраны.
- **`GrToaster` вкладывал `role="alert"` внутрь `aria-live="polite"`.** Вложение live-регионов с разной ассертивностью
  спецификацией не определено: браузеры и скринридеры расходятся вплоть до потери объявления. Обёртка-live-region
  снята — объявляют себя сами тосты, контейнер остаётся именованным `role="region"`.
- **`GrTree`: `aria-selected` только на выбранном узле, фокус без обхода DOM, drop без дефолта браузера.**
  `aria-selected="false"` на каждом узле заставлял диктора проговаривать «не выбрано» на каждом шаге навигации.
  Навигация стрелками искала строку обходом всего поддерева DOM — теперь есть общий реестр `key → element`. `onDrop`
  гасит дефолт браузера **до** всех проверок: иначе бросок ссылки или файла на дерево уводил со страницы. Hex-фолбэки
  `var(--gr-primary, #000)` (8 мест)
  убраны — чёрный фолбэк в тёмной теме давал непредсказуемый результат.
- **`GrTooltip` со слотом давал два таб-стопа на один контрол.** Обёртка была `<span tabindex="0">`
  без роли, а типовое употребление — подсказка у кнопки. Теперь при фокусируемом содержимом слота
  `aria-describedby` уезжает на сам контрол, а обёртка теряет `tabindex`; если фокусироваться в слоте нечему (текст,
  иконка), остановкой остаётся обёртка.
- **`GrPromptDialog` задавал полю литеральный `id="gr-prompt-input"`.** Единственное место во всём пакете с
  захардкоженным `id` в `.vue`. Два открытых диалога — обычный и открытый через
  `useDialogService` — давали дубликат DOM-id, и `<label for>` уводил на чужой инпут (axe:
  `duplicate-id-active`). Атрибут снят целиком: `GrFormField` и так генерирует уникальный `id`, а поле читает его из
  контекста, — хардкод был чистой избыточностью.
- **`GrPromptDialog` открывался с фокусом на панели, а не в поле.** Диалог существует ровно ради ввода, а требовал
  лишнего `Tab`. Фокус ставит содержимое после отрисовки: проп `initialFocus` у
  `GrModal` тут не годится — элемент рождается внутри поддерева диалога, и возврат его же пропом наверх замыкает рендер
  в цикл. Заодно `Enter` в однострочном поле теперь подтверждает (в многострочном остаётся переводом строки).
- **`GrTextarea` со `showCount` сажал атрибуты потребителя на обёртку счётчика.** `data-*`, `aria-*`
  и `name` попадали на `div`, а не на само поле, — то есть набор атрибутов зависел от того, включён ли счётчик.
  Добавлены `inheritAttrs: false` и `v-bind="$attrs"` на `<textarea>` в обеих ветках.
- **`GrModal` без слота `#title` оставался вовсе без доступного имени.** HeadlessUI связывает
  `aria-labelledby` только при наличии `DialogTitle`, а `aria-label` компонент не выводил ничем:
  диктор объявлял безымянный «диалог», axe ловит это правилом `aria-dialog-name` (critical). Гейт axe дефект не видел —
  он сканирует превью демо, а модалка в них закрыта; проверено в браузере. Появился проп `ariaLabel`, фолбэк на
  обобщённое имя из локали (новый ключ
  `gr.modal.title`) и dev-предупреждение при первом открытии безымянного окна. `GrDialog` получил тот же проп и всегда
  передаёт имя вниз: с `showHeader: false` и без `title` он был безымянен ровно так же. Демо витрины исправлены — все
  четыре открывали окно без имени.
- **`useDialogService`: `close()` и `closeAll()` шли мимо завершения заявки.** «Завершить диалог» было реализовано
  трижды и по-разному: кнопка в хосте звала `finish()`, `close()` промиса резал очередь напрямую, `closeAll()` разбирал
  её `pop()`-ом. Следствия: закрытие через промис **не обрывало in-flight `onConfirm`** (`AbortController` жил внутри
  `finish()`), а `closeAll()`
  резолвил промисы задом наперёд при заявленном FIFO. Теперь путь один и идемпотентный:
  флаг завершения живёт на самой заявке (`store.ts`), демонтаж (подписка на внешний `signal`,
  `abort()`) выполняется при смене головы очереди — кем бы заявка ни была завершена. Заодно
  `handleConfirm` сверяется с «диалог ещё мой» **до** записи `loading`: за время `await` заявку мог завершить
  `ctx.close()`, и флаг уезжал уже в состояние следующего диалога.
- **`useDialogService`: готовый синглтон `dialogService` всегда открывал диалоги без i18n и без
  `GrConfigProvider`.** Он создаётся на импорте модуля, вне `setup`, где `inject` не работает:
  захваченный контекст был пуст навсегда, и «удобный вариант» из доки молча показывал английские строки и дефолтный
  размер. Теперь синглтон берёт контекст последнего вызова `useDialogService()`
  из `setup`; при полном отсутствии контекста dev-сборка предупреждает. Точный ответ по-прежнему за вызовом в `setup`
  или `setAppContext` — оговорка в доке.
- **`useDialogService`: `Esc` и клик по бэкдропу обрывали операцию на полпути.** Дока обещала, что во время async-
  `onConfirm` мягкое закрытие подавлено, — в коде этого не было. Теперь подавлено; кнопка закрытия в шапке остаётся,
  чтобы из окна с зависшим запросом был явный выход. Там же починены `defaults.cancelText`, который терялся в
  `mergeErrorDefaults`, и два расхождения доки с кодом: сервис в SSR **бросает ошибку**, а не работает вхолостую, и
  `closeAll()` теперь правда FIFO. Дока переехала из `README.md`/`README.ru.md` внутри папки компонента в
  `docs/components/GrDialogService.md`.
- **`GrModal`: снят недостижимый код различения источника закрытия.** Общий стек слоёв гасит Escape в capture-фазе на
  `window`, поэтому нажатие не доходит ни до `<Dialog>`, ни до `@keydown.capture`
  на его корне: ветка `closeReason === 'esc'` не могла выполниться ни при каком сценарии. Осталась одна проверка
  `closeOnBackdrop` — единственный оставшийся источник `@close` от HeadlessUI. Заодно убран `_dbg3.test.ts` — забытый
  отладочный файл, писавший дамп в `/tmp` и не содержавший ни одного `expect`.

### Changed

- **BREAKING. `@headlessui/vue` is no longer a peer dependency.** The modal family (`GrModal`, `GrDialog`,
  `GrConfirmDialog`, `GrPromptDialog`, `GrCommandPalette`, `GrDrawer`, `GrImageViewer`) runs on the package's own
  primitives: `useFocusTrap` for the trap, `useInertOthers` for the background, `useOverlayLayer` for Esc order and
  focus return — all of which the package already owned — plus Vue's own `<Transition>`. **Remove the dependency from
  the application:** `yarn remove @headlessui/vue`. Nothing changes in the components' API.

  The reason is not the bundle — the dependency was `external` and never shipped inside `dist` — but ownership: the
  focus behaviour of every dialog in the package was decided by a library we did not control and, worse, did not test.
  All eight test files of the family mocked `@headlessui/vue` away, so the trap, `initialFocus`, focus restore,
  `aria-modal` and `aria-labelledby` were being checked against a stub. The mocks are gone and the tests now assert real
  markup, plus a new e2e gate opens a window for real and runs axe, Tab and Esc against it.
- **`GrModal` names itself through its own context.** `#title` and `#description` (and `GrDialog`'s header deeper in the
  tree) receive their ids from the window and only report that they rendered, which is what `aria-labelledby` and
  `aria-describedby` are built from. Two titles on one window now warn in dev — previously the second one silently lost.
- **A click on the backdrop closes a window only if it started there.** Selecting text inside the panel and releasing
  the button past its edge used to close the window together with the selection. Same for `GrDrawer` and
  `GrImageViewer`.
- **`useScrollLock` handles iOS.** `overscroll-behavior: contain`, a `touchmove` guard outside the overlay's own
  scrollable areas and scroll-position restore — the part of the lock that used to come from the removed dependency.
  Without it the page behind an open window starts rubber-banding on iOS Safari, and that is only visible on a device.
- **BREAKING. `GrImageViewer`: `zIndex` → `zIndexVar`.** The escape-hatch takes the name of a CSS variable instead of a
  raw number, exactly like `GrLoading` and `useFloating`; the default is still `--gr-z-modal`. The package no longer has
  two different ways of setting a layer.
- **BREAKING. `GrLoading`: `zIndex` → `zIndexVar`, fullscreen moved onto the scale.** The fullscreen overlay sat on
  `z-50` — below the whole layer scale, so a modal (`1100`) covered the loader that was supposed to block it. It now
  uses `z-[var(--gr-z-loading)]`, and the escape-hatch takes the name of a CSS variable instead of a raw number, the
  same shape `useFloating` uses. `zIndex: number` is gone from both the component and the `v-loading` options; the
  inline mode keeps `z-10` — that is ordering inside its own container, not a global layer. With this the package has no
  off-scale layers left, and the deviations table in `docs/z-index.md` is empty.
- **`GrLoading` takes its default caption from the locale.** `'Loading...'` was hard-coded while
  `gr.loading.defaultText` existed — and was tested — in all three locales, so a Russian user read English. Passing
  `text` still wins, and an empty string still removes the caption.
- **BREAKING. `GrIcon` is decorative by default.** It now sets `aria-hidden="true"` itself and drops it only when
  `label` is given. Previously the semantics were left entirely to the caller, and the attribute was written by hand in
  22 places inside the library — forgetting it once is enough for a screen reader to announce the `<title>` baked into
  an SVG. Those redundant attributes were removed; a caller that needs the old behaviour can still pass
  `aria-hidden="false"`, since a fallthrough attribute wins over the component's own binding.
- **BREAKING. `GrDropdown`/`GrDropdownMenu`: `align` → `placement`, `width` — CSS-длина.** Вместо трёх вариантов «только
  снизу» — любое размещение floating-ui плюс `offset`; переворот при нехватке места работал и раньше. `width` перестал
  быть строкой tailwind-шкалы (`width="48"` → `w-48`) и принимает CSS-длину: число трактуется как пиксели, строка идёт
  как есть, `auto` отдаёт ширину контенту. Строка без единиц теперь означает пиксели и в dev-сборке ругается — чтобы
  прежние `width="48"` не превратились молча из 192px в 48px. `GrDropdownMenuAlign`/`GrDropdownMenuWidth` удалены: типы
  берутся у владельца API.
- **`GrLink` с `external` теперь рисует иконку.** Раньше её приходилось вкладывать в слот руками (так и было сделано в
  витрине). Вид существующих внешних ссылок изменится — вернуть прежний можно пропом `:external-icon="false"`.
- **`GrImageViewer` renamed the `switch` event to `change`.** The old name came from Element Plus and matched nothing
  else in the package (`update:*` / `change` / `sortChange`). The payload is unchanged — the new frame index.
- **`GrFormFile` no longer emits `validation`.** It carried exactly the same payload as
  `update:errors`; the remaining channel is `update:errors`, now backed by a real `errors` prop, so
  `v-model:errors` reads as well as writes.
- **`gr.dataTable` sort keys replaced.** `sortBy` / `sortedAsc` / `sortedDesc` (sentences with a
  `{column}` placeholder) are gone; the hint is now column-agnostic — `sortAsc` / `sortDesc` /
  `sortNone`. Applications that overrode the old keys need to move their text over.
- **`@feugene/unocss-preset-granular` bumped to `^0.7.0`** (peer and dev), which adds the
  `undeclared-dependency` diagnostic to `granular doctor` — the same defect class as above, but checked against the
  built `dist` rather than the sources. It sees what source analysis cannot:
  an edge that only exists because the bundler routed it through a shared chunk.

  Wired in as a second gate: `granular.options.mjs` + `yarn doctor`
  (`components: 'all'`, `--strict`), run in CI right after the build. It is complementary, not a replacement — the unit
  gate catches *surplus* declarations, which leave no trace in `dist` and are therefore invisible to `doctor`. A run
  over all 61 components reports zero findings.

  The dependency criterion is now normative upstream (`docs/SPEC.md` §4.1): the edge is "the built code imports another
  component's directory and something renders from it" — which also covers a lazy `import()`, previously invisible to
  the unit gate and now recognised by it. The converse is explicit too: importing a constant, a type or a composable is
  **not** a dependency, and declaring it ships the donor's entire CSS and safelist to every consumer.

## [v0.14.0] 2026-08-05

### Added

- **New `GrPopover`** — an anchored, non-modal overlay holding whatever content you give it: a short form, settings, a
  confirmation. Until now that role was forced onto `GrDropdown`, which hard-codes
  `role="menu"`, `aria-haspopup="menu"` and roving focus over items — the wrong semantics for a form.

  The primitive owns positioning, the overlay layer and dismissal; the keyboard pattern *inside* the panel stays with
  the consumer, which is why `role` is a prop (`dialog` by default, plus `menu`,
  `listbox`, `grid`, `group`, `none`). `GrMenu` / `GrContextMenu` / `GrColorPicker` are meant to be built on it.

  Props: `open` (optional — without it the component manages its own state), `placement`, `offsetPx`,
  `size`, `role`, `ariaLabel` / `labelledBy`, `trigger` (`click` | `manual`), `closeOnEsc`,
  `closeOnClickOutside`, `closeOnContentClick`, `autoFocus`, `teleportTo`, `contentClass`,
  `disabled`. Slots: `#trigger` (receives `triggerProps` to bind on a real focusable element) and
  `#content` (receives `close`). Exposes `open()` / `close()` / `toggle()`.

  **Accessibility.** The trigger gets `aria-haspopup` / `aria-expanded` / `aria-controls`; the panel is a `dialog` with
  a required accessible name and `tabindex="-1"`. Esc closes the topmost layer of the shared overlay stack, so a popover
  opened inside a modal closes itself rather than the modal; focus returns to the trigger only if it was still inside
  the panel when it closed. **There is deliberately no focus trap** — Tab must be able to leave a non-modal layer,
  otherwise it strands the user on a page that was never blocked. `autoFocus` moves focus to the panel itself, not to
  the first control inside: focusing an input on the user's behalf is the content's decision.

  A click inside the panel does **not** close it by default (`closeOnContentClick: false`) — with a form inside, the
  first field would otherwise dismiss it.

### Fixed

- **File validators no longer hard-code English.** All six returned a fixed English `message` and offered no other
  channel, so a Russian app displayed `File "photo.png" does not match accept="…"`
  and could do nothing about it. Every issue now carries `i18nParams` (and, where needed, an explicit
  `i18nKey`), and `resolveFileValidationMessage(issue, t)` builds the text. The key is derived from
  `code` — `gr.fileValidation.<code>` — so a new built-in validator is localised by adding one string.

  **Not a breaking change**: `message` stays required and is still the fallback, so a consumer's own validator keeps
  rendering unchanged. English strings are byte-identical to the previous `message`, so behaviour without i18n is
  untouched.

  Fixed along the way: `GrFormFile` printed `photo.png: File "photo.png" …` — the built-in messages already name the
  file, so the prefix is now added only for messages that do not (detected by the absence of a `fileName` param, not by
  substring matching).

- **`GrDataTable` sort labels are translatable.** Three English strings (`Sort by …`) were baked into the component and
  read out by screen readers in English regardless of the app's language.

- A gate (`src/i18n/__tests__/localeCompleteness.test.ts`) now checks that `ru`/`es` cover every `en`
  key, carry no orphans, use the same placeholders, and that every plural block has an `other` branch. A missing
  translation used to be invisible: `t()` silently returned the English fallback.

- **Utilities the components used but that never produced CSS.** `presetMini` does not ship
  `animate-*`, `space-*`, `divide-*`, `backdrop-*` or the `text-transform` family, so for anyone whose `uno.config.ts`
  followed `docs/installation.md` those classes stayed in the markup with no rule behind them: spinners did not spin,
  list dividers were not painted, `GrDropdownMenu` headers were not upper-cased. The build succeeded and the tests were
  green — the showcase kept the missing rules in its own config and so hid the defect.

  Fixed upstream rather than by rewriting component markup: `@feugene/unocss-preset-granular` now bundles the gap-fill
  rules (0.6.1), and the two remaining families were added to
  `@feugene/unocss-mini-extra-rules` 0.4.0 — `typographyRules` plus a divider **colour** built on presetMini's own
  `colorResolver`, so `divide-<colour>` accepts exactly what `border-*` does. The package now requires the preset
  `^0.6.2`.

  **Visible change**: `GrDropdownMenu` headers are upper-cased (the `uppercase` prop defaults to
  `true` and finally applies), and dividers in `GrList` / `GrDropdownMenu` take `--gr-brd` instead of the
  tailwind-compat default. 18 visual baselines re-recorded.

  A gate (`src/__tests__/documentedConfig.test.ts`) now runs every safelisted class — and every
  `animate-*` / `space-*` / `divide-*` / `backdrop-*` literal found in component sources — through the **documented**
  consumer config. A mismatch between "how the showcase builds" and "how a consumer builds" is invisible to every other
  check.

### Added

- **Plural-ready messages, on `@feugene/fint-i18n` 0.6.0.** Plural forms live in the bundled dictionaries as objects
  keyed by CLDR category (`one`, `few`, `many`, `other`) or exact value (`=0`), and components pass the count under both
  conventional names (`n` for fint-i18n and vue-i18n, `count` for i18next).

  **Selecting the form, and formatting numbers, dates and currency, stay with the application's translator.** The
  package deliberately implements none of it: a second `Intl` inside a UI library would eventually disagree with the
  app's own rules. With no translator installed a component renders its built-in English fallback as-is — one form,
  unformatted.

  Russian is why the dictionaries carry four forms: `one`/`other` is not enough — `21` falls into
  `one` and `11` into `many`, so the rule does not reduce to the last digit. Spanish carries `many`
  too, the category it uses for millions. Verified end to end against a real `fint-i18n` instance, not a mock adapter —
  which is how the 0.5.0 syntax change was caught before release.

- **`te()` is used when the adapter provides it.** Whether a translation exists was previously inferred from
  `t(key) === key`, which lies on dictionaries of codes and identifiers whose value equals its own key: such a
  translation counted as missing and was replaced by the built-in English fallback. Adapters without `te()` keep the old
  heuristic.

- **`yarn check:messages`** — the dictionary checker shipped with `fint-i18n`. It verifies that the three locales agree
  on keys and that every set of plural forms covers the CLDR categories its locale actually uses, which no runtime can
  report: a missing category falls back silently.

- **`prefers-reduced-motion` respected package-wide.** Support existed in exactly one place (`GrSkeleton`) against 78
  `transition-*` utilities, 7 `animate-spin`, the `<transition>` wrappers of six overlays and three component-level
  `@keyframes`. A single clamp in `styles/base.css`
  (mirrored in `preflight.css`) now covers all of them — plus code not written yet.

  **The `motion-safe:` approach was rejected on evidence, not taste**: under `presetMini` the
  `motion-safe:` / `motion-reduce:` variants generate **no CSS at all** (verified against the generator). Spread across
  85 call sites it would have produced the package's classic silent bug — class present, CSS absent, animation still
  playing. A library ships *classes*; the consumer's config compiles them, so an accessibility contract cannot depend on
  which variants that config happens to enable.

  Durations collapse to `0.01ms` rather than `none` so `transitionend` / `animationend` still fire — with `none` a
  listener would wait forever and strand the UI mid-state. Delays are zeroed too.

  Spinners do **not** freeze at a random angle: with no `animation-fill-mode` they return to
  `transform: none`, i.e. a clean static icon (verified in a browser under emulated `reduce`). No replacement pulse is
  introduced — any infinite animation is motion the user asked not to see.

- **`GrToaster`'s progress bar is hidden under reduced motion.** It is the one animation the global clamp gets wrong:
  `animation-fill-mode: forwards` pins it at the final `scaleX(0)` frame instead of reverting, so the timer would read
  as expired while the toast is still on screen. Auto-dismiss is driven by a JS timer and is unaffected; the element is
  already `aria-hidden`.

- **`docs/motion.md`** — the motion contract, why the global block, per-animation behaviour and the rule for new
  components.

- A gate (`src/__tests__/reducedMotion.test.ts`) checks the block's presence and contents, that every component
  `@keyframes` is either handled or recorded as clamp-safe, and — closing a long-standing hole — that `base.css` and
  `preflight.css` stay **synchronised**, which until now rested on a comment alone.

- **`size` on the nine components that lacked it** — `GrTextarea`, `GrTabs`, `GrPagination`,
  `GrTable`, `GrDataTable`, `GrTree`, `GrProgressBar`, `GrTooltip`, `GrFormFile`, `GrFileUpload`. The scale
  (`xs | sm | md | lg`) and the provider were already package-wide; these components simply were not wired to them, so
  `<GrConfigProvider size="sm">` scaled a `GrInput` and left the
  `GrTextarea` beside it untouched — the form fell apart visually.

  **`size="md"` renders exactly as before** for every one of them: the prop adds steps, it does not restyle existing
  markup.

  Composite components pass the resolved size down instead of hardcoding it: `GrPagination` to its
  `GrButton`/`GrSelect`, `GrDataTable` to `GrTable` and the sort icons, `GrFormFile` to its buttons and icons,
  `GrFileUpload` to its `GrProgressBar`. `GrTree` expresses the size through its existing `--gr-tree-*` custom
  properties rather than a second, competing channel.

  A gate (`src/__tests__/componentSize.test.ts`) checks the rendered DOM — not that the composable was called — for
  every component declaring `size` in its `defaults.ts`, and takes that list from the filesystem so the next such
  component cannot drop out of the scale silently.

  **The gate immediately found four more**, left as-is because each needs a separate look-and-feel decision and none is
  in scope here (recorded in `AUDIT.md` and `docs/sizes.md`): `GrBadge` never sees the provider's global `size`; `GrKbd`
  is typed on four steps and implements two; `GrRadio`
  and `GrRadioGroup` scale only in `variant="button"`.

- **`docs/sizes.md`** — the scales, the resolution order, who is on the scale and the deviations.

### Changed — BREAKING

- **`GrTable` and `GrDataTable`: `density` replaced by `size`.** The prop did exactly and only what
  `size` should do — set the font scale — so keeping both would have meant two props for one axis. Migration is 1:1 and
  mechanical:

  ```diff
  - <GrDataTable :rows="rows" density="compact" />
  + <GrDataTable :rows="rows" size="sm" />
  ```

  `compact` → `sm`, `regular` (the default) → `md`; `xs` and `lg` are new. In `GrDataTable` the size now also drives
  cell padding, sort-arrow and checkbox metrics, which `density` never touched.
  `GrTableDensity` is no longer exported. `GrListItem` keeps its own unrelated `density` — there it means padding, not
  type scale.

- **Four deprecated aliases removed** — each one would have been permanent after 1.0:

    - **`--pb-*` → `--gr-progress-*`** (`GrProgressBar`). It was the package's only non-canonical token prefix.
    - **`--gr-destructive*` merged into `--gr-danger*`.** Two semantically identical roles had drifted apart: in the
      dark theme `danger` was `#f87171` while `destructive` was `#ef4444`. **This uncovered a contrast bug**:
      `GrBadgeWrap` painted its background from `--gr-danger` and its text from `--gr-destructive-fg`, giving white on
      `#f87171` — **2.77:1**, below the 4.5:1 AA threshold. On the merged role it is **6.45:1**.
    - **`.theme-dark` selector removed.** The theme is expressed by `[data-theme='dark']`; `useTheme`
      no longer toggles the class. `.dark` stays — not as a deprecated alias but as interop with the Tailwind/UnoCSS
      class strategy, and the docs now say so.
    - **`GrAlert` no longer accepts `variant="light"`.** The alias is gone, and with it
      `normalizeGrAlertVariant` and `GrAlertVariantInput` — without an alias the normaliser was an identity function.

  A gate (`src/__tests__/deprecatedApi.test.ts`) fails if any of the four comes back.

- **`GrDataTable`'s `sort-change` event is now `sortChange`.** It was the only kebab-case emit in the package against
  seven camelCase ones (`visibleChange`, `nodeClick`, `stateChange`, …), so in a template the two read as different
  kinds of event and the IDE offered no help.

  **Template listeners keep working**: `@sort-change` compiles to the `onSortChange` prop, which both spellings resolve
  to. Only a literal `onSort-change` prop in a render function breaks. For the same reason there is deliberately **no
  transitional double emit** — emitting both names would resolve to the same handler and call it twice.

  A gate (`src/__tests__/emitNaming.test.ts`) fails on any new kebab-case emit.

- **`GrSelect` and `GrAutocomplete` are generic over their value.** `GrSelectModelValue` and
  `GrAutocompleteModelValue` used to be `string | string[]`, so a numeric id — the common case — required `String(id)`
  on the way in and back. Now:

  ```vue
  <GrSelect v-model="userId" :options="users" />   <!-- userId: number -->
  ```

  The string case is unchanged and needs no type argument (`TValue` defaults to `string`), so existing code keeps
  compiling. Two defects surfaced and were fixed along the way:

    - the native `<select>` carries only strings in the DOM, so `@change` emitted `"42"` instead of
      `42` — the value is now decoded back through the option list;
    - emptiness was tested with a falsy check, so `0` counted as "nothing selected". It is now an explicit
      `undefined | null | ''` test.

  Values are constrained to `string | number` (`GrSelectValue`): they must survive the round trip through a DOM string.
  Object models would need a key extractor and are out of scope. Custom values (`allowCustomValue`) are typed text and
  therefore stay strings.

- **One `size` scale for the whole package.** There were five incompatible ones, so
  `<GrConfigProvider size="xs">` could not apply to half the package and `size="xl"` compiled against one component and
  failed against its neighbour. Now:

    - **controls** use `GrComponentSize` (`xs | sm | md | lg`) — `GrIcon`, `GrKbd`, `GrLink`,
      `GrRating`, `GrSlider`, `GrStatistic` and `GrSwitch` gained `xs`, which is additive;
    - **overlays** use the new `GrOverlaySize` (`sm | md | lg | xl | full`) — `GrDrawer` gained `xl`,
      `GrCommandPalette` gained `sm` and `full`, also additive;
    - `GrAvatar.size` moves from a raw `number` to `GrComponentSize | number`. **This is the only real break, and it is
      source-compatible**: `size={40}` still renders 40 px, and the new default
      `md` is 40 px too, so nothing shifts. The number stays as an escape hatch — an avatar has always had an arbitrary
      diameter and there is no point breaking that for uniformity.

  `GrTextareaState`, `GrInputTagState`, `GrNumberInputState` and `GrTreeSelectState` are now aliases of one
  `GrControlState`; they were four independent copies of the same union, so a divergence would only have surfaced at
  runtime. A gate (`src/__tests__/sizeScale.test.ts`) fails on any component that declares its own scale or state again.

- **`GrConfigProvider` now reaches `GrIcon`, `GrKbd`, `GrLink`, `GrStatistic` and `GrAvatar`** — they had no
  `defaults.ts` and stayed outside the provider entirely.

- **`@headlessui/vue` and `@floating-ui/dom` moved from `dependencies` to `peerDependencies`** and are now `external` in
  the build, so they are no longer bundled into `dist`. Install them alongside the package:

  ```bash
  yarn add @feugene/granularity vue @headlessui/vue @floating-ui/dom
  ```

  Previously both were bundled **and** installed as runtime dependencies: an application already using HeadlessUI
  shipped two copies, and once the versions drifted, so did focus-trap behaviour. Nothing changes at the source level —
  the same components, the same API. `dist` drops from 890 KB to 797 KB of JavaScript (−93 KB):
  `chunks/useScrollLock-*.js` 51 KB → 1.6 KB,
  `chunks/useFloating-*.js` 48 KB → 4.5 KB.

### Added

- **`useOverlayLayer()` — one contract for overlay layering: Esc order, `inert`, restore focus.**
  Exported from the root barrel and as `@feugene/granularity/composables/useOverlayLayer`.
  `useDismissible()` stays as a narrow facade over it for non-modal popovers, so nothing built on it needs changing. The
  two internal stacks it replaces (`dismissStack`, `grModalTopStack`) are gone.

  They were **two registries of the same list** — every open overlay, in open order — answering two different questions:
  who gets Esc, and which modals to mark `inert`. Registries like that drift apart silently, and they had: **`GrDrawer`
  and `GrImageViewer` were in neither**, so a drawer opened over a modal never released focus to it, and a modal over a
  drawer never released focus either. Both are modal layers of the unified stack now and get `inert` for the first time.

  One list, but the two tops it yields are deliberately **different**: Esc goes to the last layer of *any* kind (a
  dropdown inside a modal closes itself first — that's what the user sees on top), while `inert` applies to modals below
  the last *modal* layer. Demoting a modal by any layer above it would send the window inert together with its own open
  dropdown and freeze it.

  The composable does **not** implement a focus trap, on purpose: HeadlessUI `Dialog` provides one for every modal-class
  overlay in the package, a second trap on top would only fight it, and a popover must not trap at all — Tab has to
  leave and close it. What is unified is focus **restore**:
  three hand-written implementations collapse into one rule — restore only if focus is still inside the layer when it
  closes. `GrDropdown`'s old heuristic ("restore if it was opened from the keyboard") missed in both directions: a
  mouse-opened panel never restored, and a keyboard-opened one stole focus back from wherever the user had moved it.

  Gate: `src/__tests__/overlayLayer.test.ts`.

### Fixed

- **`GrDataTable`: `selectable` now works without `v-model:selected`.** There was no internal selection state at all —
  checkboxes rendered, took clicks and never got checked. Selection now has an uncontrolled mode, like sorting in the
  same component always had.
- **`GrFormFile`: the remove button in multiple mode had no label.** `{{ removeText }}` (the raw prop, `undefined` by
  default) was rendered instead of `{{ resolvedRemoveText }}` — an empty button on screen and a button with no
  accessible name for screen readers.
- **`GrRadioGroup` implements the radio pattern's keyboard contract.** Arrows (`↓`/`→`, `↑`/`←`) move the selection and
  the focus around the group, and the group is a single `Tab` stop via roving tabindex. Previously every radio was its
  own tab stop and arrows did nothing.
- **`GrTabs` no longer drops out of the tab order entirely.** With a `modelValue` matching no tab — an empty initial
  value, an async list, a removed active tab — every tab got `tabindex="-1"` and the whole tablist became unreachable by
  keyboard, silently. Roving tabindex now always keeps exactly one tab reachable.
- **`GrCollapse`: a collapsed panel is now `inert`.** Collapsing was purely visual (`grid-rows-[0fr]`), so links and
  buttons inside closed sections were still focusable — focus travelled into a zero-height invisible area — and screen
  readers read every closed section, which directly contradicted `aria-expanded="false"` on the trigger.
- **`GrDropdownMenuItem` declares `role="menuitem"`.** The panel declares `role="menu"`, which makes children
  presentational: without the role a screen reader announced neither the item nor its position in the menu. `GrDropdown`
  's own keyboard navigation also looks for `[role="menuitem"]`.
- **`GrFormField` now really labels every control it wraps.** The contract — label association,
  `aria-describedby` carrying the error text, `aria-invalid` — was honoured by 7 of 13 controls; for the rest
  `<label for>` pointed at nothing, so clicking the label focused nothing and the error message was linked to no field
  at all. `GrCheckbox`, `GrSwitch`, `GrRadioGroup`, `GrNumberInput`,
  `GrFormFile` and `GrFileUpload` now read the field context.

  Where the widget is a labelable element (`GrSwitch`'s `<button>`, `GrNumberInput`'s and
  `GrFileUpload`'s `<input>`, `GrFormFile`'s upload button) it takes the field's `id`, so clicking the label focuses it.
  Where it is not — `GrCheckbox` (`span[role="checkbox"]`) and `GrRadioGroup`
  (`div[role="radiogroup"]`) — the name arrives via `aria-labelledby` pointing at the label, which is why the context
  gained a `labelId`. Notably, `GrCheckbox` takes the id on the widget itself rather than on its hidden native input:
  that input is `aria-hidden` and outside the tab order, so a label pointing at it led into an invisible element.
- **Escape now closes the overlay you actually see.** A dropdown, select, tree-select, tooltip or autocomplete panel
  opened **inside a modal** used to close the modal instead of itself: modals listened on `window` in the capture phase
  and swallowed the event with `stopImmediatePropagation`, while the floating components listened on `document` in the
  bubble phase and never got their turn. All dismissible overlays now share one stack, so Escape addresses the topmost
  layer and the next Escape closes the one below. `GrImageViewer` joined the stack too — its local handler meant that a
  viewer opened over a modal closed the modal.
- **`GrImageViewer` no longer crashes server-side rendering.** A `watch(…, { immediate: true })` ran
  `new Image()` synchronously during `setup`, regardless of `modelValue` — so any SSR page that merely *contained* a
  closed viewer died with `ReferenceError: Image is not defined`. Neighbour preloading now starts in `onMounted`.
- **`GrCollapseItem` and `GrSegmented` build their ids with `useId()`** instead of `instance.uid`. The old counter is
  application-wide: it keeps growing between requests on the server and restarts from zero on the client, so `id`,
  `aria-controls`, `aria-labelledby` and the hidden input's `name`
  silently diverged on hydration.
- **`GrCommandPalette` resolves the platform in `onMounted`.** `isAppleDevice()` used to be read during the first
  render, which would make the server print `Ctrl` and a macOS client `⌘`. In practice the mismatch was unreachable —
  HeadlessUI withholds modal content from SSR entirely — so this is hardening, not a user-visible fix.
- **Granular imports no longer lose colours, shadows and focus rings.** `GrSelect`, `GrSlider`,
  `GrAutocomplete`, `GrDropdown`, `GrDrawer` and `GrRating` declared only part of their utility classes in `safelist`;
  the rest lived as string literals in `*Styles.ts` helpers, which the bundler hoists into the shared `dist/chunks/` —
  outside the `dist/components/<Name>/**` directory the preset scans. A consumer importing
  `@feugene/granularity/components/GrSelect` alone got a select with no focus ring and a panel with no background or
  shadow. The showcase hid the defect, because neighbouring components on the page generated the same utilities.

- **`typecheck` is green again** — 14 `vue-tsc` errors in the package's own test suite are fixed (`GrNumberInput`,
  `GrDataTable`, `GrDropdown`, `GrRadioGroup`, `GrSegmented`, `GrSlider`,
  `GrTreeSelect`). Since `.d.ts` files are emitted by `vue-tsc` at build time, a red typecheck was a standing risk to
  the published types.

### Changed

- **CI now runs `lint` and `typecheck`** (job `quality-granularity`), and both gate every build and publish job. `lint`
  had been commented out and `typecheck` never ran at all.

### Added

- **A form-control contract, and `useGrFormControl()` to implement it** — `disabled`, `readonly`,
  `invalid`, `required`, `ariaLabel` merged from the control's own props and the surrounding
  `GrFormField`, plus `focus()`/`blur()` exposed. `GrFormField` gained a `readonly` prop, so
  "read-only form" no longer means reaching into every control — or abusing `disabled`, which also stops the value from
  being submitted.

  **All 15 controls now honour it** — `GrInput`, `GrTextarea`, `GrNumberInput`, `GrSelect`,
  `GrAutocomplete`, `GrTreeSelect`, `GrInputTag`, `GrCheckbox`, `GrRadioGroup`, `GrSwitch`,
  `GrSlider`, `GrRating`, `GrSegmented`, `GrFormFile`, `GrFileUpload`. Before this, `readonly`
  existed on 3 of them, `required` on 2, `focus()` on 3 and `blur()` on none. All props are additive — nothing breaks.
- **Tests for the seven components that had none** — `GrResponseErrorBanner`, `GrTabPanels`,
  `GrDropdownMenu`, `GrDivider`, `GrKbd`, `GrIcon`, `GrButtonGroup` (+52 tests). Every component in the package now has
  a test file. The error-banner suite exercises the parser chain directly, without mounting: what is hard there is
  parser order and priorities (abort stops the chain, field errors outrank the status code, the core preset makes no
  backend-specific assumptions), not rendering three paragraphs.
- **`useDismissible()` and `useFloating()` are public** — root barrel and
  `@feugene/granularity/composables/*` subpaths. A consumer's own popover or menu can now be built on the same
  positioning engine and, crucially, register in the same dismiss stack; otherwise its layers drift apart from the
  library's on Escape.
- **SSR gate in CI** (`test-playground-ssr`). The stand grew a third page covering the components where the risks
  actually were — `GrImageViewer`, `GrCommandPalette`, `GrCollapse`, `GrSegmented`,
  `GrDrawer`, `GrTreeSelect`, `GrSlider`, `GrTree`, `GrDataTable`, `GrFileUpload`, `GrToaster` — and asserts both a
  clean `renderToString` and a hydration free of mismatches.
- **Safelist gate** (`src/__tests__/safelist.test.ts`): every utility class written as a string literal in a component's
  `.ts` helpers must be declared in that component's `safelist`. The rule is deliberately stated over sources rather
  than over `dist` — a gate reading `dist` would stay green only until the next change in chunking.

## [v0.13.0] 2026-07-28

### Changed

- **`GrButton`, `GrInput` and `GrBadge` no longer declare their configurable props' defaults in
  `withDefaults`** — the defaults moved into the resolvers, which is what makes `GrConfigProvider`
  able to override them. Rendering is unchanged, but reading such a prop from the outside (through a template ref or a
  wrapper) now yields `undefined` until it is explicitly passed: `variant`,
  `tone`, `size`, `square` on `GrButton`; `size`, `clearable` on `GrInput`; `tone`, `size`, `radius`
  on `GrBadge`; `size`, `variant`, `underline`, `clearable` on `GrSelect`; `size`, `clearable` on
  `GrAutocomplete`; `size`, `variant` on `GrSegmented`; `size` on `GrNumberInput`, `GrSlider`,
  `GrRating`, `GrSwitch` and `GrRadioGroup`.
- **Unified CSS token namespace under `--gr-*`.** The previously unprefixed shadcn-style semantic roles (`--bg`, `--fg`,
  `--card`, `--muted`, `--brd`, `--ring`, `--primary`, `--secondary`, `--accent`,
  `--destructive`, `--chart-*`, `--sidebar-*` and their `-fg`/`-hover`/`-active` variants) could collide with the
  consuming app's own CSS variables. Every token now lives in a single `--gr-*` namespace with three layers
  (primitives → semantic roles → per-component tokens), defined in the themes (`light.css`/`dark.css`) and formulas
  (`tokens.css`); all components reference only `--gr-*`. Theme customization is done via `--gr-*` (e.g. set
  `--gr-primary` to re-theme).

### Added

- New `GrConfigProvider` — one place for the design system's global defaults, provided to the whole subtree via
  `provide`/`inject` and rendered transparently (`display: contents`), so it never affects layout. Providers nest: a
  child merges over its parent down to the individual prop, which lets you set a global rule and override one detail
  deeper in the tree.
    - `size` — the default size for nested form controls. Read by `GrButton`, `GrInput`, `GrSelect`,
      `GrAutocomplete`, `GrNumberInput`, `GrSegmented`, `GrSlider`, `GrRating`, `GrSwitch`, `GrRadio` and
      `GrRadioGroup`. `GrBadge` deliberately opts out — a badge is a display element and should not grow with the
      surrounding controls; its size is configurable per component instead.
    - `componentDefaults` — default props keyed by component name, e.g.
      `{ GrButton: { variant: 'outline' } }`. The set of configurable props is deliberately closed —
      `GrButton` (`variant`, `tone`, `size`, `square`), `GrSelect` (`size`, `variant`, `underline`,
      `clearable`), `GrInput` and `GrAutocomplete` (`size`, `clearable`), `GrSegmented` (`size`,
      `variant`), `GrBadge` (`tone`, `size`, `radius`), and `size` alone for `GrNumberInput`,
      `GrSlider`, `GrRating`, `GrSwitch`, `GrRadio` and `GrRadioGroup` — so the config can shape appearance but never a
      `modelValue` or an event handler, and a typo in a component or prop name is a type error.

      Each component declares its own contract in its folder (`GrButton/defaults.ts`) and registers it through
      declaration merging, so `GrConfigProvider` knows nothing about concrete components. The practical consequence for
      consumers: `componentDefaults` is typed with exactly the components you imported — pull in only `GrButton` and
      `GrBadge`'s types never enter your project.
    - `i18n` — the translation adapter, passed down without a manual `inject`. Only provided when given explicitly, so
      it never shadows an adapter the application installed higher up.

  Imperative dialogs inherit the config too. `useDialogService` mounts its host outside the component tree, where
  `inject` can only see `app.provide()` values, so the service captures the config at the point where
  `useDialogService()` is called and the host hands it to the dialog. Capture happens in
  `useDialogService()`, not in `confirm()` — obtain the service in `setup` of a component inside the provider; a
  module-level singleton has no tree to read. Priority inside a dialog: call options →
  `useDialogService(defaults)` → provider → component defaults. Teleported overlays (`GrModal`,
  `GrDrawer`, the `GrSelect` panel) were never affected: they keep the component chain.

  A local prop always wins over the config; the config wins over the component's own default. To make a prop
  configurable a component resolves it through `useGrComponentSize()` /
  `useGrComponentProp()` and declares its `withDefaults` entry as `undefined` — otherwise Vue would substitute the
  default before the component ever looks at the config.
- `resolveGrConfig(source)` — reads the config where `inject` is unavailable (directives, imperative services,
  utilities): from an explicit context, from a source's `provides`, or from `inject` when an instance is active. Mirrors
  the existing `resolveGranularityI18n()`.
- `useGrComponentSize()` gained a `supported` option so a component can declare the size scale it actually implements
  (`GrSlider`, `GrRating`, `GrSwitch`, `GrLink` and `GrStatistic` have no `xs`). A size coming from the provider that
  the component does not support is ignored in favour of the component's own default instead of silently producing an
  element with no size classes.
- New `GrCommandPalette` — a ⌘K command palette: a modal search over the application's commands with groups, icons,
  per-command shortcut hints and keyboard navigation. Opens on a global hotkey (`hotkey`, default `mod+k` — Cmd on
  macOS, Ctrl elsewhere; pass `null` to drive it purely through
  `v-model`). Search covers a command's label, description, group and `keywords` synonyms; set
  `:filterable="false"` to hand filtering over to the owner via the `search` event with externally supplied `items` and
  `loading` (remote search). Slots `#item` / `#empty` / `#footer` for a custom command row, empty state and footer.
  A11y: the input is `role="combobox"`, the list is
  `role="listbox"` and the active command is pointed at with `aria-activedescendant`, so focus never leaves the search
  field (Arrow / Home / End / Enter). It renders inside `GrModal`, reusing its Esc stack, focus trap and body scroll
  lock; the pure parts — filtering/grouping (`filtering.ts`) and hotkey parsing/matching (`hotkey.ts`) — live in
  separate modules and are tested without mounting.
- New `GrRating` — a symbol rating scale for both collecting a score and displaying someone else's. Supports whole and
  half values (`allow-half`), reset on a repeated click (`clearable`), a hover preview of the score, `readonly` /
  `disabled`, an optional numeric caption (`show-text` +
  `format-text`), tones and sizes. The default symbol is an inline SVG star; pass any UnoCSS icon class through `icon`
  or take over rendering with the `#symbol` slot. A11y: the editable scale is a WAI-ARIA slider (`role="slider"` with
  `aria-valuemin`/`max`/`now`/`valuetext`, Arrow / Home / End), while `readonly` renders as `role="img"` with the score
  in its label — it is not a control, so it stays out of the tab order. Integrates with `GrFormField`.
- New `GrStatistic` — a large key metric with a caption: number formatting (`precision`,
  `group-separator`, `decimal-separator`), `prefix` / `suffix`, an icon, a value tone, a trend line (`trend` `up`/
  `down`/`flat` + `trend-text`) and a `loading` state that keeps the block's height so dashboards do not jump.
  Non-numeric values (`"2 h 15 min"`, `"—"`) are rendered as-is. Formatting is a pure exported function,
  `formatStatisticValue()`. Slots: `#icon`, `#title`, `#prefix`,
  `#suffix`, `#trend` and the default slot for the value itself.
- New `GrForm` — form validation orchestration on top of `GrFormField`. Takes a reactive `model` and declarative `rules`
  keyed by field name (`required`, `min`/`max`/`len`, `pattern`, `type` email/url, and custom/async `validator` with
  access to the whole model). `GrFormField` gained a `name` prop:
  inside a `GrForm` it auto-sources its error message and required marker from the form and triggers validation on
  blur — so the actual controls (`GrInput` / `GrSelect` / `GrAutocomplete` / …) need **no changes**, they keep reading
  `invalid` / `id` / `aria-describedby` from the field context as before. Validation triggers (blur / change / submit)
  are configurable per form and per rule; `submit` only fires when valid; validation scrolls/focuses the first invalid
  field. Imperative API via template ref: `validate()` / `validateField()` / `clearValidate()` / `resetFields()` /
  `scrollToField()`. Default messages (`gr.form.*`) are localized (en/ru/es) and overridable per rule.
- New `GrSlider` — a WAI-ARIA slider for picking a number or a range by dragging. Supports single value and `range` (two
  thumbs that never cross), `step`, `min`/`max`, tick `marks` with labels, a value tooltip (`show-tooltip` +
  `format-tooltip`), sizes (`sm`/`md`/`lg`) and `disabled`. Each thumb is `role="slider"` with `aria-valuemin`/`max`/
  `now` and full keyboard support (Arrow, PageUp/Down, Home/End); clicking the track moves and focuses the nearest
  thumb. Integrates with `GrFormField`.
- New `GrAutocomplete` — a WAI-ARIA *editable combobox* for type-ahead search over options. Unlike
  `GrSelect` (a select-only combobox with a button trigger), here the text `<input role="combobox">`
  itself is the combobox: the typed text is the search query and choosing an option fills the field. Features:
    - Local filtering (`filterable`, default on) with an optional custom matcher (`filter`).
    - Remote / async loading via a debounced `search` event (`debounce`, `minQueryLength`) plus an externally-controlled
      `loading` prop — the component renders the spinner and the loading / no-results / "type at least N characters"
      states, the consumer owns the data fetch.
    - Free-text values (`allowCustomValue`) — commit a value that is not in `options` with Enter.
    - `multiple` with removable **chips** before the input (Backspace on an empty query removes the last one), replacing
      `GrSelect`'s "a, b, c" string presentation for multi-select.
    - Full keyboard support with `aria-activedescendant` (Arrow / Home / End / Enter), `clearable`,
      `#option` / `#empty` / `#loading` slots, and `GrFormField` integration (`id` /
      `aria-describedby` / `aria-invalid` / `aria-required`).

  It reuses the shared floating/dismiss infrastructure (`useFloating`, `useEscapeToClose`,
  `vClickOutside`) and does not depend on `GrSelect`. The search/async concerns were split out of
  `GrSelect` deliberately: the two components implement different ARIA patterns (select-only vs. editable combobox) and
  merging remote loading, races and min-query handling into `GrSelect` would overload its focus/aria semantics.
- `GrAutocomplete` translations (`gr.autocomplete.*`: `loading` / `noResults` / `addOption` /
  `typeMore`) added to the `en` / `ru` / `es` locale payloads.

- **`GrToaster` action button.** `useToast().push` now accepts an optional
  `action: { label, onClick, dismissOnClick? }` — the toast renders a button in its body. By default a click runs
  `onClick` and dismisses the toast; `dismissOnClick: false` keeps it open (e.g. a "Retry"
  action on a sticky error). New exported type `ToastAction`.
- **`GrPagination` compact variant and page jumper.** New `compact` prop replaces the numbered page buttons with a
  "current / total" indicator for tight spots (mobile, table toolbars). New `show-jumper`
  prop adds a "go to page" input that jumps on Enter/blur, clamping the value to `[1, pageCount]`
  (label via `jumper-label` / the new `gr.pagination.jumpTo` string, localized en/ru/es).
- **`GrSelect` filtering, loading and tag mode (panel view).** New `filterable` prop shows a search box over the option
  list independent of `allow-custom-value` (with a `no results` state); `loading` +
  `loading-text` render a spinner instead of options for async option loading; `tags` renders a
  `multiple` selection as removable chips (with per-chip remove) instead of the "a, b, c" string. All three force
  `options-view="panel"` (impossible in a native `<select>`). New `gr.select.*`
  strings (`searchPlaceholder` / `loading` / `noResults` / `removeTag`), localized en/ru/es.
- **`GrTable` / `GrDataTable` sticky header, row selection and loading.** `GrTable` gained
  `sticky-header` + `max-height` (header stays visible on vertical scroll). `GrDataTable` gained
  `selectable` with a leading checkbox column and a "select all" header checkbox (model via
  `v-model:selected` by row key, with indeterminate state), plus a `loading` prop that swaps the body for a spinner row.
  Its built-in empty text is now localized (`gr.dataTable.*`, en/ru/es).

### Testing / infrastructure

- Added an end-to-end **accessibility (axe) + visual-regression (Playwright)** layer in `apps/showcase`
  (`e2e/`, scripts `test:e2e` / `test:a11y` / `test:visual`). It runs against every component's live demos, so each new
  component is covered automatically (the list is derived from the generated API contract).
    - **a11y:** `axe-core` scans each component's rendered preview (`[data-example-preview]`) and gates on `serious`/
      `critical` violations minus a recorded baseline (`e2e/a11y-baseline.ts`) — catching regressions, new components
      with a11y gaps and debt growth, while existing debt is tracked openly for burn-down. `color-contrast` is handled
      as a separate design-token track (the `--muted-fg`
      token). Manual-ARIA components (`GrSlider`, `GrAutocomplete`, `GrTabs`, `GrTree`, `GrDropdown`,
      `GrModal`) pass the gate clean.
    - **visual:** screenshots the "Live examples" region of a representative component set in both light and dark
      themes, with committed baselines, to catch unintended token/style drift.

## [v0.12.0] 2026-07-20

### Added

- New `GrKbd` — a `<kbd>` primitive for keys/shortcuts (`size="sm" | "md"`).
- New `GrDivider` — content separator: horizontal line, optional centered/aligned label, or `orientation="vertical"` for
  inline separation.
- New `GrTabPanels` / `GrTabPanel` — accessible companion to `GrTabs`: pass a shared `idBase`
  to both and the panels link to their tabs via ARIA (`role="tabpanel"`, `aria-labelledby`
  ↔ tab `aria-controls`). `GrTabs` gained an optional `idBase` prop for this.
- `GrFormField`: now auto-generates the control `id` (linked to the label) and provides a field context so `GrInput` /
  `GrSelect` / `GrTextarea` inside it receive `aria-describedby`
  (hint + error), `aria-invalid` and `aria-required` automatically — no manual `forId`. Added
  `hint` (+ `#hint` slot) and `required` (marker), and the error now uses `role="alert"`.
- `GrDataTable`: controlled sort via `v-model:sortKey` / `v-model:sortDir` and a
  `sort-change` event, plus an `externalSort` prop that disables internal sorting for server-side / URL-synced sorting.
- `GrNumberInput`: WAI-ARIA spinbutton semantics (`role="spinbutton"`,
  `aria-valuenow`/`min`/`max`) and keyboard support (Arrow to step, Home/End to `min`/`max`).
- `GrNumberInput`: locale-aware display formatting — `useGrouping` groups thousands via
  `Intl.NumberFormat` (with an optional `locale`), showing the grouped value when blurred and the raw value on focus for
  editing.
- `GrInput`: `clearable` (clear button), `showCount` + `maxlength` character counter,
  `passwordToggle` (show/hide password visibility) and a `readonly` state. Clear/show-password labels are localized and
  overridable (`clearLabel` / `passwordShowLabel` / `passwordHideLabel`).

### Changed

- `GrImageViewer`: decomposed the 822-line SFC into composables (`useZoomPan`,
  `useWheelGesture`, `useViewerKeyboard`) — behaviour unchanged, now testable in isolation.

### Fixed

- Overlay scroll-lock is now global and reference-counted (shared `useScrollLock`), fixing a LIFO bug where closing one
  modal out of order restored `<body>` scrolling while another was still open; it also compensates for scrollbar width
  so content no longer shifts. Reused across `GrModal`, `GrDrawer` and `GrImageViewer`.
- `GrDrawer`: now locks background scroll, participates in the shared Esc stack (Esc closes the topmost overlay across
  render trees), and SSR-guards its teleport (`:disabled` on the server).
  `GrImageViewer` teleport is SSR-guarded too.
- `GrNumberInput`: `min`/`max` are now clamped on manual input (on `change`), a leading `-`
  can be typed for negative values, and the caret no longer jumps to the end when editing the middle of a number; large
  values are no longer formatted in scientific notation.
- `GrSelect` (panel mode): implemented the WAI-ARIA combobox/listbox pattern — keyboard navigation (Arrow/Home/End,
  Enter to select, typeahead), `aria-activedescendant` active-option tracking, `aria-haspopup="listbox"` +
  `aria-controls`, and removed the invalid `aria-readonly`.
- `GrDropdown`: now keyboard-accessible — exposes `triggerProps` (with `aria-haspopup="menu"`,
  `aria-expanded`, `aria-controls` and `@keydown`) to bind on a real trigger button; the menu supports Arrow/Home/End
  navigation and returns focus to the trigger on close.
- `GrTree`: implemented the WAI-ARIA tree pattern — roving `tabindex`, Arrow navigation with expand/collapse
  (Left/Right), Home/End, Enter/Space to select, and `aria-selected` on nodes; the default branch-line color now derives
  from `var(--brd)` so it adapts to dark themes.

## [v0.11.0] 2026-07-19

### Breaking

- Renamed the CSS namespace across the whole package: design tokens `--ds-*` → `--gr-*`
  and component attributes `data-ds-*` → `data-gr-*`. No aliases or fallbacks — consumers overriding tokens or querying
  `data-ds-*` must migrate.
- Theme storage key renamed `fint-ds-theme` → `gr-theme` (legacy-key migration removed).

### Added

- `GrSidebar` / `GrSidebarItem`: collapsible navigation rail with `v-model:collapsed`, icon fallback and badges.
- `GrButton`: polymorphism via `as` / `href` (+ `target` / `rel` / `external`) — renders as
  `<a>` or a custom element; during `loading` the element now keeps focus via
  `aria-disabled` instead of the native `disabled` attribute.
- `vHotkey`: `scope: 'global' | 'element'` option (`element` listens on the bound element, firing only when focus is
  inside it).
- `GrSelect`: per-option `disabled` and a labeled clear-option.
- `GrDialogService`: now a public subpath export (`./components/GrDialogService`) and registered in the
  granular-provider.
- `useToast` / `GrToaster`: per-toast `timeoutMs` auto-dismiss with pause-on-hover/focus (WCAG 2.2.1) and a shared
  toast-state plugin.

### Changed

- Theme system: `[data-theme]` is the canonical selector (`.theme-dark` / `.dark` kept as deprecated aliases) and
  `useTheme` is the single runtime API (persistence, cross-tab sync,
  `prefers-color-scheme`).
- Reworked design tokens, themes and base/preflight styles.
- `GrTree`: accessible labels for the drag handle and expand/collapse controls.

### Fixed

- `GrSelect`: duplicate Vue keys for same-value options across groups; native `multiple`
  selection now reflects the bound model (`:selected` per option).

## [v0.10.0] 2026-07-17

### Changed

- Overlay positioning migrated to `@floating-ui/dom` via a new internal `useFloating`:
  `GrSelect` (panel), `GrDropdown`, `GrTooltip` and `GrTreeSelect` panels now flip/shift and stay within the viewport
  instead of overflowing.
- Tighter `@feugene/fint-i18n` integration and expanded locale coverage (en/es/ru).

### Fixed

- `GrPagination`: page-range edge cases.

## [v0.9.4] 2026-06-23

### Added

- `GrSelect`: support for grouped options. The `options` prop now accepts groups in the standard shape
  `{ label, options: [{ value, label }] }` (mixed with plain options). Groups render as native `<optgroup>` in
  `optionsView="native"`
  and as group headers in `optionsView="panel"`. Value lookups, selection, custom-value handling and filtering operate
  over the flattened option list; filtering hides empty groups. New exported types `GrSelectOptionGroup` and
  `GrSelectOptionOrGroup`.

## [v0.9.3] 2026-06-09

### Added

- `GrImageViewer`: toolbar slots (`#toolbar` / `#toolbar-actions`) now expose the real image metrics, so consumers no
  longer have to read the DOM manually (`querySelector` + `requestAnimationFrame`): `naturalWidth` / `naturalHeight`
  (intrinsic image size), `renderedWidth` / `renderedHeight` (actual on-screen footprint with `scale` applied), and
  `realScale` / `realScalePercent` (the true scale relative to the natural size). Natural size is read on `@load`, the
  fitted (`object-contain`) layout size is tracked via `ResizeObserver`, and the real scale is a derived `computed`
  (rotation-independent). Metrics reset on index / `urlList` change.
- `GrImageViewer`: zoom with the mouse wheel / trackpad pinch gesture. Scrolling up zooms in, scrolling down zooms out,
  smoothly (exponential step, clamped to
  `minScale` / `maxScale`). Can be disabled with the new `wheelZoom` prop (defaults to `true`).
- `GrImageViewer`: drag-to-pan via the new `draggable` prop (defaults to
  `false`). When enabled, hovering the image shows a grab cursor and pressing + dragging moves the image (updates the
  translate offset). Uses pointer events with pointer capture (so dragging continues outside the image), switches the
  cursor to grabbing while active, and disables the CSS transition during the drag for 1:1 tracking. Drag state resets
  on index / `urlList`
  change, reset, and close.

### Fixed

- `GrImageViewer`: jitter and visual "overlapping" of the image during continuous wheel / trackpad zoom. Wheel deltas
  are now batched and applied once per animation frame (`requestAnimationFrame`) instead of re-rendering on every wheel
  event, and the CSS `transition-transform` is disabled while the zoom gesture is active (the per-frame updates already
  keep it smooth) and restored once the gesture ends.

## [v0.9.2] 2026-06-08

### Fixed

- `GrModal`: fixed focus handling when a dialog is opened over an already open modal in a separate render tree (e.g.
  `useDialogService` dialogs over a
  `GrModal`). HeadlessUI's per-`Dialog` focus trap is tree-scoped, so the lower modal kept its `FocusLock` and "stole"
  focus back — making it impossible to focus inputs (e.g. the `prompt` field) in the top dialog. Added a shared
  `grModalTopStack`: only the topmost (last-opened) modal keeps focus, lower modals are marked `inert`.
- `GrModal`: removed the HeadlessUI warning "There are no focusable elements inside the `<FocusTrap />`" by passing the
  panel (with `tabindex="-1"`) as the dialog's `initialFocus`.

## [v0.9.1] 2026-06-07

### Fixed

- `GrModal`: Esc now closes the topmost (last-opened) modal/dialog instead of the bottom one. Added a shared
  `grModalEscStack` (single capture-phase
  `window` listener) that pre-empts HeadlessUI's per-`Dialog` Escape handler, so Esc targets the top window even when a
  `useDialogService` dialog is opened over a `GrModal` (separate render tree).

## [v0.9.0] 2026-06-02

### Added

- `useDialogService` / `dialogService`: imperative dialog service (Element Plus
  `ElMessageBox`-style) to open `confirm` / `alert` / `prompt` dialogs from
  `<script>` / `.ts` without placing a component in the template. Supports async `onConfirm` with loading state,
  in-dialog server-error rendering via
  `ctx.setRawError` (reusing `GrResponseErrorBanner` parsers), `AbortSignal`, FIFO queueing and application-context
  inheritance (i18n / theme / provider).
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
- Added `repository`, `homepage`, `bugs`, `keywords`, `author`, `engines`, `publishConfig` metadata and an optional
  `unocss` peerDependency to `packages/granularity/package.json`.

### Changed

- Package license changed from `UNLICENSED` to `Apache-2.0`.
- CI split into separate jobs (`lint`, `test-granularity`, `build-granularity`,
  `test-showcase`, `build-showcase`, `deploy-showcase`, `publish`); publishing no longer depends on the showcase.
- `apps/showcase`: removed the duplicate package build — `generate:search` no longer rebuilds `@feugene/granularity`
  (for local development the preparation step runs in `yarn dev:showcase`).

### Removed

- Useless root-level `.npmignore` (publishing happens from `packages/granularity`, where `files` already applies).
