import type { ComputedRef, Ref } from 'vue'
import { computed, nextTick, ref, watch } from 'vue'

import type { UseFloatingPlacement } from '@feugene/granularity/composables/useFloating'
import { useGrComponentProp, useGrComponentSize } from '@feugene/granularity/composables/useGrComponentConfig'
import { useGranularityTranslations } from '@feugene/granularity/composables/useGranularityTranslations'
import { useGrFormControl } from '@feugene/granularity/composables/useGrFormControl'

import type { GrChronoAdapter } from '../chrono/chronoModel'
import type { GrPickerSize } from './pickerFieldStyles'

/**
 * Оболочка «поле + панель», общая для пикеров пакета.
 *
 * Вынесена, когда второй пикер повторил её дословно: контракт форм-контрола,
 * `v-model:open`, ленивое монтирование панели, клавиатура поля, очистка,
 * сериализация значения для нативной формы. Различаются пикеры содержимым
 * панели и тем, как значение показывается, — это и остаётся в компонентах.
 *
 * Композабл, а не компонент-обёртка: разметку поля пикеры пишут у себя, и
 * тогда их классы попадают в собственный чанк, то есть в область скана
 * `content.filesystem`. Общие классы живут в `pickerFieldStyles` и оттуда
 * перечисляются в safelist каждого пикера.
 */

/** Компоненты пакета, у которых есть оболочка. Расширяется вместе с семейством. */
export type GrPickerComponent = 'GrDatePicker' | 'GrTimePicker' | 'GrDateTimePicker' | 'GrDateRangePicker'

/**
 * Перевод между моделью потребителя и тем, чем оперирует панель.
 *
 * Понадобился на диапазоне: у него модель — пара границ, а не одно значение,
 * и адаптер применяется к каждой отдельно. Оболочке при этом всё равно, что
 * внутри, — ей нужно лишь знать, пусто ли значение и что отдать нативной форме.
 */
export interface PickerCodec<TValue, TParsed> {
  /** Из модели в рабочее значение. Невалидное — `null`, а не исключение. */
  parse: (raw: TValue) => TParsed | null
  serialize: (parsed: TParsed) => TValue
  /**
   * Значения для скрытых полей формы. Массив, потому что диапазон уходит двумя
   * полями с одним именем — так его читает `FormData.getAll`.
   */
  toFormValues: (parsed: TParsed) => string[]
}

function serializedToString(value: unknown): string {
  return value instanceof Date ? value.toISOString() : String(value)
}

/** Кодек одиночного значения: ровно то, что делает адаптер. */
export function dateCodec<TValue>(adapter: GrChronoAdapter<TValue>): PickerCodec<TValue, Date> {
  return {
    parse: raw => adapter.parse(raw),
    serialize: date => adapter.serialize(date),
    toFormValues: date => [serializedToString(adapter.serialize(date))],
  }
}

/**
 * Кодек набора: адаптер применяется к каждому элементу.
 *
 * Терпимость та же, что у диапазона: неразобравшийся элемент выпадает, а не
 * рушит весь набор. Массив приходит из хранилища и с сервера, и одна испорченная
 * дата не повод потерять остальные — по той же причине, по которой `parseLayout`
 * у дашборда отдаёт `null` вместо исключения.
 */
export function multipleCodec<TItem>(
  adapter: GrChronoAdapter<TItem>,
): PickerCodec<readonly TItem[] | null, Date[]> {
  return {
    parse: (raw) => {
      if (!Array.isArray(raw)) return null

      // `Array.isArray` сужает до `any[]` и теряет тип элемента: возвращаем его
      // явной аннотацией, иначе адаптер получает `any`.
      const items: readonly TItem[] = raw
      const parsed = items.map(item => adapter.parse(item)).filter((date): date is Date => date !== null)

      return parsed.length > 0 ? parsed : null
    },
    serialize: dates => dates.map(date => adapter.serialize(date)),
    toFormValues: dates => dates.map(date => serializedToString(adapter.serialize(date))),
  }
}

/** Кодек диапазона: адаптер применяется к каждой границе, обе обязательны. */
export function rangeCodec<TItem>(
  adapter: GrChronoAdapter<TItem>,
): PickerCodec<readonly [TItem, TItem] | null, [Date, Date]> {
  return {
    parse: (raw) => {
      if (!Array.isArray(raw) || raw.length !== 2) return null

      const from = adapter.parse(raw[0])
      const to = adapter.parse(raw[1])

      return from && to ? [from, to] : null
    },
    serialize: ([from, to]) => [adapter.serialize(from), adapter.serialize(to)] as const,
    toFormValues: ([from, to]) => [
      serializedToString(adapter.serialize(from)),
      serializedToString(adapter.serialize(to)),
    ],
  }
}

export interface PickerShellProps<TValue> {
  modelValue?: TValue
  /** Панель рисуется на месте: ни поля, ни поповера. */
  inline?: boolean
  clearable?: boolean
  open?: boolean
  placement?: UseFloatingPlacement
  teleportTo?: string | HTMLElement
  size?: GrPickerSize
  locale?: string
  id?: string
  name?: string
  disabled?: boolean
  readonly?: boolean
  invalid?: boolean
  required?: boolean
  loading?: boolean
  ariaLabel?: string
}

export interface UsePickerShellOptions<TValue, TParsed = Date> {
  /** Геттер пропов пикера — геттер, чтобы не терять реактивность на `props`. */
  props: () => PickerShellProps<TValue>
  component: GrPickerComponent
  /**
   * Перевод модели в рабочее значение. Геттер, потому что зависит от пропа
   * `valueAdapter`, а собирает его пикер: только он знает, применяется адаптер
   * к одному значению или к каждой границе пары.
   */
  codec: () => PickerCodec<TValue, TParsed>
  emit: {
    open: (value: boolean) => void
    model: (value: TValue | null) => void
    clear: () => void
  }
  /**
   * Увести фокус внутрь раскрытой панели. Зовётся после того, как панель
   * смонтирована и отрисована: до этого фокусировать нечего.
   */
  focusPanel: () => void
}

export interface UsePickerShellReturn<TParsed = Date> {
  t: ReturnType<typeof useGranularityTranslations>['t']
  resolvedSize: ComputedRef<GrPickerSize>
  resolvedPlacement: ComputedRef<UseFloatingPlacement>
  resolvedLocale: ComputedRef<string>
  isDisabled: ComputedRef<boolean>
  isInvalid: ComputedRef<boolean>
  isRequired: ComputedRef<boolean>
  isReadonly: ComputedRef<boolean>
  /** Ввод не принимается: `disabled` или `readonly`. */
  isLocked: ComputedRef<boolean>
  inputId: ComputedRef<string | undefined>
  describedBy: ComputedRef<string | undefined>
  /** Значение модели, разобранное кодеком. Невалидное — `null`. */
  selected: ComputedRef<TParsed | null>
  /** Сериализованные значения для скрытых полей формы. */
  formValues: ComputedRef<string[]>
  panelOpen: Ref<boolean>
  /**
   * Панель на экране: открыта либо нарисована на месте. Именно это, а не
   * `panelOpen`, отвечает на вопрос «видит ли пользователь содержимое».
   */
  panelVisible: ComputedRef<boolean>
  /** Панель уже открывали — значит она смонтирована. */
  hasBeenOpen: Ref<boolean>
  fieldEl: Ref<HTMLInputElement | null>
  showClear: ComputedRef<boolean>
  /** `moveFocus = false` оставляет фокус в поле: см. саму функцию. */
  openPanel: (moveFocus?: boolean) => void
  closePanel: () => void
  togglePanel: () => void
  onFieldKeydown: (event: KeyboardEvent) => void
  /** Отдать значение наружу (`update:modelValue` + `change`). */
  commit: (value: TParsed) => void
  clear: () => void
  focus: () => void
  blur: () => void
}

export function usePickerShell<TValue, TParsed = Date>(
  options: UsePickerShellOptions<TValue, TParsed>,
): UsePickerShellReturn<TParsed> {
  const props = options.props
  const { t, locale: i18nLocale } = useGranularityTranslations()

  const resolvedSize = useGrComponentSize<GrPickerSize>(() => props().size, { component: options.component })
  const resolvedClearable = useGrComponentProp(options.component, 'clearable', () => props().clearable, false)
  const resolvedPlacement = useGrComponentProp(options.component, 'placement', () => props().placement, 'bottom-start')
  const resolvedLocale = computed(() => props().locale ?? i18nLocale.value ?? 'en')

  const {
    disabled: isDisabled,
    invalid: isInvalid,
    required: isRequired,
    readonly: isReadonly,
    locked: isLocked,
    id: fieldId,
    describedBy,
  } = useGrFormControl(props)

  const inputId = computed(() => props().id ?? fieldId.value)

  const codec = computed<PickerCodec<TValue, TParsed>>(() => options.codec())

  const selected = computed<TParsed | null>(() => {
    const value = props().modelValue
    if (value === undefined || value === null) return null

    return codec.value.parse(value)
  })

  /** Форме уходит сериализованное значение: показ локале-зависим и на сервере не разбирается. */
  const formValues = computed(() => (selected.value ? codec.value.toFormValues(selected.value) : []))

  const internalOpen = ref(false)

  const panelOpen = computed({
    get: () => props().open ?? internalOpen.value,
    set: (value) => {
      internalOpen.value = value
      options.emit.open(value)
    },
  })

  /**
   * Панель монтируется при первом открытии и остаётся.
   *
   * `GrPopover` держит содержимое в `v-show`, то есть без этого флага сетка на
   * 42 ячейки создавалась бы на загрузке страницы у каждого пикера в форме.
   * Размонтировать на закрытие нельзя: содержимое исчезло бы рывком посреди
   * анимации ухода.
   */
  const hasBeenOpen = ref(Boolean(props().inline))

  const panelVisible = computed(() => Boolean(props().inline) || panelOpen.value)

  const fieldEl = ref<HTMLInputElement | null>(null)

  const focusPanelOnOpen = ref(true)

  /**
   * Монтирование и перенос фокуса висят на самом состоянии, а не на обработчике
   * открытия: панель открывают и снаружи, через `v-model:open`, и такой вызов
   * обязан привести к тому же, что и клик по полю.
   */
  watch(panelOpen, async (next) => {
    if (!next) return

    hasBeenOpen.value = true

    // В `inline` панель и так на экране: уводить в неё фокус без действия
    // пользователя значит забирать его у страницы на монтировании.
    if (props().inline) return

    // Однократное «не забирай фокус»: следующее открытие снова обычное, каким
    // бы способом оно ни пришло.
    const moveFocus = focusPanelOnOpen.value
    focusPanelOnOpen.value = true
    if (!moveFocus) return

    // Два тика: первый монтирует панель, второй отдаёт ей отрисованное содержимое.
    await nextTick()
    await nextTick()
    options.focusPanel()
  }, { immediate: true })

  /**
   * Клик в **редактируемое** поле открывает панель, но фокус обязан остаться в
   * поле: пользователь пришёл печатать, а не выбирать мышью, и уехавший на
   * втором тике фокус съел бы набранное. Клавиатурное открытие (`↓`) —
   * наоборот: оно ровно и значит «уведи меня в сетку».
   */
  function openPanel(moveFocus = true): void {
    if (isDisabled.value || panelOpen.value || props().inline) return

    focusPanelOnOpen.value = moveFocus
    panelOpen.value = true
  }

  function closePanel(): void {
    panelOpen.value = false
  }

  /**
   * Поповер открывается вручную (`trigger="manual"`): переключение висит здесь,
   * потому что открытие обязано ещё и увести фокус внутрь панели.
   */
  function togglePanel(): void {
    panelOpen.value ? closePanel() : openPanel()
  }

  function onFieldKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
      // Иначе `Space` прокрутит страницу, а `Enter` отправит форму.
      event.preventDefault()
      openPanel()
    }
  }

  function commit(value: TParsed): void {
    if (isLocked.value) return

    options.emit.model(codec.value.serialize(value))
  }

  function clear(): void {
    if (isLocked.value) return

    options.emit.model(null)
    options.emit.clear()
  }

  function focus(): void {
    fieldEl.value?.focus()
  }

  function blur(): void {
    fieldEl.value?.blur()
  }

  const showClear = computed(() => (
    resolvedClearable.value && !isLocked.value && selected.value !== null
  ))

  return {
    t,
    resolvedSize,
    resolvedPlacement,
    resolvedLocale,
    isDisabled,
    isInvalid,
    isRequired,
    isReadonly,
    isLocked,
    inputId,
    describedBy,
    selected,
    formValues,
    panelOpen,
    panelVisible,
    hasBeenOpen,
    fieldEl,
    showClear,
    openPanel,
    closePanel,
    togglePanel,
    onFieldKeydown,
    commit,
    clear,
    focus,
    blur,
  }
}
