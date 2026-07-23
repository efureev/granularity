<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, useId, watch } from 'vue'

import { vClickOutside } from '../../directives'
import { useFloating } from '../../composables/internal/useFloating'
import { useEscapeToClose } from '../../composables/internal/useEscapeToClose'
import { useGranularityTranslations } from '../../internal/granularityI18n'
import { useGrFormFieldContext } from '../GrFormField/context'

import {
  autocompleteChipClass,
  autocompletePanelClasses,
  autocompleteShellClass,
  type GrAutocompleteModelValue,
  type GrAutocompleteOption,
  type GrAutocompleteSize,
} from './grAutocompleteStyles'

export type {
  GrAutocompleteModelValue,
  GrAutocompleteOption,
  GrAutocompleteSize,
} from './grAutocompleteStyles'

/**
 * Публичный GR-примитив «Autocomplete / Combobox» (WAI-ARIA editable combobox).
 *
 * В отличие от `GrSelect` (select-only combobox с кнопкой-триггером), здесь
 * combobox-ом является сам текстовый `<input>`: набранный текст — это поисковый
 * запрос, а выбор опции заполняет поле. Поддерживает локальную фильтрацию,
 * удалённую (async) загрузку через событие `search` + внешний проп `loading`,
 * произвольные значения (`allowCustomValue`) и multiple с удаляемыми chips.
 */
export interface GrAutocompleteProps {
  /** Выбранное значение (single — строка, multiple — массив строк). */
  modelValue: GrAutocompleteModelValue
  /**
   * Доступные опции. Для локального режима — полный список (фильтруется на клиенте).
   * Для remote-режима (`filterable=false`) — список, который родитель обновляет
   * в ответ на событие `search`.
   */
  options?: GrAutocompleteOption[]
  multiple?: boolean
  disabled?: boolean
  size?: GrAutocompleteSize
  placeholder?: string
  ariaLabel?: string
  /** Кнопка очистки выбранного значения/запроса. */
  clearable?: boolean
  /** Внешне управляемое состояние загрузки (для async-сценариев). */
  loading?: boolean
  /**
   * Локальная фильтрация опций по введённому запросу. Отключите (`false`) для
   * чисто удалённого поиска — тогда `options` показываются как есть, а фильтрацию
   * выполняет сервер по событию `search`.
   */
  filterable?: boolean
  /** Кастомный матчер локальной фильтрации. По умолчанию — подстрока в `label`/`value`. */
  filter?: (option: GrAutocompleteOption, query: string) => boolean
  /** Минимальная длина запроса до эмита `search` (для дебаунса remote-загрузки). */
  minQueryLength?: number
  /** Задержка дебаунса события `search`, мс. */
  debounce?: number
  /** Разрешить ввод/коммит значения, которого нет в `options`. */
  allowCustomValue?: boolean
  /** Закрывать панель после выбора (single всегда закрывает). */
  closeOnSelect?: boolean
  /** Максимальная высота панели, px. */
  dropdownMaxHeight?: number
  /** i18n-тексты состояний панели / aria. */
  loadingText?: string
  noResultsText?: string
  clearLabel?: string
}

const props = withDefaults(
  defineProps<GrAutocompleteProps>(),
  {
    options: undefined,
    multiple: false,
    disabled: false,
    size: 'md',
    placeholder: undefined,
    ariaLabel: undefined,
    clearable: false,
    loading: false,
    filterable: true,
    filter: undefined,
    minQueryLength: 0,
    debounce: 250,
    allowCustomValue: false,
    closeOnSelect: true,
    dropdownMaxHeight: 280,
    loadingText: undefined,
    noResultsText: undefined,
    clearLabel: undefined,
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: GrAutocompleteModelValue): void
  /** Дебаунснутый поисковый запрос — точка входа для удалённой загрузки опций. */
  (e: 'search', query: string): void
}>()

const { t } = useGranularityTranslations()

const resolvedLoadingText = computed(() => props.loadingText ?? t('gr.autocomplete.loading', 'Loading…'))
const resolvedNoResultsText = computed(() => props.noResultsText ?? t('gr.autocomplete.noResults', 'No results'))
const resolvedClearLabel = computed(() => props.clearLabel ?? t('gr.common.clear', 'Clear'))
const resolvedTypeMoreText = computed(() =>
  t('gr.autocomplete.typeMore', 'Type at least {n} characters', { n: props.minQueryLength }),
)

// Fallback из контекста `GrFormField` (id/aria-describedby/invalid/required).
const field = useGrFormFieldContext()
const resolvedId = computed(() => field?.id.value)
const isInvalid = computed(() => Boolean(field?.invalid.value))
const describedBy = computed(() => field?.describedById.value)
const isRequired = computed(() => Boolean(field?.required.value))

const optionsResolved = computed<GrAutocompleteOption[]>(() => props.options ?? [])

function toArray(value: GrAutocompleteModelValue): string[] {
  if (Array.isArray(value)) return value
  if (!value) return []
  return [value]
}

const modelSingle = computed(() => (Array.isArray(props.modelValue) ? (props.modelValue[0] ?? '') : props.modelValue))
const selectedValues = computed(() => (props.multiple ? toArray(props.modelValue) : (modelSingle.value ? [modelSingle.value] : [])))
const hasSelection = computed(() => selectedValues.value.length > 0)

function labelFor(value: string): string {
  return optionsResolved.value.find(o => o.value === value)?.label ?? value
}

/** Опции выбранных значений (для chips в multiple). Неизвестные значения показываем как есть. */
const selectedOptions = computed<GrAutocompleteOption[]>(() =>
  selectedValues.value.map(v => optionsResolved.value.find(o => o.value === v) ?? { value: v, label: v }),
)

const singleSelectedLabel = computed(() => (props.multiple || !modelSingle.value ? '' : labelFor(modelSingle.value)))

// ————— Состояние.
const query = ref('')
// `dirty` — пользователь начал вводить запрос. Нужно, чтобы в single-режиме при
// открытии заполненного поля показать весь список (а не отфильтровать по метке
// уже выбранной опции). Сбрасывается при программной установке `query`.
const dirty = ref(false)
const open = ref(false)
const activeIndex = ref(-1)

const rootEl = ref<HTMLElement | null>(null)
const panelEl = ref<HTMLElement | null>(null)
const inputEl = ref<HTMLInputElement | null>(null)
const clickOutsideExclude = [() => panelEl.value]

const { floatingStyle } = useFloating(rootEl, panelEl, open, {
  placement: 'bottom-start',
  matchWidth: true,
  zIndexVar: '--gr-z-dropdown',
})

useEscapeToClose(open, closeDropdown)

// ————— Фильтрация.
const searchQuery = computed(() => {
  if (!props.filterable) return ''
  // single: пока пользователь не начал вводить — показываем весь список.
  if (!props.multiple && !dirty.value) return ''
  return query.value.trim()
})

function defaultFilter(option: GrAutocompleteOption, q: string): boolean {
  const needle = q.toLowerCase()
  return option.label.toLowerCase().includes(needle) || option.value.toLowerCase().includes(needle)
}

const filteredOptions = computed<GrAutocompleteOption[]>(() => {
  const q = searchQuery.value
  if (!q) return optionsResolved.value
  const matcher = props.filter ?? defaultFilter
  return optionsResolved.value.filter(o => matcher(o, q))
})

const navigableValues = computed<string[]>(() =>
  filteredOptions.value.filter(o => !o.disabled).map(o => o.value),
)

const canAddCustom = computed(() => {
  if (!props.allowCustomValue) return false
  const v = query.value.trim()
  if (!v) return false
  if (props.multiple && selectedValues.value.includes(v)) return false
  if (!props.multiple && v === modelSingle.value) return false
  // Не предлагаем «Add», если такое значение/метка уже есть среди опций.
  return !optionsResolved.value.some(o => o.value === v || o.label === v)
})

const belowMinQuery = computed(() => props.minQueryLength > 0 && query.value.trim().length < props.minQueryLength)

const showLoading = computed(() => props.loading)
const showEmpty = computed(() =>
  !props.loading && filteredOptions.value.length === 0 && !canAddCustom.value,
)

// ————— Панель: id/aria-activedescendant.
const listboxId = useId()

function optionDomId(value: string): string {
  return `${listboxId}-opt-${value}`
}

const activeValue = computed(() => (activeIndex.value >= 0 ? navigableValues.value[activeIndex.value] : undefined))
const activeDescendantId = computed(() =>
  open.value && activeValue.value !== undefined ? optionDomId(activeValue.value) : undefined,
)

function isSelected(value: string): boolean {
  return selectedValues.value.includes(value)
}

function clampActive(index: number): number {
  const len = navigableValues.value.length
  if (len === 0) return -1
  return ((index % len) + len) % len
}

async function scrollActiveIntoView(): Promise<void> {
  await nextTick()
  const value = activeValue.value
  if (value === undefined) return
  document.getElementById(optionDomId(value))?.scrollIntoView?.({ block: 'nearest' })
}

function setActive(index: number): void {
  activeIndex.value = clampActive(index)
  void scrollActiveIntoView()
}

function initActiveIndex(): void {
  const selectedIdx = navigableValues.value.findIndex(v => isSelected(v))
  activeIndex.value = selectedIdx >= 0 ? selectedIdx : (navigableValues.value.length ? 0 : -1)
}

// Пересчёт активной опции при изменении списка (фильтрация/remote-загрузка).
watch(navigableValues, () => {
  if (!open.value) return
  if (activeIndex.value >= navigableValues.value.length) activeIndex.value = navigableValues.value.length - 1
  if (activeIndex.value < 0 && navigableValues.value.length) activeIndex.value = 0
})

// ————— Открытие/закрытие.
function openDropdown(): void {
  if (props.disabled || open.value) return
  open.value = true
}

function closeDropdown(): void {
  open.value = false
}

function focusInput(): void {
  inputEl.value?.focus()
}

// ————— Дебаунснутый эмит `search` для remote-загрузки.
let searchTimer: ReturnType<typeof setTimeout> | null = null
function scheduleSearch(value: string): void {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    if (props.minQueryLength > 0 && value.trim().length < props.minQueryLength) return
    emit('search', value.trim())
  }, props.debounce)
}

onBeforeUnmount(() => {
  if (searchTimer) clearTimeout(searchTimer)
})

// ————— Ввод.
function onInput(event: Event): void {
  const value = (event.target as HTMLInputElement).value
  query.value = value
  dirty.value = true
  openDropdown()
  scheduleSearch(value)
}

function onFocus(): void {
  if (props.disabled) return
  openDropdown()
}

function setQuery(value: string): void {
  query.value = value
  dirty.value = false
}

// ————— Выбор значений.
function selectSingle(value: string, label: string): void {
  emit('update:modelValue', value)
  setQuery(label)
  closeDropdown()
}

function toggleMultiple(value: string): void {
  const next = selectedValues.value.slice()
  const idx = next.indexOf(value)
  if (idx >= 0) next.splice(idx, 1)
  else next.push(value)
  emit('update:modelValue', next)
  setQuery('')
  if (props.closeOnSelect) closeDropdown()
  else void nextTick(focusInput)
}

function chooseOption(option: GrAutocompleteOption): void {
  if (option.disabled) return
  if (props.multiple) toggleMultiple(option.value)
  else selectSingle(option.value, option.label)
}

function commitCustom(): void {
  const v = query.value.trim()
  if (!v) return
  if (props.multiple) toggleMultiple(v)
  else selectSingle(v, v)
}

function removeValue(value: string): void {
  const next = selectedValues.value.filter(v => v !== value)
  emit('update:modelValue', next)
  void nextTick(focusInput)
}

function clearSelection(): void {
  if (props.disabled) return
  emit('update:modelValue', props.multiple ? [] : '')
  setQuery('')
  void nextTick(focusInput)
}

const showClear = computed(() =>
  props.clearable && !props.disabled && (hasSelection.value || query.value.length > 0),
)

// ————— Клавиатура.
function onKeydown(event: KeyboardEvent): void {
  if (props.disabled) return

  if (!open.value && ['ArrowDown', 'ArrowUp'].includes(event.key)) {
    event.preventDefault()
    openDropdown()
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
      if (!open.value) break
      event.preventDefault()
      setActive(0)
      break
    case 'End':
      if (!open.value) break
      event.preventDefault()
      setActive(navigableValues.value.length - 1)
      break
    case 'Enter':
      if (!open.value) break
      event.preventDefault()
      if (activeValue.value !== undefined) {
        const opt = filteredOptions.value.find(o => o.value === activeValue.value)
        if (opt) chooseOption(opt)
      }
      else if (canAddCustom.value) {
        commitCustom()
      }
      break
    case 'Backspace':
      // multiple: пустой запрос + Backspace удаляет последний chip.
      if (props.multiple && query.value === '' && selectedValues.value.length) {
        event.preventDefault()
        removeValue(selectedValues.value[selectedValues.value.length - 1])
      }
      break
    case 'Tab':
      closeDropdown()
      break
  }
}

// ————— Синхронизация query с выбранным значением (single).
watch(
  [singleSelectedLabel, () => props.multiple],
  ([label, multiple]) => {
    if (multiple) return
    // Не перетираем то, что пользователь сейчас набирает.
    if (open.value || dirty.value) return
    setQuery(label)
  },
  { immediate: true },
)

watch(open, (isOpen) => {
  if (isOpen) {
    initActiveIndex()
    return
  }
  // Закрытие: сбрасываем активную опцию и «черновик».
  activeIndex.value = -1
  if (props.multiple) {
    setQuery('')
  }
  else {
    // single: возвращаем метку выбранной опции (revert ввода без выбора).
    setQuery(singleSelectedLabel.value)
  }
})

const ariaAutocomplete = computed(() => (props.allowCustomValue ? 'both' : 'list'))
</script>

<template>
  <div
    ref="rootEl"
    v-click-outside="{ handler: closeDropdown, enabled: open, exclude: clickOutsideExclude }"
    data-gr-autocomplete
    class="relative w-full"
  >
    <div
      data-gr-autocomplete-shell
      :class="autocompleteShellClass({ size, disabled, invalid: isInvalid })"
      @mousedown.self.prevent="focusInput"
    >
      <!-- Chips выбранных значений (multiple). -->
      <template v-if="multiple">
        <span
          v-for="option in selectedOptions"
          :key="option.value"
          data-gr-autocomplete-chip
          :class="autocompleteChipClass"
        >
          <span class="truncate">{{ option.label }}</span>
          <button
            v-if="!disabled"
            type="button"
            data-gr-autocomplete-chip-remove
            class="inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full text-[var(--muted-fg)] hover:text-[var(--fg)]"
            :aria-label="t('gr.inputTag.removeTag', 'Remove tag')"
            tabindex="-1"
            @click="removeValue(option.value)"
          >
            <span class="i-lucide-x block h-3 w-3" aria-hidden="true" />
          </button>
        </span>
      </template>

      <input
        :id="resolvedId"
        ref="inputEl"
        data-gr-autocomplete-input
        data-testid="gr-autocomplete-input"
        type="text"
        autocomplete="off"
        spellcheck="false"
        role="combobox"
        :value="query"
        :disabled="disabled"
        :placeholder="hasSelection && multiple ? undefined : placeholder"
        :aria-label="ariaLabel"
        :aria-invalid="isInvalid ? 'true' : undefined"
        :aria-describedby="describedBy"
        :aria-required="isRequired ? 'true' : undefined"
        aria-haspopup="listbox"
        :aria-autocomplete="ariaAutocomplete"
        :aria-controls="open ? listboxId : undefined"
        :aria-activedescendant="activeDescendantId"
        :aria-expanded="open ? 'true' : 'false'"
        class="min-w-0 flex-1 bg-transparent text-inherit placeholder:text-[var(--muted-fg)] focus:outline-none disabled:cursor-not-allowed"
        @input="onInput"
        @focus="onFocus"
        @keydown="onKeydown"
      >

      <!-- Trailing: спиннер / очистка / шеврон. -->
      <span
        v-if="loading"
        data-gr-autocomplete-spinner
        class="shrink-0 flex items-center text-[var(--muted-fg)]"
      >
        <span class="i-lucide-loader-2 block h-4 w-4 animate-spin" aria-hidden="true" />
      </span>

      <button
        v-else-if="showClear"
        type="button"
        data-testid="gr-autocomplete-clear"
        data-gr-autocomplete-clear
        class="shrink-0 inline-flex h-5 w-5 items-center justify-center rounded-md text-[var(--muted-fg)] hover:text-[var(--fg)]"
        :aria-label="resolvedClearLabel"
        tabindex="-1"
        @click="clearSelection"
      >
        <span class="i-lucide-x block h-4 w-4" aria-hidden="true" />
      </button>

      <span
        v-else
        data-testid="gr-autocomplete-chevron"
        class="shrink-0 flex items-center text-[var(--muted-fg)] pointer-events-none"
      >
        <span class="i-lucide-chevron-down block h-4 w-4" aria-hidden="true" />
      </span>
    </div>

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
          data-testid="gr-autocomplete-panel"
          data-gr-autocomplete-panel
          :style="floatingStyle"
        >
          <div :class="autocompletePanelClasses">
            <div
              :id="listboxId"
              data-gr-autocomplete-listbox
              class="p-1 overflow-auto"
              :style="{ maxHeight: `${dropdownMaxHeight}px` }"
              role="listbox"
              :aria-multiselectable="multiple ? 'true' : undefined"
            >
              <!-- «Add custom» опция. -->
              <button
                v-if="canAddCustom"
                type="button"
                data-testid="gr-autocomplete-add-option"
                data-gr-autocomplete-add-option
                class="w-full rounded-[10px] px-3 py-2 text-left text-[13px] hover:bg-[color-mix(in_srgb,var(--muted)_30%,transparent)]"
                @click="commitCustom"
              >
                {{ t('gr.autocomplete.addOption', 'Add "{value}"', { value: query.trim() }) }}
              </button>

              <button
                v-for="option in filteredOptions"
                :id="optionDomId(option.value)"
                :key="option.value"
                data-gr-autocomplete-option
                type="button"
                role="option"
                :disabled="option.disabled"
                :aria-selected="isSelected(option.value) ? 'true' : 'false'"
                :aria-disabled="option.disabled ? 'true' : undefined"
                class="w-full rounded-[10px] px-3 py-2 text-left text-[13px]" :class="[
                  option.disabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-[color-mix(in_srgb,var(--muted)_30%,transparent)]',
                  activeValue === option.value && !option.disabled ? 'bg-[color-mix(in_srgb,var(--muted)_30%,transparent)]' : '',
                ]"
                @click="chooseOption(option)"
                @mousemove="activeIndex = navigableValues.indexOf(option.value)"
              >
                <slot name="option" :option="option" :selected="isSelected(option.value)">
                  <span class="flex items-center gap-2 min-w-0">
                    <span
                      class="inline-block h-4 w-4 shrink-0"
                      :class="isSelected(option.value) ? 'i-lucide-check text-[var(--primary)]' : ''"
                      aria-hidden="true"
                    />
                    <span class="truncate">{{ option.label }}</span>
                  </span>
                </slot>
              </button>

              <!-- Состояния: загрузка / подсказка minQueryLength / пусто. -->
              <div
                v-if="showLoading"
                data-gr-autocomplete-loading
                class="flex items-center gap-2 px-3 py-2 text-[13px] text-[var(--muted-fg)]"
              >
                <slot name="loading">
                  <span class="i-lucide-loader-2 block h-4 w-4 animate-spin" aria-hidden="true" />
                  <span>{{ resolvedLoadingText }}</span>
                </slot>
              </div>

              <div
                v-else-if="showEmpty && belowMinQuery"
                data-gr-autocomplete-hint
                class="px-3 py-2 text-[13px] text-[var(--muted-fg)]"
              >
                {{ resolvedTypeMoreText }}
              </div>

              <div
                v-else-if="showEmpty"
                data-gr-autocomplete-empty
                class="px-3 py-2 text-[13px] text-[var(--muted-fg)]"
              >
                <slot name="empty">
                  {{ resolvedNoResultsText }}
                </slot>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </teleport>
  </div>
</template>
