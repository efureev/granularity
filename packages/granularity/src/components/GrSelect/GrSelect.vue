<script setup lang="ts" generic="TValue extends GrSelectValue = string">
import { computed, nextTick, onBeforeUnmount, ref, useId, watch } from 'vue'

import { useTeleportEnabled } from '../../composables/internal/useTeleportEnabled'

import { useGrComponentProp, useGrComponentSize, useGrThemeAttrs } from '../GrConfigProvider/context'

import GrInput from '../GrInput/GrInput.vue'
import { vClickOutside } from '../../directives'
import { useFloating } from '../../composables/useFloating'
import { useDismissible } from '../../composables/useDismissible'
import { useGranularityTranslations } from '../../internal/granularityI18n'
import { useGrFormFieldContext } from '../GrFormField/context'
import { useGrFormControl } from '../../composables/useGrFormControl'

import {
  defaultBaseClass,
  grSelectLinkNativeLabelClass,
  grSelectLinkNativeOverlayClass,
  grSelectNativeClass,
  grSelectPanelClasses,
  grSelectTriggerClass,
  linkBaseClass,
  type GrSelectModelValue,
  type GrSelectValue,
  type GrSelectOption,
  type GrSelectOptionGroup,
  type GrSelectOptionOrGroup,
  type GrSelectOptionsView,
  type GrSelectSize,
  type GrSelectUnderline,
  type GrSelectVariant,
  type GrSelectView,
} from './grSelectStyles'

export type {
  GrSelectModelValue,
  GrSelectOption,
  GrSelectOptionGroup,
  GrSelectOptionOrGroup,
  GrSelectOptionsView,
  GrSelectSize,
  GrSelectUnderline,
  GrSelectValue,
  GrSelectVariant,
  GrSelectView,
} from './grSelectStyles'

/**
 * Пропсы публичного GR-примитива «Select».
 */
export interface GrSelectProps<TValue extends GrSelectValue = string> {
  modelValue: GrSelectModelValue<TValue>
  /** Список опций. Поддерживает плоский массив опций и группы опций (`{ label, options }`). */
  options?: GrSelectOptionOrGroup<TValue>[]
  disabled?: boolean
  /** Только для чтения: значение видно и уходит в форму, но не меняется. */
  readonly?: boolean
  /** Визуальное и ARIA-состояние ошибки. */
  invalid?: boolean
  /** Обязательное поле (`aria-required`). */
  required?: boolean
  ariaLabel?: string
  view?: GrSelectView
  size?: GrSelectSize
  /** Placeholder (показывается, когда значение не выбрано). */
  placeholder?: string
  /** Multiple selection. */
  multiple?: boolean
  /** Как отображать список опций: нативный `<select>` или кастомная панель. */
  optionsView?: GrSelectOptionsView
  /** Разрешает ввод/выбор значения, которого нет в `options`. */
  allowCustomValue?: boolean
  /**
   * Поиск/фильтрация опций по вводу (независимо от `allowCustomValue`). Показывает
   * поле поиска над списком и фильтрует опции. Работает только в `optionsView="panel"`
   * (при `native` панель форсится автоматически).
   */
  filterable?: boolean
  /** Placeholder поля поиска (`filterable`). i18n: fallback `gr.select.searchPlaceholder`. */
  filterPlaceholder?: string
  /**
   * Текст поиска как контролируемое значение (`v-model:search`). Без него
   * `loading` был декоративным: набранное пользователем наружу не выходило, и
   * сходить за опциями на сервер было не с чем.
   */
  search?: string
  /**
   * Состояние загрузки: вместо списка опций панель показывает индикатор загрузки.
   * Полезно для удалённой подгрузки опций. Форсит `optionsView="panel"`.
   */
  loading?: boolean
  /** Текст индикатора загрузки. i18n: fallback `gr.select.loading`. */
  loadingText?: string
  /** Текст пустого результата фильтрации. i18n: fallback `gr.select.noResults`. */
  noResultsText?: string
  /**
   * Режим тегов для `multiple`: выбранные значения показываются как удаляемые
   * chips в триггере (вместо строки «a, b, c»). Форсит `optionsView="panel"`.
   */
  tags?: boolean
  /** Placeholder для инпута кастомного значения (только в `optionsView="panel"`). i18n-friendly: если не задан — берётся из адаптера перевода (`gr.select.customValuePlaceholder`), иначе — встроенный fallback. */
  customValuePlaceholder?: string
  /** Максимальная высота панели (только в `optionsView="panel"`). */
  dropdownMaxHeight?: number
  /** Закрывать панель после выбора (только в `optionsView="panel"`). */
  closeOnSelect?: boolean
  /** Сколько chips показать до сворачивания в «+N» (только `tags`). */
  maxTagCount?: number
  /** Разрешает очистку выбранного значения. */
  clearable?: boolean
  /** i18n-label для кнопки очистки (`aria-label`). */
  clearLabel?: string
  /**
   * Цвет/вариант ссылки для `view="link"` (аналогично `GrLink`).
   * В `view="default"` не используется.
   */
  variant?: GrSelectVariant
  /**
   * Подчёркивание для `view="link"` (аналогично `GrLink`).
   * В `view="default"` не используется.
   */
  underline?: GrSelectUnderline
}

const props = withDefaults(
  defineProps<GrSelectProps<TValue>>(),
  {
    options: undefined,
    disabled: false,
    readonly: false,
    invalid: false,
    required: false,
    ariaLabel: undefined,
    view: 'default',
    size: undefined,

    placeholder: undefined,
    multiple: false,

    optionsView: 'native',
    allowCustomValue: false,
    filterable: false,
    filterPlaceholder: undefined,
    search: undefined,
    loading: false,
    loadingText: undefined,
    noResultsText: undefined,
    tags: false,
    customValuePlaceholder: undefined,
    dropdownMaxHeight: 280,
    closeOnSelect: true,
    maxTagCount: undefined,
    clearable: undefined,
    clearLabel: undefined,
    variant: undefined,
    underline: undefined,
  },
)

// Эффективный размер: локальный проп → `GrConfigProvider` → дефолт компонента.
const resolvedSize = useGrComponentSize(() => props.size, { component: 'GrSelect' })
const resolvedVariant = useGrComponentProp('GrSelect', 'variant', () => props.variant, 'primary')
const resolvedUnderline = useGrComponentProp('GrSelect', 'underline', () => props.underline, 'auto')
const resolvedClearable = useGrComponentProp('GrSelect', 'clearable', () => props.clearable, false)

const { t } = useGranularityTranslations()

const resolvedCustomValuePlaceholder = computed(() => {
  return props.customValuePlaceholder ?? t('gr.select.customValuePlaceholder', 'Add value…')
})

const resolvedClearLabel = computed(() => props.clearLabel ?? t('gr.common.clear', 'Clear'))
const resolvedFilterPlaceholder = computed(() => props.filterPlaceholder ?? t('gr.select.searchPlaceholder', 'Search…'))
const resolvedLoadingText = computed(() => props.loadingText ?? t('gr.select.loading', 'Loading…'))
const resolvedNoResultsText = computed(() => props.noResultsText ?? t('gr.select.noResults', 'No results'))
// В search-инпуте: при allowCustomValue — «Add value…», иначе (чистый filterable) — «Search…».
const resolvedSearchPlaceholder = computed(() =>
  props.allowCustomValue ? resolvedCustomValuePlaceholder.value : resolvedFilterPlaceholder.value,
)

const baseClassName = computed(() => props.view === 'link' ? linkBaseClass : defaultBaseClass)

const rootClass = computed(() => props.view === 'link' ? 'relative inline-block align-baseline' : 'relative w-full')

const emit = defineEmits<{
  (e: 'update:modelValue', value: GrSelectModelValue<TValue>): void
  /** Значение изменилось — тот же payload, что у `update:modelValue`. */
  (e: 'change', value: GrSelectModelValue<TValue>): void
  /** Значение снято кнопкой очистки. */
  (e: 'clear'): void
  /** Панель открылась/закрылась. */
  (e: 'visibleChange', visible: boolean): void
  /** Текст поиска как контролируемое значение (`v-model:search`). */
  (e: 'update:search', value: string): void
  /** Пользователь набрал запрос — сигнал сходить за опциями. */
  (e: 'search', value: string): void
}>()

// Fallback из контекста `GrFormField` (id/aria-describedby/invalid/required)
// для связки с лейблом и сообщением об ошибке.
const field = useGrFormFieldContext()
const resolvedId = computed(() => field?.id.value)
const { invalid: isInvalid, required: isRequired, readonly: isReadonly } = useGrFormControl(() => props)

const nativeSelectEl = ref<HTMLSelectElement | null>(null)
const triggerButtonEl = ref<HTMLElement | null>(null)

// Виджет зависит от режима: нативный `<select>` или кастомный триггер панели.
function focus(): void {
  (nativeSelectEl.value ?? triggerButtonEl.value)?.focus()
}

function blur(): void {
  (nativeSelectEl.value ?? triggerButtonEl.value)?.blur()
}

defineExpose({ focus, blur })
const describedBy = computed(() => field?.describedById.value)

const optionsResolved = computed<GrSelectOptionOrGroup<TValue>[]>(() => props.options ?? [])

function isOptionGroup(item: GrSelectOptionOrGroup<TValue>): item is GrSelectOptionGroup<TValue> {
  return Array.isArray((item as GrSelectOptionGroup).options)
}

/** Плоский список всех опций (группы «развёрнуты»). Используется для всех вычислений по значениям. */
const flatOptions = computed<GrSelectOption<TValue>[]>(() => {
  const result: GrSelectOption<TValue>[] = []
  for (const item of optionsResolved.value) {
    if (isOptionGroup(item)) result.push(...item.options)
    else result.push(item)
  }
  return result
})

/**
 * `0` — валидное значение, поэтому «пусто» проверяется явно, а не через falsy:
 * прежняя проверка `if (!value)` теряла ноль вместе с пустой строкой.
 */
function isEmptyValue(value: unknown): boolean {
  return value === undefined || value === null || value === ''
}

function modelToArray(value: GrSelectModelValue<TValue>): TValue[] {
  if (Array.isArray(value)) return value
  if (isEmptyValue(value)) return []
  return [value]
}

const modelSingle = computed<TValue | ''>(() => {
  const raw = Array.isArray(props.modelValue) ? props.modelValue[0] : props.modelValue
  return isEmptyValue(raw) ? '' : (raw as TValue)
})

const modelMultiple = computed(() => modelToArray(props.modelValue))

const selectedValues = computed(() => {
  return props.multiple ? modelMultiple.value : (isEmptyValue(modelSingle.value) ? [] : [modelSingle.value as TValue])
})

const hasSelection = computed(() => selectedValues.value.length > 0)

/**
 * Нативный `<select>` хранит в `option.value` строку, поэтому значение,
 * вернувшееся из DOM, нужно восстановить в исходный тип. Карта строится по
 * опциям: `String(value)` — ключ, само значение — результат.
 */
const valueByDomKey = computed<Map<string, TValue>>(() => {
  const map = new Map<string, TValue>()
  for (const option of flatOptions.value) map.set(String(option.value), option.value)
  return map
})

/** Восстанавливает типизированное значение из строки, пришедшей из DOM. */
function fromDomValue(raw: string): TValue {
  const known = valueByDomKey.value.get(raw)
  if (known !== undefined) return known
  // Значения нет среди опций — это `allowCustomValue`, а он по природе строковый.
  return raw as TValue
}

const selectedOptions = computed<GrSelectOption<TValue>[]>(() => {
  const byValue = new Map(flatOptions.value.map(o => [o.value, o]))
  return selectedValues.value.map(v => byValue.get(v) ?? { value: v, label: String(v) })
})

const hasModelInOptions = computed(() => {
  if (props.multiple) return false
  return flatOptions.value.some((o) => o.value === modelSingle.value)
})

const displayLabel = computed(() => {
  if (props.multiple) {
    if (!selectedValues.value.length) return ''
    return selectedValues.value
      .map((v) => flatOptions.value.find((o) => o.value === v)?.label ?? v)
      .join(', ')
  }

  return flatOptions.value.find((o) => o.value === modelSingle.value)?.label ?? modelSingle.value
})

const displayText = computed(() => {
  if (hasSelection.value) return displayLabel.value
  return props.placeholder ?? ''
})

// Нативный `<select multiple>` — это многострочный listbox, а не поповер. В режиме
// `view="link"` он рендерится невидимым overlay'ем, из-за чего multiple-вариант «не
// открывается» (клик по невидимому listbox'у ничего не показывает). Для этой
// неподдерживаемой комбинации форсим кастомную панель, которая корректно открывается.
const effectiveOptionsView = computed<GrSelectOptionsView>(() => {
  if (props.view === 'link' && props.multiple && props.optionsView === 'native')
    return 'panel'
  // Поиск/загрузка/теги невозможны в нативном `<select>` — форсим кастомную панель.
  if ((props.filterable || props.loading || props.tags) && props.optionsView === 'native')
    return 'panel'
  return props.optionsView
})

// Поле поиска в панели: показываем при `filterable` ИЛИ `allowCustomValue`.
const showSearchInput = computed(() =>
  (props.filterable || props.allowCustomValue) && effectiveOptionsView.value === 'panel',
)

// Показывать chips вместо строки «a, b, c» (только multiple + tags).
const showTags = computed(() => props.multiple && props.tags && effectiveOptionsView.value === 'panel')

const nativeCustomOptionVisible = computed(() => {
  if (!props.allowCustomValue) return false
  if (effectiveOptionsView.value !== 'native') return false
  if (props.multiple) return false
  if (!props.options) return false
  if (modelSingle.value === '') return false
  return !hasModelInOptions.value
})

/**
 * Текст поиска: контролируемый `search` сильнее внутреннего состояния. Каждое
 * изменение уходит наружу — без этого `loading` не с чем было связать.
 */
const internalSearch = ref('')
const customValue = computed<string>({
  get: () => props.search ?? internalSearch.value,
  set: (next) => {
    internalSearch.value = next
    emit('update:search', next)
    emit('search', next)
  },
})

const open = ref(false)
const rootEl = ref<HTMLElement | null>(null)
const panelEl = ref<HTMLElement | null>(null)
const customInputRef = ref<InstanceType<typeof GrInput> | null>(null)
const clickOutsideExclude = [() => panelEl.value]

// Для `view='link'` ширина триггера = ширине выбранной опции (`inline-block w-auto`),
// поэтому панель растёт по контенту (`matchWidth: 'min'` → `width: max-content` +
// `min-width` от триггера), а не сжимается до неё. Для `view='default'` панель точно
// повторяет ширину триггера (`matchWidth: true`).
const { floatingStyle, update: updateFloatingPosition } = useFloating(rootEl, panelEl, open, {
  placement: 'bottom-start',
  matchWidth: () => (props.view === 'link' ? 'min' : true),
  zIndexVar: '--gr-z-dropdown',
})

function closeDropdown(): void {
  open.value = false
}

const locked = computed(() => props.disabled || isReadonly.value)

function toggleDropdown(): void {
  if (locked.value) return
  open.value = !open.value
}

useDismissible(open, closeDropdown)

// `view` определяет режим `matchWidth` (см. выше) — пересчитываем позицию/ширину
// панели, если он меняется, пока панель открыта.
watch(
  () => props.view,
  () => {
    if (open.value) updateFloatingPosition()
  },
)

const panelClasses = computed(() => {
  return grSelectPanelClasses
})

function matchesQuery(option: GrSelectOption<TValue>, query: string): boolean {
  if (!query) return true
  return option.label.toLowerCase().includes(query) || String(option.value).toLowerCase().includes(query)
}

/**
 * Элемент рендера панели: либо заголовок группы, либо опция.
 * Группировка сохраняется, фильтрация по `customValue` скрывает пустые группы.
 */
type GrSelectPanelItem<TItemValue extends GrSelectValue> =
  | { kind: 'group', label: string, key: string }
  /** `groupKey` связывает опцию с заголовком её группы для скринридера. */
  | { kind: 'option', option: GrSelectOption<TItemValue>, key: string, groupKey?: string }

const panelItems = computed<GrSelectPanelItem<TValue>[]>(() => {
  const q = (props.allowCustomValue || props.filterable) ? customValue.value.trim().toLowerCase() : ''
  const items: GrSelectPanelItem<TValue>[] = []

  // Опция для кастомного значения, которого нет в options (single).
  if (props.allowCustomValue && !props.multiple && modelSingle.value !== '' && !hasModelInOptions.value) {
    const custom: GrSelectOption<TValue> = { value: modelSingle.value as TValue, label: String(modelSingle.value) }
    if (matchesQuery(custom, q)) {
      items.push({ kind: 'option', option: custom, key: `__custom__${custom.value}` })
    }
  }

  optionsResolved.value.forEach((item, index) => {
    if (isOptionGroup(item)) {
      const matched = item.options.filter((o) => matchesQuery(o, q))
      if (!matched.length) return
      const groupKey = `__group__${index}`
      items.push({ kind: 'group', label: item.label, key: groupKey })
      for (const option of matched) {
        // Ключ с индексом группы — одинаковое `value` в разных группах больше не даёт дубликат.
        items.push({ kind: 'option', option, key: `${index}:${option.value}`, groupKey })
      }
      return
    }

    if (matchesQuery(item, q)) {
      items.push({ kind: 'option', option: item, key: `${index}:${item.value}` })
    }
  })

  return items
})

const canAddCustom = computed(() => {
  if (!props.allowCustomValue) return false
  if (effectiveOptionsView.value !== 'panel') return false
  // Кастомное значение набирается текстом, поэтому оно строковое —
  // при числовом `TValue` эта ветка неприменима (см. docs/components.md).
  const v = customValue.value.trim() as TValue
  if (!v) return false

  if (props.multiple) {
    if (selectedValues.value.includes(v)) return false
    return !flatOptions.value.some((o) => o.value === v)
  }

  if (v === modelSingle.value) return false
  return !flatOptions.value.some((o) => o.value === v)
})

function emitValue(value: GrSelectModelValue<TValue>): void {
  if (isReadonly.value) return

  emit('update:modelValue', value)
  emit('change', value)
}

function isSelected(value: TValue): boolean {
  return selectedValues.value.includes(value)
}

function isOptionDisabled(value: TValue): boolean {
  return flatOptions.value.find(o => o.value === value)?.disabled === true
}

function selectValue(value: TValue): void {
  emitValue(value)
  if (props.closeOnSelect) {
    closeDropdown()
  }
}

function toggleValue(value: TValue): void {
  if (isOptionDisabled(value)) return

  if (!props.multiple) {
    selectValue(value)
    return
  }

  const next = selectedValues.value.slice()
  const idx = next.indexOf(value)
  if (idx >= 0) {
    next.splice(idx, 1)
  }
  else {
    next.push(value)
  }

  emitValue(next)
  if (props.closeOnSelect) {
    closeDropdown()
  }
}

function addCustom(): void {
  // Кастомное значение набирается текстом, поэтому оно строковое —
  // при числовом `TValue` эта ветка неприменима (см. docs/components.md).
  const v = customValue.value.trim() as TValue
  if (!v) return
  toggleValue(v)
}

// Удаление одного значения из multiple-выбора (клик по «×» на chip).
function removeValue(value: TValue): void {
  if (locked.value) return
  if (!props.multiple) return
  emitValue(selectedValues.value.filter(v => v !== value))
}

const visibleTagOptions = computed(() => {
  const limit = props.maxTagCount
  if (limit === undefined || limit < 0) return selectedOptions.value
  return selectedOptions.value.slice(0, limit)
})

const hiddenTagCount = computed(() => selectedOptions.value.length - visibleTagOptions.value.length)

function tagRemoveLabel(option: GrSelectOption<TValue>): string {
  return t('gr.select.removeTag', 'Remove {label}', { label: option.label })
}

// ————— Клавиатурная навигация комбобокса (WAI-ARIA, aria-activedescendant).
const listboxId = useId()
const activeIndex = ref(-1)

function optionDomId(value: GrSelectValue): string {
  return `${listboxId}-opt-${value}`
}

/** Заголовок группы читается вместе с опцией — через `aria-describedby`. */
function groupLabelId(groupKey: string): string {
  return `${listboxId}-${groupKey}`
}

// Навигируемые (видимые, не-disabled) опции панели в порядке рендера.
const navigableValues = computed<TValue[]>(() =>
  panelItems.value
    .filter((item): item is Extract<GrSelectPanelItem<TValue>, { kind: 'option' }> => item.kind === 'option' && !item.option.disabled)
    .map(item => item.option.value),
)

const activeValue = computed(() => (activeIndex.value >= 0 ? navigableValues.value[activeIndex.value] : undefined))
const activeDescendantId = computed(() =>
  open.value && activeValue.value !== undefined ? optionDomId(activeValue.value) : undefined,
)

/**
 * `aria-activedescendant` работает только на элементе, который держит фокус.
 * С полем поиска фокус уходит в него, поэтому связка с активной опцией живёт
 * там же; на триггере она осталась бы немой.
 */
const triggerActiveDescendant = computed(() => (showSearchInput.value ? undefined : activeDescendantId.value))
const searchActiveDescendant = computed(() => (showSearchInput.value ? activeDescendantId.value : undefined))

/** При `loading` списка в DOM нет — ссылаться на него нельзя. */
const listboxIdIfRendered = computed(() => (open.value && !props.loading ? listboxId : undefined))

function clampActive(index: number): number {
  const len = navigableValues.value.length
  if (len === 0) return -1
  return ((index % len) + len) % len
}

async function scrollActiveIntoView(): Promise<void> {
  await nextTick()
  const value = activeValue.value
  if (value === undefined) return
  const el = document.getElementById(optionDomId(value))
  el?.scrollIntoView?.({ block: 'nearest' })
}

function setActive(index: number): void {
  activeIndex.value = clampActive(index)
  void scrollActiveIntoView()
}

function initActiveIndex(): void {
  const selectedIdx = navigableValues.value.findIndex(v => isSelected(v))
  activeIndex.value = selectedIdx >= 0 ? selectedIdx : (navigableValues.value.length ? 0 : -1)
}

function openDropdown(): void {
  if (locked.value || open.value) return
  open.value = true
}

let typeaheadBuffer = ''
let typeaheadTimer: ReturnType<typeof setTimeout> | null = null
function typeahead(char: string): void {
  typeaheadBuffer += char.toLowerCase()
  if (typeaheadTimer) clearTimeout(typeaheadTimer)
  typeaheadTimer = setTimeout(() => { typeaheadBuffer = '' }, 600)

  const idx = navigableValues.value.findIndex((v) => {
    const opt = flatOptions.value.find(o => o.value === v)
    return opt?.label.toLowerCase().startsWith(typeaheadBuffer)
  })
  if (idx >= 0) setActive(idx)
}

function onComboKeydown(event: KeyboardEvent): void {
  if (locked.value) return

  if (!open.value) {
    if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
      event.preventDefault()
      openDropdown()
    }
    return
  }

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      setActive(activeIndex.value + 1)
      break
    case 'ArrowUp':
      event.preventDefault()
      setActive(activeIndex.value - 1)
      break
    case 'Home':
      event.preventDefault()
      setActive(0)
      break
    case 'End':
      event.preventDefault()
      setActive(navigableValues.value.length - 1)
      break
    case 'Enter':
      event.preventDefault()
      if (props.allowCustomValue && canAddCustom.value)
        addCustom()
      else if (activeValue.value !== undefined)
        toggleValue(activeValue.value)
      break
    case 'Tab':
      closeDropdown()
      break
    default:
      // typeahead — только когда нет поля ввода (иначе мешает вводу в search/custom-инпут).
      if (!showSearchInput.value && event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey)
        typeahead(event.key)
  }
}

watch(open, isOpen => emit('visibleChange', isOpen))

onBeforeUnmount(() => {
  // Висячий таймер после размонтирования: буфер typeahead живёт 600 мс.
  if (typeaheadTimer) clearTimeout(typeaheadTimer)
})

watch(
  open,
  async (isOpen) => {
    if (!isOpen) {
      internalSearch.value = ''
      activeIndex.value = -1
      return
    }

    initActiveIndex()

    if (showSearchInput.value) {
      await nextTick()
      customInputRef.value?.focus()
    }
  },
  { immediate: true },
)

const showNativeChevron = computed(() => {
  return effectiveOptionsView.value === 'native' && props.view !== 'link' && !props.multiple
})

const nativeClearOptionVisible = computed(() => {
  if (!resolvedClearable.value) return false
  if (effectiveOptionsView.value !== 'native') return false
  if (props.multiple) return false
  if (!props.options) return true
  return !flatOptions.value.some(o => o.value === '')
})

const panelClearVisible = computed(() => {
  if (!resolvedClearable.value) return false
  if (effectiveOptionsView.value !== 'panel') return false
  if (props.view === 'link') return false
  return hasSelection.value
})

const nativeClassName = computed(() => {
  return grSelectNativeClass({
    view: props.view,
    size: resolvedSize.value,
    disabled: props.disabled,
    variant: resolvedVariant.value,
    underline: resolvedUnderline.value,
    showNativeChevron: showNativeChevron.value,
  })
})

/**
 * `view="link"` в native-режиме: ширина обёртки должна определяться выбранной опцией,
 * а не самой длинной (как делает браузер по умолчанию). Поэтому рендерим прозрачный
 * `<select>`-overlay поверх видимого `<span>` с меткой — overlay принимает клики/клавиатуру,
 * span задаёт ширину компонента в закрытом состоянии.
 */
const isLinkNative = computed(() => props.view === 'link' && effectiveOptionsView.value === 'native')

const linkNativeLabelClassName = computed(() => grSelectLinkNativeLabelClass({
  size: resolvedSize.value,
  variant: resolvedVariant.value,
  underline: resolvedUnderline.value,
  disabled: props.disabled,
}))

const linkNativeDisplayText = computed(() => {
  return displayText.value || props.placeholder || '\u00A0'
})

const triggerClassName = computed(() => {
  return grSelectTriggerClass({
    view: props.view,
    optionsView: effectiveOptionsView.value,
    size: resolvedSize.value,
    disabled: props.disabled,
    variant: resolvedVariant.value,
    underline: resolvedUnderline.value,
  })
})

function onChange(e: Event): void {
  const el = e.target as HTMLSelectElement

  if (props.multiple) {
    emit('update:modelValue', Array.from(el.selectedOptions, o => fromDomValue(o.value)))
    return
  }

  // Пустая строка — это «очистить», а не значение: восстанавливать её не нужно.
  emit('update:modelValue', (el.value === '' ? '' : fromDomValue(el.value)) as TValue)
}

function clearSelection(): void {
  if (locked.value) return
  emitValue((props.multiple ? [] : '') as GrSelectModelValue<TValue>)
  emit('clear')
}

// Телепорт включается только ПОСЛЕ монтирования: иначе первый клиентский
// рендер не совпадает с серверным и ломается гидрация (см. композабл).
const teleportEnabled = useTeleportEnabled()

// Тема поддерева на телепортированную панель: в DOM она уезжает в `body`, то
// есть вне обёртки провайдера, и `data-theme` с неё не наследуется. В дереве
// компонентов панель остаётся внутри — `inject` доходит, и тему она ставит себе
// сама.
const themeAttrs = useGrThemeAttrs()
</script>

<template>
  <div
    v-if="effectiveOptionsView === 'native'"
    data-gr-select
    :class="rootClass"
  >
    <!--
      Выбор задаём per-option через `:selected` (а не `:value` на `<select>`):
      для `<select multiple>` биндинг `:value` массивом не работает — DOM не
      отражает программное изменение модели. `onChange` читает выбор из DOM.
    -->
    <select
      :id="resolvedId"
      ref="nativeSelectEl"
      data-gr-select-native
      :multiple="multiple"
      :disabled="disabled"
      :aria-label="ariaLabel"
      :aria-invalid="isInvalid ? 'true' : undefined"
      :aria-describedby="describedBy"
      :aria-required="isRequired ? 'true' : undefined"
      :aria-readonly="isReadonly ? 'true' : undefined"
      :class="isLinkNative ? grSelectLinkNativeOverlayClass : [baseClassName, nativeClassName]"
      @change="onChange"
    >
      <option v-if="nativeClearOptionVisible" value="" :selected="!multiple && modelSingle === ''">
        {{ placeholder || t('gr.select.clearOption', 'None') }}
      </option>

      <slot>
        <option v-if="nativeCustomOptionVisible" :value="modelSingle" :selected="!multiple">
          {{ modelSingle }}
        </option>
        <template v-for="(item, index) in optionsResolved" :key="index">
          <optgroup v-if="isOptionGroup(item)" :label="item.label">
            <option
              v-for="opt in item.options"
              :key="`${index}:${opt.value}`"
              :value="opt.value"
              :selected="multiple ? modelMultiple.includes(opt.value) : modelSingle === opt.value"
              :disabled="opt.disabled"
            >
              {{ opt.label }}
            </option>
          </optgroup>
          <option
            v-else
            :value="item.value"
            :selected="multiple ? modelMultiple.includes(item.value) : modelSingle === item.value"
            :disabled="item.disabled"
          >
            {{ item.label }}
          </option>
        </template>
      </slot>
    </select>

    <span
      v-if="isLinkNative"
      data-gr-select-link-label
      aria-hidden="true"
      :class="linkNativeLabelClassName"
    >{{ linkNativeDisplayText }}</span>

    <span
      v-if="showNativeChevron"
      data-testid="gr-select-chevron"
      class="absolute top-1/2 -translate-y-1/2 right-3 flex items-center text-[var(--gr-muted-fg)] pointer-events-none"
    >
      <span class="i-lucide-chevron-down block h-4 w-4" aria-hidden="true" />
    </span>
  </div>

  <div
    v-else
    ref="rootEl"
    v-click-outside="{ handler: closeDropdown, enabled: open, exclude: clickOutsideExclude }"
    data-gr-select
    :class="rootClass"
  >
    <button
      :id="resolvedId"
      ref="triggerButtonEl"
      data-testid="gr-select-trigger"
      data-gr-select-trigger
      type="button"
      :disabled="disabled"
      :aria-label="ariaLabel"
      :aria-invalid="isInvalid ? 'true' : undefined"
      :aria-describedby="describedBy"
      :aria-required="isRequired ? 'true' : undefined"
      :aria-readonly="isReadonly ? 'true' : undefined"
      role="combobox"
      aria-haspopup="listbox"
      :aria-controls="listboxIdIfRendered"
      :aria-activedescendant="triggerActiveDescendant"
      :aria-expanded="open ? 'true' : 'false'"
      :aria-busy="loading ? 'true' : undefined"
      :class="[baseClassName, triggerClassName]"
      @click="toggleDropdown"
      @keydown="onComboKeydown"
    >
      <span class="min-w-0 flex-1">
        <slot
          name="value"
          :selected-options="selectedOptions"
          :selected-values="selectedValues"
          :display-label="displayLabel"
          :placeholder="placeholder"
          :has-selection="hasSelection"
        >
          <span
            class="block truncate"
            :class="!hasSelection ? 'text-[var(--gr-muted-fg)]' : ''"
          >
            {{ showTags && hasSelection ? '' : displayText }}
          </span>
        </slot>
      </span>

      <!-- Место под кнопку очистки: она лежит абсолютом поверх триггера. -->
      <span
        v-if="panelClearVisible"
        class="shrink-0 h-4 w-6"
        aria-hidden="true"
      />

      <!-- Шеврон виден всегда: без него поле с выбранным значением переставало
           выглядеть выпадающим списком. -->
      <span
        data-testid="gr-select-chevron"
        class="shrink-0 flex items-center text-[var(--gr-muted-fg)] pointer-events-none"
      >
        <span class="i-lucide-chevron-down block h-4 w-4" aria-hidden="true" />
      </span>
    </button>

    <!--
      Чипы живут РЯДОМ с кнопкой-комбобоксом, а не внутри неё: `role="combobox"`
      объявляет потомков презентационными, и крестик внутри был недостижим с
      клавиатуры (axe: `nested-interactive`).
    -->
    <div
      v-if="showTags && hasSelection"
      data-gr-select-tags
      class="pointer-events-none absolute inset-y-0 left-0 flex max-w-[calc(100%-4rem)] flex-wrap items-center gap-1 px-3 py-1.5"
    >
      <span
        v-for="opt in visibleTagOptions"
        :key="String(opt.value)"
        data-gr-select-tag
        class="pointer-events-auto inline-flex max-w-full items-center gap-1 rounded-[var(--gr-radius-sm)] bg-[var(--gr-muted)] py-0.5 pl-2 pr-1 text-[length:var(--gr-text-xs)] text-[var(--gr-fg)]"
      >
        <span class="truncate">{{ opt.label }}</span>
        <button
          v-if="!disabled && !isReadonly"
          data-gr-select-tag-remove
          type="button"
          :aria-label="tagRemoveLabel(opt)"
          class="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-[var(--gr-radius-xs)] text-[var(--gr-muted-fg)] hover:bg-[color-mix(in_srgb,var(--gr-fg)_12%,transparent)] hover:text-[var(--gr-fg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)]"
          @click.stop="removeValue(opt.value)"
        >
          <span class="i-lucide-x block h-3 w-3" aria-hidden="true" />
        </button>
      </span>

      <span
        v-if="hiddenTagCount > 0"
        data-gr-select-tag-rest
        class="pointer-events-auto inline-flex items-center rounded-[var(--gr-radius-sm)] bg-[var(--gr-muted)] px-2 py-0.5 text-[length:var(--gr-text-xs)] text-[var(--gr-muted-fg)]"
      >+{{ hiddenTagCount }}</span>
    </div>

    <button
      v-if="panelClearVisible"
      data-testid="gr-select-clear"
      data-gr-select-clear
      type="button"
      class="absolute top-1/2 right-8 h-6 w-6 -translate-y-1/2 inline-flex items-center justify-center rounded-[var(--gr-radius-md)] text-[var(--gr-muted-fg)] hover:bg-[color-mix(in_srgb,var(--gr-muted)_25%,transparent)] hover:text-[var(--gr-fg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)]"
      :disabled="disabled"
      :aria-label="resolvedClearLabel"
      @click.stop="clearSelection"
    >
      <span class="i-lucide-x inline-block h-4 w-4" aria-hidden="true" />
    </button>

    <teleport to="body" :disabled="!teleportEnabled">
      <transition
        enter-active-class="transition ease-out duration-150"
        enter-from-class="transform opacity-0 scale-95"
        enter-to-class="transform opacity-100 scale-100"
        leave-active-class="transition ease-in duration-100"
        leave-from-class="transform opacity-100 scale-100"
        leave-to-class="transform opacity-0 scale-95"
      >
        <div
          v-show="open"
          ref="panelEl"
          data-testid="gr-select-panel"
          v-bind="themeAttrs"
          data-gr-select-panel
          :style="floatingStyle"
        >
          <div :class="panelClasses">
            <div v-if="showSearchInput" class="p-2 border-b border-[var(--gr-brd)]">
              <GrInput
                ref="customInputRef"
                v-model="customValue"
                data-testid="gr-select-custom-input"
                data-gr-select-search
                type="text"
                role="combobox"
                aria-haspopup="listbox"
                :aria-expanded="open ? 'true' : 'false'"
                :aria-controls="listboxIdIfRendered"
                :aria-activedescendant="searchActiveDescendant"
                :placeholder="resolvedSearchPlaceholder"
                :loading="loading"
                size="sm"
                @keydown="onComboKeydown"
              />
            </div>

            <!-- Состояние загрузки: вместо списка — индикатор. -->
            <div
              v-if="loading"
              data-gr-select-loading
              class="flex items-center justify-center gap-2 px-3 py-4 text-[length:var(--gr-text-sm)] text-[var(--gr-muted-fg)]"
              role="status"
            >
              <span class="i-lucide-loader-circle block h-4 w-4 animate-spin" aria-hidden="true" />
              <span>{{ resolvedLoadingText }}</span>
            </div>

            <div
              v-else
              :id="listboxId"
              data-gr-select-listbox
              class="p-1 overflow-auto"
              :style="{ maxHeight: `${dropdownMaxHeight}px` }"
              role="listbox"
              :aria-multiselectable="multiple ? 'true' : undefined"
            >
              <button
                v-if="canAddCustom"
                data-testid="gr-select-add-option"
                data-gr-select-add-option
                type="button"
                role="option"
                aria-selected="false"
                class="rounded-[var(--gr-radius-md)] px-3 py-2 text-left text-[length:var(--gr-text-sm)] hover:bg-[color-mix(in_srgb,var(--gr-muted)_30%,transparent)]" :class="[
                  view === 'link' ? 'block min-w-full w-max whitespace-nowrap' : 'w-full',
                ]"
                @click="addCustom"
              >
                {{ t('gr.select.addOption', 'Add "{value}"', { value: customValue.trim() }) }}
              </button>

              <template v-for="item in panelItems" :key="item.key">
                <div
                  v-if="item.kind === 'group'"
                  :id="groupLabelId(item.key)"
                  data-gr-select-group-label
                  role="presentation"
                  class="px-3 pt-2 pb-1 text-[length:var(--gr-text-xs)] font-semibold uppercase tracking-wide text-[var(--gr-muted-fg)]" :class="[
                    view === 'link' ? 'block min-w-full w-max whitespace-nowrap' : '',
                  ]"
                >
                  {{ item.label }}
                </div>

                <button
                  v-else
                  :id="optionDomId(item.option.value)"
                  data-gr-select-option
                  type="button"
                  role="option"
                  :disabled="item.option.disabled"
                  :aria-selected="isSelected(item.option.value) ? 'true' : 'false'"
                  :aria-disabled="item.option.disabled ? 'true' : undefined"
                  :aria-describedby="item.groupKey ? groupLabelId(item.groupKey) : undefined"
                  class="rounded-[var(--gr-radius-md)] px-3 py-2 text-left text-[length:var(--gr-text-sm)]" :class="[
                    view === 'link' ? 'block min-w-full w-max whitespace-nowrap' : 'w-full',
                    item.option.disabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-[color-mix(in_srgb,var(--gr-muted)_30%,transparent)]',
                    activeValue === item.option.value && !item.option.disabled ? 'bg-[color-mix(in_srgb,var(--gr-muted)_30%,transparent)]' : '',
                  ]"
                  @click="toggleValue(item.option.value)"
                  @mousemove="activeIndex = navigableValues.indexOf(item.option.value)"
                >
                  <slot name="option" :option="item.option" :selected="isSelected(item.option.value)">
                    <span class="flex items-center gap-2 min-w-0">
                      <span
                        class="inline-block h-4 w-4 shrink-0"
                        :class="isSelected(item.option.value) ? 'i-lucide-check text-[var(--gr-primary)]' : ''"
                        aria-hidden="true"
                      />
                      <span class="truncate">{{ item.option.label }}</span>
                    </span>
                  </slot>
                </button>
              </template>

              <!-- Пустой результат фильтрации (без add-custom-варианта). -->
              <div
                v-if="!panelItems.length && !canAddCustom"
                data-gr-select-empty
                class="px-3 py-4 text-center text-[length:var(--gr-text-sm)] text-[var(--gr-muted-fg)]"
              >
                {{ resolvedNoResultsText }}
              </div>
            </div>
          </div>
        </div>
      </transition>
    </teleport>
  </div>
</template>
