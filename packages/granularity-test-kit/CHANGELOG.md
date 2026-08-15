# Changelog

All notable changes to `@feugene/granularity-test-kit` are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [v0.1.0] 2026-08-15

### Added

- Gate factories under `./gates`: `defineStyleTokensGate`, `defineComponentTokensGate`,
  `defineRegistryGate`, `defineComponentDefaultsGate` — the four contracts every design-system package
  owes, previously copied file-by-file into each of them.
- `defineGateCoverage` — a package that forgot to wire a gate now fails instead of staying green.
- Source-reading helpers under the root entry (`readSources`, `stripComments`, `tokenNamesIn`,
  `offenders`, `componentDirs`) for package-specific gates.
- `ownerPrefixOverrides` for token families named shorter than their component
  (`GrProgressBar` → `--gr-progress-`): the token name is a public theming contract, so renaming it for
  literalness would cost consumers a major version.
