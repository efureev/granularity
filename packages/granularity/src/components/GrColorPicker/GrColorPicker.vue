<script setup lang="ts">
/**
 * GrColorPicker — поле выбора цвета: образец с текущим значением, панель с
 * оттенком, насыщенностью, светлотой и прозрачностью, поле hex и палитра.
 *
 * Прямой сценарий — настройки темы и брендирования, поэтому модель хранит hex:
 * в такой форме цвет лежит в токенах и его понимает CSS.
 *
 * A11y: каждый канал — отдельный `GrSlider`, то есть настоящий `role="slider"`
 * с полной клавиатурой и `aria-valuetext`. Двумерная область saturation/value
 * не берётся намеренно: это свой виджет со своей клавиатурой по двум осям, и
 * доступность там пришлось бы собирать с нуля.
 */
import { computed, nextTick, ref, useId, watch } from 'vue'

import { useGrFormControl } from '../../composables/useGrFormControl'
import { useGranularityTranslations } from '../../internal/granularityI18n'
import { useGrComponentSize } from '../GrConfigProvider/context'
import { useGrFormFieldContext } from '../GrFormField/context'
import GrInput from '../GrInput/GrInput.vue'
import GrPopover from '../GrPopover/GrPopover.vue'
import GrSlider from '../GrSlider/GrSlider.vue'

import { formatHexColor, hslaToCss, normalizeHsla, parseHexColor, type GrHsla } from './color'
import {
  checkerClass,
  grColorPickerPanelClass,
  grColorPickerPresetClass,
  grColorPickerTriggerClass,
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
} from './grColorPickerStyles'

export type { GrColorPickerSize } from './grColorPickerStyles'

export interface GrColorPickerProps {
  /** Цвет в hex: `#RRGGBB`, а при `alpha` — `#RRGGBBAA`. Мусор не роняет компонент. */
  modelValue: string
  /** Четвёртый слайдер и восьмизначная форма hex. */
  alpha?: boolean
  /** Палитра быстрого выбора. Пусто — блок не рендерится. */
  presets?: string[]
  size?: GrColorPickerSize
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
  presets: () => [],
  // Дефолт живёт в резолвере: Vue подставил бы свой раньше, чем компонент
  // заглянет в `GrConfigProvider`.
  size: undefined,
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
    '--gr-color-picker-track-hue': 'linear-gradient(to right, hsl(0 100% 50%), hsl(60 100% 50%), hsl(120 100% 50%), hsl(180 100% 50%), hsl(240 100% 50%), hsl(300 100% 50%), hsl(360 100% 50%))',
    '--gr-color-picker-track-saturation': `linear-gradient(to right, hsl(${Math.round(h)} 0% ${Math.round(l)}%), hsl(${Math.round(h)} 100% ${Math.round(l)}%))`,
    '--gr-color-picker-track-lightness': `linear-gradient(to right, hsl(${Math.round(h)} ${Math.round(s)}% 0%), hsl(${Math.round(h)} ${Math.round(s)}% 50%), hsl(${Math.round(h)} ${Math.round(s)}% 100%))`,
    '--gr-color-picker-track-alpha': `linear-gradient(to right, transparent, ${solid})`,
  }
})
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

          <GrInput
            v-model="hexDraft"
            data-gr-color-picker-hex
            :size="resolvedSize"
            :disabled="isDisabled"
            :readonly="isReadonly"
            :aria-label="t('gr.colorPicker.hexLabel', 'Hex value')"
            @change="commitHex"
            @keydown.enter="commitHex"
          />

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
</style>
