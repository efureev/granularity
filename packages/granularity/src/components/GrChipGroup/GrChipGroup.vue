<script setup lang="ts">
import { computed, nextTick, provide, ref } from 'vue'

import { useGrFormControl } from '../../composables/useGrFormControl'
import { useFocusWithin } from '../../composables/internal/useFocusWithin'
import { useRovingFocus } from '../../composables/useRovingFocus'
import { useGrComponentSize } from '../GrConfigProvider/context'
import { useGrFormFieldContext } from '../GrFormField/context'

import type { GrChipEntry, GrChipSelection, GrChipValue } from '../GrChip/grChipGroupContext'
import { GR_CHIP_GROUP_CONTEXT } from '../GrChip/grChipGroupContext'
import type { GrChipRadius, GrChipSize, GrChipTone } from '../GrChip/grChipStyles'

import { chipGroupRootClass } from './grChipGroupStyles'

/**
 * GrChipGroup — набор выбираемых чипов: фильтры, теги записи, быстрый выбор.
 *
 * Составной виджет: одна остановка `Tab`, внутрь попадают стрелками
 * (roving tabindex). Роль зависит от множественности выбора — `radiogroup`
 * в одиночном, `listbox` с `aria-multiselectable` во множественном; чипы
 * получают парную роль через контекст и сами её не выбирают.
 *
 * Состав группа не рисует: чипы приходят слотом, потому что у каждого своя
 * подпись и иконка. Отсюда же и `remove` — группа его ретранслирует, а снимает
 * чип потребитель, у которого лежит массив.
 */
export interface GrChipGroupProps {
  /** Одиночный выбор — значение, множественный — массив. */
  modelValue?: GrChipValue | GrChipValue[] | null
  selection?: GrChipSelection
  /** Имя для нативной формы. Множественный выбор отдаёт по полю на значение. */
  name?: string
  disabled?: boolean
  /** Выбор видно, но он не меняется. */
  readonly?: boolean
  invalid?: boolean
  required?: boolean
  /** Крестик у всех чипов набора. Точечно перебивается пропом самого чипа. */
  closable?: boolean
  size?: GrChipSize
  tone?: GrChipTone
  radius?: GrChipRadius
  dark?: boolean
  ariaLabel?: string
}

export interface GrChipGroupEmits {
  (e: 'update:modelValue', value: GrChipValue | GrChipValue[] | null): void
  (e: 'change', value: GrChipValue | GrChipValue[] | null): void
  (e: 'remove', value: GrChipValue): void
  (e: 'focus', event: FocusEvent): void
  (e: 'blur', event: FocusEvent): void
}

const props = withDefaults(defineProps<GrChipGroupProps>(), {
  modelValue: undefined,
  selection: 'multiple',
  name: undefined,
  disabled: false,
  readonly: false,
  invalid: false,
  required: false,
  closable: false,
  // Оформление разрешается в самих чипах: группа отдаёт им своё значение как
  // «локальное», и там же оно спорит с `GrConfigProvider`.
  size: undefined,
  tone: undefined,
  radius: undefined,
  dark: undefined,
  ariaLabel: undefined,
})

const emit = defineEmits<GrChipGroupEmits>()

defineSlots<{
  /** Чипы набора. */
  default?: () => unknown
}>()

const resolvedSize = useGrComponentSize<GrChipSize>(() => props.size, { component: 'GrChipGroup' })

// Группа — не labelable-элемент, поэтому имя приходит через `aria-labelledby`
// на подпись поля, а не через `<label for>`.
const field = useGrFormFieldContext()
const fieldId = computed(() => field?.id.value)
const describedBy = computed(() => field?.describedById.value)
const labelledBy = computed(() => (props.ariaLabel ? undefined : field?.labelId.value))
const {
  disabled: isDisabled,
  invalid: isInvalid,
  required: isRequired,
  readonly: isReadonly,
} = useGrFormControl(() => props)

const isMultiple = computed(() => props.selection === 'multiple')

const selectedValues = computed<GrChipValue[]>(() => {
  if (props.modelValue === undefined || props.modelValue === null) return []
  return Array.isArray(props.modelValue) ? [...props.modelValue] : [props.modelValue]
})

function isSelected(value: GrChipValue): boolean {
  return selectedValues.value.includes(value)
}

function commit(next: GrChipValue | GrChipValue[] | null): void {
  emit('update:modelValue', next)
  emit('change', next)
}

/**
 * В одиночном режиме повторный выбор снимает отметку.
 *
 * Так ведут себя фильтры: набор без выбранного значения осмыслен («любой»), и
 * отменить выбор иначе было бы нечем — в отличие от `radiogroup` формы, где
 * пустое значение обычно запрещено.
 */
function toggle(value: GrChipValue): void {
  if (isDisabled.value || isReadonly.value) return

  if (!isMultiple.value) {
    commit(isSelected(value) ? null : value)
    return
  }

  const next = selectedValues.value.filter(item => item !== value)
  if (next.length === selectedValues.value.length) next.push(value)
  commit(next)
}

function requestRemove(value: GrChipValue): void {
  if (isDisabled.value || isReadonly.value) return
  emit('remove', value)
}

const entries = ref<GrChipEntry[]>([])

function register(entry: GrChipEntry): () => void {
  entries.value.push(entry)
  return () => {
    const index = entries.value.indexOf(entry)
    if (index >= 0) entries.value.splice(index, 1)
  }
}

function entryOf(value: GrChipValue): GrChipEntry | undefined {
  return entries.value.find(entry => entry.value() === value)
}

/**
 * Кольцо roving-фокуса. Обе оси — чипы переносятся на новую строку, и «вниз»
 * означает следующий чип так же, как «вправо».
 *
 * Стрелка двигает только фокус, даже в одиночном режиме: у чипов есть второе
 * действие (снятие по `Delete`), и переносить выбор вместе с фокусом значило бы
 * менять модель при попытке дойти до нужного чипа. Тем же рассуждением живёт
 * `GrTabs` с `activationMode="manual"`.
 */
const roving = useRovingFocus<GrChipValue>({
  items: () => entries.value.map(entry => entry.value()),
  elementFor: value => entryOf(value)?.el() ?? null,
  isDisabled: value => entryOf(value)?.disabled() ?? true,
  orientation: () => 'both',
  skipDisabled: () => true,
  initialKey: () => {
    const first = selectedValues.value.find(value => entryOf(value) && !entryOf(value)!.disabled())
    return first
  },
  // Снятие чипа перерисовывает набор: без ожидания фокус уехал бы на узел,
  // которого уже нет.
  beforeFocus: () => nextTick(),
})

const rootEl = ref<HTMLElement | null>(null)

// Фокус ходит между чипами: без границы каждая стрелка давала бы потребителю
// пару `blur` + `focus`.
const { onFocusIn, onFocusOut } = useFocusWithin(rootEl, {
  enter: event => emit('focus', event),
  leave: event => emit('blur', event),
})

function rovingElement(): HTMLElement | null {
  const value = roving.rovingKey.value
  return value === undefined ? null : entryOf(value)?.el() ?? null
}

provide(GR_CHIP_GROUP_CONTEXT, {
  selection: computed(() => props.selection),
  isSelected,
  toggle,
  requestRemove,
  disabled: isDisabled,
  readonly: isReadonly,
  invalid: isInvalid,
  closable: computed(() => props.closable),
  size: resolvedSize,
  tone: computed(() => props.tone),
  radius: computed(() => props.radius),
  dark: computed(() => props.dark),
  register,
  rovingValue: roving.rovingKey,
  handleNavigationKeys: roving.handleNavigationKeys,
})

defineExpose({
  focus: () => rovingElement()?.focus(),
  blur: () => rovingElement()?.blur(),
})
</script>

<template>
  <div
    :id="fieldId"
    ref="rootEl"
    data-gr-chip-group
    :class="chipGroupRootClass"
    :role="isMultiple ? 'listbox' : 'radiogroup'"
    :aria-multiselectable="isMultiple ? 'true' : undefined"
    :aria-label="ariaLabel"
    :aria-labelledby="labelledBy"
    :aria-describedby="describedBy"
    :aria-invalid="isInvalid ? 'true' : undefined"
    :aria-required="isRequired ? 'true' : undefined"
    :aria-readonly="isReadonly ? 'true' : undefined"
    :aria-disabled="isDisabled ? 'true' : undefined"
    @focusin="onFocusIn"
    @focusout="onFocusOut"
  >
    <!--
      Значение уходит в форму скрытыми полями рядом с чипами, а не внутри них:
      внутрь роли-виджета нельзя вкладывать интерактивное, и скрытый `<input>`
      исключением не является.
    -->
    <input
      v-for="value in (name ? selectedValues : [])"
      :key="`hidden-${String(value)}`"
      type="hidden"
      :name="name"
      :value="String(value)"
    >

    <slot />
  </div>
</template>
