<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useSlots } from 'vue'

import { useGrComponentProp, useGrComponentSize } from '../GrConfigProvider/context'

import {
  descriptionColumnsClass,
  descriptionDensityClass,
  descriptionDividedClass,
  descriptionLabelInlineClass,
  descriptionLabelStackedClass,
  descriptionPairInlineClass,
  descriptionPairStackedClass,
  descriptionRootClass,
  descriptionSizeClass,
  descriptionValueClass,
  descriptionValueToneClass,
  type GrDescriptionColumns,
  type GrDescriptionDensity,
  type GrDescriptionLayout,
} from './grDescriptionListStyles'

import type { GrComponentSize } from '../shared/sizes'
import type { GrTone } from '../shared/tones'

export type {
  GrDescriptionColumns,
  GrDescriptionDensity,
  GrDescriptionLayout,
} from './grDescriptionListStyles'

export interface GrDescriptionItem {
  label: string
  /** Значение. `null` и `''` печатаются прочерком — строка не исчезает. */
  value?: string | number | null
  /** Ключ слотов `#value-<name>` и `#label-<name>`. */
  name?: string
  /** Тон значения. Подпись остаётся нейтральной всегда. */
  tone?: GrTone
}

/**
 * Список пар «характеристика → значение»: настоящий `<dl>` с выравниванием
 * значений в колонку.
 *
 * В отличие от `GrList`, где пункт — это «заголовок с подзаголовком», здесь
 * два разных по роли элемента: термин и его значение.
 */
export interface GrDescriptionListProps {
  items: readonly GrDescriptionItem[]
  /** `inline` — подпись слева колонкой; `stacked` — над значением. */
  layout?: GrDescriptionLayout
  /** Ширина колонки подписей при `inline`. */
  labelWidth?: string
  /**
   * Ниже какой ширины контейнера (px) `inline` переключается на `stacked`.
   * В узкой колонке фиксированная подпись выжимает значение в букву на строку.
   */
  stackBelow?: number
  density?: GrDescriptionDensity
  /** Отбивать пары линиями. */
  divided?: boolean
  columns?: GrDescriptionColumns
  /** Чем печатать пустое значение. */
  emptyText?: string
  size?: GrComponentSize
}

const props = withDefaults(defineProps<GrDescriptionListProps>(), {
  // Дефолты живут в резолверах ниже: Vue подставил бы свой раньше, чем
  // компонент заглянет в `GrConfigProvider`.
  layout: undefined,
  labelWidth: undefined,
  stackBelow: undefined,
  density: undefined,
  divided: undefined,
  columns: undefined,
  emptyText: undefined,
  size: undefined,
})

const slots = useSlots()

const resolvedSize = useGrComponentSize(() => props.size, { component: 'GrDescriptionList' })
const resolvedLayout = useGrComponentProp('GrDescriptionList', 'layout', () => props.layout, 'inline')
const resolvedDensity = useGrComponentProp('GrDescriptionList', 'density', () => props.density, 'regular')
const resolvedDivided = useGrComponentProp('GrDescriptionList', 'divided', () => props.divided, false)
const resolvedColumns = useGrComponentProp('GrDescriptionList', 'columns', () => props.columns, 1)
const resolvedLabelWidth = useGrComponentProp('GrDescriptionList', 'labelWidth', () => props.labelWidth, '11rem')
const resolvedEmptyText = useGrComponentProp('GrDescriptionList', 'emptyText', () => props.emptyText, '—')

const rootEl = ref<HTMLElement | null>(null)
const narrow = ref(false)

/**
 * `stackBelow` меряет контейнер, а не вьюпорт: пары живут и в узкой карточке
 * на широком экране. Container query здесь не подходит — порог приходит числом
 * в пропе, а `var()` в условии запроса не работает.
 */
let observer: ResizeObserver | null = null

onMounted(() => {
  if (props.stackBelow === undefined || typeof ResizeObserver === 'undefined') return

  observer = new ResizeObserver(([entry]) => {
    narrow.value = entry.contentRect.width < (props.stackBelow as number)
  })
  if (rootEl.value) observer.observe(rootEl.value)
})

onBeforeUnmount(() => {
  observer?.disconnect()
  observer = null
})

// До монтирования действует заданная раскладка — это же и есть серверный рендер.
const effectiveLayout = computed<GrDescriptionLayout>(() => (
  narrow.value ? 'stacked' : resolvedLayout.value
))

const isInline = computed(() => effectiveLayout.value === 'inline')

const rootClass = computed(() => [
  descriptionRootClass,
  descriptionColumnsClass[resolvedColumns.value],
  descriptionSizeClass[resolvedSize.value],
  descriptionDensityClass[resolvedDensity.value],
].filter(Boolean).join(' '))

const pairClass = computed(() => [
  isInline.value ? descriptionPairInlineClass : descriptionPairStackedClass,
  resolvedDivided.value ? descriptionDividedClass : '',
].filter(Boolean).join(' '))

const labelClass = computed(() => (
  isInline.value ? descriptionLabelInlineClass : descriptionLabelStackedClass
))

const labelStyle = computed(() => (isInline.value ? { width: resolvedLabelWidth.value } : undefined))

/**
 * Пустое значение печатается прочерком, а не пропускается: «поле есть, значения
 * нет» и «поля нет» — разные утверждения, и выпавшая строка ломает и
 * выравнивание, и чтение.
 */
function isEmptyValue(item: GrDescriptionItem): boolean {
  return item.value === null || item.value === undefined || item.value === ''
}

function valueClass(item: GrDescriptionItem): string {
  return [
    descriptionValueClass,
    item.tone ? descriptionValueToneClass[item.tone] : '',
  ].filter(Boolean).join(' ')
}

function pairKey(item: GrDescriptionItem, index: number): string {
  return item.name ?? `${item.label}-${index}`
}

function hasSlot(name: string): boolean {
  return Boolean(slots[name])
}
</script>

<template>
  <dl ref="rootEl" data-gr-description-list :class="rootClass">
    <!-- Пара оборачивается в `<div>`: `dl > div > dt + dd` валиден по HTML5 и
         нужен для раскладки. Голые `<div>` вместо `dt`/`dd` — то, ради чего
         компонент и заводится. -->
    <div
      v-for="(item, index) in items"
      :key="pairKey(item, index)"
      data-gr-description-pair
      :class="pairClass"
    >
      <dt data-gr-description-label :class="labelClass" :style="labelStyle">
        <slot v-if="item.name && hasSlot(`label-${item.name}`)" :name="`label-${item.name}`" :item="item" />
        <template v-else>
          {{ item.label }}
        </template>
      </dt>

      <dd data-gr-description-value :class="valueClass(item)">
        <slot v-if="item.name && hasSlot(`value-${item.name}`)" :name="`value-${item.name}`" :item="item" />
        <template v-else-if="isEmptyValue(item)">
          <slot name="empty" :item="item">
            {{ resolvedEmptyText }}
          </slot>
        </template>
        <template v-else>
          {{ item.value }}
        </template>
      </dd>
    </div>
  </dl>
</template>
