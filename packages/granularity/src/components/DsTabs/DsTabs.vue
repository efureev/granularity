<script setup lang="ts">
import { computed } from 'vue'

export type DsTab = {
  value: string
  label: string
  badge?: string
}

const props = defineProps<{
  modelValue: string
  tabs: DsTab[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const activeIndex = computed(() => props.tabs.findIndex(t => t.value === props.modelValue))

function select(value: string): void {
  emit('update:modelValue', value)
}

function onKeydown(event: KeyboardEvent): void {
  if (props.tabs.length === 0)
    return

  const currentIndex = activeIndex.value < 0 ? 0 : activeIndex.value

  if (event.key === 'ArrowRight') {
    event.preventDefault()
    const nextTab = props.tabs[(currentIndex + 1) % props.tabs.length]

    if (nextTab)
      select(nextTab.value)
  }

  if (event.key === 'ArrowLeft') {
    event.preventDefault()
    const nextTab = props.tabs[(currentIndex - 1 + props.tabs.length) % props.tabs.length]

    if (nextTab)
      select(nextTab.value)
  }
}
</script>

<template>
  <div
    role="tablist"
    class="inline-flex flex-wrap gap-1 rounded-[var(--ds-radius-lg)] border border-[var(--brd)] bg-[var(--muted)] p-1"
    @keydown="onKeydown"
  >
    <button
      v-for="tab in props.tabs"
      :key="tab.value"
      type="button"
      role="tab"
      :aria-selected="tab.value === props.modelValue ? 'true' : 'false'"
      class="h-9 px-3 rounded-[10px] text-sm font-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
      :class="tab.value === props.modelValue
        ? 'bg-[var(--card)] text-[var(--fg)] border border-[var(--brd)]'
        : 'text-[var(--muted-fg)] hover:text-[var(--fg)] hover:bg-[color-mix(in_srgb,var(--card)_70%,transparent)]'"
      @click="select(tab.value)"
    >
      <span class="inline-flex items-center gap-2">
        <span>{{ tab.label }}</span>
        <span
          v-if="tab.badge"
          class="text-[11px] px-1.5 py-0.5 rounded-full bg-[var(--secondary)] text-[var(--secondary-fg)]"
        >
          {{ tab.badge }}
        </span>
      </span>
    </button>
  </div>
</template>