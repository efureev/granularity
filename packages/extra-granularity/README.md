# `@feugene/extra-granularity`

> ⚠️ **Test/reference package.** `extra-granularity` is not a production component library — it's a minimal
> **integration harness** that exercises [`@feugene/granularity`](../granularity/README.md) and
> [`@feugene/unocss-preset-granular`](../../..) together as a *second, independent consumer*. It proves that the
> granular contract (subpath exports, `dependencies` in `config.ts`, the `granular-provider` registry, tree-shaking)
> actually works end-to-end for a package built *on top of* granularity, not just inside it.

It ships exactly one deliberately small composite component — `XgQuickForm` — assembled from granularity primitives
(`GrFormField`, `GrInput`, `GrButton`). The component doesn't reimplement anything; it only wires three primitives
together, which is precisely the scenario this harness needs to validate.

## Why this package exists

- **Validates the granular contract from the outside.** `@feugene/granularity` is easy to get right when you're
  editing it directly. `extra-granularity` is a separate workspace package with its own `peerDependency` on
  granularity — the same setup a real downstream consumer would have. If subpath exports, `granular-provider`
  dependency resolution, or tree-shaking silently break, this package is where it shows up first.
- **Proves composite packages are a valid pattern.** `@feugene/granularity` stays a **minimal runtime** of atomic
  primitives — nothing composite belongs there. `extra-granularity` demonstrates the alternative: a downstream
  package that composes primitives into ready-made building blocks, with its own release cycle and versioning.
- **Tree-shaking is exercised at both levels:**
  - inside `extra-granularity`, the composite is its own sub-path
    (`@feugene/extra-granularity/components/XgQuickForm`);
  - inside `granularity`, the sub-paths `components/<Name>` are consumed directly, so only the primitives actually
    used by the composite end up in the bundle.
- **Composite styles are opt-in.** `XgQuickForm`'s `styles.css` is marked via `sideEffects: ["**/*.css"]` and is only
  pulled in when the component is actually imported.

## Installation

```bash
yarn add @feugene/granularity @feugene/extra-granularity
```

`@feugene/granularity`, `@feugene/unocss-preset-granular`, and `vue` are declared as `peerDependencies` — a single
shared runtime version across the app, no duplication.

## What's inside

| Component | Sub-path | Built from |
|---|---|---|
| `XgQuickForm` | `@feugene/extra-granularity/components/XgQuickForm` | `GrFormField` + `GrInput` + `GrButton` |

> The `Xg` prefix (e**X**tra **G**ranularity) is intentionally different from granularity's `Gr*` prefix so composite
> components don't collide with `@feugene/unplugin-granularity`'s `GranularityResolver`, whose default `prefix` is
> `'Gr'`. If you want auto-import for `Xg*` components too, configure a second resolver instance with
> `prefix: 'Xg'` (see [Usage notes](#usage-notes) below).

## Usage

```ts
// main.ts
import { createApp } from 'vue'
import '@feugene/granularity/foundation.css'
// only the styles of the primitives XgQuickForm actually uses:
import '@feugene/granularity/components/GrFormField/styles.css'
import '@feugene/granularity/components/GrInput/styles.css'
import '@feugene/granularity/components/GrButton/styles.css'
import '@feugene/extra-granularity/components/XgQuickForm/styles.css'

import App from './App.vue'
createApp(App).mount('#app')
```

```vue
<!-- App.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import { XgQuickForm } from '@feugene/extra-granularity/components/XgQuickForm'

const items = ref<string[]>([])
function onSubmit(value: string) {
  if (value) items.value.push(value)
}
</script>

<template>
  <XgQuickForm
    label="Add a task"
    placeholder="Type something…"
    submit-label="Add"
    @submit="onSubmit"
  />
</template>
```

### `XgQuickForm` API

| Prop | Type | Default | Description |
|---|---|---|---|
| `modelValue` | `string` | `''` | Two-way binding for the input value. |
| `label` | `string?` | — | Field label (forwarded to `GrFormField`). |
| `placeholder` | `string?` | — | `GrInput` placeholder. |
| `submitLabel` | `string` | `'Submit'` | Default button text (override via the `submit` slot). |
| `error` | `string?` | — | Error message under the field; enables the `invalid` state. |
| `disabled` | `boolean` | `false` | Disables the whole form. |
| `loading` | `boolean` | `false` | Puts the button into a loading state and blocks input. |
| `raw` | `boolean` | `false` | Skip `.trim()` on the value at submit. |

| Event | Payload | Description |
|---|---|---|
| `update:modelValue` | `string` | Value changed. |
| `submit` | `string` | Form submitted (Enter or button click). |

| Slot | Description |
|---|---|
| `submit` | Custom content for the submit button (defaults to `submitLabel`). |

## Usage notes

- 🟢 **Tree-shaking:** only the composites you actually import end up in the bundle — **along with the granularity
  primitives they depend on**, nothing more.
- 🟢 **No forced styles:** wiring up `foundation.css` and primitive CSS is the application's responsibility, exactly
  as with `granularity` itself.
- 🟡 **`unplugin-vue-components` auto-import:** the standard `GranularityResolver` only resolves the `Gr*` prefix. For
  `Xg*` components, either register a second resolver instance (`prefix: 'Xg'`, `from: '@feugene/extra-granularity/components/<Name>'`)
  or import composites manually.
- 🔴 **Don't add primitives here.** Anything achievable with a single `Gr*` component from granularity belongs in
  granularity. This package is composition only.
- 🔵 **This is a test harness, not a product library.** Treat `XgQuickForm` as a reference implementation for how a
  downstream composite package should be structured (`config.ts` dependencies, granular-provider wiring, subpath
  exports) — not as a component meant to grow a large surface area.

## Scripts

```bash
yarn workspace @feugene/extra-granularity build
yarn workspace @feugene/extra-granularity typecheck
```
