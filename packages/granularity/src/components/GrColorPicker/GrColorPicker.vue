<script setup lang="ts">
/**
 * GrColorPicker — поле выбора цвета: образец с текущим значением, панель с
 * оттенком, насыщенностью, светлотой и прозрачностью, поле hex и палитра.
 *
 * Прямой сценарий — настройки темы и брендирования, поэтому модель хранит hex:
 * в такой форме цвет лежит в токенах и его понимает CSS.
 *
 * A11y: у каждого канала настоящий `role="slider"` с полной клавиатурой и
 * `aria-valuetext`. У двумерной области он тоже настоящий, и даже дважды —
 * по одному `input[type=range]` на ось (см. `colorArea.ts`).
 */
import { computed, nextTick, onMounted, ref, useId, watch } from 'vue'
import IconPipette from '~icons/lucide/pipette'

import { useDragGesture } from '../../composables/useDragGesture'
import { useGrFormControl } from '../../composables/useGrFormControl'
import { useGranularityTranslations } from '../../internal/granularityI18n'
import type { GrControlShape } from '../shared/controlShape'
import { useGrComponentProp, useGrComponentSize } from '../GrConfigProvider/context'
import { useGrFormFieldContext } from '../GrFormField/context'
import GrInput from '../GrInput/GrInput.vue'
import GrPopover from '../GrPopover/GrPopover.vue'
import GrSlider from '../GrSlider/GrSlider.vue'

import { formatHexColor, hslaToCss, normalizeHsla, parseHexColor, type GrHsla } from './color'
import { colorAreaKeyStep, colorAreaPointAt, colorAreaThumbPosition, type GrColorAreaAxis, type GrColorAreaPoint } from './colorArea'
import { isEyeDropperSupported, pickScreenColor } from './eyeDropper'
import {
  areaInputClass,
  areaThumbClass,
  checkerClass,
  eyedropperIconClass,
  grColorPickerAreaClass,
  grColorPickerEyedropperClass,
  grColorPickerPanelClass,
  grColorPickerPresetClass,
  grColorPickerTriggerClass,
  hexFieldClass,
  hexRowClass,
  presetsGridClass,
  previewClass,
  rowClass,
  rowLabelClass,
  rowValueClass,
  swatchBaseClass,
  swatchFillClass,
  triggerSwatchSizeBySize,
  triggerValueClass,
  type GrColorPickerSize,
  type GrColorPickerView,
} from './grColorPickerStyles'

export type { GrColorPickerSize, GrColorPickerView } from './grColorPickerStyles'

export interface GrColorPickerProps {
  /** Цвет в hex: `#RRGGBB`, а при `alpha` — `#RRGGBBAA`. Мусор не роняет компонент. */
  modelValue: string
  /** Четвёртый слайдер и восьмизначная форма hex. */
  alpha?: boolean
  /**
   * Как задаются насыщенность и светлота: двумя бегунками или квадратом.
   * Оттенок и прозрачность остаются бегунками в обоих видах.
   */
  view?: GrColorPickerView
  /**
   * Кнопка пипетки. Рисуется только там, где браузер даёт `EyeDropper`, —
   * сегодня это Chromium.
   */
  eyedropper?: boolean
  /** Палитра быстрого выбора. Пусто — блок не рендерится. */
  presets?: string[]
  size?: GrColorPickerSize
  /** Форма рамки. `box` — скругление шкалы контролов; `pill` — пилюля. */
  shape?: GrControlShape
  /** Контролируемое состояние панели (`v-model:open`). */
  open?: boolean
  /** Сторона, с которой раскрывается панель. */
  placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end'
  /** Имя для нативной формы: значение уходит скрытым полем. */
  name?: string
  disabled?: boolean
  /** Только для чтения: цвет видно, панель открывается, но значение не меняется. */
  readonly?: boolean
  invalid?: boolean
  required?: boolean
  ariaLabel?: string
}

export interface GrColorPickerEmits {
  (e: 'update:modelValue', value: string): void
  (e: 'change', value: string): void
  (e: 'update:open', value: boolean): void
  (e: 'focus', event: FocusEvent): void
  (e: 'blur', event: FocusEvent): void
}

const props = withDefaults(defineProps<GrColorPickerProps>(), {
  alpha: false,
  // Дефолт живёт в резолвере — как у `size`.
  view: undefined,
  eyedropper: undefined,
  presets: () => [],
  // Дефолт живёт в резолвере: Vue подставил бы свой раньше, чем компонент
  // заглянет в `GrConfigProvider`.
  size: undefined,
  shape: undefined,
  open: undefined,
  placement: 'bottom-start',
  name: undefined,
  disabled: false,
  readonly: false,
  invalid: false,
  required: false,
  ariaLabel: undefined,
})

const emit = defineEmits<GrColorPickerEmits>()

const { t } = useGranularityTranslations()

const resolvedSize = useGrComponentSize(() => props.size, { component: 'GrColorPicker' })
const resolvedShape = useGrComponentProp('GrColorPicker', 'shape', () => props.shape, 'box')
const resolvedView = useGrComponentProp('GrColorPicker', 'view', () => props.view, 'sliders')
const wantsEyedropper = useGrComponentProp('GrColorPicker', 'eyedropper', () => props.eyedropper, false)

const field = useGrFormFieldContext()
const fieldId = computed(() => field?.id.value)
const {
  disabled: isDisabled,
  invalid: isInvalid,
  required: isRequired,
  readonly: isReadonly,
  // «Ввод не принимается» — `disabled` или `readonly`: значение видно, но не меняется.
  locked: isLocked,
} = useGrFormControl(() => props)

/**
 * `aria-required` и `aria-readonly` роль `button` не поддерживает — axe роняет
 * это как critical `aria-allowed-attr`. Состояния уходят в описание триггера:
 * иначе они пропали бы для диктора совсем (маркер `*` у `GrFormField`
 * декоративен и скрыт).
 */
const stateHintId = useId()
const stateHint = computed(() => [
  isRequired.value ? t('gr.form.required', 'This field is required') : undefined,
  isReadonly.value ? t('gr.form.readonly', 'Read only') : undefined,
].filter(Boolean).join('. ') || undefined)

const describedBy = computed(() => [
  field?.describedById.value,
  stateHint.value ? stateHintId : undefined,
].filter(Boolean).join(' ') || undefined)

const triggerEl = ref<HTMLElement | null>(null)

function focus(): void {
  triggerEl.value?.focus()
}

function blur(): void {
  triggerEl.value?.blur()
}

defineExpose({ focus, blur })

const FALLBACK: GrHsla = { h: 0, s: 0, l: 0, a: 1 }

/**
 * Рабочее состояние панели.
 *
 * Держать его отдельно от модели обязательно: hex — проекция с потерями. У
 * серого нет оттенка, и без собственного состояния бегунок оттенка прыгал бы
 * обратно на 0° при каждом движении.
 */
const state = ref<GrHsla>(parseHexColor(props.modelValue) ?? FALLBACK)

/** Последнее отданное значение: вернувшись в проп, оно не должно сбрасывать состояние. */
let lastEmitted = ''

watch(() => props.modelValue, (next) => {
  if (next === lastEmitted)
    return

  const parsed = parseHexColor(next)
  if (parsed)
    state.value = parsed
})

const cssColor = computed(() => hslaToCss(state.value))
const hexValue = computed(() => formatHexColor(state.value, props.alpha))

function commit(next: GrHsla): void {
  if (isLocked.value)
    return

  state.value = normalizeHsla(next)

  const hex = formatHexColor(state.value, props.alpha)
  lastEmitted = hex
  emit('update:modelValue', hex)
  emit('change', hex)
}

/** Канал панели: слайдер читает состояние и коммитит новое значение целиком. */
function channel(key: 'h' | 's' | 'l' | 'a', scale = 1) {
  return computed<number>({
    get: () => Math.round(state.value[key] * scale),
    set: value => commit({ ...state.value, [key]: value / scale }),
  })
}

const hue = channel('h')
const saturation = channel('s')
const lightness = channel('l')
// Альфа хранится долей, а слайдер ходит по процентам — иначе шаг был бы 0.01.
const opacity = channel('a', 100)

const degrees = (value: number): string => `${value}°`
const percent = (value: number): string => `${value}%`

/** Текст поля hex редактируется свободно и коммитится только валидным. */
const hexDraft = ref(hexValue.value)

watch(hexValue, (next) => {
  hexDraft.value = next
})

function commitHex(): void {
  const parsed = parseHexColor(hexDraft.value)

  // Мусор откатывается к текущему значению: держать в поле невалидный текст
  // после коммита — значит показывать цвет, которого нет.
  //
  // Откат идёт следующим тиком намеренно: вернув значение синхронно, мы отдали
  // бы Vue то же самое, что он уже отрисовал, — патча не случилось бы, и в поле
  // остался бы набранный мусор.
  if (!parsed) {
    void nextTick(() => {
      hexDraft.value = hexValue.value
    })
    return
  }

  commit(props.alpha ? parsed : { ...parsed, a: state.value.a })
}

const isOpen = ref(false)
const panelOpen = computed({
  get: () => props.open ?? isOpen.value,
  set: (value) => {
    isOpen.value = value
    emit('update:open', value)
  },
})

const presetList = computed(() => props.presets.filter(preset => parseHexColor(preset) !== null))

function isPresetSelected(preset: string): boolean {
  const parsed = parseHexColor(preset)
  return parsed ? formatHexColor(parsed, props.alpha) === hexValue.value : false
}

function selectPreset(preset: string): void {
  const parsed = parseHexColor(preset)
  if (parsed)
    commit(parsed)
}

const triggerClass = computed(() => grColorPickerTriggerClass({
  size: resolvedSize.value,
  shape: resolvedShape.value,
  disabled: isDisabled.value,
  invalid: isInvalid.value,
}))

const panelClass = computed(() => grColorPickerPanelClass(resolvedSize.value))
const swatchSizeClass = computed(() => triggerSwatchSizeBySize[resolvedSize.value])

/**
 * Градиенты дорожек. Через `--gr-slider-rail` их не подать: хук уходит в
 * `background-color`, а градиент там не работает — поэтому значения приезжают
 * переменными, а красит дорожки собственный `<style>` компонента.
 *
 * Переменные висят на самой панели, а не на корне: панель уезжает в портал, и
 * наследование от корня до неё не доходит.
 */
const trackVars = computed<Record<string, string>>(() => {
  const { h, s, l } = state.value
  const solid = hslaToCss({ h, s, l, a: 1 })

  return {
    // Заливка квадрата: серый → чистый тон при светлоте 50%. Белая и чёрная
    // вуали поверх неё статичны и живут в `<style>`; вместе они дают **точный**
    // HSL, а не приблизительный — осветление и затемнение в HSL линейны ровно
    // так же, как наложение белого и чёрного с альфой.
    '--gr-color-picker-area-saturation': `linear-gradient(to right, hsl(${Math.round(h)} 0% 50%), hsl(${Math.round(h)} 100% 50%))`,
    '--gr-color-picker-track-hue': 'linear-gradient(to right, hsl(0 100% 50%), hsl(60 100% 50%), hsl(120 100% 50%), hsl(180 100% 50%), hsl(240 100% 50%), hsl(300 100% 50%), hsl(360 100% 50%))',
    '--gr-color-picker-track-saturation': `linear-gradient(to right, hsl(${Math.round(h)} 0% ${Math.round(l)}%), hsl(${Math.round(h)} 100% ${Math.round(l)}%))`,
    '--gr-color-picker-track-lightness': `linear-gradient(to right, hsl(${Math.round(h)} ${Math.round(s)}% 0%), hsl(${Math.round(h)} ${Math.round(s)}% 50%), hsl(${Math.round(h)} ${Math.round(s)}% 100%))`,
    '--gr-color-picker-track-alpha': `linear-gradient(to right, transparent, ${solid})`,
  }
})

const areaEl = ref<HTMLElement | null>(null)
const saturationInputEl = ref<HTMLInputElement | null>(null)
const lightnessInputEl = ref<HTMLInputElement | null>(null)

/** Точка области целыми процентами: поля осей — обычные `input[type=range]`. */
const areaPoint = computed<GrColorAreaPoint>(() => ({
  s: Math.round(state.value.s),
  l: Math.round(state.value.l),
}))

const areaThumbStyle = computed(() => {
  const { x, y } = colorAreaThumbPosition(areaPoint.value)

  return {
    left: `${x}%`,
    top: `${y}%`,
    background: hslaToCss({ ...state.value, a: 1 }),
  }
})

function applyAreaPoint(point: GrColorAreaPoint): void {
  commit({ ...state.value, s: point.s, l: point.l })
}

function areaPointerMove(event: PointerEvent): void {
  const rect = areaEl.value?.getBoundingClientRect()
  if (!rect)
    return

  applyAreaPoint(colorAreaPointAt(event, rect))
}

/** Цвет до начала жеста: оборванный жест обязан вернуть его на место. */
let colorBeforeDrag: GrHsla | null = null

const areaDrag = useDragGesture({
  disabled: () => isLocked.value,
  onStart: (event) => {
    colorBeforeDrag = state.value
    // Нажатие ставит значение сразу: попадание в область — это уже выбор, а не
    // только взятие ручки. Фокус уходит на ось насыщенности, чтобы жест можно
    // было продолжить стрелками.
    areaPointerMove(event)
    saturationInputEl.value?.focus()
  },
  onMove: areaPointerMove,
  onCancel: () => {
    if (colorBeforeDrag)
      commit(colorBeforeDrag)
    colorBeforeDrag = null
  },
  onEnd: () => {
    colorBeforeDrag = null
  },
})

/**
 * Клавиатура области.
 *
 * Стрелка поперёк оси сфокусированного поля уводит фокус на соседнее: значение
 * поменялось у него, и без переезда диктор промолчал бы о том, что изменилось.
 */
function onAreaKeydown(event: KeyboardEvent, axis: GrColorAreaAxis): void {
  if (isLocked.value)
    return

  const next = colorAreaKeyStep(event.key, areaPoint.value, axis)
  if (!next)
    return

  // Гасим нативный шаг поля: у области своя арифметика по двум осям.
  event.preventDefault()
  applyAreaPoint(next.point)

  if (next.axis !== axis)
    (next.axis === 'saturation' ? saturationInputEl : lightnessInputEl).value?.focus()
}

/** Изменение поля мимо клавиатуры — например, жестом вспомогательной технологии. */
function onAreaInput(event: Event, axis: GrColorAreaAxis): void {
  const value = Number((event.target as HTMLInputElement).value)
  if (!Number.isFinite(value))
    return

  applyAreaPoint(axis === 'saturation'
    ? { ...areaPoint.value, s: value }
    : { ...areaPoint.value, l: value })
}

const areaClass = computed(() => grColorPickerAreaClass({
  size: resolvedSize.value,
  locked: isLocked.value,
}))

/**
 * Поддержка пипетки уточняется после монтирования: `window` в теле `setup`
 * либо роняет серверный рендер, либо расходится с ним. До этого кнопки нет —
 * ровно то же, что отдаёт сервер, поэтому гидрация совпадает.
 */
const eyedropperSupported = ref(false)

onMounted(() => {
  eyedropperSupported.value = isEyeDropperSupported()
})

const showEyedropper = computed(() => wantsEyedropper.value && eyedropperSupported.value)
const eyedropperClassName = computed(() => grColorPickerEyedropperClass(resolvedSize.value))

/**
 * Пипетка зовётся прямо из обработчика нажатия: без свежего жеста браузер
 * отклоняет `open()`. Отказ пользователя — не ошибка и ничего не меняет.
 */
async function pickFromScreen(): Promise<void> {
  if (isLocked.value)
    return

  const picked = await pickScreenColor()
  if (!picked)
    return

  const parsed = parseHexColor(picked)
  if (!parsed)
    return

  // С экрана приходит уже смешанный цвет: прозрачности в нём нет, и текущая
  // остаётся как была.
  commit({ ...parsed, a: state.value.a })
}
</script>

<template>
  <div data-gr-color-picker>
    <!-- Значение для нативной формы уходит скрытым полем: интерактивного
         контрола внутри виджета быть не должно. -->
    <input v-if="name" type="hidden" :name="name" :value="hexValue">

    <span v-if="stateHint" :id="stateHintId" class="sr-only">{{ stateHint }}</span>

    <GrPopover
      v-model:open="panelOpen"
      block
      :size="resolvedSize"
      :placement="placement"
      :disabled="isDisabled"
      :aria-label="t('gr.colorPicker.panelLabel', 'Color picker')"
      :close-on-content-click="false"
    >
      <template #trigger="{ triggerProps }">
        <button
          :id="fieldId"
          ref="triggerEl"
          v-bind="triggerProps"
          data-gr-color-picker-trigger
          type="button"
          :class="triggerClass"
          :aria-label="ariaLabel"
          :aria-describedby="describedBy"
          :aria-invalid="isInvalid ? 'true' : undefined"
          @focus="emit('focus', $event)"
          @blur="emit('blur', $event)"
        >
          <span
            data-gr-color-picker-swatch
            aria-hidden="true"
            :class="[swatchBaseClass, swatchSizeClass, checkerClass]"
          >
            <span :class="swatchFillClass" :style="{ background: cssColor }" />
          </span>

          <span :class="triggerValueClass">{{ hexValue }}</span>
        </button>
      </template>

      <template #content>
        <div data-gr-color-picker-panel :class="panelClass" :style="trackVars">
          <div
            data-gr-color-picker-preview
            aria-hidden="true"
            :class="[previewClass, checkerClass]"
          >
            <span :class="swatchFillClass" :style="{ background: cssColor }" />
          </div>

          <!--
            Область насыщенность × светлота. Роль на обёртке — `group`, а не
            виджетная: внутри два настоящих `input[type=range]`, по одному на
            ось, и роль-виджет объявила бы их презентационными. Поля скрыты
            визуально, но остаются в таб-порядке — фокус показывает обёртка
            через `focus-within` (приём `GrFileUpload`).
          -->
          <div
            v-if="resolvedView === 'area'"
            ref="areaEl"
            data-gr-color-picker-area
            role="group"
            :class="areaClass"
            :aria-label="t('gr.colorPicker.area', 'Saturation and lightness')"
            @pointerdown="areaDrag.start"
          >
            <input
              ref="saturationInputEl"
              data-gr-color-picker-area-axis="saturation"
              type="range"
              min="0"
              max="100"
              :value="areaPoint.s"
              :class="areaInputClass"
              :disabled="isDisabled"
              :aria-label="t('gr.colorPicker.saturation', 'Saturation')"
              :aria-valuetext="percent(areaPoint.s)"
              @keydown="onAreaKeydown($event, 'saturation')"
              @input="onAreaInput($event, 'saturation')"
            >
            <input
              ref="lightnessInputEl"
              data-gr-color-picker-area-axis="lightness"
              type="range"
              min="0"
              max="100"
              :value="areaPoint.l"
              :class="areaInputClass"
              :disabled="isDisabled"
              :aria-label="t('gr.colorPicker.lightness', 'Lightness')"
              :aria-valuetext="percent(areaPoint.l)"
              @keydown="onAreaKeydown($event, 'lightness')"
              @input="onAreaInput($event, 'lightness')"
            >

            <span
              data-gr-color-picker-area-thumb
              aria-hidden="true"
              :class="areaThumbClass"
              :style="areaThumbStyle"
            />
          </div>

          <div data-gr-color-picker-channel="hue" :class="rowClass">
            <span :class="rowLabelClass" aria-hidden="true">H</span>
            <GrSlider
              v-model="hue"
              :min="0"
              :max="359"
              :size="resolvedSize"
              :disabled="isDisabled"
              :readonly="isReadonly"
              :format-tooltip="degrees"
              :aria-label="t('gr.colorPicker.hue', 'Hue')"
            />
            <span :class="rowValueClass">{{ degrees(hue) }}</span>
          </div>

          <template v-if="resolvedView === 'sliders'">
            <div data-gr-color-picker-channel="saturation" :class="rowClass">
              <span :class="rowLabelClass" aria-hidden="true">S</span>
              <GrSlider
                v-model="saturation"
                :size="resolvedSize"
                :disabled="isDisabled"
                :readonly="isReadonly"
                :format-tooltip="percent"
                :aria-label="t('gr.colorPicker.saturation', 'Saturation')"
              />
              <span :class="rowValueClass">{{ percent(saturation) }}</span>
            </div>

            <div data-gr-color-picker-channel="lightness" :class="rowClass">
              <span :class="rowLabelClass" aria-hidden="true">L</span>
              <GrSlider
                v-model="lightness"
                :size="resolvedSize"
                :disabled="isDisabled"
                :readonly="isReadonly"
                :format-tooltip="percent"
                :aria-label="t('gr.colorPicker.lightness', 'Lightness')"
              />
              <span :class="rowValueClass">{{ percent(lightness) }}</span>
            </div>
          </template>

          <div v-if="alpha" data-gr-color-picker-channel="alpha" :class="rowClass">
            <span :class="rowLabelClass" aria-hidden="true">A</span>
            <GrSlider
              v-model="opacity"
              :size="resolvedSize"
              :disabled="isDisabled"
              :readonly="isReadonly"
              :format-tooltip="percent"
              :aria-label="t('gr.colorPicker.opacity', 'Opacity')"
            />
            <span :class="rowValueClass">{{ percent(opacity) }}</span>
          </div>

          <div :class="hexRowClass">
            <GrInput
              v-model="hexDraft"
              data-gr-color-picker-hex
              :class="hexFieldClass"
              :size="resolvedSize"
              :disabled="isDisabled"
              :readonly="isReadonly"
              :aria-label="t('gr.colorPicker.hexLabel', 'Hex value')"
              @change="commitHex"
              @keydown.enter="commitHex"
            />

            <button
              v-if="showEyedropper"
              data-gr-color-picker-eyedropper
              type="button"
              :class="eyedropperClassName"
              :disabled="isLocked"
              :aria-label="t('gr.colorPicker.eyedropper', 'Pick a colour from the screen')"
              @click="pickFromScreen"
            >
              <IconPipette :class="eyedropperIconClass" aria-hidden="true" />
            </button>
          </div>

          <div
            v-if="presetList.length"
            data-gr-color-picker-presets
            :class="presetsGridClass"
            role="group"
            :aria-label="t('gr.colorPicker.presetsLabel', 'Color presets')"
          >
            <button
              v-for="preset in presetList"
              :key="preset"
              data-gr-color-picker-preset
              type="button"
              :class="[grColorPickerPresetClass(isPresetSelected(preset)), checkerClass]"
              :aria-label="t('gr.colorPicker.swatchLabel', 'Color {color}', { color: preset })"
              :aria-pressed="isPresetSelected(preset) ? 'true' : 'false'"
              :disabled="isLocked"
              @click="selectPreset(preset)"
            >
              <span :class="swatchFillClass" :style="{ background: preset }" />
            </button>
          </div>
        </div>
      </template>
    </GrPopover>
  </div>
</template>

<style>
/*
 * Шахматка под прозрачным цветом. Двумя `conic-gradient` — в утилите такое не
 * выражается, а без подложки прозрачный образец сливается с панелью.
 */
.gr-color-picker-checker {
  background-image:
    conic-gradient(
      from 90deg,
      var(--gr-color-picker-checker-light, var(--gr-bg)) 0 25%,
      var(--gr-color-picker-checker-dark, var(--gr-muted)) 0 50%,
      var(--gr-color-picker-checker-light, var(--gr-bg)) 0 75%,
      var(--gr-color-picker-checker-dark, var(--gr-muted)) 0
    );
  background-size:
    calc(var(--gr-color-picker-checker-size, 6px) * 2)
    calc(var(--gr-color-picker-checker-size, 6px) * 2);
  /* Рамка образца полупрозрачна, и без обрезки шахматка просвечивает сквозь неё. */
  background-clip: padding-box;
}

/*
 * Дорожки каналов. Красим `[data-gr-slider-track]` потому, что хук
 * `--gr-slider-rail` уходит в `background-color`, а градиент там не работает.
 * Сами градиенты компонент подаёт переменными — CSS остаётся статичной.
 */
[data-gr-color-picker-channel] [data-gr-slider-track] {
  border-radius: var(--gr-radius-full);
}

[data-gr-color-picker-channel='hue'] [data-gr-slider-track] {
  background-image: var(--gr-color-picker-track-hue);
}

[data-gr-color-picker-channel='saturation'] [data-gr-slider-track] {
  background-image: var(--gr-color-picker-track-saturation);
}

[data-gr-color-picker-channel='lightness'] [data-gr-slider-track] {
  background-image: var(--gr-color-picker-track-lightness);
}

[data-gr-color-picker-channel='alpha'] [data-gr-slider-track] {
  background-image: var(--gr-color-picker-track-alpha);
}

/* Заливка канала прозрачна: шкалу показывает сама дорожка. */
[data-gr-color-picker-channel] [data-gr-slider-fill] {
  background-color: transparent;
}

/*
 * Заливка области. Три слоя, и порядок важен: белая вуаль сверху, чёрная снизу,
 * под ними — шкала насыщенности при светлоте 50%.
 *
 * Пара вуалей даёт **точный** HSL, а не похожий на него: осветление и
 * затемнение в HSL — линейная интерполяция к белому и к чёрному, ровно то же,
 * что делает наложение с альфой. Поэтому цвет под ручкой совпадает с образцом
 * и с hex до последнего разряда.
 */
[data-gr-color-picker-area] {
  background-image:
    linear-gradient(
      to bottom,
      rgb(255 255 255) 0%,
      rgb(255 255 255 / 0) 50%,
      rgb(0 0 0 / 0) 50%,
      rgb(0 0 0) 100%
    ),
    var(--gr-color-picker-area-saturation);
}
</style>
