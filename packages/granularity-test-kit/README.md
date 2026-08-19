# @feugene/granularity-test-kit

> Contract gates for packages of the [`@feugene/granularity`](https://github.com/efureev/granularity)
> design system — token registries, component registries and defaults augmentation, as reusable factories.

Every package of the design system owes the same set of promises: component tokens are declared, style
values come from the scale, all registration points agree with the file system, and `defaults.ts`
augments the registry where it is declared. Those promises used to be kept by copying four test files
into every new package — about 450 lines each time, drifting silently apart.

This package turns each of them into one call.

```ts
// src/__tests__/styleTokens.test.ts
import { defineStyleTokensGate } from '@feugene/granularity-test-kit/gates'

defineStyleTokensGate()
```

**No dependency on `@feugene/granularity`.** Everything package-specific — token registries, the
provider registry, the source root — is passed in as an argument. That keeps the direction of
dependencies one-way (a companion knows about the core, never the reverse) and lets the core itself use
the same factories: its gates read sources, not a built `dist`.

## Install

```bash
yarn add -D @feugene/granularity-test-kit
```

`vitest` is an optional peer: bring the one your package already runs.

## Gates

### `defineStyleTokensGate(options?)`

Fails on values that a theme cannot reach: pixel literals (`text-[14px]`), uno-scale utilities
(`text-sm`, `rounded-md`), raw durations (`duration-150`, `200ms`) and easing keywords. The uno-scale
utilities matter most — they look correct and stay 14px no matter what `--gr-text-sm` says.

| Option | Default | What it is for |
| --- | --- | --- |
| `srcDir` | `<cwd>/src` | source root |
| `excludeTopDirs` | `[]` | generated top-level dirs (`['styles', 'tokens']` in the core) |
| `requireTokenUsage` | `true` | motion and typography tokens are actually used |
| `requirePairedLeading` | `false` | every `text-[length:var(--gr-*text-*)]` carries a `leading-*` in the same class literal. Off by default: a package moves onto pairing in one edit and would otherwise go red for a debt it has not paid |
| `pairedLeadingExceptions` | `[]` | places where a line height is deliberately set next to the size (`leading-none` on a key cap) |

### `defineComponentTokensGate(options)`

Checks the per-component theme contract: every `--gr-*` in the sources is declared — globally or in the
component's own `tokens.json` — registries are not stale, no one redeclares someone else's token, and
entries carry `name`, `kind`, `default` and `description`.

| Option | Default | What it is for |
| --- | --- | --- |
| `globalTokens` | — | tokens declared outside per-component registries. A companion passes everything the core declares |
| `extraRegistries` | `[]` | registries outside `components/` (`['composables']` in the core) |
| `requireOwnerPrefix` | `true` | a component's own token starts with its own prefix |
| `ownerPrefixOverrides` | `{}` | families named shorter than their component (`GrProgressBar` → `--gr-progress-`) |
| `requireThemeKind` | `true` | variables declared in `themes/*.css` are registered as `kind: "theme"` |
| `requireRegistries` | `true` | the package has at least one component with its own tokens |

### `defineRegistryGate(options)`

Runs the package's registry generator with `--check` and verifies what the built modules actually
contain: the provider registry, the name list, the root barrel, `package.json#exports` and the vite
entries all match `src/components/`.

| Option | Default | What it is for |
| --- | --- | --- |
| `componentConfigs` | — | the provider registry |
| `componentNames` | — | the separate name list, if the package keeps one |
| `generatorScript` | `scripts/generate-registry.mjs` | `null` when the package has no generator |
| `requireExactExports` | `true` | no `exports` entries for components that no longer exist |

### `defineComponentDefaultsGate(options)`

Every `defaults.ts` augments the registry at the module where it is declared, and nowhere else. An
augmentation routed through a re-export works until a second one — declared directly — enters the same
program; then the first silently stops applying, with no error at all.

| Option | Default | What it is for |
| --- | --- | --- |
| `registryModule` | — | the only accepted augmentation target |
| `minComponents` | `1` | guards against a gate that is green because the list went empty |
| `registryDeclaration` | — | for the package that declares the registry: where it lives and what proves it |

### `defineComponentDocsGate(options?)`

Every component in the registry has a page, every page has a component, and both required sections
(`## Когда брать`, `## Когда взять другое`) are there and not a placeholder. It also refuses hand-written
prop tables: those are generated from the sources, and a hand-kept copy drifts silently — precisely when
someone is reading it.

| Option | Default | What it does |
| --- | --- | --- |
| `docsDir` | `docs/components` | where the pages live |
| `indexPath` | `docs/components.md` | the index that must link every name |
| `requiredSections` | both of the above | headings a page cannot ship without |
| `redirectExempt` | `{}` | components with no neighbour to point at, and why |

### `defineEmitNamingGate(options?)`

One canon for emit names: camelCase, no kebab-case except `update:*`, and the declaration parameter is
`e`. Two packages had byte-identical copies of this check, a third had none at all.

### `defineLocaleCompletenessGate(options)`

Every locale covers the base one, no orphan keys, placeholders match, and — with `keyParity` — the keys
the code asks for are exactly the keys the dictionaries declare. A missing translation is silent by
design: `t()` falls back to English, so only a gate ever notices.

| Option | Default | What it does |
| --- | --- | --- |
| `block` | — | the i18n block of the package (`gr`, `grChrono`, …) |
| `localesDir` | `src/i18n/locales` | where the flat JSON dictionaries live |
| `locales` | `['en','ru','es']` | the first one is the base |
| `pluralForms` | `false` | require CLDR plural categories |
| `keyParity` | `{ sourceDirs: ['src'] }` | compare asked-for keys against declared ones |

### `defineGateCoverage(options?)`

Fails when a package forgot to wire one of the gates above. While gates were copied as files, forgetting
one cost nothing — a package without `styleTokens` lived with pixel literals and stayed green.

## Test helpers

Three more subpaths, split **by peer** rather than by topic — so that the heavy one reaches only the
package that asked for it. Every peer below is optional.

### `@feugene/granularity-test-kit/vue` — component tests

```ts
import { nextFrame, queryOne, stubElementRects } from '@feugene/granularity-test-kit/vue'
```

| Export | What it does |
| --- | --- |
| `queryOne(selector, root?)` | the element, or a throw naming the selector. Root defaults to `document`: overlay panels live in a portal and are not inside the wrapper |
| `queryWrapper(selector, root?)` | the same as a `DOMWrapper`, when `trigger` and `text` are next |
| `stubElementRects(rect)` | a rectangle for **every** element, prototype-wide, with a restore. A component that measures its root in `onMounted` reads the size before the test can reach the node |
| `nextFrame()` | one `requestAnimationFrame`. `nextTick` is the Vue queue, not the browser frame |
| `fintI18nGlobal(i18n)` | `{ provide }` with the instance under `Symbol.for('FintI18n')`, shaped to compose with other `provide` blocks |

### `@feugene/granularity-test-kit/a11y` — axe in jsdom

```ts
import { axeViolations } from '@feugene/granularity-test-kit/a11y'

expect(await axeViolations(wrapper.element)).toEqual([])
```

Serious and critical violations as `id: help (n)` strings — an empty array reads as "clean", and the
failure message is readable without unpacking axe objects. `color-contrast` is off by default: jsdom
paints nothing, so the rule has nothing to measure. A separate subpath because `axe-core` is a peer the
core does not have.

### `@feugene/granularity-test-kit/e2e` — Playwright

```ts
import { createA11yBaseline, expectNoA11yRegressions, expectTabCycle } from '@feugene/granularity-test-kit/e2e'
```

| Export | What it does |
| --- | --- |
| `expectNoA11yRegressions(page, options)` | axe over an area, minus the accepted debt, with the list itself in the failure message |
| `a11yRegressions` / `selectRegressions` | the same without the assertion; the latter is pure and takes axe results directly |
| `createA11yBaseline(known, options?)` | the debt mechanics. Data stays with the application; `A11Y_AUDIT=1` zeroes the debt so a run reports all of it |
| `expectTabCycle(page, layer)` | Tab really walks the layer. "Focus did not leave" is not enough: a trap pinning focus to one button passes that |
| `tabUntil`, `focusedDescription` | reach an element by Tab; describe what is focused, for the failure message |
| `waitForOpaque(page, selector)` | wait out the enter animation. On a half-transparent panel axe computes a blended colour and reports a contrast defect that does not exist |

## What is not here

Test helpers that know about the design system — `granularityGlobal()`, `announced()`,
`resetGranularityDom()` — live in the core as `@feugene/granularity/testing`. They reach into the core's
own internals, so moving them here would make this package depend on the core, and the core itself calls
these factories: the dependency would close into a cycle.

## License

SEE LICENSE IN LICENSE
