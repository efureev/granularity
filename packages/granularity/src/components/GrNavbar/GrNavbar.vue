<script setup lang="ts">
import { computed } from 'vue'

import IconMenu from '~icons/lucide/menu'

import { useGranularityTranslations } from '../../internal/granularityI18n'
import GrButton from '../GrButton/GrButton.vue'
import GrIcon from '../GrIcon/GrIcon.vue'

import {
  grNavbarRootClass,
  navbarCenterClass,
  navbarRightAlignClass,
  navbarSideClass,
  navbarSideGrowClass,
  navbarTitleClass,
} from './grNavbarStyles'

/**
 * GrNavbar — верхняя панель приложения (header) с тремя зонами: слева заголовок
 * и кнопка меню, по центру — свободная зона (поиск, хлебные крошки), справа —
 * действия и аватар.
 *
 * - Корень — `<header>` (landmark), без собственного `role`.
 * - `aria-label` кнопки меню локализуется через `useGranularityTranslations`.
 */
export interface GrNavbarProps {
  /** Заголовок строкой. Слот `#title` сильнее и позволяет обойтись без пропа. */
  title?: string
  showMenuButton?: boolean
  /** Extra classes applied to the menu button wrapper (e.g. `sm:hidden`). */
  menuButtonClass?: string
  /**
   * Панель прилипает к верху при прокрутке. Слой — `--gr-z-navbar`: он ниже
   * якорных панелей, чтобы открытый список не уезжал под шапку.
   */
  sticky?: boolean
}

const props = withDefaults(defineProps<GrNavbarProps>(), {
  title: undefined,
  showMenuButton: false,
  menuButtonClass: '',
  sticky: false,
})

const slots = defineSlots<{
  /** Заголовок целиком — вместо строки `title`. */
  title?: () => unknown
  /** Зона сразу после заголовка: вкладки, переключатель раздела. */
  left?: () => unknown
  /** Центральная зона: поиск, хлебные крошки. */
  center?: () => unknown
  /** Правая зона: действия, аватар. */
  default?: () => unknown
}>()

const emit = defineEmits<{
  (e: 'menu'): void
}>()

const { t } = useGranularityTranslations()

const menuAriaLabel = computed(() => t('gr.navbar.openMenu', 'Open menu'))

// Пустой блок заголовка съедал бы отступ ряда, поэтому рендерим его только при
// наличии содержимого — проп `title` для этого не обязателен.
const hasTitle = computed(() => Boolean(props.title || slots.title))

const rootClass = computed(() => grNavbarRootClass(props.sticky))

// С центральной зоной боковые делят остаток поровну — иначе «центр» уезжает
// вслед за более широким боком. Без неё правая просто прижата к краю.
const hasCenter = computed(() => Boolean(slots.center))

const sideClass = computed(() => [navbarSideClass, hasCenter.value ? navbarSideGrowClass : ''])
const rightClass = computed(() => [
  navbarSideClass,
  hasCenter.value ? `${navbarSideGrowClass} ${navbarRightAlignClass}` : 'ml-auto',
])
</script>

<template>
  <header
    data-gr-navbar
    :data-sticky="sticky ? 'true' : undefined"
    :class="rootClass"
  >
    <div data-gr-navbar-left :class="sideClass">
      <GrButton
        v-if="showMenuButton"
        data-gr-navbar-menu
        variant="ghost"
        size="sm"
        square
        :aria-label="menuAriaLabel"
        :class="menuButtonClass"
        @click="emit('menu')"
      >
        <GrIcon :size="16">
          <IconMenu aria-hidden="true" />
        </GrIcon>
      </GrButton>

      <div v-if="hasTitle" data-gr-navbar-title :class="navbarTitleClass">
        <slot name="title">
          {{ title }}
        </slot>
      </div>

      <slot name="left" />
    </div>

    <div v-if="hasCenter" data-gr-navbar-center :class="navbarCenterClass">
      <slot name="center" />
    </div>

    <div data-gr-navbar-right :class="rightClass">
      <slot />
    </div>
  </header>
</template>
