<script setup lang="ts">
/**
 * Рендер декларативной модели меню — без обёртки списка: её ставит потребитель,
 * потому что `dividers`/`borderTop` принадлежат конкретному меню, а не модели.
 *
 * Вынесено из `GrDropdownMenu` ради `GrContextMenu`: модель у них общая, и
 * вторая копия цикла разошлась бы с первой при первом же новом поле пункта.
 *
 * Вложенность рекурсивна и замкнута на сам компонент: подменю получает пункты
 * слотом, поэтому взаимного импорта двух SFC — и его порядка вычисления —
 * не возникает.
 */
import { watchEffect } from 'vue'

import GrDropdownMenuDivider from './GrDropdownMenuDivider.vue'
import GrDropdownMenuGroup from './GrDropdownMenuGroup.vue'
import GrDropdownMenuItem from './GrDropdownMenuItem.vue'
import GrDropdownMenuSub from './GrDropdownMenuSub.vue'
import type { GrDropdownMenuAction, GrDropdownMenuEntry } from './menuModel'
import { isMenuAction, isMenuSection, isMenuSeparator } from './menuModel'

export interface GrDropdownMenuEntriesProps {
  items?: GrDropdownMenuEntry[]
}

export interface GrDropdownMenuEntriesEmits {
  (e: 'select', item: GrDropdownMenuAction): void
}

const props = defineProps<GrDropdownMenuEntriesProps>()

const emit = defineEmits<GrDropdownMenuEntriesEmits>()

function hasSubmenu(item: GrDropdownMenuAction): boolean {
  return (item.children?.length ?? 0) > 0
}

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
    as: item.as,
    align: item.align,
  }
}

function onSelect(item: GrDropdownMenuAction): void {
  if (item.disabled)
    return

  emit('select', item)
}

const warnedSubmenus = new Set<string>()

/**
 * Поля, несовместимые с `children`. Пункт с подменю ничего не выполняет, а
 * ссылка и переключатель обещают обратное — молча выигрывает подменю, и
 * потребитель видит пункт, который «не работает».
 */
function warnSubmenuMisuse(entries: GrDropdownMenuEntry[]): void {
  if (!__GR_DEV__)
    return

  for (const entry of entries) {
    if (isMenuSection(entry)) {
      warnSubmenuMisuse(entry.items)
      continue
    }

    if (!isMenuAction(entry) || !hasSubmenu(entry))
      continue

    const conflict = entry.href ? 'href' : entry.role && entry.role !== 'menuitem' ? `role="${entry.role}"` : null
    if (conflict && !warnedSubmenus.has(entry.key)) {
      warnedSubmenus.add(entry.key)
      console.warn(
        `[GrDropdownMenu] пункт «${entry.key}» задан и с children, и с ${conflict}. `
        + 'Пункт с подменю только раскрывает его: select по нему не приходит, '
        + 'переход по ссылке не выполняется. Оставьте что-то одно.',
      )
    }

    warnSubmenuMisuse(entry.children ?? [])
  }
}

watchEffect(() => warnSubmenuMisuse(props.items ?? []))
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
      :title-align="entry.titleAlign"
      :dividers="entry.dividers"
      :uppercase="entry.uppercase"
    >
      <GrDropdownMenuEntries :items="entry.items" @select="emit('select', $event)" />
    </GrDropdownMenuGroup>

    <GrDropdownMenuSub
      v-else-if="isMenuAction(entry) && hasSubmenu(entry)"
      :key="`sub-${entry.key}`"
      :label="entry.label"
      :icon="entry.icon"
      :disabled="entry.disabled"
      :variant="entry.variant"
      :align="entry.align"
    >
      <GrDropdownMenuEntries :items="entry.children" @select="emit('select', $event)" />
    </GrDropdownMenuSub>

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
