<script setup lang="ts">
import { ref } from 'vue'

/**
 * Воронка отвечает на вопрос «где теряем», которого нет у трёх чисел рядом.
 *
 * Подпись переключается между значением и двумя долями — от первой ступени и от
 * предыдущей. Это разные знаменатели, и смешивать их в одной подписи нельзя.
 */
const stages = [
  { label: 'Зарегистрировались', value: 4820 },
  { label: 'Подтвердили почту', value: 3910 },
  { label: 'Создали проект', value: 1640 },
  { label: 'Пригласили команду', value: 720 },
  { label: 'Оплатили', value: 214 },
]

const labels = ref<'value' | 'share-first' | 'share-prev'>('share-prev')

const hint = {
  'value': 'Абсолютные величины: сколько человек дошло до каждой ступени.',
  'share-first': 'Доля от первой ступени: какая часть всех пришедших добралась досюда.',
  'share-prev': 'Доля от предыдущей: конверсия каждого перехода по отдельности. Именно здесь видно, что самый дорогой шаг — создание проекта.',
}
</script>

<template>
  <div class="grid gap-3">
    <div class="flex flex-wrap items-baseline justify-between gap-4">
      <span class="text-[length:var(--gr-control-text-sm)] text-[var(--gr-muted-fg)]">
        Онбординг за месяц
      </span>

      <GrSegmented
        v-model="labels"
        size="sm"
        :options="[
          { value: 'value', label: 'Значение' },
          { value: 'share-first', label: 'От первой' },
          { value: 'share-prev', label: 'От предыдущей' },
        ]"
        aria-label="Что писать у ступени"
      />
    </div>

    <GrChartFunnel :stages="stages" :labels="labels" :height="300" aria-label="Воронка онбординга" />

    <p class="text-[length:var(--gr-control-text-sm)] text-[var(--gr-muted-fg)]">
      {{ hint[labels] }} Обе доли доступны одновременно — в тултипе, в скрытой таблице и в
      объявлении: «конверсия сорок процентов» без указания знаменателя не значит ничего.
    </p>
  </div>
</template>
