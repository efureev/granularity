<script setup lang="ts">
import { ref } from 'vue'
import { GrButton, GrCard, GrDataTable } from '@feugene/granularity'

type Order = {
  id: number
  customer: string
  total: string
  status: string
}

const orders: Order[] = [
  { id: 1041, customer: 'Ada Lovelace', total: '€ 1 280', status: 'Оплачен' },
  { id: 1042, customer: 'Grace Hopper', total: '€ 340', status: 'В сборке' },
  { id: 1043, customer: 'Alan Turing', total: '€ 96', status: 'Отменён' },
]

const columns = [
  { key: 'id', label: 'Заказ', width: 96 },
  { key: 'customer', label: 'Покупатель' },
  { key: 'total', label: 'Сумма', align: 'right' as const, width: 120 },
  { key: 'status', label: 'Статус', width: 140 },
]

const expanded = ref<Array<string | number>>([1041])

/** У третьей таблицы своя колонка действий: раскрытие живёт в ней, а не отдельным столбцом. */
const actionColumns = [
  ...columns,
  { key: 'actions', label: '', width: 190, align: 'right' as const },
]

/**
 * Подробности «с сервера»: задержка нарочно заметная, чтобы состояние загрузки
 * было видно, а не проскакивало. Отмену обрабатываем — иначе свёрнутая строка
 * дописала бы ответ в никуда.
 */
function loadDetail(row: Order, signal: AbortSignal): Promise<{ lines: string[] }> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, 700, {
      lines: [
        `Позиция A — ${row.total}`,
        'Доставка — курьер, завтра',
        `Комментарий покупателя ${row.customer}`,
      ],
    })

    signal.addEventListener('abort', () => {
      clearTimeout(timer)
      reject(new DOMException('Aborted', 'AbortError'))
    })
  })
}
</script>

<template>
  <div class="grid gap-3">
    <GrCard class="grid gap-3 p-4">
      <div class="text-sm font-semibold text-[var(--gr-fg)]">
        Подробности из данных строки
      </div>
      <GrDataTable
        v-model:expanded-keys="expanded"
        :rows="orders"
        :columns="columns"
        row-key="id"
        expandable
      >
        <template #detail="{ row }">
          <div class="grid gap-1 text-sm">
            <div class="font-semibold text-[var(--gr-fg)]">
              Заказ {{ row.id }}
            </div>
            <div class="text-[var(--gr-muted-fg)]">
              {{ row.customer }} · {{ row.status }} · {{ row.total }}
            </div>
          </div>
        </template>
      </GrDataTable>
      <div class="text-sm text-[var(--gr-muted-fg)]">
        Строка подробностей помечена служебной: полосатость и подсветка
        <code>GrTable</code> считают её чужой и не сбивают чередование соседей.
      </div>
    </GrCard>

    <GrCard class="grid gap-3 p-4">
      <div class="text-sm font-semibold text-[var(--gr-fg)]">
        Подгрузка при раскрытии
      </div>
      <GrDataTable
        :rows="orders"
        :columns="columns"
        row-key="id"
        expandable
        accordion
        :load-detail="loadDetail"
      >
        <template #detail="{ data }">
          <ul class="grid gap-1 text-sm text-[var(--gr-fg)]">
            <li v-for="line in (data as { lines: string[] } | undefined)?.lines ?? []" :key="line">
              {{ line }}
            </li>
          </ul>
        </template>
      </GrDataTable>
      <div class="text-sm text-[var(--gr-muted-fg)]">
        Свернуть до ответа — запрос отменяется. Раскрыть снова — берётся
        загруженное, без второго запроса.
      </div>
    </GrCard>

    <GrCard class="grid gap-3 p-4">
      <div class="text-sm font-semibold text-[var(--gr-fg)]">
        Своя кнопка вместо служебной колонки
      </div>
      <GrDataTable
        :rows="orders"
        :columns="actionColumns"
        row-key="id"
        expandable
        :expand-column="false"
      >
        <template #cell-actions="{ expanded: isOpen, toggleExpand }">
          <div class="flex justify-end gap-2">
            <GrButton size="xs" variant="ghost">
              Печать
            </GrButton>
            <GrButton
              size="xs"
              variant="outline"
              :aria-expanded="isOpen"
              @click="toggleExpand"
            >
              {{ isOpen ? 'Свернуть' : 'Подробнее' }}
            </GrButton>
          </div>
        </template>

        <template #detail="{ row }">
          <div class="text-sm text-[var(--gr-muted-fg)]">
            Заказ {{ row.id }} · {{ row.customer }} · {{ row.total }}
          </div>
        </template>
      </GrDataTable>
      <div class="text-sm text-[var(--gr-muted-fg)]">
        Служебного столбца нет: раскрытием управляет кнопка потребителя, и
        <code>aria-expanded</code> ложится на неё.
      </div>
    </GrCard>
  </div>
</template>
