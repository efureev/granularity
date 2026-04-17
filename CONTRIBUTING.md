# Contributing

Thanks for your interest in the project! This document describes the basic contribution rules.

## Environment

- Node.js `>= 22` (CI runs on Node `22` and `24`).
- Yarn `1.22.x` (Classic). Use this specific version — the lockfile is only compatible with Yarn Classic.

```bash
yarn install
```

## Structure

- `packages/granularity` — the published package.
- `apps/showcase` — the showcase (deployed to GitHub Pages, not published to npm).
- `apps/playground*` — local sandboxes.

## Development workflow

1. Create a feature branch from `main`.
2. Make your changes and cover them with tests in `packages/granularity/src/**/__tests__`.
3. Before opening a PR, run locally:
   ```bash
   yarn workspace @feugene/granularity lint
   yarn test:granularity
   yarn build:granularity
   ```
4. Open a Pull Request against `main`. CI will run `lint`, `test`, and `build` for the package and the showcase.

## Code style

- ESLint: `@antfu/eslint-config`. Auto-fix: `yarn workspace @feugene/granularity lint:fix`.
- TypeScript: types are emitted by `vue-tsc` during the build; no type errors are allowed.
- Commits: [Conventional Commits](https://www.conventionalcommits.org/) are recommended — this simplifies changelog generation.

## Releases

- The version is bumped in `packages/granularity/package.json`, and a `vX.Y.Z` tag is created on `main`.
- Pushing the tag triggers the `publish` job in GitHub Actions: publishing to npm (with `--provenance`) and GitHub Packages.
- Update [`CHANGELOG.md`](./CHANGELOG.md) as part of the release PR.

## License

By contributing code, you agree that it is released under the [Apache-2.0](./LICENSE) license.
