<script setup lang="ts">
import { GrAvatar, GrCard } from '@feugene/granularity'

/**
 * Имён больше, чем слотов палитры: так в кадр попадают все шесть, и видно, что
 * повтор цвета у разных людей — норма, а не сбой.
 */
const people = [
  'Ada Lovelace',
  'Grace Hopper',
  'Alan Turing',
  'Katherine Johnson',
  'Donald Knuth',
  'Barbara Liskov',
  'Linus Torvalds',
  'Margaret Hamilton',
]
</script>

<template>
  <div class="grid gap-3">
    <GrCard class="grid gap-3 p-4">
      <div class="text-sm font-semibold text-[var(--gr-fg)]">
        autoColor
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <GrAvatar v-for="person in people" :key="person" :name="person" auto-color :size="40" />
      </div>
      <div class="text-sm text-[var(--gr-muted-fg)]">
        Один и тот же человек всегда получает один и тот же цвет.
      </div>
    </GrCard>

    <GrCard class="grid gap-3 p-4">
      <div class="text-sm font-semibold text-[var(--gr-fg)]">
        Без autoColor
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <GrAvatar v-for="person in people" :key="person" :name="person" :size="40" />
      </div>
      <div class="text-sm text-[var(--gr-muted-fg)]">
        Дефолт не изменился: аватар остаётся нейтральным.
      </div>
    </GrCard>
  </div>
</template>
