# Changelog

All notable changes to the [`@feugene/granularity`](./packages/granularity) package are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added
- Root repository artifacts: `README.md`, `LICENSE` (Apache-2.0), `CHANGELOG.md`, `CONTRIBUTING.md`.
- Added `repository`, `homepage`, `bugs`, `keywords`, `author`, `engines`, `publishConfig` metadata
  and an optional `unocss` peerDependency to `packages/granularity/package.json`.

### Changed
- Package license changed from `UNLICENSED` to `Apache-2.0`.
- CI split into separate jobs (`lint`, `test-granularity`, `build-granularity`,
  `test-showcase`, `build-showcase`, `deploy-showcase`, `publish`); publishing no longer depends on the showcase.
- `apps/showcase`: removed the duplicate package build — `generate:search` no longer rebuilds `@feugene/granularity`
  (for local development the preparation step runs in `yarn dev:showcase`).

### Removed
- Useless root-level `.npmignore` (publishing happens from `packages/granularity`, where `files` already applies).
