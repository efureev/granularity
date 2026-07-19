# Создание пакета-спутника (companion) с нуля

Этот гайд описывает, как собрать **companion-пакет** экосистемы `@feugene/granularity` — отдельный
публикуемый пакет с собственными компонентами поверх примитивов дизайн-системы, — и как включить для
него авто-импорт через [`@feugene/unplugin-granularity`](../../unplugin-granularity/README.md).

Companion-пакет уместен, когда компонент **не должен жить в ядре**: он тянет тяжёлую зависимость
(как [`@feugene/granularity-datepicker`](../../granularity-datepicker/README.md) — обёртка над
`@vuepic/vue-datepicker`), либо это композит бизнес-уровня
([`@feugene/extra-granularity`](../../extra-granularity/README.md)). Ядро остаётся lean, а спутник
имеет собственный релизный цикл и `peerDependency` на `@feugene/granularity`.

> **Референс.** Рабочий пример, на который ссылается этот гайд, — `packages/granularity-datepicker`.
> Пер-компонентные детали (`config.ts`, `styles.css`, safelist) описаны в
> [`ADDING_COMPONENTS.md`](./ADDING_COMPONENTS.md); здесь — упаковка целого пакета.

## Что должно получиться

```
packages/<my-package>/
├── package.json
├── tsconfig.json
├── tsconfig.build.json
├── vite.config.ts
├── .gitignore
├── README.md
├── CHANGELOG.md
└── src/
    ├── index.ts                 # root barrel
    ├── resolver.ts              # (опц.) резолвер авто-импорта
    ├── components/
    │   └── GrMyThing/
    │       ├── GrMyThing.vue
    │       ├── config.ts        # defineGranularComponent
    │       └── index.ts
    └── granular-provider/
        ├── shared.ts            # фабрика провайдера
        ├── index.ts             # browser-entry
        └── node.ts              # node-entry (FS-aware)
```

## 1. `package.json`

Ключевое: `type: module`, `sideEffects: ["**/*.css"]` (чтобы CSS-импорты не отсекались tree-shaking'ом),
`files: ["dist"]`, и **пер-компонентные subpath-экспорты** — за счёт них потребитель тянет только
использованные компоненты.

```jsonc
{
  "name": "@feugene/my-package",
  "version": "0.1.0",
  "type": "module",
  "types": "./dist/types/src/index.d.ts",
  "files": ["dist"],
  "sideEffects": ["**/*.css"],
  "publishConfig": { "access": "public", "provenance": true },
  "exports": {
    ".": {
      "types": "./dist/types/src/index.d.ts",
      "import": "./dist/index.js"
    },
    "./components/GrMyThing": {
      "types": "./dist/types/src/components/GrMyThing/index.d.ts",
      "import": "./dist/components/GrMyThing/index.js"
    },
    "./granular-provider": {
      "types": "./dist/types/src/granular-provider/index.d.ts",
      "import": "./dist/granular-provider.js"
    },
    "./granular-provider/node": {
      "types": "./dist/types/src/granular-provider/node.d.ts",
      "import": "./dist/granular-provider-node.js"
    }
  },
  "peerDependencies": {
    "@feugene/granularity": ">=0.11.0 <1.0.0",
    "@feugene/unocss-preset-granular": "^0.4.0",
    "vue": "^3.5.40"
  },
  "scripts": {
    "build": "vite build && vue-tsc -p tsconfig.build.json",
    "typecheck": "vue-tsc --noEmit -p tsconfig.json"
  }
}
```

- `@feugene/granularity`, `@feugene/unocss-preset-granular`, `vue` — **peer**-зависимости (одна версия
  рантайма на всё приложение).
- Собственные тяжёлые зависимости пакета (у датапикера — `@vuepic/vue-datepicker`, `date-fns`) идут в
  `dependencies` — их и оплачивает только тот, кто установит companion-пакет.

## 2. tsconfig

`tsconfig.json` — для typecheck (`noEmit`), `tsconfig.build.json` — только `.d.ts` (эмит компонент
делает `vite`, а декларации — `vue-tsc`). Проще всего скопировать из `packages/granularity-datepicker`.
Главное — `"jsxImportSource": "vue"`, `"types": ["vite/client", "node"]` (для `*.css`-импортов), и в
`tsconfig.build.json` — `emitDeclarationOnly: true` + `declarationDir: "./dist/types"`.

## 3. `vite.config.ts`

Каждый компонент — отдельный lib-entry (tree-shake), SFC-чанки складываются в `components/<Name>/chunks/`
через `granularChunkFileNames` (чтобы UnoCSS в приложении смог просканировать шаблоны через
`content.filesystem` пресета). `libInjectCss` инлайнит CSS компонента в его JS-чанк. Всё, что не должно
попасть в бандл пакета (peers и собственные тяжёлые deps), помечается `external`.

```ts
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { granularChunkFileNames } from '@feugene/unocss-preset-granular/vite'
import { libInjectCss } from 'vite-plugin-lib-inject-css'

export default defineConfig({
  plugins: [vue(), libInjectCss()],
  build: {
    target: 'esnext',
    cssCodeSplit: true,
    emptyOutDir: true,
    lib: {
      entry: {
        index: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
        'components/GrMyThing/index': fileURLToPath(new URL('./src/components/GrMyThing/index.ts', import.meta.url)),
        'granular-provider': fileURLToPath(new URL('./src/granular-provider/index.ts', import.meta.url)),
        'granular-provider-node': fileURLToPath(new URL('./src/granular-provider/node.ts', import.meta.url)),
      },
      formats: ['es'],
      fileName: (_f, name) => `${name}.js`,
    },
    rolldownOptions: {
      external: [
        /^node:/,
        'vue',
        /^@feugene\/granularity(\/.*)?$/,
        /^@feugene\/unocss-preset-granular(\/.*)?$/,
        // + собственные тяжёлые зависимости пакета, напр.:
        // /^@vuepic\/vue-datepicker(\/.*)?$/, /^date-fns(\/.*)?$/,
      ],
      output: {
        chunkFileNames: granularChunkFileNames(),
        assetFileNames: a => a.name ?? '[name][extname]',
      },
    },
  },
})
```

## 4. Компоненты

Компоненты именуются с префиксом `Gr*` и повторяют структуру ядра: `GrMyThing.vue` + `config.ts`
(`defineGranularComponent`) + `index.ts`. Темизация — через DS-токены (`var(--gr-*)`, `var(--bg)`,
`var(--primary)` …), чтобы light/dark работали автоматически. Детали — в
[`ADDING_COMPONENTS.md`](./ADDING_COMPONENTS.md).

```ts
// src/components/GrMyThing/config.ts
import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

export const grMyThingConfig = defineGranularComponent(import.meta.url, {
  name: 'GrMyThing',
  // Если композит использует примитивы ядра — перечислите их, safelist подтянется:
  // dependencies: [{ provider: '@feugene/granularity', components: ['GrButton', 'GrInput'] }],
})
```

## 5. Granular-provider

Провайдер регистрирует компоненты пакета в едином реестре пресета — так UnoCSS соберёт safelist и
CSS всех (в т.ч. транзитивных) компонентов. Нужны **два entry**, отличающиеся только тем, какой
инстанс `granularityProvider` попадает в `dependencies` (browser vs FS-aware node), — чтобы у
`presetGranularNode` был ровно один инстанс с данным `id`. Общий код — в `shared.ts`:

```ts
// src/granular-provider/shared.ts
import { defineGranularProvider, type GranularProvider } from '@feugene/unocss-preset-granular/contract'
import { grMyThingConfig } from '../components/GrMyThing/config'

export const MY_PROVIDER_ID = '@feugene/my-package'

// rolldown заменяет `new URL('..', import.meta.url)` на data:-URL, поэтому корень
// пакета собираем из `import.meta.url` вручную (два последних сегмента — файл и каталог).
const packageBaseUrl = `${import.meta.url.slice(
  0, import.meta.url.lastIndexOf('/', import.meta.url.lastIndexOf('/') - 1) + 1,
)}`

export function createMyProvider(granularityProvider: GranularProvider): GranularProvider {
  return defineGranularProvider({
    id: MY_PROVIDER_ID,
    contractVersion: 1,
    packageBaseUrl,
    components: [grMyThingConfig],
    dependencies: [granularityProvider],
  })
}
```

```ts
// src/granular-provider/index.ts  (browser-entry)
import { granularityProvider } from '@feugene/granularity/granular-provider'
import { createMyProvider } from './shared'
export const myProvider = createMyProvider(granularityProvider)
export default myProvider
```

```ts
// src/granular-provider/node.ts  (node-entry, FS-aware)
import { granularityProvider } from '@feugene/granularity/granular-provider/node'
import { createMyProvider } from './shared'
export const myProvider = createMyProvider(granularityProvider)
export default myProvider
```

Потребитель подключает провайдер рядом с ядром:

```ts
presetGranularNode({
  providers: [granularityProvider, myProvider],
  components: ['@feugene/my-package:GrMyThing'],
})
```

## 6. Root barrel

```ts
// src/index.ts
export * from './components/GrMyThing'
```

## 7. Авто-импорт через `unplugin-granularity`

Чтобы `<GrMyThing>` работал в шаблонах без ручных `import`, добавьте **резолвер** для
`unplugin-vue-components`, построенный на общей фабрике `createGranularResolver` из
`@feugene/unplugin-granularity`.

Так как компоненты пакета тоже начинаются на `Gr*`, жадный core-резолвер по префиксу перехватил бы их
и импортировал из несуществующего пути в `@feugene/granularity`. Поэтому используем **whitelist**
(явный список имён), а не `prefix`. И — важно — CSS у пакета инлайнится (`libInjectCss`), поэтому
`importStyle: false` (отдельный `styles.css`-side-effect не нужен).

```ts
// src/resolver.ts
import { createGranularResolver } from '@feugene/unplugin-granularity'
import type { ComponentResolver } from 'unplugin-vue-components/types'

export function MyPackageResolver(): ComponentResolver {
  return createGranularResolver({
    packageName: '@feugene/my-package',
    components: ['GrMyThing'], // whitelist
    importStyle: false,        // CSS инлайнится в JS-чанк
  })
}
```

Добавьте `resolver` в lib-entries и в `exports` пакета, а `@feugene/unplugin-granularity` и
`unplugin-vue-components` — в **optional** peer-зависимости (нужны только тем, кто пользуется
авто-импортом):

```jsonc
// package.json
"exports": {
  "./resolver": { "types": "./dist/types/src/resolver.d.ts", "import": "./dist/resolver.js" }
},
"peerDependencies": {
  "@feugene/unplugin-granularity": ">=0.4.0 <1.0.0",
  "unplugin-vue-components": ">=0.26.0"
},
"peerDependenciesMeta": {
  "@feugene/unplugin-granularity": { "optional": true },
  "unplugin-vue-components": { "optional": true }
}
```

`resolver.ts` держите external от `@feugene/unplugin-granularity` и `unplugin-vue-components` в
`vite.config.ts` (это build-time хелперы, а не рантайм пакета).

Потребитель регистрирует резолвер **перед** core-резолвером (whitelist точнее и должен отработать
первым, иначе жадный `Gr*` ядра перехватит имя):

```ts
Components({
  resolvers: [
    MyPackageResolver(),   // whitelist — раньше…
    GranularityResolver(), // …жадного Gr*-резолвера ядра
  ],
})
```

Подробнее про сам резолвер и его опции — [`unplugin.md`](./unplugin.md).

## 8. Сборка и публикация

```bash
yarn workspace @feugene/my-package build
npx --yes publint@latest --pack npm   # проверка соответствия exports ↔ dist
```

`publint` должен сказать `All good!` — тогда `exports` и реальные файлы `dist` согласованы. Для релиза
используйте отдельный тег вида `my-package-v<semver>` (по образцу `granularity-datepicker-v*` в
`.github/workflows/ci.yml`), чтобы публиковать спутник независимо от ядра.

## Чеклист

- [ ] `package.json`: `type: module`, `sideEffects: ["**/*.css"]`, пер-компонентные `exports`, peer на ядро.
- [ ] `vite.config.ts`: entry на каждый компонент, `granularChunkFileNames`, `libInjectCss`, `external` на peers и тяжёлые deps.
- [ ] Компоненты `Gr*` + `config.ts` (`defineGranularComponent`), темизация через DS-токены.
- [ ] Granular-provider: `shared.ts` + browser/node entry, зарегистрирован в приложении рядом с ядром.
- [ ] (Опц.) `./resolver` на `createGranularResolver` (whitelist + `importStyle: false`), optional peers, регистрируется раньше core-резолвера.
- [ ] `build` зелёный, `publint` — `All good!`.
