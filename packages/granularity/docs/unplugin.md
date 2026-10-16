# Авто-импорт через `@feugene/unplugin-granularity`

[`@feugene/unplugin-granularity`](../../unplugin-granularity/README.md) — отдельный build-time пакет-резолвер для
[`unplugin-vue-components`](https://github.com/unplugin/unplugin-vue-components), заточенный под `@feugene/granularity`.
Он вставляет в SFC **статические `import`-ы** на granular subpath exports пакетов
(`@feugene/granularity/components/<Name>`, `@feugene/granularity-chrono/components/<Name>`,
`@feugene/granularity/directives/<name>`), поэтому tree-shaking остаётся максимально плотным: в бандл
попадает ровно то, что встретилось в шаблонах. Один резолвер обслуживает ядро и все спутники: компоненты
он берёт из `exports` пакетов, которые установило приложение, — список вести не нужно.

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

Плагин сам добавит в собранный SFC импорты самих компонентов — из подпути пакета, а не из корня, который
granum отвергает ошибкой `ComponentRootImportError`. CSS подключать не нужно. У большинства компонентов своего CSS нет вовсе, а у тех, у
кого есть, его granum берёт из манифеста пакета — см. «Нюансы».

## Опции

```ts
GranularityResolver({
  packages: ['@feugene/granularity', '@feugene/granularity-chrono'], // по умолчанию — из package.json
  root: process.cwd(), // откуда читать package.json и искать пакеты
  prefix: 'Gr', // имя без префикса резолвер не смотрит
  importStyle: false, // подключать component-level CSS, по умолчанию false
  directives: true, // резолвить директивы из whitelist, по умолчанию true
  exclude: /^GrIcon$/, // компоненты/директивы, которые резолвер игнорирует
})
```

| Опция | Тип | По умолчанию | Описание |
|-------|-----|--------------|----------|
| `packages` | `string[]` | все `@feugene/granularity*` из `package.json` приложения | Чьи компоненты резолвить. Не нашлось ни одного — ядро. |
| `root` | `string` | `process.cwd()` | Корень приложения: его `package.json` и точка поиска пакетов. |
| `prefix` | `string` | `'Gr'` | Имена без префикса резолвер не смотрит. |
| `importStyle` | `boolean \| 'css'` | `false` | Включать ли рядом с компонентом side-effect импорт `styles.css`. Пакетам экосистемы не нужно. |
| `directives` | `boolean` | `true` | Резолвить ли директивы из встроенного whitelist. `false` — выключить. |
| `exclude` | `RegExp` | — | Исключения: компоненты/директивы, которые резолвер пропустит. |

Поддерживаемые из коробки директивы: `v-autofocus`, `v-autosize`, `v-click-outside`, `v-dropzone`, `v-hotkey`,
`v-loading`.

## Спутники и части составных компонентов

Спутники отдельного резолвера не требуют: `GranularityResolver()` находит их в `package.json` приложения и
читает их `exports` так же, как ядро. Порядок резолверов не важен — имя ведёт ровно в тот пакет, который его
экспортирует; имя, которое экспортируют два пакета, резолвер не трогает, и такой компонент импортируют руками.

Часть составного компонента (`GrListItem`, `GrTabPanel`, `GrDropdownMenuItem`) приезжает из подпути
родителя — `@feugene/granularity/components/GrList`: селекция granum знает компонент по нему.

Резолверы спутников (`@feugene/granularity-chrono/resolver` и другие) и общая фабрика
`createGranularResolver` остаются для конфигов, где их уже подключили, — с ними рядом единый резолвер
работает так же. Как собрать собственный companion-пакет — см.
[`companion-packages.md`](./companion-packages.md).

## Нюансы

- **Это build-time инструмент.** Он подхватывает **только** то, что упомянуто в `<template>`. Использование компонента
  через `<component :is="..." />` или в `render()`-функции резолвер не увидит — в таких местах нужен прямой импорт или
  `createGranularity` (для директив).
- **Неизвестное имя не резолвится.** Опечатка в теге (`<GrButon>`) не превращается в импорт несуществующего
  пути: резолвер знает только то, что пакеты публикуют, и Vue предупредит о неизвестном компоненте в консоли.
- **Whitelist директив — явный.** Если в пакете появилась новая директива, её нужно добавить в whitelist резолвера.
  Компоненты резолвер читает из `exports` установленных пакетов — один раз, при первом теге.
- **CSS.** Через резолвер подключать нечего: чанки компонентов CSS не импортируют, собственный `styles.css`
  компонента granum берёт из манифеста пакета в слой `granum.components`, а utility-классы генерирует движок
  по выбранным компонентам. Статический запасной вариант без granum — `@feugene/granularity/styles.css`
  (токены, темы, base и preflight, без утилит). Отсюда `importStyle: false` по умолчанию: опция осталась для
  провайдеров, которые раздают CSS отдельными файлами и объявляют их в `exports`; подпутей
  `components/<Name>/styles.css` ядро не публикует, и включённая опция ломала бы сборку.
- **Совместимость с `createGranularity`.** Резолвер и рантайм-фабрика **не конфликтуют**: резолвер делает локальные
  импорты в конкретных SFC, фабрика регистрирует директивы/`provide`/`globalProperties` глобально. Типично
  использовать их вместе.
- **Глобальная типизация.** `unplugin-vue-components` сам генерирует `components.d.ts` с глобальными компонентами,
  поэтому Volar/`vue-tsc` ничего руками дописывать не нужно.

