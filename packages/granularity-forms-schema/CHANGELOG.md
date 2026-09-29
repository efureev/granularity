# Changelog

All notable changes to the [`@feugene/granularity-forms-schema`](.) package are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres
to [Semantic Versioning](https://semver.org/).

## [v1.0.1] 2026-09-29

Гигиена сборки. Артефакт пакета не изменился — проверено побайтно.

### Changed

- **`libInjectCss` убран из конфига сборки.** Плагин вписывал в JS-чанк
  компонента `import '../styles.css'`; до granum это был единственный канал
  доставки стилей, а с granum тот же файл приезжает приложению через манифест —
  и потребитель получал два экземпляра, причём второй **вне слоёв `granum.*`**
  и потому сильнее всей библиотеки.

  У этого пакета компонентного CSS нет, и плагин стоял вхолостую: сборка с ним
  и без него совпадает побайтно, числа в `docs/entry-sizes.md` не сдвинулись.
  Убран до того, как появится первый компонент со стилями — тогда ловушка
  захлопнулась бы молча.

  Ядро сняло плагин при переезде на granum, `granularity-editor` и
  `granularity-code` — в 1.0.1, где он уже стрелял. Диагностика
  `css-double-delivery`, которая обязана была это назвать, не работала вовсе;
  починена в `@feugene/granum` 1.0.2.

- `vite-plugin-lib-inject-css` убран из devDependencies: больше не импортируется.

## [v1.0.0] 2026-09-28

Переезд на `@feugene/granum` 1.0 и первый мажор пакета.

Публичная поверхность не менялась — ломающий тут сам конвейер: peer-зависимость
уезжает с `@feugene/unocss-preset-granular` на `@feugene/granum`
(`>=1.0.0 <2.0.0`), а приложение переходит с `uno.config.ts` на
`granum.config.ts`. Версия выровнена с ядром: `@feugene/granularity` 1.0.0.

Перед обновлением стоит прочитать руководство по переезду в granum — в
частности про каскадные слои и сброс браузерных стилей, который теперь нужно
импортировать в слой.

### Changed

- **`yarn doctor` is `granum doctor --strict`, without a wrapper script.**
  `scripts/granum-doctor.mjs` existed for two reasons and both are gone. It muted
  `token-undefined` through the monorepo's token registry — granum 0.4.0 derives
  the same verdict from the code itself (a use with a fallback, a token the
  component assigns itself and `dynamicTokens` are not findings), so the registry
  is unnecessary. And it kept recorded debt from failing the gate — that is now
  `--allow=<codes>`. Findings across the eight packages went from 861 to 1, and
  that one is the deliberate `!important` on the drag cursor in `GrTransfer`,
  recorded through `--allow`.
- **Safelists in the manifests shrank from 3479 entries to 430** (zero in every
  companion): granum drops entries that static extraction already covers. Nothing
  in the sources changed and the CSS is byte-for-byte identical — the safelist
  there is derived from the component's own class constants, and whether
  extraction sees a given class is decided by chunking, not by the author.
- **The utility engine changed: `@feugene/granum-engine-wind` `^0.4.0` instead of
  `@feugene/granum-engine-mini`.** It vendors `preset-wind3` rather than
  `preset-mini`, so the vocabulary gained `border-collapse`, `list-none`,
  `touch-none`, `table-fixed` and `scroll-p*` — utilities that existed neither in
  `preset-mini` nor in the former extra rules, which is why a class in the markup
  silently produced no CSS. The package dialect is now
  `unocss/preset-wind3+granum@66`, and the peer on the core moved to
  `>=0.3.0 <1.0.0`. A consumer swaps the pair in dev dependencies and replaces
  `miniEngine()` with `windEngine()` in `granum.config.*`.
- **The package is built by `@feugene/granum`, not by the `@feugene/unocss-preset-granular` preset.** The
  `dist` layout and the component entries are driven by the
  `granumProvider({ provider, engine: miniEngine(), entries })` plugin: it builds them from the provider
  registry, extracts the classes and the consumed tokens by walking the bundle graph, and writes a
  machine-generated `granum.manifest.json` next to `dist`. The package's own `build.lib`,
  `granularChunkFileNames` and hand-written component entries are gone from `vite.config.ts`.
- **The manifest is exported as `./granum.manifest.json`.** An application resolves it through exactly that
  subpath — without the export the package's provider cannot be wired up. granum never scans
  `node_modules`: the component classes are computed when the package is built.
- **The peer changed: `@feugene/granum` `>=0.2.0 <1.0.0` instead of the preset.** The utility engine comes
  from the application (`@feugene/granum-engine-mini` sits in the package's dev dependencies), while the
  package declares a **vocabulary dialect** in the manifest — `unocss/preset-mini+granum@66`, the
  vocabulary its component classes are written against. An application running an engine of a different
  vocabulary gets `provider-dialect-mismatch` and every lost class listed by name instead of silently
  half-drawn components.
- **The descriptor contract was renamed without a change of meaning.** `defineGranularComponent` →
  `defineGranumComponent`, `defineGranularProvider` → `defineGranumProvider`, imported from
  `@feugene/granum/contract`. Donors are declared as **strings**
  (`dependencies: ['@feugene/granularity']`) rather than instances: an instance would pull the donor into
  the graph in object form and make the application scan its `dist` instead of reading the manifest.
  `packageBaseUrl` is gone — the manifest's directory is the base — so `granular-provider/node` is now a
  plain alias of the browser entry.
- **`granular.options.mjs` was replaced by `granum.config.mjs`**, and `yarn doctor` runs `granum doctor`
  against the package's manifests.

## [v0.4.0] 2026-08-27

### Changed

- **Peer floors on `@feugene/*` raised to the current minor.** Every peer this package
  declares on the ecosystem now starts at the version the monorepo actually ships:

  - `@feugene/fint-i18n` → `>=0.7.0 <1.0.0`
  - `@feugene/granularity` → `>=0.36.0 <1.0.0`
  - `@feugene/granularity-chrono` → `>=0.10.0 <1.0.0`
  - `@feugene/unocss-preset-granular` → `>=0.13.0 <1.0.0`
  - `@feugene/unplugin-granularity` → `>=0.7.0 <1.0.0`

  The floors had drifted far behind — some still admitted releases from a year of
  development ago — and a range that claims support it was never tested against is
  worse than a narrow one: the install succeeds and the breakage surfaces later, in
  the consumer's app.

  **This is breaking for anyone below a floor.** Installing against an older
  `@feugene/granularity` now produces a peer conflict instead of silence. The fix is
  to move the core up; nothing in this package's own API changed.

## [v0.3.4] 2026-08-26

### Changed

- **Перевод читается композаблом ядра `useGranularityTranslations`.** Свой резолвер
  (`src/internal/i18n.ts`) удалён — он расходился с ядром по трём пунктам, и каждое
  расхождение проявлялось молча:

  - видел только инстанс `fint-i18n` по `Symbol.for('FintI18n')`, поэтому адаптер,
    отданный приложением по `GRANULARITY_I18N_KEY`, оставался невидимым — приложение
    на `vue-i18n` или `i18next` получало английский fallback;
  - спрашивал «есть ли перевод» сравнением `t(key) === key` вместо `te()`, а это врёт
    на словаре, где значение совпадает с ключом;
  - не разэкранировал `{{`/`}}` во fallback и не подставлял `{name}`, когда параметры
    не переданы.

  Публичный API не менялся; `@feugene/granularity` у пакета и так обязательный peer.

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

## [v0.3.3] 2026-08-22

### Fixed

- **Parts of the form can now be imported granularly, and auto-import routes them here.**
  `GrSchemaField`, `GrSchemaArrayField`, `GrSchemaUnionField` and `GrSchemaAdditionalFields` live in
  the `GrSchemaForm` directory and had no subpath of their own, so a granular import failed. Worse,
  the resolver whitelist did not list them either — the core's greedy `Gr*` resolver picked them up
  and pointed at `@feugene/granularity/components/GrSchemaField`, a path no package publishes, so a
  consumer's build broke as soon as one of them appeared in a template.

  Both lists are generated now: `exports` gets an alias per part (its own key, the form's module),
  and the resolver whitelist gets the names. The build config keeps reading the components list
  alone — CSS assets are laid out per component directory, and a part has none.

## [v0.3.2] 2026-08-22

### Fixed

- **A free-key value field had no accessible name.** In a pair «key — value» the visible label is
  the key input itself, so the value control was left with nothing: `GrFormField` without a `label`
  gives no name, and an input drawn next to it does not become one. axe reported it as `label`,
  critical. The value is now named by its own key («Value of {key}»), and the name follows a rename.

### Added

- **`GrSchemaField` accepts `ariaLabel`** — a name for the control where a visible label does not
  belong (a table cell, a free-key row). Weaker than `ui.controlProps`, so a consumer can still name
  the field their own way.

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
