# Changelog

All notable changes to the [`@feugene/granularity`](.) package are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- **`GrFormSection`: heading level and header slots.** `headingLevel` (`h2`…`h6`, default `h3`, readable from
  `GrConfigProvider`) makes the section title a real heading — that is how a long form is navigated by anyone using a
  screen reader. New slots: `#title` and `#description` build those parts from markup instead of a string, `#actions`
  puts controls («Add», «Reset») into the right side of the header, which now wraps under the title on a narrow screen.
  Without a title, a description and actions the header is not rendered at all.
- **`GrButtonGroup`: shared styling, orientation and a spaced mode.** `size`, `variant` and `tone` set on the group
  reach its buttons through context, so the props stop being repeated on every one of them; the resolution order is
  button prop → group → `GrConfigProvider` → default, because the group sits closer to the button than a global
  provider. `orientation="vertical"` stacks the buttons and moves the rounding to the top and bottom edges;
  `:attached="false"` keeps the row but drops the gluing, leaving every button with its own radii and borders. The
  group context is public — `useGrButtonGroup()` — for controls built on top of it.
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
- **`GrNavbar`: `sticky`, `#left`/`#center` zones and a configurable height.** The bar can now stick to the top of the
  page on the new `--gr-z-navbar` layer (900) — below anchored panels, so an open dropdown or modal covers the bar
  instead of disappearing under it. `#center` adds a middle zone for search or breadcrumbs; when it is used the side
  zones split the remainder evenly, because a lone `flex-1` centre is centred within the remainder and drifts after
  the wider side. Height comes from `--gr-navbar-height` (default `56px`) instead of a hardcoded class.
- **`GrNumberInput`: `clearable`, hold-to-repeat, `focus`/`blur`.** Holding a ± button now steps repeatedly (400 ms
  before the first repeat, then every 60 ms) and stops at the boundary, on release and when the pointer leaves;
  `clearable` adds a clear button that returns focus to the field and emits `clear`; `focus` and `blur` complete the
  event contract shared with `GrInput`.
- **`GrNumberInput` reads its locale from the i18n adapter.** `Intl.NumberFormat` was only ever given the `locale`
  prop, so a multilingual app had to pass it to every field.
- **`GrRating`: labels per step and a compact read-only view.** `texts` gives each step a word, which goes both into
  the visible text and into `aria-valuetext` — «4 of 5, good» instead of a bare number, which is the whole point of a
  rating. `compact` (with `readonly`) draws only the filled symbols, for tables and lists where five stars per row eat
  the width; a half counts as a symbol.
- **`GrSelect`: `state` and object values.** `state` (`default | success | warning | danger`) tints the border like
  the rest of the form row, and `invalid` overrides it. Option values may now be objects: pass `valueKey` with the
  name of the identifying field, and the component compares by that key instead of by reference — a model that arrives
  from outside as a separate copy with the same `id` still matches its option. The object itself is emitted, not the
  DOM string.
- **`--gr-primary-text` joins the theme tokens.** The primary tone had no text-safe pair, so components painted text
  with the saturated `--gr-primary`, which is not meant for it.
- **`GrSegmented`: a segment can be busy.** `loading` on an option puts a spinner where its icon goes and marks the
  segment `aria-busy`; the segment stops accepting selection and arrow keys step over it. It deliberately does **not**
  get `aria-disabled` or the native `disabled`: a busy segment is available, it is just working — a distinction a
  screen reader can hear. The default slot now also receives `loading`.
- **`GrSlider`: vertical orientation and `lazy`.** `orientation="vertical"` puts the minimum at the bottom, moves the
  tooltip aside (above the thumb it would sit on the track) and the mark labels to the right; the track's length is a
  new customisation point, `--gr-slider-length`. `lazy` holds `update:modelValue` until the gesture ends — one event on
  release instead of one per mouse move — while the keyboard still commits immediately, because a key press is
  discrete and there is nothing to hold back.
- **New `GrSidebarGroup` — sections with a heading.** Fifteen navigation items in a row are unreadable; a group is
  announced as `role="group"` and tied to its heading through `aria-labelledby`. In a collapsed sidebar the heading has
  nowhere to go: it is removed (along with the `aria-labelledby` that would otherwise point at nothing) and the
  sections are separated by a rule instead, so the icons of neighbouring groups do not merge into one column.
- **`GrSidebar`: `landmark`, `ariaLabel` and `position`.** The root renders as `<aside>` (`complementary`, the
  default) or `<nav>` (`navigation`) — no nested `<nav>` inside `<aside>`, because two landmarks per panel clutter the
  outline and a rail of filters is not navigation at all. `ariaLabel` names the landmark, which two sidebars on one
  page need to be distinguishable. `position="right"` moves the border to the other side and mirrors the toggle
  chevron: on a right-hand panel «collapse» points right.
- **`GrTreeSelect`: checkboxes for multiple selection.** `show-checkbox` (together with `multiple`) swaps the
  component's own tick for `GrTree`'s checkboxes: checking a parent cascades over its subtree and a partially checked
  parent is announced as `aria-checked="mixed"`. The cascade is computed by the tree itself, so a click on the row, a
  click on the box and `Space` all travel the same path and cannot double-toggle. `check-strictly` unlinks parents
  from children. All checked keys — parents included — end up in `modelValue`.
- **`toast.promise` and `toast.update`.** `promise(p, { loading, success, error })` runs a request's whole lifecycle
  in one toast — the loading toast is rewritten into the result instead of being closed in favour of a new one, so the
  stack does not jump. Messages may be strings, toast inputs, or functions of the resolved value / rejection reason.
  The promise is returned as-is and **the rejection is not swallowed**: a toast does not replace error handling. If the
  user dismissed the toast while the request was in flight, the result does not resurrect it. The underlying
  `update(id, patch)` is public too and restarts the auto-dismiss timer when `timeoutMs` is part of the patch.
- **`GrTextarea` emits `change`, `focus` and `blur`.** It used to emit only `update:modelValue`, so a wrapper around
  the control could not be written the same way as one around `GrInput`, which has had the full set for a while. The
  native events are re-emitted explicitly: a declared emit leaves `$attrs`, and without that `@change` on the
  component would silently stop working.
- **`GrTabs`: `variant`, tab icons and a `#tab` slot.** `variant="line"` renders the classic underlined row next to
  the existing `pills` (the name is shared with `GrSegmented`, which has the same role); it is also readable from
  `GrConfigProvider`. A tab may carry an `icon` class, and the `#tab` slot replaces the tab's content entirely,
  receiving `{ tab, active, disabled }`.
- **`GrSwitch` can take part in a native form.** `name`, `value` (default `'on'`) and `form` render a hidden field
  with checkbox semantics: a switch that is on submits its value, a switch that is off submits nothing, so the server
  reads «off» from the missing key. The field is a sibling of the button rather than a child — interactive content
  inside `<button>` is invalid — which makes the component's root a fragment; attributes a consumer passes still land
  on the button.
- **`GrSwitch`: `loading`, `labelPosition` and a `change` event.** `loading` puts a spinner in the thumb, marks the
  control `aria-busy` and blocks toggling while a request is in flight; `loadingText` (default `gr.switch.loading`)
  says what is being saved, because `aria-busy` alone is not announced. `labelPosition="start"` moves the label to the
  left of the track by reversing the row, leaving the DOM order — and therefore the reading order — intact. `change`
  is emitted alongside `update:modelValue`.
- **`--gr-disabled-bg`, `--gr-disabled-fg` and `--gr-disabled-brd` join the theme tokens.** Disabled states had no
  token to sit on, which is why eleven components dimmed themselves with `opacity` against the package's own rule.
- **`GrStatistic`: `locale` and number formatting through `Intl`.** Separators now come from the locale — taken from
  the i18n adapter automatically, overridable per card with `locale`, and still overridable outright with
  `groupSeparator`/`decimalSeparator`, which replace only their own part and leave the rest of the locale's rules
  (grouping style, minus sign) intact. Without an adapter and without the prop, formatting is byte-for-byte what it
  was: a narrow space and a dot.
- **`--gr-text-2xs` (10px) joins the type scale.** The smallest captions had no token to sit on, so components spelled
  them out in px.
- **`GrPagination`: `showTotal`, `ariaLabel` and `disabled`.** `showTotal` renders the visible range («41–60 of 137»)
  next to the navigation, and the `#total` slot replaces it with markup, receiving `from`, `to` and `total`.
  `ariaLabel` names the navigation landmark — without it two paginations around a table produce two identically named
  landmarks in a screen reader's outline. `disabled` shuts the whole widget down at once: page numbers, the nav
  buttons, the page-size select and the jumper.
- **`GrList`: the surface is now selectable.** `variant` reaches the `GrCard` the list draws underneath, so
  `variant="ghost"` drops the border and the shadow for a list placed inside an existing card instead of stacking a
  card in a card. Without the prop the card keeps resolving its variant from `GrConfigProvider`.
- **i18n:** `gr.breadcrumbs.label` and `gr.breadcrumbs.expand` in all three locales.

### Changed

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
  the alignment; the row now scrolls horizontally with the scrollbar hidden, and the active tab pulls itself into view
  — including when it was selected from outside. Vertical orientation is unaffected.
- **`GrTabs` declares its props as a named interface.** `GrTabsProps` was a type alias, so
  `defineProps<GrTabsProps & {…}>` in a consumer's wrapper did not work.
- **`GrTabs`: the size ladders moved from px literals to `--gr-text-*`.** Tabs run `xs/xs/sm/base`, the badge
  `2xs/2xs/2xs/xs`; the `lg` tab grows from 15px to 16px and the `sm` tab shrinks from 13px to 12px.
- **`GrSwitch` accepts `xs` from `GrConfigProvider`.** The `xs` classes existed, but the component still declared
  `supported: ['sm', 'md', 'lg']`, so a global `size="xs"` silently fell back to `md`.
- **`GrStatistic`: the four size ladders moved from px literals to `--gr-text-*`.** Captions and the trend line run
  `2xs/xs/xs/sm`, affixes `xs/xs/base/xl`, the value `base/xl/3xl/4xl` — the value at `md` grows from 28px to 30px,
  the only visual shift.
- **`GrPagination` no longer renders the page-size select by default.** It is now behind `showPageSize`, because a
  bare pagination is «just the page numbers» far more often than not; add `show-page-size` to keep the previous look.
- **`GrPagination` announces the page numbers as a list.** They moved into a `<ul role="list">` inside the navigation
  landmark, so a screen reader reports how many pages there are instead of reading a stream of buttons; the ellipses
  are excluded from it. Page changes are announced through one live region — the visible indicator carries it in
  `compact` mode, a visually hidden «Page N of M» does in the default one (`gr.pagination.status`).
- **`GrPagination`: the size scale moved from px literals to `--gr-text-*`.** The `sm` step was `13px`, a value the
  type scale does not have; it now shares `--gr-text-xs` with `xs` and stays distinguishable from `md` by box height
  and weight.
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
  only when `landmark` is set; structure is carried by the heading. The description keeps its `aria-describedby` link
  in both modes.
- **`GrSwitch` dimmed its disabled state with `opacity`.** Transparency waters down text tokens that were tuned for
  AA contrast, so the label of a disabled switch was harder to read than it should be. It is now dimmed with the new
  `--gr-disabled-*` tokens, and they take precedence over custom track colours — a disabled switch no longer looks
  like a working one.
- **`GrNavbar` required a `title` even when its `#title` slot was used.** Markup in the slot still had to be paired
  with a string prop, or Vue complained about a missing required prop — the showcase demo literally passed
  `title="Ignored by slot"` to work around it. The prop is optional now, and without a title (string or slot) the
  heading block is not rendered at all.
- **`GrNumberInput`'s ± buttons stole focus.** `stepBy` ended with `focus()` on the field, so a keyboard user who
  tabbed to «+» lost the button after the first Enter and could not press it again. The step no longer touches focus;
  the field is focused only when the step came from the field itself.
- **`GrNumberInput`'s ± buttons stayed active at the boundary.** At `max` the «+» button did nothing visible — `clamp`
  swallowed the result. Each button is now disabled on its own boundary.
- **`GrNumberInput` could drift out of sync with its model.** `onInput` writes into `el.value` directly to preserve
  the caret; if the parent did not apply `update:modelValue`, the DOM and the vnode disagreed and later renders never
  reconciled the field. The field is realigned with the model on the next tick.
- **`GrNumberInput` announced a raw number while showing a grouped one** — the formatted value now goes into
  `aria-valuetext`.
- **`GrNumberInput` dimmed its disabled state with `opacity`** and now uses the `--gr-disabled-*` tokens; its ±
  buttons are drawn with `GrIcon` instead of inline SVG.
- **`GrRating`'s preview stuck when the cursor moved onto its label.** `mouseleave` was bound to the outer container,
  which includes the text, so leaving the scale for the label never fired it. The handler now lives on the scale
  itself, and losing focus clears the preview too.
- **`GrRating` dimmed its disabled state with `opacity`** and now uses `--gr-disabled-fg`.
- **`GrRating` accepts `xs` from `GrConfigProvider`.** With this the mismatch is gone from the package: no component
  declares a truncated size scale while shipping the classes for it.
- **`GrSelect` showed an invalid field as a normal one.** `invalid` only ever reached `aria-invalid`: the border kept
  its neutral colour, so an error was audible to a screen reader and invisible to everyone else. Every other control
  of the form row has done this for a while.
- **`GrSelect`: the `primary` link variant used the saturated tone as text colour.** It now uses `--gr-primary-text`,
  hover and active included.
- **`GrSegmented` ignored `readonly` on click.** The prop was declared, exposed as `aria-readonly` and honoured by the
  keyboard, but the click path never checked it — so a read-only control changed its value under the mouse. Both paths
  now share one guard.
- **`GrSegmented` dimmed disabled state with `opacity`.** The control and its segments now use `--gr-disabled-fg`.
- **`GrSlider` announced range bounds in English only.** «min» / «max» were baked into the thumb's accessible name
  past the i18n layer, so a Russian user heard «Громкость (min)». They now come from `gr.slider.min` / `gr.slider.max`,
  added to all three locales.
- **A collapsed range could not be pulled apart with the mouse.** When both thumbs met at one point, a click always
  went to the lower one, which was already blocked by the upper — so the range stayed collapsed unless you reached for
  the keyboard. A click now goes to the thumb on the side you clicked.
- **Right and middle clicks started a drag.** `pointerdown` did not check `event.button`; only the primary button
  moves the slider now.
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
- **`GrSidebarItem` dimmed its disabled state with `opacity`.** It now uses the `--gr-disabled-fg` token, which does
  not water down text tuned for AA contrast.
- **`GrStatistic` did not tell a screen reader whether the metric went up or down.** The trend icon is decorative and
  «+12.5%» carries no direction on its own, so growth and decline were indistinguishable — colour conveys it to
  sighted users only. The trend line now carries a visually hidden «Increase» / «Decrease» / «No change», which
  survives a custom `#trend` slot.
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
- **`GrFormSection`: the description moved from a `13px` literal to `--gr-text-sm`.** It is 1px larger than before —
  the title and the description now share a size, and the hierarchy is carried by weight and colour.

### Fixed

- **`GrButtonGroup` fell apart when a button was wrapped.** The gluing was written against direct children
  (`> [data-gr-button]`), so a button inside a tooltip, a `v-if` wrapper or a router link kept its own radii and a
  doubled border. It now works with «group links» — direct children that are a button *or* contain one — so wrappers no
  longer break the row, and a non-button child (a divider, a label) no longer steals the rounding from the first
  button: the edges are computed from link adjacency instead of `:first-child`/`:last-child`. Hover and focus raise the
  button above its neighbours at any nesting depth, so the focus ring is not clipped by an overlapping border.
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
- **`GrSelect`: disabled styling no longer uses `opacity`.** The disabled control and the disabled option are muted
  with tokens, like `GrInput`; the `danger` variant of `view="link"` moved from the saturated `--gr-danger` to the
  paired `--gr-danger-text` (hover and active are derived from it the same way `GrLink` does it).
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
  tree-select, tooltip, popover, dropdown), toasts, the imperative dialog host and the fullscreen loader now mount
  into a single `<div id="gr-portal">` created in `body` on first use — nine independent `teleport to="body"` and two
  hand-rolled `body.appendChild` calls are gone. `GrConfigProvider` gained `portalTarget`, and the new public
  `usePortalTarget()` resolves the destination for a consumer's own overlay: local prop → provider → shared root. A
  layer that lives outside the portal branch gets marked `inert` together with the page the moment a modal opens, so
  a custom overlay has to travel with the rest.

  The portal root deliberately carries no styles and no classes: `transform`, `filter`, `contain` and friends create a
  containing block for `position: fixed`, and every `useFloating` panel would start measuring against the portal
  instead of the viewport.
- **`GrImageViewer`: touch gestures, cursor-anchored zoom and a download button.** Two pointers pinch-zoom around the
  point between them; a single pointer swipes between frames on a fitted image and pans a zoomed one — so a phone is
  no longer limited to the chrome buttons. The wheel now zooms **into the point under the cursor** instead of the
  centre, which is what makes reaching a corner of a zoomed image possible at all. `showDownload` adds a toolbar
  button: it downloads the current frame (`<a download>`) and emits `download` with `{ src, alt, index }`; a
  cross-origin address is not always downloadable, so signed links stay a job for `#toolbar-actions`.
- **`GrDrawer`: sides `top`/`bottom`, a `#header` slot and a non-modal mode.** `side` now takes four values, and the
  axis decides the rest: a side panel is stretched vertically and takes its **width** from the scale, a top or bottom
  one is stretched horizontally and takes its **height** — so `size="sm"` on a bottom sheet means 280px tall, not
  wide. A custom length follows the same axis: `width` for `left`/`right`, the new `height` for `top`/`bottom`; the
  prop for the wrong axis is ignored **and warns in dev**, because silently doing nothing looks like a bug in the
  component rather than a mistake in the call.

  `#header` replaces the header as a whole — the close button included, which the consumer then draws themselves; the
  slot receives `title` and `close`. `:modal="false"` drops the backdrop, the scroll lock, the `inert` and the focus
  trap: the page keeps scrolling, clicking and taking Tab while the panel stays open, which is what a filter panel
  over a table needs. What remains in that mode is a place in the layer stack (Esc still closes the top layer), focus
  return to the trigger and `role="dialog"` — now without `aria-modal`. The layer root passes clicks through
  (`pointer-events: none`); without that a «non-modal» panel would silently kill the whole page.
- **`useFocusTrap` — the focus trap is now a primitive of this package.** Public, next to `useOverlayLayer` and
  `useDismissible`, with its own subpath export (`@feugene/granularity/composables/useFocusTrap`). While active, Tab
  cycles inside the layer and focus that leaks out comes back; `initialFocus` is a default rather than an order — a
  focus the layer's own content has already placed (a dialog aiming at «Cancel», a prompt aiming at its field) is left
  alone. It is built on `keydown`/`focusin` **without sentinel nodes**: the widespread two-focus-guard-buttons approach
  puts interactive elements inside a container that carries an ARIA role, which the role forbids
  (axe: `nested-interactive`).
- **The overlay stack feeds the trap.** Every layer now registers its `root`, and `useOverlayLayer` returns
  `rootsAbove()` — the roots of layers opened on top. A modal passes them to the trap as extra containers, so a
  `GrSelect` panel opened inside a dialog keeps focus: in the DOM it is teleported to `body`, outside the dialog's
  subtree, while for the user it is the same layer.
- **A modal now takes the rest of the page out of the accessibility tree.** While a window is open, the other children
  of `body` get `inert` and `aria-hidden`; covering the page visually was never enough — Tab still walked into a form
  nobody could see, and a screen reader read it as usual. Roots of other layers (toasts, a panel opened from inside
  the window) are deliberately left alone.
- **`GrLoading`: `delay`, a panel slot and a spinner on the icon scale.** `delay` (ms) holds the overlay back, so a
  request that answers faster never flashes one; the countdown starts when the component mounts, and the content is
  not blocked until the overlay is actually shown. The default slot replaces the panel body as a whole — progress
  with percentages, a cancel button for a long operation. `spinnerSize` and `spinnerTone` now go through `GrIcon`
  (theme tokens instead of px literals in the markup), and the component's own `@keyframes gr-loading-spin` is gone:
  the package spins one way. The component also got its own page, `docs/components/GrLoading.md`.
- **`v-loading` blocks the content it covers.** Visually the overlay covered the container, but Tab still walked into
  the form nobody could see and a screen reader read it as usual. The directive now marks the host `aria-busy` and
  sets `inert` on its other children at the moment the overlay appears; on close it removes only what it added, and
  focus — which Chrome leaves inside a subtree that just became inert — is taken out and returned where it was, unless
  the user has moved it themselves.
- **`--gr-z-loading` (`1150`).** A layer of its own between the modal (`1100`) and toasts (`1200`): a fullscreen
  loader blocks the whole application, including an open dialog, but must not hide a notification about a background
  failure.
- **`GrIcon`: `label`, `tone`, `spin` and size tokens.** A meaningful icon no longer needs hand-written ARIA — `label`
  turns it into `role="img"` with a name; `tone` paints it with the palette's **text** roles (a saturated tone as text
  colour is forbidden in this package — contrast drops to about 2:1), and `spin` covers spinners. The size scale moved
  from px literals in the component to `--gr-icon-size-xs…lg` tokens, so icons now scale with the theme rather than
  with a rebuild. The component also got its own page, `docs/components/GrIcon.md`.
- **`GrForm`: whole-form `disabled`, dirty/valid state and async-rule feedback.** `disabled` travels through the
  field context down to the controls, so «switch the form off while submitting» no longer means walking the controls
  by hand — and every control that reads `useGrFormControl` now honours the resolved value instead of only its own
  prop. `setSnapshot()` re-takes the baseline (an editing form fills its model after the server answers, and the
  snapshot taken in `setup` was empty), `isDirty` and `isValid` are exposed and passed to the default slot, and a
  field with a running async rule is marked `aria-busy` and says so (new `gr.form.validating` key in all three
  locales) instead of silently showing the previous error. The component also got its own page,
  `docs/components/GrForm.md`.
- **`GrForm` emits `invalid`.** A failed submit now reports the map of messages: «the form is invalid» and «nothing
  happened» used to look identical from the outside.
- **`GrFileUpload`: per-file uploads, a response generic and image previews.** `uploadMode="per-file"` sends every
  file with its own request — `request` is still called as `(files, ctx)`, just with a single-element array, so an
  existing uploader keeps working — and `concurrency` (default 3) caps parallel connections. Each row then carries its
  own status and percent, plus `retryFile(file)` / `abortFile(file)`; `success`, `error` and `progress` gained an
  optional trailing `file` argument that only appears in this mode. The aggregate state is derived from the rows by
  the worst outcome, and cancelling one file is not an error — the row returns to the queue. `TResponse` is inferred
  from `request` and types the `success` payload, removing `any` from the public signature. `preview` renders
  thumbnails for `image/*` and revokes every object URL on removal, on a new selection and on unmount. A dev warning
  now fires at mount when neither `action` nor `request` is set, instead of throwing on the first picked file.
- **`GrCommandPalette`: recent commands and match highlighting.** `recentIds` lifts commands into a leading group —
  in the order of that array, with no duplicates below — while the query is empty; the first typed character hands the
  list back to relevance. Matched fragments of the label and description are wrapped in `<mark>` (tint via
  `--gr-command-match-bg`); a custom `filter` that matches on `keywords` alone simply highlights nothing, because
  there is nothing to highlight. Duplicate `item.id` now warns in dev: identical DOM ids make
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
- **`GrResponseErrorBanner`: the parser pipeline is finally covered by tests.** 17 tests became 85 across four
  files: a table per parser (input → `kind`/`message`/`status`/`details`/`fieldErrors`/`stop`), transport cases
  for `normalizeError` (axios, `fetch Response` incl. non-JSON bodies, `XMLHttpRequest`, abort, bare `Error`),
  the `useResponseError` composable, and the banner itself together with both presets. Two defects surfaced
  while writing them and are fixed below. The component also got its own page —
  `docs/components/GrResponseErrorBanner.md` — replacing the two READMEs that lived inside the component folder.
- **`GrDropdownMenu`: пункты стали пунктами меню, а не списком кнопок.** Roving tabindex (`tabindex="-1"`
  у пунктов, табируем только триггер) — раньше `Tab` ходил по пунктам мимо паттерна menu. Выключенный
  пункт больше не выпадает из обхода стрелками: вместо нативного `disabled` — `aria-disabled`, и
  пользователь узнаёт, что действие существует, но сейчас недоступно. `href` сам делает пункт ссылкой
  (`as="a"` не нужен), появились `target`/`rel`/`external`, а у выключенной ссылки `href` снимается —
  перехват клика не спасал от средней кнопки мыши и «открыть в новой вкладке». Те же поля добавлены в
  декларативную модель. Меню перестало быть беднее примитива: `trigger`, `openDelay`, `closeDelay`,
  `disabled` и `teleportTo` проксируются в `GrDropdown`.
- **`GrDropdown`: typeahead, `disabled`, открытие по наведению — и честный триггер.** Клик переехал из
  обёртки слота в `triggerProps`: раньше панель переключал любой клик внутри обёртки, включая вложенные
  кнопки и ссылки. Теперь `v-bind="triggerProps"` обязателен (забыли — dev-сборка скажет об этом вслух),
  зато вместе с кликом на триггер приезжают `aria-haspopup`/`aria-expanded` и клавиатура. Печатный символ
  в открытой панели ищет пункт по первой букве (буфер 600 мс, повтор буквы — следующий на неё);
  `disabled` не даёт открыть меню ничем, оставляя триггер фокусируемым; `trigger="hover"` с
  `openDelay`/`closeDelay` открывает по наведению, не отменяя ни клик, ни клавиатуру.
- **`GrDivider`: начертание, отступы, толщина, длина и имя для скринридера.** `variant`
  (`solid`/`dashed`/`dotted`), `spacing` по шкале пакета (дефолт `none` — раскладки не едут),
  `thickness` через `--gr-divider-thickness` и `length` для вертикального разделителя вне
  flex-родителя, где ему не от чего растянуться. `variant` и `spacing` читаются из
  `GrConfigProvider`. Подпись перестала пропадать из дерева доступности: `role="separator"`
  делает потомков презентационными, поэтому имя теперь приходит атрибутом `aria-label` — из
  `label` или из нового пропа `ariaLabel` для подписи, собранной слотом.
- **`useDialogService`: изоляция по приложениям, вложенные окна и `priority`.**
  `granularityDialogServicePlugin` даёт приложению собственную очередь и собственный хост и снимает их
  по `app.unmount()` — модульные синглтоны `mounted`/`container`/`cachedAppContext` больше не общие на
  страницу, а контейнер не переживает приложение (микрофронтенды, HMR). Без плагина всё работает
  по-прежнему, на ленивом модульном состоянии; готовый синглтон `dialogService` подхватывает
  единственный зарегистрированный инстанс, а при нескольких печатает предупреждение. Диалог, открытый
  из `onConfirm` другого диалога, теперь показывается **поверх** него: раньше он вставал в очередь за
  тем, кто его ждёт, и внешнее окно висело в загрузке до ручного закрытия. `priority` двигает заявку
  среди ожидающих, не прерывая показанное окно. Состояние заявки переехало из хоста в новый
  `GrDialogServiceItem`, поэтому у каждого окна свои загрузка, ошибки и мост конфига с i18n.
- **`GrDialog`: закреплённые шапка и подвал, фуллскрин, фокус и жизненный цикл.** `scrollBehavior="inside"`
  оставляет шапку и подвал на месте и скроллит только тело — форма на двадцать полей больше не уносит
  кнопки за экран; `initialFocus`, `opened` и `closed` пробрасываются в `GrModal`. Технически это два
  новых layout-слота у `GrModal` — `#header` и `#footer` — вне скроллящегося тела, а само тело при
  `inside` попадает в таб-порядок (`scrollable-region-focusable`). `size="full"` теперь означает «во
  весь экран»: оболочка без полей, панель `h-full` без скруглений, лишний скролл на узком вьюпорте ушёл.
- **`GrConfirmDialog`: `focusAction` и `persistent`.** Фокус при открытии уходит на «Отмена»
  (`focusAction`: `cancel` — по умолчанию, `confirm`, `none`), поэтому `Enter` сразу после открытия
  больше не запускает подтверждаемое действие; со своим слотом `#footer` фокус тихо остаётся на
  панели. `persistent` (есть и у `GrPromptDialog`) на время `confirmLoading` снимает `Esc` и клик по
  бэкдропу, оставляя крестик и «Отмена»; `useDialogService` теперь просто включает его вместо
  собственного расчёта в хосте. `GrButton` получил `focus()` в `defineExpose`.
- **`GrImageViewer`: alt text, an accessible name and an imperative API.** `urlList` now takes
  `{ src, alt }` next to a plain string (mixed lists included), and `alt` reaches both the `<img>`
  and the toolbar slot; the layer names itself from the locale or from the new `ariaLabel` prop; a
  live region announces the current frame ("Image 2 of 5", new `gr.imageViewer.position` key); a
  template ref exposes `close`, `prev`, `next`, `zoomIn`, `zoomOut`, `reset`, `rotateLeft`,
  `rotateRight`. The chrome is painted by per-component tokens (`--gr-image-viewer-scrim`,
  `-chrome-bg`, `-chrome-bg-hover`, `-chrome-bg-soft`, `-chrome-fg`, `-chrome-fg-muted`,
  `-chrome-brd`, `-ring`), and its buttons use `GrIcon` instead of the text glyphs `✕ ‹ › − ↺ ↻`.
- **`GrInput`: события, `loading`, `select()` и новые типы.** Поле объявляет `change` (по blur/Enter),
  `focus`, `blur` и отдельный `clear` — по одному лишь `update:modelValue` очистку кнопкой от ручного
  стирания не отличить. `loading` рисует спиннер в trailing-области и ставит `aria-busy`, не блокируя
  ввод; `select()` присоединяется к `focus()`/`blur()` в `defineExpose`; `type` принимает `tel` и `url`.
  Счётчик символов теперь связан с полем через `aria-describedby`, а исчерпание лимита объявляется
  живым регионом (новый ключ `gr.input.limitReached`).
- **`GrInputTag`: проверка тега, `clearable`, `loading` и размер из провайдера.** `beforeAdd` отсеивает
  тег до добавления (в том числе асинхронно — со спиннером и `aria-busy`, устаревшая проверка не
  дописывает свой результат), отказ уходит в событие `reject`. `clearable` добавляет кнопку «снести
  все» и событие `clear`, `clear()` появился в `defineExpose`. `size` и `clearable` читаются из
  `GrConfigProvider` (новый `defaults.ts`). Добавление, удаление, очистка и исчерпание `max`
  объявляются живым регионом (`gr.inputTag.added`, `.addedMany`, `.removed`, `.cleared`,
  `.limitReached`).
- **`GrKbd`: сочетание одним пропом и платформозависимый `mod`.** `keys` принимает строку
  (`"mod+shift+K"`) или набор токенов и рисует сочетание вложенными `<kbd>` — склеивать `⌘` и `K`
  из двух компонентов и `<span>+</span>` больше не нужно. Токен `mod` показывается как Cmd на macOS и
  как Ctrl на остальных платформах; `platform` (`auto` / `apple` / `other`) фиксирует её вручную.
  `separator` управляет разделителем. Символьные клавиши получают скрытое читаемое имя
  (`gr.kbd.*`) — без него диктор произносит `⌘` как значок. Разбор сочетаний переехал в общий
  `components/shared/hotkey.ts`, откуда его берёт и `GrCommandPalette`.
- **`GrLink` объявляет смену контекста (WCAG 3.2.5).** Ссылка, открывающаяся в новой вкладке,
  получает иконку внешней ссылки и скрытую подсказку «откроется в новой вкладке» — условием служит
  фактическое поведение (`target="_blank"`), а не проп `external`, ровно как у автоматического
  `rel="noopener noreferrer"`. Иконка выключается `:external-icon="false"` и включается вручную для
  внутренних ссылок; текст подсказки — `newTabLabel` или ключ `gr.link.opensInNewTab`. Заданный
  `ariaLabel` больше не съедает предупреждение: имя собирается вместе с ним.
- **`GrList`: пустое состояние, загрузка и кликабельные строки.** Пустоту список определяет сам по
  содержимому слота — `v-if` вокруг него больше не нужен; слот `#empty`, `emptyText` (ключ
  `gr.list.empty`) и проп `empty` как escape-hatch. `loading` рисует `loadingRows` строк-скелетонов и
  помечает контейнер `aria-busy`; слот `#loading` заменяет их целиком. `GrListItem` получил `href`,
  `as`, `clickable`, `hoverable`, `disabled` и событие `click`: строка сама становится ссылкой или
  кнопкой, а `role="listitem"` остаётся на обёртке — обёртка-кнопка снаружи пункта (так это делалось
  раньше) разрывала связку `role="list"` с `role="listitem"`.
- **`GrSelect` держал четыре дефекта доступности разом.** Крестик тега был `<span tabindex="-1">`
  **внутри** `role="combobox"` — и вложенный интерактив, и полная недостижимость с клавиатуры; чипы
  переехали наружу и стали настоящими кнопками в таб-порядке. `aria-controls` при `loading` указывал на
  listbox, которого в DOM нет, — теперь ссылка снимается, а состояние объявляет `aria-busy`.
  `aria-activedescendant` висел на триггере, когда фокус уходил в поле поиска: связка с активной опцией
  переехала на элемент, который реально держит фокус. Кнопка «добавить своё значение» получила
  `role="option"` — без неё она была чужеродным потомком `role="listbox"`. Плюс: таймер typeahead
  снимается при размонтировании, шеврон больше не исчезает вместе с появлением кнопки очистки,
  `readonly` действительно блокирует открытие и выбор.
- **`GrTable` нельзя было проскроллить с клавиатуры.** `tabindex="0"` появлялся только вместе с
  `regionLabel`, то есть широкая таблица без метки была недоступна (WCAG 2.1.1). Теперь скролл в
  таб-порядке всегда, а `regionLabel` отвечает только за `role="region"` и имя области.
- **`GrTabs` терял фокус после сокращения списка вкладок.** Массив ссылок на кнопки не чистился: в нём
  оставались отсоединённые от DOM узлы, и `focus()` молча проваливался в `<body>`. Отключённая вкладка
  перестала получать нативный `disabled` — по APG она остаётся достижимой и объявленной, а
  недоступность выражает `aria-disabled`.
- **`GrTabPanels` не обновлял id при смене `idBase`.** Он вычислялся один раз при setup: панели
  оставались со старыми id, `GrTabs` уезжал на новые, и связка `aria-controls` ↔ `aria-labelledby`
  разъезжалась молча. В dev-сборке панель теперь предупреждает, если вкладки с таким id в документе нет.
- **`GrTextarea` экспортировал некорректный тип пропов.** `typeof props` отдавал тип **разрешённых**
  пропов: после `withDefaults` поля с дефолтами становились обязательными и `readonly`, и
  `const p: GrTextareaProps = { modelValue: '' }` падал на ровном месте. Теперь это объявленный
  `interface`. Отключённое поле гасится токенами вместо `opacity`.
- **`GrRadio` не выделял выбранный вариант текстом и гасил disabled прозрачностью.** Подпись всегда была
  `--gr-muted-fg`, в том числе у выбранного: приглушённый токен на основном контенте — это ещё и вопрос
  к контрасту. Теперь выбранная подпись — `--gr-fg`. Прозрачность (`opacity-50`/`opacity-70`) заменена
  токенами; отключённая кнопка-радио при этом **сохраняет видимый выбор** — вид `GrButton`-а состояние
  стирает, поэтому у радио своя пара классов (поймано визуальным гейтом на отключённой группе в
  конструкторе `GrSelect`).
- **`GrButton` гасил отключённое состояние прозрачностью — и только у `<button>`.** `disabled:opacity-50`
  разбавляет выверенные на AA цвета, а кнопка чаще других стоит на цветной подложке, где разбавленный
  текст проваливается первым; кнопке-ссылке нативный `disabled` вообще не достаётся, поэтому она не
  гасла никак. Появились токены `--gr-button-disabled-bg` / `-fg` / `-brd`, и классы применяются вместо
  вариантных, а не поверх (два `bg-*` одной специфичности разрулил бы порядок в сгенерированном CSS).
  Прозрачные варианты остаются прозрачными: у `ghost`/`outline` отключённая кнопка не превращается в
  залитую плашку — поймано визуальным гейтом на стрелках `GrPagination`. Квадратный режим перестал
  задаваться дважды: инлайн-стиль с px-литералами убран, размер приходит из
  `--gr-button-square-size` с размерным дефолтом в fallback, так что его можно переопределить из CSS
  приложения.
- **`GrCard` перестал быть семью строками шаблона.** Появились `padding`
  (`none`/`sm`/`md`/`lg`), `variant` (`elevated`/`outlined`/`ghost`), слоты `#header`/`#footer` с
  разделителями, `bodyClass`, полиморфный корень (`as` → `href` → `clickable`) и `hoverable`.
  `padding` и `variant` читаются из `GrConfigProvider`. Дефолт неизменен намеренно: без пропов
  карточка рендерит тот же единственный `<div>` с теми же классами — на ней стоят `GrCollapse` и
  `GrList`, и сдвинутый дефолт поехал бы у них (зафиксировано тестом и визуальными эталонами,
  которые у обоих остались байт в байт).
- **`GrButton`: `block`, `#prefix`/`#suffix`, `loadingText`.** Кнопка на всю ширину контейнера; иконка и
  текст больше не валятся в один слот (во время загрузки спиннер занимает место префикса — две иконки
  рядом читались бы как ошибка); `aria-busy` дополнен скрытым текстом, потому что сам по себе его
  объявляет не всякая AT (`loadingText` или ключ `gr.button.loading`).
- **`GrRadio`: `Home`/`End`, `invalid`, слот `#description` и значения не только строкой.** Клавиатура
  дополнена краями набора (отключённые варианты пропускаются, как и на стрелках); `invalid` можно
  поставить переключателю или всей группе — состояния складываются по «или»; описание под подписью
  связывается через `aria-describedby`; `value`/`modelValue` принимают `string | number | boolean`
  (`GrRadioValue`) — перечисления в формах это обычно id числом.
- **`GrRadioGroup`: опции с `disabled`/`description`, `orientation` и `readonly` до переключателей.**
  `GrRadioGroupOption` вырос до `{ value, label, disabled?, description? }` — отключить один вариант или
  дать ему пояснение больше не значит переходить на слот. `orientation` (`vertical`/`horizontal`)
  управляет раскладкой варианта `radiobox`; кнопочный собирает `GrButtonGroup`, и там раскладка своя.
  `readonly` теперь виден и переключателям: группа объявляет `aria-readonly` (у роли `radio` такого
  атрибута нет), а сами переключатели перестают обещать клик курсором.
- **`GrSelect`: `v-model:search`, события и `maxTagCount`.** Текст поиска уходит наружу
  (`update:search` + `search`) — без этого `loading` был декоративным пропом: сходить за опциями на
  сервер было не с чем. Добавлены `change`, `clear`, `visible-change` (паритет с `GrTreeSelect`) и
  `maxTagCount` — хвост чипов сворачивается в «+N».
- **`GrTable`: `#empty`, `loading`, `striped`/`hoverable`.** Пустоту таблица определяет сама по
  содержимому слота (`columnCount` растягивает служебную строку), `loading` рисует скелетоны и
  помечает контейнер `aria-busy`.
- **`GrTabs`: `activationMode` и `orientation`.** `manual` двигает стрелками только фокус, выбор
  подтверждается `Enter`/`Space` — вкладки с тяжёлой загрузкой перестают тянуть каждую панель при
  переборе. `orientation="vertical"` разворачивает список в колонку и переводит навигацию на `↑`/`↓`.
- **`GrTabPanel`: `lazy`.** Вместе с `keepAlive` даёт «смонтировать один раз по требованию и больше не
  разрушать».
- **Витрина показывает новую функциональность:** удалённый поиск `GrSelect` (`v-model:search` + `@search`
  с гонкой запросов, `maxTagCount`, журнал событий), ручной режим активации и вертикальные вкладки
  `GrTabs`, `keepAlive` + `lazy` у `GrTabPanels`, автовысота и счётчик `GrTextarea`. Демо `GrTable` для
  пустоты и загрузки переписаны на новые пропы — они собирали руками ровно то, что компонент теперь
  умеет сам.
- **`GrTextarea` догнал `GrInput`:** `maxlength` + `showCount` (счётчик связан через
  `aria-describedby`), `autosize` поверх уже существовавшей директивы `v-autosize` и `resize`.
- **`GrCheckboxGroup`** — the multi-select counterpart of `GrRadioGroup`: `v-model: string[]`,
  `role="group"`, and shared `name` / `size` / `disabled` / `readonly` / `invalid` for the nested
  `GrCheckbox`. `GrCheckbox` also gains `labelPosition` (label before the control).
- **`GrCollapse`: `borderless`, `headingLevel`, `expandIconPosition`, `beforeChange`, `size`** plus
  the `#extra` and `#icon` slots on `GrCollapseItem`. The accordion now reads `GrConfigProvider`
  (`size`, `divided`, `borderless`, `expandIconPosition`, `headingLevel`).
- **`GrDataTable`: `@row-click`, `rowClass`, `rowProps`, `selectableRow`, `emptyText`,
  `sortCycle="asc-desc-none"`, the `#header-<key>` and `#loading` slots**, and an imperative API
  (`scrollToRow`, `scrollTo`, `clearSort`, `toggleAll`). Columns are now typed against the row
  (`GrDataColumn<TRow>`), so a typo in `key` is a type error instead of a silently empty column.
- **`GrDrawer` caught up with `GrDialog`**: `showHeader`, `showCloseButton`,
  `headerConfig` / `bodyConfig` / `footerConfig`, plus `persistent`, `width`, `initialFocus`,
  `@opened` / `@closed` and an imperative `close()` / `focus()`. `size` and `side` now come from
  `GrConfigProvider` through `componentDefaults`.
- **`--gr-overlay-bg`** — the scrim token behind modal layers, shared by `GrModal` and `GrDrawer`
  and darker in the dark theme.
- **`GrDropdownMenu` can be built from a model**: `:items` accepts actions, groups and dividers and
  emits `select`; items gained `role="menuitemcheckbox"` / `menuitemradio` with `aria-checked`,
  plus `icon` and `shortcut` (props or slots). Composition of the sub-components stays for
  everything a model cannot express.
- **`GrFileUpload`: `accept`, `capture`, `directory`**, an `exceed` event, and control over the
  selected set — `retry()`, `removeFile()` and a remove button in `showFileList`, plus `retry` /
  `removeFile` in the slot scopes.
- **`GrFormFile`: `v-model:errors` and `limit`**, file size in the list, and a remove button that
  names its file. `maxCountValidator` joins the public `fileValidation` API — `limit` is sugar on
  top of it.
- **`GrFormField`: `size`, `labelPosition` / `labelWidth`, `showMessage`, an array of `error`s**, and
  the `#label` / `#error` slots. `size` and `labelPosition` are readable from `GrConfigProvider`.
- **`GrTooltip`: `placement`, задержки, слот и управление снаружи.** Появились `placement` и
  `offsetPx` (`useFloating` умел их с самого начала, наружу они не выходили), `openDelay` /
  `closeDelay` — на плотной панели кнопок подсказка перестаёт мигать, — `disabled`,
  `v-model:open` и слот `#content` рядом с пропом `text`. На тач-устройствах, где нет hover,
  подсказка открывается тапом и закрывается тапом вне.
- **`GrToaster`: `F6` в стек уведомлений, ширина пропом, `focus()`.** Тосты телепортированы в конец
  `body`, и кнопка «Отменить» лежала за пределами разумного числа нажатий `Tab`; `focusHotkey`
  (по умолчанию `F6`) переводит фокус на верхний тост, дальше действия обходятся `Tab`. Сам тост
  остановкой `Tab` не становится (`tabindex="-1"`). `width` (число или CSS-длина) уезжает в
  `--gr-toaster-width`, `focus()` добавлен в `defineExpose`.
- **`GrTree`: typeahead, `*`, режимы раскрытия и `focus()`.** Клавиатурный контракт паттерна tree
  закрыт целиком: печатные символы переводят фокус по первым буквам (повтор одной буквы идёт по
  кругу), `*` раскрывает всех соседей уровня. Добавлены `defaultExpandAll` (раскрывает узел в
  момент появления в данных, не отменяя ручное сворачивание), `expandOnClickNode`, `accordion` и
  событие `nodeContextMenu`. `focus(key?)` в `defineExpose` — им пользуется `GrTreeSelect`.
- **`GrTreeSelect`: `loading` и размер из провайдера.** Панель показывает индикатор вместо «Нет
  данных», пока данные едут (новый ключ `gr.treeSelect.loading`, слот `#loading`). `size` читается
  через `useGrComponentSize()` (новый `defaults.ts`) и доезжает до дерева внутри панели.
- **`GrModal`: `scrollBehavior`, `initialFocus`, `opened`/`closed`.** `scrollBehavior="inside"`
  ограничивает панель высотой вьюпорта и скроллит только её тело — слоты `#title`/`#description`
  при этом остаются на месте; `outside` (по умолчанию) сохраняет прежнее поведение. `initialFocus`
  задаёт элемент, получающий фокус при открытии (раньше это всегда была панель). `opened`/`closed`
  приходят **после** анимации: по `update:modelValue` размонтировать содержимое нельзя — оборвётся
  анимация закрытия. Слоты типизированы через `defineSlots`. Всё это уже умел `GrDrawer` —
  примитив, на котором стоит вся модальная семья, отставал от него.
- **`GrPromptDialog`: `rules`, многострочный режим, тип поля и счётчик.** Проверки сверх `required`
  описываются пропом `rules` — тем же движком, что у `GrForm` (`type`, `min`/`max`/`len`, `pattern`,
  свой в том числе асинхронный `validator`); третьего частного случая валидации в пакете не
  появилось. `multiline` переключает поле на `GrTextarea` (`rows`, `autosize`), есть `inputType`,
  `inputmode`, `maxlength` и `showCount`. Всё это же доступно императивному
  `useDialogService().prompt()`.
- **`createGrFormMessageResolver` — публичный.** Дефолтный резолвер сообщений жил внутри
  `GrForm.vue`, из-за чего публичный `runFieldRules` был снаружи бесполезен: прогнать те же правила
  вне формы можно было только написав свой резолвер.
- **`useDialogService`: `ctx.setFieldError` стал адресным, alert берёт подпись кнопки из локали.**
  Ошибки полей складываются в карту по именам (новый ключ `gr.dialog.ok` в трёх локалях вместо
  хардкода `'OK'`). `GrPromptDialog` показывает ошибку своего поля, а единственную запись — какой бы
  ни было имя.

### Fixed

- **`GrAutocomplete`: Tab used to walk into the option list instead of leaving the widget.** Options are
  `<button role="option">` and were focusable, so Tab from the field went into the panel and then through every option
  — the opposite of the combobox contract, where focus stays on the `<input>` and the active option is named by
  `aria-activedescendant`. They are `tabindex="-1"` now, and `mousedown` on an option is prevented, which also fixes
  the second half: picking an option with the mouse in single mode used to drop focus on `<body>`, because the button
  holding it disappeared together with the panel.
- **`GrAutocomplete`: the option list was not a valid `listbox`.** The «Add …» button and the loading, hint and empty
  rows were direct children of `role="listbox"` (`aria-required-children`). The states moved out of the list into one
  `role="status" aria-live="polite"` region below it — which also gives them the announcement they never had: loading,
  «type at least N characters» and «no results» changed in complete silence for a screen reader.
- **`GrAutocomplete`: `readonly` was an ARIA attribute with no behaviour, and `disabled` from `GrFormField` was
  ignored by the markup.** The panel opened on focus, options were selectable and chips removable in a read-only
  control; a field-level `disabled` left the shell looking enabled and kept the chip remove buttons in place. Both
  states now lock the control the same way.
- **`GrAutocomplete`: an option id was built from its value.** A value containing a space produced an invalid id, and
  `aria-activedescendant` pointed at two tokens instead of one reference — the active option stopped being announced.
  Ids follow the position in the list now.
- **`GrAutocomplete`: disabled styling no longer uses `opacity`.** Transparency dilutes text tokens tuned for AA and
  drops the contrast; the disabled shell and the disabled option are muted with tokens, like `GrInput`. The panel also
  stopped hard-coding `text-[13px]` and `rounded-[10px]` instead of `--gr-text-sm` / `--gr-radius-md`, and the chip
  remove button stopped borrowing `gr.inputTag.removeTag` from another component's namespace — it has its own
  `gr.autocomplete.removeValue`, with the value in the label.
- **Toasts, select panels and the imperative dialog host were being marked `inert` by an open modal.** The rule
  skipped only elements carrying `data-gr-overlay-root`, and exactly three components had it — so a toast raised while
  a dialog was open was silently removed from the accessibility tree and its action button became unreachable, which
  is the one thing the top layer of the z-index scale exists to prevent. Every overlay root is marked now, and the
  rule itself walks from the layer up to `body` instead of assuming all overlays are direct children of it.
- **`GrImageViewer` preloaded neighbours while closed.** `onMounted` warmed up two full-size images regardless of
  `modelValue`, so any page that merely contained a viewer paid for it on load. Preloading now starts on open, and
  outdated requests are aborted when the frame changes, on close and on unmount — fast paging through a gallery no
  longer piles up downloads nobody needs.
- **`GrImageViewer`: panning had no bounds.** The image could be dragged off-screen entirely and only reset would
  bring it back. Offsets are now clamped to the frame's own overflow — as far as the picture sticks out of the
  viewport, that far it moves — recomputed on zoom, rotation and resize. A zoomed frame is draggable regardless of
  `draggable`, which previously left the default configuration (wheel zoom on, dragging off) unable to reach the
  edges of a zoomed image.
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
- **`resetFields()` restored the wrong thing in editing forms.** The baseline was captured in `setup`, so a model
  filled from a server response reset back to the empty object; there was no way to re-take it. Use `setSnapshot()`.
  Reset also walks the union of snapshot and model keys now: a key added after the snapshot is **removed** instead of
  being set to `undefined`.
- **Per-field watchers were recreated on every render.** The watcher keyed on `Object.keys(props.rules)` — a new array
  identity each time the getter recomputed. It now keys on the joined names.
- **`GrCommandPalette` violated `aria-required-children`, and the panel is always expanded.** The group heading and
  the empty-state block sat as direct children of `role="listbox"`. The heading moved inside its `role="group"` and
  is presentational now (it still names the group through `aria-labelledby`), and the state block left the listbox
  entirely.
- **The loading state was announced by nothing at all.** `aria-label` hung on a generic `<span>`, where most assistive
  tech ignores it. Loading and «nothing found» now share one live region (`role="status"`, `aria-live="polite"`), and
  the spinner icon is marked decorative.
- **The arrow-key selection reset on any unrelated re-render.** The watcher fired on array *identity*, so a parent
  passing `:items` as an inline expression threw the highlighted command back to the top of the list. It now watches
  the content (ids joined by a space — an id may legitimately contain a comma).
- **`GrConfigProvider` decided the fate of the i18n adapter once, in `setup`.** `if (props.i18n != null) provide(…)`
  meant an adapter created asynchronously — the usual «load the locale, then build the adapter» — never reached the
  children at all, and swapping adapters on a language change did not propagate either, because a value was provided
  instead of a reactive source. The adapter is now always provided through a façade that delegates to a computed
  source and falls back to the adapter installed higher up; `te` is forwarded by a getter, since an always-defined
  `te` would mean «no translation» for every key.
- **`GrResponseErrorBanner` silently dropped a server message that matched a default.** Fallback detection
  compared strings against the built-in English texts, so a server literally answering `"Network error."` lost
  its message to the translated default. `ResponseErrorInfo` now carries `isFallbackMessage`, set in exactly one
  place — the classifier, when no parser supplied a message — and the banner substitutes a translation only for
  such messages. Consequently parsers no longer fill `message` with generic `kind` texts: `httpStatus`, `abort`
  and `network` return only what they learned, and the specialised ones (Laravel, JSON:API, Problem Details,
  file validation) fall back to the classifier instead of hardcoding a text the banner could not translate.
- **A transport error's message was shown as if it came from the server.** With an empty response body,
  `plainMessageParser` picked up `Error.message` — for axios that is `Request failed with status 500`, so users
  saw a technical English string instead of the localized text for the `kind`. That source is now used only when
  there was no response at all (no status, no body).
- **`useResponseError` wrapped the raw error in a reactive proxy.** `lastRaw` was a deep `ref`, which broke
  identity comparisons and made a stored `Response` throw on `clone()` when handed back for a retry; it is a
  `shallowRef` now, like `currentError`.
- **The HTTP status badge was the last hardcoded string in the component.** It now reads `statusLabel` from the
  texts (new `gr.responseError.statusLabel` key in all three locales), so it is both translatable and
  overridable through the `texts` prop.
- **`GrImageViewer` threw the user back to the first frame and painted over toasts.** Any change to
  `urlList` — a gallery loading its next page — reset the index to `initialIndex` together with zoom
  and rotation; the viewer now holds on to the *frame*, keeping it on screen even when it shifts
  position, and clamps to the list bounds only when the frame is gone. Its layer moved from the
  hard-coded `z-index: 2000` (above the toast layer, the one thing that must stay visible) to
  `--gr-z-modal`, with the `zIndex` prop left as an escape hatch — the entry is gone from the
  `layering.test.ts` allowlist and from the deviations table in `docs/z-index.md`. The modal layer
  also had no accessible name at all (`aria-dialog-name`), and every image was `alt=""` with no way
  to pass a description. `useZoomPan`, `useWheelGesture` and `useViewerKeyboard` are now covered by
  tests.
- **`GrList` держал safelist рукописными строками.** `config.ts` перечислял `'px-4'`, `'py-2'`, `'py-3'`
  копией карты плотности из `GrListItem.vue` — расходиться они могли молча. Классы уехали в
  `grListStyles.ts`, safelist собирается от них. Разбор слотов (`flattenSlotNodes`,
  `isWhitespaceTextNode`) переехал из `GrFileUpload` в общий `components/shared/slotNodes.ts`:
  импорт из чужой компонентной директории дал бы на сборке ребро между компонентами, которого в
  разметке нет.
- **`GrLink` гасил отключённую ссылку прозрачностью.** `opacity-60` поверх `--gr-muted-fg` разбавляла
  выверенный на AA токен и роняла контраст ниже нормы; остался только цвет. Заодно из
  `grLinkStyles.ts` убран комментарий-история (правило «Комментарии в коде» из `CLAUDE.md`) и снят
  экспорт `linkToneColors` вместе с лишним реэкспортом `GR_TONES` — оба использовались только внутри
  модуля, но утекали в публичный `.d.ts`.
- **`GrKbd` знал только два размера из четырёх.** Проп обещал шкалу пакета (`xs…lg`), а в разметке
  стояло `size === 'sm' ? … : …`: `xs` и `lg` молча рендерились как `md`. Шкала полная, классы уехали в
  `grKbdStyles.ts` с safelist, а компонент вышел из списка неполных шкал в `componentSize.test.ts`.
- **`GrInputTag` запирал клавиатуру на пределе набора и врал о валидности.** При достижении `max`
  инпут получал `disabled`: он выпадал из таб-порядка и переставал принимать `Backspace` — единственный
  способ убрать тег с клавиатуры, так что выйти из тупика можно было только мышью. Поле остаётся живым,
  лишние теги просто не добавляются. Рамка красилась сырым пропом `invalid`, тогда как `aria-invalid`
  брался из контекста: внутри `GrFormField` с ошибкой поле было объявлено невалидным для скринридера и
  выглядело обычным; `readonly` поля до инпута не доходил вовсе. Крестики чипов переведены на roving
  tabindex (двадцать тегов давали двадцать одну остановку `Tab`): между ними ходят `←`/`→`, `Home`/`End`,
  удаляет `Delete`, а из пустого поля на последний чип уводит `←`. Кнопка удаления называет свой тег,
  набор объявлен списком (`role="list"`/`listitem`). Заблокированное поле гасится фоном `--gr-muted`
  вместо `opacity-50`, крестик чипа больше не теряет контраст на тёмном тоне, а `safelist.ts` ссылается
  на классы хелпера вместо строковых копий.
- **`GrInput` не отдавал очистку и показ пароля клавиатуре.** На обеих trailing-кнопках стоял
  `tabindex="-1"`: виджет был объявлен доступным (`aria-label`, `aria-pressed`), но воспользоваться им
  без мыши было нельзя — очистить поле или посмотреть введённый пароль клавиатурный пользователь не мог.
  Атрибут снят, обе кнопки после нажатия возвращают фокус в поле. Заблокированное поле гасится фоном
  `--gr-muted` с текстом `--gr-muted-fg` вместо `opacity-50`, которая разбавляла выверенные на AA токены.
  Заодно ожил `grInputStyles.ts`: карты размеров, выравнивания и состояний были продублированы инлайн в
  SFC, копии разошлись (`focus-visible:` против `focus-within:`), и safelist декларировал классы,
  которых в разметке нет.
- **`GrFormField` announced errors unreliably and validated too eagerly.** The error box appeared
  and disappeared with `v-if` while the control's `aria-describedby` changed composition at the same
  moment — assistive tech that does not re-read the description after an attribute change stayed
  silent. The box now lives in the DOM permanently (visually hidden while empty) and only its text
  changes, so the attribute is stable. Blur validation no longer fires when focus moves *within* the
  field (input → its own clear button, checkbox → checkbox), which used to flag a field before it
  was filled in. The required marker and the error text moved from the saturated `--gr-danger` to
  `--gr-danger-text`, and a field whose control never read the context now warns in dev — until now
  `<label for>` silently pointed at nothing.
- **`GrFormFile` validation errors were invisible to assistive tech.** The error list had no
  `role="alert"` and was not tied to the control, so "dropped the wrong file type" produced red
  text and nothing else — on the component whose headline feature is validation. Errors are now
  announced, referenced from the upload button through `aria-describedby` (next to the field's own
  description) and reflected in `aria-invalid`. The error text moved from the saturated
  `--gr-danger` to `--gr-danger-text`, the container no longer dims itself with `opacity-60`, and
  the validator chain is assembled once instead of being duplicated between the file dialog and
  drag&drop — the two could drift apart on the first edit.
- **`GrFileUpload` kept working after it was gone.** Unmounting left the XHR running and the
  "hide progress on success" timer armed, so a finished upload called `emit` on a destroyed
  instance — the everyday case is "upload succeeds, user leaves the page". Both are now released in
  `onBeforeUnmount`.
- **`GrFileUpload` ignored `accept` and lost races.** The attribute was never bound, so a consumer's
  `accept` landed on the root `<div>` and the file dialog showed everything; it is now a prop that
  goes both to the input and into the validator chain (the dialog filters, drag&drop does not).
  Two quick selections in a row overlapped: the one whose validators finished *later* won and
  aborted the upload already started by the newer one — each run now carries a sequence number.
  A custom `request` that never calls `onProgress` no longer reports "100%" with `total: 0`, the
  file list keys by identity instead of by name, and the upload phase is announced through a live
  region.
- **`GrDropdownMenu` wrappers broke the menu pattern.** `role="menu"` on the panel makes every
  descendant presentational, so the list, columns, column, group and header divs sitting between
  the panel and its items violated `aria-required-children` — the items lost their menu. They are
  now `role="none"` / `presentation`, and a group is a real `role="group"` named by its header.
  The catalog also got its missing `safelist.ts`: its class maps live in a `.ts` helper the bundler
  moves into a shared chunk, outside the component's scan area, so alignment, columns and colors
  would have silently vanished for an isolated consumer. `variant="danger"` now uses
  `--gr-danger-text` instead of the saturated tone, disabled is painted with background tokens
  instead of `opacity-60`, and a disabled item is no longer activated by handlers bound on the item
  itself (`stopImmediatePropagation`, matching `GrButton`).
- **`GrDrawer` sat below the whole z-index scale.** The panel used a literal `z-50`, so a dropdown
  or select panel (`--gr-z-dropdown` = 1000) painted over the open drawer and its backdrop did not
  cover them. It now uses `--gr-z-modal`, like every other modal layer — the entry is gone from the
  `layering.test.ts` allowlist and from the deviations table in `docs/z-index.md`. The backdrop
  moved from the hard-coded `bg-black/40` to `--gr-overlay-bg`, and an empty `title` no longer
  renders the word "Drawer" as a heading (the header is dropped, the layer keeps an
  `aria-label`). Focus, scroll-lock, `persistent` and the interaction with other overlays are now
  covered by tests.
- **`GrDataTable` no longer gives every keyless row the same key.** With the default
  `rowKey: 'id'` a row without `id` resolved to `''`, so Vue reused DOM across rows and selecting
  one row marked all of them selected. Such rows now get a stable synthetic key (plus a dev
  warning). Sorting stopped treating `null` and `''` as `0` — empty cells always sort last, and
  `Date` / `boolean` / numeric strings compare by value; string comparison uses the i18n adapter's
  locale rather than the browser's. The sort button is named by the column label with the hint as
  hidden text, so `<th>` keeps its name in screen readers; loading and empty states are announced
  through a live region that exists from the first render. Row checkboxes are `GrCheckbox`, not
  native inputs.
- **Utilities missing from `presetMini` no longer fail silently.** `sr-only` (the `GrTable`
  caption, the `GrDialog` a11y title) and `tabular-nums` (`GrInput`, `GrKbd`, `GrPagination`,
  `GrFileUpload`) generated no CSS at all: the "hidden" text was plain visible text and the digits
  never got tabular figures. `sr-only` now comes from `@feugene/unocss-mini-extra-rules` via
  `presetGranular` (v0.7.1); `tabular-nums` has no rule anywhere and was replaced with the
  arbitrary-value form already used by `GrRating`. New gate
  `src/__tests__/presetUtilities.test.ts` asserts every utility the package leans on beyond
  `presetMini` is actually generated by the combination consumers configure, and the safelist gate
  now uses that same combination as its "is this a utility?" oracle.
- **`GrCheckbox` no longer breaks native form submit when `required` is set.** The attribute is
  gone from the hidden `aria-hidden` input (Chrome cancels the submit for a non-focusable invalid
  control) and is declared through `aria-required`; validation belongs to `GrForm` rules. Disabled
  is now painted with background tokens instead of `opacity`, and `invalid` is visible, not just
  announced.
- **`GrCollapse` arrow keys no longer jump into a nested accordion.** `↑`/`↓`/`Home`/`End` now walk
  only the headers of their own `[data-gr-collapse]`; a nested collapse inside an expanded panel was
  part of the same roving list. Disabled headers are painted with background tokens instead of
  `opacity-50`, and the keyboard contract, ARIA wiring and `inert` panel are finally covered by
  tests (the suite only checked the model before).
- **`config.dependencies` no longer under-declares what a component renders.** `GrSidebar` declared
  no dependencies at all while rendering `GrButton` and `GrIcon`; `GrConfirmDialog` and
  `GrPromptDialog` rendered `GrResponseErrorBanner` without declaring it. Nothing failed at build
  time — but a consumer selecting only `GrSidebar` got a scan limited to
  `dist/components/GrSidebar/**` and an empty safelist, so the collapse button inside it rendered
  with no background and no focus ring. With the fix that selection resolves to
  `GrButton, GrIcon, GrSidebar` and 173 safelist entries.

  Stale declarations removed in the other direction: `GrInputTag` no longer claims `GrInput` (it
  stopped using it), and `GrDialogService` no longer repeats `GrDialog` /
  `GrResponseErrorBanner` — both come transitively through `GrConfirmDialog` / `GrPromptDialog`,
  and the preset expands the graph itself.

  New package gate `src/__tests__/componentDependencies.test.ts` derives the dependency set from
  sources and asserts it matches each `config.ts` in both directions, so the lists cannot drift
  again silently.
- **`GrTreeSelect` не давал добраться до дерева с клавиатуры.** `↓`/`↑`/`Enter`/`Space` на триггере
  только открывали панель — фокус оставался на месте, а панель телепортирована в `body`, так что и
  `Tab` вёл мимо. `docs/keyboard.md` при этом обещал «внутри дерева — клавиши `GrTree`». Теперь эти
  клавиши открывают панель **и** переводят фокус в дерево (при `filterable` — сначала в поле поиска,
  оттуда в дерево уводит `↓`/`↑`), `Tab` из панели её закрывает, а `Escape` закрывает и возвращает
  фокус на триггер, не открывая панель заново этим же фокусом. Триггер получил `aria-haspopup="tree"`
  и `aria-controls` на дерево, `disabled` красится токенами вместо `opacity-50`, `readonly` убирает
  кнопку очистки. Мёртвая ветка `typeof window` в обработчике указателя и второй `watch(open, …)`
  убраны.
- **`GrToaster` вкладывал `role="alert"` внутрь `aria-live="polite"`.** Вложение live-регионов с
  разной ассертивностью спецификацией не определено: браузеры и скринридеры расходятся вплоть до
  потери объявления. Обёртка-live-region снята — объявляют себя сами тосты, контейнер остаётся
  именованным `role="region"`.
- **`GrTree`: `aria-selected` только на выбранном узле, фокус без обхода DOM, drop без дефолта
  браузера.** `aria-selected="false"` на каждом узле заставлял диктора проговаривать «не выбрано» на
  каждом шаге навигации. Навигация стрелками искала строку обходом всего поддерева DOM — теперь есть
  общий реестр `key → element`. `onDrop` гасит дефолт браузера **до** всех проверок: иначе бросок
  ссылки или файла на дерево уводил со страницы. Hex-фолбэки `var(--gr-primary, #000)` (8 мест)
  убраны — чёрный фолбэк в тёмной теме давал непредсказуемый результат.
- **`GrTooltip` со слотом давал два таб-стопа на один контрол.** Обёртка была `<span tabindex="0">`
  без роли, а типовое употребление — подсказка у кнопки. Теперь при фокусируемом содержимом слота
  `aria-describedby` уезжает на сам контрол, а обёртка теряет `tabindex`; если фокусироваться в
  слоте нечему (текст, иконка), остановкой остаётся обёртка.
- **`GrPromptDialog` задавал полю литеральный `id="gr-prompt-input"`.** Единственное место во всём
  пакете с захардкоженным `id` в `.vue`. Два открытых диалога — обычный и открытый через
  `useDialogService` — давали дубликат DOM-id, и `<label for>` уводил на чужой инпут (axe:
  `duplicate-id-active`). Атрибут снят целиком: `GrFormField` и так генерирует уникальный `id`, а
  поле читает его из контекста, — хардкод был чистой избыточностью.
- **`GrPromptDialog` открывался с фокусом на панели, а не в поле.** Диалог существует ровно ради
  ввода, а требовал лишнего `Tab`. Фокус ставит содержимое после отрисовки: проп `initialFocus` у
  `GrModal` тут не годится — элемент рождается внутри поддерева диалога, и возврат его же пропом
  наверх замыкает рендер в цикл. Заодно `Enter` в однострочном поле теперь подтверждает (в
  многострочном остаётся переводом строки).
- **`GrTextarea` со `showCount` сажал атрибуты потребителя на обёртку счётчика.** `data-*`, `aria-*`
  и `name` попадали на `div`, а не на само поле, — то есть набор атрибутов зависел от того, включён
  ли счётчик. Добавлены `inheritAttrs: false` и `v-bind="$attrs"` на `<textarea>` в обеих ветках.
- **`GrModal` без слота `#title` оставался вовсе без доступного имени.** HeadlessUI связывает
  `aria-labelledby` только при наличии `DialogTitle`, а `aria-label` компонент не выводил ничем:
  диктор объявлял безымянный «диалог», axe ловит это правилом `aria-dialog-name` (critical).
  Гейт axe дефект не видел — он сканирует превью демо, а модалка в них закрыта; проверено в
  браузере. Появился проп `ariaLabel`, фолбэк на обобщённое имя из локали (новый ключ
  `gr.modal.title`) и dev-предупреждение при первом открытии безымянного окна. `GrDialog` получил
  тот же проп и всегда передаёт имя вниз: с `showHeader: false` и без `title` он был безымянен
  ровно так же. Демо витрины исправлены — все четыре открывали окно без имени.
- **`useDialogService`: `close()` и `closeAll()` шли мимо завершения заявки.** «Завершить диалог»
  было реализовано трижды и по-разному: кнопка в хосте звала `finish()`, `close()` промиса резал
  очередь напрямую, `closeAll()` разбирал её `pop()`-ом. Следствия: закрытие через промис **не
  обрывало in-flight `onConfirm`** (`AbortController` жил внутри `finish()`), а `closeAll()`
  резолвил промисы задом наперёд при заявленном FIFO. Теперь путь один и идемпотентный:
  флаг завершения живёт на самой заявке (`store.ts`), демонтаж (подписка на внешний `signal`,
  `abort()`) выполняется при смене головы очереди — кем бы заявка ни была завершена. Заодно
  `handleConfirm` сверяется с «диалог ещё мой» **до** записи `loading`: за время `await` заявку
  мог завершить `ctx.close()`, и флаг уезжал уже в состояние следующего диалога.
- **`useDialogService`: готовый синглтон `dialogService` всегда открывал диалоги без i18n и без
  `GrConfigProvider`.** Он создаётся на импорте модуля, вне `setup`, где `inject` не работает:
  захваченный контекст был пуст навсегда, и «удобный вариант» из доки молча показывал английские
  строки и дефолтный размер. Теперь синглтон берёт контекст последнего вызова `useDialogService()`
  из `setup`; при полном отсутствии контекста dev-сборка предупреждает. Точный ответ по-прежнему за
  вызовом в `setup` или `setAppContext` — оговорка в доке.
- **`useDialogService`: `Esc` и клик по бэкдропу обрывали операцию на полпути.** Дока обещала, что
  во время async-`onConfirm` мягкое закрытие подавлено, — в коде этого не было. Теперь подавлено;
  кнопка закрытия в шапке остаётся, чтобы из окна с зависшим запросом был явный выход. Там же
  починены `defaults.cancelText`, который терялся в `mergeErrorDefaults`, и два расхождения доки с
  кодом: сервис в SSR **бросает ошибку**, а не работает вхолостую, и `closeAll()` теперь правда
  FIFO. Дока переехала из `README.md`/`README.ru.md` внутри папки компонента в
  `docs/components/GrDialogService.md`.
- **`GrModal`: снят недостижимый код различения источника закрытия.** Общий стек слоёв гасит Escape
  в capture-фазе на `window`, поэтому нажатие не доходит ни до `<Dialog>`, ни до `@keydown.capture`
  на его корне: ветка `closeReason === 'esc'` не могла выполниться ни при каком сценарии. Осталась
  одна проверка `closeOnBackdrop` — единственный оставшийся источник `@close` от HeadlessUI.
  Заодно убран `_dbg3.test.ts` — забытый отладочный файл, писавший дамп в `/tmp` и не содержавший
  ни одного `expect`.

### Changed

- **BREAKING. `@headlessui/vue` is no longer a peer dependency.** The modal family (`GrModal`, `GrDialog`,
  `GrConfirmDialog`, `GrPromptDialog`, `GrCommandPalette`, `GrDrawer`, `GrImageViewer`) runs on the package's own
  primitives: `useFocusTrap` for the trap, `useInertOthers` for the background, `useOverlayLayer` for Esc order and
  focus return — all of which the package already owned — plus Vue's own `<Transition>`. **Remove the dependency from
  the application:** `yarn remove @headlessui/vue`. Nothing changes in the components' API.

  The reason is not the bundle — the dependency was `external` and never shipped inside `dist` — but ownership: the
  focus behaviour of every dialog in the package was decided by a library we did not control and, worse, did not test.
  All eight test files of the family mocked `@headlessui/vue` away, so the trap, `initialFocus`, focus restore,
  `aria-modal` and `aria-labelledby` were being checked against a stub. The mocks are gone and the tests now assert
  real markup, plus a new e2e gate opens a window for real and runs axe, Tab and Esc against it.
- **`GrModal` names itself through its own context.** `#title` and `#description` (and `GrDialog`'s header deeper in
  the tree) receive their ids from the window and only report that they rendered, which is what `aria-labelledby` and
  `aria-describedby` are built from. Two titles on one window now warn in dev — previously the second one silently
  lost.
- **A click on the backdrop closes a window only if it started there.** Selecting text inside the panel and releasing
  the button past its edge used to close the window together with the selection. Same for `GrDrawer` and
  `GrImageViewer`.
- **`useScrollLock` handles iOS.** `overscroll-behavior: contain`, a `touchmove` guard outside the overlay's own
  scrollable areas and scroll-position restore — the part of the lock that used to come from the removed dependency.
  Without it the page behind an open window starts rubber-banding on iOS Safari, and that is only visible on a device.
- **BREAKING. `GrImageViewer`: `zIndex` → `zIndexVar`.** The escape-hatch takes the name of a CSS variable instead of
  a raw number, exactly like `GrLoading` and `useFloating`; the default is still `--gr-z-modal`. The package no longer
  has two different ways of setting a layer.
- **BREAKING. `GrLoading`: `zIndex` → `zIndexVar`, fullscreen moved onto the scale.** The fullscreen overlay sat on
  `z-50` — below the whole layer scale, so a modal (`1100`) covered the loader that was supposed to block it. It now
  uses `z-[var(--gr-z-loading)]`, and the escape-hatch takes the name of a CSS variable instead of a raw number, the
  same shape `useFloating` uses. `zIndex: number` is gone from both the component and the `v-loading` options; the
  inline mode keeps `z-10` — that is ordering inside its own container, not a global layer. With this the package has
  no off-scale layers left, and the deviations table in `docs/z-index.md` is empty.
- **`GrLoading` takes its default caption from the locale.** `'Loading...'` was hard-coded while
  `gr.loading.defaultText` existed — and was tested — in all three locales, so a Russian user read English. Passing
  `text` still wins, and an empty string still removes the caption.
- **BREAKING. `GrIcon` is decorative by default.** It now sets `aria-hidden="true"` itself and drops it only when
  `label` is given. Previously the semantics were left entirely to the caller, and the attribute was written by hand in
  22 places inside the library — forgetting it once is enough for a screen reader to announce the `<title>` baked into
  an SVG. Those redundant attributes were removed; a caller that needs the old behaviour can still pass
  `aria-hidden="false"`, since a fallthrough attribute wins over the component's own binding.
- **BREAKING. `GrDropdown`/`GrDropdownMenu`: `align` → `placement`, `width` — CSS-длина.** Вместо трёх
  вариантов «только снизу» — любое размещение floating-ui плюс `offset`; переворот при нехватке места
  работал и раньше. `width` перестал быть строкой tailwind-шкалы (`width="48"` → `w-48`) и принимает
  CSS-длину: число трактуется как пиксели, строка идёт как есть, `auto` отдаёт ширину контенту. Строка
  без единиц теперь означает пиксели и в dev-сборке ругается — чтобы прежние `width="48"` не превратились
  молча из 192px в 48px. `GrDropdownMenuAlign`/`GrDropdownMenuWidth` удалены: типы берутся у владельца API.
- **`GrLink` с `external` теперь рисует иконку.** Раньше её приходилось вкладывать в слот руками (так
  и было сделано в витрине). Вид существующих внешних ссылок изменится — вернуть прежний можно
  пропом `:external-icon="false"`.
- **`GrImageViewer` renamed the `switch` event to `change`.** The old name came from Element Plus
  and matched nothing else in the package (`update:*` / `change` / `sortChange`). The payload is
  unchanged — the new frame index.
- **`GrFormFile` no longer emits `validation`.** It carried exactly the same payload as
  `update:errors`; the remaining channel is `update:errors`, now backed by a real `errors` prop, so
  `v-model:errors` reads as well as writes.
- **`gr.dataTable` sort keys replaced.** `sortBy` / `sortedAsc` / `sortedDesc` (sentences with a
  `{column}` placeholder) are gone; the hint is now column-agnostic — `sortAsc` / `sortDesc` /
  `sortNone`. Applications that overrode the old keys need to move their text over.
- **`@feugene/unocss-preset-granular` bumped to `^0.7.0`** (peer and dev), which adds the
  `undeclared-dependency` diagnostic to `granular doctor` — the same defect class as above, but
  checked against the built `dist` rather than the sources. It sees what source analysis cannot:
  an edge that only exists because the bundler routed it through a shared chunk.

  Wired in as a second gate: `granular.options.mjs` + `yarn doctor`
  (`components: 'all'`, `--strict`), run in CI right after the build. It is complementary, not a
  replacement — the unit gate catches *surplus* declarations, which leave no trace in `dist` and
  are therefore invisible to `doctor`. A run over all 61 components reports zero findings.

  The dependency criterion is now normative upstream (`docs/SPEC.md` §4.1): the edge is "the built
  code imports another component's directory and something renders from it" — which also covers a
  lazy `import()`, previously invisible to the unit gate and now recognised by it. The converse is
  explicit too: importing a constant, a type or a composable is **not** a dependency, and declaring
  it ships the donor's entire CSS and safelist to every consumer.

## [v0.14.0] 2026-08-05

### Added

- **New `GrPopover`** — an anchored, non-modal overlay holding whatever content you give it: a short
  form, settings, a confirmation. Until now that role was forced onto `GrDropdown`, which hard-codes
  `role="menu"`, `aria-haspopup="menu"` and roving focus over items — the wrong semantics for a form.

  The primitive owns positioning, the overlay layer and dismissal; the keyboard pattern *inside* the
  panel stays with the consumer, which is why `role` is a prop (`dialog` by default, plus `menu`,
  `listbox`, `grid`, `group`, `none`). `GrMenu` / `GrContextMenu` / `GrColorPicker` are meant to be
  built on it.

  Props: `open` (optional — without it the component manages its own state), `placement`, `offsetPx`,
  `size`, `role`, `ariaLabel` / `labelledBy`, `trigger` (`click` | `manual`), `closeOnEsc`,
  `closeOnClickOutside`, `closeOnContentClick`, `autoFocus`, `teleportTo`, `contentClass`,
  `disabled`. Slots: `#trigger` (receives `triggerProps` to bind on a real focusable element) and
  `#content` (receives `close`). Exposes `open()` / `close()` / `toggle()`.

  **Accessibility.** The trigger gets `aria-haspopup` / `aria-expanded` / `aria-controls`; the panel
  is a `dialog` with a required accessible name and `tabindex="-1"`. Esc closes the topmost layer of
  the shared overlay stack, so a popover opened inside a modal closes itself rather than the modal;
  focus returns to the trigger only if it was still inside the panel when it closed.
  **There is deliberately no focus trap** — Tab must be able to leave a non-modal layer, otherwise it
  strands the user on a page that was never blocked. `autoFocus` moves focus to the panel itself, not
  to the first control inside: focusing an input on the user's behalf is the content's decision.

  A click inside the panel does **not** close it by default (`closeOnContentClick: false`) — with a
  form inside, the first field would otherwise dismiss it.

### Fixed

- **File validators no longer hard-code English.** All six returned a fixed English `message` and
  offered no other channel, so a Russian app displayed `File "photo.png" does not match accept="…"`
  and could do nothing about it. Every issue now carries `i18nParams` (and, where needed, an explicit
  `i18nKey`), and `resolveFileValidationMessage(issue, t)` builds the text. The key is derived from
  `code` — `gr.fileValidation.<code>` — so a new built-in validator is localised by adding one string.

  **Not a breaking change**: `message` stays required and is still the fallback, so a consumer's own
  validator keeps rendering unchanged. English strings are byte-identical to the previous `message`,
  so behaviour without i18n is untouched.

  Fixed along the way: `GrFormFile` printed `photo.png: File "photo.png" …` — the built-in messages
  already name the file, so the prefix is now added only for messages that do not (detected by the
  absence of a `fileName` param, not by substring matching).

- **`GrDataTable` sort labels are translatable.** Three English strings (`Sort by …`) were baked into
  the component and read out by screen readers in English regardless of the app's language.

- A gate (`src/i18n/__tests__/localeCompleteness.test.ts`) now checks that `ru`/`es` cover every `en`
  key, carry no orphans, use the same placeholders, and that every plural block has an `other` branch.
  A missing translation used to be invisible: `t()` silently returned the English fallback.

- **Utilities the components used but that never produced CSS.** `presetMini` does not ship
  `animate-*`, `space-*`, `divide-*`, `backdrop-*` or the `text-transform` family, so for anyone
  whose `uno.config.ts` followed `docs/installation.md` those classes stayed in the markup with no
  rule behind them: spinners did not spin, list dividers were not painted, `GrDropdownMenu` headers
  were not upper-cased. The build succeeded and the tests were green — the showcase kept the missing
  rules in its own config and so hid the defect.

  Fixed upstream rather than by rewriting component markup: `@feugene/unocss-preset-granular` now
  bundles the gap-fill rules (0.6.1), and the two remaining families were added to
  `@feugene/unocss-mini-extra-rules` 0.4.0 — `typographyRules` plus a divider **colour** built on
  presetMini's own `colorResolver`, so `divide-<colour>` accepts exactly what `border-*` does. The
  package now requires the preset `^0.6.2`.

  **Visible change**: `GrDropdownMenu` headers are upper-cased (the `uppercase` prop defaults to
  `true` and finally applies), and dividers in `GrList` / `GrDropdownMenu` take `--gr-brd` instead of
  the tailwind-compat default. 18 visual baselines re-recorded.

  A gate (`src/__tests__/documentedConfig.test.ts`) now runs every safelisted class — and every
  `animate-*` / `space-*` / `divide-*` / `backdrop-*` literal found in component sources — through
  the **documented** consumer config. A mismatch between "how the showcase builds" and "how a
  consumer builds" is invisible to every other check.


### Added

- **Plural-ready messages, on `@feugene/fint-i18n` 0.6.0.** Plural forms live in the bundled
  dictionaries as objects keyed by CLDR category (`one`, `few`, `many`, `other`) or exact value
  (`=0`), and components pass the count under both conventional names (`n` for fint-i18n and
  vue-i18n, `count` for i18next).

  **Selecting the form, and formatting numbers, dates and currency, stay with the application's
  translator.** The package deliberately implements none of it: a second `Intl` inside a UI library
  would eventually disagree with the app's own rules. With no translator installed a component
  renders its built-in English fallback as-is — one form, unformatted.

  Russian is why the dictionaries carry four forms: `one`/`other` is not enough — `21` falls into
  `one` and `11` into `many`, so the rule does not reduce to the last digit. Spanish carries `many`
  too, the category it uses for millions. Verified end to end against a real `fint-i18n` instance,
  not a mock adapter — which is how the 0.5.0 syntax change was caught before release.

- **`te()` is used when the adapter provides it.** Whether a translation exists was previously
  inferred from `t(key) === key`, which lies on dictionaries of codes and identifiers whose value
  equals its own key: such a translation counted as missing and was replaced by the built-in English
  fallback. Adapters without `te()` keep the old heuristic.

- **`yarn check:messages`** — the dictionary checker shipped with `fint-i18n`. It verifies that the
  three locales agree on keys and that every set of plural forms covers the CLDR categories its
  locale actually uses, which no runtime can report: a missing category falls back silently.

- **`prefers-reduced-motion` respected package-wide.** Support existed in exactly one place
  (`GrSkeleton`) against 78 `transition-*` utilities, 7 `animate-spin`, the `<transition>` wrappers
  of six overlays and three component-level `@keyframes`. A single clamp in `styles/base.css`
  (mirrored in `preflight.css`) now covers all of them — plus code not written yet.

  **The `motion-safe:` approach was rejected on evidence, not taste**: under `presetMini` the
  `motion-safe:` / `motion-reduce:` variants generate **no CSS at all** (verified against the
  generator). Spread across 85 call sites it would have produced the package's classic silent bug —
  class present, CSS absent, animation still playing. A library ships *classes*; the consumer's
  config compiles them, so an accessibility contract cannot depend on which variants that config
  happens to enable.

  Durations collapse to `0.01ms` rather than `none` so `transitionend` / `animationend` still fire —
  with `none` a listener would wait forever and strand the UI mid-state. Delays are zeroed too.

  Spinners do **not** freeze at a random angle: with no `animation-fill-mode` they return to
  `transform: none`, i.e. a clean static icon (verified in a browser under emulated `reduce`). No
  replacement pulse is introduced — any infinite animation is motion the user asked not to see.

- **`GrToaster`'s progress bar is hidden under reduced motion.** It is the one animation the global
  clamp gets wrong: `animation-fill-mode: forwards` pins it at the final `scaleX(0)` frame instead
  of reverting, so the timer would read as expired while the toast is still on screen. Auto-dismiss
  is driven by a JS timer and is unaffected; the element is already `aria-hidden`.

- **`docs/motion.md`** — the motion contract, why the global block, per-animation behaviour and the
  rule for new components.

- A gate (`src/__tests__/reducedMotion.test.ts`) checks the block's presence and contents, that every
  component `@keyframes` is either handled or recorded as clamp-safe, and — closing a long-standing
  hole — that `base.css` and `preflight.css` stay **synchronised**, which until now rested on a
  comment alone.

- **`size` on the nine components that lacked it** — `GrTextarea`, `GrTabs`, `GrPagination`,
  `GrTable`, `GrDataTable`, `GrTree`, `GrProgressBar`, `GrTooltip`, `GrFormFile`, `GrFileUpload`.
  The scale (`xs | sm | md | lg`) and the provider were already package-wide; these components
  simply were not wired to them, so `<GrConfigProvider size="sm">` scaled a `GrInput` and left the
  `GrTextarea` beside it untouched — the form fell apart visually.

  **`size="md"` renders exactly as before** for every one of them: the prop adds steps, it does not
  restyle existing markup.

  Composite components pass the resolved size down instead of hardcoding it: `GrPagination` to its
  `GrButton`/`GrSelect`, `GrDataTable` to `GrTable` and the sort icons, `GrFormFile` to its
  buttons and icons, `GrFileUpload` to its `GrProgressBar`. `GrTree` expresses the size through its
  existing `--gr-tree-*` custom properties rather than a second, competing channel.

  A gate (`src/__tests__/componentSize.test.ts`) checks the rendered DOM — not that the composable
  was called — for every component declaring `size` in its `defaults.ts`, and takes that list from
  the filesystem so the next such component cannot drop out of the scale silently.

  **The gate immediately found four more**, left as-is because each needs a separate look-and-feel
  decision and none is in scope here (recorded in `AUDIT.md` and `docs/sizes.md`): `GrBadge` never
  sees the provider's global `size`; `GrKbd` is typed on four steps and implements two; `GrRadio`
  and `GrRadioGroup` scale only in `variant="button"`.

- **`docs/sizes.md`** — the scales, the resolution order, who is on the scale and the deviations.

### Changed — BREAKING

- **`GrTable` and `GrDataTable`: `density` replaced by `size`.** The prop did exactly and only what
  `size` should do — set the font scale — so keeping both would have meant two props for one axis.
  Migration is 1:1 and mechanical:

  ```diff
  - <GrDataTable :rows="rows" density="compact" />
  + <GrDataTable :rows="rows" size="sm" />
  ```

  `compact` → `sm`, `regular` (the default) → `md`; `xs` and `lg` are new. In `GrDataTable` the size
  now also drives cell padding, sort-arrow and checkbox metrics, which `density` never touched.
  `GrTableDensity` is no longer exported. `GrListItem` keeps its own unrelated `density` — there it
  means padding, not type scale.

- **Four deprecated aliases removed** — each one would have been permanent after 1.0:

  - **`--pb-*` → `--gr-progress-*`** (`GrProgressBar`). It was the package's only non-canonical
    token prefix.
  - **`--gr-destructive*` merged into `--gr-danger*`.** Two semantically identical roles had drifted
    apart: in the dark theme `danger` was `#f87171` while `destructive` was `#ef4444`. **This
    uncovered a contrast bug**: `GrBadgeWrap` painted its background from `--gr-danger` and its text
    from `--gr-destructive-fg`, giving white on `#f87171` — **2.77:1**, below the 4.5:1 AA
    threshold. On the merged role it is **6.45:1**.
  - **`.theme-dark` selector removed.** The theme is expressed by `[data-theme='dark']`; `useTheme`
    no longer toggles the class. `.dark` stays — not as a deprecated alias but as interop with the
    Tailwind/UnoCSS class strategy, and the docs now say so.
  - **`GrAlert` no longer accepts `variant="light"`.** The alias is gone, and with it
    `normalizeGrAlertVariant` and `GrAlertVariantInput` — without an alias the normaliser was an
    identity function.

  A gate (`src/__tests__/deprecatedApi.test.ts`) fails if any of the four comes back.

- **`GrDataTable`'s `sort-change` event is now `sortChange`.** It was the only kebab-case emit in the
  package against seven camelCase ones (`visibleChange`, `nodeClick`, `stateChange`, …), so in a
  template the two read as different kinds of event and the IDE offered no help.

  **Template listeners keep working**: `@sort-change` compiles to the `onSortChange` prop, which both
  spellings resolve to. Only a literal `onSort-change` prop in a render function breaks. For the same
  reason there is deliberately **no transitional double emit** — emitting both names would resolve to
  the same handler and call it twice.

  A gate (`src/__tests__/emitNaming.test.ts`) fails on any new kebab-case emit.

- **`GrSelect` and `GrAutocomplete` are generic over their value.** `GrSelectModelValue` and
  `GrAutocompleteModelValue` used to be `string | string[]`, so a numeric id — the common case —
  required `String(id)` on the way in and back. Now:

  ```vue
  <GrSelect v-model="userId" :options="users" />   <!-- userId: number -->
  ```

  The string case is unchanged and needs no type argument (`TValue` defaults to `string`), so
  existing code keeps compiling. Two defects surfaced and were fixed along the way:

  - the native `<select>` carries only strings in the DOM, so `@change` emitted `"42"` instead of
    `42` — the value is now decoded back through the option list;
  - emptiness was tested with a falsy check, so `0` counted as "nothing selected". It is now an
    explicit `undefined | null | ''` test.

  Values are constrained to `string | number` (`GrSelectValue`): they must survive the round trip
  through a DOM string. Object models would need a key extractor and are out of scope. Custom values
  (`allowCustomValue`) are typed text and therefore stay strings.

- **One `size` scale for the whole package.** There were five incompatible ones, so
  `<GrConfigProvider size="xs">` could not apply to half the package and `size="xl"` compiled
  against one component and failed against its neighbour. Now:

  - **controls** use `GrComponentSize` (`xs | sm | md | lg`) — `GrIcon`, `GrKbd`, `GrLink`,
    `GrRating`, `GrSlider`, `GrStatistic` and `GrSwitch` gained `xs`, which is additive;
  - **overlays** use the new `GrOverlaySize` (`sm | md | lg | xl | full`) — `GrDrawer` gained `xl`,
    `GrCommandPalette` gained `sm` and `full`, also additive;
  - `GrAvatar.size` moves from a raw `number` to `GrComponentSize | number`. **This is the only
    real break, and it is source-compatible**: `size={40}` still renders 40 px, and the new default
    `md` is 40 px too, so nothing shifts. The number stays as an escape hatch — an avatar has always
    had an arbitrary diameter and there is no point breaking that for uniformity.

  `GrTextareaState`, `GrInputTagState`, `GrNumberInputState` and `GrTreeSelectState` are now aliases
  of one `GrControlState`; they were four independent copies of the same union, so a divergence would
  only have surfaced at runtime. A gate (`src/__tests__/sizeScale.test.ts`) fails on any component
  that declares its own scale or state again.

- **`GrConfigProvider` now reaches `GrIcon`, `GrKbd`, `GrLink`, `GrStatistic` and `GrAvatar`** —
  they had no `defaults.ts` and stayed outside the provider entirely.

- **`@headlessui/vue` and `@floating-ui/dom` moved from `dependencies` to `peerDependencies`** and are
  now `external` in the build, so they are no longer bundled into `dist`. Install them alongside the
  package:

  ```bash
  yarn add @feugene/granularity vue @headlessui/vue @floating-ui/dom
  ```

  Previously both were bundled **and** installed as runtime dependencies: an application already
  using HeadlessUI shipped two copies, and once the versions drifted, so did focus-trap behaviour.
  Nothing changes at the source level — the same components, the same API. `dist` drops from 890 KB
  to 797 KB of JavaScript (−93 KB): `chunks/useScrollLock-*.js` 51 KB → 1.6 KB,
  `chunks/useFloating-*.js` 48 KB → 4.5 KB.

### Added

- **`useOverlayLayer()` — one contract for overlay layering: Esc order, `inert`, restore focus.**
  Exported from the root barrel and as `@feugene/granularity/composables/useOverlayLayer`.
  `useDismissible()` stays as a narrow facade over it for non-modal popovers, so nothing built on it
  needs changing. The two internal stacks it replaces (`dismissStack`, `grModalTopStack`) are gone.

  They were **two registries of the same list** — every open overlay, in open order — answering two
  different questions: who gets Esc, and which modals to mark `inert`. Registries like that drift
  apart silently, and they had: **`GrDrawer` and `GrImageViewer` were in neither**, so a drawer
  opened over a modal never released focus to it, and a modal over a drawer never released focus
  either. Both are modal layers of the unified stack now and get `inert` for the first time.

  One list, but the two tops it yields are deliberately **different**: Esc goes to the last layer of
  *any* kind (a dropdown inside a modal closes itself first — that's what the user sees on top),
  while `inert` applies to modals below the last *modal* layer. Demoting a modal by any layer above
  it would send the window inert together with its own open dropdown and freeze it.

  The composable does **not** implement a focus trap, on purpose: HeadlessUI `Dialog` provides one
  for every modal-class overlay in the package, a second trap on top would only fight it, and a
  popover must not trap at all — Tab has to leave and close it. What is unified is focus **restore**:
  three hand-written implementations collapse into one rule — restore only if focus is still inside
  the layer when it closes. `GrDropdown`'s old heuristic ("restore if it was opened from the
  keyboard") missed in both directions: a mouse-opened panel never restored, and a keyboard-opened
  one stole focus back from wherever the user had moved it.

  Gate: `src/__tests__/overlayLayer.test.ts`.

### Fixed

- **`GrDataTable`: `selectable` now works without `v-model:selected`.** There was no internal
  selection state at all — checkboxes rendered, took clicks and never got checked. Selection now has
  an uncontrolled mode, like sorting in the same component always had.
- **`GrFormFile`: the remove button in multiple mode had no label.** `{{ removeText }}` (the raw
  prop, `undefined` by default) was rendered instead of `{{ resolvedRemoveText }}` — an empty button
  on screen and a button with no accessible name for screen readers.
- **`GrRadioGroup` implements the radio pattern's keyboard contract.** Arrows (`↓`/`→`, `↑`/`←`) move
  the selection and the focus around the group, and the group is a single `Tab` stop via roving
  tabindex. Previously every radio was its own tab stop and arrows did nothing.
- **`GrTabs` no longer drops out of the tab order entirely.** With a `modelValue` matching no tab —
  an empty initial value, an async list, a removed active tab — every tab got `tabindex="-1"` and the
  whole tablist became unreachable by keyboard, silently. Roving tabindex now always keeps exactly
  one tab reachable.
- **`GrCollapse`: a collapsed panel is now `inert`.** Collapsing was purely visual
  (`grid-rows-[0fr]`), so links and buttons inside closed sections were still focusable — focus
  travelled into a zero-height invisible area — and screen readers read every closed section, which
  directly contradicted `aria-expanded="false"` on the trigger.
- **`GrDropdownMenuItem` declares `role="menuitem"`.** The panel declares `role="menu"`, which makes
  children presentational: without the role a screen reader announced neither the item nor its
  position in the menu. `GrDropdown`'s own keyboard navigation also looks for `[role="menuitem"]`.
- **`GrFormField` now really labels every control it wraps.** The contract — label association,
  `aria-describedby` carrying the error text, `aria-invalid` — was honoured by 7 of 13 controls;
  for the rest `<label for>` pointed at nothing, so clicking the label focused nothing and the error
  message was linked to no field at all. `GrCheckbox`, `GrSwitch`, `GrRadioGroup`, `GrNumberInput`,
  `GrFormFile` and `GrFileUpload` now read the field context.

  Where the widget is a labelable element (`GrSwitch`'s `<button>`, `GrNumberInput`'s and
  `GrFileUpload`'s `<input>`, `GrFormFile`'s upload button) it takes the field's `id`, so clicking
  the label focuses it. Where it is not — `GrCheckbox` (`span[role="checkbox"]`) and `GrRadioGroup`
  (`div[role="radiogroup"]`) — the name arrives via `aria-labelledby` pointing at the label, which is
  why the context gained a `labelId`. Notably, `GrCheckbox` takes the id on the widget itself rather
  than on its hidden native input: that input is `aria-hidden` and outside the tab order, so a label
  pointing at it led into an invisible element.
- **Escape now closes the overlay you actually see.** A dropdown, select, tree-select, tooltip or
  autocomplete panel opened **inside a modal** used to close the modal instead of itself: modals
  listened on `window` in the capture phase and swallowed the event with `stopImmediatePropagation`,
  while the floating components listened on `document` in the bubble phase and never got their turn.
  All dismissible overlays now share one stack, so Escape addresses the topmost layer and the next
  Escape closes the one below. `GrImageViewer` joined the stack too — its local handler meant that a
  viewer opened over a modal closed the modal.
- **`GrImageViewer` no longer crashes server-side rendering.** A `watch(…, { immediate: true })` ran
  `new Image()` synchronously during `setup`, regardless of `modelValue` — so any SSR page that
  merely *contained* a closed viewer died with `ReferenceError: Image is not defined`. Neighbour
  preloading now starts in `onMounted`.
- **`GrCollapseItem` and `GrSegmented` build their ids with `useId()`** instead of `instance.uid`.
  The old counter is application-wide: it keeps growing between requests on the server and restarts
  from zero on the client, so `id`, `aria-controls`, `aria-labelledby` and the hidden input's `name`
  silently diverged on hydration.
- **`GrCommandPalette` resolves the platform in `onMounted`.** `isAppleDevice()` used to be read
  during the first render, which would make the server print `Ctrl` and a macOS client `⌘`. In
  practice the mismatch was unreachable — HeadlessUI withholds modal content from SSR entirely — so
  this is hardening, not a user-visible fix.
- **Granular imports no longer lose colours, shadows and focus rings.** `GrSelect`, `GrSlider`,
  `GrAutocomplete`, `GrDropdown`, `GrDrawer` and `GrRating` declared only part of their utility
  classes in `safelist`; the rest lived as string literals in `*Styles.ts` helpers, which the
  bundler hoists into the shared `dist/chunks/` — outside the `dist/components/<Name>/**` directory
  the preset scans. A consumer importing `@feugene/granularity/components/GrSelect` alone got a
  select with no focus ring and a panel with no background or shadow. The showcase hid the defect,
  because neighbouring components on the page generated the same utilities.

- **`typecheck` is green again** — 14 `vue-tsc` errors in the package's own test suite are fixed
  (`GrNumberInput`, `GrDataTable`, `GrDropdown`, `GrRadioGroup`, `GrSegmented`, `GrSlider`,
  `GrTreeSelect`). Since `.d.ts` files are emitted by `vue-tsc` at build time, a red typecheck was a
  standing risk to the published types.

### Changed

- **CI now runs `lint` and `typecheck`** (job `quality-granularity`), and both gate every build and
  publish job. `lint` had been commented out and `typecheck` never ran at all.

### Added

- **A form-control contract, and `useGrFormControl()` to implement it** — `disabled`, `readonly`,
  `invalid`, `required`, `ariaLabel` merged from the control's own props and the surrounding
  `GrFormField`, plus `focus()`/`blur()` exposed. `GrFormField` gained a `readonly` prop, so
  "read-only form" no longer means reaching into every control — or abusing `disabled`, which also
  stops the value from being submitted.

  **All 15 controls now honour it** — `GrInput`, `GrTextarea`, `GrNumberInput`, `GrSelect`,
  `GrAutocomplete`, `GrTreeSelect`, `GrInputTag`, `GrCheckbox`, `GrRadioGroup`, `GrSwitch`,
  `GrSlider`, `GrRating`, `GrSegmented`, `GrFormFile`, `GrFileUpload`. Before this, `readonly`
  existed on 3 of them, `required` on 2, `focus()` on 3 and `blur()` on none. All props are
  additive — nothing breaks.
- **Tests for the seven components that had none** — `GrResponseErrorBanner`, `GrTabPanels`,
  `GrDropdownMenu`, `GrDivider`, `GrKbd`, `GrIcon`, `GrButtonGroup` (+52 tests). Every component in
  the package now has a test file. The error-banner suite exercises the parser chain directly,
  without mounting: what is hard there is parser order and priorities (abort stops the chain, field
  errors outrank the status code, the core preset makes no backend-specific assumptions), not
  rendering three paragraphs.
- **`useDismissible()` and `useFloating()` are public** — root barrel and
  `@feugene/granularity/composables/*` subpaths. A consumer's own popover or menu can now be built
  on the same positioning engine and, crucially, register in the same dismiss stack; otherwise its
  layers drift apart from the library's on Escape.
- **SSR gate in CI** (`test-playground-ssr`). The stand grew a third page covering the components
  where the risks actually were — `GrImageViewer`, `GrCommandPalette`, `GrCollapse`, `GrSegmented`,
  `GrDrawer`, `GrTreeSelect`, `GrSlider`, `GrTree`, `GrDataTable`, `GrFileUpload`, `GrToaster` — and
  asserts both a clean `renderToString` and a hydration free of mismatches.
- **Safelist gate** (`src/__tests__/safelist.test.ts`): every utility class written as a string
  literal in a component's `.ts` helpers must be declared in that component's `safelist`. The rule
  is deliberately stated over sources rather than over `dist` — a gate reading `dist` would stay
  green only until the next change in chunking.

## [v0.13.0] 2026-07-28

### Changed

- **`GrButton`, `GrInput` and `GrBadge` no longer declare their configurable props' defaults in
  `withDefaults`** — the defaults moved into the resolvers, which is what makes `GrConfigProvider`
  able to override them. Rendering is unchanged, but reading such a prop from the outside (through
  a template ref or a wrapper) now yields `undefined` until it is explicitly passed: `variant`,
  `tone`, `size`, `square` on `GrButton`; `size`, `clearable` on `GrInput`; `tone`, `size`, `radius`
  on `GrBadge`; `size`, `variant`, `underline`, `clearable` on `GrSelect`; `size`, `clearable` on
  `GrAutocomplete`; `size`, `variant` on `GrSegmented`; `size` on `GrNumberInput`, `GrSlider`,
  `GrRating`, `GrSwitch` and `GrRadioGroup`.
- **Unified CSS token namespace under `--gr-*`.** The previously unprefixed shadcn-style semantic roles
  (`--bg`, `--fg`, `--card`, `--muted`, `--brd`, `--ring`, `--primary`, `--secondary`, `--accent`,
  `--destructive`, `--chart-*`, `--sidebar-*` and their `-fg`/`-hover`/`-active` variants) could collide
  with the consuming app's own CSS variables. Every token now lives in a single `--gr-*` namespace with
  three layers (primitives → semantic roles → per-component tokens), defined in the themes
  (`light.css`/`dark.css`) and formulas (`tokens.css`); all components reference only `--gr-*`. Theme
  customization is done via `--gr-*` (e.g. set `--gr-primary` to re-theme).

### Added

- New `GrConfigProvider` — one place for the design system's global defaults, provided to the whole
  subtree via `provide`/`inject` and rendered transparently (`display: contents`), so it never
  affects layout. Providers nest: a child merges over its parent down to the individual prop, which
  lets you set a global rule and override one detail deeper in the tree.
  - `size` — the default size for nested form controls. Read by `GrButton`, `GrInput`, `GrSelect`,
    `GrAutocomplete`, `GrNumberInput`, `GrSegmented`, `GrSlider`, `GrRating`, `GrSwitch`, `GrRadio` and
    `GrRadioGroup`. `GrBadge` deliberately opts out — a badge is a display element and should not grow with
    the surrounding controls; its size is configurable per component instead.
  - `componentDefaults` — default props keyed by component name, e.g.
    `{ GrButton: { variant: 'outline' } }`. The set of configurable props is deliberately closed —
    `GrButton` (`variant`, `tone`, `size`, `square`), `GrSelect` (`size`, `variant`, `underline`,
    `clearable`), `GrInput` and `GrAutocomplete` (`size`, `clearable`), `GrSegmented` (`size`,
    `variant`), `GrBadge` (`tone`, `size`, `radius`), and `size` alone for `GrNumberInput`,
    `GrSlider`, `GrRating`, `GrSwitch`, `GrRadio` and `GrRadioGroup` — so the config can shape
    appearance but never a `modelValue` or an event handler, and a typo in a component or prop name
    is a type error.

    Each component declares its own contract in its folder (`GrButton/defaults.ts`) and registers it
    through declaration merging, so `GrConfigProvider` knows nothing about concrete components. The
    practical consequence for consumers: `componentDefaults` is typed with exactly the components you
    imported — pull in only `GrButton` and `GrBadge`'s types never enter your project.
  - `i18n` — the translation adapter, passed down without a manual `inject`. Only provided when
    given explicitly, so it never shadows an adapter the application installed higher up.

  Imperative dialogs inherit the config too. `useDialogService` mounts its host outside the component
  tree, where `inject` can only see `app.provide()` values, so the service captures the config at the
  point where `useDialogService()` is called and the host hands it to the dialog. Capture happens in
  `useDialogService()`, not in `confirm()` — obtain the service in `setup` of a component inside the
  provider; a module-level singleton has no tree to read. Priority inside a dialog: call options →
  `useDialogService(defaults)` → provider → component defaults. Teleported overlays (`GrModal`,
  `GrDrawer`, the `GrSelect` panel) were never affected: they keep the component chain.

  A local prop always wins over the config; the config wins over the component's own default. To
  make a prop configurable a component resolves it through `useGrComponentSize()` /
  `useGrComponentProp()` and declares its `withDefaults` entry as `undefined` — otherwise Vue would
  substitute the default before the component ever looks at the config.
- `resolveGrConfig(source)` — reads the config where `inject` is unavailable (directives, imperative
  services, utilities): from an explicit context, from a source's `provides`, or from `inject` when an
  instance is active. Mirrors the existing `resolveGranularityI18n()`.
- `useGrComponentSize()` gained a `supported` option so a component can declare the size scale it
  actually implements (`GrSlider`, `GrRating`, `GrSwitch`, `GrLink` and `GrStatistic` have no `xs`).
  A size coming from the provider that the component does not support is ignored in favour of the
  component's own default instead of silently producing an element with no size classes.
- New `GrCommandPalette` — a ⌘K command palette: a modal search over the application's commands with
  groups, icons, per-command shortcut hints and keyboard navigation. Opens on a global hotkey
  (`hotkey`, default `mod+k` — Cmd on macOS, Ctrl elsewhere; pass `null` to drive it purely through
  `v-model`). Search covers a command's label, description, group and `keywords` synonyms; set
  `:filterable="false"` to hand filtering over to the owner via the `search` event with externally
  supplied `items` and `loading` (remote search). Slots `#item` / `#empty` / `#footer` for a custom
  command row, empty state and footer. A11y: the input is `role="combobox"`, the list is
  `role="listbox"` and the active command is pointed at with `aria-activedescendant`, so focus never
  leaves the search field (Arrow / Home / End / Enter). It renders inside `GrModal`, reusing its Esc
  stack, focus trap and body scroll lock; the pure parts — filtering/grouping (`filtering.ts`) and
  hotkey parsing/matching (`hotkey.ts`) — live in separate modules and are tested without mounting.
- New `GrRating` — a symbol rating scale for both collecting a score and displaying someone else's.
  Supports whole and half values (`allow-half`), reset on a repeated click (`clearable`), a hover
  preview of the score, `readonly` / `disabled`, an optional numeric caption (`show-text` +
  `format-text`), tones and sizes. The default symbol is an inline SVG star; pass any UnoCSS icon
  class through `icon` or take over rendering with the `#symbol` slot. A11y: the editable scale is a
  WAI-ARIA slider (`role="slider"` with `aria-valuemin`/`max`/`now`/`valuetext`, Arrow / Home / End),
  while `readonly` renders as `role="img"` with the score in its label — it is not a control, so it
  stays out of the tab order. Integrates with `GrFormField`.
- New `GrStatistic` — a large key metric with a caption: number formatting (`precision`,
  `group-separator`, `decimal-separator`), `prefix` / `suffix`, an icon, a value tone, a trend line
  (`trend` `up`/`down`/`flat` + `trend-text`) and a `loading` state that keeps the block's height so
  dashboards do not jump. Non-numeric values (`"2 h 15 min"`, `"—"`) are rendered as-is. Formatting
  is a pure exported function, `formatStatisticValue()`. Slots: `#icon`, `#title`, `#prefix`,
  `#suffix`, `#trend` and the default slot for the value itself.
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

- **`GrToaster` action button.** `useToast().push` now accepts an optional
  `action: { label, onClick, dismissOnClick? }` — the toast renders a button in its body. By default a
  click runs `onClick` and dismisses the toast; `dismissOnClick: false` keeps it open (e.g. a "Retry"
  action on a sticky error). New exported type `ToastAction`.
- **`GrPagination` compact variant and page jumper.** New `compact` prop replaces the numbered page
  buttons with a "current / total" indicator for tight spots (mobile, table toolbars). New `show-jumper`
  prop adds a "go to page" input that jumps on Enter/blur, clamping the value to `[1, pageCount]`
  (label via `jumper-label` / the new `gr.pagination.jumpTo` string, localized en/ru/es).
- **`GrSelect` filtering, loading and tag mode (panel view).** New `filterable` prop shows a search box
  over the option list independent of `allow-custom-value` (with a `no results` state); `loading` +
  `loading-text` render a spinner instead of options for async option loading; `tags` renders a
  `multiple` selection as removable chips (with per-chip remove) instead of the "a, b, c" string. All
  three force `options-view="panel"` (impossible in a native `<select>`). New `gr.select.*`
  strings (`searchPlaceholder` / `loading` / `noResults` / `removeTag`), localized en/ru/es.
- **`GrTable` / `GrDataTable` sticky header, row selection and loading.** `GrTable` gained
  `sticky-header` + `max-height` (header stays visible on vertical scroll). `GrDataTable` gained
  `selectable` with a leading checkbox column and a "select all" header checkbox (model via
  `v-model:selected` by row key, with indeterminate state), plus a `loading` prop that swaps the body
  for a spinner row. Its built-in empty text is now localized (`gr.dataTable.*`, en/ru/es).

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
