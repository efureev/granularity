# Интеграция с `UnoCSS`

`@feugene/granularity` публикует два preset-а для `UnoCSS`, и между ними важно выбрать правильный:

- `@feugene/granularity/uno-node` — node-aware preset с автоподключением CSS preflight-ов из файлов пакета.
- `@feugene/granularity/uno` — pure/browser-safe preset без чтения CSS-файлов с диска.

## Как выбрать preset

| Сценарий                                                                                                 | Что использовать                |
|----------------------------------------------------------------------------------------------------------|---------------------------------|
| Конфиг выполняется в Node.js, и нужно автоматически подтягивать `tokens`, `base`, темы и CSS компонентов | `@feugene/granularity/uno-node` |
| Нужен pure/browser-safe preset без node-only API и без чтения файлов                                     | `@feugene/granularity/uno`      |

## Предпочтительный путь

Если приложение уже использует `UnoCSS`, то **наиболее предпочтительный способ подключения `granularity` — тонкая
настройка через наш preset**.

Практически это означает такой порядок выбора:

1. сначала рассматривать `@feugene/granularity/uno-node`;
2. переходить к `@feugene/granularity/uno`, только если действительно нужен pure/browser-safe preset.

Причина в том, что preset-подход позволяет собирать стили на стороне приложения и точнее контролировать:

- набор компонентов в safelist;
- foundation layers (`tokens`, `base`);
- встроенные и внешние темы;
- итоговый объём `CSS` и связанный с ним сценарий использования granular `JS` import-ов.

## `@feugene/granularity/uno-node`

Это рекомендуемый путь, если приложение уже использует `UnoCSS` и хочет собирать CSS на своей стороне.

Практически это ещё и самый "компактный" сценарий интеграции: приложение собирает только реально нужные стили и
работает с granular-набором компонентов, поэтому итоговый `dist` обычно получается минимальным по размеру и для `CSS`,
и для `JS`.

Что делает `presetGranularityNode`:

- добавляет safelist и rules пакета;
- автоматически добавляет preflight-ы для `tokens`, `base`, выбранных тем и выбранных компонентов;
- работает в node-конфиге сборки, например в `uno.config.ts`.

Когда выбирать:

- нужен основной production-сценарий с тонкой настройкой;
- хочется управлять тем, какие темы и какие компоненты реально участвуют в сборке;
- важен максимально прозрачный контроль над итоговым `dist`.

Плюсы:

- меньше ручных CSS-импортов;
- можно тонко выбирать `components`, `themes`, `themeFiles`, `tokens` и `baseFile`;
- это самый прямой preset-путь к минимальному `CSS` и granular `JS`.

Минусы:

- нужен node-aware конфиг `UnoCSS`;
- сценарий сложнее простого импорта готовых CSS-файлов.

Пример: [`apps/playground-5`](../../../apps/playground-5/README.md)

### Базовый пример

```ts
import {defineConfig, presetMini} from 'unocss'

import {presetGranularityNode} from '@feugene/granularity/uno-node'

export default defineConfig({
    presets: [
        presetMini(),
        presetGranularityNode({
            components: ['DsButton'],
        }),
    ],
})
```

По умолчанию preset добавляет:

- встроенный `tokens.css`;
- встроенный `base.css`;
- встроенную тему `light`;
- CSS выбранных компонентов.

### Переопределение `tokens`, `base` и theme layers

```ts
import {fileURLToPath, URL} from 'node:url'
import {defineConfig, presetMini} from 'unocss'

import {presetGranularityNode} from '@feugene/granularity/uno-node'

export default defineConfig({
    presets: [
        presetMini(),
        presetGranularityNode({
            components: ['DsButton'],
            tokens: fileURLToPath(new URL('./src/styles/tokens.css', import.meta.url)),
            baseFile: fileURLToPath(new URL('./src/styles/base.css', import.meta.url)),
            themeFiles: [fileURLToPath(new URL('./src/styles/light-app.css', import.meta.url))],
        }),
    ],
})
```

Поведение по темам:

- `themeFiles` можно использовать вместе со встроенными темами;
- если передать только `themeFiles`, preset использует только внешние темы приложения без встроенной `light` theme;
- `components: 'all'` означает все компоненты, опубликованные в granular registry.

## `@feugene/granularity/uno`

`presetGranularity` из `@feugene/granularity/uno` не читает CSS-файлы с диска. Он добавляет только safelist, rules,
variants и анимационные preflight-ы пакета.

Этот вариант нужен, если preset должен оставаться pure/browser-safe и без node-only API.

Когда выбирать:

- среда или архитектура не позволяют использовать node-aware preset;
- нужен именно pure/browser-safe preset;
- вы готовы вручную передать CSS preflight-ы для foundation/theme-слоёв.

Плюсы:

- сохраняет доступ к preset API без чтения файлов с диска;
- подходит для специальных интеграционных сценариев, где важна pure/browser-safe природа preset-а.

Минусы:

- `tokens.css`, `base.css`, `themes/*.css` и component CSS не подмешиваются автоматически;
- ручной работы больше, чем у `uno-node`, поэтому это не основной рекомендованный путь.

Пример: [`apps/playground-6`](../../../apps/playground-6/README.md)

### Базовый пример

```ts
import {defineConfig, presetMini} from 'unocss'

import {
    createGranularityCssPreflights,
    presetGranularity,
} from '@feugene/granularity/uno'

export default defineConfig({
    presets: [
        presetMini(),
        presetGranularity({
            components: ['DsButton'],
            preflights: createGranularityCssPreflights([
                ':root { --primary: hotpink; --primary-fg: white; }',
            ]),
        }),
    ],
})
```

Важно:

- `presetGranularity` сам по себе не подмешивает `tokens.css`, `base.css`, `themes/*.css` и component CSS;
- если нужен готовый пакетный CSS из файлов, обычно проще использовать `uno-node` или обычные CSS imports.

## Что именно публикуется из preset API

Помимо самих preset-ов, пакет экспортирует вспомогательные сущности для настройки:

- `presetGranularity`
- `presetGranularityNode`
- `createGranularityCssPreflight`
- `createGranularityCssPreflights`
- `granularityComponents`
- `granularitySafelist`
- `granularityThemeNames`
- `granularityDefaultThemes`

Это полезно, если приложение хочет тонко контролировать preflight-ы, safelist или набор компонентов.