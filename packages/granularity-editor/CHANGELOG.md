# Changelog

All notable changes to the [`@feugene/granularity-editor`](.) package are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres
to [Semantic Versioning](https://semver.org/).

## [Unreleased]

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
