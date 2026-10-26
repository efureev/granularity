<script setup lang="ts">
import type { GrDeltaPolarity } from '@feugene/granularity/components/GrDelta'

import Specimen from './Specimen.vue'

defineProps<{ preview?: boolean }>()

const polarities: readonly { polarity: GrDeltaPolarity, label: string }[] = [
  { polarity: 'positive-good', label: 'Выручка' },
  { polarity: 'negative-good', label: 'Себестоимость' },
  { polarity: 'none', label: 'Сальдо' },
]

const steps = ['xs', 'sm', 'lg'] as const

const textClass = 'text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)]'
const mutedClass = 'text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]'
</script>

<template>
  <!-- Карточка каталога и «Темы рядом»: одно состояние, ничего не открыто. -->
  <div v-if="preview" class="flex w-full flex-col gap-3">
    <p class="text-[length:var(--gr-text-xl)] font-600 leading-[var(--gr-leading-xl)]">
      4,2 млн ₽
      <GrDelta :value="12.5" :precision="1" suffix="%" locale="ru-RU" show-arrow />
    </p>
    <p :class="textClass">
      Себестоимость заказа:
      <GrDelta :value="-6" suffix="%" polarity="negative-good" locale="ru-RU" />
      за квартал.
    </p>
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2">
    <Specimen title="В строке" note="Знак решает цвет, полярность — что считать хорошим; ноль нейтрален, нет данных — прочерк.">
      <ul class="flex flex-col gap-3" :class="textClass">
        <li>
          Маржа октября — 31,4 %,
          <GrDelta :value="-1.8" :precision="1" suffix="п. п." locale="ru-RU" />
          к сентябрю.
        </li>
        <li>
          Себестоимость заказа:
          <GrDelta :value="-6" suffix="%" polarity="negative-good" locale="ru-RU" show-arrow />
          за квартал.
        </li>
        <li>
          Возвраты:
          <GrDelta :value="0" suffix="%" locale="ru-RU" />
          — без изменений.
        </li>
        <li>
          Отток за неделю:
          <GrDelta :value="null" suffix="%" locale="ru-RU" />
          — данных пока нет.
        </li>
      </ul>
    </Specimen>

    <Specimen title="Полярность" note="Одна и та же величина: рост выручки хорош, рост себестоимости плох, у сальдо тона нет. Знак и стрелка остаются за числом.">
      <div class="grid grid-cols-[auto_auto_auto] items-baseline justify-start gap-x-6 gap-y-2" :class="textClass">
        <template v-for="item in polarities" :key="item.polarity">
          <span class="text-[var(--gr-muted-fg)]">{{ item.label }}</span>
          <GrDelta :value="6" suffix="%" :polarity="item.polarity" locale="ru-RU" show-arrow />
          <GrDelta :value="-6" suffix="%" :polarity="item.polarity" locale="ru-RU" show-arrow />
        </template>
      </div>
    </Specimen>

    <Specimen title="Знак перед валютой" note="Знак ставит Intl и выносит его перед припиской: +$0,0280, а не $+0,0280; при null приписок нет.">
      <ul class="flex flex-col gap-3" :class="textClass">
        <li>
          Цена запроса:
          <GrDelta :value="0.028" :precision="4" prefix="$" locale="ru-RU" polarity="negative-good" />
        </li>
        <li>
          Остаток на счёте:
          <GrDelta :value="-12.5" :precision="2" prefix="$" locale="ru-RU" />
        </li>
        <li>
          Курс к вчера:
          <GrDelta :value="null" prefix="$" locale="ru-RU" />
        </li>
      </ul>
    </Specimen>

    <Specimen title="Кегль из строки" note="Своего кегля на md нет: в заголовке дельта крупная, в подписи — мелкая, стрелка растёт вместе с числом.">
      <div class="flex flex-col gap-4">
        <p class="text-[length:var(--gr-text-3xl)] font-600 leading-[var(--gr-leading-3xl)]">
          Выручка за март
          <GrDelta :value="8.4" :precision="1" suffix="%" locale="ru-RU" show-arrow />
        </p>
        <p :class="mutedClass">
          К тому же периоду прошлого года
          <GrDelta :value="-2.1" :precision="1" suffix="%" locale="ru-RU" show-arrow />
        </p>
      </div>
    </Specimen>

    <Specimen title="Ступени рядом с контролами" note="xs, sm и lg задают кегль явно — когда дельта стоит в ряду с кнопкой и обязана совпасть с ней.">
      <div class="flex flex-col gap-3">
        <div v-for="step in steps" :key="step" class="flex items-center gap-3">
          <GrButton :size="step" variant="secondary" tone="neutral">
            Неделя
          </GrButton>
          <GrDelta :value="3.2" :precision="1" suffix="%" :size="step" locale="ru-RU" show-arrow />
          <span :class="mutedClass">size {{ step }}</span>
        </div>
      </div>
    </Specimen>
  </div>
</template>
