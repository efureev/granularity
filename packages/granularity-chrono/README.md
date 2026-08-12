# @feugene/granularity-chrono

> Calendar, date and time components for the [`@feugene/granularity`](https://github.com/efureev/granularity) design system.

A first-class part of the design system rather than a themed wrapper: the date
grid, the keyboard and the formatting are ours, so `GrConfigProvider`,
`GrFormField`, the size scale, the overlay stack and the i18n adapter all apply
the way they do to every other control.

**No runtime dependencies.** Date arithmetic is a few hundred lines of plain
integer maths; everything locale-dependent — the first day of the week, month
and weekday names, the 12/24-hour default — comes from `Intl`. Installing this
package pulls in no date library and no third-party widget.

## Why not wrap an existing picker

The predecessor (`@feugene/granularity-datepicker`) wrapped
`@vuepic/vue-datepicker`, and its failures were structural rather than
incidental: the theme never reached the widget because the library redefines the
same CSS variables one level deeper; `id`, `name` and the accessible name could
not be set because the `<input>` belonged to the library; and the prop contract
drifted on every major of the dependency without anything failing the build.

See `AUDIT-DATEPICKER.md` and `SPEC-GrChrono.md` in the repository root for the
full reasoning.

## Status

**Scaffold.** The package builds and is wired into the workspace, but ships no
components yet. Components arrive with the calendar grid — see the roadmap in
`SPEC-GrChrono.md` (P1).

## Install

```bash
yarn add @feugene/granularity-chrono
# peers you already have with granularity:
#   @feugene/granularity  @feugene/unocss-preset-granular  vue
```

## UnoCSS granular-provider

Register the provider alongside granularity so the package's utility classes are
scanned:

```ts
import { granularityProvider } from '@feugene/granularity/granular-provider/node'
import { granularityChronoProvider } from '@feugene/granularity-chrono/granular-provider/node'

presetGranularNode({
  providers: [granularityProvider, granularityChronoProvider],
  components: ['@feugene/granularity-chrono:GrCalendar'],
})
```

## Auto-import (unplugin-vue-components)

```ts
// vite.config.ts
import Components from 'unplugin-vue-components/vite'
import { GranularityResolver } from '@feugene/unplugin-granularity'
import { GranularityChronoResolver } from '@feugene/granularity-chrono/resolver'

export default defineConfig({
  plugins: [
    Components({
      resolvers: [
        GranularityChronoResolver(), // whitelist — must come first…
        GranularityResolver(),       // …before the greedy Gr* core resolver
      ],
    }),
  ],
})
```

The chrono resolver uses an explicit whitelist of its components, so it must be
registered **before** the core `GranularityResolver()`, which greedily claims any
`Gr*` name.

Requires the optional peers `@feugene/unplugin-granularity` (`>=0.4.0`) and
`unplugin-vue-components` — install them only if you use auto-import.

## Registries

The component lists in `src/index.ts`, `package.json#exports`, `vite.config.ts`,
`src/granular-provider/shared.ts` and `src/componentNames.ts` are **generated**:

```bash
yarn generate:registry          # synchronise
yarn generate:registry --check  # report drift, write nothing
```

Never edit inside a `// <granularity:components>` block — the next run
overwrites it. The machinery is shared across provider packages and lives in
`@feugene/unocss-preset-granular/codegen`.

**Adding the very first component takes one manual step.** `package.json`
carries no markers, so the generator replaces the contiguous run of
`./components/*` keys *in place* — and with no such key yet it cannot decide
where the run belongs. Add one entry by hand alongside the first component;
every one after that is generated. The generator says as much when it stops.

`yarn test:run` runs the same `--check` and fails on drift, so a forgotten
`generate:registry` never reaches CI.

## License

SEE LICENSE IN LICENSE (inherits the monorepo license).
