<script setup lang="ts">
import { ref } from 'vue'

import { GrAvatar, GrBadge, GrDivider, GrLink, GrStatistic, GrTable } from '@feugene/granularity'
import type { GrBadgeTone } from '@feugene/granularity'
import type { GrDashboardResponsiveLayout } from '@feugene/granularity-dashboard'

/**
 * Панель, а не витрина компонентов: виджет — это место под содержимое, и
 * содержимое здесь настоящее. Заголовок каждого виджета живёт в его шапке,
 * а `#actions` занимает то, что относится к заголовку, — бейдж периода.
 */
const mode = ref<'view' | 'edit'>('view')

// Демо живёт в колонке витрины, а не во весь экран, поэтому пороги свои.
const breakpoints = { lg: 680, md: 520, sm: 400, xs: 0 }
const cols = { lg: 12, md: 8, sm: 4, xs: 2 }

const layout = ref<GrDashboardResponsiveLayout>({
  lg: [
    { id: 'traffic', x: 0, y: 0, w: 8, h: 4, minW: 4 },
    { id: 'signups', x: 8, y: 0, w: 4, h: 2, minW: 3 },
    { id: 'revenue', x: 8, y: 2, w: 4, h: 2, minW: 3 },
    { id: 'duty', x: 0, y: 4, w: 4, h: 4, minW: 3 },
    { id: 'campaigns', x: 4, y: 4, w: 8, h: 4, minW: 4 },
  ],
})

const traffic = Array.from({ length: 14 }, (_, day) => ({
  x: new Date(2026, 6, day + 1),
  y: Math.round(1800 + Math.sin(day / 2.2) * 420 + day * 55),
}))

const trafficSeries = [{
  id: 'sessions',
  label: 'Сессии',
  data: traffic,
  color: 'var(--gr-primary)',
  fillColor: 'var(--gr-primary)',
}]

const signups = [980, 1010, 995, 1042, 1078, 1065, 1120, 1156, 1190, 1215, 1246, 1284]

/** Число — последнее значение ряда, а не отдельная константа: разойтись им нельзя. */
const signupsNow = signups.at(-1)!.toLocaleString('ru-RU')
const signupsDelta = Math.round(((signups.at(-1)! - signups[0]!) / signups[0]!) * 100)

const avatarSvg = encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" fill="none">
    <rect width="96" height="96" fill="#dbeafe" />
    <circle cx="48" cy="36" r="16" fill="#2563eb" opacity="0.18" />
    <path d="M18 80c6-15 18-23 30-23s24 8 30 23" fill="#2563eb" opacity="0.26" />
    <circle cx="48" cy="36" r="13" fill="#2563eb" />
  </svg>
`)
const avatarSrc = `data:image/svg+xml;charset=UTF-8,${avatarSvg}`

interface Campaign {
  name: string
  owner: string
  status: string
  tone: GrBadgeTone
  reach: string
}

const campaigns: Campaign[] = [
  { name: 'Онбординг', owner: 'Ольга', status: 'Идёт', tone: 'success', reach: '18,2k' },
  { name: 'Миграция карт', owner: 'Максим', status: 'Ревью', tone: 'info', reach: '9,7k' },
  { name: 'Напоминание о выплате', owner: 'Анна', status: 'Пауза', tone: 'warning', reach: '6,3k' },
  { name: 'Возврат ушедших', owner: 'Пётр', status: 'Черновик', tone: 'neutral', reach: '2,1k' },
]
</script>

<template>
  <div class="flex flex-col gap-4">
    <GrDashboardToolbar v-model:mode="mode">
      <template #start>
        <span class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-muted-fg)]">
          Продукт · июль
        </span>
      </template>
    </GrDashboardToolbar>

    <GrDashboard
      v-model:layout="layout"
      :mode="mode"
      :breakpoints="breakpoints"
      :cols="cols"
      :row-height="72"
      aria-label="Панель продукта"
    >
      <!-- Площадь: важен не только уровень, но и объём — «сколько всего набежало». -->
      <GrDashboardItem item-id="traffic" title="Трафик" :min-w="4">
        <template #actions>
          <GrBadge tone="neutral" size="sm">2 недели</GrBadge>
        </template>

        <GrChartArea
          :series="trafficSeries"
          :height="232"
          curve="smooth"
          include-zero
          aria-label="Сессии за две недели"
        />
      </GrDashboardItem>

      <!--
        Карточка показателя целиком: число отвечает «сколько», спарклайн — «как
        менялось», бейдж — «на сколько за период». Осей у линии нет намеренно.
      -->
      <GrDashboardItem item-id="signups" title="Регистрации" :min-w="3">
        <template #actions>
          <GrBadge tone="success" size="sm">+{{ signupsDelta }}%</GrBadge>
        </template>

        <strong class="block text-[length:var(--gr-text-2xl)] leading-[var(--gr-leading-xl)] [font-variant-numeric:tabular-nums]">
          {{ signupsNow }}
        </strong>

        <div class="mt-2">
          <GrSparkline :data="signups" />
        </div>

        <div class="mt-1 flex justify-between text-[length:var(--gr-control-text-2xs)] text-[var(--gr-muted-fg)]">
          <span>12 недель назад</span>
          <span>сейчас</span>
        </div>
      </GrDashboardItem>

      <GrDashboardItem item-id="revenue" title="Выручка" :min-w="3">
        <GrStatistic
          :value="12.48"
          :precision="2"
          suffix=" млн ₽"
          tone="success"
          trend="up"
          trend-text="+8,2% к прошлому кварталу"
        />
      </GrDashboardItem>

      <!-- Кто сейчас на связи: лицо, имя, роль — и его показатели за смену. -->
      <GrDashboardItem item-id="duty" title="Дежурный" :min-w="3">
        <div class="flex flex-col items-center gap-3 text-center">
          <GrAvatar :size="64" :src="avatarSrc" alt="Алексей Дорохов" status="online" />

          <div class="min-w-0">
            <strong class="block truncate">Алексей Дорохов</strong>
            <span class="block truncate text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-muted-fg)]">
              Поддержка второй линии
            </span>
          </div>

          <GrBadge tone="success" size="sm">На связи до 18:00</GrBadge>

          <GrDivider class="w-full" />

          <dl class="grid w-full grid-cols-2 gap-2">
            <div>
              <dt class="text-[length:var(--gr-control-text-2xs)] text-[var(--gr-muted-fg)]">Заявок</dt>
              <dd class="text-[length:var(--gr-text-base)] [font-variant-numeric:tabular-nums]">12</dd>
            </div>
            <div>
              <dt class="text-[length:var(--gr-control-text-2xs)] text-[var(--gr-muted-fg)]">Ответ</dt>
              <dd class="text-[length:var(--gr-text-base)] [font-variant-numeric:tabular-nums]">4 мин</dd>
            </div>
          </dl>
        </div>
      </GrDashboardItem>

      <GrDashboardItem item-id="campaigns" title="Кампании" :min-w="4">
        <template #actions>
          <GrBadge tone="neutral" size="sm">{{ campaigns.length }}</GrBadge>
        </template>

        <GrTable size="sm" aria-label="Активные кампании">
          <template #header>
            <tr>
              <th class="px-3 py-2 text-left font-600">Название</th>
              <th class="px-3 py-2 text-left font-600">Владелец</th>
              <th class="px-3 py-2 text-left font-600">Статус</th>
              <th class="px-3 py-2 text-right font-600">Охват</th>
            </tr>
          </template>

          <tr v-for="row in campaigns" :key="row.name" class="border-t border-[var(--gr-brd)]">
            <td class="px-3 py-2">{{ row.name }}</td>
            <td class="px-3 py-2 text-[var(--gr-muted-fg)]">{{ row.owner }}</td>
            <td class="px-3 py-2">
              <GrBadge size="sm" :tone="row.tone">{{ row.status }}</GrBadge>
            </td>
            <td class="px-3 py-2 text-right [font-variant-numeric:tabular-nums]">{{ row.reach }}</td>
          </tr>
        </GrTable>

        <template #footer>
          <GrLink href="#" size="sm">Все кампании</GrLink>
        </template>
      </GrDashboardItem>
    </GrDashboard>
  </div>
</template>
