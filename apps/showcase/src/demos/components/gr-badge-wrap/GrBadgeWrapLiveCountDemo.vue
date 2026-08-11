<script setup lang="ts">
import { GrBadgeWrap, GrButton, GrCard } from '@feugene/granularity'
import { ref } from 'vue'

const unread = ref(3)

/** Пять писем подряд — то, на чём анимация превратилась бы в мельтешение. */
function receiveBatch() {
  for (let i = 0; i < 5; i++) setTimeout(() => unread.value++, i * 40)
}
</script>

<template>
  <div class="grid gap-4">
    <div class="flex flex-wrap items-center gap-6">
      <GrBadgeWrap :value="unread" :max="99" animate>
        <GrButton size="sm" variant="outline">Inbox</GrButton>
      </GrBadgeWrap>

      <div class="flex flex-wrap items-center gap-2">
        <GrButton size="sm" variant="ghost-border" @click="unread++">One message</GrButton>
        <GrButton size="sm" variant="ghost-border" @click="receiveBatch">Batch of five</GrButton>
        <GrButton size="sm" variant="ghost" @click="unread = 0">Mark all read</GrButton>
      </div>
    </div>

    <GrCard class="p-4 text-sm text-[var(--gr-muted-fg)]">
      The badge pops when the count appears or grows, and stays silent when it drops — a falling number is the trace of
      the user's own action. A burst gives one pop, not five: while the animation plays a new value does not restart it.
    </GrCard>
  </div>
</template>
