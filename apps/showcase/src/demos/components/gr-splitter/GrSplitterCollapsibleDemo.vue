<script setup lang="ts">
import { ref } from 'vue'
import { GrSplitter } from '@feugene/granularity'

const size = ref(30)
const collapsed = ref(false)
</script>

<template>
  <div class="grid gap-3">
    <div class="h-56 overflow-hidden rounded-[var(--gr-radius-md)] border border-[var(--gr-brd)]">
      <GrSplitter
        v-model="size"
        v-model:collapsed="collapsed"
        collapsible
        :min="20"
        :min-end="30"
        :default-size="30"
        aria-label="Ширина боковой панели"
      >
        <template #start>
          <div class="h-full bg-[var(--gr-muted)] p-3 text-[length:var(--gr-text-xs)] text-[var(--gr-muted-fg)]">
            Фильтры
          </div>
        </template>

        <template #end>
          <div class="h-full p-4 text-[length:var(--gr-text-sm)] text-[var(--gr-fg)]">
            Enter на разделителе сворачивает панель и возвращает её туда же, откуда свернул.
            Двойной клик сбрасывает границу к значению по умолчанию, а перетаскивание вплотную
            к левому краю схлопывает панель мышью.
          </div>
        </template>
      </GrSplitter>
    </div>

    <p class="text-[length:var(--gr-text-xs)] text-[var(--gr-muted-fg)]">
      {{ collapsed ? 'Панель свёрнута' : `Доля панели: ${Math.round(size)} %` }}
    </p>
  </div>
</template>
