<script setup lang="ts">
import { computed, provide, useId } from 'vue'

import { GR_TAB_PANELS_KEY } from './context'

/**
 * GrTabPanels — контейнер `tabpanel`-ов, companion к `GrTabs`.
 *
 * Показывает панель, чьё `value` совпадает с `modelValue`, и связывает её с
 * соответствующей вкладкой по ARIA (`role="tabpanel"`, `aria-labelledby`).
 *
 * Для полной связки `tab`↔`tabpanel` передайте **одинаковый `idBase`** и в
 * `GrTabs`, и в `GrTabPanels` — тогда id вкладок и панелей совпадут
 * (`aria-controls` ↔ `aria-labelledby`).
 */
const props = withDefaults(
  defineProps<{
    modelValue: string
    idBase?: string
  }>(),
  {
    idBase: undefined,
  },
)

const generatedIdBase = useId()
// `computed`, а не значение: `idBase` — реактивный проп, и вычисленный один раз
// при setup он оставил бы панели со старыми id, пока `GrTabs` уехал бы на новые.
// Связка `aria-controls` ↔ `aria-labelledby` разъезжается молча.
const resolvedIdBase = computed(() => props.idBase ?? generatedIdBase)

provide(GR_TAB_PANELS_KEY, {
  activeValue: computed(() => props.modelValue),
  idBase: resolvedIdBase,
})
</script>

<template>
  <div data-gr-tab-panels>
    <slot />
  </div>
</template>
