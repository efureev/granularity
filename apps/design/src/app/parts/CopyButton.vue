<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'

import IconCheck from '~icons/lucide/check'
import IconCopy from '~icons/lucide/copy'

const props = defineProps<{
  text: string
  /** Что копируется — имя кнопки и подсказка. */
  label: string
}>()

const copied = ref(false)
let reset: ReturnType<typeof setTimeout> | undefined

async function copy(): Promise<void> {
  try {
    await navigator.clipboard.writeText(props.text)
  }
  catch {
    // Буфер обмена недоступен (нет разрешения, не HTTPS): подтверждать нечего.
    return
  }
  copied.value = true
  clearTimeout(reset)
  reset = setTimeout(() => {
    copied.value = false
  }, 1600)
}

onBeforeUnmount(() => clearTimeout(reset))
</script>

<template>
  <GrTooltip :text="copied ? 'Скопировано' : label">
    <GrButton variant="ghost" tone="neutral" size="sm" square :aria-label="label" @click="copy">
      <GrIcon>
        <IconCheck v-if="copied" />
        <IconCopy v-else />
      </GrIcon>
    </GrButton>
  </GrTooltip>
  <span class="sr-only" aria-live="polite">{{ copied ? 'Скопировано' : '' }}</span>
</template>
