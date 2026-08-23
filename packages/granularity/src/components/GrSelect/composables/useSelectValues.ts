import type { ComputedRef } from 'vue'
import { computed } from 'vue'

import { resolveSelectedOptions } from '../../shared/optionFilter'
import type {
  GrSelectModelValue,
  GrSelectOption,
  GrSelectOptionGroup,
  GrSelectOptionOrGroup,
  GrSelectValue,
} from '../grSelectStyles'
import { isEmptySelectValue, selectValueKey, toSelectArray } from '../selectValue'

/**
 * Значение и опции `GrSelect`: плоский список, выбранное, подпись триггера.
 *
 * Здесь живёт всё, что отвечает на вопрос «что выбрано и как это назвать», и
 * ничего про панель, клавиатуру и вид. Сравнения идут через ключ значения
 * (`selectValue.ts`), а не через `===`: модель приходит снаружи отдельной
 * копией, и объекты по ссылке не совпали бы ни с одной опцией.
 */
export interface UseSelectValuesOptions<TValue extends GrSelectValue> {
  modelValue: () => GrSelectModelValue<TValue>
  options: () => GrSelectOptionOrGroup<TValue>[] | undefined
  multiple: () => boolean
  /** Имя поля-идентификатора для объектных значений. */
  valueKey: () => string | undefined
  placeholder: () => string | undefined
}

export interface SelectValues<TValue extends GrSelectValue> {
  optionsResolved: ComputedRef<GrSelectOptionOrGroup<TValue>[]>
  /** Плоский список всех опций (группы «развёрнуты»). */
  flatOptions: ComputedRef<GrSelectOption<TValue>[]>
  isOptionGroup: (item: GrSelectOptionOrGroup<TValue>) => item is GrSelectOptionGroup<TValue>
  keyOf: (value: unknown) => string
  sameValue: (a: unknown, b: unknown) => boolean
  modelSingle: ComputedRef<TValue | ''>
  modelMultiple: ComputedRef<TValue[]>
  selectedValues: ComputedRef<TValue[]>
  hasSelection: ComputedRef<boolean>
  /** Восстанавливает типизированное значение из строки, пришедшей из DOM. */
  fromDomValue: (raw: string) => TValue
  selectedOptions: ComputedRef<GrSelectOption<TValue>[]>
  hasModelInOptions: ComputedRef<boolean>
  displayLabel: ComputedRef<string>
  displayText: ComputedRef<string>
}

export function useSelectValues<TValue extends GrSelectValue>(
  options: UseSelectValuesOptions<TValue>,
): SelectValues<TValue> {
  const optionsResolved = computed<GrSelectOptionOrGroup<TValue>[]>(() => options.options() ?? [])

  function isOptionGroup(item: GrSelectOptionOrGroup<TValue>): item is GrSelectOptionGroup<TValue> {
    return Array.isArray((item as GrSelectOptionGroup).options)
  }

  const flatOptions = computed<GrSelectOption<TValue>[]>(() => {
    const result: GrSelectOption<TValue>[] = []
    for (const item of optionsResolved.value) {
      if (isOptionGroup(item))
        result.push(...item.options)
      else result.push(item)
    }
    return result
  })

  function keyOf(value: unknown): string {
    return selectValueKey(value, options.valueKey())
  }

  function sameValue(a: unknown, b: unknown): boolean {
    return keyOf(a) === keyOf(b)
  }

  const modelSingle = computed<TValue | ''>(() => {
    const model = options.modelValue()
    const raw = Array.isArray(model) ? model[0] : model
    return isEmptySelectValue(raw) ? '' : (raw as TValue)
  })

  const modelMultiple = computed(() => toSelectArray<TValue>(options.modelValue()))

  const selectedValues = computed(() => {
    if (options.multiple())
      return modelMultiple.value
    return isEmptySelectValue(modelSingle.value) ? [] : [modelSingle.value as TValue]
  })

  const hasSelection = computed(() => selectedValues.value.length > 0)

  /**
   * Нативный `<select>` хранит в `option.value` строку, поэтому значение,
   * вернувшееся из DOM, нужно восстановить в исходный тип. Карта строится по
   * опциям: ключ значения — ключ карты, само значение — результат.
   */
  const valueByDomKey = computed<Map<string, TValue>>(() => {
    const map = new Map<string, TValue>()
    for (const option of flatOptions.value) map.set(keyOf(option.value), option.value)
    return map
  })

  function fromDomValue(raw: string): TValue {
    const known = valueByDomKey.value.get(raw)
    if (known !== undefined)
      return known
    // Значения нет среди опций — это `allowCustomValue`, а он по природе строковый.
    return raw as TValue
  }

  const selectedOptions = computed<GrSelectOption<TValue>[]>(() =>
    resolveSelectedOptions(selectedValues.value, flatOptions.value, keyOf),
  )

  const hasModelInOptions = computed(() => {
    if (options.multiple())
      return false
    return flatOptions.value.some(o => sameValue(o.value, modelSingle.value))
  })

  const displayLabel = computed<string>(() => {
    if (options.multiple()) {
      if (!selectedValues.value.length)
        return ''
      return selectedValues.value
        .map(v => flatOptions.value.find(o => sameValue(o.value, v))?.label ?? keyOf(v))
        .join(', ')
    }

    return flatOptions.value.find(o => sameValue(o.value, modelSingle.value))?.label ?? String(modelSingle.value)
  })

  const displayText = computed(() => {
    if (hasSelection.value)
      return displayLabel.value
    return options.placeholder() ?? ''
  })

  return {
    optionsResolved,
    flatOptions,
    isOptionGroup,
    keyOf,
    sameValue,
    modelSingle,
    modelMultiple,
    selectedValues,
    hasSelection,
    fromDomValue,
    selectedOptions,
    hasModelInOptions,
    displayLabel,
    displayText,
  }
}
