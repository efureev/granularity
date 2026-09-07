import type { ComputedRef, Ref, ShallowRef } from 'vue'
import { computed } from 'vue'

import { resolveSelectedOptions } from '../../shared/optionFilter'
import { isAutocompleteOptionGroup } from '../grAutocompleteStyles'
import type {
  GrAutocompleteModelValue,
  GrAutocompleteOption,
  GrAutocompleteOptionOrGroup,
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
  options: () => GrAutocompleteOptionOrGroup<TValue>[] | undefined
  multiple: () => boolean
  fetchOptions: () => unknown
  remoteOptions: ShallowRef<GrAutocompleteOptionOrGroup<TValue>[]>
  remoteAnswered: Ref<boolean>
}

export interface AutocompleteValues<TValue extends GrAutocompleteValue> {
  /** Список как его задал потребитель — с группами, если они есть. */
  optionsResolved: ComputedRef<GrAutocompleteOptionOrGroup<TValue>[]>
  /** Тот же список без групп: по нему ищут метку выбранного и проверяют дубли. */
  flatOptions: ComputedRef<GrAutocompleteOption<TValue>[]>
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
  const optionsResolved = computed<GrAutocompleteOptionOrGroup<TValue>[]>(() =>
    options.fetchOptions() && options.remoteAnswered.value
      ? options.remoteOptions.value
      : (options.options() ?? []),
  )

  /**
   * Плоский список: метку выбранного значения и проверку «такое уже есть» группы
   * не касаются — они про показ, а не про состав.
   */
  const flatOptions = computed<GrAutocompleteOption<TValue>[]>(() =>
    optionsResolved.value.flatMap(item => (isAutocompleteOptionGroup(item) ? item.options : [item])),
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
    return flatOptions.value.find(o => o.value === value)?.label ?? String(value)
  }

  /** Опции выбранных значений (для chips в multiple). Неизвестные значения показываем как есть. */
  const selectedOptions = computed<GrAutocompleteOption<TValue>[]>(() =>
    resolveSelectedOptions(selectedValues.value, flatOptions.value),
  )

  const singleSelectedLabel = computed(() => (
    options.multiple() || isEmptyValue(modelSingle.value) ? '' : labelFor(modelSingle.value)
  ))

  return {
    optionsResolved,
    flatOptions,
    isEmptyValue,
    modelSingle,
    selectedValues,
    hasSelection,
    labelFor,
    selectedOptions,
    singleSelectedLabel,
  }
}
