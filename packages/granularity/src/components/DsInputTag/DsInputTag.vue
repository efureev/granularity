<script setup lang="ts">
import { computed, ref } from 'vue'

import IconClose from '~icons/lucide/x'

import DsBadge from '../DsBadge/DsBadge.vue'
import type { DsBadgeRadius, DsBadgeSize, DsBadgeTone } from '../DsBadge'
export type { DsInputTagSize, DsInputTagState } from './dsInputTagStyles'

import {
  dsInputTagInputClass,
  dsInputTagWrapperClass,
  type DsInputTagSize,
  type DsInputTagState,
} from './dsInputTagStyles'

const REGEX_SPECIAL_CHAR_RE = /[.*+?^${}()|[\]\\]/g

const props = withDefaults(
  defineProps<{
    modelValue: string[]
    placeholder?: string
    disabled?: boolean
    readonly?: boolean
    invalid?: boolean
    state?: DsInputTagState
    size?: DsInputTagSize
    separators?: string[]
    allowDuplicates?: boolean
    trim?: boolean
    max?: number
    addOnBlur?: boolean
    clearInputOnAdd?: boolean
    tagTone?: DsBadgeTone
    tagDark?: boolean
    tagSize?: DsBadgeSize
    tagRadius?: DsBadgeRadius
    tagClosable?: boolean
  }>(),
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
  return dsInputTagWrapperClass({
    size: props.size,
    state: props.state,
    invalid: props.invalid,
    disabled: props.disabled,
  })
})

const inputClassName = computed(() => {
  return dsInputTagInputClass(props.size)
})

const placeholderText = computed(() => props.modelValue.length > 0 ? undefined : props.placeholder)
</script>

<template>
  <div
    data-testid="ds-input-tag"
    class="w-full flex flex-wrap items-center rounded-md border bg-[var(--bg)] text-[var(--fg)] transition-colors duration-150 focus-within:ring-2 focus-within:ring-[var(--ring)]"
    :class="wrapperClassName"
    @click="focus"
  >
    <DsBadge
      v-for="(tag, i) in props.modelValue"
      :key="`${tag}-${i}`"
      :tone="props.tagTone"
      :dark="props.tagDark"
      :size="props.tagSize"
      :radius="props.tagRadius"
      class="gap-1"
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
        aria-label="Remove tag"
        data-testid="ds-input-tag-remove"
        :data-index="i"
        @mousedown.prevent.stop
        @click.stop="removeAt(i)"
      >
        <IconClose class="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </DsBadge>

    <input
      ref="inputEl"
      data-testid="ds-input-tag-input"
      :value="inputValue"
      :disabled="props.disabled || isMaxed"
      :readonly="props.readonly"
      :placeholder="placeholderText"
      :aria-invalid="props.invalid ? 'true' : undefined"
      class="flex-1 min-w-[120px] bg-transparent border-none outline-none placeholder:text-[var(--muted-fg)]"
      :class="inputClassName"
      @input="onInput"
      @keydown="onKeydown"
      @blur="onBlur"
      @paste="onPaste"
    >
  </div>
</template>