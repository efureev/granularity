# @feugene/granularity-datepicker

> Date / time / range picker for the [`@feugene/granularity`](https://github.com/efureev/granularity) design system.

A themed, GR-owned wrapper around [`@vuepic/vue-datepicker`](https://vue3datepicker.com/), shipped as an **opt-in companion package** so the core `@feugene/granularity` stays lean. If you don't install this package, you don't pay for `@vuepic/vue-datepicker` (~48 KB gzip) or `date-fns` — nothing is pulled into the core.

## Why a separate package

`@feugene/granularity` is intentionally a set of lean, tree-shakeable primitives with a tiny dependency surface (`@floating-ui/dom`, `@headlessui/vue`). A full-featured date picker is a heavy, opinionated third-party widget with its own CSS and `date-fns` dependency — it doesn't belong in the core install. Keeping it here means:

- **Opt-in install weight** — only consumers that need a picker download the dependency chain.
- **A GR-owned contract** — the public props/events are ours (`GrDateTimePickerProps`), not `@vuepic`'s. The implementation can be swapped later without a breaking change.
- **Consistent theming** — the picker maps `@vuepic`'s `--dp-*` variables onto granularity design tokens (`--bg`, `--primary`, `--brd`, …), so it follows light/dark themes automatically.

## Install

```bash
yarn add @feugene/granularity-datepicker
# peers you already have with granularity:
#   @feugene/granularity  @feugene/unocss-preset-granular  vue
```

## Components

| Component | Description |
|---|---|
| `GrDateTimePicker` | Flexible base — `mode` (`date` \| `datetime` \| `time` \| `month` \| `year`) and `range`. |
| `GrDatePicker` | Preset: `mode="date"`. |
| `GrTimePicker` | Preset: `mode="time"`. |
| `GrDateRangePicker` | Preset: `mode="date"` + `range`. |

## Usage

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { GrDatePicker, GrDateTimePicker } from '@feugene/granularity-datepicker'
import type { GrDateTimeModel } from '@feugene/granularity-datepicker'

const date = ref<GrDateTimeModel>(null)
const when = ref<GrDateTimeModel>(null)
</script>

<template>
  <GrDatePicker v-model="date" locale="en" placeholder="Pick a date" />

  <GrDateTimePicker
    v-model="when"
    mode="datetime"
    enable-seconds
    locale="ru"
    placeholder="Pick date & time"
  />
</template>
```

Granular (per-component) import for maximum tree-shaking:

```ts
import { GrDatePicker } from '@feugene/granularity-datepicker/components/GrDatePicker'
```

## Props (`GrDateTimePicker`)

| Prop | Type | Default | Notes |
|---|---|---|---|
| `modelValue` | `GrDateTimeModel` | `null` | `v-model`. Shape depends on `mode`/`range`/`modelType`. |
| `mode` | `'date' \| 'datetime' \| 'time' \| 'month' \| 'year'` | `'date'` | What the user selects. |
| `range` | `boolean` | `false` | Range selection (model becomes an array). |
| `locale` | `'en' \| 'ru'` | — | Shorthand → `date-fns` locale. Arbitrary locales via `datepickerProps.locale`. |
| `placeholder` | `string` | — | |
| `disabled` | `boolean` | `false` | |
| `clearable` | `boolean` | `true` | Show the clear button. |
| `autoApply` | `boolean` | `true` | Apply on select, no confirm button. |
| `enableSeconds` | `boolean` | `false` | Seconds in time modes. |
| `minDate` / `maxDate` | `GrDateValue` | — | Allowed bounds. |
| `format` | `string` | — | Display format pattern. |
| `modelType` | `string` | — | How the value serializes (e.g. `'timestamp'`, `'yyyy-MM-dd'`). |
| `teleport` | `boolean \| string` | `true` | Menu teleport target; `false` to disable. |
| `ui` | `Record<string, unknown>` | — | Escape hatch — classes merged into the underlying `ui`. |
| `datepickerProps` | `Record<string, unknown>` | — | Escape hatch — raw `@vuepic/vue-datepicker` props (last-wins). |

**Events:** `update:modelValue`, `change`, `cleared`. All `@vuepic/vue-datepicker` slots are forwarded transparently.

## UnoCSS granular-provider

Register the provider alongside granularity so the picker's utility classes are scanned:

```ts
import { granularityProvider } from '@feugene/granularity/granular-provider/node'
import { granularityDatepickerProvider } from '@feugene/granularity-datepicker/granular-provider/node'

presetGranularNode({
  providers: [granularityProvider, granularityDatepickerProvider],
  components: ['@feugene/granularity-datepicker:GrDateTimePicker'],
})
```

## Auto-import (unplugin-vue-components)

Write `<GrDatePicker>` in a template without importing it, via the package's own resolver
(built on `@feugene/unplugin-granularity`'s shared factory):

```ts
// vite.config.ts
import Components from 'unplugin-vue-components/vite'
import { GranularityResolver } from '@feugene/unplugin-granularity'
import { GranularityDatepickerResolver } from '@feugene/granularity-datepicker/resolver'

export default defineConfig({
  plugins: [
    Components({
      resolvers: [
        GranularityDatepickerResolver(), // whitelist — must come first…
        GranularityResolver(),           // …before the greedy Gr* core resolver
      ],
    }),
  ],
})
```

The datepicker resolver uses an explicit whitelist of its four components, so it must be
registered **before** the core `GranularityResolver()` (which greedily claims any `Gr*` name).
Its CSS is inlined into the JS chunk, so no `styles.css` side-effect is added.

Requires the optional peers `@feugene/unplugin-granularity` (`>=0.4.0`) and
`unplugin-vue-components` — install them only if you use auto-import.

## License

SEE LICENSE IN LICENSE (inherits the monorepo license).
