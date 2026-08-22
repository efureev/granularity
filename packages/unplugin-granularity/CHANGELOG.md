# Changelog

All notable changes to the [`@feugene/unplugin-granularity`](.) package are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres
to [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [v0.6.0] 2026-08-22

Behaviour change: `importStyle` is now off by default.

### Fixed

- **`importStyle` pointed at a stylesheet no component publishes.** On by default, it added
  `<pkg>/components/<Name>/styles.css` as a side effect — a subpath the core does not export at all,
  so a consumer using the defaults hit `ERR_PACKAGE_PATH_NOT_EXPORTED` on every component, not on a
  rare one. Nothing inside this repository caught it: the showcase, the only consumer here, passes
  `importStyle: false`.

  It is off by default now, and for the core it is not needed at all: a component that has CSS of its
  own imports it from its own chunk (`libInjectCss`), and most components have none — their look is
  assembled by the UnoCSS preset from the components you select. The option stays for providers that
  ship CSS as separate files and declare them in `exports`.

## [v0.5.0] 2026-08-22

Breaking for old cores: the peer range now starts at `@feugene/granularity@0.28.2`.

### Fixed

- **Parts of composite components resolved to a path no package published.** The greedy `Gr*`
  resolver built `@feugene/granularity/components/GrTimelineItem`, while the package published a
  subpath only for components with their own `index.ts` and `config.ts`. Parts live in the parent's
  directory, so a consumer's build failed with `"./components/GrTimelineItem" is not exported under
  the conditions` — no type error, no warning, and only once the part actually appeared in a
  template. All twenty were affected: menu items, `GrListItem`, `GrSidebarItem`, `GrTabPanel`, the
  parts of `GrDialog`.

  Fixed in the core rather than here: `@feugene/granularity@0.28.2` publishes a subpath alias for
  every part, so the plugin builds the path by name, the same way it does for any component, and
  carries no knowledge of what is composed of what. Hence the peer bump — on an older core those
  subpaths do not exist.

### Added

- **`subcomponents` on `createGranularResolver`** — a map «part → owning component» for a provider
  that does not publish such aliases yet: the import, and the `styles.css` side effect with it, are
  taken from the owner's subpath. Companion packages of the core no longer need it.

## [v0.4.1] 2026-08-12

### Fixed

- **The documented default for `prefix` was wrong.** The README said `default 'Ds'`; the resolver has
  defaulted to `'Gr'` since the package was renamed, so anyone who trusted the README set a prefix
  they did not need.

### Changed

- **Examples point at `@feugene/granularity-chrono`.** The companion package they referenced
  (`@feugene/granularity-datepicker`) has been removed from the repository, so every snippet, comment
  and test fixture named a package that no longer exists.

- **The peer range on the core is `>=0.12.0`.** It claimed `>=0.11.0`, while the resolver has needed
  the subpath layout introduced in 0.12.0 all along.

## [v0.4.0] 2026-07-19

### Added

- `createGranularResolver` — a generic `unplugin-vue-components` component-resolver factory for
  any granular package in the ecosystem (core or companion). Matches by `prefix` (greedy) or an
  explicit `components` whitelist, targets a configurable `packageName`, and optionally adds the
  per-component `styles.css` side-effect (`importStyle`, default `false` for CSS-inlined packages).
  Companion packages (e.g. `@feugene/granularity-datepicker`) build their own resolver on top of it.

### Changed

- `GranularityResolver` is now implemented on top of `createGranularResolver` — no behavior change.

## [v0.3.1] 2026-07-16
