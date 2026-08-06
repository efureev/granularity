<script setup lang="ts" generic="TValue extends GrAutocompleteValue = string">
import { computed, nextTick, onBeforeUnmount, ref, shallowRef, useId, watch } from 'vue'

import { usePortalTarget } from '../../composables/usePortalTarget'

import { useGrComponentProp, useGrComponentSize, useGrThemeAttrs } from '../GrConfigProvider/context'

import { vClickOutside } from '../../directives'
import { useFloating } from '../../composables/useFloating'
import { useDismissible } from '../../composables/useDismissible'
import { useGranularityTranslations } from '../../internal/granularityI18n'
import { useGrFormFieldContext } from '../GrFormField/context'
import { useGrFormControl } from '../../composables/useGrFormControl'

import {
  autocompleteChipClass,
  autocompleteOptionClass,
  autocompletePanelClasses,
  autocompleteShellClass,
  autocompleteStateClass,
  type GrAutocompleteModelValue,
  type GrAutocompleteOption,
  type GrAutocompleteValue,
  type GrAutocompleteSize,
} from './grAutocompleteStyles'

export type {
  GrAutocompleteModelValue,
  GrAutocompleteOption,
  GrAutocompleteSize,
  GrAutocompleteValue,
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
export interface GrAutocompleteProps<TValue extends GrAutocompleteValue = string> {
  /** Выбранное значение (single — строка, multiple — массив строк). */
  modelValue: GrAutocompleteModelValue<TValue>
  /**
   * Доступные опции. Для локального режима — полный список (фильтруется на клиенте).
   * Для remote-режима (`filterable=false`) — список, который родитель обновляет
   * в ответ на событие `search`.
   */
  options?: GrAutocompleteOption<TValue>[]
  multiple?: boolean
  disabled?: boolean
  /** Только для чтения: значение видно и уходит в форму, но не редактируется. */
  readonly?: boolean
  /** Визуальное и ARIA-состояние ошибки. */
  invalid?: boolean
  /** Обязательное поле (`aria-required`). */
  required?: boolean
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
  filter?: (option: GrAutocompleteOption<TValue>, query: string) => boolean
  /**
   * Удалённая загрузка опций под управлением компонента: дебаунс, отмена
   * устаревшего запроса и `loading` берёт на себя он. Ответ на отменённый
   * запрос игнорируется — при быстром вводе в списке всегда результат
   * последнего запроса, а не того, который вернулся позже.
   *
   * `signal` пробрасывается в `fetch`. Локальная фильтрация в этом режиме
   * выключена: список фильтрует сервер. Альтернатива — событие `search`, если
   * запрос ведёт само приложение.
   */
  fetchOptions?: (query: string, signal: AbortSignal) => Promise<GrAutocompleteOption<TValue>[]>
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
  defineProps<GrAutocompleteProps<TValue>>(),
  {
    options: undefined,
    multiple: false,
    disabled: false,
    readonly: false,
    invalid: false,
    required: false,
    size: undefined,
    placeholder: undefined,
    ariaLabel: undefined,
    clearable: undefined,
    loading: false,
    filterable: true,
    filter: undefined,
    fetchOptions: undefined,
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

// Эффективный размер: локальный проп → `GrConfigProvider` → дефолт компонента.
const resolvedSize = useGrComponentSize(() => props.size, { component: 'GrAutocomplete' })
const resolvedClearable = useGrComponentProp('GrAutocomplete', 'clearable', () => props.clearable, false)

const emit = defineEmits<{
  (e: 'update:modelValue', value: GrAutocompleteModelValue<TValue>): void
  /** Дебаунснутый поисковый запрос — точка входа для удалённой загрузки опций. */
  (e: 'search', query: string): void
  /** Запрос `fetchOptions` завершился ошибкой (отмена устаревшего сюда не приходит). */
  (e: 'searchError', error: unknown): void
}>()

const { t } = useGranularityTranslations()

const resolvedLoadingText = computed(() => props.loadingText ?? t('gr.autocomplete.loading', 'Loading…'))
const resolvedNoResultsText = computed(() => props.noResultsText ?? t('gr.autocomplete.noResults', 'No results'))
const resolvedClearLabel = computed(() => props.clearLabel ?? t('gr.common.clear', 'Clear'))
// Число уходит под двумя общепринятыми именами: `n` читают `@feugene/fint-i18n`
// и `vue-i18n`, `count` — `i18next`. Формы для каждого языка лежат в словаре,
// выбирает их переводчик; встроенный fallback — одна английская строка.
const resolvedTypeMoreText = computed(() =>
  t('gr.autocomplete.typeMore', 'Type at least {n} characters', {
    n: props.minQueryLength,
    count: props.minQueryLength,
  }),
)

// Fallback из контекста `GrFormField` (id/aria-describedby/invalid/required).
const field = useGrFormFieldContext()
const resolvedId = computed(() => field?.id.value)
const {
  disabled: isDisabled,
  invalid: isInvalid, required: isRequired, readonly: isReadonly } = useGrFormControl(() => props)
const describedBy = computed(() => field?.describedById.value)

// Read-only запирает контрол так же, как disabled: значение видно, но панель не
// открывается, опции не выбираются и чипы не удаляются. Без этого `readonly`
// оставался бы ARIA-атрибутом без поведения.
const locked = computed(() => isDisabled.value || isReadonly.value)

// Ответ последнего `fetchOptions`. До первого ответа показываем `options` —
// с ними компонент рисует стартовый список, не дожидаясь сервера.
const remoteOptions = shallowRef<GrAutocompleteOption<TValue>[]>([])
const remoteAnswered = ref(false)
const remoteLoading = ref(false)

const optionsResolved = computed<GrAutocompleteOption<TValue>[]>(() =>
  props.fetchOptions && remoteAnswered.value ? remoteOptions.value : (props.options ?? []),
)

const isLoading = computed(() => props.loading || remoteLoading.value)

/** `0` — валидное значение, поэтому «пусто» проверяется явно, а не через falsy. */
function isEmptyValue(value: unknown): boolean {
  return value === undefined || value === null || value === ''
}

function toArray(value: GrAutocompleteModelValue<TValue>): TValue[] {
  if (Array.isArray(value)) return value
  if (isEmptyValue(value)) return []
  return [value]
}

const modelSingle = computed<TValue | ''>(() => {
  const raw = Array.isArray(props.modelValue) ? props.modelValue[0] : props.modelValue
  return isEmptyValue(raw) ? '' : (raw as TValue)
})
const selectedValues = computed(() => (props.multiple ? toArray(props.modelValue) : (isEmptyValue(modelSingle.value) ? [] : [modelSingle.value as TValue])))
const hasSelection = computed(() => selectedValues.value.length > 0)

function labelFor(value: GrAutocompleteValue): string {
  return optionsResolved.value.find(o => o.value === value)?.label ?? String(value)
}

/** Опции выбранных значений (для chips в multiple). Неизвестные значения показываем как есть. */
const selectedOptions = computed<GrAutocompleteOption<TValue>[]>(() =>
  selectedValues.value.map(v => optionsResolved.value.find(o => o.value === v) ?? { value: v, label: String(v) }),
)

const singleSelectedLabel = computed(() => (props.multiple || isEmptyValue(modelSingle.value) ? '' : labelFor(modelSingle.value)))

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

function focus(): void {
  inputEl.value?.focus()
}

function blur(): void {
  inputEl.value?.blur()
}

defineExpose({
  focus,
  blur,
  open: () => openDropdown(),
  close: () => closeDropdown(),
})
const clickOutsideExclude = [() => panelEl.value]

const { floatingStyle } = useFloating(rootEl, panelEl, open, {
  placement: 'bottom-start',
  matchWidth: true,
  zIndexVar: '--gr-z-dropdown',
})

useDismissible(open, closeDropdown)

// ————— Фильтрация.
const searchQuery = computed(() => {
  // При `fetchOptions` фильтрует сервер: локальный матчер отсеял бы то, что он
  // уже прислал в ответ на этот же запрос.
  if (!props.filterable || props.fetchOptions) return ''
  // single: пока пользователь не начал вводить — показываем весь список.
  if (!props.multiple && !dirty.value) return ''
  return query.value.trim()
})

function defaultFilter(option: GrAutocompleteOption<TValue>, q: string): boolean {
  const needle = q.toLowerCase()
  return option.label.toLowerCase().includes(needle) || String(option.value).toLowerCase().includes(needle)
}

const filteredOptions = computed<GrAutocompleteOption<TValue>[]>(() => {
  const q = searchQuery.value
  if (!q) return optionsResolved.value
  const matcher = props.filter ?? defaultFilter
  return optionsResolved.value.filter(o => matcher(o, q))
})

const canAddCustom = computed(() => {
  if (!props.allowCustomValue) return false
  // Кастомное значение набирается текстом — оно строковое по природе;
  // при числовом `TValue` эта ветка неприменима (см. docs/components.md).
  const v = query.value.trim() as TValue
  if (!v) return false
  if (props.multiple && selectedValues.value.includes(v)) return false
  if (!props.multiple && v === modelSingle.value) return false
  // Не предлагаем «Add», если такое значение/метка уже есть среди опций.
  return !optionsResolved.value.some(o => o.value === v || o.label === v)
})

const belowMinQuery = computed(() => props.minQueryLength > 0 && query.value.trim().length < props.minQueryLength)

const showEmpty = computed(() =>
  !isLoading.value && filteredOptions.value.length === 0 && !canAddCustom.value,
)

// ————— Панель: id/aria-activedescendant.
const listboxId = useId()

/**
 * Id опции строится от позиции, а не от значения: значение с пробелом дало бы
 * невалидный `id`, а `aria-activedescendant` — два токена вместо одной ссылки,
 * и активная опция перестала бы объявляться.
 */
function optionDomId(index: number): string {
  return `${listboxId}-opt-${index}`
}
const addOptionDomId = computed(() => `${listboxId}-add`)

/**
 * Клавиатурная навигация ходит и по опциям, и по варианту «добавить своё»:
 * иначе при непустом списке Enter всегда уходил бы в активную опцию, и
 * закоммитить произвольное значение с клавиатуры было бы нечем.
 */
type NavigableItem =
  | { kind: 'add' }
  | { kind: 'option', option: GrAutocompleteOption<TValue>, index: number }

const navigableItems = computed<NavigableItem[]>(() => {
  const items: NavigableItem[] = canAddCustom.value ? [{ kind: 'add' }] : []
  filteredOptions.value.forEach((option, index) => {
    if (!option.disabled) items.push({ kind: 'option', option, index })
  })
  return items
})

const activeItem = computed<NavigableItem | undefined>(() =>
  activeIndex.value >= 0 ? navigableItems.value[activeIndex.value] : undefined,
)
const activeValue = computed(() => (activeItem.value?.kind === 'option' ? activeItem.value.option.value : undefined))
const activeDescendantId = computed(() => {
  if (!open.value) return undefined
  const item = activeItem.value
  if (!item) return undefined
  return item.kind === 'add' ? addOptionDomId.value : optionDomId(item.index)
})

function isSelected(value: TValue): boolean {
  return selectedValues.value.includes(value)
}

function navigableIndexOf(value: TValue): number {
  return navigableItems.value.findIndex(item => item.kind === 'option' && item.option.value === value)
}

function clampActive(index: number): number {
  const len = navigableItems.value.length
  if (len === 0) return -1
  return ((index % len) + len) % len
}

async function scrollActiveIntoView(): Promise<void> {
  await nextTick()
  const id = activeDescendantId.value
  if (!id) return
  document.getElementById(id)?.scrollIntoView?.({ block: 'nearest' })
}

function setActive(index: number): void {
  activeIndex.value = clampActive(index)
  void scrollActiveIntoView()
}

function initActiveIndex(): void {
  const selectedIdx = navigableItems.value.findIndex(item => item.kind === 'option' && isSelected(item.option.value))
  activeIndex.value = selectedIdx >= 0 ? selectedIdx : (navigableItems.value.length ? 0 : -1)
}

// Пересчёт активной опции при изменении списка (фильтрация/remote-загрузка).
watch(navigableItems, () => {
  if (!open.value) return
  if (activeIndex.value >= navigableItems.value.length) activeIndex.value = navigableItems.value.length - 1
  if (activeIndex.value < 0 && navigableItems.value.length) activeIndex.value = 0
})

// ————— Открытие/закрытие.
function openDropdown(): void {
  if (locked.value || open.value) return
  open.value = true
}

function closeDropdown(): void {
  open.value = false
}

function focusInput(): void {
  inputEl.value?.focus()
}

// ————— Дебаунснутый поиск для remote-загрузки.
let searchTimer: ReturnType<typeof setTimeout> | null = null
// Счётчик запросов: ответ, стартовавший раньше, но пришедший позже, обязан
// проиграть последнему — иначе список показывает результат старого запроса.
let searchSeq = 0
let inflight: AbortController | null = null

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError'
}

async function runFetch(query: string): Promise<void> {
  const fetchOptions = props.fetchOptions
  if (!fetchOptions) return

  inflight?.abort()
  const controller = new AbortController()
  inflight = controller
  const seq = ++searchSeq
  remoteLoading.value = true

  try {
    const result = await fetchOptions(query, controller.signal)
    if (seq !== searchSeq) return
    remoteOptions.value = result
    remoteAnswered.value = true
  }
  catch (error) {
    if (seq !== searchSeq || isAbortError(error)) return
    remoteOptions.value = []
    remoteAnswered.value = true
    emit('searchError', error)
  }
  finally {
    if (seq === searchSeq) remoteLoading.value = false
  }
}

function scheduleSearch(value: string): void {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    if (props.minQueryLength > 0 && value.trim().length < props.minQueryLength) return
    emit('search', value.trim())
    void runFetch(value.trim())
  }, props.debounce)
}

onBeforeUnmount(() => {
  if (searchTimer) clearTimeout(searchTimer)
  inflight?.abort()
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
  if (locked.value) return
  openDropdown()
}

function setQuery(value: string): void {
  query.value = value
  dirty.value = false
}

// ————— Выбор значений.
function selectSingle(value: TValue, label: string): void {
  emit('update:modelValue', value)
  setQuery(label)
  closeDropdown()
}

function toggleMultiple(value: TValue): void {
  const next = selectedValues.value.slice()
  const idx = next.indexOf(value)
  if (idx >= 0) next.splice(idx, 1)
  else next.push(value)
  emit('update:modelValue', next)
  setQuery('')
  if (props.closeOnSelect) closeDropdown()
  else void nextTick(focusInput)
}

function chooseOption(option: GrAutocompleteOption<TValue>): void {
  if (locked.value || option.disabled) return
  if (props.multiple) toggleMultiple(option.value)
  else selectSingle(option.value, option.label)
}

function commitCustom(): void {
  if (locked.value) return
  // Кастомное значение строковое по природе — см. `canAddCustom`.
  const v = query.value.trim() as TValue
  if (!v) return
  if (props.multiple) toggleMultiple(v)
  else selectSingle(v, String(v))
}

function removeValue(value: TValue, focusAfter: () => void = focusInput): void {
  if (locked.value) return
  const next = selectedValues.value.filter(v => v !== value)
  emit('update:modelValue', next)
  void nextTick(focusAfter)
}

function clearSelection(): void {
  if (locked.value) return
  emit('update:modelValue', (props.multiple ? [] : '') as GrAutocompleteModelValue<TValue>)
  setQuery('')
  void nextTick(focusInput)
}

const showClear = computed(() =>
  resolvedClearable.value && !locked.value && (hasSelection.value || query.value.length > 0),
)

// ————— Чипы (multiple): стрелки вместо таб-стопов.
//
// Крестики намеренно не табируемы: у combobox фокус живёт на `<input>`, и
// двадцать выбранных значений не должны давать двадцать остановок Tab. Поэтому
// вход в чипы — ArrowLeft из пустого запроса, а выход — ArrowRight/Esc/печать.
function chipRemoveButtons(): HTMLButtonElement[] {
  return [...(rootEl.value?.querySelectorAll<HTMLButtonElement>('[data-gr-autocomplete-chip-remove]') ?? [])]
}

function focusChip(index: number): void {
  const buttons = chipRemoveButtons()
  if (!buttons.length) {
    focusInput()
    return
  }
  buttons[Math.min(Math.max(index, 0), buttons.length - 1)].focus()
}

function onChipKeydown(event: KeyboardEvent, index: number, value: TValue): void {
  switch (event.key) {
    case 'ArrowLeft':
      event.preventDefault()
      focusChip(index - 1)
      break
    case 'ArrowRight':
      event.preventDefault()
      if (index >= chipRemoveButtons().length - 1) focusInput()
      else focusChip(index + 1)
      break
    case 'Home':
      event.preventDefault()
      focusChip(0)
      break
    case 'End':
      event.preventDefault()
      focusChip(chipRemoveButtons().length - 1)
      break
    case 'Delete':
    case 'Backspace':
      event.preventDefault()
      removeValue(value, () => focusChip(index))
      break
    case 'Escape':
      event.preventDefault()
      focusInput()
      break
    default:
      // Печатный символ возвращает в поле: фокус переезжает синхронно, до
      // вставки текста, поэтому символ попадает в запрос, а не пропадает.
      if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) focusInput()
  }
}

// ————— Клавиатура.
function onKeydown(event: KeyboardEvent): void {
  if (locked.value) return

  // Курсор в начале пустого запроса — стрелка влево уходит к чипам, а не
  // двигает каретку, которой всё равно некуда двигаться.
  if (event.key === 'ArrowLeft' && props.multiple && query.value === '' && selectedValues.value.length) {
    event.preventDefault()
    closeDropdown()
    focusChip(selectedValues.value.length - 1)
    return
  }

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
      setActive(navigableItems.value.length - 1)
      break
    case 'Enter': {
      if (!open.value) break
      event.preventDefault()
      const item = activeItem.value
      if (item?.kind === 'option') chooseOption(item.option)
      else if (item?.kind === 'add' || canAddCustom.value) commitCustom()
      break
    }
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
    ref="rootEl"
    v-click-outside="{ handler: closeDropdown, enabled: open, exclude: clickOutsideExclude }"
    data-gr-autocomplete
    class="relative w-full"
  >
    <div
      data-gr-autocomplete-shell
      :class="autocompleteShellClass({ size: resolvedSize, disabled: isDisabled, invalid: isInvalid })"
      @mousedown.self.prevent="focusInput"
    >
      <!-- Chips выбранных значений (multiple). -->
      <template v-if="multiple">
        <span
          v-for="(option, chipIndex) in selectedOptions"
          :key="option.value"
          data-gr-autocomplete-chip
          :class="autocompleteChipClass"
        >
          <span class="truncate">{{ option.label }}</span>
          <button
            v-if="!locked"
            type="button"
            data-gr-autocomplete-chip-remove
            class="inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full text-[var(--gr-muted-fg)] hover:text-[var(--gr-fg)]"
            :aria-label="t('gr.autocomplete.removeValue', 'Remove {label}', { label: option.label })"
            tabindex="-1"
            @click="removeValue(option.value)"
            @keydown="onChipKeydown($event, chipIndex, option.value)"
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
        :disabled="isDisabled"
        :placeholder="hasSelection && multiple ? undefined : placeholder"
        :aria-label="ariaLabel"
        :aria-invalid="isInvalid ? 'true' : undefined"
        :aria-describedby="describedBy"
        :aria-required="isRequired ? 'true' : undefined"
        :aria-readonly="isReadonly ? 'true' : undefined"
        :readonly="isReadonly"
        aria-haspopup="listbox"
        :aria-autocomplete="ariaAutocomplete"
        :aria-controls="open ? listboxId : undefined"
        :aria-activedescendant="activeDescendantId"
        :aria-expanded="open ? 'true' : 'false'"
        class="min-w-0 flex-1 bg-transparent text-inherit placeholder:text-[var(--gr-muted-fg)] focus:outline-none disabled:cursor-not-allowed"
        @input="onInput"
        @focus="onFocus"
        @keydown="onKeydown"
      >

      <!-- Trailing: спиннер / очистка / шеврон. -->
      <span
        v-if="isLoading"
        data-gr-autocomplete-spinner
        class="shrink-0 flex items-center text-[var(--gr-muted-fg)]"
      >
        <span class="i-lucide-loader-2 block h-4 w-4 animate-spin" aria-hidden="true" />
      </span>

      <button
        v-else-if="showClear"
        type="button"
        data-testid="gr-autocomplete-clear"
        data-gr-autocomplete-clear
        class="shrink-0 inline-flex h-5 w-5 items-center justify-center rounded-md text-[var(--gr-muted-fg)] hover:text-[var(--gr-fg)]"
        :aria-label="resolvedClearLabel"
        tabindex="-1"
        @click="clearSelection"
      >
        <span class="i-lucide-x block h-4 w-4" aria-hidden="true" />
      </button>

      <span
        v-else
        data-testid="gr-autocomplete-chevron"
        class="shrink-0 flex items-center text-[var(--gr-muted-fg)] pointer-events-none"
      >
        <span class="i-lucide-chevron-down block h-4 w-4" aria-hidden="true" />
      </span>
    </div>

    <teleport :to="portalTarget" :disabled="!teleportEnabled">
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
          v-bind="themeAttrs"
          data-gr-autocomplete-panel
          data-gr-overlay-root
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
              <!--
                Прямые потомки listbox — только опции: роль объявляет остальных
                недопустимыми детьми (`aria-required-children`), поэтому строки
                состояний живут ниже, вне списка. `mousedown.prevent` держит
                фокус на `<input>` — контракт combobox с `aria-activedescendant`.
              -->
              <button
                v-if="canAddCustom"
                :id="addOptionDomId"
                type="button"
                role="option"
                aria-selected="false"
                tabindex="-1"
                data-testid="gr-autocomplete-add-option"
                data-gr-autocomplete-add-option
                :class="autocompleteOptionClass({ disabled: false, active: activeItem?.kind === 'add' })"
                @mousedown.prevent
                @click="commitCustom"
                @mousemove="activeIndex = 0"
              >
                {{ t('gr.autocomplete.addOption', 'Add "{value}"', { value: query.trim() }) }}
              </button>

              <button
                v-for="(option, optionIndex) in filteredOptions"
                :id="optionDomId(optionIndex)"
                :key="option.value"
                data-gr-autocomplete-option
                type="button"
                role="option"
                tabindex="-1"
                :disabled="option.disabled"
                :aria-selected="isSelected(option.value) ? 'true' : 'false'"
                :aria-disabled="option.disabled ? 'true' : undefined"
                :class="autocompleteOptionClass({
                  disabled: !!option.disabled,
                  active: activeValue === option.value,
                })"
                @mousedown.prevent
                @click="chooseOption(option)"
                @mousemove="activeIndex = navigableIndexOf(option.value)"
              >
                <slot name="option" :option="option" :selected="isSelected(option.value)">
                  <span class="flex items-center gap-2 min-w-0">
                    <span
                      class="inline-block h-4 w-4 shrink-0"
                      :class="isSelected(option.value) ? 'i-lucide-check text-[var(--gr-primary)]' : ''"
                      aria-hidden="true"
                    />
                    <span class="truncate">{{ option.label }}</span>
                  </span>
                </slot>
              </button>
            </div>

            <!--
              Загрузка, «введите ещё N» и «ничего не найдено» меняются молча:
              `aria-label` на generic-элементе AT игнорируют. Один живой регион
              на все три — и вне listbox, чтобы не ломать его состав.
            -->
            <div
              v-if="isLoading || showEmpty"
              data-gr-autocomplete-status
              role="status"
              aria-live="polite"
              :class="autocompleteStateClass"
            >
              <template v-if="isLoading">
                <span data-gr-autocomplete-loading class="flex items-center gap-2">
                  <slot name="loading">
                    <span class="i-lucide-loader-2 block h-4 w-4 animate-spin" aria-hidden="true" />
                    <span>{{ resolvedLoadingText }}</span>
                  </slot>
                </span>
              </template>
              <template v-else-if="belowMinQuery">
                <span data-gr-autocomplete-hint>{{ resolvedTypeMoreText }}</span>
              </template>
              <template v-else>
                <span data-gr-autocomplete-empty>
                  <slot name="empty">
                    {{ resolvedNoResultsText }}
                  </slot>
                </span>
              </template>
            </div>
          </div>
        </div>
      </transition>
    </teleport>
  </div>
</template>
