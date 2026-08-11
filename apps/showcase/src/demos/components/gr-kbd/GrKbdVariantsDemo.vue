<script setup lang="ts">
import { ref } from 'vue'

import type { GrKbdPlatform } from '@feugene/granularity'
import { GrKbd, GrSegmented } from '@feugene/granularity'

const platform = ref<GrKbdPlatform>('auto')

const rows = [
  { title: 'merged — по умолчанию', variant: 'merged' as const, hint: '⌘K на macOS, Ctrl+K на прочих' },
  { title: 'split', variant: 'split' as const, hint: 'плашка на каждую клавишу' },
]

const combos = ['mod+K', 'mod+shift+P', 'ctrl+alt+delete']
</script>

<template>
  <div class="grid gap-5 text-sm">
    <GrSegmented
      v-model="platform"
      size="sm"
      :options="[
        { value: 'auto', label: 'auto' },
        { value: 'apple', label: 'macOS' },
        { value: 'other', label: 'Windows/Linux' },
      ]"
    />

    <div v-for="row in rows" :key="row.variant" class="grid gap-2">
      <p class="text-[length:var(--gr-text-xs)] text-[var(--gr-muted-fg)]">
        {{ row.title }} — {{ row.hint }}
      </p>
      <div class="flex flex-wrap items-center gap-5">
        <GrKbd
          v-for="combo in combos"
          :key="combo"
          :keys="combo"
          :variant="row.variant"
          :platform="platform"
        />
      </div>
    </div>

    <div class="grid gap-2">
      <p class="text-[length:var(--gr-text-xs)] text-[var(--gr-muted-fg)]">
        sequence — аккорд: клавиши нажимают одну за другой
      </p>
      <div class="flex flex-wrap items-center gap-5">
        <GrKbd :keys="['G', 'I']" variant="sequence" :platform="platform" />
        <GrKbd :keys="['G', 'P']" variant="sequence" :platform="platform" />
      </div>
    </div>

    <div class="grid gap-2">
      <p class="text-[length:var(--gr-text-xs)] text-[var(--gr-muted-fg)]">
        Клавиши без букв: символ рисуется, а диктору достаётся имя
      </p>
      <div class="flex flex-wrap items-center gap-5">
        <GrKbd :keys="['up']" :platform="platform" />
        <GrKbd :keys="['down']" :platform="platform" />
        <GrKbd keys="tab" :platform="platform" />
        <GrKbd keys="backspace" :platform="platform" />
        <GrKbd keys="mod+delete" :platform="platform" />
        <GrKbd keys="pageup" :platform="platform" />
        <GrKbd keys="enter" :platform="platform" />
      </div>
    </div>
  </div>
</template>
