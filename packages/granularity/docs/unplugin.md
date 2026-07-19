# Авто-импорт через `@feugene/unplugin-granularity`

[`@feugene/unplugin-granularity`](../../unplugin-granularity/README.md) — отдельный build-time пакет-резолвер для
[`unplugin-vue-components`](https://github.com/unplugin/unplugin-vue-components), заточенный под `@feugene/granularity`.
Он вставляет в SFC **статические `import`-ы** на granular subpath exports пакета
(`@feugene/granularity/components/<Name>`, `@feugene/granularity/directives/<name>`), поэтому tree-shaking
остаётся максимально плотным: в бандл попадает ровно то, что встретилось в шаблонах.

## Когда использовать

- это **рекомендуемый** способ для prod-приложений;
- когда хочется писать `<GrButton />` и `v-hotkey` прямо в шаблонах без ручных `import`-ов;
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
  <GrInput v-model="value" v-hotkey.enter="submit" />
  <GrButton @click="submit">
Go
</GrButton>
</template>
```

Плагин сам добавит в собранный SFC:

```ts
import '@feugene/granularity/components/GrButton/styles.css'
import '@feugene/granularity/components/GrInput/styles.css'
```

## Опции

```ts
GranularityResolver({
  prefix: 'Gr',             // префикс компонентов, по умолчанию 'Gr'
  importStyle: true,        // подключать component-level CSS, по умолчанию true
  directives: true,         // резолвить директивы из whitelist, по умолчанию true
  exclude: /^GrIcon$/,      // компоненты/директивы, которые резолвер игнорирует
})
```

| Опция | Тип | По умолчанию | Описание |
|-------|-----|--------------|----------|
| `prefix` | `string` | `'Gr'` | Префикс, по которому резолвер узнаёт компоненты пакета. |
| `importStyle` | `boolean \| 'css'` | `true` | Включать ли рядом с компонентом side-effect импорт `styles.css`. |
| `directives` | `boolean` | `true` | Резолвить ли директивы из встроенного whitelist. `false` — выключить. |
| `exclude` | `RegExp` | — | Исключения: компоненты/директивы, которые резолвер пропустит. |

Поддерживаемые из коробки директивы: `v-autofocus`, `v-autosize`, `v-click-outside`, `v-dropzone`, `v-hotkey`,
`v-loading`.

## Companion-пакеты и общая фабрика `createGranularResolver`

Тот же авто-импорт можно включить для **пакетов-спутников** экосистемы (например
[`@feugene/granularity-datepicker`](../../granularity-datepicker/README.md)). Их компоненты тоже
начинаются на `Gr*`, поэтому жадный core-резолвер по префиксу перехватил бы их и попытался
импортировать из несуществующего пути в `@feugene/granularity`. Решение — **whitelist-резолвер**,
построенный на общей фабрике `createGranularResolver`, и правильный порядок регистрации:

```ts
import { GranularityResolver } from '@feugene/unplugin-granularity'
import { GranularityDatepickerResolver } from '@feugene/granularity-datepicker/resolver'

Components({
  resolvers: [
    GranularityDatepickerResolver(), // whitelist — раньше…
    GranularityResolver(),           // …жадного Gr*-резолвера ядра
  ],
})
```

Как собрать собственный companion-пакет и его резолвер — см.
[`companion-packages.md`](./companion-packages.md).

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

