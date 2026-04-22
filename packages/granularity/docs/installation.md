# Установка и подключение

Этот пакет — [`@feugene/granularity`][granularity-repo] —
дизайн-система на `Vue 3`, построенная поверх [`@feugene/unocss-preset-granular`][preset-granular].
Единственный поддерживаемый и документированный способ подключения —
`UnoCSS` preset `presetGranularNode` из [`@feugene/unocss-preset-granular/node`][preset-granular]
с `granularityProvider` из `@feugene/granularity/granular-provider/node`.

Остальные варианты (прямые CSS-импорты, root import со «всем сразу»,
подключение `foundation.css`/`styles.css` и т.п.) не поддерживаются и в этой
инструкции не описываются.

> Общие принципы установки (обоснование выбора `devDependencies`, требования
> к окружению, рецепт сборки провайдеров) подробно описаны в документации
> пресета: [`unocss-preset-granular/docs/ru/installation.md`][preset-installation]
> и [`unocss-preset-granular/docs/ru/getting-started.md`][preset-getting-started].

## Требования

- **Node ≥ 22**
- **ESM only** (`"type": "module"` в `package.json` приложения)
- [`vue`][vue] `^3` — peer-зависимость пакета (устанавливает приложение).
- [`unocss`][unocss] `≥ 66` и [`@unocss/preset-wind4`][preset-wind4]
  (или `@unocss/preset-mini`) — peer-зависимости пресета (устанавливает
  приложение, на build-time).

## Установка

В **приложении**:

```bash
yarn add vue @feugene/granularity
yarn add -D unocss @feugene/unocss-preset-granular @unocss/preset-wind4
```

Почему `@feugene/granularity` стоит в `dependencies`:

- компоненты и директивы пакета импортируются из исходников приложения и
  попадают в runtime-бандл.

Почему `@feugene/unocss-preset-granular`, `unocss` и `@unocss/preset-wind4`
стоят в `devDependencies`:

- они выполняются исключительно на build-time (в `uno.config.ts`) и ни одной
  строкой не попадают в итоговый бандл приложения — подробности в
  [документации пресета][preset-installation].

Сам `granularityProvider` реэкспортируется пакетом через
`@feugene/granularity/granular-provider/node` и тоже используется только в
`uno.config.ts`, поэтому дополнительных зависимостей не требует.

## Базовый `uno.config.ts`

Самый минимальный рабочий конфиг — только `presetGranularNode` и сам
granular-провайдер пакета. Никаких `components`, `themes`, `layer`,
`granularContent` пока нет:

```ts
import { defineConfig, presetMini } from 'unocss'
import { presetGranularNode } from '@feugene/unocss-preset-granular/node'

import granularityProvider from '@feugene/granularity/granular-provider/node'

export default defineConfig({
  presets: [
    presetMini(),
    presetGranularNode({
      providers: [granularityProvider],
    }),
  ],
})
```

Что это уже даёт:

- в сборку подмешиваются `tokens.css` и `base.css` пакета;
- включены все компоненты, объявленные в granular-провайдере, и их
  preflight-ы (эквивалент `components: 'all'` по умолчанию);
- работают rules/variants и safelist провайдера.

Дальнейшие секции показывают, как **наращивать** этот базовый пример
опциями по мере необходимости. Все эти опции — необязательные.

### Сужаем список компонентов

Чтобы не тянуть в бандл CSS всех компонентов — явно выбираем нужные:

```ts
presetGranularNode({
  providers: [granularityProvider],
  components: [
    { provider: '@feugene/granularity', names: ['DsButton'] },
  ],
})
```

### Темы

По умолчанию подключаются все темы провайдера. Ограничим их списком:

```ts
presetGranularNode({
  providers: [granularityProvider],
  components: [{ provider: '@feugene/granularity', names: ['DsButton'] }],
  themes: { names: ['light', 'dark'] },
})
```

`themeFiles` позволяет переопределить CSS темы файлом приложения,
`tokensFile`/`baseFile` — подменить `tokens.css`/`base.css`.
Подробности — в [документации пресета][preset-getting-started].

### Отдельный layer

По умолчанию preflight-ы пакета идут без явного `layer`. Чтобы
положить их в собственный слой (и управлять порядком относительно
`preflights`/`default`) — укажите `layer`:

```ts
presetGranularNode({
  providers: [granularityProvider],
  components: [{ provider: '@feugene/granularity', names: ['DsButton'] }],
  themes: { names: ['light', 'dark'] },
  layer: 'granular',
})
```

### Авто-сканирование (`granularContent`)

Когда приложение использует компоненты пакета из уже собранного `dist/`
(через subpath imports), extractor UnoCSS должен заглянуть в
директории этих компонентов и `.js`/`.ts` чанки. Для этого есть хелпер
`granularContent`:

```ts
import { defineConfig, presetMini } from 'unocss'
import { granularContent, presetGranularNode } from '@feugene/unocss-preset-granular/node'
import granularityProvider from '@feugene/granularity/granular-provider/node'

const granularOptions = {
  providers: [granularityProvider],
  components: [{ provider: '@feugene/granularity', names: ['DsButton'] }],
  themes: { names: ['light', 'dark'] },
  layer: 'granular' as const,
}

export default defineConfig({
  presets: [
    presetMini(),
    presetGranularNode(granularOptions),
  ],
  // ОБЯЗАТЕЛЬНО для авто‑сканирования: `@unocss/vite` читает `content`
  // только из top-level user-config, не из `preset.content`.
  content: granularContent(granularOptions),
})
```

Если в приложении уже есть свой `content.pipeline.include`, объедините
его с `granularContent(...).pipeline.include` — пример в
[`./unocss.md`](./unocss.md).

Все доступные опции пресета (`components`, `themes`, `themeFiles`,
`tokens`, `baseFile`, `scan`, `layer`) описаны в
[документации пресета][preset-getting-started].

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
import '@unocss/reset/tailwind-compat.css'
import 'virtual:uno.css'

import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')
```

Готовый пример такой связки — в `apps/showcase` и `apps/playground-5`
этого репозитория.

## Опциональные интеграции

Следующие вспомогательные пакеты не обязательны, но часто используются
вместе с `@feugene/granularity`:

- [`@feugene/unplugin-granularity`](../../unplugin-granularity/README.md) —
  авто-импорт компонентов и директив пакета в шаблонах `Vue` (build-time
  резолвер для [`unplugin-vue-components`][unplugin-vue-components]).
  Подробности — в [`./unplugin.md`](./unplugin.md).
- `createGranularity` из пакета — runtime-адаптер, единый bootstrap-вход
  для директив, `provide`, `app.config.globalProperties`. Подробности —
  в [`./vue-plugin.md`](./vue-plugin.md).

Оба варианта дополняют основной способ установки и не заменяют его.

## Ссылки

- Репозиторий пакета: <https://github.com/efureev/unocss-preset-granular>
- Пресет, на котором построен пакет:
  [`@feugene/unocss-preset-granular`][preset-granular]
  ([docs/ru][preset-docs])
- [`unocss`][unocss] и [`@unocss/preset-wind4`][preset-wind4]
- [`vue`][vue]
- [`unplugin-vue-components`][unplugin-vue-components]

[granularity-repo]: https://github.com/efureev/unocss-preset-granular
[preset-granular]: https://github.com/efureev/unocss-preset-granular
[preset-docs]: ../../../../unocss-preset-granular/docs/ru/README.md
[preset-installation]: ../../../../unocss-preset-granular/docs/ru/installation.md
[preset-getting-started]: ../../../../unocss-preset-granular/docs/ru/getting-started.md
[unocss]: https://github.com/unocss/unocss
[preset-wind4]: https://github.com/unocss/unocss/tree/main/packages-presets/preset-wind4
[vue]: https://github.com/vuejs/core
[unplugin-vue-components]: https://github.com/unplugin/unplugin-vue-components
