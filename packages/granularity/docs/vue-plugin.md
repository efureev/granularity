# Vue-плагин: `createGranularity` / `installGranularity`

`@feugene/granularity/vue` — лёгкий runtime-адаптер пакета для Vue 3. Это **не монолитный «install всё»**: модуль
`./vue` сам по себе не импортирует ни одного компонента и ни одной директивы — он принимает их аргументом и аккуратно
регистрирует в `App`. За счёт этого granular subpath exports и tree-shaking остаются полностью рабочими.

## Когда использовать

- когда нужно зарегистрировать набор директив, используемых в `render()`/JSX/TSX (там резолвер
  `unplugin-vue-components` бесполезен — он сканирует только шаблоны);
- когда нужен общий `provide` (i18n-адаптер, theme, toaster-конфиг, DI-ключи);
- когда нужно выставить `app.config.globalProperties.$x` для Options API / legacy-кода;
- в SSR / Nuxt-плагинах, unit-тестах на `@vue/test-utils` и прочих окружениях без сборщика;
- когда удобнее одно место конфигурации в bootstrap-файле приложения, чем россыпь `app.use(...)`.

Для **компонентов** в prod-приложении предпочтительнее либо прямые subpath import-ы, либо
[`@feugene/unplugin-granularity`](./unplugin.md): оба дают идеальный tree-shaking без глобальной регистрации в рантайме.

## Подключение

```bash
yarn add @feugene/granularity vue
```

`exports` пакета:

- `@feugene/granularity/vue` — runtime-адаптер (`createGranularity`, `installGranularity`, `defineInstallable`);
- `@feugene/granularity/components/<Name>` — собственно компоненты;
- `@feugene/granularity/directives` — директивы.

Модуль `./vue` не тянет ни компоненты, ни директивы — всё, что попадёт в бандл, будет импортировано
пользователем явно.

## Базовый пример

```ts
import { createApp } from 'vue'
import { createGranularity } from '@feugene/granularity/vue'

import { GrButton } from '@feugene/granularity/components/GrButton'
import { GrInput } from '@feugene/granularity/components/GrInput'
import { vHotkey } from '@feugene/granularity/directives'

import App from './App.vue'

createApp(App)
  .use(createGranularity({
    components: [GrButton, GrInput],
    directives: [{ name: 'hotkey', directive: vHotkey }],
  }))
  .mount('#app')
```

В бандл попадут только `GrButton`, `GrInput` и `vHotkey` — ничего сверх этого.

## API

### `createGranularity(options): Plugin`

Возвращает стандартный Vue-plugin, который можно передать в `app.use(...)`.

### `installGranularity(app, options): void`

Функциональная форма того же самого: удобна, если нужно позвать установщик из уже готового `App`
(например, внутри кастомной фабрики `createApp` или в unit-тестах).

### `CreateGranularityOptions`

| Поле | Тип | Назначение |
|------|------|------------|
| `components` | `GranularityInstallableComponent[]` | Компоненты для глобальной регистрации. Не передавайте сюда «всё», иначе потеряете granular. |
| `directives` | `GranularityInstallableDirective[]` | Директивы. Пары `{ name, directive }` или объекты с собственным `install`. |
| `provides` | `Array<{ key: string \| symbol; value: unknown }>` | Произвольные `app.provide(...)`. Ключи — ваши, пакет не навязывает. |
| `globalProperties` | `Record<string, unknown>` | Значения в `app.config.globalProperties`. По умолчанию пусто. |

### Допустимые формы `components`

1. **Чистый SFC-компонент.** Vue 3 сам компилирует имя из имени файла в поле `__name`, по нему и пройдёт регистрация:

   ```ts
   components: [GrButton, GrInput]
   ```

2. **Объект с собственным `install`** (стиль Element Plus / Naive UI):

   ```ts
   components: [
     { install: (app) => app.component('GrFancy', GrFancy) },
   ]
   ```

3. **Явное `{ name, component }`** — если имя нужно задать вручную (например, SFC без `<script setup>` и без
   `defineOptions({ name })`):

   ```ts
   components: [{ name: 'GrButton', component: GrButton }]
   ```

### Допустимые формы `directives`

1. `{ name: 'hotkey', directive: vHotkey }` — самая частая форма.
2. Объект с собственным `install`, который сам дергает `app.directive(...)`.

### `defineInstallable(component, name)`

Вспомогательная обёртка: превращает произвольный компонент в `{ install }`-форму с явным именем регистрации.

```ts
import { defineInstallable } from '@feugene/granularity/vue'
import { GrButton } from '@feugene/granularity/components/GrButton'

const installable = defineInstallable(GrButton, 'GrBtn')
```

## Нюансы и подводные камни

- **Фабрика не импортирует компоненты сама.** Если в `components` передать «всё», tree-shaking не спасёт — хоть
  адаптер и лёгкий, компоненты всё равно окажутся в бандле из-за пользовательского импорта.
- **Глобальная регистрация ≠ лучшее решение для prod-приложения.** Для компонентов в `<template>` надёжнее и чище
  резолвер [`@feugene/unplugin-granularity`](./unplugin.md): он вставляет статические импорты прямо в SFC, без
  рантайм-регистрации.
- **Типизация глобально зарегистрированных компонентов.** Volar/`vue-tsc` не узнают их в шаблонах сами. Если вы
  регистрируете компоненты через `createGranularity`, стоит добавить собственное `declare module 'vue' { interface
  GlobalComponents {...} }` — или использовать локальные импорты / резолвер.
- **CSS** подтягивается каждым компонентом отдельно через его `import './styles.css'` (либо через общий
  `@feugene/granularity/styles.css`). Фабрика в CSS не участвует — её задача только рантайм-регистрация.
- **SSR / тесты.** `installGranularity` безопасно вызывать несколько раз на разных `App`; состояния между инстансами
  она не разделяет.

## Как это уживается с `@feugene/unplugin-granularity`

Эти инструменты **ортогональны**:

| | `@feugene/unplugin-granularity` (build-time) | `@feugene/granularity/vue` (runtime) |
|---|---|---|
| Когда работает | На этапе сборки/дев-сервера | В рантайме, при старте приложения |
| Что делает | Дописывает статические `import` в SFC | Выполняет `app.component`, `app.directive`, `app.provide`, `globalProperties` |
| Охватывает | Только то, что реально упомянуто в `<template>` | Что угодно: директивы вне шаблонов, `provide`-ключи, глобалки |
| Зависимость от сборщика | Да | Нет |

В большом проекте типичен гибрид: компоненты — через резолвер, директивы/`provide`/`globalProperties` — через
`createGranularity`.

