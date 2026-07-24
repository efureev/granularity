<script setup lang="ts">
import {
  GrButton,
  GrDropdownMenu,
  GrDropdownMenuHeader,
  GrDropdownMenuList,
  GrKbd,
} from '@feugene/granularity'

// Каждый хоткей — массив клавиш: рендерим их как отдельные `GrKbd`-чипы,
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
    хоткей справа (`justify-between`). Клавиши — компонент `GrKbd` (дефолтный размер).
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
        class="flex items-center justify-between gap-6 px-4 py-2 text-[13px] text-[var(--gr-fg)]"
      >
        <span class="truncate">{{ shortcut.action }}</span>
        <span class="flex shrink-0 items-center gap-1">
          <GrKbd
            v-for="(key, index) in shortcut.keys"
            :key="index"
          >
            {{ key }}
          </GrKbd>
        </span>
      </div>
    </GrDropdownMenuList>
  </GrDropdownMenu>
</template>
