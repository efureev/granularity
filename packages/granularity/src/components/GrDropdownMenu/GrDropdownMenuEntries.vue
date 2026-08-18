<script setup lang="ts">
/**
 * Рендер декларативной модели меню — без обёртки списка: её ставит потребитель,
 * потому что `dividers`/`borderTop` принадлежат конкретному меню, а не модели.
 *
 * Вынесено из `GrDropdownMenu` ради `GrContextMenu`: модель у них общая, и
 * вторая копия цикла разошлась бы с первой при первом же новом поле пункта.
 */
import GrDropdownMenuDivider from './GrDropdownMenuDivider.vue'
import GrDropdownMenuGroup from './GrDropdownMenuGroup.vue'
import GrDropdownMenuItem from './GrDropdownMenuItem.vue'
import type { GrDropdownMenuAction, GrDropdownMenuEntry } from './menuModel'
import { isMenuAction, isMenuSection, isMenuSeparator } from './menuModel'

export interface GrDropdownMenuEntriesProps {
  items?: GrDropdownMenuEntry[]
}

export interface GrDropdownMenuEntriesEmits {
  (e: 'select', item: GrDropdownMenuAction): void
}

defineProps<GrDropdownMenuEntriesProps>()

const emit = defineEmits<GrDropdownMenuEntriesEmits>()

function itemProps(item: GrDropdownMenuAction): Record<string, unknown> {
  return {
    href: item.href,
    target: item.target,
    rel: item.rel,
    external: item.external,
    disabled: item.disabled,
    variant: item.variant,
    role: item.role,
    checked: item.checked,
    icon: item.icon,
    shortcut: item.shortcut,
  }
}

function onSelect(item: GrDropdownMenuAction): void {
  if (item.disabled)
    return

  emit('select', item)
}
</script>

<template>
  <template v-for="(entry, index) in items ?? []">
    <GrDropdownMenuDivider
      v-if="isMenuSeparator(entry)"
      :key="`divider-${index}`"
      :inset="entry.inset"
    />

    <GrDropdownMenuGroup
      v-else-if="isMenuSection(entry)"
      :key="`group-${entry.title ?? index}`"
      :title="entry.title"
    >
      <GrDropdownMenuItem
        v-for="item in entry.items"
        :key="item.key"
        v-bind="itemProps(item)"
        @click="onSelect(item)"
      >
        {{ item.label }}
      </GrDropdownMenuItem>
    </GrDropdownMenuGroup>

    <GrDropdownMenuItem
      v-else-if="isMenuAction(entry)"
      :key="entry.key"
      v-bind="itemProps(entry)"
      @click="onSelect(entry)"
    >
      {{ entry.label }}
    </GrDropdownMenuItem>
  </template>
</template>
