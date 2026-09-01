# granularity

🌐 **Live showcase:** **https://efureev.github.io/granularity/** &nbsp;·&nbsp;
[![Showcase](https://img.shields.io/badge/showcase-online-brightgreen?logo=githubpages)](https://efureev.github.io/granularity/)
[![npm](https://img.shields.io/npm/v/@feugene/granularity.svg?logo=npm)](https://www.npmjs.com/package/@feugene/granularity)

Monorepo for the [`@feugene/granularity`](./packages/granularity) design system — a Vue 3 package
with components, styles, and a UnoCSS preset that supports granular subpath exports.

## Contents

The published packages:

<!-- Generated from the workspace by `yarn docs:ecosystem`; `yarn docs:ecosystem:check` gates it. -->
<!-- ecosystem:generated:start -->
- [`@feugene/granularity`](./packages/granularity/README.md) `0.42.0` — Granularity design system package with Vue 3 components, consumed via the `@feugene/unocss-preset-granular` preset.
- [`@feugene/granularity-charts`](./packages/granularity-charts/README.md) `0.11.0` — Charts for the @feugene/granularity design system — own SVG, zero dependencies, drawn with theme tokens.
- [`@feugene/granularity-chrono`](./packages/granularity-chrono/README.md) `0.10.0` — Calendar, date and time components for the @feugene/granularity design system — no third-party date widget, no date library.
- [`@feugene/granularity-code`](./packages/granularity-code/README.md) `0.2.0` — Code surfaces for @feugene/granularity: view, edit and diff — the viewer and the diff carry no dependencies at all.
- [`@feugene/granularity-dashboard`](./packages/granularity-dashboard/README.md) `0.6.0` — Widget grid for the @feugene/granularity design system — drag, resize, breakpoints and layout persistence, zero dependencies.
- [`@feugene/granularity-datasource`](./packages/granularity-datasource/README.md) `0.1.2` — List state for @feugene/granularity: sorting, filters, paging, URL sync and race-free fetching behind one composable.
- [`@feugene/granularity-devtools`](./packages/granularity-devtools/README.md) `0.3.2` — Vue DevTools panel for @feugene/granularity — where a prop value came from, the overlay layer stack and design-system warnings.
- [`@feugene/granularity-editor`](./packages/granularity-editor/README.md) `0.3.1` — Rich-text editing for @feugene/granularity: a TipTap-backed GrRichText field with a design-system toolbar.
- [`@feugene/granularity-forms-schema`](./packages/granularity-forms-schema/README.md) `0.4.0` — Schema-driven forms for the @feugene/granularity design system — zod and JSON Schema into real form fields, zero dependencies.
- [`@feugene/granularity-media`](./packages/granularity-media/README.md) `0.7.1` — Media components for @feugene/granularity: image cropping, camera capture, code scanning and video playback.
- [`@feugene/granularity-test-kit`](./packages/granularity-test-kit/README.md) `0.10.0` — Test gates for @feugene/granularity design-system packages — token, registry and defaults contracts as reusable factories.
- [`@feugene/unplugin-granularity`](./packages/unplugin-granularity/README.md) `0.7.1` — unplugin-vue-components resolver for @feugene/granularity — granular auto-import for components and directives.
<!-- ecosystem:generated:end -->

Not published, and living in `apps/`:

- `apps/showcase` — live component showcase, deployed to GitHub Pages.
- `apps/playground*` — sandboxes for integration scenarios (not published, not covered by CI).

**Which component do I reach for?** [`docs/COMPONENT-MAP.md`](./docs/COMPONENT-MAP.md) answers that across
every package at once: forks that ask the distinguishing question first, then an alphabetical
index of every component across all packages.

## Requirements

- Node.js `>= 22`
- Yarn `1.22.x` (Classic, see `packageManager` in the root `package.json`)

## Quick start

```bash
yarn install
yarn build:granularity     # build the package
yarn test:granularity      # run package tests
yarn dev:showcase          # run the showcase locally
```

## Release

- Packages are published to `npm` and GitHub Packages by GitHub Actions. The core releases on
  `v*` tags; every companion has its own tag and its own cycle — `granularity-charts-v*`,
  `granularity-chrono-v*`, `granularity-dashboard-v*`, `granularity-forms-schema-v*`,
  `granularity-test-kit-v*`,
  `unplugin-granularity-v*`.
- There is no changelog at the repository root: each package keeps its own, next to its
  `package.json`. Start with [`packages/granularity/CHANGELOG.md`](./packages/granularity/CHANGELOG.md).
- See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for the workflow.

## License

[Apache License 2.0 with an Additional Ethical Use Clause](./LICENSE) © Evgeniy Fureev

The clause adds a use restriction on top of Apache-2.0, so this is a **source-available**
license and not an OSI-approved open-source one. Read [`LICENSE`](./LICENSE) in full
before adopting the packages.

For a licence register, every package declares the SPDX expression
`LicenseRef-Granularity-EUC-1.1`. A plain-language explanation for legal and compliance
teams — what the clause does and does not restrict, and answers for vendor
questionnaires — is at <https://granularity.tech/legal/licensing>.

Contributions require a [contributor licence agreement](./CLA.md). You keep every right
in your contribution; it grants a non-exclusive licence, not ownership.
