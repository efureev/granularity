# `@feugene/granularity`

`@feugene/granularity` is a `Vue 3` design system package that helps you build interfaces faster, cleaner, and more
predictably: with ready-made components, a transparent styling system, granular imports, and a tidy `UnoCSS`
integration.

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
- **Integrates with `UnoCSS` without forcing it on you.** If `UnoCSS` is already in the app — the package plugs into
  the existing pipeline. If it isn't — the basic scenario stays direct and simple.
- **Not just components.** Alongside the UI you get directives, a file validation API, and utility entrypoints for
  infrastructure scenarios.

## Technical highlights

- root export: `@feugene/granularity`;
- component subpath exports: `@feugene/granularity/components/<ComponentName>`;
- ready-made CSS entrypoints:
  - `@feugene/granularity/foundation.css` — `tokens` + built-in `light`/`dark` themes + `base`;
  - `@feugene/granularity/styles.css` — `foundation` plus styles for all components;
  - `@feugene/granularity/components/<ComponentName>/styles.css` — `foundation` plus styles for a specific component and its dependencies;
- low-level foundation exports: `@feugene/granularity/styles/tokens.css`, `@feugene/granularity/styles/base.css`, `@feugene/granularity/styles/themes/light.css`, `@feugene/granularity/styles/themes/dark.css`;
- package-level API: `@feugene/granularity/directives`, `@feugene/granularity/fileValidation`;
- two `UnoCSS` integration scenarios:
    - `@feugene/granularity/uno` — browser-safe preset;
    - `@feugene/granularity/uno-node` — node-oriented preset with CSS/preflight helpers.

## Quick start

```bash
yarn add @feugene/granularity vue
```

If the application uses `UnoCSS`:

```bash
yarn add -D unocss
```

```ts

import '@feugene/granularity/styles.css'
```

That's enough to quickly get a working base: `styles.css` already includes `foundation.css` (`tokens`, `base`,
built-in `light`/`dark` themes) and the styles for all components.

If you need a more precise CSS setup, use `@feugene/granularity/foundation.css` together with
`@feugene/granularity/components/<ComponentName>/styles.css`, or assemble styles via the `UnoCSS` preset.

## Documentation

- [`docs/README.md`](./docs/README.md) — overview and documentation map
- [`docs/installation.md`](./docs/installation.md) — installation, public entrypoints, and adoption strategies
- [`docs/styling.md`](./docs/styling.md) — style layers, themes, and import order
- [`docs/unocss.md`](./docs/unocss.md) — `UnoCSS` integration
- [`docs/localization.md`](./docs/localization.md) — how the package plugs into application localization
- [`docs/directives.md`](./docs/directives.md) — package-level directives
- [`docs/file-validation.md`](./docs/file-validation.md) — file validation API
- [`docs/components.md`](./docs/components.md) — catalog of published components
- [`docs/ADDING_COMPONENTS.md`](./docs/ADDING_COMPONENTS.md) — internal guide for adding a new component
