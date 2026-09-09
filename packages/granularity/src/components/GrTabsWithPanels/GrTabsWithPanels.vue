<script setup lang="ts">
/**
 * GrTabsWithPanels — ряд вкладок вместе с их панелями.
 *
 * Пара `GrTabs` + `GrTabPanels` требует двух одинаковых значений в двух местах:
 * активная вкладка и `idBase`, из которого строится связка `tab` ↔ `tabpanel`.
 * Дублирование расходилось молча — `GrTabs` проставляет вкладкам `id` только при
 * явном `idBase`, поэтому при обычном использовании панель ссылалась в пустоту.
 *
 * Здесь оба значения принадлежат одному компоненту: `v-model` один, `idBase`
 * генерируется внутри и раздаётся обеим половинам.
 */
import { computed, useId } from 'vue'

import GrTabPanels from '../GrTabPanels/GrTabPanels.vue'
import GrTabs from '../GrTabs/GrTabs.vue'
import type { GrTab, GrTabsProps } from '../GrTabs/GrTabs.vue'

export interface GrTabsWithPanelsProps extends GrTabsProps {}

export interface GrTabsWithPanelsEmits {
  (e: 'update:modelValue', value: string): void
  /** Просьба закрыть вкладку — всплывает из `GrTabs` как есть. */
  (e: 'close', value: string): void
}

/*
 * Дефолт у каждого проброшенного пропа — `undefined`, включая булев `closable`.
 * Иначе Vue привёл бы его к `false`, и в `GrTabs` он приехал бы как явно
 * переданный, а не как отсутствующий. У `variant` и `size` это принципиально:
 * их дефолт живёт в резолвере `GrConfigProvider`, и подставленное здесь значение
 * перекрыло бы провайдера.
 */
const props = withDefaults(defineProps<GrTabsWithPanelsProps>(), {
  idBase: undefined,
  size: undefined,
  variant: undefined,
  activationMode: undefined,
  orientation: undefined,
  closable: undefined,
  emptyText: undefined,
})

const emit = defineEmits<GrTabsWithPanelsEmits>()

defineSlots<{
  /** Панели (`GrTabPanel`). */
  default?: () => any
  /** Содержимое вкладки целиком — уходит в `GrTabs`. */
  tab?: (props: { tab: GrTab, active: boolean, disabled: boolean }) => any
  /** Пустой ряд вкладок — уходит в `GrTabs`. */
  empty?: () => any
}>()

/**
 * Связка держится на совпадении вычисленных id, и генерировать базу обязан один
 * владелец. Явный `idBase` уважается: на эти id ссылаются и снаружи.
 */
const generatedIdBase = useId()
const resolvedIdBase = computed(() => props.idBase ?? generatedIdBase)

/** Вертикальный ряд вкладок стоит сбоку от панелей, а не над ними. */
const isVertical = computed(() => props.orientation === 'vertical')
</script>

<template>
  <div
    data-gr-tabs-with-panels
    :data-orientation="isVertical ? 'vertical' : 'horizontal'"
    :class="isVertical ? 'flex items-start gap-4' : 'flex flex-col gap-3'"
  >
    <GrTabs
      :model-value="modelValue"
      :tabs="tabs"
      :id-base="resolvedIdBase"
      :size="size"
      :variant="variant"
      :activation-mode="activationMode"
      :orientation="orientation"
      :closable="closable"
      :empty-text="emptyText"
      @update:model-value="value => emit('update:modelValue', value)"
      @close="value => emit('close', value)"
    >
      <template v-if="$slots.tab" #tab="slotProps">
        <slot name="tab" v-bind="slotProps" />
      </template>
      <template v-if="$slots.empty" #empty>
        <slot name="empty" />
      </template>
    </GrTabs>

    <GrTabPanels
      :model-value="modelValue"
      :id-base="resolvedIdBase"
      :class="isVertical ? 'min-w-0 flex-1' : ''"
    >
      <slot />
    </GrTabPanels>
  </div>
</template>
