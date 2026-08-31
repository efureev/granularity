# Каталог компонентов

`@feugene/granularity-code` публикует три компонента, каждый — отдельным
subpath-экспортом:

```ts
import { GrCodeBlock } from '@feugene/granularity-code/components/GrCodeBlock'
```

Три действия над кодом, и выбор между ними — вопрос одного слова:

- [`GrCodeBlock`](./components/GrCodeBlock.md) — **показать**: лог, ответ API, конфиг в карточке
- [`GrCodeEditor`](./components/GrCodeEditor.md) — **править**: JSON и YAML в админке, шаблон письма
- [`GrDiff`](./components/GrDiff.md) — **сравнить**: что изменилось в записи, между ревизиями

Данные, а не код, показывает `GrJsonViewer` **ядра**: интерактивный обход чужого
`unknown` с раскрытием веток. Выбор между пакетами — карта
`docs/COMPONENT-MAP.md` в корне репозитория.

## Сквозное — не на странице компонента

| Тема | Документ |
| --- | --- |
| Клавиатура всех трёх | [`keyboard.md`](./keyboard.md) |
| Подсветка: палитра и контракт | [`highlight.md`](./highlight.md) |
| Токены и темизация | [`theming.md`](./theming.md) |
| Серверный рендер | [`ssr.md`](./ssr.md) |
| Вес гранулярных импортов | [`entry-sizes.md`](./entry-sizes.md) |
