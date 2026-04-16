<script setup lang="ts">
import { computed } from 'vue'

import IconMenu from '~icons/lucide/menu'

import { useGranularityTranslations } from '../../internal/granularityI18n'
import DsButton from '../DsButton/DsButton.vue'

const { t } = useGranularityTranslations()

withDefaults(
  defineProps<{
    title: string
    showMenuButton?: boolean
    /** Extra classes applied to the menu button wrapper (e.g. `sm:hidden`). */
    menuButtonClass?: string
  }>(),
  {
    showMenuButton: false,
    menuButtonClass: '',
  },
)

const emit = defineEmits<{
  (e: 'menu'): void
}>()

const menuAriaLabel = computed(() => {
  return t('ds.navbar.openMenu', 'Open menu')
})
</script>

<template>
  <header class="h-[56px] border-b border-[var(--brd)] bg-[var(--bg)] flex items-center justify-between px-4 sm:px-6">
    <div class="flex items-center gap-3">
      <DsButton
        v-if="showMenuButton"
        variant="ghost"
        size="sm"
        square
        :aria-label="menuAriaLabel"
        :class="menuButtonClass"
        @click="emit('menu')"
      >
        <IconMenu class="h-4 w-4" aria-hidden="true" />
      </DsButton>
      <div class="text-[14px] font-700">
        <slot name="title">
          {{ title }}
        </slot>
      </div>
    </div>

    <div class="flex items-center gap-3">
      <slot />
    </div>
  </header>
</template>