<script setup lang="ts">
import { computed } from 'vue'

import IconMenu from '~icons/lucide/menu'

import { useGranularityTranslations } from '../../internal/granularityI18n'
import DsButton from '../DsButton/DsButton.vue'
import DsIcon from '../DsIcon/DsIcon.vue'

/**
 * DsNavbar — верхняя панель приложения (header) с заголовком,
 * опциональной кнопкой меню (обычно — для мобильных) и правым слотом
 * для действий/аватара.
 *
 * - Корень — `<header>` (landmark), без собственного `role`.
 * - `aria-label` кнопки меню локализуется через `useGranularityTranslations`.
 */
export interface DsNavbarProps {
  title: string
  showMenuButton?: boolean
  /** Extra classes applied to the menu button wrapper (e.g. `sm:hidden`). */
  menuButtonClass?: string
}

withDefaults(defineProps<DsNavbarProps>(), {
  showMenuButton: false,
  menuButtonClass: '',
})

const emit = defineEmits<{
  (e: 'menu'): void
}>()

const { t } = useGranularityTranslations()

const menuAriaLabel = computed(() => t('ds.navbar.openMenu', 'Open menu'))
</script>

<template>
  <header
    data-ds-navbar
    class="h-[56px] border-b border-[var(--brd)] bg-[var(--bg)] flex items-center justify-between px-4 sm:px-6"
  >
    <div class="flex items-center gap-3">
      <DsButton
        v-if="showMenuButton"
        data-ds-navbar-menu
        variant="ghost"
        size="sm"
        square
        :aria-label="menuAriaLabel"
        :class="menuButtonClass"
        @click="emit('menu')"
      >
        <DsIcon :size="16">
          <IconMenu aria-hidden="true" />
        </DsIcon>
      </DsButton>
      <div data-ds-navbar-title class="text-[14px] font-700">
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
