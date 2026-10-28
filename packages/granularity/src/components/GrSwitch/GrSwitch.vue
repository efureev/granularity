<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import IconLoader from '~icons/lucide/loader-circle'

import { useGrComponentSize } from '../shared/configContext'
import { useGrFormFieldContext } from '../shared/formFieldContext'
import { useGrComponentProp } from '../../composables/useGrComponentConfig'
import { useGrFormControl } from '../../composables/useGrFormControl'
import { useGranularityTranslations } from '../../internal/granularityI18n'

import {
  grSwitchLookAttrs,
  isGrSwitchStateTextSize,
  type GrSwitchLabelPosition,
  type GrSwitchSize,
  type GrSwitchStateTextSize,
} from './grSwitchStyles'
import { useControlAria } from '../../composables/internal/useControlAria'

export type {
  GrSwitchLabelPosition,
  GrSwitchSize,
  GrSwitchStateTextSize,
} from './grSwitchStyles'

/**
 * Пропсы публичного GR-примитива «Switch».
 */
export interface GrSwitchProps {
  /**
   * Значение переключателя. Необязательное: без `v-model` контрол рисуется
   * выключенным — так же, как `GrCheckbox`. Обязательный проп заставлял бы
   * заводить `ref` даже там, где переключатель presentational.
   */
  modelValue?: boolean
  /** Недоступен: не переключается и в форму не уходит. Складывается по «или» с полем и формой. */
  disabled?: boolean
  /** Только для чтения: состояние видно, но не переключается. */
  readonly?: boolean
  /** Визуальное и ARIA-состояние ошибки. */
  invalid?: boolean
  /** Обязательное поле (`aria-required`). */
  required?: boolean
  /** Доступное имя, когда подписи нет ни в слоте, ни у `GrFormField`. */
  ariaLabel?: string
  /** Размер дорожки и бегунка: `xs`–`lg`. По умолчанию `md`; берётся из `GrConfigProvider`. */
  size?: GrSwitchSize
  /** Сторона подписи относительно дорожки. */
  labelPosition?: GrSwitchLabelPosition
  /** Идёт сохранение: бегунок показывает спиннер, переключение заблокировано. */
  loading?: boolean
  /** i18n: что именно грузится. `aria-busy` сам по себе часть AT не объявляет. */
  loadingText?: string
  /** Имя поля для нативной отправки формы. Без него скрытое поле не рендерится. */
  name?: string
  /** Значение, уходящее в форму во включённом состоянии. */
  value?: string
  /** `id` формы, если переключатель лежит вне неё. */
  form?: string
  /** Кастомный цвет фона в активном состоянии. Если не задан — `var(--gr-selected)`. */
  activeBackgroundColor?: string
  /** Кастомный цвет фона в неактивном состоянии. Если не задан — `var(--gr-muted)`. */
  inactiveBackgroundColor?: string
  /**
   * Подпись состояния внутри дорожки — на свободной от бегунка стороне.
   * Помещается только на `md` и `lg`; на мелких ступенях не рисуется.
   */
  showStateText?: boolean
  /** Текст включённого состояния. Без него — `gr.switch.on` из локали. */
  checkedText?: string
  /** Текст выключенного состояния. Без него — `gr.switch.off` из локали. */
  uncheckedText?: string
  /**
   * Дорожка растягивается под подпись, а ступень размера становится нижней
   * границей ширины. Без `showStateText` смысла не имеет: тянуться не под что.
   */
  autoWidth?: boolean
}

export interface GrSwitchEmits {
  /** Новое состояние для `v-model`. При `disabled`, `readonly` и `loading` не шлётся. */
  (e: 'update:modelValue', value: boolean): void
  /** Пользователь переключил — тот же payload, что у `update:modelValue`. */
  (e: 'change', value: boolean): void
  /** Фокус пришёл на переключатель — в том числе кликом по подписи `GrFormField`. */
  (e: 'focus', event: FocusEvent): void
  /** Фокус ушёл с переключателя. */
  (e: 'blur', event: FocusEvent): void
}

const getCustomColor = (value?: string) => value?.trim() || undefined

// Скрытое поле — сосед кнопки, а не её потомок: интерактивный контент внутри
// `<button>` невалиден. Из-за этого корень компонента — фрагмент, и атрибуты
// потребителя надо донести до кнопки руками.
defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<GrSwitchProps>(),
  {
    modelValue: false,
    disabled: false,
    readonly: false,
    invalid: false,
    required: false,
    ariaLabel: undefined,
    size: undefined,
    labelPosition: 'end',
    loading: false,
    loadingText: undefined,
    name: undefined,
    value: 'on',
    form: undefined,
    activeBackgroundColor: undefined,
    inactiveBackgroundColor: undefined,
    // `undefined`, а не `false`: Vue приводит отсутствующий boolean к `false`,
    // и дефолт из `GrConfigProvider` до компонента бы не доехал.
    showStateText: undefined,
    checkedText: undefined,
    uncheckedText: undefined,
    autoWidth: undefined,
  },
)

// Контекст `GrFormField`: id для `<label for>`, описание ошибкой, невалидность.
// `<button>` — labelable-элемент, поэтому клик по подписи фокусирует переключатель.
const slots = defineSlots<{
  /** Подпись переключателя. */
  'default'?: () => any
  /**
   * Знак на бегунке во включённом состоянии — галочка, замок, что угодно.
   *
   * Размер задаёт обёртка по ступени `size`, поэтому содержимое слота тянется
   * до неё: `class="h-full w-full"`, как у `GrBadge` и `GrChip`.
   *
   * Знак декоративен — бегунок целиком `aria-hidden`, а состояние диктор берёт
   * из `aria-checked`. Смысла, которого нет больше нигде, сюда класть нельзя.
   */
  'checked-icon'?: () => any
  /** То же для выключенного состояния. Слоты независимы. */
  'unchecked-icon'?: () => any
}>()

const field = useGrFormFieldContext()
const fieldId = computed(() => field?.id.value)
const describedBy = computed(() => field?.describedById.value)
const {
  disabled: isDisabled,
  invalid: isInvalid,
  required: isRequired,
  readonly: isReadonly,
} = useGrFormControl(() => props)

const aria = useControlAria()

const { t } = useGranularityTranslations()

const rootEl = ref<HTMLButtonElement | null>(null)

function focus(): void {
  rootEl.value?.focus()
}

function blur(): void {
  rootEl.value?.blur()
}

defineExpose({
  /** Поставить фокус на переключатель. */
  focus,
  /** Снять фокус с переключателя. */
  blur,
})

// Эффективный размер: локальный проп → `GrConfigProvider` → дефолт компонента.
const resolvedSize = useGrComponentSize(() => props.size, {
  component: 'GrSwitch',
  supported: ['xs', 'sm', 'md', 'lg'],
})

const emit = defineEmits<GrSwitchEmits>()

const resolvedShowStateText = useGrComponentProp(
  'GrSwitch',
  'showStateText',
  () => props.showStateText,
  false,
)

const resolvedAutoWidth = useGrComponentProp(
  'GrSwitch',
  'autoWidth',
  () => props.autoWidth,
  false,
)

// Ступень, на которой подпись помещается в дорожку, — иначе её нет вовсе.
const stateTextSize = computed<GrSwitchStateTextSize | undefined>(() => {
  if (!resolvedShowStateText.value)
    return undefined

  return isGrSwitchStateTextSize(resolvedSize.value) ? resolvedSize.value : undefined
})

const lookAttrs = computed(() => grSwitchLookAttrs({
  size: resolvedSize.value,
  labelPosition: props.labelPosition,
  stateText: stateTextSize.value ? { autoWidth: resolvedAutoWidth.value } : undefined,
}))

/**
 * Цвета дорожки по состоянию задаёт лист; инлайн — только произвольный цвет
 * потребителя. Недоступность перебивает его: иначе выключенный переключатель
 * остался бы таким же ярким, как рабочий. При ошибке рамка остаётся ролью ошибки.
 */
const trackStyle = computed(() => {
  const custom = getCustomColor(props.modelValue ? props.activeBackgroundColor : props.inactiveBackgroundColor)
  if (!custom || isDisabled.value)
    return undefined

  return { '--gr-switch-track-bg': custom, '--gr-switch-track-brd': isInvalid.value ? undefined : custom }
})

// Спиннер и иконка занимают центр бегунка: пока идёт запрос, важнее «состояние
// меняется», чем «каким оно стало».
const thumbIconSlot = computed(() => (props.modelValue ? slots['checked-icon'] : slots['unchecked-icon']))

const resolvedLoadingText = computed(() => props.loadingText ?? t('gr.switch.loading', 'Saving…'))

const checkedStateText = computed(() => props.checkedText ?? t('gr.switch.on', 'ON'))
const uncheckedStateText = computed(() => props.uncheckedText ?? t('gr.switch.off', 'OFF'))

const resolvedStateText = computed(() => (
  props.modelValue ? checkedStateText.value : uncheckedStateText.value
))

// Невидимый дубль держит ширину: без него дорожка меняла бы размер на каждом
// щелчке, потому что «вкл» и «выкл» почти никогда не равны по ширине.
const ghostStateText = computed(() => (
  props.modelValue ? uncheckedStateText.value : checkedStateText.value
))

if (__GR_DEV__) {
  watchEffect(() => {
    if (resolvedAutoWidth.value && !resolvedShowStateText.value) {
      console.warn(
        '[granularity] GrSwitch: `autoWidth` без `showStateText` ничего не делает — '
        + 'дорожке не подо что растягиваться.',
      )
    }
  })

  watchEffect(() => {
    if (!resolvedShowStateText.value || isGrSwitchStateTextSize(resolvedSize.value))
      return

    console.warn(
      `[granularity] GrSwitch: подпись состояния не нарисована на ступени \`${resolvedSize.value}\`: `
      + 'рядом с бегунком меньше места, чем нужно читаемой подписи. Подписи живут на `md` и `lg`.',
    )
  })
}

// Выключенный переключатель не отправляется вовсе — так устроен чекбокс в HTML,
// и сервер отличает «выкл» по отсутствию ключа.
const submitsValue = computed(
  () => props.modelValue && !isDisabled.value && Boolean(props.name),
)

function toggle(): void {
  if (isDisabled.value || isReadonly.value || props.loading) {
    return
  }

  const next = !props.modelValue
  emit('update:modelValue', next)
  emit('change', next)
}
</script>

<template>
  <input
      v-if="submitsValue"
      type="hidden"
      :name="name"
      :value="value"
      :form="form"
  >

  <button
      :id="fieldId"
      ref="rootEl"
      v-bind="{ ...aria.rootAttrs(), ...lookAttrs }"
      type="button"
      role="switch"
      data-gr-switch
      :aria-checked="modelValue ? 'true' : 'false'"
      :aria-label="ariaLabel"
      :aria-describedby="aria.describedBy(describedBy)"
      :aria-labelledby="aria.labelledBy()"
      :aria-errormessage="aria.errorMessage()"
      :aria-invalid="isInvalid ? 'true' : undefined"
      :aria-required="isRequired ? 'true' : undefined"
      :aria-readonly="isReadonly ? 'true' : undefined"
      :aria-busy="loading ? 'true' : undefined"
      :disabled="isDisabled"
      @click="toggle"
      @focus="emit('focus', $event)"
      @blur="emit('blur', $event)"
  >
    <span
        data-testid="gr-switch-track"
        data-gr-switch-track
        :style="trackStyle"
    >
      <span
          v-if="stateTextSize"
          data-testid="gr-switch-state-text"
          data-gr-switch-state-text
          aria-hidden="true"
      >
        <span>{{ resolvedStateText }}</span>
        <span
            v-if="resolvedAutoWidth"
            data-gr-switch-state-text-ghost
        >{{ ghostStateText }}</span>
      </span>
      <span
          data-testid="gr-switch-thumb"
          data-gr-switch-thumb
          aria-hidden="true"
      >
        <IconLoader v-if="loading" data-gr-switch-spinner class="animate-spin" />
        <span
            v-else-if="thumbIconSlot"
            data-testid="gr-switch-thumb-icon"
            data-gr-switch-thumb-icon
        >
          <slot v-if="modelValue" name="checked-icon" />
          <slot v-else name="unchecked-icon" />
        </span>
      </span>
    </span>
    <span
        v-if="$slots.default"
        data-gr-switch-label
    >
      <slot />
    </span>
    <span v-if="loading" data-gr-switch-loading-text class="sr-only">{{ resolvedLoadingText }}</span>
  </button>
</template>

<style>
/*
 * Вид переключателя — лист по атрибутам (`docs/markup-weight.md`): ступень, сторона
 * подписи и режим подписи состояния ставит корень, включённость, ошибку и
 * недоступность лист читает по `aria-checked`, `aria-invalid` и `:disabled`.
 */
[data-gr-switch] {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  user-select: none;
}

[data-gr-switch]:disabled {
  cursor: not-allowed;
}

/* `start` разворачивает ряд, а не меняет порядок узлов: DOM-порядок читает диктор. */
[data-gr-switch][data-gr-label='start'] {
  flex-direction: row-reverse;
}

/*
 * Цвета дорожки — переменными на ней самой: произвольный цвет потребителя
 * (`activeBackgroundColor`) ставится инлайном поверх них. Выключенная дорожка
 * светлая, как поверхность вокруг: видна она только рамкой, и рамке нужна роль с
 * 3:1 к фону. Ошибка — рамкой ролью ошибки, как у полей ввода.
 *
 * Геометрия — из темы: у каждой ступени высота и ширина дорожки. Всё остальное
 * выводится из высоты формулой, поэтому зазоры сходятся в любой теме сами: бегунок —
 * высота минус рамка и зазор с обеих сторон, отступ подписи — бегунок плюс зазор.
 */
[data-gr-switch-track] {
  --gr-switch-track-bg: var(--gr-switch-off-bg);
  --gr-switch-track-brd: var(--gr-control-brd);
  position: relative;
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  border-width: 1px;
  border-radius: var(--gr-radius-full);
  border-color: var(--gr-switch-track-brd);
  background-color: var(--gr-switch-track-bg);
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
  transition-duration: var(--gr-duration-fast);
  transition-timing-function: var(--gr-ease-out);
}

[data-gr-switch][aria-checked='true'] > [data-gr-switch-track] {
  --gr-switch-track-bg: var(--gr-selected);
  --gr-switch-track-brd: var(--gr-selected);
}

[data-gr-switch][aria-invalid='true'] > [data-gr-switch-track] {
  --gr-switch-track-brd: var(--gr-invalid-brd);
}

/* Недоступность гасится токеном, а не `opacity`: прозрачность роняет контраст подписи. */
[data-gr-switch]:disabled > [data-gr-switch-track] {
  --gr-switch-track-bg: var(--gr-disabled-bg);
  --gr-switch-track-brd: var(--gr-disabled-brd);
}

/*
 * Положение бегунка — без единого числа, зависящего от ширины дорожки: крайнее
 * положение — пара `left: calc(100% − зазор)` и `translateX(-100%)`. Процент в
 * `left` считается от дорожки, процент в `transform` — от самого бегунка, и левый
 * край встаёт на `ширина − бегунок − зазор`, какой бы ширина ни была. Обе величины
 * анимируются, композиция даёт линейный ход — `autoWidth` не нужны замеры.
 */
[data-gr-switch-thumb] {
  position: absolute;
  top: 1px;
  left: 1px;
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: var(--gr-radius-full);
  background-color: var(--gr-switch-thumb-bg);
  box-shadow: var(--gr-switch-thumb-shadow);
  transform: translateX(0);
  transition-property: left, transform;
  transition-duration: var(--gr-duration-fast);
  transition-timing-function: var(--gr-ease-out);
}

[data-gr-switch][aria-checked='true'] [data-gr-switch-thumb] {
  left: calc(100% - 1px);
  transform: translateX(-100%);
}

/*
 * Содержимое бегунка — спиннер загрузки или иконка действия — мельче его на ступень,
 * иначе знак упирается в края круга; потолок — бегунок минус 4px. Цвет — хук с
 * фолбэком, а не инлайн: инлайн победил бы CSS потребителя. По состоянию он не
 * ветвится и в недоступном виде не тускнеет: гасится дорожка, бегунок остаётся тем же.
 */
:is([data-gr-switch-spinner], [data-gr-switch-thumb-icon]) {
  color: var(--gr-switch-thumb-fg, var(--gr-muted-fg));
}

[data-gr-switch-thumb-icon] {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
}

[data-gr-switch-label] {
  color: var(--gr-muted-fg);
}

[data-gr-switch]:disabled > [data-gr-switch-label] {
  color: var(--gr-disabled-fg);
}

/*
 * Подпись состояния — грид, а не флекс: в `autoWidth` в ту же клетку кладётся
 * невидимый дубль противоположного текста, и ширина ячейки становится максимумом из
 * двух — иначе дорожка дёргалась бы на каждом щелчке. При фиксированной ширине ячейка
 * накрывает дорожку и на её размер не влияет, в `autoWidth` встаёт в поток и задаёт его.
 *
 * Цвет — роль `-fg` той заливки, на которой подпись лежит; хук фолбэком, а не
 * инлайном: заливку задают произвольным цветом, и безопасный цвет текста на ней
 * называет тот же, кто задал фон.
 */
[data-gr-switch-state-text] {
  display: grid;
  align-items: center;
  justify-items: center;
  overflow: hidden;
  color: var(--gr-switch-state-text-fg, var(--gr-muted-fg));
  font-weight: 600;
  line-height: 1;
  text-transform: uppercase;
  pointer-events: none;
}

[data-gr-switch][aria-checked='true'] [data-gr-switch-state-text] {
  color: var(--gr-switch-state-text-fg, var(--gr-selected-fg));
}

[data-gr-switch]:disabled [data-gr-switch-state-text] {
  color: var(--gr-switch-state-text-fg, var(--gr-disabled-fg));
}

[data-gr-switch][data-gr-text='fixed'] [data-gr-switch-state-text] {
  position: absolute;
  inset: 0;
}

[data-gr-switch-state-text] > span {
  grid-column-start: 1;
  grid-row-start: 1;
}

/* Дубль занимает место, но не рисуется: `visibility`, а не `display`. */
[data-gr-switch-state-text-ghost] {
  visibility: hidden;
}

[data-gr-switch][data-gr-size='xs'] {
  --gr-switch-step-width: var(--gr-switch-track-width-xs);
  --gr-switch-step-height: var(--gr-switch-track-height-xs);
  --gr-switch-step-icon: 0.5rem;
  --gr-switch-step-text: var(--gr-text-xs);
  --gr-switch-step-leading: var(--gr-leading-xs);
}

[data-gr-switch][data-gr-size='sm'] {
  --gr-switch-step-width: var(--gr-switch-track-width-sm);
  --gr-switch-step-height: var(--gr-switch-track-height-sm);
  --gr-switch-step-icon: 0.625rem;
  --gr-switch-step-text: var(--gr-text-sm);
  --gr-switch-step-leading: var(--gr-leading-sm);
}

[data-gr-switch][data-gr-size='md'] {
  --gr-switch-step-width: var(--gr-switch-track-width-md);
  --gr-switch-step-height: var(--gr-switch-track-height-md);
  --gr-switch-step-icon: 0.75rem;
  --gr-switch-step-text: var(--gr-text-sm);
  --gr-switch-step-leading: var(--gr-leading-sm);
  --gr-switch-step-text-width: var(--gr-switch-text-track-width-md);
  --gr-switch-step-state-size: 9px;
  --gr-switch-step-air: 8px;
}

[data-gr-switch][data-gr-size='lg'] {
  --gr-switch-step-width: var(--gr-switch-track-width-lg);
  --gr-switch-step-height: var(--gr-switch-track-height-lg);
  --gr-switch-step-icon: 1rem;
  --gr-switch-step-text: var(--gr-text-base);
  --gr-switch-step-leading: var(--gr-leading-base);
  --gr-switch-step-text-width: var(--gr-switch-text-track-width-lg);
  --gr-switch-step-state-size: 11px;
  --gr-switch-step-air: 10px;
}

[data-gr-switch][data-gr-size] > [data-gr-switch-track] {
  width: var(--gr-switch-step-width);
  height: var(--gr-switch-step-height);
}

[data-gr-switch][data-gr-size] [data-gr-switch-thumb] {
  width: calc(var(--gr-switch-step-height) - 4px);
  height: calc(var(--gr-switch-step-height) - 4px);
}

[data-gr-switch][data-gr-size] :is([data-gr-switch-spinner], [data-gr-switch-thumb-icon]) {
  width: var(--gr-switch-step-icon);
  max-width: calc(var(--gr-switch-step-height) - 8px);
  height: var(--gr-switch-step-icon);
  max-height: calc(var(--gr-switch-step-height) - 8px);
}

[data-gr-switch][data-gr-size] > [data-gr-switch-label] {
  font-size: var(--gr-switch-step-text);
  line-height: var(--gr-switch-step-leading);
}

/*
 * Кегль подписи — свой, а не ступень шкалы пакета: минимальный `--gr-text-xs` — 12px,
 * и трёхбуквенное слово на нём не встаёт в 21px. Отступ со стороны бегунка —
 * `бегунок + зазор`, остаток и есть место подписи. В `autoWidth` к нему добавляется
 * воздух с обеих сторон (`--gr-switch-step-air`): ширину задаёт сам текст, и без
 * воздуха он прилипает к бегунку и к закруглению. Расчёт места —
 * `docs/components/GrSwitch.md`.
 */
[data-gr-switch][data-gr-size][data-gr-text='fixed'] > [data-gr-switch-track] {
  width: var(--gr-switch-step-text-width);
}

[data-gr-switch][data-gr-size][data-gr-text='auto'] > [data-gr-switch-track] {
  width: auto;
  min-width: var(--gr-switch-step-text-width);
}

[data-gr-switch][data-gr-size] [data-gr-switch-state-text] {
  font-size: var(--gr-switch-state-text-size, var(--gr-switch-step-state-size));
}

[data-gr-switch][data-gr-size][data-gr-text='fixed']:not([aria-checked='true']) [data-gr-switch-state-text] {
  padding-left: calc(var(--gr-switch-step-height) - 3px);
}

[data-gr-switch][data-gr-size][data-gr-text='fixed'][aria-checked='true'] [data-gr-switch-state-text] {
  padding-right: calc(var(--gr-switch-step-height) - 3px);
}

[data-gr-switch][data-gr-size][data-gr-text='auto']:not([aria-checked='true']) [data-gr-switch-state-text] {
  padding-right: var(--gr-switch-step-air);
  padding-left: calc(var(--gr-switch-step-height) - 3px + var(--gr-switch-step-air));
}

[data-gr-switch][data-gr-size][data-gr-text='auto'][aria-checked='true'] [data-gr-switch-state-text] {
  padding-right: calc(var(--gr-switch-step-height) - 3px + var(--gr-switch-step-air));
  padding-left: var(--gr-switch-step-air);
}
</style>
