# granularity

🌐 **Live showcase:** **https://efureev.github.io/granularity/** &nbsp;·&nbsp;
[![Showcase](https://img.shields.io/badge/showcase-online-brightgreen?logo=githubpages)](https://efureev.github.io/granularity/)
[![npm](https://img.shields.io/npm/v/@feugene/granularity.svg?logo=npm)](https://www.npmjs.com/package/@feugene/granularity)

Monorepo for the [`@feugene/granularity`](./packages/granularity) design system — a Vue 3 package
with components, styles, and a UnoCSS preset that supports granular subpath exports.

## Contents

- `packages/granularity` — the published [`@feugene/granularity`](./packages/granularity/README.md) package.
- `packages/granularity-*` — companion packages: [charts](./packages/granularity-charts/README.md),
  [chrono](./packages/granularity-chrono/README.md), [dashboard](./packages/granularity-dashboard/README.md),
  [forms-schema](./packages/granularity-forms-schema/README.md),
  [test-kit](./packages/granularity-test-kit/README.md).
- `apps/showcase` — live component showcase, deployed to GitHub Pages.
- `apps/playground*` — sandboxes for integration scenarios (not published, not covered by CI).

**Which component do I reach for?** [`docs/COMPONENT-MAP.md`](./docs/COMPONENT-MAP.md) answers that across
every package at once: forks that ask the distinguishing question first, then an alphabetical
index of all 85 components.

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
license and not an OSI-approved open-source one. Every package therefore declares
`"license": "SEE LICENSE IN LICENSE"` rather than an SPDX identifier. Read
[`LICENSE`](./LICENSE) in full before adopting the packages.
