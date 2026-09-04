import type { ComputedRef, Ref, ShallowRef } from 'vue'
import { computed } from 'vue'

import { resolveSelectedOptions } from '../../shared/optionFilter'
import type {
  GrAutocompleteModelValue,
  GrAutocompleteOption,
  GrAutocompleteValue,
} from '../GrAutocomplete.vue'

/**
 * Значение и опции `GrAutocomplete`: что выбрано и как это назвать.
 *
 * Ничего про панель, клавиатуру и вид. Состав списка зависит от того, отвечал
 * ли уже сервер: до первого ответа источник — проп `options`, иначе последний
 * ответ `fetchOptions`.
 */
export interface UseAutocompleteValuesOptions<TValue extends GrAutocompleteValue> {
  modelValue: () => GrAutocompleteModelValue<TValue>
  options: () => GrAutocompleteOption<TValue>[] | undefined
  multiple: () => boolean
  fetchOptions: () => unknown
  remoteOptions: ShallowRef<GrAutocompleteOption<TValue>[]>
  remoteAnswered: Ref<boolean>
}

export interface AutocompleteValues<TValue extends GrAutocompleteValue> {
  optionsResolved: ComputedRef<GrAutocompleteOption<TValue>[]>
  isEmptyValue: (value: unknown) => boolean
  modelSingle: ComputedRef<TValue | ''>
  selectedValues: ComputedRef<TValue[]>
  hasSelection: ComputedRef<boolean>
  labelFor: (value: GrAutocompleteValue) => string
  selectedOptions: ComputedRef<GrAutocompleteOption<TValue>[]>
  singleSelectedLabel: ComputedRef<string>
}

export function useAutocompleteValues<TValue extends GrAutocompleteValue>(
  options: UseAutocompleteValuesOptions<TValue>,
): AutocompleteValues<TValue> {
  const optionsResolved = computed<GrAutocompleteOption<TValue>[]>(() =>
    options.fetchOptions() && options.remoteAnswered.value
      ? options.remoteOptions.value
      : (options.options() ?? []),
  )

  /** `0` — валидное значение, поэтому «пусто» проверяется явно, а не через falsy. */
  function isEmptyValue(value: unknown): boolean {
    return value === undefined || value === null || value === ''
  }

  function toArray(value: GrAutocompleteModelValue<TValue>): TValue[] {
    if (Array.isArray(value))
      return value
    if (isEmptyValue(value))
      return []
    return [value]
  }

  const modelSingle = computed<TValue | ''>(() => {
    const model = options.modelValue()
    const raw = Array.isArray(model) ? model[0] : model
    return isEmptyValue(raw) ? '' : (raw as TValue)
  })

  const selectedValues = computed(() => (
    options.multiple()
      ? toArray(options.modelValue())
      : (isEmptyValue(modelSingle.value) ? [] : [modelSingle.value as TValue])
  ))

  const hasSelection = computed(() => selectedValues.value.length > 0)

  function labelFor(value: GrAutocompleteValue): string {
    return optionsResolved.value.find(o => o.value === value)?.label ?? String(value)
  }

  /** Опции выбранных значений (для chips в multiple). Неизвестные значения показываем как есть. */
  const selectedOptions = computed<GrAutocompleteOption<TValue>[]>(() =>
    resolveSelectedOptions(selectedValues.value, optionsResolved.value),
  )

  const singleSelectedLabel = computed(() => (
    options.multiple() || isEmptyValue(modelSingle.value) ? '' : labelFor(modelSingle.value)
  ))

  return {
    optionsResolved,
    isEmptyValue,
    modelSingle,
    selectedValues,
    hasSelection,
    labelFor,
    selectedOptions,
    singleSelectedLabel,
  }
}
