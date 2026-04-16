# `@feugene/granularity`

`@feugene/granularity` — это `Vue 3` design system package, который помогает собирать интерфейсы быстрее, чище и
предсказуемее: с готовыми компонентами, прозрачной системой стилей, granular import-ами и аккуратной интеграцией с
`UnoCSS`.

Он создан для случаев, когда дизайн-система должна быть не просто набором UI-деталей, а рабочим инженерным инструментом:
удобным для продуктовой команды, масштабируемым для большого приложения и достаточно гибким для разных стратегий
подключения.

## Зачем он нужен

- чтобы запускать новые экраны и фичи на едином визуальном фундаменте;
- чтобы подключать пакет постепенно, не переписывая приложение целиком;
- чтобы контролировать размер подключаемого `JS` и `CSS`, когда это действительно важно;
- чтобы использовать один и тот же пакет и как готовую библиотеку компонентов, и как источник низкоуровневых
  package-level API.

## Чем `granularity` хорош

- **Быстрый старт без лишней магии.** Можно просто импортировать компоненты и готовые style entrypoint-ы.
- **Granular-подключение.** Компоненты доступны как из root API, так и через `subpath exports`, если нужен более точный
  контроль над bundle.
- **Нормальная работа со стилями.** Токены, база, темы и component-level CSS разделены на понятные слои.
- **Готовность к реальному масштабу.** Пакет подходит и для «подключили несколько компонентов», и для сценариев, где
  важны dependency-aware imports, safelist и точная настройка CSS-пайплайна.
- **Интеграция с `UnoCSS` без навязывания.** Если `UnoCSS` уже есть в приложении — пакет встраивается в существующий
  pipeline. Если его нет — базовый сценарий всё равно остаётся прямым и понятным.
- **Не только компоненты.** Вместе с UI доступны директивы, file validation API и служебные entrypoint-ы для
  инфраструктурных сценариев.

## Технические особенности

- root export: `@feugene/granularity`;
- component subpath exports: `@feugene/granularity/components/<ComponentName>`;
- готовые CSS entrypoint-ы:
  - `@feugene/granularity/foundation.css` — `tokens` + встроенные темы `light`/`dark` + `base`;
  - `@feugene/granularity/styles.css` — `foundation` плюс стили всех компонентов;
  - `@feugene/granularity/components/<ComponentName>/styles.css` — `foundation` плюс стили конкретного компонента и его зависимостей;
- low-level foundation exports: `@feugene/granularity/styles/tokens.css`, `@feugene/granularity/styles/base.css`, `@feugene/granularity/styles/themes/light.css`, `@feugene/granularity/styles/themes/dark.css`;
- package-level API: `@feugene/granularity/directives`, `@feugene/granularity/fileValidation`;
- два сценария интеграции с `UnoCSS`:
    - `@feugene/granularity/uno` — browser-safe preset;
    - `@feugene/granularity/uno-node` — node-oriented preset с CSS/preflight helper-ами.

## Быстрый старт

```bash
yarn add @feugene/granularity vue
```

Если приложение использует `UnoCSS`:

```bash
yarn add -D unocss
```

```ts

import '@feugene/granularity/styles.css'
```

Этого достаточно, чтобы быстро получить рабочую базу: `styles.css` уже включает `foundation.css` (`tokens`, `base`,
встроенные темы `light`/`dark`) и стили всех компонентов.

Если нужен более точный CSS-сценарий, используйте `@feugene/granularity/foundation.css` вместе с
`@feugene/granularity/components/<ComponentName>/styles.css` или собирайте стили через `UnoCSS` preset.

## Документация

- [`docs/README.md`](./docs/README.md) — обзор и карта документации
- [`docs/installation.md`](./docs/installation.md) — установка, public entrypoint-ы и стратегии подключения
- [`docs/styling.md`](./docs/styling.md) — слои стилей, темы и порядок импортов
- [`docs/unocss.md`](./docs/unocss.md) — интеграция с `UnoCSS`
- [`docs/localization.md`](./docs/localization.md) — как пакет встраивается в локализацию приложения
- [`docs/directives.md`](./docs/directives.md) — package-level директивы
- [`docs/file-validation.md`](./docs/file-validation.md) — file validation API
- [`docs/components.md`](./docs/components.md) — каталог опубликованных компонентов
- [`docs/ADDING_COMPONENTS.md`](./docs/ADDING_COMPONENTS.md) — внутренняя инструкция по добавлению нового компонента
