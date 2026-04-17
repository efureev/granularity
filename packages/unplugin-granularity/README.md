# @feugene/unplugin-granularity

[`unplugin-vue-components`](https://github.com/unplugin/unplugin-vue-components)
резолвер для дизайн-системы [`@feugene/granularity`](https://github.com/efureev/granularity).

Резолвит компоненты `Ds*` и поддерживаемые директивы `v-*` из шаблонов Vue на
**гранулярные sub-path-экспорты** пакета (`@feugene/granularity/components/<Name>`,
`@feugene/granularity/directives/<module>`), а не на общий корневой `index`.
За счёт этого tree-shaking работает максимально плотно: в бандл попадает ровно
то, что встретилось в шаблонах — ничего сверх.

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
  <DsInput v-model="value" v-hotkey.enter="submit" />
  <DsButton @click="submit">Go</DsButton>
</template>
```

`unplugin-vue-components` сам вставит в `<script setup>` что-то вроде:

```ts
import { DsButton } from '@feugene/granularity/components/DsButton'
import { DsInput } from '@feugene/granularity/components/DsInput'
import { vHotkey } from '@feugene/granularity/directives/hotkey'
import '@feugene/granularity/components/DsButton/styles.css'
import '@feugene/granularity/components/DsInput/styles.css'
```

Никаких `@feugene/granularity` (корневой импорт) здесь нет — Rollup/Rolldown
видит только реально используемые модули.

## Опции

```ts
GranularityResolver({
  prefix: 'Ds',       // префикс компонентов; default 'Ds'
  importStyle: true,  // подтягивать styles.css как side-effect; default true
  directives: true,   // авто-импорт директив (v-hotkey и т.п.); default true
  exclude: /^DsIn/,   // игнорировать имена по RegExp
})
```

| Опция         | Тип                          | По умолчанию | Назначение                                              |
| ------------- | ---------------------------- | ------------ | -------------------------------------------------------- |
| `prefix`      | `string`                     | `'Ds'`       | Какие компоненты из шаблонов считать «своими».          |
| `importStyle` | `boolean \| 'css'`           | `true`       | Подгружать ли CSS компонента как side-effect.            |
| `directives`  | `boolean`                    | `true`       | Включать ли второй резолвер — для директив.              |
| `exclude`     | `RegExp \| undefined`        | —            | Исключение из обработки (применяется и к компонентам, и к директивам). |

## Поддерживаемые директивы

| Шаблон              | Реэкспорт                                | Sub-path                                            |
| ------------------- | ---------------------------------------- | --------------------------------------------------- |
| `v-autofocus`       | `vAutofocus`                             | `@feugene/granularity/directives/autofocus`         |
| `v-autosize`        | `vAutosize`                              | `@feugene/granularity/directives/autosize`          |
| `v-click-outside`   | `vClickOutside`                          | `@feugene/granularity/directives/clickOutside`      |
| `v-dropzone`        | `vDropzone`                              | `@feugene/granularity/directives/dropzone`          |
| `v-hotkey`          | `vHotkey`                                | `@feugene/granularity/directives/hotkey`            |
| `v-loading`         | `vLoading`                               | `@feugene/granularity/directives/loading`           |

Whitelist фиксированный — так резолвер остаётся быстрым и детерминированным
(никакого рантайм-скана `node_modules`). При добавлении новой директивы в
`@feugene/granularity` — добавьте её и в
[`src/manifest.ts`](./src/manifest.ts) этого пакета.

## Нюансы

- **Стили.** Если вы подключаете `@feugene/granularity/styles.css` общим
  импортом — передайте `importStyle: false`, чтобы не дублировать CSS.
- **Коллизии имён.** Если в приложении есть свой `Ds…`, который не относится
  к granularity, используйте `exclude: /^DsLegacy/` или поменяйте `prefix`.
- **`GlobalComponents` для Volar.** Резолвер работает вместе с
  `dts` опцией `Components({ dts: 'components.d.ts' })` — тогда Volar/`vue-tsc`
  подхватят типы компонентов в шаблонах автоматически.
- **Webpack/Rspack/Rollup.** Резолвер не привязан к vite — его можно передавать
  в `resolvers` любого адаптера `unplugin-vue-components`.

## Лицензия

Apache-2.0
