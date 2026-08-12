<script setup lang="ts">
import { ref } from 'vue'

import { GrDataTable } from '@feugene/granularity'

type Shipment = {
  id: number
  code: string
  route: string
  carrier: string
  weight: string
  eta: string
  status: string
}

const columns = [
  { key: 'code', label: 'Номер', pinned: 'left' as const, width: 140 },
  { key: 'route', label: 'Маршрут', width: 260 },
  { key: 'carrier', label: 'Перевозчик', width: 220 },
  { key: 'weight', label: 'Вес', width: 160, align: 'right' as const },
  { key: 'eta', label: 'Прибытие', width: 200 },
  { key: 'status', label: 'Статус', pinned: 'right' as const, width: 160 },
]

const rows: Shipment[] = [
  { id: 1, code: 'SH-1043', route: 'Санкт-Петербург — Казань', carrier: 'Северный экспресс', weight: '12,4 т', eta: '14 августа', status: 'В пути' },
  { id: 2, code: 'SH-1044', route: 'Новороссийск — Пермь', carrier: 'ЮгТранс', weight: '8,1 т', eta: '16 августа', status: 'Погрузка' },
  { id: 3, code: 'SH-1045', route: 'Владивосток — Иркутск', carrier: 'Дальлогистика', weight: '21,7 т', eta: '19 августа', status: 'Задержка' },
]

const widths = ref<Record<string, number>>({})
</script>

<template>
  <div class="grid gap-4">
    <GrDataTable
      v-model:column-widths="widths"
      resizable-columns
      :columns="columns"
      :rows="rows"
      row-key="id"
      aria-label="Отгрузки"
    />

    <p class="text-sm text-[var(--gr-muted-fg)]">
      Номер закреплён слева, статус справа — при горизонтальной прокрутке они остаются на месте.
      Ширина тянется за правый край заголовка; с клавиатуры — стрелками на ручке, Enter возвращает
      колонку к авторазметке.
      <template v-if="Object.keys(widths).length">
        Заданные ширины: <code>{{ widths }}</code>.
      </template>
    </p>
  </div>
</template>
