# granularity

Monorepo for the [`@feugene/granularity`](./packages/granularity) design system — a Vue 3 package
with components, styles, and a UnoCSS preset that supports granular subpath exports.

## Contents

- `packages/granularity` — the published [`@feugene/granularity`](./packages/granularity/README.md) package.
- `apps/showcase` — live component showcase, deployed to GitHub Pages.
- `apps/playground*` — sandboxes for integration scenarios (not published, not covered by CI).

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

- Package versions are published to `npm` and GitHub Packages on `v*` tags via GitHub Actions.
- See [`CONTRIBUTING.md`](./CONTRIBUTING.md) and [`CHANGELOG.md`](./CHANGELOG.md) for details.

## License

[Apache License 2.0](./LICENSE) © Evgeniy Fureev
