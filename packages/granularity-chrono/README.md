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

## Granular imports, in numbers

<!-- entry-sizes:generated:start lang=en -->
| What you import | gzip | of the barrel |
| --- | ---: | ---: |
| the whole package from the root | 43.6 kB | 100 % |
| the lightest component — `GrDuration` | 3.2 kB | 7 % |
| the median component — `GrTimePicker` | 14.5 kB | 33 % |
| the 5 heaviest together | 35.4 kB | 81 % |

These numbers **do not add up**: shared code is counted again in every row but paid for once, which is why
the set is shown as a union rather than a sum. They are an upper bound — the gzip of everything a subpath
pulls out of `dist`, before the application bundler shakes it further and minifies it again.

The weight of every component — [`docs/entry-sizes.md`](./docs/entry-sizes.md).
<!-- entry-sizes:generated:end -->

## Documentation

- [`docs/model.md`](./docs/model.md) — the value: why `Date` lives only at the
  boundary, how to pick a `valueAdapter`, what the public arithmetic offers, how
  relative time picks its unit and its tick
- [`docs/keyboard.md`](./docs/keyboard.md) — keyboard contract per component:
  the grid, the time columns, the field, the range
- [`docs/theming.md`](./docs/theming.md) — own `--gr-*` tokens, what may and may
  not be overridden, how the CSS is assembled
- [`docs/ssr.md`](./docs/ssr.md) — server rendering: the single source of
  mismatch and how to remove it

## Why not wrap an existing picker

The predecessor (`@feugene/granularity-datepicker`) wrapped
`@vuepic/vue-datepicker`, and its failures were structural rather than
incidental: the theme never reached the widget because the library redefines the
same CSS variables one level deeper; `id`, `name` and the accessible name could
not be set because the `<input>` belonged to the library; and the prop contract
drifted on every major of the dependency without anything failing the build.

Each of the three is structural: none could be fixed without owning the widget,
which is what this package does.

## Status

Six components — `GrCalendar`, `GrDatePicker`, `GrTimePicker`, `GrDateTimePicker`,
`GrDateRangePicker` and `GrRelativeTime` — plus the public arithmetic and the
shared clock (`useChronoNow`). What each one is for, and where the line to its
neighbour runs, is in [`docs/components.md`](./docs/components.md); what has
shipped so far is in [`CHANGELOG.md`](./CHANGELOG.md).

## Install

```bash
yarn add @feugene/granularity-chrono
# peers you already have with granularity:
#   @feugene/granularity  @feugene/granum  vue
```

## Localization

The package ships UI strings only — labels, `aria-label`s, panel titles. Month and weekday names,
the first day of the week, the 12/24-hour default and the parsing order all come from `Intl`, so the
components speak every language the engine knows, not the ones we listed.

Strings live in their own block (`grChrono`) and plug into the same `fint-i18n` instance as the
core's — one i18n layer for the whole app:

```ts
import { createFintI18n } from '@feugene/fint-i18n/core'
import { installI18n } from '@feugene/fint-i18n/vue'
import { GRANULARITY_I18N_BLOCK, en as coreEn, ru as coreRu } from '@feugene/granularity/i18n'
import { GR_CHRONO_I18N_BLOCK, en, ru } from '@feugene/granularity-chrono/i18n'

const i18n = createFintI18n({
  locale: 'ru',
  fallbackLocale: 'en',
  loaders: [coreEn, coreRu, en, ru],
})

i18n.registerBlocks([GRANULARITY_I18N_BLOCK, GR_CHRONO_I18N_BLOCK])
await i18n.loadUsedBlocks('ru')
installI18n(app, i18n)
```

Need every language at once (demos, e2e) — import the aggregate instead:
`@feugene/granularity-chrono/i18n/all`. Skip the wiring entirely and the components still work: every
key has an English fallback compiled into the component.

## granum provider

List the package alongside granularity so its classes, CSS and tokens reach the
application's CSS:

```ts
// granum.config.ts
import { defineGranumConfig } from '@feugene/granum/vite'
import { windEngine } from '@feugene/granum-engine-wind'

export default defineGranumConfig({
  engine: windEngine(),
  providers: ['@feugene/granularity', '@feugene/granularity-chrono'],
  components: ['@feugene/granularity-chrono:GrCalendar'],
  appSources: { dirs: ['src'] },
})
```

Both packages go in by name, not as imported objects: each one ships its own
`granum.manifest.json`, and granum reads it instead of scanning the package's
`dist`. The core arrives as a donor of the selected components anyway — the
chrono manifest names it — but the application still has to list it to get its
theme and base layers.

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
        GranularityResolver(), // …before the greedy Gr* core resolver
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

The component lists in `src/index.ts`, `package.json#exports`,
`src/granular-provider/shared.ts` and `src/componentNames.ts` are **generated**:

```bash
yarn generate:registry          # synchronise
yarn generate:registry --check  # report drift, write nothing
```

Never edit inside a `// <granularity:components>` block — the next run
overwrites it. The machinery is shared across provider packages and lives in
`@feugene/granum/codegen`.

Component entries are not on that list: `granumProvider()` builds them from the
same provider registry, so `vite.config.ts` has one fewer place to fall out of
sync.

**Adding the very first component takes one manual step.** `package.json`
carries no markers, so the generator replaces the contiguous run of
`./components/*` keys *in place* — and with no such key yet it cannot decide
where the run belongs. Add one entry by hand alongside the first component;
every one after that is generated. The generator says as much when it stops.

`yarn test:run` runs the same `--check` and fails on drift, so a forgotten
`generate:registry` never reaches CI.

## License

SEE LICENSE IN LICENSE (inherits the monorepo license).
