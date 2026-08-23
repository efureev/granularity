<script setup lang="ts">
import { computed, ref } from 'vue'
import type { DataSourceRequest } from '@feugene/granularity-datasource'
import { createState, useDataSource, writeStateToQuery } from '@feugene/granularity-datasource'

// `GrDataTable`, `GrPagination`, `GrInput` и `GrSelect` подставляются авто-импортом.

/**
 * Список поверх сервера-заглушки.
 *
 * Заглушка отвечает **вразнобой**: нечётный запрос медленнее чётного. Так видно
 * то, ради чего пакет и написан: поздний ответ раннего запроса выбрасывается, а
 * не ложится поверх свежих данных.
 */
// Тип-алиас, а не интерфейс: строка таблицы обязана быть присваиваема
// `Record<string, unknown>`, а интерфейс индексную сигнатуру не получает.
type Person = { id: number, name: string, role: string, age: number }

const ROLES = ['admin', 'editor', 'viewer'] as const

const PEOPLE: Person[] = Array.from({ length: 137 }, (_, index) => ({
  id: index + 1,
  name: `Сотрудник ${String(index + 1).padStart(3, '0')}`,
  role: ROLES[index % ROLES.length]!,
  age: 22 + ((index * 7) % 38),
}))

const requests = ref(0)
const DELAYS = [700, 120]

function valueOf(person: Person, key: string): string | number {
  return (person as unknown as Record<string, string | number>)[key] ?? ''
}

/** Сервер-заглушка: фильтрует, сортирует и режет — как это делал бы бэкенд. */
async function fetchPeople(request: DataSourceRequest) {
  const nth = requests.value++
  await new Promise((resolve) => {
    setTimeout(resolve, DELAYS[nth % DELAYS.length])
  })

  const search = request.search.trim().toLowerCase()
  const wanted = String(request.filters.role ?? '')

  let list = PEOPLE
    .filter(person => (wanted ? person.role === wanted : true))
    .filter(person => (search ? person.name.toLowerCase().includes(search) : true))

  if (request.sort) {
    const { key, dir } = request.sort
    const sign = dir === 'desc' ? -1 : 1

    list = [...list].sort((a, b) => {
      const left = valueOf(a, key)
      const right = valueOf(b, key)

      return (typeof left === 'number' && typeof right === 'number'
        ? left - right
        : String(left).localeCompare(String(right))) * sign
    })
  }

  const start = (request.page - 1) * request.perPage

  return { rows: list.slice(start, start + request.perPage), total: list.length }
}

// Писуемые ссылки, а не `v-bind`-объект: спред короче, но `vue-tsc` не
// засчитывает его в обязательные пропсы, и проверка шаблонов краснеет.
const DEFAULTS = { perPage: 5, filters: { role: '' } }

const { rows, loading, total, page, perPage, sortKey, sortDir, search, state, setFilter } = useDataSource<Person>({
  fetcher: fetchPeople,
  defaults: DEFAULTS,
})

/**
 * Как это состояние выглядело бы ссылкой.
 *
 * Синхронизация с адресом здесь **выключена** — она включается опцией, — но
 * строку видно всегда: без неё главное свойство пакета остаётся на словах.
 * Считает её тот же `writeStateToQuery`, что пишет в адрес по-настоящему.
 */
const query = computed(() => writeStateToQuery('', state.value, {
  defaults: createState(DEFAULTS),
  prefix: 'people',
}))

const columns = [
  { key: 'id', label: '#', sortable: true, width: 72 },
  { key: 'name', label: 'Сотрудник', sortable: true },
  { key: 'role', label: 'Роль', sortable: true, width: 140 },
  { key: 'age', label: 'Возраст', sortable: true, width: 120, align: 'right' as const },
]

const roleOptions = [
  { label: 'Все роли', value: '' },
  ...ROLES.map(role => ({ label: role, value: role })),
]

const role = computed({
  get: () => String(state.value.filters.role ?? ''),
  set: (value: string) => setFilter('role', value),
})
</script>

<template>
  <div class="grid gap-4">
    <div class="flex flex-wrap items-center gap-3">
      <GrInput v-model="search" placeholder="Поиск по имени" clearable class="w-64" aria-label="Поиск по имени" />
      <GrSelect v-model="role" :options="roleOptions" class="w-44" aria-label="Роль" />
      <span class="showcase-demo-text text-sm opacity-70">Запросов к серверу: {{ requests }}</span>
    </div>

    <GrDataTable
      v-model:sort-key="sortKey"
      v-model:sort-dir="sortDir"
      external-sort
      :rows="rows"
      :loading="loading"
      :columns="columns"
      row-key="id"
      aria-label="Сотрудники"
    />

    <GrPagination
      v-model:page="page"
      v-model:page-size="perPage"
      :total="total"
      :page-sizes="[5, 10, 25]"
      show-page-size
      show-total
    />

    <div class="grid gap-1">
      <span class="showcase-demo-text text-sm font-semibold">Строка запроса</span>
      <pre class="overflow-x-auto rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-muted)] p-3 text-[length:var(--gr-control-text-sm)] leading-[var(--gr-leading-sm)]">{{ query || '(пусто: состояние совпадает с умолчаниями)' }}</pre>
    </div>

    <p class="showcase-demo-text text-sm opacity-70">
      Набор в поиске откладывается на 300 мс и схлопывается в один запрос, а клик по странице или по
      заголовку уходит сразу: это разовое действие, а не набор текста. Смена фильтра, поиска и размера
      страницы возвращает на первую — иначе с пятой страницы попадёшь на пустую и решишь, что ничего
      не нашлось.
    </p>

    <p class="showcase-demo-text text-sm opacity-70">
      Заглушка отвечает вразнобой: нечётный запрос медленнее чётного. Наберите пару букв подряд — в
      таблице окажется ответ на <strong>последний</strong> запрос, а не тот, что вернулся позже.
      Гонку закрывает номер запроса, а не только <code>AbortController</code>: транспорт потребителя
      вправе не пробросить <code>signal</code>, и тогда прерванный запрос всё равно вернётся.
    </p>

    <p class="showcase-demo-text text-sm opacity-70">
      Поле «Строка запроса» показывает, как это же состояние выглядело бы <strong>ссылкой</strong>.
      Синхронизация с адресом здесь выключена — она включается опцией, — но строку считает тот же
      <code>writeStateToQuery</code>, что пишет в адрес по-настоящему. Вернитесь к умолчаниям, и она
      опустеет: пустое не пишется, иначе ссылка на список по умолчанию состояла бы из параметров, ни
      один из которых ничего не меняет.
    </p>
  </div>
</template>
