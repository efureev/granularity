# Состояние в адресной строке

Синхронизация **включается опцией**, а не работает сама:

```ts
const { table, pagination } = useDataSource({
  fetcher,
  url: { prefix: 'users' },
})
```

Композабл, пишущий в адрес по умолчанию, вмешался бы в чужую навигацию без спроса и столкнул бы два
списка на одной странице. Префикс разводит их: `?users.page=2&orders.page=1`.

## Формат

```
?page=3&perPage=50&sort=-created&q=иванов&f.role=admin&f.role=owner
```

| Часть | Параметр | Замечание |
| --- | --- | --- |
| страница | `page` | |
| размер страницы | `perPage` | |
| сортировка | `sort` | направление — ведущим минусом (`-created`), как в JSON:API |
| поиск | `q` | |
| фильтр | `f.<имя>` | список — **повторяющимся** параметром, а не через запятую |

Запятая внутри значения превратила бы один фильтр в два, и всплыло бы это на первом же названии
компании с запятой, — поэтому список пишется повторами.

**Пустое не пишется.** Значение, равное умолчанию, из адреса исчезает: ссылка на список по умолчанию
обязана выглядеть как адрес страницы, а не как шесть параметров, ни один из которых ничего не меняет.
Обратная сторона того же правила: снятый фильтр при непустом умолчании остаётся в адресе пустым
значением (`?f.role=`) — иначе перезагрузка вернула бы умолчание, которое сняли.

**Чужие параметры не трогаются.** Рядом с состоянием списка спокойно живут вкладка, режим показа и
метки рекламной кампании.

## Тип фильтра восстанавливается по умолчанию

Строка запроса типов не хранит. Форму значения задают `defaults.filters`: числовое умолчание сделает
`"42"` числом, булево — `true`/`false`, списочное — списком.

Отсюда важное следствие: **списочный фильтр обязан быть объявлен пустым списком в умолчаниях**. Иначе
`?f.role=admin` вернётся строкой — один элемент в адресе неотличим от скаляра.

Без умолчания значение остаётся строкой: угадывать тип по виду значения значило бы превратить артикул
`0012` в число `12`.

## Свой адаптер

Роутер не зависимость пакета. Точка сопряжения — три метода:

```ts
interface DataSourceUrlAdapter {
  read: () => string
  write: (search: string, options: { replace: boolean }) => void
  subscribe: (listener: () => void) => () => void
}
```

Умолчание — History API (`historyUrlAdapter` из `@feugene/granularity-datasource/url`). Пишет он
через `replaceState`: перелистывание и правка фильтров — не навигация, и забей ими историю, кнопка
«назад» перестанет уводить со страницы.

Рецепт для Vue Router:

```ts
import { useRoute, useRouter } from 'vue-router'
import type { DataSourceUrlAdapter } from '@feugene/granularity-datasource/url'

function routerUrlAdapter(): DataSourceUrlAdapter {
  const route = useRoute()
  const router = useRouter()

  return {
    read: () => {
      const query = new URLSearchParams(route.query as Record<string, string>).toString()

      return query ? `?${query}` : ''
    },
    write: search => void router.replace({ query: Object.fromEntries(new URLSearchParams(search)) }),
    subscribe: listener => router.afterEach(listener),
  }
}
```
