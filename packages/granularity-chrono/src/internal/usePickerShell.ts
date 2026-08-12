import type { ComputedRef, Ref } from 'vue'
import { computed, nextTick, ref, watch } from 'vue'

import type { UseFloatingPlacement } from '@feugene/granularity/composables/useFloating'
import { useGrComponentProp, useGrComponentSize } from '@feugene/granularity/composables/useGrComponentConfig'
import { useGranularityTranslations } from '@feugene/granularity/composables/useGranularityTranslations'
import { useGrFormControl } from '@feugene/granularity/composables/useGrFormControl'

import type { GrChronoAdapter, GrChronoAdapterName } from '../chrono/chronoModel'
import { resolveChronoAdapter } from '../chrono/chronoModel'
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
export type GrPickerComponent = 'GrDatePicker' | 'GrTimePicker'

export interface PickerShellProps<TValue> {
  modelValue?: TValue
  valueAdapter?: GrChronoAdapterName | GrChronoAdapter<TValue>
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

export interface UsePickerShellOptions<TValue> {
  /** Геттер пропов пикера — геттер, чтобы не терять реактивность на `props`. */
  props: () => PickerShellProps<TValue>
  component: GrPickerComponent
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

export interface UsePickerShellReturn<TValue> {
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
  adapter: ComputedRef<GrChronoAdapter<TValue>>
  /** Значение модели, разобранное адаптером. Невалидное — `null`. */
  selectedDate: ComputedRef<Date | null>
  /** Сериализованное значение для нативной формы. */
  formValue: ComputedRef<string>
  panelOpen: Ref<boolean>
  /** Панель уже открывали — значит она смонтирована. */
  hasBeenOpen: Ref<boolean>
  fieldEl: Ref<HTMLInputElement | null>
  showClear: ComputedRef<boolean>
  openPanel: () => void
  closePanel: () => void
  togglePanel: () => void
  onFieldKeydown: (event: KeyboardEvent) => void
  /** Отдать значение наружу (`update:modelValue` + `change`). */
  commit: (date: Date) => void
  clear: () => void
  focus: () => void
  blur: () => void
}

export function usePickerShell<TValue>(
  options: UsePickerShellOptions<TValue>,
): UsePickerShellReturn<TValue> {
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

  const adapter = computed(() => resolveChronoAdapter<TValue>(props().valueAdapter))

  const selectedDate = computed<Date | null>(() => {
    const value = props().modelValue
    if (value === undefined || value === null) return null

    return adapter.value.parse(value)
  })

  /** Форме уходит сериализованное значение: показ локале-зависим и на сервере не разбирается. */
  const formValue = computed(() => {
    if (!selectedDate.value) return ''
    const serialized = adapter.value.serialize(selectedDate.value)

    return serialized instanceof Date ? serialized.toISOString() : String(serialized)
  })

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
  const hasBeenOpen = ref(false)

  const fieldEl = ref<HTMLInputElement | null>(null)

  /**
   * Монтирование и перенос фокуса висят на самом состоянии, а не на обработчике
   * открытия: панель открывают и снаружи, через `v-model:open`, и такой вызов
   * обязан привести к тому же, что и клик по полю.
   */
  watch(panelOpen, async (next) => {
    if (!next) return

    hasBeenOpen.value = true

    // Два тика: первый монтирует панель, второй отдаёт ей отрисованное содержимое.
    await nextTick()
    await nextTick()
    options.focusPanel()
  }, { immediate: true })

  function openPanel(): void {
    if (isDisabled.value || panelOpen.value) return

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

  function commit(date: Date): void {
    if (isLocked.value) return

    options.emit.model(adapter.value.serialize(date))
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
    resolvedClearable.value && !isLocked.value && selectedDate.value !== null
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
    adapter,
    selectedDate,
    formValue,
    panelOpen,
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
