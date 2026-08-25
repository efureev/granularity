# Changelog

All notable changes to the [`@feugene/granularity-editor`](.) package are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres
to [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [v0.2.2] 2026-08-25

### Fixed

- **Пузырьковый тулбар больше не вылезает за край панели.** Панель поповера ограничена
  `max-width` в 22rem, а квадратная кнопка не сжимается — `min-w` в `GrButton`. Десять кнопок
  ступени `sm` (размер поля `md` и `lg`) занимали 356px против 330px доступных, и последняя
  кнопка выходила за скруглённый край наружу: у панели `overflow: visible`, так что её не
  обрезало, а именно выносило поверх границы. На ступенях `xs` и `sm` набор укладывался, поэтому
  поломка была видна только на двух размерах из четырёх.

  Закрыто с трёх сторон. Кнопка пузырька теперь всегда самой мелкой ступени независимо от размера
  поля: панель сверху живёт в раме поля и растёт вместе с ним, а пузырёк висит над читаемым
  текстом, и там уместна наименьшая площадь — 28×28 при требуемых WCAG 2.2 двадцати четырёх.
  Поповер получил `padding="none"`, а поле перешло на сам пузырёк: 20px поля панели — это две
  трети кнопки. И ряд научился переноситься, чего не умел вовсе.

- **Пузырёк снял потолок ширины поповера.** `GrPopover` по умолчанию держит `22rem` — читаемую
  ширину колонки текста, — а пузырёк несёт тулбар, которому эта мера чужая. Потолок снимается
  хуком `--gr-popover-max-width`, появившимся в ядре. Предел «не шире вьюпорта» остаётся: он
  второй операнд `min()` и хуком не снимается.

  Ступень кнопок при этом осталась мельчайшей — но теперь это решение об оформлении, а не обход
  ограничения: пузырёк висит над читаемым текстом, и там уместна наименьшая площадь.

- **Обе панели переносятся группами, а не отдельными кнопками.** Перенос по кнопкам рвёт ряд там,
  где кончилось место, и разлучает кнопки одного смысла: «Заголовок» остаётся в одной строке,
  «Подзаголовок» уезжает в другую, причём без разделителя между ними. Группа стала обёрткой с
  `flex-none` и переносится целиком со своим разделителем.


## [v0.2.1] 2026-08-25

### Fixed

- **The package tarball now ships `LICENSE`.** The manifest has always declared
  `"license": "SEE LICENSE IN LICENSE"`, and the file it points at was not there: `npm` adds
  `LICENSE` to a tarball on its own, but only when the file exists in the package directory.
  A consumer's compliance scanner reads a licence reference that resolves to nothing and flags
  the dependency as unlicensed — a refusal on formal grounds, before anyone reads the terms.

  The copy is byte-identical to the one at the repository root and is kept that way by
  `yarn check:licenses`, a gate in CI: eleven copies of a 598-line file drift silently, and they
  drift exactly when the licence text is being edited.

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

## [v0.2.0] 2026-08-23

### Added

- **`#header` and `#footer` slots — bands inside the field.** The component had exactly two zones,
  the toolbar and the text, so a caption or a character counter had to sit outside the border: it
  read as a separate element, since the border framed only the text and the link to the field rested
  on proximity alone. Both zones are optional and turn on by the mere presence of the slot; they are
  separated by a border from the inside, like the toolbar, because the line belongs to the boundary
  between zones — at the edge of the field it would meet the rounded corner. Neither carries a
  background: `--gr-muted` is the toolbar's because it is a control panel, while these hold the
  consumer's own content.

## [v0.1.3] 2026-08-21

### Added

- **Each toolbar action now carries its keyboard shortcut** (`GrRichTextAction.shortcut`, in TipTap
  notation: `Mod-B`, `Mod-Alt-2`, …). The component does not render it — the field is there for
  whoever builds their own panel or writes a hint. The values are read from the extensions' own
  sources, because the shortcuts belong to them, not to this package.

### Fixed

- **The bubble toolbar works at all.** With `toolbar="bubble"` (and `"both"`) nothing showed up at
  the selection: the buttons sat in the popover's default slot, and the panel renders only the
  `content` one — it opened empty. Filled, it then closed in the frame it opened: the panel takes
  focus by default, the field loses it, and blur clears the anchor. The panel no longer autofocuses,
  and a bubble button no longer steals focus on `mousedown` — without that the bubble vanished under
  the cursor after the first format and the second could not be applied. `Esc` closes it; an outside
  click does not, because a drag-select ends with exactly that click.

## [v0.1.2] 2026-08-21

### Fixed

- **`schema` and `extensions` now take effect on a live field.** Both were read once, at mount: after
  that, switching `schema` moved the **toolbar** without touching the document rules — a «Heading»
  button on a schema that allows no headings. Changing them now rebuilds the editor, because a
  ProseMirror schema is immutable: the document and the commands are derived from it.

  Content is carried over as **markup**, not as a document. JSON is parsed strictly, and the first
  node missing from the new schema takes the whole text with it; HTML is parsed leniently — a heading
  becomes a paragraph and what was written survives.

## [v0.1.1] 2026-08-21

### Fixed

- **Toolbar buttons draw icons instead of a letter.** A button used to print the first letter of its
  label, and the letters collided: `B` was both Bold and Bulleted list, `H` both headings, `C` both
  inline code and code block. The panel looked broken because it was unreadable — no action could be
  picked without hovering every button.

  Icons are inline SVG shipped with the package, not `i-lucide-*` classes: an icon class is generated
  by the application's UnoCSS build, so a consumer without their own `presetIcons` would get blank
  squares — the same unreadable panel, now on their side. The label stays as the button's accessible
  name and is now also its `title`.

## [v0.1.0] 2026-08-21

### Added

- **`GrRichText` — a formatted-text field on TipTap.** A product description, an email body, an
  article: `GrTextarea` gives plain text, and everything else had to be built by hand. TipTap over
  ProseMirror is 200 KB+, which is exactly the criterion for a companion package rather than the
  core.

  Two ready schemas: `minimal` (bold, italic, link, list) and `article` (plus headings, quote, code
  block). Neither offers a first-level heading: `h1` belongs to the page, not to a field inside it,
  and an editor that lets you insert a second one breaks the document structure of someone who was
  merely typing.

  **The schema is the sanitiser.** Content is parsed against the schema, nodes and marks outside it
  are dropped, and output is serialised from that same tree — `<script>`, `<iframe>` and `<img>` do
  not survive a paste. That is proven by a test, not promised, and it is why the package ships no
  separate sanitiser.

  The toolbar is built from the schema rather than written as markup: hand-written buttons would
  drift from the schema silently, leaving a button whose command no longer exists. It is a
  `role="toolbar"` with **one `Tab` stop** and arrow navigation inside — the article schema has ten
  buttons, and without this the text itself would be ten presses away. The active format is exposed
  as `aria-pressed`: highlighting does not exist for a screen reader.

  The value shape is a prop, not a behaviour: `output="html"` or `output="json"`.

- **TipTap is a peer dependency.** ProseMirror must be a single instance in the application; a second
  one means two schema registries and a crash on the consumer's first custom extension.

- **No content is rendered on the server.** ProseMirror needs the DOM, so the editor is created in
  `onMounted` and the server emits a shell marked `data-allow-mismatch`. `v-html` is absent on
  purpose: printing untrusted markup for the sake of the first frame would introduce the package's
  only XSS surface precisely where the data is least trusted. The SSR stand covers this with a
  hydration case.
