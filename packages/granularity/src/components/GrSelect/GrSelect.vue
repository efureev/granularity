<script setup lang="ts">
import { computed, nextTick, ref, useId, watch } from 'vue'

import GrInput from '../GrInput/GrInput.vue'
import { vClickOutside } from '../../directives'
import { useFloating } from '../../composables/internal/useFloating'
import { useEscapeToClose } from '../../composables/internal/useEscapeToClose'
import { useGranularityTranslations } from '../../internal/granularityI18n'
import { useGrFormFieldContext } from '../GrFormField/context'

import {
  defaultBaseClass,
  grSelectLinkNativeLabelClass,
  grSelectLinkNativeOverlayClass,
  grSelectNativeClass,
  grSelectPanelClasses,
  grSelectTriggerClass,
  linkBaseClass,
  type GrSelectModelValue,
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
  GrSelectVariant,
  GrSelectView,
} from './grSelectStyles'

/**
 * Пропсы публичного GR-примитива «Select».
 */
export interface GrSelectProps {
  modelValue: GrSelectModelValue
  /** Список опций. Поддерживает плоский массив опций и группы опций (`{ label, options }`). */
  options?: GrSelectOptionOrGroup[]
  disabled?: boolean
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
  defineProps<GrSelectProps>(),
  {
    options: undefined,
    disabled: false,
    ariaLabel: undefined,
    view: 'default',
    size: 'md',

    placeholder: undefined,
    multiple: false,

    optionsView: 'native',
    allowCustomValue: false,
    filterable: false,
    filterPlaceholder: undefined,
    loading: false,
    loadingText: undefined,
    noResultsText: undefined,
    tags: false,
    customValuePlaceholder: undefined,
    dropdownMaxHeight: 280,
    closeOnSelect: true,
    clearable: false,
    clearLabel: undefined,
    variant: 'primary',
    underline: 'auto',
  },
)

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
  (e: 'update:modelValue', value: GrSelectModelValue): void
}>()

// Fallback из контекста `GrFormField` (id/aria-describedby/invalid/required)
// для связки с лейблом и сообщением об ошибке.
const field = useGrFormFieldContext()
const resolvedId = computed(() => field?.id.value)
const isInvalid = computed(() => Boolean(field?.invalid.value))
const describedBy = computed(() => field?.describedById.value)
const isRequired = computed(() => Boolean(field?.required.value))

const optionsResolved = computed<GrSelectOptionOrGroup[]>(() => props.options ?? [])

function isOptionGroup(item: GrSelectOptionOrGroup): item is GrSelectOptionGroup {
  return Array.isArray((item as GrSelectOptionGroup).options)
}

/** Плоский список всех опций (группы «развёрнуты»). Используется для всех вычислений по значениям. */
const flatOptions = computed<GrSelectOption[]>(() => {
  const result: GrSelectOption[] = []
  for (const item of optionsResolved.value) {
    if (isOptionGroup(item)) result.push(...item.options)
    else result.push(item)
  }
  return result
})

function modelToArray(value: GrSelectModelValue): string[] {
  if (Array.isArray(value)) return value
  if (!value) return []
  return [value]
}

const modelSingle = computed(() => {
  return Array.isArray(props.modelValue) ? (props.modelValue[0] ?? '') : props.modelValue
})

const modelMultiple = computed(() => modelToArray(props.modelValue))

const selectedValues = computed(() => {
  return props.multiple ? modelMultiple.value : (modelSingle.value ? [modelSingle.value] : [])
})

const hasSelection = computed(() => selectedValues.value.length > 0)

const selectedOptions = computed<GrSelectOption[]>(() => {
  const byValue = new Map(flatOptions.value.map(o => [o.value, o]))
  return selectedValues.value.map((v) => byValue.get(v) ?? { value: v, label: v })
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

const customValue = ref('')
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

function toggleDropdown(): void {
  if (props.disabled) return
  open.value = !open.value
}

useEscapeToClose(open, closeDropdown)

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

function matchesQuery(option: GrSelectOption, query: string): boolean {
  if (!query) return true
  return option.label.toLowerCase().includes(query) || option.value.toLowerCase().includes(query)
}

/**
 * Элемент рендера панели: либо заголовок группы, либо опция.
 * Группировка сохраняется, фильтрация по `customValue` скрывает пустые группы.
 */
type GrSelectPanelItem =
  | { kind: 'group', label: string, key: string }
  | { kind: 'option', option: GrSelectOption, key: string }

const panelItems = computed<GrSelectPanelItem[]>(() => {
  const q = (props.allowCustomValue || props.filterable) ? customValue.value.trim().toLowerCase() : ''
  const items: GrSelectPanelItem[] = []

  // Опция для кастомного значения, которого нет в options (single).
  if (props.allowCustomValue && !props.multiple && modelSingle.value !== '' && !hasModelInOptions.value) {
    const custom: GrSelectOption = { value: modelSingle.value, label: modelSingle.value }
    if (matchesQuery(custom, q)) {
      items.push({ kind: 'option', option: custom, key: `__custom__${custom.value}` })
    }
  }

  optionsResolved.value.forEach((item, index) => {
    if (isOptionGroup(item)) {
      const matched = item.options.filter((o) => matchesQuery(o, q))
      if (!matched.length) return
      items.push({ kind: 'group', label: item.label, key: `__group__${index}` })
      for (const option of matched) {
        // Ключ с индексом группы — одинаковое `value` в разных группах больше не даёт дубликат.
        items.push({ kind: 'option', option, key: `${index}:${option.value}` })
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
  const v = customValue.value.trim()
  if (!v) return false

  if (props.multiple) {
    if (selectedValues.value.includes(v)) return false
    return !flatOptions.value.some((o) => o.value === v)
  }

  if (v === modelSingle.value) return false
  return !flatOptions.value.some((o) => o.value === v)
})

function emitValue(value: GrSelectModelValue): void {
  emit('update:modelValue', value)
}

function isSelected(value: string): boolean {
  return selectedValues.value.includes(value)
}

function isOptionDisabled(value: string): boolean {
  return flatOptions.value.find(o => o.value === value)?.disabled === true
}

function selectValue(value: string): void {
  emitValue(value)
  if (props.closeOnSelect) {
    closeDropdown()
  }
}

function toggleValue(value: string): void {
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
  const v = customValue.value.trim()
  if (!v) return
  toggleValue(v)
}

// Удаление одного значения из multiple-выбора (клик по «×» на chip).
function removeValue(value: string): void {
  if (props.disabled) return
  if (!props.multiple) return
  emitValue(selectedValues.value.filter(v => v !== value))
}

function tagRemoveLabel(option: GrSelectOption): string {
  return t('gr.select.removeTag', 'Remove {label}', { label: option.label })
}

// ————— Клавиатурная навигация комбобокса (WAI-ARIA, aria-activedescendant).
const listboxId = useId()
const activeIndex = ref(-1)

function optionDomId(value: string): string {
  return `${listboxId}-opt-${value}`
}

// Навигируемые (видимые, не-disabled) опции панели в порядке рендера.
const navigableValues = computed<string[]>(() =>
  panelItems.value
    .filter((item): item is Extract<GrSelectPanelItem, { kind: 'option' }> => item.kind === 'option' && !item.option.disabled)
    .map(item => item.option.value),
)

const activeValue = computed(() => (activeIndex.value >= 0 ? navigableValues.value[activeIndex.value] : undefined))
const activeDescendantId = computed(() =>
  open.value && activeValue.value !== undefined ? optionDomId(activeValue.value) : undefined,
)

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
  if (props.disabled || open.value) return
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
  if (props.disabled) return

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

watch(
  open,
  async (isOpen) => {
    if (!isOpen) {
      customValue.value = ''
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
  if (!props.clearable) return false
  if (effectiveOptionsView.value !== 'native') return false
  if (props.multiple) return false
  if (!props.options) return true
  return !flatOptions.value.some(o => o.value === '')
})

const panelClearVisible = computed(() => {
  if (!props.clearable) return false
  if (effectiveOptionsView.value !== 'panel') return false
  if (props.view === 'link') return false
  return hasSelection.value
})

const nativeClassName = computed(() => {
  return grSelectNativeClass({
    view: props.view,
    size: props.size,
    disabled: props.disabled,
    variant: props.variant,
    underline: props.underline,
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
  size: props.size,
  variant: props.variant,
  underline: props.underline,
  disabled: props.disabled,
}))

const linkNativeDisplayText = computed(() => {
  return displayText.value || props.placeholder || '\u00A0'
})

const triggerClassName = computed(() => {
  return grSelectTriggerClass({
    view: props.view,
    optionsView: effectiveOptionsView.value,
    size: props.size,
    disabled: props.disabled,
    variant: props.variant,
    underline: props.underline,
  })
})

function onChange(e: Event): void {
  const el = e.target as HTMLSelectElement

  if (props.multiple) {
    const values = Array.from(el.selectedOptions, o => o.value)
    emit('update:modelValue', values)
    return
  }

  emit('update:modelValue', el.value)
}

function clearSelection(): void {
  if (props.disabled) return
  emitValue(props.multiple ? [] : '')
}
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
      data-gr-select-native
      :multiple="multiple"
      :disabled="disabled"
      :aria-label="ariaLabel"
      :aria-invalid="isInvalid ? 'true' : undefined"
      :aria-describedby="describedBy"
      :aria-required="isRequired ? 'true' : undefined"
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
      data-testid="gr-select-trigger"
      data-gr-select-trigger
      type="button"
      :disabled="disabled"
      :aria-label="ariaLabel"
      :aria-invalid="isInvalid ? 'true' : undefined"
      :aria-describedby="describedBy"
      :aria-required="isRequired ? 'true' : undefined"
      role="combobox"
      aria-haspopup="listbox"
      :aria-controls="open ? listboxId : undefined"
      :aria-activedescendant="activeDescendantId"
      :aria-expanded="open ? 'true' : 'false'"
      :class="[baseClassName, triggerClassName, showTags && hasSelection ? '!h-auto min-h-10 !py-1.5' : '']"
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
          <!-- Теги-режим: удаляемые chips вместо строки «a, b, c». -->
          <span
            v-if="showTags && hasSelection"
            data-gr-select-tags
            class="flex flex-wrap gap-1 py-0.5"
          >
            <span
              v-for="opt in selectedOptions"
              :key="opt.value"
              data-gr-select-tag
              class="inline-flex items-center gap-1 rounded-[6px] bg-[var(--gr-muted)] pl-2 pr-1 py-0.5 text-[12px] text-[var(--gr-fg)] max-w-full"
            >
              <span class="truncate">{{ opt.label }}</span>
              <span
                v-if="!disabled"
                data-gr-select-tag-remove
                role="button"
                tabindex="-1"
                :aria-label="tagRemoveLabel(opt)"
                class="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] text-[var(--gr-muted-fg)] hover:text-[var(--gr-fg)] hover:bg-[color-mix(in_srgb,var(--gr-fg)_12%,transparent)]"
                @click.stop="removeValue(opt.value)"
              >
                <span class="i-lucide-x block h-3 w-3" aria-hidden="true" />
              </span>
            </span>
          </span>

          <span
            v-else
            class="block truncate"
            :class="!hasSelection ? 'text-[var(--gr-muted-fg)]' : ''"
          >
            {{ displayText }}
          </span>
        </slot>
      </span>

      <span
        v-if="panelClearVisible"
        class="shrink-0 h-4 w-4"
        aria-hidden="true"
      />

      <span
        v-else
        data-testid="gr-select-chevron"
        class="shrink-0 flex items-center text-[var(--gr-muted-fg)] pointer-events-none"
      >
        <span class="i-lucide-chevron-down block h-4 w-4" aria-hidden="true" />
      </span>
    </button>

    <button
      v-if="panelClearVisible"
      data-testid="gr-select-clear"
      data-gr-select-clear
      type="button"
      class="absolute top-1/2 -translate-y-1/2 right-3 h-6 w-6 inline-flex items-center justify-center rounded-md text-[var(--gr-muted-fg)] hover:text-[var(--gr-fg)] hover:bg-[color-mix(in_srgb,var(--gr-muted)_25%,transparent)] disabled:opacity-50"
      :disabled="disabled"
      :aria-label="resolvedClearLabel"
      @click.stop="clearSelection"
    >
      <span class="i-lucide-x inline-block h-4 w-4" aria-hidden="true" />
    </button>

    <teleport to="body">
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
                :placeholder="resolvedSearchPlaceholder"
                size="sm"
                @keydown="onComboKeydown"
              />
            </div>

            <!-- Состояние загрузки: вместо списка — индикатор. -->
            <div
              v-if="loading"
              data-gr-select-loading
              class="flex items-center justify-center gap-2 px-3 py-4 text-[13px] text-[var(--gr-muted-fg)]"
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
                class="rounded-[10px] px-3 py-2 text-left text-[13px] hover:bg-[color-mix(in_srgb,var(--gr-muted)_30%,transparent)]" :class="[
                  view === 'link' ? 'block min-w-full w-max whitespace-nowrap' : 'w-full',
                ]"
                @click="addCustom"
              >
                {{ t('gr.select.addOption', 'Add "{value}"', { value: customValue.trim() }) }}
              </button>

              <template v-for="item in panelItems" :key="item.key">
                <div
                  v-if="item.kind === 'group'"
                  data-gr-select-group-label
                  role="presentation"
                  class="px-3 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--gr-muted-fg)]" :class="[
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
                  class="rounded-[10px] px-3 py-2 text-left text-[13px]" :class="[
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
                class="px-3 py-4 text-center text-[13px] text-[var(--gr-muted-fg)]"
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
