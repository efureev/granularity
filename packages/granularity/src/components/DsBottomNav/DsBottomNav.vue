<script setup lang="ts">
export type DsBottomNavItem = {
  label: string
  value: string
}

const props = defineProps<{
  modelValue: string
  items: DsBottomNavItem[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()
</script>

<template>
  <nav class="fixed bottom-0 left-0 right-0 border-t border-[var(--brd)] bg-[var(--bg)] px-2 pb-[env(safe-area-inset-bottom)] sm:hidden">
    <div class="h-14 flex items-center justify-around">
      <button
        v-for="it in props.items"
        :key="it.value"
        type="button"
        class="min-w-[44px] min-h-[44px] px-3 rounded-md text-sm font-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
        :class="it.value === props.modelValue ? 'text-[var(--primary)]' : 'text-[var(--muted-fg)] hover:text-[var(--fg)]'"
        @click="emit('update:modelValue', it.value)"
      >
        {{ it.label }}
      </button>
    </div>
  </nav>
</template>