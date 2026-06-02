# GrConfirmDialog

## What it is

`GrConfirmDialog` is a declarative confirmation-dialog primitive for the
Granularity design system, built on top of `GrDialog`. It presents a title, a
message (or rich custom body) and two actions — Confirm and Cancel — and reports
the user's decision through events while controlling visibility with `v-model`.

It is intentionally a thin, focused layer: all overlay mechanics, focus handling,
transitions and accessibility come from the underlying `GrDialog` / `GrModal`
stack. `GrConfirmDialog` only adds the confirm/cancel action layout, the optional
server-error block, and the async-confirmation props consumed by the imperative
`useDialogService`.

## Why it exists

Confirmation is one of the most common dialog patterns ("are you sure you want to
delete this?"). Re-implementing the title/body/two-button layout for every such
case is repetitive and error-prone. `GrConfirmDialog` standardizes the layout,
button tones, default texts and accessibility, so confirmations look and behave
consistently across the product.

It is the declarative counterpart to the imperative `useDialogService`. Both are
intended to coexist:

- **Declarative** (`<GrConfirmDialog v-model>`): when the dialog is part of page
  state, needs rich custom content via slots, or must be server-rendered.
- **Imperative** (`useDialogService.confirm`): for quick, transient "ask and
  forget" flows triggered from logic. The service mounts and drives this very
  component internally.

## Public surface

- `v-model` (`modelValue`) — controls visibility.
- Content props: `title`, `description` (used when the default slot is empty).
- Action props: `confirmText`, `cancelText`, `confirmVariant`, `confirmTone`,
  `buttonSize`.
- `GrDialog` pass-through props: `size`, `closeOnBackdrop`, `closeOnEsc`,
  `showHeader`, `showCloseButton`, `headerConfig`, `footerConfig`, `bodyConfig`,
  `closeLabel`.
- Async/service props: `error` (a `ResponseErrorInfo` rendered via
  `GrResponseErrorBanner` in the body), `confirmLoading`, `confirmDisabled`,
  `closeOnConfirm`.
- Events: `confirm`, `cancel`, and `update:modelValue`.
- Slots: default (custom body, replaces `description`), `error` (custom error
  block, defaults to a `GrResponseErrorBanner`), and `footer` (custom actions).

## Behavior and data flow

- Clicking Confirm emits `confirm`. If `closeOnConfirm` is `true` (the default),
  the dialog also closes via `update:modelValue=false`. When `false`, closing is
  delegated to the caller — this is how `useDialogService` keeps the dialog open
  while an async `onConfirm` runs.
- Clicking Cancel (or closing via backdrop / Esc / the close button) emits
  `cancel` and closes the dialog.
- The `confirmLoading` prop puts the Confirm button into a loading state for
  in-flight async confirmation; `confirmDisabled` force-disables it.

## Server error handling

The optional `error` prop accepts a normalized `ResponseErrorInfo`. When set, the
component renders a non-dismissible `GrResponseErrorBanner` inside the body. This
is primarily used by `useDialogService` to surface parsed server errors (network
failures, validation, etc.) without closing the dialog, letting the user retry.
The `#error` slot allows fully custom error presentation.

## Defaults and i18n

Action texts default to "Confirm" / "Cancel" and the close-button label to
"Close". These are plain props, so applications localize them by passing
translated strings (the imperative service wires i18n-aware defaults
automatically).

## Accessibility & UX

Accessibility guarantees are inherited from `GrDialog` / `GrModal`: a single
dialog title, focus trap, and focus restoration to the trigger on close. Esc and
backdrop closing follow the `closeOnEsc` / `closeOnBackdrop` options and resolve
through the cancel branch. During async confirmation the primary action
communicates progress through its loading state and the dialog suppresses
dismissal so it cannot be closed mid-flight.
