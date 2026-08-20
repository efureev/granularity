# `@feugene/granularity-datasource`

Состояние списка одним композаблом: сортировка, фильтры, страница, поиск, адресная строка и запрос
без гонок.

Пара «таблица + панель фильтров + пагинация» пишется в каждом проекте заново, и каждый раз одинаково:
состояние теряется при перезагрузке, ссылкой на отфильтрованный список не поделиться, а поздний ответ
сервера перетирает ранний — таблица моргает чужими данными.

```bash
yarn add @feugene/granularity-datasource
```

## Быстрый старт

```vue
<script setup lang="ts">
import { useDataSource } from '@feugene/granularity-datasource'

const { rows, loading, total, page, perPage, sortKey, sortDir } = useDataSource({
  fetcher: async (request, { signal }) => {
    const response = await fetch(`/api/users?page=${request.page}&per_page=${request.perPage}`, { signal })
    const body = await response.json()

    return { rows: body.items, total: body.total }
  },
  defaults: { perPage: 25 },
})
</script>

<template>
  <GrDataTable
    v-model:sort-key="sortKey"
    v-model:sort-dir="sortDir"
    external-sort
    :rows="rows"
    :loading="loading"
    :columns="columns"
    row-key="id"
  />

  <GrPagination v-model:page="page" v-model:page-size="perPage" :total="total" show-total />
</template>
```

Короче — одним объектом на компонент: `<GrDataTable v-bind="table" :rows="rows" :columns="columns" />`
и `<GrPagination v-bind="pagination" />`. У этого пути есть цена: `vue-tsc` **не засчитывает**
`v-bind`-спред в обязательные пропсы, поэтому в проекте со строгой проверкой шаблонов обязательные
(`rows` у таблицы, `page`/`pageSize`/`total` у пагинации) придётся указать ещё и явно — а тогда
выгода теряется. Поэтому основной способ выше, а объекты остаются для проектов без проверки шаблонов.

## Что внутри

| | |
| --- | --- |
| **Две стратегии** | серверная (`fetcher`) и клиентская (`rows` целиком) за одним интерфейсом |
| **Без гонок** | поздний ответ раннего запроса выбрасывается: гонку закрывает номер запроса, а не только `AbortController` |
| **Адресная строка** | двусторонняя сериализация по требованию, с префиксом на каждый список |
| **Связка** | готовые объекты пропов для `GrDataTable` и `GrPagination` |

## Границы

**Транспорт — всегда ваш.** Пакет не ходит в сеть сам и не знает формы вашего API: `fetcher` получает
запрос и возвращает `{ rows, total }`. Форма запроса по умолчанию (`page`, `perPage`, `sort`,
`filters`, `search`) — это соглашение, а не протокол; переложить его в свои имена — три строки в
`fetcher`. Если в приложении уже есть TanStack Query, `useDataSource` работает **поверх**, а не
вместо: состояние живёт здесь, кэш — там.

**Ядро он не импортирует ни разу.** `table` и `pagination` — обычные объекты пропов, которые
раскрываются через `v-bind`. Граница намеренная: состояние списка не обязано знать, чем этот список
нарисован, и те же объекты годятся для собственной разметки.

**Компонентов у пакета нет.** Фильтры рисует потребитель — своими `GrInput`, `GrSelect` и чем угодно
ещё; композабл только хранит их значения и решает, когда идти за данными.

## Доки

- [`docs/model.md`](./docs/model.md) — состояние и правила его нормализации;
- [`docs/url.md`](./docs/url.md) — формат строки запроса, префиксы, рецепт Vue Router;
- [`docs/ssr.md`](./docs/ssr.md) — почему адрес читается после монтирования.
