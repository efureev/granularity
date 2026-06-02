# GrDialogService (`useDialogService`)

## What it is

`GrDialogService` is an **imperative dialog service** for the Granularity design
system. It exposes a composable
(`useDialogService`) and a ready-to-use singleton (`dialogService`) that let you
open confirmation, alert and prompt dialogs **directly from the `<script>` / `.ts`
section**, without placing any dialog component in the calling component's
template.

Internally it is a thin orchestrator on top of the existing declarative
components `GrConfirmDialog` and `GrPromptDialog`. It does not reimplement dialog
UI, focus handling or accessibility — it reuses those components and only manages
their lifecycle imperatively.

## Why it exists

The declarative `GrConfirmDialog` / `GrPromptDialog` require the caller to import
the component, add it to the template, hold reactive `modelValue` state and wire
`@confirm` / `@cancel` handlers. For one-off, "ask and forget" flows (for example,
"confirm before deleting"), this is noisy. The service removes that ceremony: a
single call returns a `Promise` that resolves with the user's decision.

Both styles are intended to coexist:

- **Declarative** (`<GrConfirmDialog v-model>`): when the dialog is part of page
  state, needs rich custom content via slots, or must be server-rendered.
- **Imperative** (`useDialogService`): for quick, transient prompts triggered from
  logic.

## Public surface

- `useDialogService(defaults?)` — returns a service bound to optional
  application-wide defaults. Also auto-caches the application context on first call
  inside `setup`.
- `dialogService` — a pre-created singleton service with no defaults.
- Service methods:
  - `confirm(message, options?)` — resolves `true` on confirm, `false` otherwise.
  - `alert(message, options?)` — single-button dialog, resolves when dismissed.
  - `prompt(message, options?)` — resolves the entered string, or `null` on cancel.
  - `open(kind, message, options?)` — low-level call resolving a discriminated
    `{ action, value }` result.
  - `closeAll()` — closes all active and queued dialogs.
  - `setAppContext(ctx)` — explicitly registers the Vue application context.
- Each method returns a `Promise` augmented with a `close()` method, so the caller
  can dismiss the dialog programmatically.

## Resolution semantics

High-level methods never reject; cancellation is a normal outcome, not an
exception. `confirm` resolves to a boolean, `prompt` resolves to `string | null`,
and `alert` resolves to `void`. Consumers needing the precise close reason use the
low-level `open()`, which resolves `{ action: 'confirm' | 'cancel' | 'close',
value? }`.

## Async confirmation flow (`onConfirm`)

`confirm` and `prompt` accept an `onConfirm` callback that receives a control
context and may be asynchronous. While it runs:

- the Confirm button enters a loading/disabled state;
- backdrop and Esc closing are suppressed so the dialog cannot be dismissed
  mid-flight;
- the dialog stays open if the callback returns `false`, sets any error, or
  throws.

The context object provides: the current `value`, an `AbortSignal` that aborts
when the dialog closes, `setError` / `setFieldError` / `clearErrors`,
`setRawError` (server-response classification, see below), `setLoading` and
`close`.

On success (no error set and not returning `false`), the dialog closes and the
outer promise resolves with the result.

## Server error handling and data flow

Server responses come in many shapes (Laravel, Symfony/RFC 7807, JSON:API, plain
Go services). Instead of parsing them manually, `onConfirm` can pass the raw
response (a `Response`, an axios/fetch error, an `Error`, a string or a JSON
object) to `ctx.setRawError`. The service runs it through the same parser pipeline
used by `GrResponseErrorBanner`, producing a normalized error:

- the general message and details are rendered in a `GrResponseErrorBanner` inside
  the dialog body;
- `fieldErrors` are mapped onto form fields — for `prompt`, the `value` field error
  is shown beneath the input;
- the dialog remains open so the user can correct and retry.

If `onConfirm` throws and no error was set manually, the thrown value is
automatically classified through `setRawError`.

### Parser strategy

The default parser chain is the **universal core** (`coreResponseErrorParsers`):
abort, network, HTTP-status and plain-message parsers. These are transport-level
and safe for any backend; they make no format-specific assumptions, so they never
mis-detect "almost-Laravel" payloads.

Server-specific parsers (Laravel validation, RFC 7807 problem details, JSON:API)
are opt-in. The `errorParsers` option accepts either a full replacement array or a
builder function that receives named presets (`core`, `all`, `laravel`,
`problemDetails`, `jsonApi`, `fileValidation`) for ergonomic composition, plus a
slot for custom parsers. Typically this is configured once at
`useDialogService(defaults)` and can be overridden per call.

## Application context (i18n / theme / provider)

Because the host is mounted imperatively (outside the normal component tree), it
must inherit the application context so that i18n, theming and the granular
provider work. Resolution priority is:

1. a per-call `appContext` option;
2. an explicitly registered context via `setAppContext`;
3. an auto-cached context captured the first time `useDialogService()` runs inside
   a component `setup`.

The auto-cache makes the service work out of the box in most apps; explicit
registration is available for non-`setup` callers and multi-application/micro-
frontend setups.

## Queueing

Dialogs are serialized through a FIFO queue. Only the head of the queue is
rendered at any time; a subsequent call is shown after the previous dialog closes.
This avoids focus-trap contention and overlapping backdrops, and keeps behavior
predictable when multiple dialogs are triggered nearly simultaneously.

## Lifecycle

A single host component is lazily mounted into `document.body` on first use and
reused for the lifetime of the application. Each dialog request creates an
`AbortController` that is aborted on close, and the request is removed from the
queue after it resolves, allowing the next queued dialog to open. The service is
SSR-safe: methods are no-ops when `window` / `document` are unavailable.

## Accessibility & UX

All accessibility guarantees come from the reused `GrConfirmDialog` /
`GrPromptDialog` / `GrDialog` / `GrModal` stack: a single dialog title, focus trap,
and focus restoration. Esc and backdrop closing follow the `closeOnEsc` /
`closeOnBackdrop` options and resolve through the cancel/close branch. During async
confirmation the primary action communicates progress through its loading state.
