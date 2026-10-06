# `@feugene/granularity`

`@feugene/granularity` is a `Vue 3` design system package that helps you build interfaces faster, cleaner, and more
predictably: with ready-made components, a transparent styling system, granular imports, and a build
pipeline that ships a machine-generated manifest instead of setup instructions.

It's built for cases where a design system needs to be more than just a set of UI pieces — a working engineering
tool: convenient for a product team, scalable for a large application, and flexible enough for different adoption
strategies.

## Why it exists

- to launch new screens and features on a single visual foundation;
- to adopt the package incrementally, without rewriting the whole application;
- to control the size of the `JS` and `CSS` you ship, when that actually matters;
- to use the same package both as a ready-made component library and as a source of low-level package-level APIs.

## What makes `granularity` good

- **Fast start without unnecessary magic.** You can simply import components and ready-made style entrypoints.
- **Granular imports.** Components are available both from the root API and via `subpath exports`, if you need finer
  control over bundle size.
- **Sane styling.** Tokens, base styles, themes, and component-level CSS are split into clear layers.
- **Ready for real scale.** The package works for "just plugged in a few components" as well as scenarios where
  dependency-aware imports, safelist, and precise CSS pipeline tuning matter.
- **One plugin, no scanning.** The package ships `granum.manifest.json`: classes, consumed tokens,
  dependencies, theme files and component CSS are computed when the package is built, so the application
  reads them instead of scanning `node_modules`.
- **Not just components.** Alongside the UI you get directives, a file validation API, and utility entrypoints for
  infrastructure scenarios.

## Technical highlights

- root export: `@feugene/granularity`;
- component subpath exports: `@feugene/granularity/components/<ComponentName>`;
- ready-made CSS entrypoint: `@feugene/granularity/styles.css` — tokens, base layer, preflight and the
  built-in `light`/`dark` themes in one file, for consumers who do not run the build pipeline. A
  component's own CSS is not there: with `granum` it arrives through the manifest;
- low-level foundation exports: `@feugene/granularity/styles/tokens.css`, `@feugene/granularity/styles/base.css`, `@feugene/granularity/styles/preflight.css`, `@feugene/granularity/styles/themes/light.css`, `@feugene/granularity/styles/themes/dark.css`;
- package-level API: `@feugene/granularity/directives`, `@feugene/granularity/fileValidation`;
- design tokens as data: `@feugene/granularity/tokens` (typed registry) and the raw `@feugene/granularity/tokens/*.json` source the CSS is generated from;
- build manifest: `@feugene/granularity/granum.manifest.json` — what the application's `granum()` plugin
  reads; it also records the utility vocabulary the classes belong to in its `engine` block. The
  provider registry itself stays available as `@feugene/granularity/granular-provider` for
  packages that extend it.

## Limitations

**RTL is not supported.** Components lay themselves out with physical directions (`pl-`/`pr-`,
`ml-`/`mr-`, `left-`/`right-`), and `dir="rtl"` is not read anywhere: a right-to-left document will
render mirrored padding, offsets and floating panels. This is a deliberate decision for the `1.x`
line — moving to logical properties changes how every component looks, which is a visual breaking
change and belongs in a major release, not a patch. See [`docs/styling.md`](./docs/styling.md).

## Quick start

```bash
yarn add @feugene/granularity vue @floating-ui/dom
```

`@floating-ui/dom` is a required peer dependency, not a bundled one: positioning (`GrDropdown`,
`GrSelect`, `GrAutocomplete`, `GrTreeSelect`, `GrTooltip`) is built on it, and keeping it external
means an application that already uses floating-ui ends up with a single copy.

The overlay components (`GrModal`, `GrDrawer`, `GrDialog`, `GrImageViewer`) need nothing else —
their focus trap, layer stack and scroll lock are the package's own primitives. `@headlessui/vue`
was dropped in 0.15.0 and is not a peer dependency; if it is still installed for this package alone,
it can be removed.

The supported setup is the `granum` plugin:

```bash
yarn add -D @feugene/granum @feugene/granum-engine-wind
```

Two packages, not one: `granum` is the pipeline and ships no utility engine of its own, so the
application picks the vocabulary and hands over an instance. `@feugene/granum-engine-wind` is the
default implementation — `preset-wind3` plus the extra rule the components are drawn with.

```ts
// granum.config.ts
import { defineGranumConfig } from '@feugene/granum/vite'
import { windEngine } from '@feugene/granum-engine-wind'

export default defineGranumConfig({
  engine: windEngine(),
  providers: ['@feugene/granularity'],
  appSources: { dirs: ['src'] },
})
```

The package declares the vocabulary its classes are written against —
`unocss/preset-wind3+granum@66`. An engine with a different dialect makes `granum` report
`provider-dialect-mismatch` and name every class it had to drop, instead of letting components
render half-styled. See [`docs/granum.md`](./docs/granum.md).

```ts
// src/main.ts
import 'virtual:granum.css'
```

That single module carries five cascade layers: tokens, base, themes, the CSS of the components you
selected, and the utility classes they are built from.

Without the plugin there is still a static fallback — `@feugene/granularity/styles.css` — with tokens,
the base layer, the preflight and the built-in `light`/`dark` themes. What it does not carry is the
utility classes, so components render with their own CSS but without layout.

## Granular imports, in numbers

<!-- entry-sizes:generated:start lang=en -->
| What you import | gzip | of the barrel |
| --- | ---: | ---: |
| the whole package from the root | 634.7 kB | 100 % |
| the lightest component — `GrButtonGroup` | 1.5 kB | < 1 % |
| the median component — `GrTabs` | 15.1 kB | 2 % |
| the 5 heaviest together | 242.0 kB | 38 % |

These numbers **do not add up**: shared code is counted again in every row but paid for once, which is why
the set is shown as a union rather than a sum. They are an upper bound — the gzip of everything a subpath
pulls out of `dist`, before the application bundler shakes it further and minifies it again.

The weight of every component — [`docs/entry-sizes.md`](./docs/entry-sizes.md).
<!-- entry-sizes:generated:end -->

## The rest of the family

The core ships the general-purpose components. Anything that carries a heavy dependency, belongs to a
domain of its own, or is needed by a minority of consumers lives in a companion package with a `peer`
on this one — the core stays lean, and you install only what you reach for.

<!-- ecosystem:generated:start -->
| Package | Version | What it adds |
| --- | --- | --- |
| [`@feugene/granularity-charts`](../granularity-charts) | 1.0.2 | Charts — own SVG, zero dependencies, drawn with theme tokens. |
| [`@feugene/granularity-chrono`](../granularity-chrono) | 1.0.2 | Calendar, date and time components — no third-party date widget, no date library. |
| [`@feugene/granularity-code`](../granularity-code) | 1.0.2 | Code surfaces: view, edit and diff — the viewer and the diff carry no dependencies at all. |
| [`@feugene/granularity-dashboard`](../granularity-dashboard) | 1.0.2 | Widget grid — drag, resize, breakpoints and layout persistence, zero dependencies. |
| [`@feugene/granularity-datasource`](../granularity-datasource) | 0.1.2 | List state: sorting, filters, paging, URL sync and race-free fetching behind one composable. |
| [`@feugene/granularity-devtools`](../granularity-devtools) | 1.0.0 | Vue DevTools panel — where a prop value came from, the overlay layer stack and design-system warnings. |
| [`@feugene/granularity-editor`](../granularity-editor) | 1.0.2 | Rich-text editing: a TipTap-backed GrRichText field with a design-system toolbar. |
| [`@feugene/granularity-forms-schema`](../granularity-forms-schema) | 1.0.2 | Schema-driven forms — zod and JSON Schema into real form fields, zero dependencies. |
| [`@feugene/granularity-media`](../granularity-media) | 1.0.2 | Media components: image cropping, camera capture, code scanning and video playback. |
| [`@feugene/granularity-test-kit`](../granularity-test-kit) | 1.1.0 | Test gates for @feugene/granularity design-system packages — token, registry and defaults contracts as reusable factories. |
| [`@feugene/unplugin-granularity`](../unplugin-granularity) | 1.0.0 | unplugin-vue-components resolver — granular auto-import for components and directives. |
<!-- ecosystem:generated:end -->

## Documentation

- [`docs/README.md`](./docs/README.md) — overview and documentation map
- [`docs/installation.md`](./docs/installation.md) — installation, public entrypoints, and adoption strategies
- [`docs/styling.md`](./docs/styling.md) — style layers, themes, and import order
- [`docs/tokens.md`](./docs/tokens.md) — design token reference (generated from `tokens/*.json`)
- [`docs/entry-sizes.md`](./docs/entry-sizes.md) — the weight of every component as a subpath (generated from the build)
- [`docs/theming.md`](./docs/theming.md) — building a custom theme (roles, contrast rules, wiring)
- [`docs/keyboard.md`](./docs/keyboard.md) — keyboard contract per component
- [`docs/overlays.md`](./docs/overlays.md) — overlay contract: portal, layer stack, Esc, `inert`, focus
- [`docs/z-index.md`](./docs/z-index.md) — layering scale
- [`docs/ssr.md`](./docs/ssr.md) — server-side rendering contract
- [`docs/granum.md`](./docs/granum.md) — `granum` integration
- [`docs/localization.md`](./docs/localization.md) — how the package plugs into application localization
- [`docs/directives.md`](./docs/directives.md) — package-level directives
- [`docs/file-validation.md`](./docs/file-validation.md) — file validation API
- [`docs/components.md`](./docs/components.md) — catalog of published components
- [`docs/ADDING_COMPONENTS.md`](./docs/ADDING_COMPONENTS.md) — internal guide for adding a new component
