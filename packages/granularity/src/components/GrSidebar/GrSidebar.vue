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

import { GR_SIDEBAR_KEY } from './sidebarContext'

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
  /** A11y-лейбл кнопки тогла. */
  toggleLabel?: string
}

const props = withDefaults(defineProps<GrSidebarProps>(), {
  title: undefined,
  subtitle: undefined,
  collapsed: false,
  showToggleButton: false,
  width: '240px',
  collapsedWidth: '64px',
  toggleLabel: undefined,
})

const emit = defineEmits<{
  (e: 'update:collapsed', value: boolean): void
}>()

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

const resolvedToggleLabel = computed(() =>
  props.toggleLabel ?? (collapsedState.value ? 'Expand sidebar' : 'Collapse sidebar'),
)
</script>

<template>
  <aside
    data-gr-sidebar
    :data-collapsed="collapsedState ? 'true' : undefined"
    class="flex flex-col border-r border-[var(--sidebar-brd)] bg-[var(--sidebar)] text-[var(--sidebar-fg)] transition-[width] duration-200 ease-out"
    :style="asideStyle"
  >
    <div
      v-if="showHeader"
      data-gr-sidebar-header
      class="flex items-center gap-2 border-b border-[var(--sidebar-brd)] px-3 py-4"
      :class="collapsedState ? 'justify-center' : 'justify-between'"
    >
      <div
        v-if="!collapsedState && (hasTitle || hasSubtitle || $slots.title || $slots.subtitle)"
        class="min-w-0"
      >
        <div
          v-if="$slots.subtitle || hasSubtitle"
          data-gr-sidebar-subtitle
          class="truncate text-[14px] text-[var(--muted-fg)]"
        >
          <slot name="subtitle">
            {{ subtitle }}
          </slot>
        </div>
        <div
          v-if="$slots.title || hasTitle"
          data-gr-sidebar-title
          class="truncate text-[18px] font-700"
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
        @click="toggle"
      >
        <GrIcon :size="16" aria-hidden="true">
          <IconChevronRight v-if="collapsedState" />
          <IconChevronLeft v-else />
        </GrIcon>
      </GrButton>
    </div>

    <div class="flex-1 overflow-y-auto" :class="collapsedState ? 'p-2' : 'p-3'">
      <slot />
    </div>
  </aside>
</template>
