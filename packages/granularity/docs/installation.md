# Установка и подключение

Этот пакет — [`@feugene/granularity`](https://github.com/efureev/unocss-preset-granular) —
дизайн-система на `Vue 3`, построенная поверх [`@feugene/unocss-preset-granular`][preset-granular].
Поэтому единственный поддерживаемый и документированный способ подключения — тонкая
настройка через `UnoCSS` preset `@feugene/granularity/uno-node`. Остальные варианты
(прямые CSS-импорты, root import со «всем сразу» и т.п.) не поддерживаются и в этой
инструкции не описываются.

> Общие принципы установки и обоснование выбора `devDependencies` подробно описаны в
> документации пресета:
> [`unocss-preset-granular/docs/ru/installation.md`][preset-installation] и
> [`unocss-preset-granular/docs/ru/getting-started.md`][preset-getting-started].

## Требования

- **Node ≥ 22**
- **ESM only** (`"type": "module"` в `package.json` приложения)
- [`vue`][vue] `^3` — peer-зависимость пакета (устанавливает приложение).
- [`unocss`][unocss] `^66` и [`@unocss/preset-wind4`][preset-wind4] — peer-зависимости
  пресета (устанавливает приложение, на build-time).

## Установка

В **приложении**:

```bash
yarn add vue @feugene/granularity
yarn add -D unocss @unocss/preset-mini
# yarn add -D unocss @unocss/preset-wind4 
```

Почему `@feugene/granularity` стоит в `dependencies`:

- компоненты и директивы пакета импортируются из исходников приложения и попадают в
  runtime-бандл;
- пресет `@feugene/granularity/uno-node` используется только на build-time (в
  `uno.config.ts`) и сам в рантайм бандл не попадает.

Почему `unocss` и `@unocss/preset-wind4` стоят в `devDependencies`:

- они выполняются исключительно на build-time и ни одной строкой не попадают в
  итоговый бандл приложения (подробно — в [документации пресета][preset-installation]).

## Минимальный `uno.config.ts`

```ts
import { defineConfig, presetMini } from 'unocss'
// import presetWind4 from '@unocss/preset-wind4'

import { presetGranularityNode } from '@feugene/granularity/uno-node'

export default defineConfig({
  presets: [
    presetMini(),
    // presetWind4(),
    presetGranularityNode({
      components: ['DsButton'],
      themes: ['light', 'dark'],
    }),
  ],
})
```

По умолчанию `presetGranularityNode` подключает:

- встроенный `tokens.css`;
- встроенный `base.css`;
- выбранные темы (по умолчанию — `light`);
- CSS выбранных компонентов.

Все доступные опции (`components`, `themes`, `themeFiles`, `tokens`, `baseFile`,
`layer`) описаны в [`./unocss.md`](./unocss.md).

## Подключение к `Vite`

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'

export default defineConfig({
  plugins: [
    Vue(),
    UnoCSS(),
  ],
})
```

В точке входа приложения импортируется виртуальный CSS из `UnoCSS`:

```ts
// main.ts
import 'virtual:uno.css'

import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')
```

## Опциональные интеграции

Следующие вспомогательные пакеты не обязательны, но часто используются вместе с
`@feugene/granularity`:

- [`@feugene/unplugin-granularity`](../../unplugin-granularity/README.md) — авто-импорт
  компонентов и директив пакета в шаблонах `Vue` (build-time резолвер для
  [`unplugin-vue-components`][unplugin-vue-components]). Подробности — в
  [`./unplugin.md`](./unplugin.md).
- `@feugene/granularity/vue` — runtime-адаптер с функцией `createGranularity` для
  единого bootstrap-входа (директивы, `provide`, `app.config.globalProperties`).
  Подробности — в [`./vue-plugin.md`](./vue-plugin.md).

Оба варианта дополняют основной способ установки и не заменяют его.

## Ссылки

- Репозиторий пакета: <https://github.com/efureev/unocss-preset-granular>
- Пресет, на котором построен пакет:
  [`@feugene/unocss-preset-granular`][preset-granular]
  ([docs/ru][preset-docs])
- [`unocss`][unocss] и [`@unocss/preset-wind4`][preset-wind4]
- [`vue`][vue]
- [`unplugin-vue-components`][unplugin-vue-components]

[preset-granular]: https://github.com/efureev/unocss-preset-granular
[preset-docs]: ../../../../unocss-preset-granular/docs/ru/README.md
[preset-installation]: ../../../../unocss-preset-granular/docs/ru/installation.md
[preset-getting-started]: ../../../../unocss-preset-granular/docs/ru/getting-started.md
[unocss]: https://github.com/unocss/unocss
[preset-wind4]: https://github.com/unocss/unocss/tree/main/packages-presets/preset-wind4
[vue]: https://github.com/vuejs/core
[unplugin-vue-components]: https://github.com/unplugin/unplugin-vue-components
