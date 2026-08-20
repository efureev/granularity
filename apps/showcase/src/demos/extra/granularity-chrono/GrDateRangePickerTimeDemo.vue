<script setup lang="ts">
import { computed, ref } from 'vue'

// `GrDateRangePicker` подставляется авто-импортом.

/**
 * Окно обслуживания: период с точностью до минут.
 *
 * Панель модели рядом не для красоты — на ней видно обе границы целиком, а
 * именно во времени границ и весь смысл: по датам эти периоды неразличимы.
 */
const TODAY = new Date(2026, 7, 12)

const window = ref<[Date, Date] | null>(null)

function format(date: Date): string {
  return new Intl.DateTimeFormat('ru-RU', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

const model = computed(() => (window.value
  ? { from: format(window.value[0]), to: format(window.value[1]) }
  : null))
</script>

<template>
  <div class="grid gap-4 justify-items-start">
    <GrDateRangePicker
      v-model="window"
      enable-time
      :minute-step="15"
      :today="TODAY"
      locale="ru-RU"
      placeholder="Выберите окно"
      aria-label="Окно обслуживания"
      class="w-96"
    />

    <pre v-if="model" class="rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-muted)] p-3 text-[length:var(--gr-control-text-sm)] leading-[var(--gr-leading-sm)]">{{ JSON.stringify(model, null, 2) }}</pre>
    <p v-else class="showcase-demo-text text-sm opacity-70">Пока ничего не выбрано.</p>

    <p class="showcase-demo-text text-sm opacity-70">
      Выберите две даты: время встаёт <strong>00:00 и 23:59</strong> — сутки целиком. Две полуночи
      выглядели бы симметрично, но «с 12 по 14» по-человечески включает весь четырнадцатый день, а
      период до 14-го 00:00 молча отрезал бы почти все эти сутки. Это классическая ошибка отчётов, и
      умолчание здесь её не повторяет.
    </p>

    <p class="showcase-demo-text text-sm opacity-70">
      Панель не закрывается на второй дате: выбор на ней не заканчивается. Время правится когда
      угодно и в любом порядке — мастера из четырёх шагов нет намеренно, он завёл бы скрытое
      состояние «на каком мы шаге». Выберите период в один день и попробуйте увести конец раньше
      начала: правка не применится, потому что внутри одного дня порядок краёв держит только время.
    </p>
  </div>
</template>
