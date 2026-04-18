# Авто-импорт через `@feugene/unplugin-granularity`

[`@feugene/unplugin-granularity`](../../unplugin-granularity/README.md) — отдельный build-time пакет-резолвер для
[`unplugin-vue-components`](https://github.com/unplugin/unplugin-vue-components), заточенный под `@feugene/granularity`.
Он вставляет в SFC **статические `import`-ы** на granular subpath exports пакета
(`@feugene/granularity/components/<Name>`, `@feugene/granularity/directives/<name>`), поэтому tree-shaking
остаётся максимально плотным: в бандл попадает ровно то, что встретилось в шаблонах.

## Когда использовать

- это **рекомендуемый** способ для prod-приложений;
- когда хочется писать `<DsButton />` и `v-hotkey` прямо в шаблонах без ручных `import`-ов;
- когда важен минимальный JS- и CSS-бандл и не хочется следить за списком импортов руками;
- когда приложение уже использует `unplugin-vue-components`.

Для директив, используемых **не в шаблоне** (в `render()`/JSX), резолвер бесполезен — такие случаи закрывает
runtime-адаптер [`@feugene/granularity/vue`](./vue-plugin.md). Оба инструмента ортогональны и свободно сочетаются.

## Установка

```bash
yarn add -D @feugene/unplugin-granularity unplugin-vue-components
```

`@feugene/granularity` и `unplugin-vue-components` подключаются как **peer**-зависимости — резолвер сам
ничего не тащит в рантайм приложения.

## Базовая конфигурация

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { GranularityResolver } from '@feugene/unplugin-granularity'

export default defineConfig({
  plugins: [
    vue(),
    Components({
      resolvers: [GranularityResolver()],
    }),
  ],
})
```

После этого в шаблонах — никаких ручных `import`:

```vue
<template>
  <DsInput v-model="value" v-hotkey.enter="submit" />
  <DsButton @click="submit">Go</DsButton>
</template>
```

Плагин сам добавит в собранный SFC:

```ts
import { DsButton } from '@feugene/granularity/components/DsButton'
import { DsInput } from '@feugene/granularity/components/DsInput'
import { vHotkey } from '@feugene/granularity/directives/hotkey'
import '@feugene/granularity/components/DsButton/styles.css'
import '@feugene/granularity/components/DsInput/styles.css'
```

## Опции

```ts
GranularityResolver({
  prefix: 'Ds',             // префикс компонентов, по умолчанию 'Ds'
  importStyle: true,        // подключать component-level CSS, по умолчанию true
  directives: true,         // резолвить директивы из whitelist, по умолчанию true
  exclude: [/^DsIcon$/],    // компоненты, которые резолвер игнорирует
})
```

| Опция | Тип | По умолчанию | Описание |
|-------|-----|--------------|----------|
| `prefix` | `string` | `'Ds'` | Префикс, по которому резолвер узнаёт компоненты пакета. |
| `importStyle` | `boolean` | `true` | Включать ли рядом с компонентом side-effect импорт `styles.css`. |
| `directives` | `boolean \| string[]` | `true` | Whitelist директив. `false` — выключить, массив — ограничить явно. |
| `exclude` | `(string \| RegExp)[]` | `[]` | Исключения: компоненты/директивы, которые резолвер пропустит. |

Поддерживаемые из коробки директивы: `v-autofocus`, `v-autosize`, `v-click-outside`, `v-dropzone`, `v-hotkey`,
`v-loading`.

## Нюансы

- **Это build-time инструмент.** Он подхватывает **только** то, что упомянуто в `<template>`. Использование компонента
  через `<component :is="..." />` или в `render()`-функции резолвер не увидит — в таких местах нужен прямой импорт или
  `createGranularity` (для директив).
- **Whitelist директив — явный.** Если в пакете появилась новая директива, её нужно добавить в whitelist резолвера
  (или передать через `directives: [...]`). Это сделано сознательно: резолвер не сканирует `node_modules` — он
  детерминирован и быстр.
- **CSS.** `importStyle: true` гарантирует, что рядом с JS-импортом компонента подтянется его `styles.css` — поэтому
  отдельно общий `@feugene/granularity/styles.css` не нужен (если только вы не хотите загрузить все стили целиком).
- **Совместимость с `createGranularity`.** Резолвер и рантайм-фабрика **не конфликтуют**: резолвер делает локальные
  импорты в конкретных SFC, фабрика регистрирует директивы/`provide`/`globalProperties` глобально. Типично
  использовать их вместе.
- **Глобальная типизация.** `unplugin-vue-components` сам генерирует `components.d.ts` с глобальными компонентами,
  поэтому Volar/`vue-tsc` ничего руками дописывать не нужно.

## Демо

- [`apps/playground-8`](../../../apps/playground-8/README.md) — чистый сценарий авто-импорта.
- [`apps/playground-9`](../../../apps/playground-9/README.md) — резолвер + композитные компоненты + UnoCSS preset.
