# GrResponseErrorBanner

## What it is

`GrResponseErrorBanner` is a transport-agnostic error-display component for the
Granularity design system. It renders a normalized `ResponseErrorInfo` — a general
message, optional per-field/detail lines and an HTTP-status badge — as a toned
`GrAlert`. It does **not** make requests or know about axios/fetch/xhr; it only
displays an already-parsed error structure.

The package ships three layers around the same engine:

- the `GrResponseErrorBanner` component (presentation);
- the `useResponseError` composable (stateful classify/retry/dismiss helper);
- a pluggable parser pipeline that turns raw responses of any shape into a
  `ResponseErrorInfo`.

Two opinionated wrappers are also provided: `GrUploadErrorBanner` (file-upload
presets with retry enabled) and `GrFormErrorBanner` (form-validation presets with
field labels and a warning tone for validation).

## Why it exists

Server and network errors arrive in many shapes (Laravel validation, RFC 7807 /
Symfony problem details, JSON:API, plain Go services, bare `Error`s, network
`TypeError`s). Rendering each of them ad-hoc leads to inconsistent, untranslated,
hard-to-test error UI. This component centralizes both the *classification* (via
parsers) and the *presentation* (via a single toned alert), so error states look
consistent and are easy to localize and test across the product.

## Data flow

1. A raw error/response is normalized (`normalizeError`) into a uniform shape
   (status, parsed body, headers, abort/network flags) regardless of transport.
2. A chain of parsers (`ResponseErrorParser[]`) inspects that context; results are
   merged in order, and a parser may `stop` the chain. The outcome is a
   `ResponseErrorInfo` with a semantic `kind`, a message, optional `details` and
   structured `fieldErrors`.
3. The banner renders that info: a `kind`-derived tone and title, the message, a
   de-duplicated detail/field list, and optional status badge and action buttons.

## Error kinds

`ResponseErrorKind` classifies errors by semantics, which drives the default tone:
`network` (no response — transport failure), `aborted` (client-cancelled),
`validation` (400/422 or structured field errors — "fix and retry"), `client`
(other 4xx), `server` (5xx — retry is reasonable) and `unknown` (fallback). By
default `aborted` is auto-hidden so cancellations are silent.

## Public surface

- Component props include: `error` (the info, `null` hides the banner), `texts`
  (partial text override), `tone` / `toneByKind`, `showDetails`,
  `showFieldLabels`, `fieldLabels`, `dedupeDetails`, `canRetry`, `canDismiss`,
  `autoHideKinds`, `showStatus`, `testIdPrefix`.
- Events: `retry` (carries the current error) and `dismiss`.
- `useResponseError(options)` returns: `currentError`, `isVisible`, `lastRaw`,
  `setRaw` (classify + store, async), `setError` (store a ready info), `classify`
  (classify without storing), `dismiss` / `reset`, and `retry` (run a handler and
  clear on success).
- Parsers and helpers: `coreResponseErrorParsers` (universal baseline),
  `defaultResponseErrorParsers` (full chain), `responseErrorParserPresets`,
  `extendDefaultParsers`, `createResponseErrorClassifier`, `normalizeError`,
  individual parsers (`laravelValidationParser`, `problemDetailsParser`,
  `jsonApiErrorParser`, `fileValidationParser`, `httpStatusParser`,
  `networkErrorParser`, `abortErrorParser`, `plainMessageParser`).

## Parser strategy

The universal core (`coreResponseErrorParsers` — abort, network, HTTP-status,
plain-message) is transport-level and safe for any backend; it makes no
format-specific assumptions, so it never mis-detects "almost-Laravel" payloads.
Server-specific parsers (Laravel validation, RFC 7807 problem details, JSON:API,
file validation) are opt-in and composed via `responseErrorParserPresets` or
`extendDefaultParsers`. Custom parsers are simple functions `(ctx) => result |
null` and can be inserted anywhere in the chain.

## Texts and i18n

Per-`kind` titles and messages, plus retry/dismiss labels, have built-in fallback
texts. They are resolved through the granularity translation layer
(`gr.responseError.*`) and can be further overridden via the `texts` prop. When a
parser leaves the default English fallback message, the banner substitutes the
i18n translation for the matching kind.

## Accessibility & UX

The banner builds on `GrAlert`, inheriting its semantics and tone styling. Details
are rendered as a list with optional field labels; duplicate lines between the
main message and details are removed. Retry and dismiss are optional buttons that
emit events rather than performing side effects, leaving control with the
consumer. The `GrUploadErrorBanner` and `GrFormErrorBanner` wrappers simply preset
these options for their respective scenarios.
