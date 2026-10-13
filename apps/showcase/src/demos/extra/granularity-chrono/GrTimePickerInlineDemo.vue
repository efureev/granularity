<script setup lang="ts">
import { computed, ref } from 'vue'

// `GrTimePicker` подставляется авто-импортом.

/**
 * Время приёма прямо в карточке записи, без поля и всплывающей панели.
 *
 * Колонки стоят на выбранном времени сразу после загрузки: приём в 14:30
 * виден без прокрутки, хотя часы начинаются с полуночи. И двигается при этом
 * только колонка — страница, на которой пикер стоит ниже первого экрана, к
 * нему не прыгает.
 */
const DAY = new Date(2026, 9, 14)
const at = (hours: number, minutes: number) => new Date(DAY.getFullYear(), DAY.getMonth(), DAY.getDate(), hours, minutes)

const slot = ref<Date | null>(at(14, 30))

const label = computed(() => (slot.value
  ? `${String(slot.value.getHours()).padStart(2, '0')}:${String(slot.value.getMinutes()).padStart(2, '0')}`
  : 'не выбрано'))
</script>

<template>
  <div data-demo="time-picker-inline" class="grid gap-4 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-start">
    <GrTimePicker
      v-model="slot"
      inline
      :min="at(11, 30)"
      :max="at(17, 30)"
      :minute-step="30"
      :use12-hours="false"
      aria-label="Время приёма"
    />

    <div class="showcase-demo-panel grid content-start gap-2 rounded-[var(--gr-radius-lg)] border p-4">
      <p class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] font-600">
        Консультация, 14 октября
      </p>
      <p class="showcase-demo-text text-sm">
        Приём: <strong data-demo-slot>{{ label }}</strong>. Врач принимает с 11:30 до 17:30, запись
        по получасам.
      </p>
    </div>
  </div>
</template>
