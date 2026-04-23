<script setup lang="ts">
/**
 * DsSidebar — боковая панель приложения с заголовком и слотом контента.
 *
 * Слоты `#title` / `#subtitle` имеют приоритет над одноимёнными пропами
 * и позволяют передать произвольную разметку (иконки, бейджи, действия).
 */
export interface DsSidebarProps {
  title?: string
  subtitle?: string
}

withDefaults(defineProps<DsSidebarProps>(), {
  title: undefined,
  subtitle: undefined,
})
</script>

<template>
  <aside
    data-ds-sidebar
    class="border-r border-[var(--sidebar-brd)] bg-[var(--sidebar)] text-[var(--sidebar-fg)]"
  >
    <div
      v-if="$slots.title || title || $slots.subtitle || subtitle"
      data-ds-sidebar-header
      class="border-b border-[var(--sidebar-brd)] px-4 py-4"
    >
      <div
        v-if="$slots.subtitle || subtitle"
        data-ds-sidebar-subtitle
        class="text-[14px] text-[var(--muted-fg)]"
      >
        <slot name="subtitle">
          {{ subtitle }}
        </slot>
      </div>
      <div
        v-if="$slots.title || title"
        data-ds-sidebar-title
        class="text-[18px] font-700"
      >
        <slot name="title">
          {{ title }}
        </slot>
      </div>
    </div>
    <div class="p-3">
      <slot />
    </div>
  </aside>
</template>
