<script setup lang="ts">
/**
 * GrCheckbox — GR-примитив чекбокса с нативным скрытым `<input type="checkbox">`
 * для интеграции с HTML-формами (`FormData`, `form`).
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
 *
 * `required` объявляется только через `aria-required`, на скрытый input он не уходит.
 * Нативная проверка потребовала бы фокуса на невалидном контроле, а он невидим и
 * `aria-hidden` — Chrome в таком случае молча отменяет сабмит всей формы
 * («An invalid form control … is not focusable»). Обязательность проверяет
 * `GrForm` правилом `required` — см. `docs/components/GrCheckbox.md`.
 *
 * Внутри `GrCheckboxGroup` значение приходит из группы: свой `modelValue` не
 * задаётся, а `value` сравнивается с массивом выбранных.
 */
import { computed, inject, onMounted, ref, useId, useSlots, watch } from 'vue'
import IconCheck from '~icons/lucide/check'
import IconMinus from '~icons/lucide/minus'

import { useGrComponentSize } from '../GrConfigProvider/context'
import { useGrFormControl } from '../../composables/useGrFormControl'

import { GR_CHECKBOX_GROUP_CONTEXT } from './grCheckboxGroupContext'
import {
  grCheckboxCheckIconClass,
  grCheckboxControlClass,
  grCheckboxIndeterminateIconClass,
  grCheckboxLabelClass,
  grCheckboxRootClass,
  type GrCheckboxLabelPosition,
  type GrCheckboxSize,
} from './grCheckboxStyles'

export type { GrCheckboxLabelPosition, GrCheckboxSize } from './grCheckboxStyles'

export interface GrCheckboxProps {
  /** Не задан внутри `GrCheckboxGroup` — состояние берётся из группы. */
  modelValue?: boolean
  disabled?: boolean
  name?: string
  value?: string
  /** Обязательное поле: объявляется как `aria-required`, нативной проверки нет. */
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
  /** Сторона подписи относительно контрола. */
  labelPosition?: GrCheckboxLabelPosition
  /** Размер контрола. Не задан — берётся из группы, затем из `GrConfigProvider`, иначе `md`. */
  size?: GrCheckboxSize
}

export interface GrCheckboxEmits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'change', value: boolean): void
  (e: 'focus', event: FocusEvent): void
  (e: 'blur', event: FocusEvent): void
}

const hiddenInputStyle = {
  position: 'absolute',
  opacity: '0',
  width: '0',
  height: '0',
  pointerEvents: 'none',
} as const

const props = withDefaults(defineProps<GrCheckboxProps>(), {
  modelValue: undefined,
  disabled: undefined,
  name: undefined,
  value: 'on',
  required: false,
  readonly: false,
  invalid: false,
  form: undefined,
  id: undefined,
  indeterminate: false,
  ariaLabel: undefined,
  labelPosition: 'end',
  size: undefined,
})

const emit = defineEmits<GrCheckboxEmits>()
defineSlots<{
  /** Подпись флажка. Может содержать ссылки: роль остаётся на самом контроле. */
  default?: () => any
}>()

const slots = useSlots()

const labelId = useId()
const hasLabel = computed(() => Boolean(slots.default))

const group = inject(GR_CHECKBOX_GROUP_CONTEXT, null)

const checked = computed(() => {
  if (props.modelValue !== undefined)
    return props.modelValue

  if (group)
    return group.modelValue.value.includes(props.value)

  return false
})

const resolvedName = computed(() => props.name ?? group?.name.value)

// Контекст `GrFormField`. Id поля вешается на `span[role="checkbox"]` — именно он
// виджет и держит фокус; на скрытом `aria-hidden`-инпуте он был бы бесполезен
// (клик по подписи уводил бы фокус в невидимый элемент). Роль-виджет не является
// labelable-элементом, поэтому имя от подписи поля приходит через `aria-labelledby`.
const {
  disabled: isDisabled,
  id: fieldControlId,
  labelId: fieldLabelId,
  describedBy,
  invalid: fieldInvalid,
  required: fieldRequired,
  readonly: fieldReadonly,
} = useGrFormControl(() => props)

// «Или», а не `??`: `isDisabled` уже сведён к булеву (свой проп + контекст
// поля и формы), и `??` до группы просто не дошёл бы.
const resolvedDisabled = computed(() => isDisabled.value || Boolean(group?.disabled.value))

// `role="group"` не поддерживает `aria-required` и `aria-readonly` — объявлять
// обязательность и режим чтения группы обязаны сами чекбоксы.
const isRequired = computed(() => fieldRequired.value || Boolean(group?.required.value))

const isReadonly = computed(() => fieldReadonly.value || Boolean(group?.readonly.value))

// Ошибка группы красит чекбоксы, но не объявляется на каждом из них: `aria-invalid`
// уже висит на самой группе, и дублировать его на всех пунктах — значит заставить
// диктор повторить «неверное значение» столько раз, сколько в группе чекбоксов.
const isInvalid = computed(() => fieldInvalid.value)
const showsInvalid = computed(() => isInvalid.value || Boolean(group?.invalid.value))

const labelledBy = computed(() => {
  if (props.ariaLabel)
    return undefined
  if (hasLabel.value)
    return labelId
  return fieldLabelId.value
})

// Эффективный размер: локальный проп → группа → `GrConfigProvider` → `md`.
const resolvedSize = useGrComponentSize(
  () => props.size ?? group?.size.value,
  { component: 'GrCheckbox' },
)

const rootClassName = computed(() => grCheckboxRootClass({
  size: resolvedSize.value,
  disabled: resolvedDisabled.value,
  labelPosition: props.labelPosition,
}))

const controlClassName = computed(() => grCheckboxControlClass({
  size: resolvedSize.value,
  active: checked.value || props.indeterminate,
  disabled: resolvedDisabled.value,
  invalid: showsInvalid.value,
}))

const indeterminateIconClassName = computed(() => grCheckboxIndeterminateIconClass(resolvedSize.value))

const checkIconClassName = computed(() => grCheckboxCheckIconClass({
  size: resolvedSize.value,
  checked: checked.value,
}))

const labelClassName = computed(() => grCheckboxLabelClass(resolvedSize.value))

// Держим `.checked` на нативном input синхронно с состоянием — `:checked`-биндинг
// на скрытом элементе иногда отстаёт при программных обновлениях.
const nativeInput = ref<HTMLInputElement | null>(null)
const control = ref<HTMLElement | null>(null)
watch(
  checked,
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
  if (resolvedDisabled.value || isReadonly.value) {
    // Нативный input мог уже переключиться от клика по внешнему `<label for>` —
    // возвращаем его к состоянию модели, иначе форма отправит непринятое значение.
    if (nativeInput.value)
      nativeInput.value.checked = checked.value
    return
  }

  if (props.modelValue !== undefined || !group) {
    emit('update:modelValue', next)
    emit('change', next)
    return
  }

  group.toggle(props.value, next)
  emit('change', next)
}

function toggle(): void {
  // Из промежуточного состояния переключаемся во «включено» (стандартное поведение).
  setChecked(props.indeterminate ? true : !checked.value)
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

// Подпись держится снаружи роли-виджета именно для того, чтобы могла содержать
// ссылки и кнопки, — поэтому клик по её интерактивному содержимому чекбокс не
// переключает. Вложенный `<label>` считается интерактивным: он адресует
// собственный контрол, и переключение чекбокса «заодно» было бы сюрпризом.
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
      :checked="checked"
      :disabled="resolvedDisabled"
      :name="resolvedName"
      :value="value"
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
      :aria-checked="indeterminate ? 'mixed' : (checked ? 'true' : 'false')"
      :aria-disabled="resolvedDisabled ? 'true' : undefined"
      :aria-required="isRequired ? 'true' : undefined"
      :aria-readonly="isReadonly ? 'true' : undefined"
      :aria-invalid="isInvalid ? 'true' : undefined"
      :aria-describedby="describedBy"
      :aria-label="ariaLabel"
      :aria-labelledby="labelledBy"
      :tabindex="resolvedDisabled ? -1 : 0"
      :class="controlClassName"
      @keydown.space.prevent="toggle"
      @focus="emit('focus', $event)"
      @blur="emit('blur', $event)"
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
