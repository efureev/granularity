<script setup lang="ts">
import { computed, nextTick, provide, ref } from 'vue'

import { useGrFormControl } from '../../composables/useGrFormControl'
import { useFocusWithin } from '../../composables/internal/useFocusWithin'
import { useRovingFocus } from '../../composables/useRovingFocus'
import { useGrComponentSize } from '../shared/configContext'
import { useGrFormFieldContext } from '../shared/formFieldContext'

import type { GrChipEntry, GrChipSelection, GrChipValue } from '../shared/chipGroupContext'
import { GR_CHIP_GROUP_CONTEXT } from '../shared/chipGroupContext'
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
  /**
   * Множественность выбора: `multiple` — массив значений и роль `listbox`, `single` — одно
   * значение или `null` и роль `radiogroup`. По умолчанию `multiple`.
   */
  selection?: GrChipSelection
  /** Имя для нативной формы. Множественный выбор отдаёт по полю на значение. */
  name?: string
  /** Набор недоступен: чипы не выбираются и не снимаются. Включается и от `GrFormField`. */
  disabled?: boolean
  /** Выбор видно, но он не меняется. */
  readonly?: boolean
  /** Значение с ошибкой: `aria-invalid` на группе. Включается и от ошибки `GrFormField`. */
  invalid?: boolean
  /** Выбор обязателен: `aria-required` на группе. Включается и от `GrFormField`. */
  required?: boolean
  /** Крестик у всех чипов набора. Точечно перебивается пропом самого чипа. */
  closable?: boolean
  /** Ступень шкалы для всех чипов набора; проп чипа сильнее. По умолчанию `md`. */
  size?: GrChipSize
  /** Тон всех чипов набора; проп чипа сильнее. Не задан — `GrConfigProvider`, иначе `neutral`. */
  tone?: GrChipTone
  /** Форма всех чипов набора: `round`, `semi` или `square`; проп чипа сильнее. */
  radius?: GrChipRadius
  /** Заливка тоном вместо мягкой подложки у всех чипов набора; проп чипа сильнее. */
  dark?: boolean
  /** Доступное имя набора. Внутри `GrFormField` не нужно: группу именует подпись поля. */
  ariaLabel?: string
}

export interface GrChipGroupEmits {
  /** Новое значение (`v-model`): массив в `multiple`, значение или `null` в `single`. */
  (e: 'update:modelValue', value: GrChipValue | GrChipValue[] | null): void
  /** Пользователь изменил выбор кликом или клавишей; приходит вместе с `update:modelValue`. */
  (e: 'change', value: GrChipValue | GrChipValue[] | null): void
  /**
   * Чип просят снять — крестиком или `Delete`. Группа его не убирает: значение удаляет из
   * массива потребитель.
   */
  (e: 'remove', value: GrChipValue): void
  /** Фокус вошёл в набор. Переходы между чипами стрелками событием не считаются. */
  (e: 'focus', event: FocusEvent): void
  /** Фокус ушёл из набора целиком. */
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
  if (props.modelValue === undefined || props.modelValue === null)
    return []
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
  if (isDisabled.value || isReadonly.value)
    return

  if (!isMultiple.value) {
    commit(isSelected(value) ? null : value)
    return
  }

  const next = selectedValues.value.filter(item => item !== value)
  if (next.length === selectedValues.value.length)
    next.push(value)
  commit(next)
}

function requestRemove(value: GrChipValue): void {
  if (isDisabled.value || isReadonly.value)
    return
  emit('remove', value)
}

const entries = ref<GrChipEntry[]>([])

function register(entry: GrChipEntry): () => void {
  entries.value.push(entry)
  return () => {
    const index = entries.value.indexOf(entry)
    if (index >= 0)
      entries.value.splice(index, 1)
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
  /** Фокус на активный чип — тот, что держит остановку `Tab` набора. */
  focus: () => rovingElement()?.focus(),
  /** Снять фокус с активного чипа набора. */
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
