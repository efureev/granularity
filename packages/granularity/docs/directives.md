# Директивы

Пакет публикует набор Vue-директив через `@feugene/granularity/directives` и через адресные subpath-импорты `@feugene/granularity/directives/*`.

## Что экспортируется

- `vAutofocus`
- `vAutosize`
- `vClickOutside`
- `vDropzone`
- `vHotkey`
- `vLoading`
- `createLoading`

Также экспортируются типы, связанные с binding value каждой директивы.

## Когда использовать package-level директивы

Эти директивы полезны, если:

- вы используете компоненты пакета и хотите держать сопутствующие interaction primitives рядом с ними;
- вам нужен единый импорт из пакета дизайн-системы;
- логика директивы уже описана и поддерживается внутри `granularity`, и нет смысла дублировать её на стороне приложения.

## Кратко по директивам

### `vAutofocus`

Директива для фокусировки элемента при монтировании или обновлении в соответствии с переданным binding value.

### `vAutosize`

Директива для автоизменения высоты текстового поля по содержимому.

### `vClickOutside`

Директива для обработки клика вне элемента. Подходит для dropdown, popover, contextual menu и похожих сценариев.

### `vDropzone`

Директива для drag-and-drop загрузки файлов.

Поддерживаемые возможности по текущему API:

- передача обработчика `onFiles`;
- `enabled` и `multiple`;
- запуск `validators` перед вызовом `onFiles`;
- управление `preventDefault` и `stopPropagation`;
- `onError` для обработки ошибок валидации;
- `onStateChange` для реакции на `drag-over` состояние;
- `overClass` для CSS-класса активной dropzone.

Минимальный пример:

```ts

```

### `vHotkey`

Директива для привязки клавиатурных shortcut-ов к элементу или контексту использования.

### `vLoading` и `createLoading`

API для управления loading-state через директиву и контроллер.

## Импорт

### Агрегированный импорт

```ts
import { vClickOutside, vLoading } from '@feugene/granularity/directives'

void vClickOutside
void vLoading
```

### Гранулярный импорт отдельных директив

```ts
import { vClickOutside } from '@feugene/granularity/directives/clickOutside'
import { vLoading } from '@feugene/granularity/directives/loading'

void vClickOutside
void vLoading
```

## Типы глобальных директив в IDE

- Если приложение импортирует что-то из `@feugene/granularity` root entrypoint или из `@feugene/granularity/directives`, типы глобальных директив подхватываются автоматически через package declarations.
- Если приложение использует только адресные импорты вида `@feugene/granularity/directives/*`, для IDE нужен один явный type-only импорт в `env.d.ts` / `vite-env.d.ts` / `shims-vue.d.ts`:

```ts
import type {} from '@feugene/granularity/directives/globalDirectives'
```

- Такой импорт не влияет на runtime и не ломает tree-shaking: он нужен только для подключения `vue`-augmentation с `GlobalDirectives`.

Если вам нужна отдельная бизнес-логика файлов, связанная с `vDropzone`, смотрите [`file-validation.md`](./file-validation.md).