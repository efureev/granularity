# Changelog

All notable changes to the [`@feugene/granularity-code`](.) package are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres
to [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [v0.2.0] 2026-09-01

### Added

- `--gr-code-editor-placeholder` — hook token for the empty-editor hint colour.

- `grCode.diff.lineAdded` / `grCode.diff.lineRemoved` in all three locales.

### Fixed

- **The editor placeholder failed AA contrast in both themes.** `grTheme` styled the background,
  caret, selection, active line and gutters but left `.cm-placeholder` to CodeMirror's built-in
  `#888`: 3.2:1 on the light surface and 2.9:1 on the dark one, against the 4.5:1 threshold. It now
  reads `--gr-code-editor-placeholder`, defaulting to `--gr-muted-fg` — 5.7:1 and 5.0:1.

  Nothing caught it because the showcase page was outside the axe sweep: the package was never
  wired into `apps/showcase/e2e/components.ts`, so `GrCodeBlock`, `GrCodeEditor` and `GrDiff`
  were scanned by neither axe nor the visual layer. The sweep now covers them.

- **`GrCodeEditor`: a failed validation moved the form to the editor without putting the caret in
  it.** `GrForm` finds the control of a field by selector —
  `input, select, textarea, button, [tabindex]:not([tabindex="-1"])` — and that is how both
  `scrollToField` and the focus-first-error path work. A `contenteditable` node is focusable
  without `tabindex`, but it does not match that selector, so the form found nothing inside the
  field at all. `.cm-content` now carries `tabindex="0"`, on the same node that carries the role.

- **`GrDiff`: added and removed lines are no longer distinguished by colour alone.** The row tone
  carried the whole message: the `+`/`−` sign next to it is `aria-hidden`, deliberately, so that
  a screen reader would not read "plus" before every line. The side effect was that it read nothing
  at all — added, removed and unchanged lines came out identical, and a diff that cannot say what
  changed is not a diff. Changed lines now carry a visually hidden label (`added` / `removed`,
  translated) in both layouts; context lines stay silent so the marker does not appear on every
  line of the file. Axe never caught this — roles and contrast were fine all along.

## [v0.1.1] 2026-08-31

### Fixed

- **The peer floor on the core is `>=0.41.0`, not `>=0.40.0`.** `GrCodeBlock` left the core in 0.41.0, so with
  0.40.0 installed the component would arrive twice — once from the core barrel and once from here, with two
  granular providers declaring the same name. The floor now states what the package actually needs.

## [v0.1.0] 2026-08-31

### Added

- **Three code surfaces in one package: view, edit, compare.** `GrCodeBlock` shows, `GrCodeEditor` edits,
  `GrDiff` compares. The question "which one do I reach for" now has one answer in one place instead of
  spanning two packages.

- **`GrCodeBlock` moved here from the core**, which is a breaking change to the core's public surface — the
  `@feugene/granularity/components/GrCodeBlock` subpath is gone. The argument is not tidiness but a ceiling:
  inside the core the block could never gain highlighting for an arbitrary language, because that needs a
  dependency and the core takes none. Here the ceiling lifts. Doing it before 1.0 is the whole point — after
  1.0 the same move costs a major across the ecosystem.

  Migration is two lines: install `@feugene/granularity-code` and change the import. Props are unchanged, and
  so are the `--gr-code-block-*` tokens — anyone who themed the block keeps their overrides.

- **Highlighting is a contract, not a dependency.** Components require one function,
  `(code, language) => GrCodeLine[] | Promise<...>`, shaped after the core's `GranularityI18nAdapter` and for
  the same reason: the package declares a need, the application picks the supplier. Shiki appears nowhere in
  the manifest, not even among type imports. A `createShikiTokenizer` adapter ships for convenience and is the
  single file that can break on a Shiki major.

  The palette is eleven roles on seven colours, and the grouping is a design decision: names of declared things
  share one colour, values get their own, keywords accent, comments dim. The theme offers eight well-separated
  text roles, and inventing a ninth by formula would mean a colour the theme cannot override. Every pair is
  checked for contrast against the background and for distance from every other role.

- **A consumer theme now actually wins.** The package ships no themes on purpose — colours come from
  `--gr-code-block-*` so code follows the app's theme — but `extensions` is documented as taking any CodeMirror
  extension, and a theme is one. It did not work: our `HighlightStyle` was registered at normal precedence and
  beat anything passed later, so the extension arrived and silently did nothing. Ours is now `fallback` and
  the theme sits at `Prec.lowest`; removing the theme restores the default.

- **Two more surfaces became themable.** The text colour on word-level highlighting and the gap row's
  background were roles of the app theme rather than tokens. Recolouring the code palette therefore left a
  light band inside a dark diff, and let you change a highlight's background without changing the text on it —
  which breaks contrast exactly where it is hardest to notice. Both are hooks now:
  `--gr-diff-word-added-fg`, `--gr-diff-word-removed-fg`, `--gr-diff-gap-bg`.

- **The diff parses code the same way the block does.** `GrDiff` only ever coloured through a supplied
  tokenizer, so the same JSON was grey next to a `GrCodeBlock` that painted it — and comparing what you were
  just looking at is the common case. It now falls back to the shared built-in parser, and when the inputs are
  values rather than strings it defaults to `json`: the component serialized them itself, so it knows.

- **The code surfaces no longer blow out grid and flex parents.** All three scroll long lines themselves, but a
  grid item defaults to `min-width: auto` and stretches to its content instead — a gateway log ran past the
  card edge and took the copy button with it. `min-w-0` on each root, held by a gate.

- **An empty `hunks` array is an empty comparison.** A server answering "nothing built yet" rendered as a blank
  frame, because emptiness was only recognised for empty strings.

- **Gaps open in steps, from either edge.** A thousand-line diff used to hide five hundred lines behind one
  button, and pressing it dropped all of them into the flow at once — the change you came for slid out of the
  viewport, which read as "the lines disappeared". The gap now carries two controls and a counter: N lines
  from the top, N from the bottom, `expandStep` (10 by default, configurable through `GrConfigProvider`).
  A remainder smaller than one step opens whole, because a button that will not open anything is a dead end
  users trust exactly once.

  Expanding from the top holds the gap in place. Lines land *above* it, and without compensating for their
  height the content slides down by exactly that much. The growth is measured rather than computed from
  rows × height, since row height follows font size and wrapping.

  The gap id is the position of the run's **first** line, not the first hidden one. Keyed by hidden lines it
  would shift on every step, and the state would lose its own gap: a second press would reopen it from zero.

- **Virtualization actually virtualizes now.** `useVirtualList` hands over spacer heights as variables and
  leaves the pseudo-elements to the component; `GrDiff` set the variables and never declared the rule. The
  container stayed one viewport tall, could not scroll at all, and only the first dozen rows of any diff were
  reachable — with valid markup and green tests. `virtualSpacer.test.ts` now holds the rule, byte for byte
  against the core's copy.

- **The built-in parser reaches CodeMirror through decorations.** A string `language` carries a name, not a
  grammar, so `language="json"` used to leave the editor colourless while `GrCodeBlock` beside it coloured the
  same text — and the colour vanished at hydration, because the server markup did paint it. One parser
  (`highlight/builtIn.ts`) now feeds all three: the block, the editor's server markup, and a CodeMirror
  plugin. A gate compares CodeMirror's output against that parser token by token, because divergence here is
  invisible to everything except an eye.

  Only the visible window is decorated. The plugin recomputes on every keystroke, and parsing the whole
  document — plus the `doc.toString()` copy it needs — would make the cost of typing scale with file size:
  0.014 ms against 1.103 ms per keystroke on 5000 lines. What makes the window possible is line locality:
  JSON holds no newline inside a token. A language that needs context from neighbouring lines wants a real
  grammar, and that is a boundary rather than a gap.

- **`GrDiff` carries no dependencies at all** — its own Myers, its own word-level pass, its own rendering.
  `@codemirror/merge` would have meant less code here and a mandatory CodeMirror for everyone who only wanted
  to read what changed, which is the more frequent of the three scenarios.

  The diff has a **budget**, and that is not caution: Myers scales with edit distance, so two entirely different
  ten-thousand-line files are a frozen tab — a failure the user meets, not the developer. Past the budget the
  pass coarsens and says so; the diff stays correct, just less detailed.

  Objects are serialised with a **stable key order**. Without it two objects with identical content and
  different insertion order would show invented differences — an edit where there was none.

- **`GrCodeEditor` keeps the cursor.** Incoming `v-model` changes are applied as a minimal-replacement
  transaction, not by replacing the document: the naive wrapper resets cursor, selection and undo history on
  every round-trip, which is every keystroke. Changes born in the editor are annotated and never re-applied.

  **`Tab` moves focus by default.** A code editor inside a form that cannot be left by keyboard is a trap, and
  the Save button sits behind it. Indentation is opt-in via `tabIndents`, and then `Esc` releases the key —
  with a hint under the field, because silently changing what a key does is not an option.

  Validation is a `validate` prop rather than `@codemirror/lint`: it renders through our own tokens, works for
  a server's validation response as readily as for `JSON.parse`, and adds no fifth peer dependency.
