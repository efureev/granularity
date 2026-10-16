# @feugene/unplugin-granularity

[`unplugin-vue-components`](https://github.com/unplugin/unplugin-vue-components)
резолвер для дизайн-системы [`@feugene/granularity`](https://github.com/efureev/granularity) — один на
ядро и все пакеты-спутники.

Резолвит компоненты `Gr*` и директивы `v-*` из шаблонов Vue на **гранулярные sub-path-экспорты**
пакетов (`@feugene/granularity/components/<Name>`, `@feugene/granularity-chrono/components/<Name>`,
`@feugene/granularity/directives/<module>`), а не на корневой `index`: в бандл попадает ровно то, что
встретилось в шаблонах, а granum видит компонент по подпути — импорт из корня он отвергает.

Список компонентов вести не нужно: резолвер находит пакеты экосистемы в `package.json` приложения и
читает их `exports`.

## Установка

```bash
# yarn
yarn add -D @feugene/unplugin-granularity unplugin-vue-components
# npm
npm i -D @feugene/unplugin-granularity unplugin-vue-components
# pnpm
pnpm add -D @feugene/unplugin-granularity unplugin-vue-components
```

`@feugene/granularity` и `unplugin-vue-components` подключаются как
**peer**-зависимости — пакет сам ничего не тащит в рантайм и не дублирует типы.

## Использование

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

После этого в шаблонах не нужно ручных `import`-ов:

```vue
<template>
  <GrInput v-model="value" v-hotkey.enter="submit" />
  <GrButton @click="submit">Go</GrButton>
</template>
```

`unplugin-vue-components` сам вставит в `<script setup>` что-то вроде:

```ts
import { GrButton } from '@feugene/granularity/components/GrButton'
import { GrInput } from '@feugene/granularity/components/GrInput'
import { vHotkey } from '@feugene/granularity/directives/hotkey'
```

Никаких `@feugene/granularity` (корневой импорт) здесь нет — Rollup/Rolldown
видит только реально используемые модули.

## Опции

```ts
GranularityResolver({
  packages: ['@feugene/granularity', '@feugene/granularity-chrono'], // default — из package.json
  root: process.cwd(), // откуда читать package.json и искать пакеты
  prefix: 'Gr', // имена без префикса не резолвятся; default 'Gr'
  importStyle: false, // подтягивать <pkg>/components/<Name>/styles.css; default false
  directives: true, // авто-импорт директив (v-hotkey и т.п.); default true
  exclude: /^GrIn/, // игнорировать имена по RegExp
})
```

| Опция         | Тип                          | По умолчанию | Назначение                                              |
| ------------- | ---------------------------- | ------------ | -------------------------------------------------------- |
| `packages`    | `string[]`                   | все `@feugene/granularity*` из `package.json` | Чьи компоненты резолвить. Не нашлось ни одного — ядро. |
| `root`        | `string`                     | `process.cwd()` | Корень приложения: его `package.json` и точка поиска пакетов. |
| `prefix`      | `string`                     | `'Gr'`       | Имена без префикса резолвер не смотрит.                  |
| `importStyle` | `boolean \| 'css'`           | `false`      | Подгружать ли CSS компонента как side-effect. Пакетам экосистемы не нужно — см. «Нюансы». |
| `directives`  | `boolean`                    | `true`       | Включать ли второй резолвер — для директив.              |
| `exclude`     | `RegExp \| undefined`        | —            | Исключение из обработки (применяется и к компонентам, и к директивам). |

## Как резолвер находит компоненты

- **Пакеты** — из `dependencies`, `devDependencies` и `peerDependencies` приложения: все
  `@feugene/granularity` и `@feugene/granularity-*`. Пакеты без компонентов (`-test-kit`, `-devtools`)
  ничего не добавляют.
- **Компоненты** — ключи `./components/<Name>` в `exports` каждого пакета. Индекс строится один раз, при
  первом теге из шаблона.
- **Части составных компонентов** (`GrListItem`, `GrTabPanel`) импортируются из подпути родителя —
  `@feugene/granularity/components/GrList`: туда ведёт их запись в `exports`. Такой импорт guard и
  селекция granum судят по владельцу с любой версии 2.x; подпуть самой части (`components/GrListItem`)
  granum сводит к владельцу только с 2.1 и только у пакета, собранного 2.1.
- **Неизвестное имя** (опечатка, свой компонент приложения) не резолвится: импорта несуществующего пути
  не будет, Vue предупредит о неизвестном компоненте.
- **Имя, которое экспортируют два пакета**, резолвер не трогает: такой компонент импортируют руками.

Порядок резолверов не важен: имя ведёт ровно в тот пакет, который его экспортирует. Собственные
резолверы спутников (`@feugene/granularity-chrono/resolver` и другие) и фабрика
`createGranularResolver` остаются для уже написанных конфигов и работают рядом.

## Поддерживаемые директивы

| Шаблон              | Реэкспорт                                | Sub-path                                            |
| ------------------- | ---------------------------------------- | --------------------------------------------------- |
| `v-autofocus`       | `vAutofocus`                             | `@feugene/granularity/directives/autofocus`         |
| `v-autosize`        | `vAutosize`                              | `@feugene/granularity/directives/autosize`          |
| `v-click-outside`   | `vClickOutside`                          | `@feugene/granularity/directives/clickOutside`      |
| `v-dropzone`        | `vDropzone`                              | `@feugene/granularity/directives/dropzone`          |
| `v-hotkey`          | `vHotkey`                                | `@feugene/granularity/directives/hotkey`            |
| `v-loading`         | `vLoading`                               | `@feugene/granularity/directives/loading`           |

Директивы — фиксированным списком: имя экспорта и модуль из имени в шаблоне не
выводятся. При добавлении новой директивы в `@feugene/granularity` — добавьте её и в
[`src/manifest.ts`](./src/manifest.ts) этого пакета; гейт пакета сверяет список с
`exports` ядра.

## Нюансы

- **Стили ядра подключать через резолвер не нужно.** Чанки компонентов CSS не
  импортируют: собственный `styles.css` компонента granum берёт из манифеста
  пакета в слой `granum.components`, а у большинства компонентов своего CSS нет
  вовсе: их оформление — утилиты, которые генерирует движок по выбранным
  компонентам. Отсюда и `importStyle: false` по умолчанию: включённая опция
  ссылалась бы на `@feugene/granularity/components/<Name>/styles.css`, которого
  ядро не публикует, и ломала бы сборку. Опция осталась для провайдеров, которые
  раздают CSS отдельными файлами в `exports`. Статический запасной вариант без
  granum — `@feugene/granularity/styles.css` (токены, темы, base и preflight, без
  утилит).
- **Свои компоненты на `Gr…`.** Компонент приложения, которого нет в `exports` пакетов, резолвер не
  тронет. Если имя совпало с компонентом пакета — исключите его `exclude` (например `/^GrLegacy/`).
- **`GlobalComponents` для Volar.** Резолвер работает вместе с
  `dts` опцией `Components({ dts: 'components.d.ts' })` — тогда Volar/`vue-tsc`
  подхватят типы компонентов в шаблонах автоматически.
- **Webpack/Rspack/Rollup.** Резолвер не привязан к vite — его можно передавать
  в `resolvers` любого адаптера `unplugin-vue-components`.

## Лицензия

Apache License 2.0 с дополнительной оговоркой об этичном использовании — см. [LICENSE](./LICENSE).
Оговорка добавляет ограничение по применению поверх Apache-2.0, поэтому лицензия
source-available, а не одобренная OSI открытая.
