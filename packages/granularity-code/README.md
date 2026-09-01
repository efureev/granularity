# `@feugene/granularity-code`

Три действия над кодом в интерфейсе — **показать**, **править**, **сравнить** —
одним пакетом дизайн-системы `@feugene/granularity`.

```bash
yarn add @feugene/granularity-code
```

Этого достаточно: `GrCodeBlock` и `GrDiff` не тянут ни одной зависимости.
CodeMirror нужен только редактору и объявлен **опциональным** peer'ом.

## Что внутри

| Компонент | Что делает | Зависимости |
| --- | --- | --- |
| `GrCodeBlock` | показать: лог, ответ API, конфиг в карточке | нет |
| `GrDiff` | сравнить: что изменилось в записи, между ревизиями | нет |
| `GrCodeEditor` | править: JSON и YAML в админке, шаблон письма | CodeMirror 6 |

Данные, а не код, показывает `GrJsonViewer` **ядра**: интерактивный обход
чужого `unknown` с раскрытием веток.

## Вес гранулярного импорта

<!-- entry-sizes:generated:start lang=ru -->
| Что берут | gzip | от бареля |
| --- | ---: | ---: |
| весь пакет из корня | 19.7 kB | 100 % |
| самый лёгкий компонент — `GrCodeBlock` | 4.8 kB | 25 % |
| медианный компонент — `GrCodeEditor` | 5.4 kB | 27 % |
| 3 самых тяжёлых вместе | 15.4 kB | 79 % |

Числа **не складываются**: общий код посчитан в каждой строке заново, а платится один раз —
поэтому набор компонентов и показан объединением, а не суммой. Это верхняя граница: gzip всего,
что подпуть тянет из `dist`, а бандлер приложения трясёт дальше и минифицирует повторно.

Вес каждого компонента — [`docs/entry-sizes.md`](./docs/entry-sizes.md).
<!-- entry-sizes:generated:end -->

## Подсветка любого языка — контрактом, а не зависимостью

Пакет объявляет **потребность**, а не поставщика:

```ts
type GrCodeTokenizer = (code: string, language: string) => GrCodeLine[] | Promise<GrCodeLine[]>
```

Поэтому `shiki` не появляется ни в зависимостях пакета, ни в импортах типов —
привязки к его мажору нет, потому что нет самой связи. Подключить можно Shiki,
Prism, серверную подсветку или готовые токены из API:

```ts
import { createHighlighter } from 'shiki'
import { createShikiTokenizer, GR_CODE_HIGHLIGHTER_KEY } from '@feugene/granularity-code/highlight'

const shiki = await createHighlighter({ langs: ['ts', 'yaml'], themes: [] })

app.provide(GR_CODE_HIGHLIGHTER_KEY, createShikiTokenizer(shiki))
```

Не подключён никто — работает встроенный разбор: JSON и обычный текст. Это
нормальный режим, а не деградация.

## Арифметика без компонентов

`@feugene/granularity-code/diff` отдаёт дифф чистыми функциями: посчитать
сравнение для своего рендера или для отчёта можно без Vue.

```ts
import { collapseUnchanged, diffLines } from '@feugene/granularity-code/diff'

const { lines, added, removed, degraded } = diffLines(before, after)
```

## Документация

- [`docs/components.md`](./docs/components.md) — каталог и выбор между тремя
- [`docs/highlight.md`](./docs/highlight.md) — палитра, контракт, Shiki и CodeMirror
- [`docs/keyboard.md`](./docs/keyboard.md) — клавиатура; почему `Tab` уводит фокус
- [`docs/theming.md`](./docs/theming.md) — токены
- [`docs/ssr.md`](./docs/ssr.md) — серверный рендер
- [`docs/entry-sizes.md`](./docs/entry-sizes.md) — вес каждого компонента

## Лицензия

[Apache License 2.0 with an Additional Ethical Use Clause](./LICENSE) © Evgeniy Fureev
