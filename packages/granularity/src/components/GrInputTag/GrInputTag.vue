<script setup lang="ts">
import { computed, nextTick, ref, useId, watchEffect } from 'vue'

import type { GrBadgeRadius, GrBadgeSize, GrBadgeTone } from '../GrBadge'
import GrChip from '../GrChip/GrChip.vue'
import { chipSizeForBadgeScale } from '../GrChip/grChipStyles'
import GrIcon from '../GrIcon/GrIcon.vue'
import IconClose from '~icons/lucide/x'
import IconCheckCircle from '~icons/lucide/check-circle'
import IconAlertTriangle from '~icons/lucide/alert-triangle'
import IconLoader from '~icons/lucide/loader-2'
import { useGrComponentProp, useGrComponentSize } from '../GrConfigProvider/context'
import { useControlAddons } from '../../composables/internal/useControlAddons'
import { useGrFormFieldContext } from '../GrFormField/context'
import { useAnnouncer } from '../../composables/useAnnouncer'
import { useRovingFocus } from '../../composables/useRovingFocus'
import { useGrFormControl } from '../../composables/useGrFormControl'
import { useFocusWithin } from '../../composables/internal/useFocusWithin'
import { useGranularityTranslations } from '../../internal/granularityI18n'
import {
  controlSignalState,
  controlStateFallbackText,
  controlStateIconClass,
  controlStateIconColors,
  controlStateTextKey,
} from '../shared/controlState'
import { isComposingEvent } from '../../internal/keyboard'

import {
  clearButtonClass,
  grInputTagInputClass,
  grInputTagWrapperClass,
  spinnerClass,
  type GrInputTagSize,
  type GrInputTagState,
} from './grInputTagStyles'

export type { GrInputTagSize, GrInputTagState } from './grInputTagStyles'

const REGEX_SPECIAL_CHAR_RE = /[.*+?^${}()|[\]\\]/g

/**
 * Props for {@link GrInputTag}.
 * Tag-input primitive: renders a set of badges with an inline `<input>` for entering new tags.
 * Splits input by configurable `separators`, supports paste, Enter and Backspace editing.
 */
export interface GrInputTagProps {
  modelValue: string[]
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  invalid?: boolean
  /** Обязательное поле (`aria-required`). Складывается с `required` у `GrFormField`. */
  required?: boolean
  state?: GrInputTagState
  size?: GrInputTagSize
  separators?: string[]
  allowDuplicates?: boolean
  trim?: boolean
  max?: number
  addOnBlur?: boolean
  clearInputOnAdd?: boolean
  /**
   * Проверка тега перед добавлением. Может быть асинхронной (проверка на
   * сервере). Отклонённый тег не добавляется и уходит в событие `reject`.
   */
  beforeAdd?: (tag: string) => boolean | Promise<boolean>
  /** Кнопка «снести все теги». Настраивается через `GrConfigProvider`. */
  clearable?: boolean
  /** Фоновая работа: спиннер + `aria-busy`. Асинхронный `beforeAdd` поднимает его сам. */
  loading?: boolean
  tagTone?: GrBadgeTone
  tagDark?: boolean
  tagSize?: GrBadgeSize
  tagRadius?: GrBadgeRadius
  tagClosable?: boolean
  /** i18n-friendly aria-label for the per-tag remove button. */
  removeTagLabel?: string
  /** i18n aria-label кнопки «снести все». */
  clearAllLabel?: string
  /**
   * Имя контрола, когда он используется вне `GrFormField`. Внутри поля имя даёт
   * связка с его `<label for>` — там проп не нужен. Без того и другого у инпута
   * нет доступного имени вовсе: placeholder именем не считается.
   */
  ariaLabel?: string
  /** Имя для нативной формы: hidden input на каждый тег. */
  name?: string
  /**
   * Ширины аддонов `prefix`/`suffix` — общий контракт контролов пакета
   * (`docs/form-controls.md`).
   */
  prefixMinWidth?: string
  prefixMaxWidth?: string
  suffixMinWidth?: string
  suffixMaxWidth?: string
  prefixFixed?: boolean
  suffixFixed?: boolean
}

export interface GrInputTagEmits {
  (e: 'update:modelValue', value: string[]): void
  (e: 'add', value: string): void
  (e: 'remove', value: string, index: number): void
  /** Тег не прошёл `beforeAdd`. */
  (e: 'reject', value: string): void
  /** Набор снесён кнопкой «очистить». */
  (e: 'clear'): void
  /** Набор тегов изменился. */
  (e: 'change', value: string[]): void
  (e: 'focus', event: FocusEvent): void
  (e: 'blur', event: FocusEvent): void
}

const props = withDefaults(
  defineProps<GrInputTagProps>(),
  {
    placeholder: undefined,
    disabled: false,
    readonly: false,
    invalid: false,
    required: false,
    state: 'default',
    // Настраивается через `GrConfigProvider`; дефолт — в резолвере ниже.
    size: undefined,
    separators: () => [','],
    allowDuplicates: false,
    trim: true,
    max: undefined,
    addOnBlur: false,
    clearInputOnAdd: true,
    beforeAdd: undefined,
    clearable: undefined,
    loading: false,
    tagTone: 'neutral',
    tagDark: false,
    tagSize: 'md',
    tagRadius: 'round',
    tagClosable: true,
    removeTagLabel: undefined,
    clearAllLabel: undefined,
    ariaLabel: undefined,
    name: undefined,
  },
)

const emit = defineEmits<GrInputTagEmits>()
defineSlots<{
  /** Аддон слева от чипов: иконка, метка. */
  prefix?: () => any
  /** Аддон справа, перед кнопкой очистки. */
  suffix?: () => any
  /** Свой чип: `remove` снимает значение. */
  tag?: (props: { tag: string, index: number, remove: () => void }) => any
}>()

// Fallback из контекста `GrFormField` (id/aria-describedby/invalid/required) —
// как у GrInput и GrSelect: контрол не знает про форму, знает только про поле.
const field = useGrFormFieldContext()
const resolvedId = computed(() => field?.id.value)
const {
  disabled: isDisabled,
  invalid: isInvalid,
  required: isRequired,
  readonly: isReadonly,
} = useGrFormControl(() => props)

// Эффективные значения: локальный проп → `GrConfigProvider` → дефолт компонента.
/** Ширина аддона по умолчанию — та же лестница, что у `GrInput`. */
const ADDON_MIN_WIDTH_BY_SIZE: Record<GrInputTagSize, string> = {
  xs: '2rem',
  sm: '2.25rem',
  md: '2.5rem',
  lg: '3rem',
}

const resolvedSize = useGrComponentSize(() => props.size, { component: 'GrInputTag' })

/**
 * Аддоны — флекс-соседи поля: оболочка тегового поля и так флекс-строка с
 * бейджами, поэтому места паддингом резервировать не нужно.
 */
const { hasPrefix, hasSuffix, prefixEl, suffixEl, prefixStyle, suffixStyle } = useControlAddons(() => props, {
  defaultMinWidth: () => ADDON_MIN_WIDTH_BY_SIZE[resolvedSize.value],
  paddingX: () => '0px',
})
const resolvedClearable = useGrComponentProp('GrInputTag', 'clearable', () => props.clearable, false)

const { t } = useGranularityTranslations()

/**
 * Небуквенный признак состояния: иконка для глаз, скрытая подпись для
 * скринридера. Разбор — `shared/controlState`.
 */
const stateTextId = useId()
const signalState = computed(() => controlSignalState(props.state, isInvalid.value))
const stateIcon = computed(() => (signalState.value === 'success' ? IconCheckCircle : IconAlertTriangle))
const stateIconClass = computed(() => (signalState.value
  ? `${controlStateIconClass} ${controlStateIconColors[signalState.value]}`
  : ''))
const stateText = computed(() => (signalState.value
  ? t(controlStateTextKey[signalState.value], controlStateFallbackText[signalState.value])
  : ''))

const describedBy = computed(() =>
  [field?.describedById.value, signalState.value ? stateTextId : undefined]
    .filter(Boolean)
    .join(' ') || undefined,
)
const resolvedClearAllLabel = computed(() => props.clearAllLabel ?? t('gr.inputTag.clearAll', 'Clear all tags'))

function removeTagLabelFor(tag: string): string {
  // Безликое «Remove tag» на двадцати кнопках подряд не даёт выбрать нужную:
  // имя обязано называть сам тег.
  return props.removeTagLabel ?? t('gr.inputTag.removeTagNamed', 'Remove tag {tag}', { tag })
}

const inputValue = ref('')
const inputEl = ref<HTMLInputElement | null>(null)
const rootEl = ref<HTMLElement | null>(null)

// Внутри корня фокус ходит между полем и кнопками удаления чипов: без границы
// каждое такое перемещение давало бы потребителю пару `blur` + `focus`.
const { onFocusIn, onFocusOut } = useFocusWithin(rootEl, {
  enter: event => emit('focus', event),
  leave: event => emit('blur', event),
})
/**
 * Инстансы чипов: у кольца цель — кнопка снятия внутри чипа, и достаётся она
 * через `defineExpose` (`removeEl`), а не селектором по DOM.
 */
const chipRefs = ref<Array<{ removeEl: HTMLButtonElement | null } | null>>([])

function setChipRef(index: number) {
  return (el: unknown): void => {
    chipRefs.value[index] = el as { removeEl: HTMLButtonElement | null } | null
  }
}

/**
 * Проп `tagSize` объявлен по шкале бейджа и остаётся публичным контрактом:
 * `md` обязан означать для потребителя тот же кегль, что и раньше.
 */
const chipSize = computed(() => chipSizeForBadgeScale(props.tagSize))

function focus(): void {
  inputEl.value?.focus()
}

function blur(): void {
  inputEl.value?.blur()
}

const isMaxed = computed(() => props.max !== undefined && props.modelValue.length >= props.max)
const canEdit = computed(() => !isDisabled.value && !isReadonly.value)
const showRemove = computed(() => props.tagClosable && canEdit.value)

// Добавление, удаление и достигнутый предел — события, а не состояние виджета:
// показывать их негде, объявить нужно. Это работа общего живого региона.
const { announce } = useAnnouncer()

/**
 * Roving tabindex по крестикам: двадцать тегов давали двадцать одну остановку
 * `Tab`. В таб-порядке ровно один крестик, между ними ходят стрелками.
 *
 * Адресация индексом, а не значением тега: теги допускают повторы, и по
 * значению два одинаковых чипа было бы не различить.
 */
const tagIndexes = computed(() => props.modelValue.map((_, index) => index))

const roving = useRovingFocus<number>({
  items: () => tagIndexes.value,
  elementFor: index => chipRefs.value[index]?.removeEl,
  orientation: () => 'horizontal',
  // Ряд чипов — не кольцо: у него есть край, и за краем стоит поле ввода.
  wrap: () => false,
  onOverflow: (edge) => {
    // За последним чипом — поле ввода: продолжение того же ряда. Слева от
    // первого — начало строки, фокус остаётся на месте.
    if (edge === 'end')
      focus()
    return true
  },
  // Удаление чипа перерисовывает ряд: без ожидания фокус уехал бы на узел,
  // которого уже нет.
  beforeFocus: () => nextTick(),
})

async function focusTag(index: number): Promise<void> {
  const last = props.modelValue.length - 1
  if (last < 0) {
    focus()
    return
  }

  await roving.focusKey(Math.min(Math.max(index, 0), last))
}

function escapeRegexChar(ch: string): string {
  return ch.replace(REGEX_SPECIAL_CHAR_RE, '\\$&')
}

const splitRegex = computed(() => {
  const seps = (props.separators ?? []).filter(Boolean).map(s => s[0]!)
  const uniq = [...new Set([...seps, '\n', '\r', '\t'])]
  const body = uniq.map(escapeRegexChar).join('')
  return new RegExp(`[${body}]+`, 'g')
})

function normalizeTag(raw: string): string {
  return props.trim ? raw.trim() : raw
}

function splitToTags(raw: string): string[] {
  return raw
    .split(splitRegex.value)
    .map(v => normalizeTag(v))
    .filter(Boolean)
}

function addMany(rawTags: string[]): boolean {
  if (!canEdit.value || isMaxed.value)
    return false

  const next = props.modelValue.slice()
  const added: string[] = []

  for (const raw of rawTags) {
    const tag = normalizeTag(raw)
    if (!tag)
      continue

    if (!props.allowDuplicates && next.includes(tag))
      continue

    if (props.max !== undefined && next.length >= props.max)
      break

    next.push(tag)
    added.push(tag)
    emit('add', tag)
  }

  if (!added.length)
    return false

  emit('update:modelValue', next)
  emit('change', next)
  announce(added.length === 1
    ? t('gr.inputTag.added', 'Tag added: {tag}', { tag: added[0]! })
    : t('gr.inputTag.addedMany', '{count} tags added', { count: added.length }))

  return true
}

// Счётчик запуска: пока идёт асинхронная проверка, пользователь успевает нажать
// Enter второй раз — результат устаревшей проверки дописывать нельзя.
let validationRun = 0
const validating = ref(false)
const isBusy = computed(() => props.loading || validating.value)

async function filterAllowed(tags: string[], run: number): Promise<string[] | null> {
  const check = props.beforeAdd
  if (!check)
    return tags

  const allowed: string[] = []

  for (const tag of tags) {
    const ok = await check(tag)
    if (run !== validationRun)
      return null

    if (ok)
      allowed.push(tag)
    else
      emit('reject', tag)
  }

  return allowed
}

async function commitInput(): Promise<void> {
  if (!canEdit.value || !inputValue.value)
    return

  if (isMaxed.value) {
    announce(t('gr.inputTag.limitReached', 'Tag limit reached'))
    return
  }

  const raw = inputValue.value
  const tags = splitToTags(raw)
  if (!tags.length)
    return

  const run = ++validationRun
  validating.value = Boolean(props.beforeAdd)

  const allowed = await filterAllowed(tags, run)

  if (run === validationRun)
    validating.value = false

  if (allowed === null || !allowed.length)
    return

  const changed = addMany(allowed)
  // Значение могло измениться, пока шла проверка: стирать чужой ввод нельзя.
  if (changed && props.clearInputOnAdd && inputValue.value === raw)
    inputValue.value = ''
}

function removeAt(index: number): void {
  if (!canEdit.value)
    return

  const next = props.modelValue.slice()
  const removed = next[index]
  if (removed === undefined)
    return

  next.splice(index, 1)
  emit('update:modelValue', next)
  emit('change', next)
  emit('remove', removed, index)
  announce(t('gr.inputTag.removed', 'Tag removed: {tag}', { tag: removed }))
}

/** Удаление с клавиатуры: фокус переезжает на соседний чип, а не пропадает. */
async function removeAtFromKeyboard(index: number): Promise<void> {
  removeAt(index)
  await nextTick()

  if (props.modelValue.length === 0) {
    focus()
    return
  }

  await focusTag(Math.min(index, props.modelValue.length - 1))
}

function clearAll(): void {
  if (!canEdit.value || props.modelValue.length === 0)
    return

  emit('update:modelValue', [])
  emit('change', [])
  emit('clear')
  announce(t('gr.inputTag.cleared', 'All tags removed'))
  focus()
}

function onInput(e: Event): void {
  inputValue.value = (e.target as HTMLInputElement).value
}

function onKeydown(e: KeyboardEvent): void {
  // Enter/сепаратор во время IME-композиции коммитят её, а не тег.
  if (isComposingEvent(e))
    return
  if (!canEdit.value)
    return

  if (e.key === 'Enter') {
    e.preventDefault()
    void commitInput()
    return
  }

  if ((props.separators ?? []).includes(e.key)) {
    e.preventDefault()
    void commitInput()
    return
  }

  if (inputValue.value.length === 0 && props.modelValue.length > 0) {
    if (e.key === 'Backspace') {
      e.preventDefault()
      removeAt(props.modelValue.length - 1)
      return
    }

    // Из пустого поля стрелка влево уводит на последний чип — дальше по чипам
    // работают те же стрелки, `Tab` для этого не нужен.
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      void focusTag(props.modelValue.length - 1)
    }
  }
}

function onTagKeydown(e: KeyboardEvent, index: number): void {
  if (roving.handleNavigationKeys(e)) {
    return
  }

  if (e.key === 'Delete' || e.key === 'Backspace') {
    e.preventDefault()
    void removeAtFromKeyboard(index)
  }
}

function onBlur(): void {
  if (props.addOnBlur)
    void commitInput()
}

function onPaste(e: ClipboardEvent): void {
  if (!canEdit.value || isMaxed.value)
    return

  const pasted = e.clipboardData?.getData('text')
  if (!pasted)
    return

  const tags = splitToTags(pasted)
  if (tags.length <= 1)
    return

  e.preventDefault()

  const run = ++validationRun
  validating.value = Boolean(props.beforeAdd)

  void filterAllowed(tags, run).then((allowed) => {
    if (run === validationRun)
      validating.value = false

    if (allowed?.length)
      addMany(allowed)
  })
}

const wrapperClassName = computed(() => {
  return grInputTagWrapperClass({
    size: resolvedSize.value,
    state: props.state,
    invalid: isInvalid.value,
    disabled: isDisabled.value,
  })
})

const inputClassName = computed(() => grInputTagInputClass(resolvedSize.value))

const showClearAll = computed(() => resolvedClearable.value && canEdit.value && props.modelValue.length > 0)

const placeholderText = computed(() => props.modelValue.length > 0 ? undefined : props.placeholder)

defineExpose({ focus, blur, clear: clearAll })

if (__GR_DEV__) {
  watchEffect(() => {
    if (!Array.isArray(props.modelValue)) {
      console.warn(
        `[granularity] GrInputTag: обязательный проп \`modelValue\` должен быть массивом — получено ${String(props.modelValue)}.`,
      )
    }
  })
}
</script>

<template>
  <div
    ref="rootEl"
    data-gr-input-tag
    data-testid="gr-input-tag"
    :class="wrapperClassName"
    @click="focus"
    @focusin="onFocusIn"
    @focusout="onFocusOut"
  >
    <span
      v-if="hasPrefix"
      ref="prefixEl"
      data-gr-input-tag-prefix
      class="inline-flex shrink-0 items-center justify-center text-[var(--gr-muted-fg)]"
      :style="prefixStyle"
    >
      <slot name="prefix" />
    </span>

    <!-- Нативная форма: hidden на каждый тег — стандартная сериализация набора. -->
    <template v-if="name">
      <input
        v-for="(tag, tagIndex) in modelValue"
        :key="`hidden-${tagIndex}`"
        type="hidden"
        :name="name"
        :value="tag"
      >
    </template>
    <!--
      `display: contents` — список нужен ради роли, а не ради раскладки: чипы
      обязаны переноситься в одном потоке с полем ввода.
    -->
    <span v-if="modelValue.length" role="list" class="contents">
      <GrChip
        v-for="(tag, i) in modelValue"
        :key="`${tag}-${i}`"
        :ref="setChipRef(i)"
        role="listitem"
        :tone="tagTone"
        :dark="tagDark"
        :size="chipSize"
        :radius="tagRadius"
        :closable="showRemove"
        :remove-label="removeTagLabelFor(tag)"
        :remove-tabindex="roving.tabindexFor(i)"
        data-gr-input-tag-item
        data-testid="gr-input-tag-item"
        :data-index="i"
        @remove="removeAt(i)"
        @focusin="roving.setActive(i)"
        @keydown="onTagKeydown($event, i)"
      >
        <slot name="tag" :tag="tag" :index="i" :remove="() => removeAt(i)">
          <span class="truncate max-w-[18rem]">{{ tag }}</span>
        </slot>
      </GrChip>
    </span>

    <input
      :id="resolvedId"
      ref="inputEl"
      data-gr-input-tag-input
      data-testid="gr-input-tag-input"
      :value="inputValue"
      :disabled="isDisabled"
      :readonly="isReadonly"
      :placeholder="placeholderText"
      :aria-label="ariaLabel"
      :aria-describedby="describedBy"
      :aria-required="isRequired ? 'true' : undefined"
      :aria-readonly="isReadonly ? 'true' : undefined"
      :aria-invalid="isInvalid ? 'true' : undefined"
      :aria-busy="isBusy ? 'true' : undefined"
      class="flex-1 min-w-[120px] bg-transparent border-none outline-none placeholder:text-[var(--gr-muted-fg)]"
      :class="inputClassName"
      @input="onInput"
      @keydown="onKeydown"
      @blur="onBlur"
      @paste="onPaste"
    >

    <span
      v-if="hasSuffix"
      ref="suffixEl"
      data-gr-input-tag-suffix
      class="inline-flex shrink-0 items-center justify-center text-[var(--gr-muted-fg)]"
      :style="suffixStyle"
    >
      <slot name="suffix" />
    </span>

    <span
      v-if="isBusy"
      data-gr-input-tag-spinner
      :class="spinnerClass"
      aria-hidden="true"
    >
      <GrIcon size="sm">
        <IconLoader class="animate-spin" />
      </GrIcon>
    </span>

    <span
      v-if="signalState"
      data-gr-input-tag-state
      :class="stateIconClass"
      aria-hidden="true"
    >
      <component :is="stateIcon" class="h-4 w-4" />
    </span>

    <span v-if="signalState" :id="stateTextId" data-gr-input-tag-state-text class="sr-only">{{ stateText }}</span>

    <button
      v-if="showClearAll"
      type="button"
      data-gr-input-tag-clear
      :class="clearButtonClass"
      :aria-label="resolvedClearAllLabel"
      @mousedown.prevent.stop
      @click.stop="clearAll"
    >
      <GrIcon size="sm">
        <IconClose />
      </GrIcon>
    </button>
  </div>
</template>
