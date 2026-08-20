# Changelog

All notable changes to the [`@feugene/granularity-datasource`](.) package are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres
to [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [v0.1.0] 2026-08-21

### Added

- **`useDataSource` — state of a list in one composable.** Sorting, filters, page, search, optional
  URL sync and race-free fetching. The pair "table + filter panel + pagination" is written from
  scratch in every project, and every time the same way: state is lost on reload, a filtered list
  cannot be shared as a link, and a late response overwrites a fresh one — the table blinks with
  someone else's data.

  Two strategies behind one interface: server (`fetcher`) and client (`rows` in full, with local
  filtering, ordering and slicing). The binding is exposed as writable refs for `v-model` —
  `page`, `perPage`, `sortKey`, `sortDir`, `search` — and as `table` / `pagination` prop objects for
  `v-bind`. Refs are the primary path because `vue-tsc` does not count a `v-bind` spread towards
  required props: to strict template checking `<GrPagination v-bind="pagination" />` is a component
  missing `page`, `pageSize` and `total`.

  **The package never imports the core.** Those are plain prop objects spread with `v-bind`; the
  boundary is deliberate, because list state has no business knowing what draws the list.

- **Race protection by request number, not only `AbortController`.** The `fetcher` belongs to the
  consumer and is free not to forward the `signal` — then an aborted request still returns and
  overwrites fresh data. What actually closes the race is the sequence number: a response that is not
  the current one is dropped whatever it carries.

- **Two-way query-string serialisation, on request.** `url: { prefix }` — a composable that writes to
  the address bar by default would interfere with someone else's navigation and collide two lists on
  one page; the prefix separates them (`?users.page=2&orders.page=1`). Defaults are never written, so
  a link to the default list looks like a page address rather than six no-op parameters. Foreign
  parameters are left untouched.

- **Normalisation that removes a classic bug:** changing a filter, the search or the page size
  returns to the first page. Filter on page five and the result is an empty page — which reads as
  "nothing found" when something was found.

- Debounce for typed input (300 ms by default) that collapses a burst into one request; clicks on
  page and sorting are not delayed, being one-off actions rather than typing.
