<script setup lang="ts">
import { GR_TONES } from '@feugene/granularity'
import type { GrBadgeDotTone, GrBadgeRadius, GrBadgeSize, GrTone } from '@feugene/granularity'

import IconTruck from '~icons/lucide/truck'

import Specimen from './Specimen.vue'

defineProps<{ preview?: boolean }>()

const TONE_WORDS: Record<GrTone, string> = {
  primary: 'Новое',
  neutral: 'Черновик',
  success: 'Оплачено',
  warning: 'Ждёт',
  danger: 'Просрочено',
  info: 'Бета',
  slate: 'Архив',
  azure: 'Внешний',
}
const TONE_COLUMNS = ['тон', 'мягкая', 'тёмная', 'точка']

const BADGE_SIZES: readonly GrBadgeSize[] = ['xs', 'sm', 'md', 'lg']

const SERVICES: { name: string, status: string, dot: GrBadgeDotTone }[] = [
  { name: 'Платежи', status: 'Работает', dot: 'success' },
  { name: 'Почта', status: 'Задержки', dot: 'warning' },
  { name: 'Отчёты', status: 'Сбой', dot: 'danger' },
]

const RADII: { radius: GrBadgeRadius, label: string, note: string }[] = [
  { radius: 'round', label: 'Оплачено', note: 'статус' },
  { radius: 'semi', label: 'SKU-14920', note: 'код' },
  { radius: 'square', label: 'Проверено', note: 'штамп' },
]
</script>

<template>
  <!-- Карточка каталога и «Темы рядом»: одно состояние, ничего не открыто. -->
  <div v-if="preview" class="flex w-full flex-col gap-3">
    <div class="flex flex-wrap items-center gap-2">
      <GrBadge tone="success">
        Оплачено
      </GrBadge>
      <GrBadge tone="warning">
        Ждёт подписи
      </GrBadge>
      <GrBadge tone="danger">
        Просрочено
      </GrBadge>
      <GrBadge tone="primary" dark>
        Новое
      </GrBadge>
      <GrBadge tone="neutral" dot="success">
        В сети
      </GrBadge>
    </div>
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2">
    <Specimen title="Статусы" note="Метка — штамп, а не кнопка. Тёмная заливка — одна на строку, точка — для живых состояний.">
      <div class="flex flex-wrap items-center gap-2">
        <GrBadge tone="success">
          Оплачено
        </GrBadge>
        <GrBadge tone="warning">
          Ждёт подписи
        </GrBadge>
        <GrBadge tone="danger">
          Просрочено
        </GrBadge>
        <GrBadge tone="neutral">
          Черновик
        </GrBadge>
        <GrBadge tone="primary" dark>
          Новое
        </GrBadge>
        <GrBadge tone="success" dot>
          В сети
        </GrBadge>
        <GrBadge tone="neutral" dot>
          Не в сети
        </GrBadge>
      </div>
    </Specimen>

    <Specimen title="Ступени" note="xs · sm · md · lg по шкале контролов; иконка в метке растёт вместе с ней.">
      <div class="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-3">
        <template v-for="size in BADGE_SIZES" :key="size">
          <code class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">{{ size }}</code>
          <div class="flex flex-wrap items-center gap-2">
            <GrBadge tone="success" :size="size">
              Оплачено
            </GrBadge>
            <GrBadge :size="size">
              12
            </GrBadge>
            <GrBadge tone="info" :size="size">
              <template #icon>
                <IconTruck class="h-full w-full" aria-hidden="true" />
              </template>
              В пути
            </GrBadge>
          </div>
        </template>
      </div>
    </Specimen>

    <Specimen title="Восемь тонов" note="Тон несёт смысл, а не только цвет: мягкая заливка, тёмная и точка тона." wide>
      <!-- На узком экране таблица прокручивается, и прокручиваемая область обязана быть достижима с клавиатуры. -->
      <div
        role="region"
        aria-label="Метки по тонам"
        tabindex="0"
        class="overflow-x-auto rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)]"
      >
        <table class="w-full border-collapse">
          <caption class="sr-only">
            Метки по тонам: мягкая, тёмная и с точкой
          </caption>
          <thead class="bg-[var(--gr-muted)]">
            <tr>
              <th
                v-for="column in TONE_COLUMNS"
                :key="column"
                scope="col"
                class="px-4 py-2 text-left text-[length:var(--gr-text-xs)] font-500 leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]"
              >
                {{ column }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="tone in GR_TONES" :key="tone">
              <th
                scope="row"
                class="border-t border-[var(--gr-brd)] px-4 py-2 text-left font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] font-400 leading-[var(--gr-leading-xs)]"
              >
                {{ tone }}
              </th>
              <td class="border-t border-[var(--gr-brd)] px-4 py-2">
                <GrBadge :tone="tone">
                  {{ TONE_WORDS[tone] }}
                </GrBadge>
              </td>
              <td class="border-t border-[var(--gr-brd)] px-4 py-2">
                <GrBadge :tone="tone" dark>
                  {{ TONE_WORDS[tone] }}
                </GrBadge>
              </td>
              <td class="border-t border-[var(--gr-brd)] px-4 py-2">
                <GrBadge :tone="tone" dot>
                  {{ TONE_WORDS[tone] }}
                </GrBadge>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Specimen>

    <Specimen title="Точка своего тона" note="Тихая плашка с цветной точкой: в длинном списке цветные плашки спорят за внимание, а точки читаются построчно.">
      <dl class="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-6 gap-y-2.5 text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)]">
        <template v-for="service in SERVICES" :key="service.name">
          <dt class="text-[var(--gr-muted-fg)]">
            {{ service.name }}
          </dt>
          <dd>
            <GrBadge tone="neutral" :dot="service.dot">
              {{ service.status }}
            </GrBadge>
          </dd>
        </template>
      </dl>
    </Specimen>

    <Specimen title="Формы" note="round — статус, semi — код или категория, square — штамп; semi скругляется медленнее, чем растёт.">
      <div class="flex flex-wrap items-end gap-6">
        <div v-for="item in RADII" :key="item.radius" class="flex flex-col items-start gap-1.5">
          <GrBadge tone="slate" :radius="item.radius" size="md">
            {{ item.label }}
          </GrBadge>
          <code class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">{{ item.radius }} · {{ item.note }}</code>
        </div>
      </div>
    </Specimen>
  </div>
</template>
