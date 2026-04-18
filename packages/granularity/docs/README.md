# Документация `@feugene/granularity`

`@feugene/granularity` — пакет дизайн-системы на `Vue 3` с компонентами, CSS entrypoint-ами, granular subpath export-ами
и двумя стратегиями интеграции с `UnoCSS`.

Эта папка — основная документация пакета. `README.md` в корне пакета остаётся короткой точкой входа, а здесь собраны
подробные сценарии подключения и package-level API.

## С чего начать

- Если нужен быстрый старт: откройте [`installation.md`](./installation.md).
- Если важно понять устройство слоёв стилей: откройте [`styling.md`](./styling.md).
- Если приложение уже использует `UnoCSS`: откройте [`unocss.md`](./unocss.md).
- Если нужен единый bootstrap-вход в Vue-приложение: откройте [`vue-plugin.md`](./vue-plugin.md).
- Если хочется авто-импорта компонентов и директив: откройте [`unplugin.md`](./unplugin.md).
- Если важно понять, как пакет ведёт себя в i18n-сценариях: откройте [`localization.md`](./localization.md).
- Если нужны package-level утилиты кроме компонентов: откройте [`directives.md`](./directives.md) и [
  `file-validation.md`](./file-validation.md).
- Если нужен обзор опубликованных компонентов: откройте [`components.md`](./components.md).

## Карта документации

- [`installation.md`](./installation.md) — установка, public entrypoint-ы, quick start и выбор стратегии подключения.
- [`styling.md`](./styling.md) — `foundation.css`, `styles.css`, `tokens`, `base`, темы и порядок импортов.
- [`unocss.md`](./unocss.md) — `@feugene/granularity/uno-node`, `@feugene/granularity/uno`, preflight-ы и практические
  сценарии.
- [`vue-plugin.md`](./vue-plugin.md) — runtime-адаптер `@feugene/granularity/vue`: `createGranularity`,
  `installGranularity`, `defineInstallable`.
- [`unplugin.md`](./unplugin.md) — авто-импорт компонентов и директив через
  [`@feugene/unplugin-granularity`](../../unplugin-granularity/README.md).
- [`localization.md`](./localization.md) — как `granularity` работает с локализацией приложения и fallback-текстами.
- [`directives.md`](./directives.md) — все опубликованные директивы и их назначение.
- [`file-validation.md`](./file-validation.md) — `fileValidation` API и повторное использование логики валидации файлов.
- [`components.md`](./components.md) — каталог опубликованных компонентов и импортов.
- [`ADDING_COMPONENTS.md`](./ADDING_COMPONENTS.md) — внутренний процесс добавления нового компонента в пакет.

## Как выбрать подход

| Сценарий                                                  | Что подключать                                                       |
|-----------------------------------------------------------|----------------------------------------------------------------------|
| Нужно быстро начать и использовать несколько компонентов  | root import из `@feugene/granularity` + `styles.css`                |
| Нужен минимальный JS bundle                               | subpath import из `@feugene/granularity/components/<Name>`          |
| Нужен минимальный CSS для 1–2 компонентов                 | `components/<Name>/styles.css` (при необходимости отдельно `foundation.css`) |
| Приложение уже собирает CSS через `UnoCSS` в node-конфиге | `@feugene/granularity/uno-node`                                     |
| Нужен pure/browser-safe preset без чтения файлов с диска  | `@feugene/granularity/uno`                                          |
| Нужен единый bootstrap-вход для директив, `provide`, globals | `createGranularity` из `@feugene/granularity/vue`                |
| Нужен авто-импорт компонентов и директив в шаблонах       | [`@feugene/unplugin-granularity`](../../unplugin-granularity/README.md) (резолвер `unplugin-vue-components`) |

## Базовый quick start

```ts

import '@feugene/granularity/styles.css'
```

`styles.css` — это готовый полный пакетный bundle: он уже включает `foundation.css` (`tokens`, темы `light`/`dark`,
`base`) и стили всех компонентов.

## Что публикует пакет

- `Vue`-компоненты через root barrel и component subpath exports.
- готовые CSS entrypoint-ы: `foundation.css`, полный `styles.css`, low-level foundation files и component-level стили.
- package-level API для директив и file validation.
- `UnoCSS` preset-ы для двух режимов интеграции: node-aware и pure/browser-safe.
- внутреннюю инженерную документацию по развитию пакета.

## Принцип документации

В этих файлах описаны только те возможности, которые реально подтверждаются текущими `exports`, `README.md` и
исходниками `packages/granularity`.