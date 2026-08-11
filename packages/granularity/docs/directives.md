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

Значением может быть сам обработчик или объект:

| Поле | По умолчанию | Что делает |
| --- | --- | --- |
| `handler` | — | вызывается на клик вне элемента |
| `enabled` | `true` | выключает директиву, не снимая её с элемента |
| `capture` | `true` | слушатель висит в capture-фазе документа: `stopPropagation()` внутри панели не должен ломать закрытие |
| `events` | `['click']` | какие события считать кликом (`mousedown`, `pointerdown`, `touchstart`) |
| `exclude` | `[]` | зоны, клик по которым считается «внутренним» |

`exclude` принимает элементы, CSS-селекторы и геттеры — `HTMLElement | string | () => HTMLElement | null`.
Геттеры разрешаются **на каждый клик**, поэтому триггер, появившийся позже, тоже
учитывается. Всё, что вернулось не элементом (например сам Vue-ref или инстанс
компонента), директива отбрасывает молча — в шаблоне ref разворачивается сам, а в
`<script>` возвращайте `el.value`, для компонента — `instance.$el`.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { vClickOutside } from '@feugene/granularity/directives'

const open = ref(false)
const triggerEl = ref<HTMLElement | null>(null)
</script>

<template>
  <button ref="triggerEl" @click="open = true">
    Открыть
  </button>

  <div
    v-if="open"
    v-click-outside="{ handler: () => (open = false), exclude: [() => triggerEl] }"
  >
    Панель
  </div>
</template>
```

Клик неосновной кнопкой мыши игнорируется, а если элемент уже вынут из документа,
обработчик не зовётся вовсе: закрывать нечего.

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