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

/**
 * Без общего `idBase` вкладки с таким id не существует, и `aria-labelledby`
 * указывал бы в пустоту. Панель без имени — потеря, а ссылка в никуда — ложь:
 * диктор объявляет её пустой строкой вместо «нет подписи», и починить это
 * потребитель уже не может.
 */
const labelledBy = computed(() => (ctx?.tabsLinked.value ? tabId.value : undefined))

const wasActive = ref(isActive.value)
watch(isActive, (active) => {
  if (active)
    wasActive.value = true
})

const shouldRender = computed(() => {
  if (isActive.value)
    return true
  if (!props.keepAlive)
    return false
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
    if (!ctx || !isActive.value)
      return

    if (!ctx.tabsLinked.value) {
      console.warn(
        '[GrTabPanel] Панель не связана с вкладкой: у неё нет доступного имени. '
        + 'Передайте один и тот же `idBase` в `GrTabs` и `GrTabPanels`.',
      )
      return
    }

    if (tabId.value && !document.getElementById(tabId.value)) {
      console.warn(
        `[GrTabPanel] Вкладки с id "${tabId.value}" нет в документе: `
        + '`aria-labelledby` ссылается в пустоту. Передайте один и тот же `idBase` в `GrTabs` и `GrTabPanels`.',
      )
    }
  })
}

/*
 * Появление панели — `<Transition>` в шаблоне, и у него есть только фаза входа.
 * Уходящая панель обязана исчезать мгновенно: две панели одновременно
 * растянули бы контейнер на высоту обеих, и смена вкладки дёргала бы страницу.
 * При `keepAlive` перехода не будет вовсе — панель из DOM не уходит, а `hidden`
 * это `display: none`, который не анимируется в принципе.
 */

defineSlots<{
  /** Содержимое панели. */
  default?: () => any
}>()
</script>

<template>
  <Transition
    enter-active-class="transition ease-[var(--gr-ease-out)] duration-[var(--gr-duration-fast)]"
    enter-from-class="transform opacity-0 translate-y-1"
    enter-to-class="transform opacity-100 translate-y-0"
  >
    <div
      v-if="shouldRender"
      :id="panelId"
      role="tabpanel"
      data-gr-tab-panel
      :aria-labelledby="labelledBy"
      :hidden="keepAlive && !isActive ? true : undefined"
      :tabindex="isActive ? 0 : undefined"
      class="rounded-[var(--gr-radius-md)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)]"
    >
      <slot />
    </div>
  </Transition>
</template>
