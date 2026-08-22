# Changelog

All notable changes to `@feugene/granularity-test-kit` are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
