<script setup lang="ts">
import { computed, ref } from 'vue'

import { useGrComponentSize } from '../GrConfigProvider/context'

import { useGranularityTranslations } from '../../internal/granularityI18n'
import { useGrFormFieldContext } from '../GrFormField/context'
import { useGrFormControl } from '../../composables/useGrFormControl'

import {
  ratingFillClassByTone,
  ratingRootClass,
  ratingSymbolClass,
  ratingTextSizeBySize,
  ratingVoidClass,
  type GrRatingSize,
  type GrRatingTone,
} from './grRatingStyles'

export type {
  GrRatingSize,
  GrRatingTone,
} from './grRatingStyles'

/**
 * Публичный GR-примитив «Rating» — шкала оценки символами (по умолчанию звёзды).
 *
 * Интерактивный режим реализует WAI-ARIA slider pattern (`role="slider"`,
 * `aria-valuemin/max/now/valuetext`, стрелки / Home / End), режим только для
 * чтения — `role="img"` с текстовой подписью, чтобы скринридер озвучил оценку
 * одной фразой, а не набором элементов.
 *
 * Символ по умолчанию рисуется инлайновым SVG (звезда с `fill="currentColor"`) —
 * иконочные шрифты-маски `i-lucide-star` дают только контур. Свой символ
 * задаётся пропом `icon` (UnoCSS-класс иконки) или слотом `#symbol`.
 */
export interface GrRatingProps {
  /** Текущая оценка. Дробная (`3.5`) поддерживается при `allowHalf`. */
  modelValue: number
  /** Количество символов шкалы. */
  max?: number
  size?: GrRatingSize
  /** Тон заливки; точечно перекрывается переменной `--gr-rating-color`. */
  tone?: GrRatingTone
  /** Половинчатые оценки: клик по левой половине символа даёт `.5`. */
  allowHalf?: boolean
  /** Только показ: без ввода и фокуса. */
  readonly?: boolean
  disabled?: boolean
  /** Визуальное и ARIA-состояние ошибки. */
  invalid?: boolean
  /** Обязательное поле (`aria-required`). */
  required?: boolean
  /** Повторный клик по текущей оценке сбрасывает её в `0`. */
  clearable?: boolean
  /** UnoCSS-класс иконки вместо встроенной звезды (например `i-lucide-heart`). */
  icon?: string
  /** Показывать числовую подпись справа от шкалы. */
  showText?: boolean
  /** Формат подписи. По умолчанию — само значение. Сильнее `texts`. */
  formatText?: (value: number) => string
  /**
   * Подписи по делениям: «3 из 5, нормально» вместо «3 из 5». Уходят и в
   * видимый текст, и в `aria-valuetext` — ради этого рейтинг и существует.
   * Массив короче `max` оставляет верхние деления без подписи.
   */
  texts?: string[]
  /**
   * Компактный вид: рисуются только заполненные символы. Осмысленно вместе с
   * `readonly` — в списках и таблицах пять звёзд в каждой строке съедают ширину.
   */
  compact?: boolean
  ariaLabel?: string
}

const props = withDefaults(
  defineProps<GrRatingProps>(),
  {
    max: 5,
    size: undefined,
    tone: 'warning',
    allowHalf: false,
    readonly: false,
    disabled: false,
    invalid: false,
    required: false,
    clearable: false,
    icon: undefined,
    showText: false,
    formatText: undefined,
    texts: undefined,
    compact: false,
    ariaLabel: undefined,
  },
)

// Эффективный размер: локальный проп → `GrConfigProvider` → дефолт компонента.
const resolvedSize = useGrComponentSize(() => props.size, {
  component: 'GrRating',
  supported: ['xs', 'sm', 'md', 'lg'],
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void
  /** Оценка зафиксирована (клик / клавиша). */
  (e: 'change', value: number): void
  /** Значение под курсором; `null` — курсор ушёл со шкалы. */
  (e: 'hoverChange', value: number | null): void
}>()

const { t } = useGranularityTranslations()

// Контекст `GrFormField`: id/aria-describedby/invalid/required как fallback.
const field = useGrFormFieldContext()
const resolvedId = computed(() => field?.id.value)
const {
  disabled: isDisabled,
  invalid: isInvalid, required: isRequired, readonly: isReadonly } = useGrFormControl(() => props)
const describedBy = computed(() => field?.describedById.value)

const rootEl = ref<HTMLElement | null>(null)

function focus(): void {
  rootEl.value?.querySelector<HTMLElement>('[data-gr-rating-scale]')?.focus()
}

function blur(): void {
  rootEl.value?.querySelector<HTMLElement>('[data-gr-rating-scale]')?.blur()
}

defineExpose({ focus, blur })

/** Ввод возможен: не readonly и не disabled. */
const interactive = computed(() => !isReadonly.value && !isDisabled.value)

/**
 * `aria-readonly`, `aria-invalid` и `aria-required` вешаются только в
 * slider-режиме: на `role="img"` они не разрешены и дают critical в axe.
 *
 * Роль контрола (`slider`) сохраняется и в `disabled` — отключённый слайдер это
 * штатный ARIA-паттерн. А вот `readonly` — это уже не контрол, а картинка с
 * подписью: на `role="img"` атрибуты `aria-value*`/`aria-disabled` запрещены
 * (axe: `aria-allowed-attr`), поэтому там их не выводим вовсе.
 */
const asSlider = computed(() => !props.readonly)
const step = computed(() => (props.allowHalf ? 0.5 : 1))

// Значение под курсором имеет приоритет над моделью — это «предпросмотр» оценки.
const hoverValue = ref<number | null>(null)
const displayValue = computed(() => hoverValue.value ?? clamp(props.modelValue))

function clamp(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.min(props.max, Math.max(0, value))
}

/** Доля заливки символа с индексом `index` (0..1). */
function fillRatio(index: number): number {
  return Math.min(1, Math.max(0, displayValue.value - index))
}

const symbols = computed(() => {
  // Компактный вид показывает только заполненную часть шкалы; половинка
  // считается символом — иначе «2.5» потеряло бы половину звезды.
  const length = props.compact ? Math.ceil(clamp(props.modelValue)) : props.max
  return Array.from({ length }, (_, index) => index)
})

/** Подпись деления под текущим значением: половинки округляются вверх. */
const currentLabel = computed(() => {
  if (!props.texts?.length || displayValue.value <= 0) return undefined
  return props.texts[Math.ceil(displayValue.value) - 1]
})

const valueText = computed(() => {
  const params = { value: displayValue.value, max: props.max }

  // Порядок слов задаёт локаль, а не конкатенация в коде.
  return currentLabel.value
    ? t('gr.rating.valueTextWithLabel', '{value} of {max}, {label}', { ...params, label: currentLabel.value })
    : t('gr.rating.valueText', '{value} of {max}', params)
})

const resolvedAriaLabel = computed(() => props.ariaLabel ?? t('gr.rating.label', 'Rating'))

const text = computed(() => {
  if (props.formatText) return props.formatText(displayValue.value)
  return currentLabel.value ?? String(displayValue.value)
})

/** Значение, соответствующее позиции курсора внутри символа `index`. */
function valueAt(index: number, event: MouseEvent): number {
  if (!props.allowHalf) return index + 1
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  return rect.width > 0 && event.clientX - rect.left < rect.width / 2 ? index + 0.5 : index + 1
}

function commit(value: number): void {
  const next = clamp(value)
  if (next !== props.modelValue) emit('update:modelValue', next)
  emit('change', next)
}

function onSymbolClick(index: number, event: MouseEvent): void {
  if (!interactive.value) return
  const next = valueAt(index, event)
  commit(props.clearable && next === props.modelValue ? 0 : next)
}

function onSymbolMouseMove(index: number, event: MouseEvent): void {
  if (!interactive.value) {
    // Режим сменился под курсором — оставлять подсветку от прошлого состояния нельзя.
    resetHover()
    return
  }
  const next = valueAt(index, event)
  if (next === hoverValue.value) return
  hoverValue.value = next
  emit('hoverChange', next)
}

function resetHover(): void {
  if (hoverValue.value === null) return
  hoverValue.value = null
  emit('hoverChange', null)
}

function onKeydown(event: KeyboardEvent): void {
  if (!interactive.value) return
  const current = clamp(props.modelValue)
  let next: number | null = null

  switch (event.key) {
    case 'ArrowRight':
    case 'ArrowUp':
      next = current + step.value
      break
    case 'ArrowLeft':
    case 'ArrowDown':
      next = current - step.value
      break
    case 'Home':
      next = 0
      break
    case 'End':
      next = props.max
      break
    default:
      return
  }

  event.preventDefault()
  commit(next)
}
</script>

<template>
  <div
    ref="rootEl"
    data-gr-rating
    class="inline-flex items-center gap-2"
  >
    <div
      :id="resolvedId"
      data-gr-rating-scale
      data-testid="gr-rating-scale"
      :class="ratingRootClass({ size: resolvedSize, disabled, interactive })"
      :role="asSlider ? 'slider' : 'img'"
      :tabindex="asSlider ? (disabled ? -1 : 0) : undefined"
      :aria-label="asSlider ? resolvedAriaLabel : `${resolvedAriaLabel}: ${valueText}`"
      :aria-valuemin="asSlider ? 0 : undefined"
      :aria-valuemax="asSlider ? max : undefined"
      :aria-valuenow="asSlider ? displayValue : undefined"
      :aria-valuetext="asSlider ? valueText : undefined"
      :aria-orientation="asSlider ? 'horizontal' : undefined"
      :aria-disabled="asSlider && disabled ? 'true' : undefined"
      :aria-invalid="asSlider && isInvalid ? 'true' : undefined"
      :aria-describedby="asSlider ? describedBy : undefined"
      :aria-required="asSlider && isRequired ? 'true' : undefined"
      :aria-readonly="asSlider && isReadonly ? 'true' : undefined"
      @keydown="onKeydown"
      @mouseleave="resetHover"
      @blur="resetHover"
    >
      <span
        v-for="index in symbols"
        :key="index"
        data-gr-rating-symbol
        :data-testid="`gr-rating-symbol-${index}`"
        :class="ratingSymbolClass(resolvedSize)"
        @click="onSymbolClick(index, $event)"
        @mousemove="onSymbolMouseMove(index, $event)"
      >
        <!-- Нижний слой — «пустой» символ, поверх него обрезанный по ширине «залитый». -->
        <span class="block h-full w-full" :class="ratingVoidClass" aria-hidden="true">
          <slot name="symbol" :index="index" :filled="false">
            <span v-if="icon" class="block h-full w-full" :class="icon" />
            <svg v-else viewBox="0 0 24 24" fill="currentColor" class="block h-full w-full">
              <path d="M12 2.5l2.9 6.1 6.6.9-4.8 4.7 1.2 6.6L12 17.7 6.1 20.8l1.2-6.6L2.5 9.5l6.6-.9z" />
            </svg>
          </slot>
        </span>

        <span
          data-gr-rating-fill
          class="pointer-events-none absolute inset-y-0 left-0 overflow-hidden"
          :class="ratingFillClassByTone[tone]"
          :style="{ width: `${fillRatio(index) * 100}%` }"
          aria-hidden="true"
        >
          <span :class="ratingSymbolClass(resolvedSize)">
            <slot name="symbol" :index="index" :filled="true">
              <span v-if="icon" class="block h-full w-full" :class="icon" />
              <svg v-else viewBox="0 0 24 24" fill="currentColor" class="block h-full w-full">
                <path d="M12 2.5l2.9 6.1 6.6.9-4.8 4.7 1.2 6.6L12 17.7 6.1 20.8l1.2-6.6L2.5 9.5l6.6-.9z" />
              </svg>
            </slot>
          </span>
        </span>
      </span>
    </div>

    <span
      v-if="showText || $slots.text"
      data-gr-rating-text
      class="text-[var(--gr-muted-fg)] [font-variant-numeric:tabular-nums]"
      :class="ratingTextSizeBySize[resolvedSize]"
    >
      <slot name="text" :value="displayValue">{{ text }}</slot>
    </span>
  </div>
</template>
