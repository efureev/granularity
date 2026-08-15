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

### `defineGateCoverage(options?)`

Fails when a package forgot to wire one of the gates above. While gates were copied as files, forgetting
one cost nothing — a package without `styleTokens` lived with pixel literals and stayed green.

## What is not here

Runtime test helpers — pointer gestures, `announced()`, `resetGranularityDom()`, `granularityGlobal()`
— live in the core as `@feugene/granularity/testing`. This package is about package-level contracts, not
about mounting components.

## License

SEE LICENSE IN LICENSE
