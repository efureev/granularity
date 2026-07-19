<script setup lang="ts">
import {
  GrButton,
  GrDropdownMenu,
  GrDropdownMenuHeader,
  GrDropdownMenuList,
} from '@feugene/granularity'

// Каждый хоткей — массив клавиш: рендерим их как отдельные <kbd>-чипы,
// так «⌘ K» читается чище, чем слипшееся «⌘K».
const shortcuts = [
  { action: 'Search', keys: ['⌘', 'K'] },
  { action: 'Save draft', keys: ['⌘', 'S'] },
  { action: 'Assign owner', keys: ['A'] },
  { action: 'Archive', keys: ['⌘', '⌫'] },
]
</script>

<template>
  <!--
    Минималистичный cheat-sheet: одна колонка, в каждой строке действие слева и
    хоткей справа (`justify-between`). Никаких вертикальных разделителей и «плавающих»
    полос — выравнивание держит сама строка.
  -->
  <GrDropdownMenu width="64" align="left" :close-on-content-click="false">
    <template #trigger="{ open }">
      <GrButton variant="outline">
        {{ open ? 'Hide shortcuts' : 'Keyboard shortcuts' }}
      </GrButton>
    </template>

    <GrDropdownMenuHeader title="Keyboard shortcuts" />

    <GrDropdownMenuList>
      <div
        v-for="shortcut in shortcuts"
        :key="shortcut.action"
        class="flex items-center justify-between gap-6 px-4 py-2 text-[13px] text-[var(--fg)]"
      >
        <span class="truncate">{{ shortcut.action }}</span>
        <span class="flex shrink-0 items-center gap-1">
          <kbd
            v-for="(key, index) in shortcut.keys"
            :key="index"
            class="min-w-[20px] rounded-md border border-[var(--brd)] bg-[var(--muted)] px-1.5 py-0.5 text-center text-[11px] font-medium text-[var(--muted-fg)] tabular-nums"
          >
            {{ key }}
          </kbd>
        </span>
      </div>
    </GrDropdownMenuList>
  </GrDropdownMenu>
</template>
