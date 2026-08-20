# Changelog

All notable changes to the [`@feugene/granularity-forms-schema`](.) package are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres
to [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [v0.3.1] 2026-08-20

### Fixed

- **`uiSchema` could not disable a field inside a repeater row.** `GrSchemaField` resolves
  `props.disabled ?? uiSchema ?? form`, and every caller passed a literal `false` down — which
  short-circuits both lower tiers. A field marked `disabled` (or `readonly`) for
  `items.*.name` stayed editable, with nothing to indicate why. `false` now means "no opinion" and
  is not forwarded; only `true` travels down.

### Changed

- **The node-kind switch lives in one place.** Array-of-objects, union, nested object and leaf field
  were dispatched by four separate copies of the same `v-if` chain — the form root, both branches of
  `SchemaObjectNode` and the repeater row. That is how the union branch shipped missing from two of
  them in `0.3.0`. The chain now lives in `SchemaNodeSwitch.vue`, and the `structuralKinds` gate
  fails both when a caller stops delegating to it and when a caller grows a copy of its own.

  Internal only — no public component, prop or slot changed.

## [v0.3.0] 2026-08-20

### Added

- **Branching schemas now build a form.** A discriminated union — delivery method, payment type,
  document kind — used to be a promise the package did not keep: the model had `kind: 'union'` and
  the zod adapter even built it, but without an initial value nothing rendered at all, and with one
  the discriminator came out as a **free text field**, so the only way to pick a branch was to guess
  and type `pickup`. The form now renders a branch switcher (up to five variants as radios, more as
  a select) and the fields of the selected variant beneath it.

  Switching rewrites the value: keys the new variant also has are kept, foreign ones are dropped,
  the discriminator is set. Keeping foreign keys is not an option — the schema rejects them — and
  resetting everything would lose shared fields such as a comment that every variant carries.

  The discriminator itself is **not** drawn as a field: the switcher owns it, and a second field
  under the same name would fight it for the value.

- **JSON Schema learned to branch.** `oneOf`/`anyOf` over object variants becomes a union, with the
  discriminator found two ways: `discriminator.propertyName` (the OpenAPI extension, whose type was
  declared and never read) or inference — the key that carries a `const` in every variant, which is
  how plain JSON Schema writes it. Properties sitting next to `oneOf` belong to every branch and are
  merged into each variant, so a shared field need not be repeated. Neither path resolves — the node
  stays residual and now says so through `model.warnings`, which the docs had been promising all
  along.

- **`oneOf` of bare `const`s is an enum, not a branch.** It used to be marked residual and rendered
  as a free text input; it now becomes a choice with per-branch `title` as the label.

- **Free-form keys are editable.** `additionalProperties` with a value schema (and `catchall` /
  `looseObject` in zod) keeps that schema in the new `additionalValue` node, and the object renders
  a list of key–value pairs with add, rename and remove. The value is an ordinary control built from
  the stored node, so its constraints apply as they would to a declared field. The `additional` flag
  itself was written by four places and read by none.

  `additionalProperties: true` renders nothing: keys are allowed, but the schema never said what the
  value looks like, and inventing a text field would silently lose the type.

### Fixed

- **A resolved union no longer runs the whole schema for nothing.** The zod adapter set
  `residual: true` on every union unconditionally, which made a parsed branch indistinguishable from
  an unparsed one and dragged the full schema check along with it. It is now set only when the
  branch could not be resolved — and that case also emits a warning instead of staying silent.

- **A union in a repeater row rendered as a text field.** The kind switch is copied into every
  template that iterates fields, and there are four such copies; the new branch was missing from the
  one inside array rows. A gate (`structuralKinds`) now fails when any of them falls behind.

- **Dead branch removed** in `validation/compile.ts`: the condition was a strict subset of the line
  above it and could never be reached.

### Changed

- `GrSchemaObjectNode` gained `additionalValue`; `GrSchemaFormContext` gained `deleteValueAt`, which
  removes a key outright — `setValueAt(name, undefined)` would leave it in the payload and keep the
  name occupied.

## [v0.2.0] 2026-08-20

### Added

- **Cross-field schema rules now reach the fields they name.** `z.object({…}).refine(…)` — password
  confirmation, "end date after start", "fill at least one of these two" — used to do nothing at all:
  the flag it sets lands on the **container**, and containers carry no rules, so the compiled
  validation never saw it. There was no error and no warning; the form simply submitted. The form now
  runs `model.validate(value)` on submit and routes the issues by path through the same channel it
  already uses for a server response — a path that matches a field lands on that field, one that does
  not goes to the form summary. `submit` is withheld and `invalid` is emitted instead, so the
  "either submit or invalid" contract survives the new outcome.

  A rule on a **field** (`z.string().refine(…)`) was never affected: it marks that node, and the
  compiler has always turned it into an ordinary field rule.

  The check runs only when there is something to check — the schema can validate itself **and**
  carries a rule no node can express. A form without cross-field rules pays nothing, including
  asynchrony: its `submit` fires exactly as before, and a synchronous validator (zod) does not push
  the emit onto a microtask either. Turn it off through the existing `validation.tiers` by dropping
  `'residual'`. JSON Schema has no built-in full check — the package ships no validator — so pass a
  compiled Ajv through `parseOptions.validate` to get the same behaviour.

## [v0.1.3] 2026-08-20

### Fixed

- **`z.email()` and friends kept their format again.** zod 4 moved string formats onto the
  schema itself (`z.email()` sets `def.format` and registers no check), while the deprecated
  `z.string().email()` still expresses them as a check. The adapter read checks only, so the
  **recommended** modern idiom silently lost the format: an email field parsed as a plain
  string and rendered as a plain text input, with no warning anywhere. Both spellings now
  yield the same node, under `optional()` too.

## [v0.1.2] 2026-08-19

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
