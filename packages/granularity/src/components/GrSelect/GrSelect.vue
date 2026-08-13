<script setup lang="ts" generic="TValue extends GrSelectValue = string">
import { computed, nextTick, ref, useId, useSlots, watch } from 'vue'

import { usePortalTarget } from '../../composables/usePortalTarget'

import { useGrComponentProp, useGrComponentSize, useGrThemeAttrs } from '../GrConfigProvider/context'

import GrBadge from '../GrBadge/GrBadge.vue'
import type { GrBadgeRadius, GrBadgeSize, GrBadgeTone } from '../GrBadge/grBadgeStyles'
import GrInput from '../GrInput/GrInput.vue'
import { vClickOutside } from '../../directives'
import { useFloating } from '../../composables/useFloating'
import { useDismissible } from '../../composables/useDismissible'
import { useGranularityTranslations } from '../../internal/granularityI18n'
import { useGrFormFieldContext } from '../GrFormField/context'
import { useGrFormControl } from '../../composables/useGrFormControl'
import { useFocusWithin } from '../../composables/internal/useFocusWithin'
import { useControlAddons } from '../../composables/internal/useControlAddons'
import { useControlledOpen } from '../../composables/internal/useControlledOpen'
import { useSelectPanelItems } from './composables/useSelectPanelItems'
import { useSelectNavigation } from './composables/useSelectNavigation'
import { useSelectVirtualization } from './composables/useSelectVirtualization'
import { useSelectValues } from './composables/useSelectValues'
import { isEmptySelectValue } from './selectValue'

import {
  defaultBaseClass,
  grSelectLinkNativeLabelClass,
  grSelectLinkNativeOverlayClass,
  grSelectNativeClass,
  grSelectOptionClass,
  grSelectPanelClasses,
  grSelectTriggerClass,
  linkBaseClass,
  type GrSelectState,
  type GrSelectModelValue,
  type GrSelectValue,
  type GrSelectOption,
  type GrSelectOptionOrGroup,
  type GrSelectOptionsView,
  type GrSelectSize,
  type GrSelectUnderline,
  type GrSelectVariant,
  type GrSelectView,
} from './grSelectStyles'

import IconCheck from '~icons/lucide/check'
import IconChevronDown from '~icons/lucide/chevron-down'
import IconLoaderCircle from '~icons/lucide/loader-circle'
import IconX from '~icons/lucide/x'

export type {
  GrSelectModelValue,
  GrSelectOption,
  GrSelectOptionGroup,
  GrSelectOptionOrGroup,
  GrSelectOptionsView,
  GrSelectSize,
  GrSelectState,
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
  /**
   * Визуальный оттенок рамки: `default | success | warning | danger`. `invalid`
   * сильнее — ошибка перекрывает любую другую подсветку. В `view="link"` рамки
   * нет, и состояние туда не применяется.
   */
  state?: GrSelectState
  /**
   * Имя поля-идентификатора, когда значения опций — объекты. Без него объекты
   * сравнивались бы по ссылке, и пришедшая снаружи копия с тем же `id` не
   * совпала бы ни с одной опцией.
   */
  valueKey?: string
  /** Обязательное поле (`aria-required`). */
  required?: boolean
  ariaLabel?: string
  view?: GrSelectView
  size?: GrSelectSize
  /** Placeholder (показывается, когда значение не выбрано). */
  placeholder?: string
  /** Multiple selection. */
  multiple?: boolean
  /**
   * Вид чипов выбранных значений в режиме `multiple`. Чип — это `GrBadge`: своя
   * плашка на светлой теме почти не отличалась от фона поля.
   */
  tagTone?: GrBadgeTone
  tagDark?: boolean
  tagSize?: GrBadgeSize
  tagRadius?: GrBadgeRadius
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
  /**
   * Виртуализация панели: в DOM живёт только окно вокруг вьюпорта. Высоту окна
   * задаёт `dropdownMaxHeight`.
   *
   * Только для `optionsView="panel"`: у нативного `<select>` панели нет вовсе.
   * Несовместим с `view="link"` — там ширина панели равна ширине отрисованной
   * опции и прыгала бы при прокрутке.
   */
  virtual?: boolean
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
  /**
   * Контролируемое состояние панели (`v-model:open`). Без пропа панель ведёт
   * себя сама (uncontrolled), с ним — слушайте `update:open` и меняйте проп.
   * Только для `optionsView="panel"`: у нативного `<select>` панель браузерная.
   */
  open?: boolean
  /**
   * Имя для нативной формы: в native-режиме уходит на сам `<select>`, в
   * panel-режиме значения сериализуются hidden-инпутами (ключ — `keyOf`).
   */
  name?: string
  /**
   * Ширины аддонов `prefix`/`suffix` — общий контракт контролов пакета
   * (`docs/form-controls.md`). Аддоны живут в панельном триггере: внутрь
   * нативного `<select>` разметку положить нельзя.
   */
  prefixMinWidth?: string
  prefixMaxWidth?: string
  suffixMinWidth?: string
  suffixMaxWidth?: string
  prefixFixed?: boolean
  suffixFixed?: boolean
}

export interface GrSelectEmits<TValue extends GrSelectValue = string> {
  (e: 'update:modelValue', value: GrSelectModelValue<TValue>): void
  /** Значение изменилось — тот же payload, что у `update:modelValue`. */
  (e: 'change', value: GrSelectModelValue<TValue>): void
  /** Значение снято кнопкой очистки. */
  (e: 'clear'): void
  /** Панель открылась/закрылась (`v-model:open`). */
  (e: 'update:open', value: boolean): void
  /** Текст поиска как контролируемое значение (`v-model:search`). */
  (e: 'update:search', value: string): void
  (e: 'focus', event: FocusEvent): void
  (e: 'blur', event: FocusEvent): void
  /** Пользователь набрал запрос — сигнал сходить за опциями. */
  (e: 'search', value: string): void
}

const props = withDefaults(
  defineProps<GrSelectProps<TValue>>(),
  {
    options: undefined,
    disabled: false,
    readonly: false,
    invalid: false,
    state: 'default',
    valueKey: undefined,
    required: false,
    ariaLabel: undefined,
    view: 'default',
    size: undefined,

    placeholder: undefined,
    multiple: false,
    tagTone: 'neutral',
    tagDark: false,
    tagSize: 'sm',
    tagRadius: 'round',

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
    virtual: false,
    closeOnSelect: true,
    maxTagCount: undefined,
    clearable: undefined,
    clearLabel: undefined,
    variant: undefined,
    underline: undefined,
    open: undefined,
    name: undefined,
    prefixMinWidth: undefined,
    prefixMaxWidth: undefined,
    suffixMinWidth: undefined,
    suffixMaxWidth: undefined,
    prefixFixed: false,
    suffixFixed: false,
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

const emit = defineEmits<GrSelectEmits<TValue>>()
defineSlots<{
  /** Собственные `<option>` для нативного режима. */
  default?: () => any
  /** Аддон слева в панельном триггере (в нативном режиме недоступен). */
  prefix?: () => any
  /** Аддон справа в панельном триггере, перед крестиком и шевроном. */
  suffix?: () => any
  /** Отображение значения в триггере вместо текста по умолчанию. */
  value?: (props: {
    selectedOptions: GrSelectOption<TValue>[]
    selectedValues: TValue[]
    displayLabel: string
    placeholder?: string
    hasSelection: boolean
  }) => any
  /** Строка списка вместо подписи опции. */
  option?: (props: { option: GrSelectOption<TValue>, selected: boolean }) => any
  /** Содержимое панели, пока едут опции. */
  loading?: () => any
  /** Содержимое панели, когда подходящих опций нет. */
  empty?: () => any
}>()


// Fallback из контекста `GrFormField` (id/aria-describedby/invalid/required)
// для связки с лейблом и сообщением об ошибке.
const field = useGrFormFieldContext()
const resolvedId = computed(() => field?.id.value)
const {
  disabled: isDisabled,
  invalid: isInvalid, required: isRequired, readonly: isReadonly } = useGrFormControl(() => props)

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

const {
  optionsResolved,
  flatOptions,
  isOptionGroup,
  keyOf,
  sameValue,
  modelSingle,
  selectedValues,
  hasSelection,
  fromDomValue,
  selectedOptions,
  hasModelInOptions,
  displayLabel,
  displayText,
} = useSelectValues<TValue>({
  modelValue: () => props.modelValue,
  options: () => props.options,
  multiple: () => props.multiple,
  valueKey: () => props.valueKey,
  placeholder: () => props.placeholder,
})

const ADDON_MIN_WIDTH_BY_SIZE: Record<GrSelectSize, string> = {
  xs: '2rem',
  sm: '2.25rem',
  md: '2.5rem',
  lg: '3rem',
}

/**
 * Триггер панельного режима — флекс-строка, поэтому аддоны встают её соседями,
 * а не поверх поля: резервировать место паддингом не нужно.
 */
const {
  hasPrefix,
  hasSuffix,
  prefixEl,
  suffixEl,
  prefixLen,
  prefixStyle,
  suffixStyle,
} = useControlAddons(() => props, {
  defaultMinWidth: () => ADDON_MIN_WIDTH_BY_SIZE[resolvedSize.value],
  paddingX: () => '0px',
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

// Имя `open` сохранено: все читатели — шаблон, watch, `useDismissible`/
// `useFloating` — работают с computed-Ref как раньше.
const { open, setOpen } = useControlledOpen(
  () => props.open,
  next => emit('update:open', next),
)

const rootEl = ref<HTMLElement | null>(null)
const panelEl = ref<HTMLElement | null>(null)
const listboxEl = ref<HTMLElement | null>(null)

// Панель телепортирована в `body`, то есть лежит вне корня, но для пользователя
// она часть контрола: без неё уход фокуса в панель читался бы как `blur`.
const { onFocusIn, onFocusOut } = useFocusWithin(rootEl, {
  enter: event => emit('focus', event),
  leave: event => emit('blur', event),
  containers: () => [panelEl.value],
})
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
  setOpen(false)
}

const locked = computed(() => isDisabled.value || isReadonly.value)

function toggleDropdown(): void {
  if (locked.value) return
  setOpen(!open.value)
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

const { panelItems, panelRows, canAddCustom } = useSelectPanelItems<TValue>({
  optionsResolved,
  flatOptions,
  isOptionGroup,
  modelSingle,
  selectedValues,
  hasModelInOptions,
  sameValue,
  query: () => customValue.value,
  allowCustomValue: () => props.allowCustomValue,
  filterable: () => props.filterable,
  multiple: () => props.multiple,
  isPanelView: () => effectiveOptionsView.value === 'panel',
})

function emitValue(value: GrSelectModelValue<TValue>): void {
  if (isReadonly.value) return

  emit('update:modelValue', value)
  emit('change', value)
}

function isSelected(value: TValue): boolean {
  return selectedValues.value.some(selected => sameValue(selected, value))
}

function isOptionDisabled(value: TValue): boolean {
  return flatOptions.value.find(o => sameValue(o.value, value))?.disabled === true
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
  const idx = next.findIndex(selected => sameValue(selected, value))
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
  // Кнопка чипа держит объект из `options`, модель — свою копию: сравнение
  // только через ключ, `!==` не удалил бы ничего.
  emitValue(selectedValues.value.filter(v => !sameValue(v, value)))
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

/**
 * Id опции строится от позиции в списке: значение с пробелом дало бы невалидный
 * `id`, а `aria-activedescendant` — два токена вместо одной ссылки.
 */
function optionDomId(index: number): string {
  return `${listboxId}-opt-${index}`
}

/** Заголовок группы читается вместе с опцией — через `aria-describedby`. */
function groupLabelId(groupKey: string): string {
  return `${listboxId}-${groupKey}`
}

const {
  virtualEnabled,
  addOffset,
  scrollToIndex: scrollVirtualToIndex,
  measure: measureVirtualRow,
  optionSetProps,
  addOptionSetProps,
  showAddOption,
  renderedPanelRows,
  listboxStyle,
} = useSelectVirtualization<TValue>({
  panelItems,
  panelRows,
  canAddCustom,
  listboxEl,
  enabled: () => props.virtual && effectiveOptionsView.value === 'panel',
  maxHeight: () => props.dropdownMaxHeight,
})

if (import.meta.env?.DEV) {
  const slots = useSlots()

  watch(
    () => [Boolean(slots.prefix || slots.suffix), effectiveOptionsView.value] as const,
    ([hasAddon, view]) => {
      if (hasAddon && view !== 'panel') {
        console.warn(
          '[granularity] GrSelect: слоты `prefix`/`suffix` работают только с '
          + '`optionsView="panel"` — внутрь нативного `<select>` разметку положить нельзя.',
        )
      }
    },
    { immediate: true },
  )

  watch(
    () => [props.virtual, effectiveOptionsView.value, props.view] as const,
    ([virtual, view, appearance]) => {
      if (!virtual) return

      if (view !== 'panel') {
        console.warn(
          '[granularity] GrSelect: `virtual` работает только с `optionsView="panel"` — '
          + 'у нативного `<select>` своей панели нет, и виртуализировать нечего.',
        )
      }
      else if (appearance === 'link') {
        console.warn(
          '[granularity] GrSelect: `virtual` не сочетается с `view="link"` — ширина панели '
          + 'там равна ширине отрисованной опции и будет прыгать при прокрутке.',
        )
      }
    },
    { immediate: true },
  )
}

/** При `loading` списка в DOM нет — ссылаться на него нельзя. */
const listboxIdIfRendered = computed(() => (open.value && !props.loading ? listboxId : undefined))

function openDropdown(): void {
  if (locked.value || open.value) return
  setOpen(true)
}

const {
  activeIndex,
  activeItem,
  activeValue,
  addOptionDomId,
  triggerActiveDescendant,
  searchActiveDescendant,
  onOptionHover,
  onComboKeydown,
  initActiveIndex,
  resetActive,
} = useSelectNavigation<TValue>({
  panelItems,
  flatOptions,
  canAddCustom,
  sameValue,
  isSelected,
  open,
  locked,
  showSearchInput,
  virtualEnabled,
  addOffset,
  listboxId,
  optionDomId,
  scrollVirtualToIndex,
  openDropdown,
  closeDropdown,
  addCustom,
  toggleValue,
})

watch(
  open,
  async (isOpen, wasOpen) => {
    if (!isOpen) {
      internalSearch.value = ''
      resetActive()

      // Панель с полем поиска забирает фокус себе; на закрытии поле исчезает, и
      // без возврата фокус уезжает на `<body>` — клавиатурный пользователь
      // оказывается в начале документа. Возвращаем только если фокус ещё внутри
      // панели: пользователь мог уйти дальше сам.
      //
      // `wasOpen` отсекает первый вызов (`immediate: true`): на сервере DOM нет,
      // да и красть фокус при монтировании компонент не должен.
      if (wasOpen) {
        const active = document.activeElement
        if (active instanceof HTMLElement && panelEl.value?.contains(active))
          focus()
      }

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
  return !flatOptions.value.some(o => isEmptySelectValue(o.value))
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
    disabled: isDisabled.value,
    variant: resolvedVariant.value,
    underline: resolvedUnderline.value,
    showNativeChevron: showNativeChevron.value,
    state: props.state,
    invalid: isInvalid.value,
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
  disabled: isDisabled.value,
}))

const linkNativeDisplayText = computed(() => {
  return displayText.value || props.placeholder || '\u00A0'
})

const triggerClassName = computed(() => {
  return grSelectTriggerClass({
    view: props.view,
    optionsView: effectiveOptionsView.value,
    size: resolvedSize.value,
    disabled: isDisabled.value,
    variant: resolvedVariant.value,
    underline: resolvedUnderline.value,
    state: props.state,
    invalid: isInvalid.value,
  })
})

function onChange(e: Event): void {
  const el = e.target as HTMLSelectElement

  // Нативного `readonly` у `<select>` нет: браузер уже переключил значение —
  // возвращаем DOM к модели, иначе форма отправит непринятое (приём GrCheckbox).
  if (isReadonly.value) {
    if (props.multiple) {
      for (const option of el.options) option.selected = isSelected(fromDomValue(option.value))
    }
    else {
      el.value = modelSingle.value === '' ? '' : keyOf(modelSingle.value)
    }
    return
  }

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
const { target: portalTarget, enabled: teleportEnabled } = usePortalTarget()

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
     @focusin="onFocusIn"
    @focusout="onFocusOut"
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
      :name="name"
      :multiple="multiple"
      :disabled="isDisabled"
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
        <option v-if="nativeCustomOptionVisible" :value="keyOf(modelSingle)" :selected="!multiple">
          {{ modelSingle }}
        </option>
        <template v-for="(item, index) in optionsResolved" :key="index">
          <optgroup v-if="isOptionGroup(item)" :label="item.label">
            <option
              v-for="opt in item.options"
              :key="`${index}:${keyOf(opt.value)}`"
              :value="keyOf(opt.value)"
              :selected="isSelected(opt.value)"
              :disabled="opt.disabled"
            >
              {{ opt.label }}
            </option>
          </optgroup>
          <option
            v-else
            :value="keyOf(item.value)"
            :selected="isSelected(item.value)"
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
      <IconChevronDown class="block h-4 w-4" aria-hidden="true" />
    </span>
  </div>

  <div
    v-else
    ref="rootEl"
    v-click-outside="{ handler: closeDropdown, enabled: open, exclude: clickOutsideExclude }"
    data-gr-select
    :class="rootClass"
  >
    <!-- Нативная форма: панельный режим сериализуется hidden-инпутами по keyOf. -->
    <template v-if="name">
      <input
        v-for="value in selectedValues"
        :key="`hidden-${keyOf(value)}`"
        type="hidden"
        :name="name"
        :value="keyOf(value)"
      >
    </template>
    <button
      :id="resolvedId"
      ref="triggerButtonEl"
      data-testid="gr-select-trigger"
      data-gr-select-trigger
      type="button"
      :disabled="isDisabled"
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
      <span
        v-if="hasPrefix"
        ref="prefixEl"
        data-gr-select-prefix
        class="shrink-0 inline-flex items-center justify-center text-[var(--gr-muted-fg)] select-none truncate"
        :style="prefixStyle"
        aria-hidden="true"
      >
        <slot name="prefix" />
      </span>

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

      <span
        v-if="hasSuffix"
        ref="suffixEl"
        data-gr-select-suffix
        class="shrink-0 inline-flex items-center justify-center text-[var(--gr-muted-fg)] select-none truncate"
        :style="suffixStyle"
        aria-hidden="true"
      >
        <slot name="suffix" />
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
        <IconChevronDown class="block h-4 w-4" aria-hidden="true" />
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
      :style="{ left: hasPrefix ? prefixLen : undefined }"
    >
      <GrBadge
        v-for="opt in visibleTagOptions"
        :key="keyOf(opt.value)"
        data-gr-select-tag
        class="pointer-events-auto"
        :tone="tagTone"
        :dark="tagDark"
        :size="tagSize"
        :radius="tagRadius"
      >
        <span class="inline-flex max-w-full items-center gap-1 align-middle">
          <span class="truncate">{{ opt.label }}</span>
          <button
            v-if="!isDisabled && !isReadonly"
            data-gr-select-tag-remove
            type="button"
            :aria-label="tagRemoveLabel(opt)"
            class="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-[var(--gr-radius-xs)] text-current focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)]"
            @click.stop="removeValue(opt.value)"
          >
            <IconX class="block h-3 w-3" aria-hidden="true" />
          </button>
        </span>
      </GrBadge>

      <GrBadge
        v-if="hiddenTagCount > 0"
        data-gr-select-tag-rest
        class="pointer-events-auto"
        :tone="tagTone"
        :dark="tagDark"
        :size="tagSize"
        :radius="tagRadius"
      >
        +{{ hiddenTagCount }}
      </GrBadge>
    </div>

    <button
      v-if="panelClearVisible"
      data-testid="gr-select-clear"
      data-gr-select-clear
      type="button"
      class="absolute top-1/2 right-8 h-6 w-6 -translate-y-1/2 inline-flex items-center justify-center rounded-[var(--gr-radius-md)] text-[var(--gr-muted-fg)] hover:bg-[color-mix(in_srgb,var(--gr-muted)_25%,transparent)] hover:text-[var(--gr-fg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)]"
      :disabled="isDisabled"
      :aria-label="resolvedClearLabel"
      @click.stop="clearSelection"
    >
      <IconX class="inline-block h-4 w-4" aria-hidden="true" />
    </button>

    <teleport :to="portalTarget" :disabled="!teleportEnabled">
      <transition
        enter-active-class="transition ease-[var(--gr-ease-out)] duration-[var(--gr-duration-fast)]"
        enter-from-class="transform opacity-0 scale-95"
        enter-to-class="transform opacity-100 scale-100"
        leave-active-class="transition ease-[var(--gr-ease-in)] duration-[var(--gr-duration-fast)]"
        leave-from-class="transform opacity-100 scale-100"
        leave-to-class="transform opacity-0 scale-95"
      >
        <div
          v-show="open"
          ref="panelEl"
          data-testid="gr-select-panel"
          v-bind="themeAttrs"
          data-gr-select-panel
          data-gr-overlay-root
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
              aria-live="polite"
            >
              <slot name="loading">
                <IconLoaderCircle class="block h-4 w-4 animate-spin" aria-hidden="true" />
                <span>{{ resolvedLoadingText }}</span>
              </slot>
            </div>

            <div
              v-else
              :id="listboxId"
              ref="listboxEl"
              data-gr-select-listbox
              :data-gr-virtual="virtualEnabled ? '' : undefined"
              class="p-1 overflow-auto"
              :class="virtualEnabled ? 'flex flex-col' : ''"
              :style="listboxStyle"
              role="listbox"
              :aria-multiselectable="multiple ? 'true' : undefined"
            >
              <!--
                Прямые потомки listbox — только опции и группы: роль объявляет
                остальных недопустимыми детьми (`aria-required-children`).
                `mousedown.prevent` держит фокус на триггере или в поле поиска —
                контракт combobox с `aria-activedescendant`.
              -->
              <button
                v-if="showAddOption"
                :id="addOptionDomId"
                data-testid="gr-select-add-option"
                data-gr-select-add-option
                type="button"
                role="option"
                aria-selected="false"
                tabindex="-1"
                v-bind="addOptionSetProps"
                :class="grSelectOptionClass({ view, disabled: false, active: activeItem?.kind === 'add' })"
                @mousedown.prevent
                @click="addCustom"
                @mousemove="activeIndex = 0"
              >
                {{ t('gr.select.addOption', 'Add "{value}"', { value: customValue.trim() }) }}
              </button>

              <template v-for="row in renderedPanelRows" :key="row.key">
                <!--
                  Группа: заголовок внутри неё и даёт ей имя. При виртуализации
                  окно может начаться ниже заголовка — тогда его в DOM нет, и
                  имя группы идёт напрямую в `aria-label`.
                -->
                <div
                  v-if="row.kind === 'group'"
                  data-gr-select-group
                  role="group"
                  :class="virtualEnabled ? 'flex flex-col' : ''"
                  :aria-labelledby="virtualEnabled ? undefined : groupLabelId(row.key)"
                  :aria-label="virtualEnabled ? row.label : undefined"
                >
                  <div
                    v-if="row.labelVisible !== false"
                    :id="groupLabelId(row.key)"
                    :ref="(el) => virtualEnabled && row.labelIndex !== undefined && measureVirtualRow(row.labelIndex + addOffset, el as Element | null)"
                    data-gr-select-group-label
                    role="presentation"
                    class="px-3 pt-2 pb-1 text-[length:var(--gr-text-xs)] font-semibold uppercase tracking-wide text-[var(--gr-muted-fg)]" :class="[
                      view === 'link' ? 'block min-w-full w-max whitespace-nowrap' : '',
                    ]"
                  >
                    {{ row.label }}
                  </div>

                  <button
                    v-for="child in row.options"
                    :id="optionDomId(child.index)"
                    :key="child.key"
                    :ref="(el) => virtualEnabled && measureVirtualRow(child.index + addOffset, el as Element | null)"
                    data-gr-select-option
                    type="button"
                    role="option"
                    tabindex="-1"
                    v-bind="optionSetProps(child.index)"
                    :disabled="child.option.disabled"
                    :aria-selected="isSelected(child.option.value) ? 'true' : 'false'"
                    :aria-disabled="child.option.disabled ? 'true' : undefined"
                    :class="grSelectOptionClass({
                      view,
                      disabled: !!child.option.disabled,
                      active: activeValue === child.option.value,
                    })"
                    @mousedown.prevent
                    @click="toggleValue(child.option.value)"
                    @mousemove="onOptionHover(child.index)"
                  >
                    <slot name="option" :option="child.option" :selected="isSelected(child.option.value)">
                      <span class="flex items-center gap-2 min-w-0">
                        <span class="inline-block h-4 w-4 shrink-0" aria-hidden="true">
                          <IconCheck
                            v-if="isSelected(child.option.value)"
                            class="block h-4 w-4 text-[var(--gr-primary)]"
                          />
                        </span>
                        <span class="truncate">{{ child.option.label }}</span>
                      </span>
                    </slot>
                  </button>
                </div>

                <button
                  v-else
                  :id="optionDomId(row.index)"
                  :ref="(el) => virtualEnabled && measureVirtualRow(row.index + addOffset, el as Element | null)"
                  data-gr-select-option
                  type="button"
                  role="option"
                  tabindex="-1"
                  v-bind="optionSetProps(row.index)"
                  :disabled="row.option.disabled"
                  :aria-selected="isSelected(row.option.value) ? 'true' : 'false'"
                  :aria-disabled="row.option.disabled ? 'true' : undefined"
                  :class="grSelectOptionClass({
                    view,
                    disabled: !!row.option.disabled,
                    active: activeValue === row.option.value,
                  })"
                  @mousedown.prevent
                  @click="toggleValue(row.option.value)"
                  @mousemove="onOptionHover(row.index)"
                >
                  <slot name="option" :option="row.option" :selected="isSelected(row.option.value)">
                    <span class="flex items-center gap-2 min-w-0">
                      <span class="inline-block h-4 w-4 shrink-0" aria-hidden="true">
                        <IconCheck
                          v-if="isSelected(row.option.value)"
                          class="block h-4 w-4 text-[var(--gr-primary)]"
                        />
                      </span>
                      <span class="truncate">{{ row.option.label }}</span>
                    </span>
                  </slot>
                </button>
              </template>
            </div>

            <!--
              Пустой результат живёт вне listbox — и объявляется, а не молчит:
              `aria-label` на generic-элементе диктор игнорирует.
            -->
            <div
              v-if="!loading && !panelItems.length && !canAddCustom"
              data-gr-select-empty
              class="px-3 py-4 text-center text-[length:var(--gr-text-sm)] text-[var(--gr-muted-fg)]"
              role="status"
              aria-live="polite"
            >
              <slot name="empty">
                {{ resolvedNoResultsText }}
              </slot>
            </div>
          </div>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<style scoped>
/*
 * Распорки виртуальной панели.
 *
 * Не `padding` контейнера: `max-height` меряет ту же коробку. Не обёртка внутри
 * listbox'а: прямыми потомками роли обязаны быть только опции и группы. Не
 * отступы крайних строк: при прыжке прокрутки строки заменяются целиком, и
 * распорка исчезла бы вместе с ними.
 *
 * Псевдоэлементы не узлы DOM: размонтировать нечего, детьми роли не считаются,
 * а высота приезжает переменными в том же патче, что и строки.
 */
[data-gr-virtual]::before,
[data-gr-virtual]::after {
    content: '';
    display: block;
    flex: none;
}

[data-gr-virtual]::before {
    height: var(--gr-virtual-before, 0px);
}

[data-gr-virtual]::after {
    height: var(--gr-virtual-after, 0px);
}
</style>
