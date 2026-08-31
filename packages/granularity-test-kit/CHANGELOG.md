# Changelog

All notable changes to `@feugene/granularity-test-kit` are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- **BREAKING. `OVERLAY_COMPOSABLES` больше не перечисляет имена токенов —
  фабрика вычитывает их из кода композабла.** Константа утверждала, что
  `useFloating` заставляет компонент читать `gr-z-modal`, но связи с
  `overlayStack.ts` у неё не было никакой (`grep -c overlayStack` по гейту
  давал ноль). Разойдись они — гейт продолжал бы требовать старое имя и
  оставался зелёным: охранная конструкция переставала охранять, ничего об
  этом не сообщая. Переименование токена третье правило (`knownTokens`) всё
  же ловило, а переключение кода на другой существующий токен проходило молча.

  Теперь `DynamicTokenComposable` описывает не имена, а **модули**
  (`modules`), из которых имена вычитываются двумя формами: ветка
  `calc(var(--x) + N)` даёт `always` (читает любой вызов), `?? '--x'` —
  `defaultToken` (читает вызов, не передавший имени). Список модулей нужен
  потому, что токен читается не в одноимённом файле: ветку `calc()` у
  `useFloating` держит `overlayStack`, а сам `useFloating` — только свой
  дефолт. Класс кавычек в форме дефолта обязателен: в `src` он записан
  одинарными, в `dist` — двойными.

  `always` и `defaultToken` остались в опциях как **дополнение** к
  выведенному (форма, регуляркой не выразимая, и разрешение неоднозначного
  дефолта), а не как его замена.

- **Гейт падает, когда посмотреть не смог.** Модуль не найден или из
  найденного не выведено ни одного имени — прогон краснеет с адресами корней и
  причиной. Молчаливый пропуск вернул бы ту же слепоту: тот же принцип, что у
  `check-entry-isolation.mjs`, где файл без сорсмапы роняет прогон.

- **Сообщение о нарушении называет обе стороны:** `GrPopover читает
  gr-z-dropdown, gr-z-toast, а объявляет gr-z-dropdown, gr-z-modal` — видно и
  появившееся имя, и исчезнувшее.

### Added

- `composableSources` — корни, в которых ищутся модули композаблов, в порядке
  предпочтения. По умолчанию `<cwd>/src` и `dist` установленного
  `@feugene/granularity`: у ядра модуль находится в исходниках, у спутника —
  в собранном ядре. Опцией, а не догадкой: спутник вправе линковаться и через
  workspace, и из реестра.

## [v0.9.0] 2026-08-31

### Added

- **`defineDynamicTokensGate` — фабрика для токенов, чьё имя собирается в
  рантайме.** `var()`, склеенный из переменной, не находит ни один
  статический анализ: имя уходит в композабл параметром. Приложение с
  включённой обрезкой (`pruneTokens` пресета) считает такой токен ненужным и
  удаляет объявление молча — сборка зелёная, CSS валидный, `z-index`
  разрешается в `unset`.

  Гейт держит три правила. Два знают про конкретные композаблы
  (`OVERLAY_COMPOSABLES` — `useFloating` и `useModalOverlay` ядра) и требуют
  от вызывающего объявить и свой слой, и `gr-z-modal` из ветки
  `calc(var(--gr-z-modal) + N)`. Третье ловит источник, о котором фабрика ещё
  не знает, и потому переживает появление нового.

  Исходники компонента читаются вместе с общей директорией его группы: у
  графиков композабл зовёт рама, а не график. Список `appSuppliedName`
  выводит из-под правила компоненты, которым объявлять нечего — имя приходит
  от приложения; список проверяется на протухание.

  Фабрика добавлена в `REQUIRED_GATES`, то есть пакет без неё краснеет.


## [v0.8.1] 2026-08-27

### Fixed

- `gr-check-dist-dev-guard` now recognises the guard in either comparison direction. A minifier is free to
  normalise `!(NODE_ENV !== 'production')` into `NODE_ENV === 'production'`, and the gate — which only knew
  `!==` — failed the build of a package whose guard was expanded correctly.

## [v0.8.0] 2026-08-27

### Changed

- **Peer floors on `@feugene/*` raised to the current minor.** Every peer this package
  declares on the ecosystem now starts at the version the monorepo actually ships:

  - `@feugene/unocss-preset-granular` → `>=0.13.0 <1.0.0`

  The floors had drifted far behind — some still admitted releases from a year of
  development ago — and a range that claims support it was never tested against is
  worse than a narrow one: the install succeeds and the breakage surfaces later, in
  the consumer's app.

  **This is breaking for anyone below a floor.** Installing against an older
  `@feugene/granularity` now produces a peer conflict instead of silence. The fix is
  to move the core up; nothing in this package's own API changed.

## [v0.7.4] 2026-08-25

### Fixed

- **The package tarball now ships `LICENSE`.** The manifest has always declared
  `"license": "SEE LICENSE IN LICENSE"`, and the file it points at was not there: `npm` adds
  `LICENSE` to a tarball on its own, but only when the file exists in the package directory.
  A consumer's compliance scanner reads a licence reference that resolves to nothing and flags
  the dependency as unlicensed — a refusal on formal grounds, before anyone reads the terms.

  The copy is byte-identical to the one at the repository root and is kept that way by
  `yarn check:licenses`, a gate in CI: eleven copies of a 598-line file drift silently, and they
  drift exactly when the licence text is being edited.

## [v0.7.3] 2026-08-23

### Fixed

- **Two liveness guards no longer fail a package for being young.** Both watch the *parser*, not
  the package, and both were tied to the shape of a mature one. The locale gate demanded more than
  five keys under a message reading "no key found at all" — a package with one component was red
  while its parsing worked perfectly; the threshold is now zero, which is what the message says.
  The style gate required `--gr-leading-*` specifically, so a package built out of controls — which
  legitimately uses only `--gr-control-leading-*` — could never satisfy it, even though the paired
  check right above it accepts both scales. Both scales now count.

## [v0.7.2] 2026-08-23

### Fixed

- **The axe scan now measures the page at rest.** `a11yRegressions` read whatever frame the page
  happened to be on, and a frame in the middle of a transition carries a blended colour: the active
  `GrSidebar` item halfway through `transition-colors` is `#7d818b` on `#afabf3` — 1.84:1 where the
  settled state is 8.59:1. `color-contrast` reported a defect the page does not have, and the
  failure looked random because it depended on whether the scan landed inside the 150 ms window.
  The showcase starts that motion by itself: its dev server generates UnoCSS rules on demand, so a
  class first seen when a demo mounts arrives one frame after the node. Transitions and animations
  are now frozen for the duration of the scan and released immediately after, since the scan is also
  called mid-scenario where the next step waits on an animation.

## [v0.7.1] 2026-08-23

### Fixed

- **The preset is loaded lazily, so `optional: true` is no longer a lie.** `gates/registry.ts`
  imported `@feugene/unocss-preset-granular/codegen` statically, which made the preset mandatory for
  **every** gate in the kit: importing `@feugene/granularity-test-kit/gates` failed at resolution
  before the consumer even chose a factory — while `peerDependenciesMeta` promised the opposite and
  the other eight factories need nothing from it. The import now happens inside `beforeAll`, with a
  message naming the package and the version instead of a bare module-not-found.

- **The registry gate narrows the subcomponent scan by the component list.** Without `components`
  the map picked up `.vue` files from directories that are not components at all.

## [v0.7.0] 2026-08-23

### Added

- **`prefix` on five gates.** `componentDirs` filtered `Gr` as a literal, so
  `defineComponentDefaultsGate`, `defineComponentTokensGate`, `defineEmitNamingGate`,
  `defineComponentDocsGate` and `defineRegistryGate` found **zero** components in a companion
  package with its own prefix — and four of them went green on that, because there was nothing
  left to check. The kit is meant for exactly those packages, and `/codegen` of the preset had
  taken the prefix as an option long ago.

  Default stays `'Gr'`, so nothing changes for the core. Reported by a consumer of
  `@efureev/ft-extra-granularity`, who had to rewrite five ready-made factories by hand.

### Changed

- **`componentDirs` walks grouped layouts** and returns paths relative to the components
  directory (`transaction-details/FtExpenseModal`), one level deep — the same rule the preset's
  registry generator follows. Without it the gates would call «extra» exactly the components the
  generator had just written.

## [v0.6.0] 2026-08-22

### Added

- **`defineStyleTokensGate` — the tone is not a foreground colour.** The rule («a saturated tone must
  not paint text — that is what `-text` is for») lived in a comment inside one component, so nothing
  reported a breach: a consumer counted fifteen of them in their own package, against three correct
  ones. `text-[var(--gr-<tone>)]` is now an error naming the paired role; `bg-`, `border-`, `fill-`
  and `stroke-` are untouched — that is what a tone is for.

  A tone mixed into a text colour (`color-mix` inside `text-*`) only warns: there the ratio decides,
  and statics cannot weigh it. Icons are caught alongside text on purpose — next to a label an icon
  owes the same legibility.

  `toneRoles` overrides the list, `toneAsTextExceptions` allows a file explicitly — as a list, so the
  exception is visible in review rather than inferred.

- **`forbidImportantUtilities`** — an opt-in check against `!`-important utilities (`!text-…`,
  `!bg-…`). Almost always it means the built-in knob — a token or a prop — was not found, and the
  override then depends on the order of generated rules, so it drops silently.

## [v0.5.0] 2026-08-22

### Changed

- **`defineRegistryGate` now knows about parts of composite components.** A part
  (`GrTimelineItem`, `GrListItem`, a menu item) is not a public component — no `index.ts`, no
  `config.ts`, no build entry of its own — but it must still have a subpath, otherwise a granular
  import of that part fails with `ERR_PACKAGE_PATH_NOT_EXPORTED`. The gate now requires an alias per
  part pointing at the parent's module, and requires that no part claims an entry.

  The map is collected by the gate itself (`collectGranularSubcomponents` from
  `@feugene/unocss-preset-granular/codegen`, an optional peer), not taken as an option: given the
  map, the gate would confirm exactly what the generator had written.

  A package whose parts have no aliases yet will go red — that is the point. Add
  `packageExports({ subcomponents: true })` to its registry generator.

## [v0.4.0] 2026-08-20

### Added

- **`defineEnvGuardGate`** — the dev-guard rule, until now a hand-written test living only in the core.
  It fails on an environment check written by hand (`process.env.NODE_ENV` throws in a worker,
  `import.meta.env?.DEV` is silently `undefined` outside Vite) and — this part is new — on a `console.*`
  call with **no guard above it**. Nothing was checking for the *absence* of a condition, so four
  warnings shipped into consumers' production builds while every gate stayed green. The guard counts on
  the same line and on any line above, because one block guard routinely covers four warnings in a row;
  a warning whose guard sits lower goes into `allowUnguarded` with a reason. A weaker, file-level version
  ("the guard appears somewhere in the file") was written first and discarded: the very first mutation
  check walked straight through it.
- **`gr-check-dist-dev-guard`** — the paired check on the built package, now a bin instead of a script
  copied per package. Unit tests run with the guard defined as `true`, so a `define` that stopped working
  is invisible to them while consumers get `__GR_DEV__ is not defined` on import. Add it to `build`:
  `vite build && gr-check-dist-dev-guard && vue-tsc …`.
- `REQUIRED_GATES` gained `defineEnvGuardGate`, so `defineGateCoverage` now asks every package for it.

### Changed

- **`defineComponentDefaultsGate` checks that a declared default is read.** Declaring one and never
  reading it is a promise nobody keeps: the provider configures, the component never looks, and nothing
  says so — two props lived that way and both were found by hand. Reads are collected across the whole
  `src`, not the component's directory, because resolution is sometimes hoisted into a shared module.
  Four channels count as evidence: a literal call including multi-line ones, `useGrComponentSize` with
  `{ component }` for the `size` key, a manual chain through `useGrComponentDefaults`, and a call whose
  component name is a variable — that one counts the key for every component in the package. Coarse on
  purpose: it can miss a dead default but never invents one, and a gate that cries wolf gets switched off.
  A naive version of the same check produces sixteen red entries with zero real ones.

## [v0.3.0] 2026-08-19

### Added

- **Three more subpaths, split by peer rather than by topic** — so that the heavy one reaches only the
  package that asked for it. `./vue` holds what a component test needs and the design system does not
  know about: a throwing `queryOne`, a prototype-wide `stubElementRects`, `nextFrame`, and a
  `fintI18nGlobal` shaped to compose with other `provide` blocks. `./a11y` holds `axeViolations` alone —
  separately, because `axe-core` is a peer the core does not have, and a shared module would have made it
  mandatory for everyone importing a single function. `./e2e` holds the Playwright layer: the a11y gate
  model, the accepted-debt mechanics, the Tab walk and the enter-animation wait. Every new peer is
  optional.
- `axeViolations` replaces four copies of the same rig — three byte-for-byte, the fourth already drifted
  into a different shape. `color-contrast` is off by default and now says why: jsdom paints nothing, so
  the rule has nothing to measure. The old comments blamed the showcase, which had switched the rule back
  **on** in a real browser a month earlier.
- `createA11yBaseline` and `expectNoA11yRegressions` carry the model the showcase gate was built from:
  blocking violations minus accepted debt, subtracted by rule id, with `A11Y_AUDIT=1` zeroing the debt.
  The data — which components owe what — stays with the application.
- `defineEmitNamingGate` and `defineLocaleCompletenessGate` — both were copied per
  package rather than shared: the emit-naming files of two packages were byte-for-byte
  identical, the locale ones differed by a single regex prefix, and one package had no
  emit gate at all. `REQUIRED_GATES` grows from five to seven, so a package can no
  longer ship without them.
- `defineComponentDefaultsGate` gained a rule that every configurable prop is declared
  `undefined` in `withDefaults`. Without it the provider is silently ignored: Vue
  substitutes the declared default before the component reads the config, and from the
  inside "the user passed a value" is indistinguishable from "the default fired".

## [v0.2.0] 2026-08-19

### Added

- `requirePairedLeading` option for `defineStyleTokensGate`: every `text-[length:var(--gr-*text-*)]`
  must carry a `leading-*` in the same class literal. Until now the pairing rule lived only in the
  gate's own error message, and the only real check — "`--gr-leading-*` is used by at least one
  file" — passed a package with a hundred unpaired sites. Off by default, because a package moves
  onto pairing in one edit and would otherwise go red for a debt it has not paid yet.
- `pairedLeadingExceptions` — an explicit list of files where the line height is set on purpose
  (`leading-none` centring a glyph in a fixed-height key). A list rather than a heuristic like
  "the file mentions `leading-none`": an exemption has to be visible in review.

- `defineComponentDocsGate` — a fifth contract: every registry component has a page under
  `docs/components/`, no orphan pages, `H1` matches the component, both `## Когда брать` and
  `## Когда взять другое` are present and non-empty, redirect links resolve to real files, the
  name is linked from the index, and no hand-written API table sneaks back in. A component
  without a page, an orphan page and an index out of sync all used to pass CI in silence.
- `redirectExempt` option for components with no neighbour in the ecosystem: each exemption
  carries a written reason, so a silent skip cannot accumulate.

### Changed

- `REQUIRED_GATES` now includes `defineComponentDocsGate`, so `defineGateCoverage` fails a
  package that ships components without pages.

## [v0.1.0] 2026-08-15

### Added

- Gate factories under `./gates`: `defineStyleTokensGate`, `defineComponentTokensGate`,
  `defineRegistryGate`, `defineComponentDefaultsGate` — the four contracts every design-system package
  owes, previously copied file-by-file into each of them.
- `defineGateCoverage` — a package that forgot to wire a gate now fails instead of staying green.
- Source-reading helpers under the root entry (`readSources`, `stripComments`, `tokenNamesIn`,
  `offenders`, `componentDirs`) for package-specific gates.
- `ownerPrefixOverrides` for token families named shorter than their component
  (`GrProgressBar` → `--gr-progress-`): the token name is a public theming contract, so renaming it for
  literalness would cost consumers a major version.
