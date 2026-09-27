# Приложение с нуля: SPA и SSR

Полный каркас приложения на `@feugene/granularity` — от пустой директории до
собранного бандла. Два типа приложения (SPA и серверный рендер), затем главы про
локализацию и остальные пакеты семейства.

Соседние документы отвечают на другие вопросы, и здесь они не повторяются:

- [`installation.md`](./installation.md) — что и почему ставить в зависимости,
  требования к окружению, иконки;
- [`granum.md`](./granum.md) — все опции `granum.config.ts` и правила про
  `content`;
- [`ssr.md`](./ssr.md) — SSR-контракт компонентов: кто что делает на сервере;
- [`localization.md`](./localization.md) — философия локализации и API пакета.

Каркасы ниже сняты с рабочих приложений репозитория: SPA — с
`apps/playground-5` и `apps/playground-config`, SSR — с `apps/playground-ssr`.

## Общее для обоих типов

```bash
yarn add vue @feugene/granularity @floating-ui/dom @unocss/reset
yarn add -D vite @vitejs/plugin-vue @feugene/granum @feugene/granum-engine-wind typescript vue-tsc
```

`@floating-ui/dom` — обязательная runtime-зависимость: на ней держится
позиционирование всех выпадающих панелей. Обоснование состава — в
[`installation.md`](./installation.md#установка).

Движок утилит — вторая build-зависимость, и это не дублирование: granum своей
реализации движка не содержит, а словарь классов выбирает тот, кто отвечает за
результат сборки, то есть приложение. `@feugene/granum-engine-wind` —
реализация по умолчанию (`preset-wind3` плюс доп-правило, на которых нарисованы
компоненты пакета); сам `unocss` приложению при этом не нужен вовсе.

В `package.json` приложения обязателен `"type": "module"`, Node — не ниже 22.

### Один конфиг, из которого растёт всё остальное

CSS дизайн-системы не импортируется файлами. Его собирает плагин granum по
`granum.manifest.json` пакета — файлу, который пакет публикует рядом с `dist`.
Отсюда единственная точка правды — `granum.config.ts`:

```ts
// granum.config.ts
import { defineGranumConfig } from '@feugene/granum/vite'
import { windEngine } from '@feugene/granum-engine-wind'

export default defineGranumConfig({
  engine: windEngine(),
  providers: ['@feugene/granularity'],
  components: [
    { provider: '@feugene/granularity', names: ['GrButton', 'GrInput'] },
  ],
  themes: { names: ['light', 'dark'] },
  appSources: { dirs: ['src'] },
})
```

`engine` — единственное обязательное поле: реализации движка в granum нет, и
инстанс передаёт приложение. `windEngine()` даёт тот же словарь, против
которого написаны классы компонентов (`unocss/preset-wind3+granum@66`); движок
другого словаря granum назовёт `provider-dialect-mismatch` и перечислит классы,
которые пришлось выбросить, — см.
[«Словарь утилит» в `granum.md`](./granum.md#словарь-утилит-диалект-и-отпечаток).

`components` можно не указывать вовсе — тогда в CSS попадут все компоненты
провайдера. Перечисление сужает бандл до нужного набора; зависимости
перечисленных компонентов granum добавит сам.

### CSS-вход приложения

Весь CSS granum приезжает одним модулем, а разделение живёт внутри него —
пятью слоями каскада:

```ts
import '@unocss/reset/tailwind-compat.css' // сброс браузерных стилей
import 'virtual:granum.css' // токены, база, темы, CSS компонентов, утилиты
```

Порядок слоёв объявлен первой строкой этого файла, поэтому утилита в разметке
приложения перебивает базовый стиль компонента, а нелейерный CSS приложения
перебивает всё. Фундамент (`:root { --gr-* }`, `base.css`, темы
`[data-theme=dark]`, покомпонентные переменные) и утилитарные классы — и ваши,
и те, которыми нарисованы шаблоны компонентов пакета, — лежат в одном файле, и
забыть половину нечего.

Слои доступны и по отдельности (`virtual:granum/layers/utilities.css`) — но
тогда порядок слоёв приложение объявляет само: место слоя в каскаде задаётся
его первым появлением.

> **Внутри этого монорепо.** Приложения резолвят пакет через workspace-симлинк в
> `packages/granularity/dist`, а плагин granum читает оттуда же манифест. Поэтому после любой правки библиотеки — `yarn build:granularity`,
> иначе приложение соберётся со старыми токенами и без стилей нового компонента.
> Внешнему потребителю этот шаг не нужен: `yarn add @feugene/granularity`
> ставит уже собранный пакет.

## Каркас SPA

```
my-app/
├── index.html
├── package.json
├── tsconfig.json
├── granum.config.ts
├── vite.config.ts
├── vite-env.d.ts
└── src/
    ├── main.ts
    ├── App.vue
    ├── reset.ts
    └── granularity.ts
```

### `package.json`

```json
{
  "name": "my-app",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "typecheck": "vue-tsc --noEmit -p tsconfig.json"
  },
  "dependencies": {
    "@feugene/granularity": "^0.53.0",
    "@floating-ui/dom": "^1.8.0",
    "@unocss/reset": "^66.7.5",
    "vue": "^3.5.40"
  },
  "devDependencies": {
    "@feugene/granum": "^0.3.0",
    "@feugene/granum-engine-wind": "^0.3.0",
    "@vitejs/plugin-vue": "^6.0.8",
    "typescript": "^6.0.2",
    "vite": "^8.2.2",
    "vue-tsc": "^3.3.7"
  }
}
```

### `index.html`

```html
<!doctype html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>my-app</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

### `vite.config.ts`

```ts
import { granum } from '@feugene/granum/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

import granumConfig from './granum.config'

export default defineConfig({
  plugins: [
    vue(),
    granum(granumConfig),
  ],
})
```

### `granum.config.ts`

Дословно как в разделе [«Один конфиг…»](#один-конфиг-из-которого-растёт-всё-остальное).

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "moduleDetection": "force",
    "useDefineForClassFields": true,
    "strict": true,
    "jsx": "preserve",
    "jsxImportSource": "vue",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "lib": ["ESNext", "DOM"],
    "skipLibCheck": true,
    "noEmit": true,
    "types": ["vite/client", "node"]
  },
  "include": [
    "vite.config.ts",
    "granum.config.ts",
    "vite-env.d.ts",
    "src/**/*.ts",
    "src/**/*.d.ts",
    "src/**/*.vue"
  ],
  "exclude": ["node_modules", "dist"]
}
```

```ts
// vite-env.d.ts
/// <reference types="vite/client" />

/** Виртуальный модуль плагина granum. */
declare module 'virtual:granum.css'
```

### Точка входа

Каждый CSS-вход вынесен в отдельный модуль — так сборщик кладёт их в разные
чанки, и порядок загрузки остаётся тем, который задан в `main.ts`:

```ts
// src/reset.ts
import '@unocss/reset/tailwind-compat.css'

export {}
```

```ts
// src/granularity.ts
import 'virtual:granum.css'

export {}
```

```ts
// src/main.ts
import { createApp } from 'vue'

import App from './App.vue'

await Promise.all([
  import('./reset'),
  import('./granularity'),
])

createApp(App).mount('#app')
```

### Компонент

```vue
<!-- src/App.vue -->
<script setup lang="ts">
import { ref } from 'vue'

import { GrButton } from '@feugene/granularity/components/GrButton'
import { GrInput } from '@feugene/granularity/components/GrInput'

const name = ref('')
</script>

<template>
  <main class="mx-auto flex max-w-xl flex-col gap-4 p-8">
    <GrInput v-model="name" placeholder="Имя" />
    <GrButton variant="primary">
      Сохранить
    </GrButton>
  </main>
</template>
```

Импорт по subpath, а не из корневого бареля: он попадает ровно в тот чанк, где
нужен, и не тянет соседей. Барель (`import { GrButton } from '@feugene/granularity'`)
тоже работает и удобен в прототипах, но гранулярность на нём держится хуже.

Автоматизировать импорты можно резолвером — см.
[«Авто-импорт компонентов»](#авто-импорт-компонентов).

### Запуск и сборка

```bash
yarn dev      # vite
yarn build    # vite build
```

## Каркас SSR

```
my-ssr-app/
├── index.html
├── package.json
├── server.mjs
├── tsconfig.json
├── granum.config.ts
├── vite.config.ts
├── vite-env.d.ts
└── src/
    ├── app.ts
    ├── entry-client.ts
    ├── entry-server.ts
    ├── styles.ts
    └── App.vue
```

`granum.config.ts`, `tsconfig.json`, `vite-env.d.ts` и `src/App.vue` — те же, что в
SPA: компоненты пакета пишутся одинаково для обоих типов приложения. В
`vite.config.ts` тоже нет ничего специфичного для SSR: режим задаётся флагами CLI
и dev-сервером.

К зависимостям SPA добавляется одна:

```json
{
  "scripts": {
    "dev": "node server.mjs",
    "build": "vite build --ssrManifest --outDir dist/client && vite build --ssr src/entry-server.ts --outDir dist/server"
  },
  "devDependencies": {
    "@vue/server-renderer": "^3.5.40"
  }
}
```

### `index.html` — шаблон с точками подстановки

```html
<!doctype html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>my-ssr-app</title>
  </head>
  <body>
    <div id="app"><!--app-html--></div>
    <!--app-teleports-->
    <script type="module" src="/src/entry-client.ts"></script>
  </body>
</html>
```

### Фабрика приложения

```ts
// src/app.ts
import { createSSRApp, type Component } from 'vue'

import { granularityThemePlugin, granularityToastPlugin } from '@feugene/granularity'

import App from './App.vue'

/**
 * В SSR приложение создаётся заново на каждый запрос: общий инстанс протёк бы
 * состоянием одного пользователя в ответ другому.
 */
export function createApp(root: Component = App) {
  const app = createSSRApp(root)

  // `useToast` намеренно запрещает модульный синглтон на сервере — без плагина
  // `GrToaster` роняет рендер. `setTheme` без плагина по той же причине бросает.
  app.use(granularityToastPlugin)
  app.use(granularityThemePlugin)

  return app
}
```

Оба плагина экспортирует корневой барель пакета. Там же — третий,
`granularityDialogServicePlugin`: он нужен, если приложение пользуется
императивным `useDialogService()`.

### Серверная точка входа

```ts
// src/entry-server.ts
import { renderToString, type SSRContext } from '@vue/server-renderer'
import type { Component } from 'vue'

import { createApp } from './app'

export interface SsrResult {
  html: string
  teleports: Record<string, string>
}

export async function render(root?: Component): Promise<SsrResult> {
  const app = createApp(root)
  const ssrContext: SSRContext = {}
  const html = await renderToString(app, ssrContext)

  // Содержимое `<teleport>` Vue кладёт не в HTML компонента, а сюда — по ключу
  // целевого селектора. Вставить это в разметку обязано приложение.
  return {
    html,
    teleports: (ssrContext.teleports ?? {}) as Record<string, string>,
  }
}
```

### Клиентская точка входа

```ts
// src/entry-client.ts
import { createApp } from './app'

import './styles'

// `createSSRApp().mount()` не перерисовывает разметку, а гидрирует пришедшую с
// сервера. Любое расхождение Vue напишет в консоль как hydration mismatch.
createApp().mount('#app')
```

```ts
// src/styles.ts
import '@unocss/reset/tailwind-compat.css'
import 'virtual:granum.css'

export {}
```

Стили подключает только клиент: `entry-server.ts` их не импортирует. В dev это
значит, что CSS приезжает модулем после гидрации. В production об этом заботиться
не нужно: клиентская сборка сама проставляет `<link rel="stylesheet">` в
`dist/client/index.html`, а прод-сервер берёт шаблон уже оттуда.

### Dev-сервер

```js
// server.mjs
import { createServer as createHttpServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { fileURLToPath, URL } from 'node:url'

import { createServer as createViteServer } from 'vite'

const port = Number(process.env.PORT ?? 5173)

const vite = await createViteServer({
  root: fileURLToPath(new URL('./', import.meta.url)),
  server: { middlewareMode: true },
  appType: 'custom',
})

function renderTeleports(teleports) {
  // Ключ — селектор цели: для `to="body"` Vue отдаёт `#body`.
  return Object.entries(teleports)
    .map(([target, html]) => `<!-- teleport ${target} -->\n${html}`)
    .join('\n')
}

const server = createHttpServer((request, response) => {
  vite.middlewares(request, response, async () => {
    try {
      const template = await vite.transformIndexHtml(
        request.url ?? '/',
        await readFile(new URL('./index.html', import.meta.url), 'utf8'),
      )

      const { render } = await vite.ssrLoadModule('/src/entry-server.ts')
      const { html, teleports } = await render()

      const page = template
        .replace('<!--app-html-->', html)
        .replace('<!--app-teleports-->', renderTeleports(teleports))

      response.statusCode = 200
      response.setHeader('Content-Type', 'text/html')
      response.end(page)
    }
    catch (error) {
      vite.ssrFixStacktrace(error)
      response.statusCode = 500
      response.end(error.stack)
    }
  })
})

server.listen(port, () => {
  console.log(`http://localhost:${port}/`)
})
```

Проверять результат нужно по **исходному** HTML (`Ctrl+U`), а не по DOM в
инспекторе: инспектор показывает уже гидрированное дерево, и разница потеряется.

### Роутинг

Каркас выше рендерит одну страницу. Как только страниц становится больше,
появляется обязательное условие: **сервер и клиент выбирают компонент одним и тем
же кодом**. Отдай сервер одну страницу, а клиент смонтируй другую — и гидрация
начнёт сверять разное.

Практически это либо `vue-router` с `createMemoryHistory()` на сервере и
`createWebHistory()` на клиенте, либо (для стенда) общий резолвер по
`pathname` — как в `apps/playground-ssr/src/pages.ts`.

### Прод-сборка

```bash
vite build --ssrManifest --outDir dist/client
vite build --ssr src/entry-server.ts --outDir dist/server
```

Первый проход даёт клиентский бандл и `dist/client/.vite/ssr-manifest.json`,
второй — серверный `dist/server/entry-server.js`.

Прод-сервер отличается от dev-сервера тремя вещами: шаблон читается из
`dist/client/index.html` (в нём уже проставлены ссылки на собранные JS и CSS),
`entry-server` импортируется напрямую, статика раздаётся из `dist/client`.

```js
// server.prod.mjs
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'

// eslint-disable-next-line antfu/no-import-dist -- прод-сервер по построению читает сборку
import { render } from './dist/server/entry-server.js'

const template = await readFile('./dist/client/index.html', 'utf8')

function renderTeleports(teleports) {
  return Object.entries(teleports)
    .map(([target, html]) => `<!-- teleport ${target} -->\n${html}`)
    .join('\n')
}

createServer(async (request, response) => {
  // Раздачу `/assets/**` в реальном развёртывании берёт на себя nginx или CDN.
  const { html, teleports } = await render()

  response.setHeader('Content-Type', 'text/html')
  response.end(
    template
      .replace('<!--app-html-->', html)
      .replace('<!--app-teleports-->', renderTeleports(teleports)),
  )
}).listen(5173)
```

> Стенд `apps/playground-ssr`, которым проверен весь остальной SSR-контракт,
> прод-сервера не содержит: этот листинг проверен вручную, но регрессионного
> гейта у него нет.

### Что нужно знать про SSR дизайн-системы

Подробности — в [`ssr.md`](./ssr.md), здесь только то, что влияет на каркас.

**Телепорты приезжают с сервера на месте.** Панели, всплывашки и оверлеи
живут в `body`, но попадают туда только после гидрации: композабл
`useTeleportEnabled()` выключает телепорт на сервере **и на первом клиентском
рендере**. Поэтому серверный HTML и первый клиентский рендер совпадают, а в
`ssrContext.teleports` остаются одни якоря-комментарии. Вставлять их в разметку
всё равно обязано приложение — по ним клиент находит целевой контейнер.

**`<ClientOnly>` не нужен ни одному компоненту пакета.** Обёртка только убьёт
серверную разметку. Она нужна вашему коду, который читает среду прямо в шаблоне.

**Императивные API прячут вызов, а не разметку.** `useDialogService().confirm()`
и `createLoading()` монтируют хост в `document.body` и на сервере бросают:
`if (typeof window !== 'undefined')` вокруг вызова либо перенос в `onMounted`.

**Тема ставится до первого рендера.** Сервер не знает выбор пользователя, поэтому
в `<head>` кладётся инлайновый скрипт — иначе пользователь с тёмной темой увидит
вспышку светлой:

```html
<script>
  try {
    var t = localStorage.getItem('gr-theme')
      || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    document.documentElement.dataset.theme = t
  } catch {}
</script>
```

Ключ `gr-theme` и атрибут `[data-theme]` — тот же контракт, что у `useTheme()`.
Если тема выбирается на сервере (из куки, из профиля), нужен
`granularityThemePlugin` — он уже стоит в каркасе выше.

**Тесты серверного рендера гоняются сборщиком, а не голым Node.** Чанки пакета
импортируют собственный `.css`, чего Node не умеет — импорт компонента падает с
`ERR_UNKNOWN_FILE_EXTENSION`. В vitest это лечится инлайном:

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    server: { deps: { inline: [/@feugene\/granularity/] } },
  },
})
```

И рендерить сервером из jsdom-теста нельзя: в jsdom `window` существует, гарды
`typeof window === 'undefined'` сочтут себя клиентом, и «серверный» HTML выйдет
таким, какого настоящий сервер никогда не отдаст. Снимайте серверный рендер в
чистом Node (`globalSetup`), а гидрируйте уже готовый снимок — образец в
`apps/playground-ssr/test/ssr-snapshot.ts`.

**Свой компонент** пишется по правилам из [`ssr.md`](./ssr.md#правила-для-нового-компонента):
DOM только в хуках и обработчиках, id — только через `useId()`, телепорт — через
`useTeleportEnabled()`, а не через `typeof window`.

## Локализация

Компоненты пакета несут встроенные английские fallback-тексты и работают без
всякого i18n. Как только приложению нужны другие языки, подключается
[`@feugene/fint-i18n`](https://github.com/efureev/fint-i18n) — он объявлен
**необязательной** peer-зависимостью пакета.

```bash
yarn add @feugene/fint-i18n
```

### Минимальный вариант

```ts
import { createFintI18n } from '@feugene/fint-i18n/core'
import { installI18n } from '@feugene/fint-i18n/vue'
import { GRANULARITY_I18N_BLOCK, en, ru } from '@feugene/granularity/i18n'

const i18n = createFintI18n({
  locale: 'ru',
  fallbackLocale: 'en',
  loaders: [en, ru],
})

i18n.registerBlocks([GRANULARITY_I18N_BLOCK])
await i18n.loadUsedBlocks(i18n.locale.value)

installI18n(app, i18n)
```

`en` / `ru` / `es` — отдельные лоадеры на локаль: неиспользуемые языки вытряхнет
бандлер. Пакет публикует и агрегат `@feugene/granularity/i18n/all` (default-экспорт,
равен `[en, ru, es]`), но он предназначен для демо, e2e и тулинга — в продакшене
он тянет все языки сразу.

Пакет не импортирует `@feugene/fint-i18n` в рантайме: компонент ищет инстанс по
глобальному символу, поэтому одного `installI18n` достаточно — регистрировать
адаптер отдельно не нужно.

### Полный вариант: приложение и все пакеты семейства

Один `createFintI18n` обслуживает словари приложения, ядра и каждого спутника.
Образец — `apps/showcase/src/i18n/index.ts`:

```ts
import { createFintI18n } from '@feugene/fint-i18n/core'
import { PersistencePlugin } from '@feugene/fint-i18n/plugins'
import { installI18n } from '@feugene/fint-i18n/vue'

import { GRANULARITY_I18N_BLOCK } from '@feugene/granularity/i18n'
import grLocales from '@feugene/granularity/i18n/all'
import { GR_CHRONO_I18N_BLOCK } from '@feugene/granularity-chrono/i18n'
import grChronoLocales from '@feugene/granularity-chrono/i18n/all'

import { APP_I18N_BLOCK, appLocaleLoaders } from './messages'

export async function setupI18n() {
  const i18n = createFintI18n({
    locale: 'en',
    fallbackLocale: 'en',
    preloadFallback: true,
    loaders: [appLocaleLoaders, ...grLocales, ...grChronoLocales],
    plugins: [
      new PersistencePlugin({ key: 'app-locale', syncTabs: true }),
    ],
  })

  i18n.registerBlocks([APP_I18N_BLOCK, GRANULARITY_I18N_BLOCK, GR_CHRONO_I18N_BLOCK])
  await i18n.loadUsedBlocks(i18n.locale.value)

  return { install: app => installI18n(app, i18n) }
}
```

У каждого пакета **свой блок**, а не общий `gr`: реестр `fint-i18n` мержит
источники одного блока по ключам, и словарь спутника, севший на чужой блок,
столкнулся бы с ним молча.

### Три ошибки, о которых не сообщит никто

Ни одна из них не даёт ни исключения, ни предупреждения в интерфейсе:

- **лоадеры добавили, блок не зарегистрировали** — словарь не грузится;
- **блок зарегистрировали, лоадеры не добавили** — в консоли `No loader for
  block "…"`, в интерфейсе английский;
- **не позвали `installI18n`** — компоненты навсегда остаются на встроенном
  fallback.

### Чего в словаре быть не должно

Названия месяцев и дней недели, порядок частей даты, 12/24 часа, «вчера»,
форматы чисел — всё это даёт `Intl` по тегу локали. Строка в словаре на такую
тему означает, что интерфейс будет знать столько языков, сколько успели вписать,
вместо всех, что умеет движок.

Множественное число задаётся объектом с категориями CLDR (`zero`, `one`, `two`,
`few`, `many`, `other` или точные `=0`/`=1`); число компонент передаёт под двумя
именами — `n` и `count`. Подробности и формат — в
[`localization.md`](./localization.md#множественное-число-числа-даты-и-валюты).

## Остальные пакеты семейства

### Пакет-спутник: четыре шага

Спутник подключается всегда одинаково, независимо от того, какой именно:

1. **Зависимость** — `yarn add @feugene/granularity-chrono`.
2. **Провайдер в `granum.config.ts`** — иначе CSS его компонентов не соберётся:

   ```ts
   export default defineGranumConfig({
     engine: windEngine(),
     providers: ['@feugene/granularity', '@feugene/granularity-chrono'],
     themes: { names: ['light', 'dark'] },
     appSources: { dirs: ['src'] },
   })
   ```

3. **Резолвер** — если пользуетесь авто-импортом (см. ниже).
4. **Блок i18n и лоадеры** — по образцу из главы про локализацию.

Компоненты импортируются так же, как у ядра: `@feugene/granularity-chrono/components/GrDatePicker`
или из корневого бареля пакета.

### Что есть в семействе

<!-- ecosystem:generated:start -->
| Пакет | Версия | Компоненты | Блок i18n | Резолвер |
| --- | --- | --- | --- | --- |
| `@feugene/granularity` | 0.53.1 | ядро, 106 subpath-экспортов `./components/Gr*` | `gr` | `GranularityResolver` (из `@feugene/unplugin-granularity`) |
| `@feugene/granularity-charts` | 0.11.0 | `GrChartArea`, `GrChartBar`, `GrChartBullet`, `GrChartFunnel`, `GrChartHeatmap`, `GrChartLine`, `GrChartPie`, `GrChartRadar`, `GrChartWaterfall`, `GrSparkline` | `grCharts` | `GranularityChartsResolver` |
| `@feugene/granularity-chrono` | 0.10.0 | `GrCalendar`, `GrDatePicker`, `GrDateRangePicker`, `GrDateTimePicker`, `GrDuration`, `GrRelativeTime`, `GrTimePicker` | `grChrono` | `GranularityChronoResolver` |
| `@feugene/granularity-code` | 0.2.0 | `GrCodeBlock`, `GrCodeEditor`, `GrDiff` | `grCode` | `GranularityCodeResolver` |
| `@feugene/granularity-dashboard` | 0.6.0 | `GrDashboard`, `GrDashboardItem`, `GrDashboardItemSettings`, `GrDashboardPalette`, `GrDashboardToolbar` | `grDashboard` | `GranularityDashboardResolver` |
| `@feugene/granularity-editor` | 0.4.1 | `GrMarkdown`, `GrRichText` | `grEditor` | `GranularityEditorResolver` |
| `@feugene/granularity-forms-schema` | 0.4.0 | `GrSchemaForm` | `grForms` | `GranularityFormsSchemaResolver` |
| `@feugene/granularity-media` | 0.7.1 | `GrCameraCapture`, `GrCodeScanner`, `GrImageCrop`, `GrVideoPlayer` | `grMedia` | `GranularityMediaResolver` |

Компонентов не добавляют, но входят в семейство:

- [`@feugene/granularity-datasource`](../../granularity-datasource) `0.1.2`
- [`@feugene/granularity-devtools`](../../granularity-devtools) `0.3.2`
- [`@feugene/granularity-test-kit`](../../granularity-test-kit) `0.10.0`
- [`@feugene/unplugin-granularity`](../../unplugin-granularity) `0.7.1`
<!-- ecosystem:generated:end -->

Резолвер каждый спутник экспортирует сам — из subpath `./resolver`. Кроме
компонентов спутники публикуют прикладное API: `./chart` и `useChartScale` у
charts, `./layout` и `useDashboardLayout` у dashboard, `useChronoNow` у chrono.

Сам конвейер `@feugene/granum` живёт в отдельном репозитории и подключается из
`devDependencies`: в бандл приложения он не попадает.

### Авто-импорт компонентов

`@feugene/unplugin-granularity` — резолвер для
[`unplugin-vue-components`](https://github.com/unplugin/unplugin-vue-components):
компоненты используются в шаблонах без единого `import`, а плагин на сборке
дописывает статические импорты сам.

```bash
yarn add -D @feugene/unplugin-granularity unplugin-vue-components
```

```ts
// vite.config.ts
import Components from 'unplugin-vue-components/vite'
import { GranularityResolver } from '@feugene/unplugin-granularity'
import { GranularityChronoResolver } from '@feugene/granularity-chrono/resolver'

export default defineConfig({
  plugins: [
    vue(),
    Components({
      dts: 'src/components.d.ts',
      resolvers: [
        // Резолверы спутников идут раньше: они знают точный список своих имён,
        // а `GranularityResolver` забирает любое имя на `Gr`.
        GranularityChronoResolver(),
        GranularityResolver({ importStyle: false }),
      ],
    }),
  ],
})
```

Порядок здесь не стилистика: жадный резолвер ядра, поставленный первым, перехватит
`GrDatePicker` и попытается найти его в ядре, где его нет. Подробности —
в [`unplugin.md`](./unplugin.md).

### Глобальные дефолты и runtime-регистрация

Два необязательных приёма, которые часто пригождаются сразу:

- **`GrConfigProvider`** оформляет поддерево одним объектом: размер по умолчанию,
  `componentDefaults` на компонент, цель порталов, база `z-index`.
  См. [`components/GrConfigProvider.md`](./components/GrConfigProvider.md) и
  [`sizes.md`](./sizes.md).
- **`createGranularity`** из `@feugene/granularity/vue` — единый bootstrap-вход
  для директив, `provide` и `globalProperties`. Нужен, когда директивы
  используются в `render()`/JSX, куда резолвер шаблонов не дотягивается.
  См. [`vue-plugin.md`](./vue-plugin.md).

## Приложение не поднялось — что смотреть

| Симптом                                                          | Причина                                                                                                                                                    |
|------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Компоненты бесцветные, разметка «голая»                          | Не импортирован `virtual:granum.css` либо компонент вне селекции — проверьте `granum doctor` и `classes.unmatched` в отчёте                                |
| Компоненты бесцветные внутри монорепо                            | Пакет не пересобран: `yarn build:granularity`                                                                                                              |
| Спиннер не крутится, `sr-only`-текст виден                       | Движок другого словаря: `animate-spin`, `sr-only`, `divide-*` привозят доп-правила `windEngine()` — смотрите `provider-dialect-mismatch` у `granum doctor` |
| Иконка, переданная классом (`icon="i-lucide-user"`), не рисуется | `windEngine()` правил иконок не знает: передайте иконку компонентом либо отдайте своё правило фабрике движка. Свои иконки пакета работают всегда           |
| Интерфейс английский при заданной локали                         | Блок не зарегистрирован, лоадеры не добавлены или забыт `installI18n`                                                                                      |
| Hydration mismatch на первой же странице                         | Сервер и клиент выбрали разные компоненты, либо в `setup` читается среда — см. [`ssr.md`](./ssr.md)                                                        |
| Оверлей не работает после гидрации, хотя разметка пришла         | В шаблон не вставлен `ssrContext.teleports` — клиенту не по чему найти целевой контейнер                                                                   |

Что именно попало в CSS и почему, показывает dev-сервер:

```bash
curl http://localhost:5173/__uno.css | grep <класс-или-токен>
```

## Ссылки

- [`installation.md`](./installation.md) — зависимости и опции подключения
- [`granum.md`](./granum.md) — плагин и манифест
- [`ssr.md`](./ssr.md) — SSR-контракт компонентов
- [`localization.md`](./localization.md) — локализация
- [`theming.md`](./theming.md) — своя тема
- [`unplugin.md`](./unplugin.md) — авто-импорт
- [`companion-packages.md`](./companion-packages.md) — свой пакет-спутник
- Рабочие приложения репозитория: `apps/playground-5` (SPA),
  `apps/playground-config` (`GrConfigProvider`, внешний потребитель),
  `apps/playground-theme` (своя тема), `apps/playground-ssr` (SSR),
  `apps/showcase` (всё вместе)
