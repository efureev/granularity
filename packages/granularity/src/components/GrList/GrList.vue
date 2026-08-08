<script setup lang="ts" generic="T = unknown">
import { computed, onMounted, onUpdated, ref, useSlots, watch } from 'vue'

import GrCard from '../GrCard'
import type { GrCardVariant } from '../GrCard/grCardStyles'
import GrSkeleton from '../GrSkeleton/GrSkeleton.vue'
import { hasMeaningfulSlotContent } from '../shared/slotNodes'
import { useGranularityTranslations } from '../../internal/granularityI18n'
import { useVirtualList, type GrVirtualAlign } from '../../composables/useVirtualList'

import { dividedClass, emptyClass, loadingRowClass } from './grListStyles'

export interface GrListProps<TItem = unknown> {
  /**
   * Поверхность списка — вариант карточки под ним. `ghost` убирает рамку и
   * тень: список внутри уже существующей карточки не должен давать вторую.
   */
  variant?: GrCardVariant
  /** Показывать ли горизонтальные разделители между элементами (по умолчанию — да). */
  divided?: boolean
  /** Идёт загрузка: вместо пунктов — строки-скелетоны, контейнер помечен `aria-busy`. */
  loading?: boolean
  /** Сколько строк-заглушек показать при `loading`. */
  loadingRows?: number
  /**
   * Список пуст. По умолчанию определяется сам — по содержимому слота; проп
   * нужен там, где потребитель знает лучше (например, слот заполнен
   * заголовками групп, а данных в них нет).
   */
  empty?: boolean
  /** Текст пустого состояния. Слот `#empty` сильнее. */
  emptyText?: string
  /**
   * Данные списка. С ними пункты рисует слот `#item`, а не слот по умолчанию, —
   * и только так список знает размер набора, то есть может его виртуализировать.
   */
  items?: TItem[]
  /** Ключ пункта для `v-for`: имя поля или функция. Без него — индекс. */
  itemKey?: string | ((item: TItem, index: number) => string | number)
  /** Высота видимой части: контейнер становится скроллером. Число — пиксели. */
  maxHeight?: number | string
  /** Держать в DOM только окно вокруг вьюпорта. Требует `items` и `maxHeight`. */
  virtual?: boolean
  /** Оценка высоты пункта до замера. Уточняется по факту при первом рендере. */
  estimatedItemSize?: number
}

const props = withDefaults(defineProps<GrListProps<T>>(), {
  // Дефолт живёт в `GrCard` (и его резолвере `GrConfigProvider`), поэтому здесь
  // остаётся `undefined` — иначе список перебивал бы настройку карточки.
  variant: undefined,
  divided: true,
  loading: false,
  loadingRows: 3,
  empty: undefined,
  emptyText: undefined,
  items: undefined,
  itemKey: undefined,
  maxHeight: undefined,
  virtual: false,
  // Строка обычной плотности с заголовком и описанием.
  estimatedItemSize: 56,
})

const slots = useSlots()
const { t } = useGranularityTranslations()

const listEl = ref<HTMLElement | null>(null)

const resolvedEmptyText = computed(() => props.emptyText ?? t('gr.list.empty', 'Nothing here yet'))

const dataMode = computed(() => props.items !== undefined)

// Пустоту видно по слоту: `v-for` по пустому массиву оставляет фрагмент без
// узлов, `v-if` — комментарий, и ни то ни другое пунктом списка не является.
const isEmpty = computed(() => {
  if (props.empty !== undefined)
    return props.empty

  if (dataMode.value)
    return props.items!.length === 0

  return !hasMeaningfulSlotContent(slots.default?.() ?? [])
})

const showItems = computed(() => !props.loading && !isEmpty.value)

// Разделители нужны только между пунктами: в пустой и загрузочной ветках они
// оставили бы висящую линию.
const listClass = computed(() => (props.divided && showItems.value ? dividedClass : undefined))

const loadingRowCount = computed(() => Math.max(1, Math.trunc(props.loadingRows)))

const virtualEnabled = computed(() => props.virtual && dataMode.value && props.maxHeight !== undefined)

const virtualizer = useVirtualList({
  container: listEl,
  count: () => (virtualEnabled.value && showItems.value ? props.items!.length : 0),
  // Замена массива сбрасывает замеры; append в тот же массив их сохраняет.
  source: () => props.items,
  itemSize: () => props.estimatedItemSize,
  // Первый рендер обязан совпасть с серверным: контейнера ещё нет, и окно
  // считается от объявленной высоты, а не от измеренной.
  viewportSize: () => (typeof props.maxHeight === 'number' ? props.maxHeight : undefined),
})

/** Окно к отрисовке: при выключенной виртуализации — весь набор. */
const renderedItems = computed(() => {
  const items = props.items ?? []
  if (!virtualEnabled.value) return items.map((item, index) => ({ item, index }))

  const { start, end } = virtualizer.range.value
  return items.slice(start, end).map((item, offset) => ({ item, index: start + offset }))
})

function keyOf(item: T, index: number): string | number {
  const key = props.itemKey
  if (typeof key === 'function') return key(item, index)
  if (typeof key === 'string') return (item as Record<string, unknown>)[key] as string | number

  return index
}

/**
 * ARIA-набор для пункта.
 *
 * Только в виртуальном режиме: в DOM тогда неполный набор, и без этих атрибутов
 * диктор объявил бы «7 из 20» на списке в пять тысяч. Когда набор в DOM целиком,
 * его размер и позицию браузер считает сам, а руками проставленные атрибуты
 * начинают расходиться с разметкой при любой фильтрации.
 */
function ariaOf(index: number): Record<string, number> {
  if (!virtualEnabled.value) return {}

  return { 'aria-setsize': props.items!.length, 'aria-posinset': index + 1 }
}

const maxHeightStyle = computed(() => {
  const value = props.maxHeight
  if (value == null) return undefined
  return typeof value === 'number' ? `${value}px` : value
})

const listStyle = computed(() => {
  if (props.maxHeight === undefined) return undefined

  const scroller = { overflowY: 'auto' as const, maxHeight: maxHeightStyle.value }
  if (!virtualEnabled.value) return scroller

  return { ...scroller, ...virtualizer.spacerStyle.value }
})

/**
 * Замер отрисованных пунктов.
 *
 * Идёт по детям контейнера, а не по `ref` на элементе: пункт рисует слот
 * потребителя, привязать к нему `ref` неоткуда. В виртуальном режиме прямые
 * дети контейнера — ровно окно (распорки живут псевдоэлементами и детьми не
 * считаются), поэтому сопоставление по позиции однозначно.
 */
function measureRendered(): void {
  if (!virtualEnabled.value) return

  const container = listEl.value
  if (!container) return

  const { start } = virtualizer.range.value
  const children = container.children
  for (let offset = 0; offset < children.length; offset++) {
    virtualizer.measure(start + offset, children[offset])
  }
}

onMounted(measureRendered)
onUpdated(measureRendered)

function scrollToIndex(index: number, align?: GrVirtualAlign): void {
  virtualizer.scrollToIndex(index, align)
}

defineExpose({ scrollToIndex })

if (import.meta.env?.DEV) {
  watch(
    () => [props.virtual, dataMode.value, props.maxHeight] as const,
    ([virtual, hasItems, maxHeight]) => {
      if (!virtual) return

      if (!hasItems) {
        console.warn(
          '[granularity] GrList: `virtual` требует `items` — пункты из слота по умолчанию '
          + 'список не считает и резать окно ему не из чего.',
        )
      }
      else if (maxHeight === undefined) {
        console.warn(
          '[granularity] GrList: `virtual` требует `maxHeight` — без ограничения высоты '
          + 'вьюпорта нет, и в окно попадает весь набор.',
        )
      }
    },
    { immediate: true },
  )

  watch(
    () => [dataMode.value, Boolean(slots.item)] as const,
    ([hasItems, hasSlot]) => {
      if (hasItems && !hasSlot) {
        console.warn(
          '[granularity] GrList: с `items` пункты рисует слот `#item` — без него список пуст.',
        )
      }
    },
    { immediate: true },
  )

  onMounted(() => {
    if (!virtualEnabled.value) return

    const first = listEl.value?.firstElementChild
    if (first && !first.hasAttribute('aria-posinset')) {
      console.warn(
        '[granularity] GrList: при `virtual` пункты обязаны нести `aria-setsize`/`aria-posinset` — '
        + 'пробросьте `aria` из слота `#item`: <GrListItem v-bind="aria" … />. Иначе диктор '
        + 'посчитает набор по отрисованному окну.',
      )
    }
  })
}
</script>

<template>
  <GrCard :variant="variant">
    <div
      ref="listEl"
      data-gr-list
      role="list"
      :class="listClass"
      :style="listStyle"
      :tabindex="maxHeight === undefined ? undefined : 0"
      :data-gr-virtual="virtualEnabled ? '' : undefined"
      :aria-busy="loading ? 'true' : undefined"
    >
      <template v-if="loading">
        <slot name="loading">
          <div
            v-for="row in loadingRowCount"
            :key="row"
            data-gr-list-loading-row
            :class="loadingRowClass"
          >
            <GrSkeleton />
          </div>
        </slot>
      </template>

      <div
        v-else-if="isEmpty"
        data-gr-list-empty
        :class="emptyClass"
      >
        <slot name="empty">
          {{ resolvedEmptyText }}
        </slot>
      </div>

      <template v-else-if="dataMode">
        <template
          v-for="entry in renderedItems"
          :key="keyOf(entry.item, entry.index)"
        >
          <slot
            name="item"
            :item="entry.item"
            :index="entry.index"
            :aria="ariaOf(entry.index)"
          />
        </template>
      </template>

      <slot v-else />
    </div>
  </GrCard>
</template>

<style scoped>
/* Срезанное сверху и снизу держат псевдоэлементы контейнера: их не за что
   размонтировать, в дереве доступности их нет, а высота приезжает переменными
   в том же патче, что и пункты. Почему не отступы контейнера и не поля крайних
   пунктов — `docs/virtual-list.md`. */
[data-gr-virtual]::before,
[data-gr-virtual]::after {
    content: '';
    display: block;
    flex: none;
}

[data-gr-virtual]::before {
    height: var(--gr-virtual-before, 0px);
}

[data-gr-virtual]::after {
    height: var(--gr-virtual-after, 0px);
}
</style>
