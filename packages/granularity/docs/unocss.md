# Интеграция с `UnoCSS`

`@feugene/granularity` интегрируется с [`UnoCSS`][unocss] через пресет
[`@feugene/unocss-preset-granular`][preset-granular] и granular-провайдер,
который пакет экспортирует отдельным subpath-ом.

Базовые понятия (что такое granular-провайдер, как устроены foundation layers,
темы, safelist) описаны в документации пресета — см.
[`unocss-preset-granular/docs/ru/*`][preset-docs].

## Что именно подключается

- `presetGranularNode` — node-aware preset из
  `@feugene/unocss-preset-granular/node`; выполняется на build-time
  в `uno.config.ts`, автоматически подмешивает CSS preflight-ы
  (`tokens`, `base`, темы, компонентные стили) из файлов пакета.
- `granularContent` — хелпер из того же subpath-а; возвращает готовые
  `filesystem` и `pipeline.include` для точного авто-сканирования
  исходников выбранных компонентов (в т.ч. `.js`/`.ts` чанков в `dist/`).
- `granularityProvider` — granular-провайдер пакета,
  реэкспортируется через `@feugene/granularity/granular-provider/node`.
  Содержит описания компонентов пакета (например, `GrButton`), темы
  `light`/`dark` и token-определения.

## Базовый пример

Минимальный рабочий конфиг — только `presetGranularNode` с
granular-провайдером пакета. Этого достаточно, чтобы `UnoCSS`
увидел провайдера и подмешал `tokens.css`/`base.css`:

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

По умолчанию при таких опциях:

- подмешивается `tokens.css` пакета и базовый `base.css`;
- включены все компоненты granular-провайдера и их preflight-ы;
- работают rules/variants и safelist провайдера.

Готовые связки этого же «корня», но с дополнительными опциями — в
`apps/showcase` и `apps/playground-5`.

## Наращиваем опции

Все опции ниже — необязательные; добавляйте их по мере необходимости.

### Сужаем список компонентов

```ts
presetGranularNode({
  providers: [granularityProvider],
  components: [
    { provider: '@feugene/granularity', names: ['GrButton'] },
  ],
})
```

### Темы

```ts
presetGranularNode({
  providers: [granularityProvider],
  components: [{ provider: '@feugene/granularity', names: ['GrButton'] }],
  themes: { names: ['light', 'dark'] },
})
```

### Layer

```ts
presetGranularNode({
  providers: [granularityProvider],
  components: [{ provider: '@feugene/granularity', names: ['GrButton'] }],
  themes: { names: ['light', 'dark'] },
  layer: 'granular',
})
```

### Авто-сканирование через `granularContent`

Чтобы extractor увидел классы в собранных чанках компонентов
(`dist/components/<Name>/...`), разверните `granularContent(...)` в
top-level `content`:

```ts
const granularOptions = {
  providers: [granularityProvider],
  components: [{ provider: '@feugene/granularity', names: ['GrButton'] }],
  themes: { names: ['light', 'dark'] },
  layer: 'granular' as const,
}

export default defineConfig({
  presets: [
    presetMini(),
    presetGranularNode(granularOptions),
  ],
  content: granularContent(granularOptions),
})
```

## Полезные опции пресета

Детальный список параметров `presetGranularNode` (включая
`components`, `themes`, `themeFiles`, `tokens`, `baseFile`,
`scan`, `layer`) и `granularContent` описан в
[документации пресета][preset-getting-started].

Типовые сценарии:

- `components: 'all'` — включить все компоненты из granular-registry
  (поведение по умолчанию).
- `themes: { names: ['light'] }` — оставить только одну встроенную тему.
- `themeFiles: [...]` — добавить собственные CSS-темы приложения
  (можно комбинировать со встроенными темами через `themes.names`).
- `tokens` / `baseFile` — переопределить `tokens.css` и `base.css`
  пакета своими файлами из приложения.

## Важно: UnoCSS и `content`

`@unocss/vite` читает `content.filesystem` и `content.pipeline.include`
**только из top-level `defineConfig`**, а не из `preset.content`.
Поэтому `granularContent(...)` нужно раскрывать в `content:` своего
`uno.config.ts`, как показано в базовом примере.

Если в приложении уже есть свой `pipeline.include`, объедините его с
`granularContent(...).pipeline.include`:

```ts
const granularContentConfig = granularContent(granularOptions)

export default defineConfig({
  // ...
  content: {
    filesystem: granularContentConfig.filesystem,
    pipeline: {
      include: [
        /apps\/my-app\/src\/.*\.(vue|ts)($|\?)/,
        ...granularContentConfig.pipeline.include,
      ],
    },
  },
})
```

## Ссылки

- [`@feugene/unocss-preset-granular`][preset-granular]
  ([документация `docs/ru`][preset-docs],
  [быстрый старт][preset-getting-started])
- [`unocss`][unocss] и [`@unocss/preset-wind4`][preset-wind4]

[preset-granular]: https://github.com/efureev/unocss-preset-granular
[preset-docs]: ../../../../unocss-preset-granular/docs/ru/README.md
[preset-getting-started]: ../../../../unocss-preset-granular/docs/ru/getting-started.md
[unocss]: https://github.com/unocss/unocss
[preset-wind4]: https://github.com/unocss/unocss/tree/main/packages-presets/preset-wind4
