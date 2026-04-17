# playground-9 — композитный компонент из `@feugene/extra-granularity`

Это приложение демонстрирует, **как собирать композитные компоненты поверх
`@feugene/granularity`** в отдельном npm-пакете и интегрировать их в
приложение, сохраняя гранулярность и tree-shaking.

Используется всё сразу:

1. **Композитный компонент** `XgQuickForm` из пакета
   [`@feugene/extra-granularity`](../../packages/extra-granularity) — собран
   из трёх примитивов granularity: `DsFormField`, `DsInput`, `DsButton`.
2. **Авто-импорт примитивов** через
   [`@feugene/unplugin-granularity`](../../packages/unplugin-granularity)
   поверх `unplugin-vue-components` (как в `playground-8`) — на случай, если
   в шаблонах понадобятся и сырые `Ds*`.
3. **UnoCSS + `presetGranularityNode`** — токены тем и preflight-ы именно
   тех примитивов, которые использует композит (как в `playground-5`).
   Никаких `foundation.css` / `components/<Name>/styles.css` руками.

## Зачем отдельный пакет для композитов

- `@feugene/granularity` остаётся **минимальным рантаймом** из атомарных
  `Ds*`-примитивов.
- `@feugene/extra-granularity` — слой выше: уже готовые сценарии (формы,
  списки, диалоги), собранные из тех же примитивов. У него собственный
  релизный цикл и `peerDependency` на granularity, так что версии можно
  двигать независимо.
- Tree-shaking работает **на обоих уровнях**:
  - в бандл попадает только реально использованный композит
    (`XgQuickForm`);
  - и только те `Ds*`, которые композит реально импортирует
    (`DsFormField`, `DsInput`, `DsButton`).

## Что делает приложение

Простая форма «добавить задачу»: одно поле ввода с лейблом и ошибкой,
кнопка `Submit`. На `@submit` значение добавляется в список ниже.

`src/App.vue` **явно** импортирует композит:

```ts
import { XgQuickForm } from '@feugene/extra-granularity/components/XgQuickForm'
```

Это важно: стандартный `GranularityResolver` резолвит только `Ds*`-имена —
композитные `Xg*` приходят из другого пакета и не входят в его whitelist.
В реальном проекте для `Xg*` можно завести собственный резолвер.

## Как это устроено

### `vite.config.ts`

```ts
import Components from 'unplugin-vue-components/vite'
import UnoCSS from 'unocss/vite'
import { GranularityResolver } from '@feugene/unplugin-granularity'

export default defineConfig({
  plugins: [
    vue(),
    UnoCSS({ configFile: './uno.config.ts' }),
    Components({
      dts: './components.d.ts',
      // В этом playground'е директив нет — отключаем их авто-импорт.
      resolvers: [GranularityResolver({ directives: false })],
    }),
  ],
})
```

### `uno.config.ts`

```ts
import { defineConfig, presetMini } from 'unocss'
import { presetGranularityNode } from '@feugene/granularity/uno-node'

export default defineConfig({
  presets: [
    presetMini(),
    presetGranularityNode({
      // Ровно те примитивы, что использует XgQuickForm.
      components: ['DsFormField', 'DsInput', 'DsButton'],
      layer: 'granularity',
    }),
  ],
})
```

### `src/granularity.ts`

```ts
// Preflights примитивов + токены тем — из preset'а.
import 'virtual:uno:granularity.css'

// Стили самого композита — единственный CSS-импорт из extra-granularity.
import '@feugene/extra-granularity/components/XgQuickForm/styles.css'
```

### `src/App.vue`

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { XgQuickForm } from '@feugene/extra-granularity/components/XgQuickForm'

const items = ref<string[]>([])
const error = ref<string | undefined>(undefined)

function onSubmit(value: string) {
  if (!value) return (error.value = 'Поле не может быть пустым')
  error.value = undefined
  items.value.unshift(value)
}
</script>

<template>
  <XgQuickForm
    label="Добавить задачу"
    placeholder="Введите текст и нажмите Enter…"
    submit-label="Добавить"
    :error="error"
    @submit="onSubmit"
  />
</template>
```

## Когда выбирать такой подход

- Когда в приложениях повторяются **одни и те же связки** примитивов
  (форма-инпут-кнопка, карточка-списком, диалог-подтверждения, …) — их
  логично вынести в общий пакет над granularity.
- Когда хочется **свой UI-kit поверх дизайн-системы**, не раздувая
  `granularity` «толстыми» компонентами.
- Когда разные команды/проекты зависят от одного набора композитов, но
  релиз рантайма должен быть независимым.

## Нюансы и подводные камни

- 🟢 **Tree-shaking по JS доказан сборкой**: в `dist/assets/granularity-*.js`
  встречаются только `DsFormField`, `DsInput`, `DsButton` (по 1 разу).
  Никаких других `Ds*` и директив. Композит `XgQuickForm` попадает в
  чанк приложения (в чанк-группу `granularity` он не включён намеренно —
  это код из `extra-granularity`).
- 🟢 **Tree-shaking по CSS**: в `granularity-*.css` только layer
  `granularity` для перечисленных примитивов + токены тем. Ни одного
  postfix-а от неиспользуемых компонентов.
- 🟡 **Композиты `Xg*` не резолвятся `GranularityResolver`-ом** по
  умолчанию — импортируйте их явно, либо напишите собственный резолвер
  для `@feugene/extra-granularity`.
- 🟡 **Whitelist `presetGranularityNode`** должен совпадать с тем, что
  реально использует композит. Если `XgQuickForm` добавит внутрь себя
  `DsCheckbox`, его нужно добавить и в `components: [...]` конфига
  UnoCSS.
- 🟡 **Не импортируйте из корня `@feugene/granularity` или
  `@feugene/extra-granularity`** — только sub-path
  (`.../components/<Name>`). Корневой импорт может затащить `index.ts`
  пакета целиком.
- 🔴 **В `extra-granularity` не переносите примитивы.** Всё, что можно
  сделать одним `Ds*`, должно оставаться в `granularity`.

## Скрипты

```bash
yarn workspace @feugene/granularity-playground-9 dev
yarn workspace @feugene/granularity-playground-9 build
```

## Проверка tree-shaking

После production-сборки:

```
dist/assets/granularity-*.js   → { DsFormField: 1, DsInput: 1, DsButton: 1 }
dist/assets/index-*.js         → { DsFormField: 1, DsInput: 1, DsButton: 1, XgQuickForm: 2 }
dist/assets/vue-*.js           → { }
```

Ни одного другого `Ds*`-имени (DsAlert, DsBadge, DsCard, DsModal, …) и
ни одной директивы в бандле нет — контракт «только три примитива + один
композит» выполняется.
