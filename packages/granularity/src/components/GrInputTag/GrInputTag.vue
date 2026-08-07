<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'

import GrBadge from '../GrBadge/GrBadge.vue'
import type { GrBadgeRadius, GrBadgeSize, GrBadgeTone } from '../GrBadge'
import GrIcon from '../GrIcon/GrIcon.vue'
import IconClose from '~icons/lucide/x'
import IconLoader from '~icons/lucide/loader-2'
import { useGrComponentProp, useGrComponentSize } from '../GrConfigProvider/context'
import { useGrFormFieldContext } from '../GrFormField/context'
import { useAnnouncer } from '../../composables/useAnnouncer'
import { useGrFormControl } from '../../composables/useGrFormControl'
import { useGranularityTranslations } from '../../internal/granularityI18n'

import {
  clearButtonClass,
  grInputTagInputClass,
  grInputTagWrapperClass,
  removeButtonClass,
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
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void
  (e: 'add', value: string): void
  (e: 'remove', value: string, index: number): void
  /** Тег не прошёл `beforeAdd`. */
  (e: 'reject', value: string): void
  /** Набор снесён кнопкой «очистить». */
  (e: 'clear'): void
}>()

// Fallback из контекста `GrFormField` (id/aria-describedby/invalid/required) —
// как у GrInput и GrSelect: контрол не знает про форму, знает только про поле.
const field = useGrFormFieldContext()
const resolvedId = computed(() => field?.id.value)
const describedBy = computed(() => field?.describedById.value)
const {
  disabled: isDisabled,
  invalid: isInvalid,
  required: isRequired,
  readonly: isReadonly,
} = useGrFormControl(() => props)

// Эффективные значения: локальный проп → `GrConfigProvider` → дефолт компонента.
const resolvedSize = useGrComponentSize(() => props.size, { component: 'GrInputTag' })
const resolvedClearable = useGrComponentProp('GrInputTag', 'clearable', () => props.clearable, false)

const { t } = useGranularityTranslations()
const resolvedClearAllLabel = computed(() => props.clearAllLabel ?? t('gr.inputTag.clearAll', 'Clear all tags'))

function removeTagLabelFor(tag: string): string {
  // Безликое «Remove tag» на двадцати кнопках подряд не даёт выбрать нужную:
  // имя обязано называть сам тег.
  return props.removeTagLabel ?? t('gr.inputTag.removeTagNamed', 'Remove tag {tag}', { tag })
}

const inputValue = ref('')
const inputEl = ref<HTMLInputElement | null>(null)
const removeEls = ref<HTMLButtonElement[]>([])

function setRemoveEl(index: number) {
  return (el: unknown): void => {
    removeEls.value[index] = el as HTMLButtonElement
  }
}

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
 */
const focusedTagIndex = ref(0)
const rovingIndex = computed(() => {
  const last = props.modelValue.length - 1
  if (last < 0)
    return -1
  return Math.min(Math.max(focusedTagIndex.value, 0), last)
})

async function focusTag(index: number): Promise<void> {
  const last = props.modelValue.length - 1
  if (last < 0) {
    focus()
    return
  }

  const target = Math.min(Math.max(index, 0), last)
  focusedTagIndex.value = target
  await nextTick()
  removeEls.value[target]?.focus()
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
  emit('clear')
  announce(t('gr.inputTag.cleared', 'All tags removed'))
  focus()
}

function onInput(e: Event): void {
  inputValue.value = (e.target as HTMLInputElement).value
}

function onKeydown(e: KeyboardEvent): void {
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
  if (e.key === 'ArrowLeft') {
    e.preventDefault()
    void focusTag(index - 1)
    return
  }

  if (e.key === 'ArrowRight') {
    e.preventDefault()
    // За последним чипом — поле ввода: продолжение того же ряда.
    if (index === props.modelValue.length - 1)
      focus()
    else
      void focusTag(index + 1)
    return
  }

  if (e.key === 'Home') {
    e.preventDefault()
    void focusTag(0)
    return
  }

  if (e.key === 'End') {
    e.preventDefault()
    void focusTag(props.modelValue.length - 1)
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
</script>

<template>
  <div
    data-gr-input-tag
    data-testid="gr-input-tag"
    :class="wrapperClassName"
    @click="focus"
  >
    <!--
      `display: contents` — список нужен ради роли, а не ради раскладки: чипы
      обязаны переноситься в одном потоке с полем ввода.
    -->
    <span v-if="modelValue.length" role="list" class="contents">
      <GrBadge
        v-for="(tag, i) in modelValue"
        :key="`${tag}-${i}`"
        role="listitem"
        :tone="tagTone"
        :dark="tagDark"
        :size="tagSize"
        :radius="tagRadius"
        data-gr-input-tag-item
        data-testid="gr-input-tag-item"
        :data-index="i"
      >
        <span class="inline-flex items-center gap-1 align-middle">
          <slot name="tag" :tag="tag" :index="i" :remove="() => removeAt(i)">
            <span class="truncate max-w-[18rem]">{{ tag }}</span>
          </slot>

          <button
            v-if="showRemove"
            :ref="setRemoveEl(i)"
            type="button"
            :class="removeButtonClass"
            :aria-label="removeTagLabelFor(tag)"
            :tabindex="rovingIndex === i ? 0 : -1"
            data-gr-input-tag-remove
            data-testid="gr-input-tag-remove"
            :data-index="i"
            @mousedown.prevent.stop
            @focus="focusedTagIndex = i"
            @keydown="onTagKeydown($event, i)"
            @click.stop="removeAt(i)"
          >
            <GrIcon size="sm">
              <IconClose />
            </GrIcon>
          </button>
        </span>
      </GrBadge>
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
      v-if="isBusy"
      data-gr-input-tag-spinner
      :class="spinnerClass"
      aria-hidden="true"
    >
      <GrIcon size="sm">
        <IconLoader class="animate-spin" />
      </GrIcon>
    </span>

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
