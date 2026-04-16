<script setup lang="ts">
import { computed } from 'vue'

import { useToast } from '../../composables/useToast'
import DsButton from '../DsButton'

import IconCheck from '~icons/lucide/check-circle'
import IconWarning from '~icons/lucide/alert-triangle'
import IconError from '~icons/lucide/x-circle'
import IconInfo from '~icons/lucide/info'
import IconClose from '~icons/lucide/x'

const { list, dismiss } = useToast()

const items = computed(() => list.value)

function iconFor(variant: string) {
  if (variant === 'success') return IconCheck
  if (variant === 'warning') return IconWarning
  if (variant === 'danger') return IconError
  return IconInfo
}

function colorFor(variant: string): string {
  if (variant === 'success') return 'var(--ds-success)'
  if (variant === 'warning') return 'var(--ds-warning)'
  if (variant === 'danger') return 'var(--ds-danger)'
  return 'var(--ds-info)'
}
</script>

<template>
  <teleport to="body">
    <div class="fixed right-4 top-4 z-50 grid w-[360px] max-w-[calc(100vw-2rem)] gap-3">
      <div
        v-for="toast in items"
        :key="toast.id"
        class="rounded-[var(--ds-radius-lg)] border border-[var(--brd)] bg-[var(--card)] px-4 py-3 shadow-[var(--ds-shadow-2)]"
      >
        <div class="flex items-start gap-3">
          <component :is="iconFor(toast.variant)" class="mt-0.5 h-5 w-5" :style="{ color: colorFor(toast.variant) }" aria-hidden="true" />
          <div class="min-w-0 flex-1">
            <div class="text-[13px] font-700">
              {{ toast.title }}
            </div>
            <div v-if="toast.message" class="mt-0.5 text-[13px] ds-muted">
              {{ toast.message }}
            </div>
          </div>
          <DsButton
            variant="ghost"
            size="sm"
            square
            aria-label="Dismiss"
            @click="dismiss(toast.id)"
          >
            <IconClose class="h-4 w-4" aria-hidden="true" />
          </DsButton>
        </div>
      </div>
    </div>
  </teleport>
</template>