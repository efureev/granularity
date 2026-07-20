<script setup lang="ts">
import { computed, inject } from 'vue'

import { GR_TAB_PANELS_KEY } from './context'

/**
 * GrTabPanel — одна панель внутри `GrTabPanels`. Показывается, когда её `value`
 * равно активной вкладке. `keepAlive` оставляет неактивные панели в DOM
 * (скрытыми через `hidden`) — полезно, чтобы не терять состояние форм.
 */
const props = withDefaults(
  defineProps<{
    value: string
    keepAlive?: boolean
  }>(),
  {
    keepAlive: false,
  },
)

const ctx = inject(GR_TAB_PANELS_KEY, null)

const isActive = computed(() => (ctx ? ctx.activeValue.value === props.value : true))
// id совпадают с id вкладок `GrTabs` при одинаковом `idBase` → корректная ARIA-связка.
const panelId = computed(() => (ctx ? `${ctx.idBase}-panel-${props.value}` : undefined))
const tabId = computed(() => (ctx ? `${ctx.idBase}-tab-${props.value}` : undefined))
</script>

<template>
  <div
    v-if="isActive || keepAlive"
    :id="panelId"
    role="tabpanel"
    data-gr-tab-panel
    :aria-labelledby="tabId"
    :hidden="keepAlive && !isActive ? true : undefined"
    :tabindex="isActive ? 0 : undefined"
    class="rounded-[var(--gr-radius-md)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
  >
    <slot />
  </div>
</template>
