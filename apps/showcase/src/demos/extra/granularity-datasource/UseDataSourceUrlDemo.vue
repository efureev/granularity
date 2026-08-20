<script setup lang="ts">
import { computed, ref } from 'vue'
import type { DataSourceUrlAdapter } from '@feugene/granularity-datasource/url'
import { useDataSource } from '@feugene/granularity-datasource'

/**
 * Состояние списка в строке запроса.
 *
 * Адрес витрины трогать нельзя — она сама живёт на роутере, — поэтому здесь
 * стоит свой адаптер: те же три метода, но пишет он в поле под таблицей.
 * Именно в этом смысл интерфейса — точка сопряжения одна, а чем она подключена
 * (History API, Vue Router, стенд вроде этого), решает потребитель.
 */
// Тип-алиас, а не интерфейс: строка таблицы обязана быть присваиваема
// `Record<string, unknown>`, а интерфейс индексную сигнатуру не получает.
type Ticket = { id: number, title: string, status: string }

const STATUSES = ['open', 'closed'] as const

const TICKETS: Ticket[] = Array.from({ length: 24 }, (_, index) => ({
  id: index + 1,
  title: `Обращение №${index + 1}`,
  status: STATUSES[index % STATUSES.length]!,
}))

const address = ref('')

const adapter: DataSourceUrlAdapter = {
  read: () => address.value,
  write: (search) => { address.value = search },
  subscribe: () => () => {},
}

const { rows, loading, total, page, perPage, sortKey, sortDir, state, setFilter } = useDataSource<Ticket>({
  rows: TICKETS,
  defaults: { perPage: 5, filters: { status: '' } },
  url: { adapter, prefix: 'tickets' },
})

const columns = [
  { key: 'id', label: '#', sortable: true, width: 72 },
  { key: 'title', label: 'Обращение', sortable: true },
  { key: 'status', label: 'Статус', sortable: true, width: 140 },
]

const statusOptions = [
  { label: 'Все статусы', value: '' },
  ...STATUSES.map(status => ({ label: status, value: status })),
]

const status = computed({
  get: () => String(state.value.filters.status ?? ''),
  set: (value: string) => setFilter('status', value),
})
</script>

<template>
  <div class="grid gap-4">
    <GrSelect v-model="status" :options="statusOptions" class="w-52" aria-label="Статус" />

    <GrDataTable
      v-model:sort-key="sortKey"
      v-model:sort-dir="sortDir"
      external-sort
      :rows="rows"
      :loading="loading"
      :columns="columns"
      row-key="id"
      aria-label="Обращения"
    />

    <GrPagination
      v-model:page="page"
      v-model:page-size="perPage"
      :total="total"
      :page-sizes="[5, 10]"
      show-page-size
      show-total
    />

    <pre class="rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-muted)] p-3 text-[length:var(--gr-control-text-sm)] leading-[var(--gr-leading-sm)]">{{ address || '(адрес пуст: состояние совпадает с умолчаниями)' }}</pre>

    <p class="showcase-demo-text text-sm opacity-70">
      Перелистните и поменяйте статус — состояние появится в адресе. Вернитесь к умолчаниям, и адрес
      снова опустеет: <strong>пустое не пишется</strong>. Ссылка на список по умолчанию обязана
      выглядеть как адрес страницы, а не как шесть параметров, ни один из которых ничего не меняет.
    </p>

    <p class="showcase-demo-text text-sm opacity-70">
      Префикс <code>tickets</code> разводит списки: на странице их бывает два, и без префикса они
      перетирали бы друг другу страницу и фильтры. Чужие параметры адаптер не трогает — рядом с
      состоянием списка спокойно живут вкладка, режим показа и метки рекламной кампании.
    </p>
  </div>
</template>
