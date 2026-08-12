# Changelog

All notable changes to the [`@feugene/granularity-chrono`](.) package are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres
to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- Package scaffold: build config with a per-component entry map, `granular-provider`
  (browser and node entries), `unplugin-vue-components` resolver, `granular doctor`
  options and the registry generator. No components yet.
- Registries are generated from the file system by
  `@feugene/unocss-preset-granular/codegen` from day one — the barrel, the subpath
  exports, the build entries, the provider registry and the name list shared by the
  resolver and the build config. The predecessor kept six such lists in sync by hand.
- `types` points at `dist/types/index.d.ts`, without the stray `src/` segment that
  `vue-tsc` emits by default; `exports` includes `./package.json`. Both were logged
  as breaking changes to make before 1.0 in the audit of the predecessor.
- Package gates from day one: `vitest`, `eslint`, `typecheck`, a registry-drift
  check and `publint`, all wired into a CI job and into the repository's root
  `test` and `build` aggregates. The predecessor had none of them — no tests, no
  lint config, and a `typecheck` script CI never called.
- The registry gate reads what the generator wrote back from the built modules,
  not only its exit code: the provider registry, the name list shared by the
  resolver and the build config, the barrel, the subpath exports and the build
  entries must all agree with `src/components/`, in both directions.
