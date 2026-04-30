<script setup lang="ts">
import IconInbox from '~icons/lucide/inbox'

import GrIcon from '../GrIcon/GrIcon.vue'

/**
 * GrEmptyState — карточка пустого состояния с иконкой, заголовком,
 * опциональным описанием и CTA-слотом.
 *
 * - Иконка по умолчанию — `lucide/inbox`, кастомизируется через слот `#icon`.
 * - Default-слот рендерится как контейнер для действий (центрирован).
 */
export interface GrEmptyStateProps {
  title: string
  description?: string
}

withDefaults(defineProps<GrEmptyStateProps>(), {
  description: undefined,
})
</script>

<template>
  <div
    data-ds-empty-state
    class="rounded-[var(--ds-radius-lg)] border border-[var(--brd)] bg-[var(--card)] p-6 text-center"
  >
    <div class="flex justify-center">
      <div class="h-12 w-12 rounded-[12px] bg-[var(--muted)] border border-[var(--brd)] flex items-center justify-center text-[var(--muted-fg)]">
        <slot name="icon">
          <GrIcon :size="24">
            <IconInbox aria-hidden="true" />
          </GrIcon>
        </slot>
      </div>
    </div>

    <div class="mt-4 text-[14px] font-700">
      {{ title }}
    </div>

    <div v-if="description" class="mt-1 text-[13px] text-[var(--muted-fg)]">
      {{ description }}
    </div>

    <div v-if="$slots.default" class="mt-4 flex justify-center">
      <slot />
    </div>
  </div>
</template>
