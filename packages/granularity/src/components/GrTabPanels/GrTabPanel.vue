<script setup lang="ts">
import { computed, inject, onMounted, ref, watch } from 'vue'

import { GR_TAB_PANELS_KEY } from './context'

export interface GrTabPanelProps {
    value: string
    keepAlive?: boolean
    /**
     * Не монтировать содержимое, пока панель не показали впервые. Имеет смысл
     * вместе с `keepAlive`: без него неактивная панель и так не в DOM.
     */
    lazy?: boolean
}

/**
 * GrTabPanel — одна панель внутри `GrTabPanels`. Показывается, когда её `value`
 * равно активной вкладке. `keepAlive` оставляет неактивные панели в DOM
 * (скрытыми через `hidden`) — полезно, чтобы не терять состояние форм.
 */
const props = withDefaults(
  defineProps<GrTabPanelProps>(),
  {
    keepAlive: false,
    lazy: false,
  },
)

const ctx = inject(GR_TAB_PANELS_KEY, null)

const isActive = computed(() => (ctx ? ctx.activeValue.value === props.value : true))
// id совпадают с id вкладок `GrTabs` при одинаковом `idBase` → корректная ARIA-связка.
const panelId = computed(() => (ctx ? `${ctx.idBase.value}-panel-${props.value}` : undefined))
const tabId = computed(() => (ctx ? `${ctx.idBase.value}-tab-${props.value}` : undefined))

const wasActive = ref(isActive.value)
watch(isActive, (active) => {
  if (active) wasActive.value = true
})

const shouldRender = computed(() => {
  if (isActive.value) return true
  if (!props.keepAlive) return false
  return props.lazy ? wasActive.value : true
})

/**
 * Панель ссылается на вкладку по id, а существует ли вкладка — знает только
 * приложение: `GrTabs` с другим (или отсутствующим) `idBase` оставит
 * `aria-labelledby` висеть в пустоту. Проверяем это в dev, как `GrFormField`
 * проверяет забытый контрол.
 */
if (__GR_DEV__) {
  onMounted(() => {
    if (!tabId.value || !isActive.value) return
    if (document.getElementById(tabId.value)) return

    console.warn(
      `[GrTabPanel] Вкладки с id "${tabId.value}" нет в документе: `
      + '`aria-labelledby` ссылается в пустоту. Передайте один и тот же `idBase` в `GrTabs` и `GrTabPanels`.',
    )
  })
}

defineSlots<{
  /** Содержимое панели. */
  default?: () => any
}>()

</script>

<template>
  <div
    v-if="shouldRender"
    :id="panelId"
    role="tabpanel"
    data-gr-tab-panel
    :aria-labelledby="tabId"
    :hidden="keepAlive && !isActive ? true : undefined"
    :tabindex="isActive ? 0 : undefined"
    class="rounded-[var(--gr-radius-md)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)]"
  >
    <slot />
  </div>
</template>
