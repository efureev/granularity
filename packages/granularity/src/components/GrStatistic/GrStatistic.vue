<script setup lang="ts">
import { useGrComponentSize } from '../GrConfigProvider/context'
import { computed, markRaw, onBeforeUnmount, onMounted, ref, useSlots, watch, type Component } from 'vue'

import { useGranularityTranslations } from '../../internal/granularityI18n'
import { iconClass, iconTag } from '../shared/icon'
import GrSkeleton from '../GrSkeleton/GrSkeleton.vue'

import IconMinus from '~icons/lucide/minus'
import IconTrendingDown from '~icons/lucide/trending-down'
import IconTrendingUp from '~icons/lucide/trending-up'

import { countUpFrame } from './countUp'
import { formatStatisticValue } from './formatStatisticValue'

import {
  statisticAffixSizeBySize,
  statisticPlaceholderHeightBySize,
  statisticRootClass,
  statisticTitleClass,
  statisticTitleSizeBySize,
  statisticTrendClassByTrend,
  statisticTrendSizeBySize,
  statisticValueClass,
  type GrStatisticSize,
  type GrStatisticTone,
  type GrStatisticTrend,
} from './grStatisticStyles'

export type {
  GrStatisticSize,
  GrStatisticTone,
  GrStatisticTrend,
} from './grStatisticStyles'
export type { GrStatisticFormatOptions } from './formatStatisticValue'

/**
 * Публичный GR-примитив «Statistic» — крупный числовой показатель с подписью,
 * префиксом/суффиксом и строкой динамики.
 *
 * Компонент презентационный: не грузит данные и не считает дельту, только
 * форматирует и подаёт. Форматирование — чистая функция `formatStatisticValue`.
 */
export interface GrStatisticProps {
  /** Значение показателя. Нечисловая строка выводится как есть. */
  value: number | string
  /** Подпись над значением. */
  title?: string
  /** Число знаков после запятой. */
  precision?: number
  /** Разделитель разрядов. Сильнее локали; без него и без локали — узкий пробел. */
  groupSeparator?: string
  /** Десятичный разделитель. Сильнее локали; без него и без локали — точка. */
  decimalSeparator?: string
  /**
   * BCP-47 локаль форматирования. Не задана — берётся из i18n-адаптера; нет и
   * адаптера — работают ручные разделители.
   */
  locale?: string
  /** Приписка перед значением (валюта, знак). */
  prefix?: string
  /** Приписка после значения (единица измерения, `%`). */
  suffix?: string
  /**
   * Иконка слева от блока: Vue-компонент либо класс иконки вашей UnoCSS-сборки
   * (`'i-lucide-users'` — тогда нужен ваш `presetIcons`, см. `docs/installation.md`).
   */
  icon?: string | Component
  size?: GrStatisticSize
  /** Тон значения; точечно перекрывается `--gr-statistic-value-color`. */
  tone?: GrStatisticTone
  /** Направление динамики — задаёт цвет и иконку строки под значением. */
  trend?: GrStatisticTrend
  /** Текст динамики (например `+12,5% к прошлой неделе`). */
  trendText?: string
  /** Состояние загрузки: вместо значения — плейсхолдер. */
  loading?: boolean
  /**
   * Перебирать числа при появлении и при смене значения. Нечисловое значение
   * ставится сразу, под `prefers-reduced-motion: reduce` — тоже.
   */
  animate?: boolean
  /**
   * Длительность перебора в миллисекундах. Не токеном: шкала `--gr-duration-*`
   * заканчивается на 300 мс и описывает смену состояния, а перебор чисел —
   * другой жанр, и его число живёт там же, где твин.
   */
  animateDuration?: number
  /** Свой корневой тег (`RouterLink`, `Link` от Inertia). Сильнее `href`. */
  as?: string | Component
  /** Показатель-ссылка: переход к деталям. */
  href?: string
  /** Показатель-кнопка: интерактивна вся плитка. */
  clickable?: boolean
}

export interface GrStatisticEmits {
  (e: 'click', event: MouseEvent): void
}

const props = withDefaults(
  defineProps<GrStatisticProps>(),
  {
    title: undefined,
    precision: undefined,
    // Дефолты живут в `formatStatisticValue`: иначе «пользователь задал пробел»
    // было бы неотличимо от «сработал дефолт», и локаль не смогла бы победить.
    groupSeparator: undefined,
    decimalSeparator: undefined,
    locale: undefined,
    prefix: undefined,
    suffix: undefined,
    icon: undefined,
    size: undefined,
    tone: 'neutral',
    trend: undefined,
    trendText: undefined,
    loading: false,
    animate: false,
    animateDuration: 600,
    as: undefined,
    href: undefined,
    clickable: false,
  },
)

const emit = defineEmits<GrStatisticEmits>()

const slots = useSlots()

const { t, locale } = useGranularityTranslations()

const resolvedLocale = computed(() => props.locale ?? locale.value)

/**
 * Число текущего кадра перебора. `null` — перебора нет, показываем сам проп:
 * так значение остаётся конечным и на сервере, и до первого твина.
 */
const frameValue = ref<number | null>(null)

const formatted = computed(() => formatStatisticValue(frameValue.value ?? props.value, {
  precision: props.precision,
  groupSeparator: props.groupSeparator,
  decimalSeparator: props.decimalSeparator,
  locale: resolvedLocale.value,
}))

/** Конечное значение — то, что читает диктор, пока на экране идёт перебор. */
const finalFormatted = computed(() => formatStatisticValue(props.value, {
  precision: props.precision,
  groupSeparator: props.groupSeparator,
  decimalSeparator: props.decimalSeparator,
  locale: resolvedLocale.value,
}))

const isCounting = computed(() => frameValue.value !== null)

const hasTitle = computed(() => Boolean(props.title || slots.title))

const isInteractive = computed(() => Boolean(props.as || props.href || props.clickable))

const rootTag = computed<string | Component>(() => {
  if (props.as)
    return typeof props.as === 'string' ? props.as : markRaw(props.as)

  if (props.href)
    return 'a'

  return props.clickable ? 'button' : 'div'
})

/**
 * Компонент-ссылка (`Link` от Inertia, `RouterLink`) рендерит `<a>` сам, и без
 * `href` он ведёт в никуда. Строковый тег, кроме `a`, атрибут не понимает —
 * там он и гасится.
 */
const rootHref = computed(() => (
  typeof rootTag.value === 'string' && rootTag.value !== 'a' ? undefined : props.href
))

const rootClass = computed(() => statisticRootClass({ interactive: isInteractive.value }))

function toNumber(value: number | string): number | null {
  const numeric = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(numeric) ? numeric : null
}

let frameHandle: number | null = null

function stopCounting(): void {
  if (frameHandle !== null) cancelAnimationFrame(frameHandle)
  frameHandle = null
}

/**
 * Перебор чисел ведёт JS, а глобальный кламп в `base.css` гасит только CSS —
 * значит уважать «уменьшить движение» обязан сам компонент (`docs/motion.md`).
 * Читается в момент старта, а не в теле `setup`: `matchMedia` на сервере нет, и
 * первый клиентский рендер разошёлся бы с серверным.
 */
function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined'
    && window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches === true
}

function runCountUp(from: number, to: number): void {
  stopCounting()

  const duration = props.animateDuration
  if (!(duration > 0) || from === to || prefersReducedMotion()) {
    frameValue.value = null
    return
  }

  const started = performance.now()
  frameValue.value = from

  const step = (now: number): void => {
    const elapsed = now - started
    const value = countUpFrame(from, to, elapsed, duration, props.precision)

    if (elapsed >= duration) {
      // Конец перебора снимает и подмену значения, и подмену для диктора.
      frameValue.value = null
      frameHandle = null
      return
    }

    frameValue.value = value
    frameHandle = requestAnimationFrame(step)
  }

  frameHandle = requestAnimationFrame(step)
}

/** Перебирать можно только числа: «2 ч 15 мин» и «—» ставятся сразу. */
function startIfNumeric(from: number | string, to: number | string): void {
  if (!props.animate || props.loading) {
    stopCounting()
    frameValue.value = null
    return
  }

  const target = toNumber(to)
  const source = toNumber(from)

  if (target === null || source === null) {
    stopCounting()
    frameValue.value = null
    return
  }

  runCountUp(source, target)
}

// Появление плитки считается переходом от нуля: ради этого эффекта проп и нужен.
onMounted(() => startIfNumeric(0, props.value))

watch(() => props.value, (next, prev) => startIfNumeric(prev, next))

onBeforeUnmount(stopCounting)

const resolvedSize = useGrComponentSize(() => props.size, { component: 'GrStatistic' })

const trendIconByTrend: Record<GrStatisticTrend, Component> = {
  up: IconTrendingUp,
  down: IconTrendingDown,
  flat: IconMinus,
}

// Иконка направления `aria-hidden`, а «+12,5 %» само по себе рост от падения не
// отличает: направление доносит скрытая подпись.
const trendLabel = computed(() => {
  if (!props.trend) return undefined

  const labels = {
    up: () => t('gr.statistic.trendUp', 'Increase'),
    down: () => t('gr.statistic.trendDown', 'Decrease'),
    flat: () => t('gr.statistic.trendFlat', 'No change'),
  }

  return labels[props.trend]()
})
</script>

<template>
  <component
    :is="rootTag"
    data-gr-statistic
    :type="rootTag === 'button' ? 'button' : undefined"
    :href="rootHref"
    :class="rootClass"
    @click="emit('click', $event)"
  >
    <span
      v-if="icon || $slots.icon"
      data-gr-statistic-icon
      class="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--gr-radius-lg)] bg-[var(--gr-muted)] text-[var(--gr-muted-fg)]"
    >
      <slot name="icon">
        <component :is="iconTag(icon)" class="block h-4 w-4" :class="iconClass(icon)" aria-hidden="true" />
      </slot>
    </span>

    <div class="min-w-0">
      <!--
        Подпись и значение — пара «термин — значение», а не два соседних блока.
        `<dl>` появляется только вместе с подписью: список определений без `<dt>`
        — та же бессвязность, только с претензией на семантику. Поля обнуляются
        руками: preflight пакета сбрасывает их лишь у `body`.
      -->
      <component :is="hasTitle ? 'dl' : 'div'" class="m-0">
        <dt
          v-if="hasTitle"
          data-gr-statistic-title
          :class="[statisticTitleClass, statisticTitleSizeBySize[resolvedSize]]"
        >
          <slot name="title">
            {{ title }}
          </slot>
        </dt>

        <!-- Плейсхолдер загрузки повторяет высоту строки значения, чтобы блок не прыгал. -->
        <component
          :is="hasTitle ? 'dd' : 'div'"
          v-if="loading"
          data-gr-statistic-placeholder
          data-testid="gr-statistic-placeholder"
          class="m-0 mt-1"
          role="status"
          aria-busy="true"
        >
          <GrSkeleton
            width="6rem"
            :height="statisticPlaceholderHeightBySize[resolvedSize]"
            rounded="var(--gr-radius-md)"
          />
          <span class="sr-only">{{ t('gr.loading.defaultText', 'Loading...') }}</span>
        </component>

        <component
          :is="hasTitle ? 'dd' : 'div'"
          v-else
          data-gr-statistic-value
          data-testid="gr-statistic-value"
          class="m-0 mt-0.5 flex items-baseline gap-1"
        >
          <span
            v-if="prefix || $slots.prefix"
            data-gr-statistic-prefix
            class="text-[var(--gr-muted-fg)]"
            :class="statisticAffixSizeBySize[resolvedSize]"
          >
            <slot name="prefix">{{ prefix }}</slot>
          </span>

          <span
            data-gr-statistic-number
            :class="statisticValueClass({ size: resolvedSize, tone })"
            :aria-hidden="isCounting ? 'true' : undefined"
          >
            <slot>{{ formatted }}</slot>
          </span>

          <!--
            Пока идёт перебор, на экране промежуточное число. Диктору отдаётся
            конечное: «1 284» глазами и «743» в ушах — не шум, а неверные данные.
          -->
          <span v-if="isCounting" data-gr-statistic-final class="sr-only">{{ finalFormatted }}</span>

          <span
            v-if="suffix || $slots.suffix"
            data-gr-statistic-suffix
            class="text-[var(--gr-muted-fg)]"
            :class="statisticAffixSizeBySize[resolvedSize]"
          >
            <slot name="suffix">{{ suffix }}</slot>
          </span>
        </component>
      </component>

      <div
        v-if="trend || trendText || $slots.trend"
        data-gr-statistic-trend
        data-testid="gr-statistic-trend"
        class="mt-1 inline-flex items-center gap-1"
        :class="[statisticTrendSizeBySize[resolvedSize], statisticTrendClassByTrend[trend ?? 'flat']]"
      >
        <span v-if="trendLabel" data-gr-statistic-trend-label class="sr-only">{{ trendLabel }}</span>

        <slot name="trend">
          <component
            :is="trendIconByTrend[trend]"
            v-if="trend"
            class="block h-3.5 w-3.5"
            aria-hidden="true"
          />
          <span>{{ trendText }}</span>
        </slot>
      </div>
    </div>
  </component>
</template>
