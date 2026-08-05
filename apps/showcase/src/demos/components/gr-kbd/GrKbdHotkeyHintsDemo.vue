<script setup lang="ts">
import { ref } from 'vue'

import type { GrKbdPlatform } from '@feugene/granularity'
import { GrKbd, GrSegmented } from '@feugene/granularity'

const platform = ref<GrKbdPlatform>('auto')

const commands = [
  { label: 'Найти', keys: 'mod+K' },
  { label: 'Сохранить', keys: 'mod+S' },
  { label: 'Палитра команд', keys: 'mod+shift+P' },
  { label: 'Отменить', keys: ['mod', 'Z'] },
  { label: 'Закрыть', keys: 'Esc' },
]
</script>

<template>
  <div class="grid gap-4">
    <GrSegmented
      v-model="platform"
      size="sm"
      :options="[
        { value: 'auto', label: 'auto' },
        { value: 'apple', label: 'macOS' },
        { value: 'other', label: 'Windows/Linux' },
      ]"
    />

    <ul class="grid gap-1 rounded-2xl border border-[var(--gr-brd)] bg-[var(--gr-card)] p-2">
      <li
        v-for="command in commands"
        :key="command.label"
        class="flex items-center justify-between gap-6 rounded-xl px-3 py-2 text-sm hover:bg-[var(--gr-muted)]"
      >
        <span>{{ command.label }}</span>
        <GrKbd :keys="command.keys" :platform="platform" size="sm" />
      </li>
    </ul>

    <div class="rounded-2xl border border-dashed border-[var(--gr-brd)] p-3 text-sm text-[var(--gr-muted-fg)]">
      Токен `mod` пишется один раз, а показывается по платформе. Символы (`⌘`, `⇧`) снабжены
      скрытым читаемым именем — иначе диктор произносит их как значки.
    </div>
  </div>
</template>
