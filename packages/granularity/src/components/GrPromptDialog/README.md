# GrPromptDialog

## What it is

`GrPromptDialog` is a declarative single-value input-dialog primitive for the
Granularity design system, built on top of `GrDialog`. It shows a title, an
optional description, a labelled text input (via `GrFormField` + `GrInput`) and
Confirm / Cancel actions. The input value is exposed through `v-model:value` and
the dialog visibility through `v-model`.

Like `GrConfirmDialog`, it is a thin layer: overlay mechanics, focus handling and
accessibility come from the underlying `GrDialog` / `GrModal` stack. The component
adds the input field, required/validation behavior, an optional server-error block
and the async-confirmation props used by the imperative `useDialogService`.

## Why it exists

Asking the user for one short piece of text ("name this project", "enter a
reason") is a recurring need. `GrPromptDialog` standardizes that flow — layout,
field labelling, the "required" rule and error presentation — so prompts behave
consistently and accessibly without per-screen re-implementation.

It is the declarative counterpart to `useDialogService.prompt`. Both coexist:

- **Declarative** (`<GrPromptDialog v-model v-model:value>`): when the prompt is
  part of page state, needs custom body content via slots, or must be
  server-rendered.
- **Imperative** (`useDialogService.prompt`): for quick one-off input requests
  triggered from logic. The service mounts and drives this component internally.

## Public surface

- `v-model` (`modelValue`) — controls visibility.
- `v-model:value` (`value`) — the input string (a required prop).
- Content props: `title`, `description`, `label`, `placeholder`.
- Action props: `confirmText`, `cancelText`, `confirmVariant`, `confirmTone`,
  `buttonSize`.
- Validation props: `required` (default `true`), `requiredErrorText`,
  `fieldError` (external/server field error that takes priority over the built-in
  required check).
- `GrDialog` pass-through props: `size`, `closeOnBackdrop`, `closeOnEsc`,
  `showHeader`, `showCloseButton`, `headerConfig`, `footerConfig`, `bodyConfig`,
  `closeLabel`.
- Async/service props: `error` (a `ResponseErrorInfo` rendered via
  `GrResponseErrorBanner`), `confirmLoading`, `confirmDisabled`, `closeOnConfirm`.
- Events: `confirm` (carries the value), `cancel`, `update:modelValue`,
  `update:value`.
- Slots: default (custom body above the field), `error` (custom general-error
  block), `footer` (custom actions).

## Validation behavior

When `required` is `true` (the default), an empty value is only flagged as an
error after the field has been "touched" — i.e. after a blur or a Confirm
attempt — so the dialog does not look erroneous the moment it opens. A Confirm
click on an empty required value does not close the dialog: it marks the field as
touched and focuses the input.

An external `fieldError` (typically from server validation) takes precedence over
the built-in required check and is shown beneath the input, with the input marked
invalid.

## Server error handling and data flow

Clicking Confirm emits `confirm` with the current value. If `closeOnConfirm` is
`true` (the default) the dialog closes; when `false`, closing is delegated to the
caller, which is how `useDialogService` keeps the dialog open while an async
`onConfirm` runs.

For server-side errors, the service classifies the raw response into a
`ResponseErrorInfo`. A general message is shown through the optional `error` prop
(`GrResponseErrorBanner`), while a field-level error for the `value` field is
mapped onto `fieldError` and rendered under the input — letting the user correct
the value and retry without losing context.

## Defaults and i18n

Texts default to "Confirm" / "Cancel", label "Value", required message "Enter a
value." and close-button label "Close". These are plain props, localized by
passing translated strings; the imperative service wires i18n-aware defaults
automatically.

## Accessibility & UX

Accessibility guarantees come from `GrDialog` / `GrModal` (single title, focus
trap, focus restoration) and from `GrFormField` / `GrInput` (label/error
association, invalid state). On open, validation noise is suppressed until first
interaction. During async confirmation the Confirm button shows a loading state
and dismissal is suppressed so the dialog cannot be closed mid-flight.
