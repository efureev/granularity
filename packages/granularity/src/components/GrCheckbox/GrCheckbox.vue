<script setup lang="ts">
/**
 * GrCheckbox — GR-примитив чекбокса с нативным скрытым `<input type="checkbox">`
 * для интеграции с HTML-формами (`FormData`, `required`, `form`).
 *
 * Источник истины — нативный input: клик по нему (в т.ч. по внешнему
 * `<label for="...">`) слушается через `@change` и эмитит модель. Клик по видимой
 * части компонента переключает через корневой обработчик.
 *
 * Клавиатура: `Space` переключает значение (Enter — намеренно нет, это нестандартно
 * для чекбоксов). Фокус — на самом контроле (квадратике), как у нативного чекбокса.
 *
 * A11y: `role="checkbox"` + `aria-checked` (`true`/`false`/`mixed`) + `aria-disabled`.
 * Роль висит **только на контроле**, а не на всей строке с подписью — по двум причинам:
 *  - роль объявляет своих потомков презентационными, поэтому ни нативный input, ни
 *    интерактивная подпись (ссылка на политику, кнопка «показать изменения») не могут
 *    жить внутри: скринридер теряет их, axe падает на `nested-interactive`;
 *  - имя виджета берётся из подписи через `aria-labelledby`, что и позволяет держать
 *    её снаружи вместе со всем её интерактивным содержимым.
 */
import { computed, onMounted, ref, useId, useSlots, watch } from 'vue'
import IconCheck from '~icons/lucide/check'
import IconMinus from '~icons/lucide/minus'

import { useGrComponentSize } from '../GrConfigProvider/context'
import { useGrFormFieldContext } from '../GrFormField/context'
import { useGrFormControl } from '../../composables/useGrFormControl'

import {
  grCheckboxCheckIconClass,
  grCheckboxControlClass,
  grCheckboxIndeterminateIconClass,
  grCheckboxLabelClass,
  grCheckboxRootClass,
  type GrCheckboxSize,
} from './grCheckboxStyles'

export type { GrCheckboxSize } from './grCheckboxStyles'

export interface GrCheckboxProps {
  modelValue?: boolean
  disabled?: boolean
  name?: string
  value?: string
  required?: boolean
  /** Только для чтения: состояние видно, но не переключается. */
  readonly?: boolean
  /** Визуальное и ARIA-состояние ошибки. */
  invalid?: boolean
  form?: string
  /** Пробрасывается на скрытый нативный `<input>`, чтобы работал `<label for="...">`. */
  id?: string
  /** Промежуточное («смешанное») состояние: `aria-checked="mixed"`, индикатор — тире. */
  indeterminate?: boolean
  /** Имя контрола, когда подписи в слоте нет (или она чисто визуальная). */
  ariaLabel?: string
  /** Размер контрола. Не задан — берётся из `GrConfigProvider`, иначе `md`. */
  size?: GrCheckboxSize
}

const hiddenInputStyle = {
  position: 'absolute',
  opacity: '0',
  width: '0',
  height: '0',
  pointerEvents: 'none',
} as const

const props = withDefaults(defineProps<GrCheckboxProps>(), {
  modelValue: false,
  disabled: false,
  name: undefined,
  value: 'on',
  required: false,
  readonly: false,
  invalid: false,
  form: undefined,
  id: undefined,
  indeterminate: false,
  ariaLabel: undefined,
  size: undefined,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const slots = useSlots()

const labelId = useId()
const hasLabel = computed(() => Boolean(slots.default))

// Контекст `GrFormField`. Id поля вешается на `span[role="checkbox"]` — именно он
// виджет и держит фокус; на скрытом `aria-hidden`-инпуте он был бы бесполезен
// (клик по подписи уводил бы фокус в невидимый элемент). Роль-виджет не является
// labelable-элементом, поэтому имя от подписи поля приходит через `aria-labelledby`.
const field = useGrFormFieldContext()
const fieldControlId = computed(() => field?.id.value)
const describedBy = computed(() => field?.describedById.value)
const {
  invalid: isInvalid,
  required: isFieldRequired,
  readonly: isReadonly,
} = useGrFormControl(() => props)

const labelledBy = computed(() => {
  if (props.ariaLabel) return undefined
  if (hasLabel.value) return labelId
  return field?.labelId.value
})

// Эффективный размер: локальный проп → `GrConfigProvider` → `md`.
const resolvedSize = useGrComponentSize(() => props.size, { component: 'GrCheckbox' })

const rootClassName = computed(() => grCheckboxRootClass({
  size: resolvedSize.value,
  disabled: props.disabled,
}))

const controlClassName = computed(() => grCheckboxControlClass({
  size: resolvedSize.value,
  active: props.modelValue || props.indeterminate,
}))

const indeterminateIconClassName = computed(() => grCheckboxIndeterminateIconClass(resolvedSize.value))

const checkIconClassName = computed(() => grCheckboxCheckIconClass({
  size: resolvedSize.value,
  checked: props.modelValue,
}))

const labelClassName = computed(() => grCheckboxLabelClass(resolvedSize.value))

// Держим `.checked` на нативном input синхронно с пропом — `:checked`-биндинг
// на скрытом элементе иногда отстаёт при программных обновлениях.
const nativeInput = ref<HTMLInputElement | null>(null)
const control = ref<HTMLElement | null>(null)
watch(
  () => props.modelValue,
  (value) => {
    if (nativeInput.value && nativeInput.value.checked !== value)
      nativeInput.value.checked = value
  },
)

// `indeterminate` можно выставить только через JS-свойство (не атрибут).
function syncIndeterminate(): void {
  if (nativeInput.value)
    nativeInput.value.indeterminate = props.indeterminate
}
watch(() => props.indeterminate, syncIndeterminate)
onMounted(syncIndeterminate)

function setChecked(next: boolean): void {
  if (props.disabled || isReadonly.value)
    return
  emit('update:modelValue', next)
}

function toggle(): void {
  // Из промежуточного состояния переключаемся во «включено» (стандартное поведение).
  setChecked(props.indeterminate ? true : !props.modelValue)
}

// Клик по нативному input (в т.ч. по внешнему `<label for="...">`) уже переключил его
// `.checked` — берём значение как источник истины и эмитим модель.
function onNativeChange(e: Event): void {
  setChecked((e.target as HTMLInputElement).checked)
}

// `<label for>` уводит фокус на скрытый input — визуально фокус пропадает. Возвращаем
// его на контрол, который этот фокус и показывает.
function onNativeFocus(): void {
  control.value?.focus()
}

function focus(): void {
  control.value?.focus()
}

function blur(): void {
  control.value?.blur()
}

defineExpose({ focus, blur })

function isInteractiveTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null
  if (!el)
    return false
  return !!el.closest('a,button,input,select,textarea,label,[role="button"],[role="link"]')
}

function onClick(e: MouseEvent): void {
  if (isInteractiveTarget(e.target))
    return
  toggle()
}
</script>
<template>
  <div
    data-gr-checkbox
    :class="rootClassName"
    @click="onClick"
  >
    <input
      :id="id"
      ref="nativeInput"
      type="checkbox"
      :checked="modelValue"
      :disabled="disabled"
      :name="name"
      :value="value"
      :required="required"
      :form="form"
      tabindex="-1"
      aria-hidden="true"
      :style="hiddenInputStyle"
      @change="onNativeChange"
      @focus="onNativeFocus"
    >
    <span
      :id="fieldControlId"
      ref="control"
      data-gr-checkbox-indicator
      role="checkbox"
      :aria-checked="indeterminate ? 'mixed' : (modelValue ? 'true' : 'false')"
      :aria-disabled="disabled ? 'true' : undefined"
      :aria-required="required || isFieldRequired ? 'true' : undefined"
      :aria-readonly="isReadonly ? 'true' : undefined"
      :aria-invalid="isInvalid ? 'true' : undefined"
      :aria-describedby="describedBy"
      :aria-label="ariaLabel"
      :aria-labelledby="labelledBy"
      :tabindex="disabled ? -1 : 0"
      :class="controlClassName"
      @keydown.space.prevent="toggle"
    >
      <IconMinus
        v-if="indeterminate"
        :class="indeterminateIconClassName"
      />
      <IconCheck
        v-else
        :class="checkIconClassName"
      />
    </span>
    <span
      v-if="hasLabel"
      :id="labelId"
      :class="labelClassName"
    >
      <slot />
    </span>
  </div>
</template>
