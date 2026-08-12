<script setup lang="ts">
import { ref } from 'vue'

// `GrRelativeTime` подставляется авто-импортом (`unplugin-vue-components`).
import { GrButton } from '@feugene/granularity'

/**
 * Здесь `base` не задан: отсчёт идёт от общих часов пакета, и текст обновляется
 * сам. Такт компонент выбирает по единице — секунды пересчитываются часто,
 * месяцы редко, а таймер на такт в приложении один на всех.
 */
const events = ref<Date[]>([new Date()])

function add(): void {
  events.value = [new Date(), ...events.value].slice(0, 5)
}
</script>

<template>
  <div class="grid gap-3 justify-items-start">
    <GrButton size="sm" @click="add">
      Отметить событие
    </GrButton>

    <ul class="grid gap-1 text-sm">
      <li v-for="event in events" :key="event.toISOString()">
        <GrRelativeTime :value="event" />
      </li>
    </ul>
  </div>
</template>
