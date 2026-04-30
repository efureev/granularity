<script setup lang="ts">
import { computed, ref } from 'vue'

import GrBadge from '../GrBadge/GrBadge.vue'
import type { GrBadgeRadius, GrBadgeSize, GrBadgeTone } from '../GrBadge'
import GrIcon from '../GrIcon/GrIcon.vue'
import IconClose from '~icons/lucide/x'

import {
  grInputTagInputClass,
  grInputTagWrapperClass,
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
  state?: GrInputTagState
  size?: GrInputTagSize
  separators?: string[]
  allowDuplicates?: boolean
  trim?: boolean
  max?: number
  addOnBlur?: boolean
  clearInputOnAdd?: boolean
  tagTone?: GrBadgeTone
  tagDark?: boolean
  tagSize?: GrBadgeSize
  tagRadius?: GrBadgeRadius
  tagClosable?: boolean
  /** i18n-friendly aria-label for the per-tag remove button. */
  removeTagLabel?: string
}

const props = withDefaults(
  defineProps<GrInputTagProps>(),
  {
    placeholder: undefined,
    disabled: false,
    readonly: false,
    invalid: false,
    state: 'default',
    size: 'md',
    separators: () => [','],
    allowDuplicates: false,
    trim: true,
    max: undefined,
    addOnBlur: false,
    clearInputOnAdd: true,
    tagTone: 'neutral',
    tagDark: false,
    tagSize: 'md',
    tagRadius: 'round',
    tagClosable: true,
    removeTagLabel: 'Remove tag',
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void
  (e: 'add', value: string): void
  (e: 'remove', value: string, index: number): void
}>()

const inputValue = ref('')
const inputEl = ref<HTMLInputElement | null>(null)

function focus(): void {
  inputEl.value?.focus()
}

defineExpose({ focus })

const isMaxed = computed(() => props.max !== undefined && props.modelValue.length >= props.max)
const canEdit = computed(() => !props.disabled && !props.readonly)
const showRemove = computed(() => props.tagClosable && canEdit.value)

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
  let changed = false

  for (const raw of rawTags) {
    const tag = normalizeTag(raw)
    if (!tag)
      continue

    if (!props.allowDuplicates && next.includes(tag))
      continue

    if (props.max !== undefined && next.length >= props.max)
      break

    next.push(tag)
    changed = true
    emit('add', tag)
  }

  if (!changed)
    return false

  emit('update:modelValue', next)
  return true
}

function commitInput(): void {
  if (!canEdit.value || isMaxed.value || !inputValue.value)
    return

  const tags = splitToTags(inputValue.value)
  if (!tags.length)
    return

  const changed = addMany(tags)
  if (changed && props.clearInputOnAdd)
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
}

function onInput(e: Event): void {
  inputValue.value = (e.target as HTMLInputElement).value
}

function onKeydown(e: KeyboardEvent): void {
  if (!canEdit.value)
    return

  if (e.key === 'Enter') {
    e.preventDefault()
    commitInput()
    return
  }

  if ((props.separators ?? []).includes(e.key)) {
    e.preventDefault()
    commitInput()
    return
  }

  if (e.key === 'Backspace' && inputValue.value.length === 0 && props.modelValue.length > 0) {
    e.preventDefault()
    removeAt(props.modelValue.length - 1)
  }
}

function onBlur(): void {
  if (props.addOnBlur)
    commitInput()
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
  addMany(tags)
}

const wrapperClassName = computed(() => {
  return grInputTagWrapperClass({
    size: props.size,
    state: props.state,
    invalid: props.invalid,
    disabled: props.disabled,
  })
})

const inputClassName = computed(() => {
  return grInputTagInputClass(props.size)
})

const placeholderText = computed(() => props.modelValue.length > 0 ? undefined : props.placeholder)
</script>

<template>
  <div
    data-ds-input-tag
    data-testid="ds-input-tag"
    class="w-full flex flex-wrap items-center rounded-md border bg-[var(--bg)] text-[var(--fg)] transition-colors duration-150 focus-within:ring-2 focus-within:ring-[var(--ring)]"
    :class="wrapperClassName"
    @click="focus"
  >
    <GrBadge
      v-for="(tag, i) in modelValue"
      :key="`${tag}-${i}`"
      :tone="tagTone"
      :dark="tagDark"
      :size="tagSize"
      :radius="tagRadius"
      class="gap-1"
      data-ds-input-tag-item
      data-testid="ds-input-tag-item"
      :data-index="i"
    >
      <slot name="tag" :tag="tag" :index="i" :remove="() => removeAt(i)">
        <span class="truncate max-w-[18rem]">{{ tag }}</span>
      </slot>

      <button
        v-if="showRemove"
        type="button"
        class="-mr-0.5 inline-flex items-center justify-center rounded-[6px] p-0.5 opacity-70 hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
        :aria-label="removeTagLabel"
        data-ds-input-tag-remove
        data-testid="ds-input-tag-remove"
        :data-index="i"
        @mousedown.prevent.stop
        @click.stop="removeAt(i)"
      >
        <GrIcon size="sm" aria-hidden="true">
          <IconClose />
        </GrIcon>
      </button>
    </GrBadge>

    <input
      ref="inputEl"
      data-ds-input-tag-input
      data-testid="ds-input-tag-input"
      :value="inputValue"
      :disabled="disabled || isMaxed"
      :readonly="readonly"
      :placeholder="placeholderText"
      :aria-invalid="invalid ? 'true' : undefined"
      class="flex-1 min-w-[120px] bg-transparent border-none outline-none placeholder:text-[var(--muted-fg)]"
      :class="inputClassName"
      @input="onInput"
      @keydown="onKeydown"
      @blur="onBlur"
      @paste="onPaste"
    >
  </div>
</template>
