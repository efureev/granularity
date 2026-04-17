# playground-8 — способ «авто-импорт» (`unplugin-vue-components`)

Это приложение демонстрирует **четвёртый способ** интеграции
`@feugene/granularity` в Vue 3 — через авто-импорт компонентов и директив
плагином `unplugin-vue-components` + готовый резолвер из отдельного
build-time пакета [`@feugene/unplugin-granularity`](../../packages/unplugin-granularity).

Резолвер вынесен в **самостоятельный npm-пакет**, чтобы:

- `@feugene/granularity` оставался чистой рантайм-библиотекой, без зависимости
  на `unplugin-vue-components`;
- у резолвера был собственный релизный цикл и матрица совместимости;
- рядом можно было развивать build-only инструменты (Volar-хелперы, codemods),
  не засоряя рантайм.

## Смысл подхода

В большом проекте вручную писать `import { DsButton } from '@feugene/granularity/components/DsButton'`
на каждый тег в каждом `*.vue`-файле — утомительно. `unplugin-vue-components`
решает это так:

1. Сканирует шаблоны и находит используемые теги/директивы.
2. Для каждого имени спрашивает у резолверов, где его искать.
3. Добавляет **статический** `import ... from '@feugene/granularity/components/<Name>'`
   (или `/directives/<name>`) ровно в те SFC, где они используются.

Это комбинирует лучшее:
- **DX как у монолитного UI-kit-а** (нигде не пишешь импорты, просто ставишь тег).
- **Tree-shaking как у гранулярного пакета** (в бандл попадают только реально
  используемые компоненты).
- **CSS подтягивается точечно** — через `sideEffects: ["**/*.css"]` в
  `@feugene/granularity/package.json` + `styles.css` в подпапках компонентов.

## Что включает приложение

Те же два компонента и одна директива, что и в `playground-7`:

- `<DsInput />` и `<DsButton />` — без ручных импортов;
- `v-hotkey` на `Enter` в `DsInput` — тоже **без ручного импорта**, директиву
  подставляет резолвер.

## Как это устроено

`vite.config.ts`:

```ts
import Components from 'unplugin-vue-components/vite'
import { GranularityResolver } from '@feugene/unplugin-granularity'

export default defineConfig({
  plugins: [
    vue(),
    Components({
      dts: './components.d.ts',
      resolvers: [GranularityResolver()],
    }),
  ],
})
```

Сам резолвер живёт **в отдельном npm-пакете** `@feugene/unplugin-granularity`,
поэтому не попадает ни в рантайм приложения, ни в бандл `@feugene/granularity`.
`unplugin-vue-components` подключён как `peerDependency` резолвер-пакета —
типы `ComponentResolver` берутся из него, ничего не дублируется. Форма
резолвера совпадает с официальными (`ElementPlusResolver`, `NaiveUiResolver`,
…), поэтому он прозрачно встаёт в любой адаптер `unplugin-vue-components`
(vite / webpack / rspack / rollup / nuxt).

`GranularityResolver(options)` принимает:

| Опция | По умолчанию | Что делает |
|---|---|---|
| `prefix` | `'Ds'` | Префикс имён компонентов, которые резолвить. |
| `importStyle` | `true` | Подключать `styles.css` компонента через `sideEffects`. |
| `directives` | `true` | Включать авто-импорт директив (`v-hotkey`, `v-click-outside`, `v-autofocus`, `v-autosize`, `v-dropzone`, `v-loading`). |
| `exclude` | — | `RegExp`, исключающий некоторые имена. |

`src/App.vue`:

```vue
<template>
  <!-- ни одного импорта: теги и директивы разрешаются резолвером -->
  <DsInput
    v-model="draft"
    v-hotkey="{ Enter: { handler: add, allowInEditable: true } }"
  />
  <DsButton @click="add">Добавить</DsButton>
</template>
```

`src/main.ts`:

```ts
import { createApp } from 'vue'
import '@unocss/reset/tailwind-compat.css'
import '@feugene/granularity/foundation.css'

import App from './App.vue'

// Ни компонентов, ни директив — всё подставит резолвер.
createApp(App).mount('#app')
```

## Когда выбирать этот способ

- Когда в проекте **много разных компонентов** из `granularity`, и список
  регулярно меняется — писать импорты вручную дорого.
- Когда важен **минимальный бандл без компромиссов**: в итоговом бандле
  окажется ровно то, что реально встречается в шаблонах.
- Когда команда уже использует `unplugin-vue-components` для своих
  внутренних компонентов — добавить к ним ещё один резолвер легко.

## Нюансы и подводные камни

- 🟢 **Tree-shaking идеален**: если компонент/директива не упомянуты в
  шаблонах — их вообще нет в бандле (ни JS, ни CSS).
- 🟡 **Директивы резолвятся по имени в PascalCase**: `v-hotkey` → ищется
  `Hotkey`, `v-click-outside` → `ClickOutside`. Список фиксирован:
  `Autofocus`, `Autosize`, `ClickOutside`, `Dropzone`, `Hotkey`, `Loading`.
  Если появится новая директива в пакете — добавить её в whitelist
  `GRANULARITY_DIRECTIVES` в `packages/unplugin-granularity/src/manifest.ts`.
- 🟡 **Динамические имена тегов не работают**: `<component :is="...">` c
  переменной — резолвер не знает, какой компонент подставить. Для таких
  случаев импортируйте компонент явно.
- 🟡 **`components.d.ts`** — файл, который плагин регенерирует на лету.
  Добавьте его в `.gitignore` (либо коммитьте, но не редактируйте руками).
  В `tsconfig.json` он должен быть включён, чтобы Volar подхватывал типы
  тегов и директив в шаблонах.
- 🟡 **CSS-порядок.** Подключайте `foundation.css` **раньше** компонентных
  стилей. В этом приложении `foundation.css` импортируется в `main.ts` до
  `App.vue`, а компонентные `styles.css` автоматически добавятся ниже.
- 🟢 **Совместимо с фабрикой `createGranularity`.** Если понадобятся
  `provides`/`globalProperties` — можно дополнительно зарегистрировать
  фабрику из `playground-7`. Эти подходы не конфликтуют.
- 🔴 **Не импортируйте из корня пакета.** Ничего не ломается технически, но
  теряется наглядность: резолвер подставляет **sub-path** импорты, а
  корневой `import '@feugene/granularity'` может тянуть лишнее. Соблюдайте
  гранулярность последовательно.

## Скрипты

```bash
yarn workspace @feugene/granularity-playground-8 dev
yarn workspace @feugene/granularity-playground-8 build
```
