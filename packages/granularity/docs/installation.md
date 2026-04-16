# Установка и подключение

## Требования

- `vue` — `peer dependency` пакета.
- `unocss` нужен только если вы выбираете интеграцию через preset, а не через готовые CSS-файлы.

## Установка

```bash
yarn add @feugene/granularity vue
```

Если приложение использует `UnoCSS`:

```bash
yarn add -D unocss
```

## Какой способ подключения выбирать

У пакета нет одного «обязательного» сценария для всех случаев: доступны и быстрые CSS-импорты, и granular-подключение,
и тонкая интеграция через `UnoCSS` preset.

Но если приложение уже работает с `UnoCSS` или вы готовы собирать стили на стороне приложения, **наиболее
предпочтительный путь — тонкая настройка через наш preset**. На практике это значит:

- в первую очередь смотреть на `@feugene/granularity/uno-node`;
- использовать `@feugene/granularity/uno`, только если нужен pure/browser-safe preset без node-only API.

Причина простая: preset-подход даёт самый точный контроль над тем, какие foundation-слои, темы и component-level стили
реально попадут в сборку.

### Краткая карта способов

| Способ | Когда подходит лучше всего | Плюсы | Компромиссы | Пример |
|--------|----------------------------|-------|-------------|--------|
| 1. Root import + общий `styles.css` | Нужен самый простой старт | Самый понятный onboarding, минимум ручной настройки | Меньше контроля над итоговым `JS` и `CSS`, чем у granular/preset-подходов | [`playground-1`](../../../apps/playground-1/README.md) |
| 2. Один компонент через subpath + общий `styles.css` | Нужен минимальный `JS`, но без усложнения CSS | Точечный `JS` import, простой CSS-сценарий | `styles.css` всё ещё тянет общий пакетный CSS | [`playground-2`](../../../apps/playground-2/README.md) |
| 3. Один компонент через subpath + component CSS bundle | Нужен минимальный bundle без `UnoCSS` | Точный контроль и над `JS`, и над `CSS` | При нескольких component bundle-ах foundation-слой может дублироваться, сложнее масштабировать | [`playground-3`](../../../apps/playground-3/README.md) |
| 4. Несколько компонентов через subpath + общий `styles.css` | Нужен granular `JS` для нескольких компонентов | Баланс между контролем `JS` и простотой CSS-подключения | CSS всё ещё подключается общим файлом | [`playground-4`](../../../apps/playground-4/README.md) |
| 5. `UnoCSS` + `@feugene/granularity/uno-node` | Нужна предпочтительная production-интеграция с тонкой настройкой | Лучший контроль над итоговой сборкой, удобно выбирать компоненты/темы/слои | Требует `UnoCSS` и node-конфиг сборки | [`playground-5`](../../../apps/playground-5/README.md) |
| 6. `UnoCSS` + `@feugene/granularity/uno` | Нужен pure/browser-safe preset | Даёт preset API без чтения файлов с диска | Foundation/theme CSS надо передавать вручную | [`playground-6`](../../../apps/playground-6/README.md) |

## Public entrypoint-ы

### Root API

- `@feugene/granularity`

Подходит, когда важнее DX и простой импорт нескольких компонентов из одной точки.

### Компонентные subpath export-ы

Формат:

- `@feugene/granularity/components/<ComponentName>`

Пример:

```ts

```

Это рекомендуемый вариант, если вы хотите минимальный JS bundle и импортируете компоненты точечно.

### CSS entrypoint-ы

- foundation bundle: `@feugene/granularity/foundation.css`
- полный пакетный CSS: `@feugene/granularity/styles.css`
- low-level foundation layers:
  - `@feugene/granularity/styles/tokens.css`
  - `@feugene/granularity/styles/base.css`
  - `@feugene/granularity/styles/themes/light.css`
  - `@feugene/granularity/styles/themes/dark.css`
- component-level CSS:
  - `@feugene/granularity/components/<ComponentName>/styles.css`

### Package-level API

- директивы: `@feugene/granularity/directives`
- file validation: `@feugene/granularity/fileValidation`
- `UnoCSS` preset-ы:
  - `@feugene/granularity/uno`
  - `@feugene/granularity/uno-node`

## Рекомендуемые стратегии подключения

### 1. Быстрый старт: root import + общий `styles.css`

```ts

import '@feugene/granularity/styles.css'
```

Когда выбирать:

- нужен простой старт;
- в приложении используется несколько компонентов;
- не требуется отдельно управлять CSS каждого компонента.

Особенности:

- компоненты берутся из root API;
- `styles.css` уже включает `foundation.css` (`tokens`, `base`, встроенные темы `light`/`dark`) и стили всех компонентов;
- сценарий почти не требует дополнительной инфраструктуры.

Плюсы:

- самый понятный и быстрый вход в пакет;
- удобно для прототипов, внутренних инструментов и первого подключения;
- легко объяснить и поддерживать в команде.

Минусы:

- это не самый точный путь с точки зрения granular-контроля над bundle;
- при переходе к более тонкой оптимизации обычно хочется уйти в subpath import-ы или preset.

Пример: [`apps/playground-1`](../../../apps/playground-1/README.md)

### 2. Один компонент: subpath import + общий `styles.css`

```ts

import '@feugene/granularity/styles.css'
```

Когда выбирать:

- в приложении нужен один компонент или небольшой набор компонентов;
- важен granular import без лишнего JS графа;
- при этом CSS хочется оставить максимально простым.

Особенности:

- `JS` подключается точечно через `@feugene/granularity/components/<ComponentName>`;
- CSS остаётся общим пакетным, без ручного перечисления component-level файлов.

Плюсы:

- хороший первый шаг к более компактному `JS` bundle;
- простой DX: меняется только способ импорта компонента, а CSS-сценарий остаётся знакомым;
- подходит, когда компонент один, а усложнять стилизацию не хочется.

Минусы:

- `styles.css` всё ещё подключает общий пакетный CSS;
- это уже лучше root import по `JS`, но ещё не самый компактный путь по `CSS`.

Пример: [`apps/playground-2`](../../../apps/playground-2/README.md)

### 3. Один компонент: subpath import + component-level CSS bundle

```ts

import '@feugene/granularity/components/DsButton/styles.css'
```

Когда выбирать:

- нужно минимизировать и JS, и CSS;
- приложение само контролирует, какие component-level стили попадут в сборку.

Особенности:

- bundle компонента обычно уже включает foundation-слой (`tokens`, `base`, встроенные темы `light`/`dark`);
- приложение подключает только CSS нужного компонента;
- этот путь не требует `UnoCSS`, но уже даёт точный контроль над составом CSS.

Плюсы:

- один из самых компактных сценариев среди вариантов с готовыми CSS-файлами пакета для одного компонента;
- прозрачно видно, какой CSS попадает в приложение;
- хорошо подходит для очень точечных интеграций.

Минусы:

- при росте числа компонентов такой сценарий сложнее сопровождать вручную;
- если импортировать несколько component bundle-ов, foundation-часть может дублироваться.

Пример: [`apps/playground-3`](../../../apps/playground-3/README.md)

### 4. Несколько компонентов: granular `JS` + общий CSS пакета

```ts

import '@feugene/granularity/styles.css'
```

Когда выбирать:

- хочется сохранить точечный JS import;
- при этом удобнее подключить utility CSS одним импортом.

Особенности:

- несколько компонентов импортируются через subpath export-ы;
- `styles.css` подключается один раз и уже включает foundation-слой пакета.

Плюсы:

- хороший баланс между контролем над `JS` и простотой CSS-подключения;
- удобно для экранов и приложений, где компонентов уже несколько;
- проще поддерживать, чем полностью ручной список `components/<Name>/styles.css`.

Минусы:

- по `CSS` это всё ещё менее точный вариант, чем component-level import или preset;
- если цель — максимально тонкий `dist`, со временем обычно логично перейти к preset-подходу.

Пример: [`apps/playground-4`](../../../apps/playground-4/README.md)

### 5. Предпочтительный production-путь: `UnoCSS` + `@feugene/granularity/uno-node`

```ts
import { defineConfig, presetMini } from 'unocss'

import { presetGranularityNode } from '@feugene/granularity/uno-node'

export default defineConfig({
  presets: [
    presetMini(),
    presetGranularityNode({
      components: ['DsButton'],
    }),
  ],
})
```

Когда выбирать:

- приложение уже использует `UnoCSS`;
- нужен наиболее предпочтительный путь с тонкой настройкой;
- важно точно управлять тем, какие компоненты, темы и CSS-слои попадут в сборку.

Особенности:

- preset сам добавляет safelist, rules и нужные CSS preflight-ы из файлов пакета;
- можно выбирать `components`, `themes`, `themeFiles`, `tokens`, `baseFile` и `layer`;
- это основной путь для сценария, где приложение собирает CSS на своей стороне.

Плюсы:

- самый гибкий и управляемый способ интеграции;
- удобно держать итоговый `dist` минимальным и по `CSS`, и по `JS`;
- хорошо масштабируется для production-приложения и dependency-aware подключения.

Минусы:

- требует `UnoCSS` и node-среду для конфига;
- входной порог выше, чем у готовых CSS import-ов.

Пример: [`apps/playground-5`](../../../apps/playground-5/README.md)

Подробности: [`./unocss.md`](./unocss.md)

### 6. Pure/browser-safe preset: `UnoCSS` + `@feugene/granularity/uno`

```ts
import {
  createGranularityCssPreflights,
  presetGranularity,
} from '@feugene/granularity/uno'

presetGranularity({
  components: ['DsButton'],
  preflights: createGranularityCssPreflights([
    ':root { --primary: hotpink; --primary-fg: white; }',
  ]),
})
```

Когда выбирать:

- нужен именно pure/browser-safe preset;
- нельзя или нежелательно читать CSS-файлы пакета с диска в node-конфиге;
- нужен preset API, но без `uno-node`.

Особенности:

- preset добавляет safelist, rules, variants и animation preflight-ы;
- `tokens`, `base`, темы и component CSS не подмешиваются автоматически — их нужно передавать вручную.

Плюсы:

- работает в средах, где важна browser-safe/pure природа preset-а;
- сохраняет granular-подход и доступ к общему preset API.

Минусы:

- больше ручной работы, чем у `uno-node`;
- это специальный сценарий, а не основной рекомендованный путь.

Пример: [`apps/playground-6`](../../../apps/playground-6/README.md)

Подробности: [`./unocss.md`](./unocss.md)

## Root import vs component subpath import

Оба способа поддерживаются, но решают разные задачи:

- `@feugene/granularity` — удобно, когда нужен простой root API;
- `@feugene/granularity/components/<Name>` — предпочтительный вариант для минимального bundle при точечном использовании компонентов.

Если нужен только `DsButton`, предпочтительнее:

```ts

```

а не:

```ts

```

## Что выбрать в первую очередь

- для быстрого старта — root API + общий CSS;
- для точечного подключения без `UnoCSS` — component subpath import и, при необходимости, component-level CSS;
- для новых production-интеграций — в первую очередь тонкая настройка через `presetGranularityNode()`;
- `presetGranularity()` имеет смысл выбирать, только если нужен pure/browser-safe preset без node-only API.