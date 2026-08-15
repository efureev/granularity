# Каталог компонентов

`@feugene/granularity-chrono` публикует шесть компонентов, каждый — отдельным
subpath-экспортом:

```ts
import { GrDatePicker } from '@feugene/granularity-chrono/components/GrDatePicker'
```

Пять из них выбирают момент, шестой его показывает.

- [`GrCalendar`](./components/GrCalendar.md) — сетка месяца сама по себе, без поля
- [`GrDatePicker`](./components/GrDatePicker.md) — дата как значение поля формы
- [`GrDateRangePicker`](./components/GrDateRangePicker.md) — период «с — по»
- [`GrDateTimePicker`](./components/GrDateTimePicker.md) — дата вместе со временем
- [`GrTimePicker`](./components/GrTimePicker.md) — только время
- [`GrRelativeTime`](./components/GrRelativeTime.md) — момент относительно сейчас

Выбор между пакетами — карта `docs/COMPONENT-MAP.md` в корне репозитория.

## Сквозное — не на странице компонента

| Тема | Документ |
| --- | --- |
| значение: `Date` на границе, кортежи внутри, `valueAdapter`, публичная арифметика | [`model.md`](./model.md) |
| роли, живой регион, что и почему объявляется | [`a11y.md`](./a11y.md) |
| клавиатурный контракт: поле, сетка, колонки, период | [`keyboard.md`](./keyboard.md) |
| свои токены `--gr-*`, что можно перекрывать | [`theming.md`](./theming.md) |
| серверный рендер: единственный источник расхождения и как его убрать | [`ssr.md`](./ssr.md) |

## Правила страницы компонента

Жанр страницы, обязательные секции `## Когда брать` и `## Когда взять другое`,
запрет на рукописный перечень пропов — описаны один раз, в ядре:
`packages/granularity/docs/components.md`, раздел «Страница компонента».

Путь приведён текстом, а не ссылкой: относительная ссылка в соседний пакет
работает в репозитории и ломается в опубликованном тарболе, где рядом лежит
только `dist` установленной зависимости.
