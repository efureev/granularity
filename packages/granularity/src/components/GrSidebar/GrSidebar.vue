<script setup lang="ts">
/**
 * GrSidebar — боковая панель приложения с опциональным заголовком, кнопкой
 * сворачивания и слотом контента (обычно — список `GrSidebarItem`).
 *
 * - Свёрнутое состояние (`collapsed`, поддерживает `v-model:collapsed`) сужает
 *   панель до иконочной ширины; `GrSidebarItem`'ы через inject показывают только
 *   иконку (или первую букву метки).
 * - Кнопка тогла (`show-toggle-button`) переключает состояние.
 * - Хедер рендерится только если есть `title`/`subtitle` (или кнопка тогла) —
 *   иначе панель начинается сразу с контента.
 * - Слоты `#title` / `#subtitle` имеют приоритет над одноимёнными пропами.
 */
import { computed, provide, ref, watch } from 'vue'

import GrButton from '../GrButton/GrButton.vue'
import GrIcon from '../GrIcon/GrIcon.vue'
import IconChevronLeft from '~icons/lucide/chevron-left'
import IconChevronRight from '~icons/lucide/chevron-right'
import { useGranularityTranslations } from '../../internal/granularityI18n'

import {
  contentBase,
  grSidebarCollapseDirection,
  grSidebarRootClass,
  headerBase,
  subtitleClass,
  titleClass,
  type GrSidebarLandmark,
  type GrSidebarPosition,
} from './grSidebarStyles'
import { GR_SIDEBAR_KEY } from './sidebarContext'

export type { GrSidebarLandmark, GrSidebarPosition } from './grSidebarStyles'

export interface GrSidebarProps {
  title?: string
  subtitle?: string
  /** Свёрнутое состояние. Поддерживает `v-model:collapsed`. */
  collapsed?: boolean
  /** Показать кнопку сворачивания/разворачивания в хедере. */
  showToggleButton?: boolean
  /** Ширина в развёрнутом состоянии. */
  width?: string
  /** Ширина в свёрнутом состоянии. */
  collapsedWidth?: string
  /** A11y-лейбл кнопки тогла. Не задан — берётся из локали (`gr.sidebar.*`). */
  toggleLabel?: string
  /** Сторона экрана: граница и направление шеврона зеркалятся. */
  position?: GrSidebarPosition
  /**
   * Лендмарк корня. `complementary` (по умолчанию) — `<aside>`; `navigation` —
   * `<nav>` для панели, которая действительно является навигацией. Вложенный
   * `<nav>` внутрь `<aside>` не заводим: два лендмарка на одну панель засоряют
   * обзор, а панель фильтров навигацией не является вовсе.
   */
  landmark?: GrSidebarLandmark
  /** Имя лендмарка: без него две панели на странице неразличимы. */
  ariaLabel?: string
}

export interface GrSidebarEmits {
  (e: 'update:collapsed', value: boolean): void
}

const props = withDefaults(defineProps<GrSidebarProps>(), {
  title: undefined,
  subtitle: undefined,
  collapsed: false,
  showToggleButton: false,
  width: '240px',
  collapsedWidth: '64px',
  toggleLabel: undefined,
  position: 'left',
  landmark: 'complementary',
  ariaLabel: undefined,
})

const { t } = useGranularityTranslations()

const emit = defineEmits<GrSidebarEmits>()

// Локальное состояние с синхронизацией из пропа — поддерживает и controlled
// (`v-model:collapsed`), и uncontrolled (панель сама помнит состояние).
const collapsedState = ref(props.collapsed)
watch(() => props.collapsed, value => (collapsedState.value = value))

function toggle(): void {
  collapsedState.value = !collapsedState.value
  emit('update:collapsed', collapsedState.value)
}

// Даём `GrSidebarItem`'ам знать про свёрнутость.
provide(GR_SIDEBAR_KEY, { collapsed: collapsedState })

const hasTitle = computed(() => Boolean(props.title))
const hasSubtitle = computed(() => Boolean(props.subtitle))
const showHeader = computed(() => Boolean(hasTitle.value || hasSubtitle.value || props.showToggleButton))

const asideStyle = computed(() => ({
  width: collapsedState.value ? props.collapsedWidth : props.width,
}))

const resolvedToggleLabel = computed(() => props.toggleLabel ?? (collapsedState.value
  ? t('gr.sidebar.expand', 'Expand sidebar')
  : t('gr.sidebar.collapse', 'Collapse sidebar')))

const rootTag = computed(() => (props.landmark === 'navigation' ? 'nav' : 'aside'))
const rootClass = computed(() => grSidebarRootClass(props.position))

const collapseDirection = computed(() => grSidebarCollapseDirection(props.position, collapsedState.value))
const collapseIcon = computed(() => (collapseDirection.value === 'right' ? IconChevronRight : IconChevronLeft))
</script>

<template>
  <component
    :is="rootTag"
    data-gr-sidebar
    :data-collapsed="collapsedState ? 'true' : undefined"
    :data-position="position"
    :aria-label="ariaLabel"
    :class="rootClass"
    :style="asideStyle"
  >
    <div
      v-if="showHeader"
      data-gr-sidebar-header
      :class="[headerBase, collapsedState ? 'justify-center' : 'justify-between']"
    >
      <div
        v-if="!collapsedState && (hasTitle || hasSubtitle || $slots.title || $slots.subtitle)"
        class="min-w-0"
      >
        <div
          v-if="$slots.subtitle || hasSubtitle"
          data-gr-sidebar-subtitle
          :class="subtitleClass"
        >
          <slot name="subtitle">
            {{ subtitle }}
          </slot>
        </div>
        <div
          v-if="$slots.title || hasTitle"
          data-gr-sidebar-title
          :class="titleClass"
        >
          <slot name="title">
            {{ title }}
          </slot>
        </div>
      </div>

      <GrButton
        v-if="showToggleButton"
        data-gr-sidebar-toggle
        variant="ghost"
        size="sm"
        square
        :aria-label="resolvedToggleLabel"
        :aria-expanded="collapsedState ? 'false' : 'true'"
        :data-direction="collapseDirection"
        @click="toggle"
      >
        <GrIcon :size="16">
          <component :is="collapseIcon" />
        </GrIcon>
      </GrButton>
    </div>

    <div
      data-gr-sidebar-content
      tabindex="0"
      :class="[contentBase, collapsedState ? 'p-2' : 'p-3']"
    >
      <slot />
    </div>
  </component>
</template>
