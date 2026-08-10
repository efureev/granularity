<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import GrLink from '../GrLink/GrLink.vue'
import { useGrComponentProp, useGrComponentSize } from '../GrConfigProvider/context'
import { useGranularityTranslations } from '../../internal/granularityI18n'

import {
  breadcrumbsCurrentClass,
  breadcrumbsEllipsisClass,
  breadcrumbsItemIconClass,
  breadcrumbsLabelClass,
  breadcrumbsListClass,
  breadcrumbsListNowrapClass,
  breadcrumbsListWrapClass,
  breadcrumbsRootClass,
  breadcrumbsSeparatorClass,
  breadcrumbsSizeClassBySize,
  type GrBreadcrumbItem,
  type GrBreadcrumbsLinkComponent,
  type GrBreadcrumbsSize,
  resolveBreadcrumbsFit,
  resolveBreadcrumbsLayout,
} from './grBreadcrumbsStyles'

export type { GrBreadcrumbItem, GrBreadcrumbsSize } from './grBreadcrumbsStyles'

/**
 * Путь до текущей страницы (WAI-ARIA breadcrumb): `<nav>` с именем, внутри
 * упорядоченный список ссылок, последний пункт — текущая страница.
 *
 * Ссылки рисует `GrLink`, поэтому роутер подключается тем же способом, что и
 * везде в пакете: `as` + `to`.
 */
export interface GrBreadcrumbsProps {
  /** Путь от корня к текущей странице. Последний пункт — текущая страница. */
  items: GrBreadcrumbItem[]
  /** Компонент ссылки для всех пунктов: `RouterLink`, `NuxtLink`, `Link` Inertia. */
  as?: GrBreadcrumbsLinkComponent
  /** Разделитель между пунктами. Декоративен: диктору не читается. */
  separator?: string
  size?: GrBreadcrumbsSize
  /**
   * С какого числа пунктов схлопывать середину в «…». `0`/не задано — показывать
   * путь целиком.
   */
  maxItems?: number
  /** Сколько пунктов оставить в начале при схлопывании. */
  itemsBeforeCollapse?: number
  /** Сколько пунктов оставить в конце при схлопывании. */
  itemsAfterCollapse?: number
  /** Имя лендмарка. Не задано — берётся из локали. */
  ariaLabel?: string
  /** Последний пункт остаётся ссылкой (текущая страница кликабельна). */
  linkCurrent?: boolean
  /** i18n-метка кнопки раскрытия схлопнутого пути. */
  expandLabel?: string
  /**
   * Схлопывать по доступной ширине, а не по числу пунктов. Путь становится
   * однострочным, середина уходит под «…» ровно настолько, насколько не влезает.
   *
   * Без пропа поведение прежнее: список переносится на вторую строку, а порог
   * задаёт `maxItems`. Вместе пропы совместимы — `maxItems` остаётся жёстким
   * потолком, ширина ужимает дальше.
   */
  autoCollapse?: boolean
}

const props = withDefaults(defineProps<GrBreadcrumbsProps>(), {
  as: undefined,
  separator: undefined,
  size: undefined,
  maxItems: undefined,
  itemsBeforeCollapse: 1,
  itemsAfterCollapse: 1,
  ariaLabel: undefined,
  linkCurrent: false,
  expandLabel: undefined,
  autoCollapse: false,
})

defineSlots<{
  /** Содержимое пункта целиком (иконка и подпись). */
  item?: (props: { item: GrBreadcrumbItem, index: number, isCurrent: boolean }) => unknown
  /** Разделитель между пунктами. */
  separator?: () => unknown
  /** Кнопка раскрытия схлопнутой середины. */
  ellipsis?: (props: { hiddenCount: number, expand: () => void }) => unknown
}>()

const { t } = useGranularityTranslations()

const resolvedSize = useGrComponentSize(() => props.size, { component: 'GrBreadcrumbs' })
const resolvedSeparator = useGrComponentProp('GrBreadcrumbs', 'separator', () => props.separator, '/')

const resolvedAriaLabel = computed(() => props.ariaLabel ?? t('gr.breadcrumbs.label', 'Breadcrumb'))
const resolvedExpandLabel = computed(() => props.expandLabel ?? t('gr.breadcrumbs.expand', 'Show hidden path'))

const rootEl = ref<HTMLElement | null>(null)
const listEl = ref<HTMLElement | null>(null)
const expanded = ref(false)

/**
 * Схлопывание по ширине: сколько пунктов хвоста влезает.
 *
 * `undefined` — ещё не мерили, показываем путь целиком. Первый кадр в режиме
 * `autoCollapse` намеренно полный: ширины снимаются с него, а посчитать их до
 * рендера неоткуда.
 */
const fitAfter = ref<number | undefined>(undefined)

/** Ширины не зависят от контейнера, поэтому живут до смены самого пути. */
let measured: { items: number[], separator: number } | null = null
/**
 * Ширина кнопки «…» узнаётся только когда она отрисована, то есть уже после
 * первого схлопывания. До этого считаем её нулевой: поправка может лишь
 * ужать хвост ещё на пункт, а не вернуть спрятанное, поэтому качелей не будет.
 */
let ellipsisWidth = 0

// Новый путь — новая страница: раскрытая середина прошлого пути к ней отношения
// не имеет, а измеренные ширины относятся к прошлым подписям.
watch(() => props.items, () => {
  expanded.value = false
  measured = null
  fitAfter.value = undefined
  void nextTick(measure)
})

const lastIndex = computed(() => props.items.length - 1)

/**
 * Схлопывание по ширине выражается через тот же `maxItems`: раскладку считает
 * одна функция, а режимы отличаются только тем, откуда взялось число.
 */
const autoMaxItems = computed(() => {
  if (!props.autoCollapse || fitAfter.value === undefined) return undefined
  if (fitAfter.value >= props.items.length) return undefined

  return props.items.length - 1
})

const effectiveMaxItems = computed(() => {
  const limits = [props.maxItems, autoMaxItems.value].filter((value): value is number => typeof value === 'number' && value > 0)

  return limits.length > 0 ? Math.min(...limits) : undefined
})

const effectiveAfter = computed(() => (
  props.autoCollapse && fitAfter.value !== undefined ? fitAfter.value : props.itemsAfterCollapse
))

const entries = computed(() => resolveBreadcrumbsLayout({
  items: props.items,
  maxItems: effectiveMaxItems.value,
  itemsBeforeCollapse: props.itemsBeforeCollapse,
  itemsAfterCollapse: effectiveAfter.value,
  expanded: expanded.value,
}))

function isCurrent(index: number): boolean {
  return index === lastIndex.value
}

/** Ссылкой пункт становится, только если ведёт куда-то и не выключен. */
function isLink(item: GrBreadcrumbItem, index: number): boolean {
  if (item.disabled) return false
  if (isCurrent(index) && !props.linkCurrent) return false
  return item.href !== undefined || item.to !== undefined || props.as !== undefined
}

function widthOf(el: Element | null | undefined): number {
  // `scrollWidth`, а не прямоугольник: у подписи стоит `truncate`, и в узком
  // контейнере прямоугольник вернул бы уже ужатую ширину, а не собственную.
  return el ? (el as HTMLElement).scrollWidth : 0
}

/**
 * Снять ширины с полного пути и пересчитать, сколько пунктов хвоста влезает.
 *
 * Замер делается один раз на путь: подписи от ширины контейнера не зависят,
 * поэтому `resize` пересчитывает только арифметику.
 */
function measure(): void {
  if (!props.autoCollapse) return

  const list = listEl.value
  if (!list) return

  const ellipsis = list.querySelector('[data-gr-breadcrumbs-ellipsis-item]')
  if (ellipsis) ellipsisWidth = widthOf(ellipsis)

  if (!measured) {
    // Ширины снимаем только с полного пути: спрятанных пунктов в DOM нет.
    if (fitAfter.value !== undefined) return

    const wraps = [...list.querySelectorAll('[data-gr-breadcrumbs-item-wrap]')]
    if (wraps.length !== props.items.length) return

    measured = {
      items: wraps.map(widthOf),
      separator: widthOf(list.querySelector('[data-gr-breadcrumbs-separator]')),
    }
  }

  const available = list.clientWidth
  // jsdom и скрытый контейнер отдают 0 — решать по такой ширине нечего.
  if (available <= 0) return

  fitAfter.value = resolveBreadcrumbsFit({
    itemWidths: measured.items,
    separatorWidth: measured.separator,
    ellipsisWidth,
    available,
    itemsBeforeCollapse: props.itemsBeforeCollapse,
  })
}

/**
 * Ширина кнопки «…» известна только после того, как она отрисована, то есть
 * после первого схлопывания. Поэтому решение пересчитывается ещё раз: поправка
 * либо ничего не меняет, либо ужимает хвост на пункт. Цикла нет — второй проход
 * оставляет `fitAfter` прежним, и наблюдатель больше не срабатывает.
 */
watch(fitAfter, () => void nextTick(measure))

let observer: ResizeObserver | null = null

watch(() => props.autoCollapse, (enabled) => {
  if (enabled) {
    void nextTick(measure)
    return
  }

  measured = null
  fitAfter.value = undefined
})

onMounted(() => {
  void nextTick(measure)

  // На сервере и в jsdom `ResizeObserver` отсутствует — измерять там нечего.
  if (typeof ResizeObserver === 'undefined') return

  observer = new ResizeObserver(() => measure())
  if (listEl.value) observer.observe(listEl.value)
})

onBeforeUnmount(() => observer?.disconnect())

async function expand(): Promise<void> {
  expanded.value = true

  // Кнопка исчезает вместе со схлопыванием, и фокус ушёл бы на `<body>`.
  // Переводим его на первый раскрытый пункт — там, где кнопка и стояла. Пункты
  // без ссылки держат `tabindex="-1"` именно ради этого случая.
  await nextTick()
  const before = Math.max(0, Math.min(props.itemsBeforeCollapse, props.items.length))
  const revealed = rootEl.value?.querySelectorAll<HTMLElement>('[data-gr-breadcrumbs-item]')
  revealed?.[before]?.focus()
}
</script>

<template>
  <nav
    ref="rootEl"
    data-gr-breadcrumbs
    :class="[breadcrumbsRootClass, breadcrumbsSizeClassBySize[resolvedSize]]"
    :aria-label="resolvedAriaLabel"
  >
    <ol
      ref="listEl"
      data-gr-breadcrumbs-list
      :class="[breadcrumbsListClass, autoCollapse ? breadcrumbsListNowrapClass : breadcrumbsListWrapClass]"
    >
      <template v-for="(entry, position) in entries" :key="entry.kind === 'item' ? `item-${entry.index}` : 'ellipsis'">
        <!--
          Разделитель — отдельный элемент списка и помечен `aria-hidden`:
          структуру пути диктору сообщает сам список, а «/» он бы читал вслух.
        -->
        <li
          v-if="position > 0"
          data-gr-breadcrumbs-separator
          :class="breadcrumbsSeparatorClass"
          aria-hidden="true"
        >
          <slot name="separator">
            {{ resolvedSeparator }}
          </slot>
        </li>

        <li v-if="entry.kind === 'ellipsis'" data-gr-breadcrumbs-ellipsis-item class="min-w-0">
          <slot name="ellipsis" :hidden-count="entry.hiddenCount" :expand="expand">
            <button
              type="button"
              data-gr-breadcrumbs-ellipsis
              data-testid="gr-breadcrumbs-ellipsis"
              :class="breadcrumbsEllipsisClass"
              :aria-label="resolvedExpandLabel"
              @click="expand"
            >
              …
            </button>
          </slot>
        </li>

        <li v-else data-gr-breadcrumbs-item-wrap class="min-w-0">
          <GrLink
            v-if="isLink(entry.item, entry.index)"
            :key="`link-${entry.index}`"
            data-gr-breadcrumbs-item
            :as="as"
            :href="entry.item.href"
            :to="entry.item.to"
            :size="resolvedSize"
            :variant="isCurrent(entry.index) ? 'default' : 'muted'"
            :aria-label="entry.item.ariaLabel"
            :aria-current="isCurrent(entry.index) ? 'page' : undefined"
          >
            <slot name="item" :item="entry.item" :index="entry.index" :is-current="isCurrent(entry.index)">
              <span v-if="entry.item.icon" :class="[breadcrumbsItemIconClass, entry.item.icon]" aria-hidden="true" />
              <span :class="breadcrumbsLabelClass">{{ entry.item.label }}</span>
            </slot>
          </GrLink>

          <!--
            Текущая страница и выключенный пункт — не ссылки. `aria-current`
            остаётся на текущем: именно он отвечает на вопрос «где я».
          -->
          <span
            v-else
            data-gr-breadcrumbs-item
            :class="breadcrumbsCurrentClass"
            :aria-label="entry.item.ariaLabel"
            :aria-current="isCurrent(entry.index) ? 'page' : undefined"
            :aria-disabled="entry.item.disabled ? 'true' : undefined"
            tabindex="-1"
          >
            <slot name="item" :item="entry.item" :index="entry.index" :is-current="isCurrent(entry.index)">
              <span v-if="entry.item.icon" :class="[breadcrumbsItemIconClass, entry.item.icon]" aria-hidden="true" />
              <span :class="breadcrumbsLabelClass">{{ entry.item.label }}</span>
            </slot>
          </span>
        </li>
      </template>
    </ol>
  </nav>
</template>
