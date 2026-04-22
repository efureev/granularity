# Документация `@feugene/granularity`

`@feugene/granularity` — пакет дизайн-системы на `Vue 3` с компонентами и интеграцией через
[`@feugene/unocss-preset-granular`](https://github.com/efureev/unocss-preset-granular).

Эта папка — основная документация пакета. `README.md` в корне пакета остаётся короткой точкой входа, а здесь собраны
подробный сценарий подключения и package-level API.

Репозиторий: <https://github.com/efureev/unocss-preset-granular>

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

## Как подключать

Поддерживается один проверенный способ — тонкая настройка через `UnoCSS` preset
`@feugene/granularity/uno-node`. Полная инструкция — в [`installation.md`](./installation.md),
детали конфигурации — в [`unocss.md`](./unocss.md).

Дополнительно (необязательно):

- [`@feugene/unplugin-granularity`](../../unplugin-granularity/README.md) — авто-импорт компонентов и директив в шаблонах `Vue`.
- `createGranularity` из `@feugene/granularity/vue` — единый bootstrap-вход для директив, `provide`, `globalProperties`.

## Что публикует пакет

- `Vue`-компоненты через root barrel и component subpath exports.
- package-level API для директив и file validation.
- `UnoCSS` preset `@feugene/granularity/uno-node` как единственный поддерживаемый способ интеграции.
- внутреннюю инженерную документацию по развитию пакета.

## Принцип документации

В этих файлах описаны только те возможности, которые реально подтверждаются текущими `exports`, `README.md` и
исходниками `packages/granularity`.