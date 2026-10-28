<script setup lang="ts">
import { computed, inject, onUnmounted, ref, useId, useSlots } from 'vue'

import { useGrComponentSize } from '../shared/configContext'

import type { GrButtonSize, GrButtonTone, GrButtonVariant } from '../GrButton'

import {
  grRadioButtonLook,
  grRadioLookAttrs,
  type GrRadioVariant,
} from './grRadioStyles'
import { GR_RADIO_GROUP_CONTEXT, type GrRadioValue } from './grRadioGroupContext'
import { useControlAria } from '../../composables/internal/useControlAria'

export type { GrRadioValue } from './grRadioGroupContext'

/**
 * GrRadio — одиночный элемент группы выбора.
 *
 * Может работать автономно (через `v-model`) либо внутри `GrRadioGroup`
 * (тогда `modelValue`/`disabled`/`size`/`name`/`invalid` приходят через `inject`).
 *
 * Доступным контролом является сам элемент с `role="radio"`: он держит фокус,
 * `aria-checked` и клавиатуру. Внутрь него ничего интерактивного не вкладывается —
 * `role="radio"` объявляет потомков презентационными, и вложенный native `<input>`
 * (даже скрытый и с `tabindex="-1"`) ломает виджет для скринридеров и падает
 * в axe на `nested-interactive`. Для отправки нативной формой рядом рендерится
 * `input[type="hidden"]` — он не фокусируется и не является интерактивным.
 */
export interface GrRadioProps {
  /** Значение переключателя: он выбран, когда оно совпадает с `modelValue` или значением группы. */
  value: GrRadioValue
  /** Выбранное значение (`v-model`) у одиночного переключателя. В группе значение ведёт она. */
  modelValue?: GrRadioValue
  /** Переключатель недоступен. Не задан — берётся из группы. */
  disabled?: boolean
  /** Визуальное и ARIA-состояние ошибки. Складывается с `invalid` группы. */
  invalid?: boolean
  /** Имя для нативной формы: выбранный отдаёт значение скрытым полем. Не задано — из группы. */
  name?: string
  /** Выбор обязателен: `aria-required` на переключателе. */
  required?: boolean
  /** `form` скрытого поля — когда форма, куда уходит значение, стоит не вокруг переключателя. */
  form?: string
  /** `id` элемента с ролью `radio` — для ссылок на него извне. */
  id?: string
  /** Размер по шкале кнопок. Не задан — из группы, затем `GrConfigProvider`, иначе `md`. */
  size?: GrButtonSize
  /**
   * Вид: `radiobox` — круг с точкой и подписью, `button` — кнопка в стиле `GrButton`.
   * По умолчанию `radiobox`.
   */
  variant?: GrRadioVariant
  /** Вес невыбранной кнопки в `variant="button"`. По умолчанию `outline`. */
  buttonVariant?: GrButtonVariant
  /** Тон невыбранной кнопки в `variant="button"`. По умолчанию `neutral`. */
  buttonTone?: GrButtonTone
  /** Вес выбранной кнопки в `variant="button"`. По умолчанию `primary`. */
  selectedButtonVariant?: GrButtonVariant
  /** Тон выбранной кнопки в `variant="button"`. По умолчанию `primary`. */
  selectedButtonTone?: GrButtonTone
  /** Доступное имя, когда подписи в слоте нет — например, у кнопки из одной иконки. */
  ariaLabel?: string
}

export interface GrRadioEmits {
  /** Выбран этот переключатель (`v-model`). Только при заданном `modelValue`, иначе выбор у группы. */
  (e: 'update:modelValue', value: GrRadioValue): void
}

// Связи потребителя (`aria-describedby` и соседи) уходят на элемент с ролью, а не на корень.
defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<GrRadioProps>(), {
  modelValue: undefined,
  disabled: undefined,
  invalid: false,
  name: undefined,
  required: false,
  form: undefined,
  id: undefined,
  size: undefined,
  variant: 'radiobox',
  buttonVariant: 'outline',
  buttonTone: 'neutral',
  selectedButtonVariant: 'primary',
  selectedButtonTone: 'primary',
  ariaLabel: undefined,
})

const emit = defineEmits<GrRadioEmits>()

const slots = useSlots()
const group = inject(GR_RADIO_GROUP_CONTEXT, null)

const resolvedModelValue = computed(() => {
  if (props.modelValue !== undefined)
    return props.modelValue

  return group?.modelValue.value ?? ''
})

const resolvedDisabled = computed(() => {
  if (props.disabled !== undefined)
    return props.disabled

  return group?.disabled.value ?? false
})

const resolvedReadonly = computed(() => group?.readonly.value ?? false)

const aria = useControlAria()

// «Или», а не `??`: ошибку может объявить и группа, и сам переключатель.
const resolvedInvalid = computed(() => props.invalid || (group?.invalid.value ?? false))

const resolvedName = computed(() => {
  if (props.name)
    return props.name

  return group?.name.value
})

// Приоритет: локальный проп → размер группы → `GrConfigProvider` → `md`.
// Группа специфичнее конфига, поэтому её значение подаётся как «локальное».
const resolvedSize = useGrComponentSize(
  () => props.size ?? group?.size.value,
  { component: 'GrRadio' },
)

const checked = computed(() => resolvedModelValue.value === props.value)

/** В DOM значение живёт строкой: `data-value` и скрытый input иначе не умеют. */
const domValue = computed(() => String(props.value))

// Нативная форма получает значение только от выбранного и не-disabled элемента —
// ровно как поступил бы native radio. Без `name` отправлять нечего.
const submitsValue = computed(
  () => checked.value && !resolvedDisabled.value && Boolean(resolvedName.value),
)

const descriptionId = useId()
const hasDescription = computed(() => Boolean(slots.description))

const buttonLook = computed(() => grRadioButtonLook({
  checked: checked.value,
  disabled: resolvedDisabled.value,
  readonly: resolvedReadonly.value,
  size: resolvedSize.value,
  buttonVariant: props.buttonVariant,
  buttonTone: props.buttonTone,
  selectedButtonVariant: props.selectedButtonVariant,
  selectedButtonTone: props.selectedButtonTone,
}))

const lookAttrs = computed(() => grRadioLookAttrs({
  size: resolvedSize.value,
  disabled: resolvedDisabled.value,
  readonly: resolvedReadonly.value,
}))

function setValue(next: GrRadioValue): void {
  if (resolvedDisabled.value)
    return

  if (props.modelValue !== undefined) {
    emit('update:modelValue', next)
    return
  }

  group?.setValue(next)
}

function onButtonClick(): void {
  setValue(props.value)
}

// Паттерн radiogroup: группа — одна остановка Tab, внутрь попадают стрелками.
// Вне группы (одиночный `GrRadio`) переключатель остаётся обычной остановкой.
const rovingTabindex = computed(() => {
  if (resolvedDisabled.value)
    return -1
  if (!group)
    return 0
  return group.rovingValue.value === props.value ? 0 : -1
})

const rootEl = ref<HTMLElement | null>(null)

/** Кольцо ведёт группа: только она знает состав и порядок. */
function onKeydown(event: KeyboardEvent): void {
  if (!group || resolvedDisabled.value)
    return

  group.handleNavigationKeys(event)
}

const unregister = group?.register({
  value: () => props.value,
  disabled: () => resolvedDisabled.value,
  el: () => rootEl.value,
})

onUnmounted(() => unregister?.())

defineSlots<{
  /** Подпись переключателя вместо пропа `label`. */
  default?: () => any
  /** Пояснение под подписью. */
  description?: () => any
}>()
</script>

<template>
  <div
    v-if="variant === 'button'"
    :id="id"
    ref="rootEl"
    data-gr-button
    data-gr-radio
    role="radio"
    :aria-checked="checked ? 'true' : 'false'"
    :aria-label="ariaLabel"
    :aria-disabled="resolvedDisabled ? 'true' : undefined"
    :aria-invalid="resolvedInvalid ? 'true' : undefined"
    :aria-required="required ? 'true' : undefined"
    :aria-describedby="aria.describedBy()"
    :aria-labelledby="aria.labelledBy()"
    :aria-errormessage="aria.errorMessage()"
    :data-value="domValue"
    :tabindex="rovingTabindex"
    v-bind="{ ...buttonLook, ...aria.rootAttrs() }"
    @click="onButtonClick"
    @keydown.space.prevent="onButtonClick"
    @keydown.enter.prevent="onButtonClick"
    @keydown="onKeydown"
  >
    <input
      v-if="submitsValue"
      type="hidden"
      :name="resolvedName"
      :value="domValue"
      :form="form"
    >

    <slot />
  </div>

  <div
    v-else
    :id="id"
    ref="rootEl"
    data-gr-radio
    role="radio"
    :aria-checked="checked ? 'true' : 'false'"
    :aria-label="ariaLabel"
    :aria-disabled="resolvedDisabled ? 'true' : undefined"
    :aria-invalid="resolvedInvalid ? 'true' : undefined"
    :aria-required="required ? 'true' : undefined"
    :aria-describedby="aria.describedBy(hasDescription ? descriptionId : undefined)"
    :aria-labelledby="aria.labelledBy()"
    :aria-errormessage="aria.errorMessage()"
    :data-value="domValue"
    :tabindex="rovingTabindex"
    v-bind="{ ...lookAttrs, ...aria.rootAttrs() }"
    @click="onButtonClick"
    @keydown.space.prevent="onButtonClick"
    @keydown.enter.prevent="onButtonClick"
    @keydown="onKeydown"
  >
    <input
      v-if="submitsValue"
      type="hidden"
      :name="resolvedName"
      :value="domValue"
      :form="form"
    >

    <span data-gr-radio-control aria-hidden="true">
      <span data-gr-radio-dot />
    </span>

    <span>
      <span data-gr-radio-label>
        <slot />
      </span>

      <span
        v-if="hasDescription"
        :id="descriptionId"
        data-gr-radio-description
      >
        <slot name="description" />
      </span>
    </span>
  </div>
</template>

<style>
/*
 * Вид радио — лист по атрибутам (`docs/markup-weight.md`): ступень и «только для
 * чтения» ставит корень, выбор, недоступность и ошибку лист читает по `aria-checked`,
 * `aria-disabled` и `aria-invalid`. Вид `button` рисует лист `GrButton`; здесь — только
 * курсор и цвета недоступного.
 */
[data-gr-radio]:not([data-gr-button]) {
  display: inline-flex;
  align-items: flex-start;
  gap: 0.5rem;
  cursor: pointer;
  user-select: none;
}

/* Корень вида `button` — `div` с ролью, курсора кнопки у него нет. */
[data-gr-radio][data-gr-button] {
  cursor: pointer;
}

/* Только для чтения: значение видно и читается, но курсор не обещает клика. */
[data-gr-radio][data-gr-readonly] {
  cursor: default;
}

/* Недоступный гасится токенами, а не `opacity`: прозрачность разбавляет выверенные на AA цвета. */
[data-gr-radio]:not([data-gr-button])[aria-disabled='true'] {
  color: var(--gr-muted-fg);
  cursor: not-allowed;
}

[data-gr-radio]:not([data-gr-button]):focus-visible {
  border-radius: var(--gr-radius-md);
  outline: 2px solid transparent;
  outline-offset: 2px;
  box-shadow: 0 0 0 2px var(--gr-ring), 0 0 0 4px var(--gr-bg);
}

/* Рамка невыбранного радио — `--gr-control-brd` с 3:1 к фону: другого признака у него нет. */
[data-gr-radio-control] {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  margin-top: 0.125rem;
  border-width: 1px;
  border-radius: var(--gr-radius-full);
  border-color: var(--gr-control-brd);
  background-color: var(--gr-bg);
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
  transition-duration: var(--gr-duration-fast);
  transition-timing-function: var(--gr-ease-out);
}

[data-gr-radio][aria-invalid='true'] > [data-gr-radio-control] {
  border-color: var(--gr-danger);
}

[data-gr-radio][aria-checked='true'] > [data-gr-radio-control] {
  border-color: var(--gr-selected);
  background-color: var(--gr-radio-checked-bg);
}

[data-gr-radio][aria-disabled='true'] > [data-gr-radio-control] {
  border-color: var(--gr-brd);
  background-color: var(--gr-muted);
}

/* Отклик на указатель над всей подписью — только у рабочего радио. */
[data-gr-radio]:not([aria-disabled='true'], [aria-invalid='true'], [data-gr-readonly]):hover > [data-gr-radio-control] {
  border-color: var(--gr-control-brd-hover);
}

[data-gr-radio][aria-checked='true']:not([aria-disabled='true'], [aria-invalid='true'], [data-gr-readonly]):hover > [data-gr-radio-control] {
  border-color: var(--gr-selected-hover);
  background-color: var(--gr-radio-checked-hover-bg);
}

[data-gr-radio-dot] {
  border-radius: var(--gr-radius-full);
  background-color: transparent;
  opacity: 0;
  transform: scale(0.75);
  transition-property: transform, opacity, background-color;
  transition-duration: var(--gr-duration-fast);
  transition-timing-function: var(--gr-ease-out);
}

[data-gr-radio][aria-checked='true'] [data-gr-radio-dot] {
  background-color: var(--gr-radio-dot);
  opacity: 1;
  transform: scale(1);
}

[data-gr-radio][aria-checked='true'][aria-disabled='true'] [data-gr-radio-dot] {
  background-color: var(--gr-muted-fg);
}

[data-gr-radio-control] + span {
  display: grid;
  gap: 0.125rem;
}

[data-gr-radio-label] {
  color: var(--gr-muted-fg);
}

/* Выбранный вариант выделяется текстом, а не только точкой. */
[data-gr-radio][aria-checked='true'] [data-gr-radio-label] {
  color: var(--gr-fg);
  font-weight: 500;
}

[data-gr-radio-description] {
  color: var(--gr-muted-fg);
}

[data-gr-radio][data-gr-size='xs'] > [data-gr-radio-control] {
  width: 0.875rem;
  height: 0.875rem;
}

[data-gr-radio][data-gr-size='xs'] [data-gr-radio-dot] {
  width: 5px;
  height: 5px;
}

[data-gr-radio][data-gr-size='xs'] [data-gr-radio-label] {
  font-size: var(--gr-text-xs);
  line-height: var(--gr-leading-xs);
}

[data-gr-radio][data-gr-size='xs'] [data-gr-radio-description] {
  font-size: var(--gr-text-2xs);
  line-height: var(--gr-leading-2xs);
}

[data-gr-radio][data-gr-size='sm'] > [data-gr-radio-control] {
  width: 1rem;
  height: 1rem;
}

[data-gr-radio][data-gr-size='sm'] [data-gr-radio-dot] {
  width: 6px;
  height: 6px;
}

[data-gr-radio][data-gr-size='sm'] [data-gr-radio-label] {
  font-size: var(--gr-text-sm);
  line-height: var(--gr-leading-sm);
}

[data-gr-radio][data-gr-size='sm'] [data-gr-radio-description] {
  font-size: var(--gr-text-xs);
  line-height: var(--gr-leading-xs);
}

[data-gr-radio][data-gr-size='md'] > [data-gr-radio-control] {
  width: 1.25rem;
  height: 1.25rem;
}

[data-gr-radio][data-gr-size='md'] [data-gr-radio-dot] {
  width: 0.5rem;
  height: 0.5rem;
}

[data-gr-radio][data-gr-size='md'] [data-gr-radio-label] {
  font-size: var(--gr-text-sm);
  line-height: var(--gr-leading-sm);
}

[data-gr-radio][data-gr-size='md'] [data-gr-radio-description] {
  font-size: var(--gr-text-xs);
  line-height: var(--gr-leading-xs);
}

[data-gr-radio][data-gr-size='lg'] > [data-gr-radio-control] {
  width: 1.5rem;
  height: 1.5rem;
}

[data-gr-radio][data-gr-size='lg'] [data-gr-radio-dot] {
  width: 0.625rem;
  height: 0.625rem;
}

[data-gr-radio][data-gr-size='lg'] [data-gr-radio-label] {
  font-size: var(--gr-text-base);
  line-height: var(--gr-leading-base);
}

[data-gr-radio][data-gr-size='lg'] [data-gr-radio-description] {
  font-size: var(--gr-text-sm);
  line-height: var(--gr-leading-sm);
}

/*
 * Недоступная кнопка-радио гасится, но не теряет состояние: в недоступной группе
 * выбор обязан оставаться виден, поэтому вид не отдан недоступной `GrButton` —
 * у радио своя пара.
 */
[data-gr-radio][data-gr-button][aria-disabled='true'] {
  border-width: 1px;
  border-color: var(--gr-brd);
  background-color: transparent;
  color: var(--gr-muted-fg);
  cursor: not-allowed;
}

[data-gr-radio][data-gr-button][aria-disabled='true'][aria-checked='true'] {
  border-color: var(--gr-muted-fg);
  background-color: var(--gr-muted);
  color: var(--gr-fg);
}
</style>
