# Changelog

All notable changes to the [`@feugene/granularity-forms-schema`](.) package are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres
to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Fixed

- **`GrConfigProvider` now actually configures `GrSchemaForm`.** All four declared keys
  — `columns`, `labelPosition`, `labelWidth`, `headingLevel` — were registered as
  configurable and never read: the package contained no call to `useGrComponentProp` at
  all. `headingLevel` would not have worked even then, because it carried a default of
  `3` in `withDefaults`, which Vue substitutes before the component can consult the
  provider. Resolution order is now the usual one: prop → `uiSchema` → provider →
  built-in default.

## [v0.1.1] 2026-08-19

### Changed

- **Control-scale font sizes now ship a paired line height.** Every place that sets a control
  font size now sets the matching `leading-*` next to it, from the core's new
  `--gr-control-leading-*` steps. Before this the line height was inherited from the host
  application's `body`, and inherited as an absolute value — so how airy a caption looked was
  decided by someone else's CSS reset. Requires core `>=0.27.0`.

## [v0.1.0] 2026-08-18

### Added

- **First release — a form built from the schema your backend already has.** `GrSchemaForm` turns a
  zod schema or a JSON Schema document into real design-system fields: `GrForm` orchestrates,
  `GrFormField` carries the labelling and ARIA, `GrFormSection` groups, and the core controls do the
  input. The package draws nothing of its own except the column grid, and that is the point — a
  generated form has to look and behave exactly like a hand-written one, down to the wording of its
  error messages.

  Along with the form come `GrSchemaField` — a single field for one schema node, which is how "almost
  everything generated, two fields hand-written" works — and `GrSchemaArrayField`, the repeater for
  arrays of objects.

- **Validation in three tiers, and you can see which is which.** What fits the core's declarative
  rules becomes one (`required`, lengths, bounds, `email`, `url`, files). What the neutral model can
  express but a core rule cannot — integers, `multipleOf`, exclusive bounds, uniqueness, "must be
  checked" — becomes a local validator. Everything else — `refine`, cross-field conditions,
  branching — is left to a single full check by the schema itself, which stays the source of truth.
  `compiledRules` is exposed because the one question this kind of package gets in production is
  *why is this field not being validated*.

  Messages come from the schema only when their author wrote one; otherwise the text comes from the
  core's own resolver, in the core's locale.

- **Adapters ship as separate subpaths** — `./zod` and `./json-schema` — so installing one keeps the
  other out of the bundle. Both are optional peers. Between them sits `./model`: a neutral, fully
  serialisable description with **zero imports** — not Vue, not the core, not a schema library. A
  third adapter is written against that one file.

  What an adapter could not parse is reported, not swallowed: it arrives as `model.warnings`.

- **Repeaters for arrays of objects**, with add, remove, reorder and duplicate, `minItems`/`maxItems`,
  keyboard operation and live-region announcements. Row buttons carry their position in the
  accessible name — ten identical "Remove" buttons are indistinguishable to a screen reader.

- **`uiSchema` keeps presentation out of the contract**: order, sections, columns, spans, labels,
  widget overrides and conditional visibility, addressed by *template* path (`items.*.qty`) so a rule
  written once survives any row being deleted. A field hidden by a condition drops out of validation
  too — otherwise submission would be blocked by a field that is not on screen.

- **Server-side field errors** parsed from Laravel, JSON:API and RFC 7807 shapes, with paths
  normalised (`items[0].name` → `items.0.name`) and aliases for renamed fields. An error whose field
  the form does not render is shown as a summary rather than dropped: "saving failed and nowhere says
  why" is the worst possible outcome.

- **i18n:** the `grForms` block in `en`, `ru` and `es` — repeater controls, live-region announcements
  and the messages for checks the core does not have.
