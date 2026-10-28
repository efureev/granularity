# Создание пакета-спутника (companion) с нуля

> **Конвейер — [`@feugene/granum`](./granum.md).** Пакет на своей сборке отдаёт
> `granumProvider({ provider, engine: windEngine() })` раскладку `dist` и
> публикует `granum.manifest.json`; приложение читает манифест и передаёт свой
> движок само. Ни ядро, ни спутники `dist` друг друга не сканируют.

Этот гайд описывает, как собрать **companion-пакет** экосистемы `@feugene/granularity` — отдельный
публикуемый пакет с собственными компонентами поверх примитивов дизайн-системы, — и как включить для
него авто-импорт через [`@feugene/unplugin-granularity`](../../unplugin-granularity/README.md).

Companion-пакет уместен, когда компонент **не должен жить в ядре**: он тянет тяжёлую зависимость
(так был устроен снятый `@feugene/granularity-datepicker` — обёртка над `@vuepic/vue-datepicker`),
либо просто не относится к ядру: календарь и пикеры даты и времени вынесены в
[`@feugene/granularity-chrono`](../../granularity-chrono/README.md) без единой внешней зависимости.
Ещё вариант — композит бизнес-уровня поверх примитивов ядра. Ядро остаётся lean, а спутник
имеет собственный релизный цикл и `peerDependency` на `@feugene/granularity`.

> **Референс.** Рабочий пример, на который ссылается этот гайд, — `packages/granularity-chrono`.
> Пер-компонентные детали (`config.ts`, `styles.css`, safelist) описаны в
> [`ADDING_COMPONENTS.md`](./ADDING_COMPONENTS.md); здесь — упаковка целого пакета.

## Что должно получиться

```
packages/<my-package>/
├── package.json
├── tsconfig.json
├── tsconfig.build.json
├── vite.config.ts
├── granum.config.mjs            # конфиг для `yarn doctor` по своему манифесту
├── .gitignore
├── README.md
├── CHANGELOG.md
└── src/
    ├── index.ts                 # root barrel
    ├── components/
    │   └── GrMyThing/
    │       ├── GrMyThing.vue
    │       ├── config.ts        # defineGranumComponent
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
  "main": "./dist/index.js",
  "types": "./dist/types/index.d.ts",
  "files": ["dist"],
  "sideEffects": ["**/*.css"],
  "publishConfig": { "access": "public", "provenance": true },
  "exports": {
    ".": {
      "types": "./dist/types/index.d.ts",
      "import": "./dist/index.js"
    },
    "./granum.manifest.json": "./dist/granum.manifest.json",
    "./components/GrMyThing": {
      "types": "./dist/types/components/GrMyThing/index.d.ts",
      "import": "./dist/components/GrMyThing/index.js"
    },
    "./granular-provider": {
      "types": "./dist/types/granular-provider/index.d.ts",
      "import": "./dist/granular-provider.js"
    },
    "./granular-provider/node": {
      "types": "./dist/types/granular-provider/node.d.ts",
      "import": "./dist/granular-provider-node.js"
    },
    "./package.json": "./package.json"
  },
  "peerDependencies": {
    "@feugene/granularity": ">=1.0.0 <2.0.0",
    "@feugene/granum": ">=3.0.0 <4.0.0",
    "vue": "^3.5.0"
  },
  "devDependencies": {
    "@feugene/granum": "^3.0.0",
    "@feugene/granum-engine-wind": "^3.0.0"
  },
  "scripts": {
    "build": "vite build && vue-tsc -p tsconfig.build.json",
    "typecheck": "vue-tsc --noEmit -p tsconfig.json",
    "doctor": "granum doctor ./granum.config.mjs --strict",
    "sizes": "node ../../scripts/report-entry-sizes.mjs .",
    "sizes:docs": "node ../../scripts/generate-entry-sizes.mjs ."
  }
}
```

`"./granum.manifest.json"` — не косметика: приложение резолвит манифест именно
этим подпутём, и без экспорта провайдер пакета подключить нельзя. Экспорт ставится
сразу за `"."`, и этот порядок сверяет гейт реестров.

Движок (`@feugene/granum-engine-wind`) нужен только на сборке — он **dev**, а не
peer: словарь, против которого написаны классы, пакет объявляет диалектом, а
инстанс движка приносит приложение.

`doctor` — прямой вызов CLI, без скрипта-обёртки: свой фильтр вокруг доктора
неизбежно расходится с самим доктором. Осознанный долг записывается флагом
(`--allow=important-in-provider-css`) и остаётся напечатанным и посчитанным;
детали по находке — `--code=<code>` и `--component=<providerId:Name>`.

- `sizes` — отчёт о весе гранулярных импортов (`scripts/report-entry-sizes.mjs`, общий на монорепо).
  Шаг `Entry sizes (gzip)` ставится в сборочную джобу пакета сразу после `Granular doctor` — таблица
  уезжает в сводку прогона. Гейтом отчёт не сделан намеренно: порог, взятый с потолка, краснеет на
  честном росте компонента, и его научатся поднимать не глядя.
- `sizes:docs` — тот же замер в README пакета и полной таблицей в `docs/entry-sizes.md`. В README
  нужен маркер `<!-- entry-sizes:generated:start lang=ru|en -->` … `<!-- entry-sizes:generated:end -->`;
  язык объявляется в маркере, потому что READMEs пакетов написаны на обоих. Шаг
  `Entry sizes docs drift` (`yarn sizes:docs --check`) идёт следом за отчётом и сверяет **версию в
  шапке таблицы и её состав**, а не килобайты: `zlib` сжимает один и тот же `dist` по-разному в
  разных средах (барель ядра — 542.9 kB на macOS против 549.3 kB на линуксовом раннере при
  совпадающем до файла графе), и гейт на точные числа не удовлетворить в двух средах сразу.
  Свежесть весов держит версия: бамп обязывает перегенерировать, поэтому числа не бывают старше
  одного релиза.

  В README попадает **объединение** набора, а не сумма строк: общий чанк посчитан в каждой строке
  заново, а платится один раз, и читатель, сложивший пять строк ядра, получил бы 381 kB вместо 171.
  Строки сводки выведены правилом — барель, самый лёгкий, медианный, пять самых тяжёлых вместе, —
  чтобы «показательный» компонент не выбирался под нужную цифру.

`yarn sizes:check` в корне роняет CI, если пакет с компонентными подпутями остался без любого из
двух скриптов или без маркера в README.

- `@feugene/granularity`, `@feugene/granum`, `vue` — **peer**-зависимости: ядро и `vue` —
  одна копия рантайма на всё приложение, granum — одна версия конвейера. Две копии granum в
  графе особенно вредны: хелперы отпечатка словаря в них разные, отпечатки перестают
  сравниваться, и приложение молча пересчитывает классы пакета на каждой сборке. В рантайм
  granum не попадает: хелперы `@feugene/granum/contract`, которыми описаны компоненты,
  `granumProvider()` встраивает в `dist/granum/contract.js`, и `dist` пакета granum не
  импортирует.
- Собственные зависимости пакета идут в `dependencies` — их и оплачивает только тот, кто установит
  companion-пакет. У `granularity-chrono` их нет вовсе: своя арифметика дат и `Intl` вместо
  date-библиотеки.

## 2. tsconfig

`tsconfig.json` — для typecheck (`noEmit`), `tsconfig.build.json` — только `.d.ts` (эмит компонент
делает `vite`, а декларации — `vue-tsc`). Проще всего скопировать из `packages/granularity-chrono`.
Главное — `"jsxImportSource": "vue"`, `"types": ["vite/client", "node"]` (для `*.css`-импортов), и в
`tsconfig.build.json` — `emitDeclarationOnly: true` + `declarationDir: "./dist/types"` + **`rootDir:
"src"`**.

`rootDir` тут не косметика: без него TS берёт за корень общий префикс входных файлов, и любой файл
вне `src` (типичный случай — `vite-env.d.ts` в корне пакета) добавляет в путь деклараций лишний
сегмент `src`. Тогда `types` придётся писать как `./dist/types/src/index.d.ts` — путь, который ломает
внешние инструменты. Если пакет использует `~icons/*`, декларации оттуда приходят как раз из
`vite-env.d.ts`: под `rootDir: "src"` он в компиляцию не входит, поэтому в `tsconfig.build.json`
добавьте `"unplugin-icons/types/vue"` в `types` — список из `extends` не мержится и перечисляется
заново целиком.

## 3. `vite.config.ts`

Раскладку `dist` ведёт плагин `granumProvider()`, а не конфиг: entry на каждый
компонент и на `index`, SFC-чанки в `components/<Name>/chunks/`, извлечение
классов и потребляемых токенов по графу бандла, `dist/granum.manifest.json` в
конце. Руками перечисляются только entry, которых в реестре провайдера нет, —
слои пакета, резолвер, i18n. `libInjectCss` инлайнит CSS компонента в его
JS-чанк. Всё, что не должно попасть в бандл (peers и собственные тяжёлые deps),
помечается `external`.

```ts
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { granumProvider } from '@feugene/granum/build'
import { withRegistryHookTokens } from '@feugene/granularity-test-kit'
import { windEngine } from '@feugene/granum-engine-wind'
import { libInjectCss } from 'vite-plugin-lib-inject-css'

import { myProvider } from './src/granular-provider'

/** Entry, которых в реестре провайдера нет: слои пакета и служебные точки входа. */
const extraEntries: Record<string, string> = {
  'granular-provider': 'src/granular-provider/index.ts',
  'granular-provider-node': 'src/granular-provider/node.ts',
}

export default defineConfig({
  plugins: [
    vue(),
    libInjectCss(),
    granumProvider({
      // Хуки из `tokens.json` — в манифест: `doctor` не сочтёт их забытыми.
      provider: withRegistryHookTokens(myProvider, fileURLToPath(new URL('./src', import.meta.url))),
      engine: windEngine(),
      entries: extraEntries,
    }),
  ],
  build: {
    target: 'esnext',
    cssCodeSplit: true,
    emptyOutDir: true,
    rolldownOptions: {
      external: [
        /^node:/,
        'vue',
        /^@feugene\/granularity(\/.*)?$/,
        // + собственные тяжёлые зависимости пакета, напр.:
        // /^@vuepic\/vue-datepicker(\/.*)?$/, /^date-fns(\/.*)?$/,
      ],
    },
  },
})
```

`build.lib` в конфиге нет: entry, форматы и имена файлов ставит плагин. Свой
`lib` рядом с ним — конфликт, и выигравшего в нём не видно по ошибке.

Движок передаётся **инстансом** и только на сборке пакета. Диалект инстанса
сверяется с тем, что провайдер объявил в `engine.dialect`: расхождение роняет
сборку, а не пишет в манифест чужой словарь.

## 4. Компоненты

Компоненты именуются с префиксом `Gr*` и повторяют структуру ядра: `GrMyThing.vue` + `config.ts`
(`defineGranumComponent`) + `index.ts`. Цвета — только роли дизайн-системы (`var(--gr-bg)`,
`var(--gr-primary)` …): их значения задают тема и режим приложения, поэтому компонент спутника
следует за любым режимом и островом `GrConfigProvider mode` без своего CSS по режимам. Своих тем у
спутника нет. Когда общих ролей мало, у компонента — свои токены вида `theme`: их значения лежат в
темах каталога пакета токенов, разделом `components/<пакет спутника>/<GrX>/`, а пакет спутника —
в `targets` этих тем; `themesDir` у компонентов нет. Детали — в
[`ADDING_COMPONENTS.md`](./ADDING_COMPONENTS.md) и [`modes.md`](./modes.md).

```ts
// src/components/GrMyThing/config.ts
import { defineGranumComponent } from '@feugene/granum/contract'

export const grMyThingConfig = defineGranumComponent(import.meta.url, {
  name: 'GrMyThing',
  // Если композит использует примитивы ядра — перечислите их, safelist подтянется:
  // dependencies: [{ provider: '@feugene/granularity', components: ['GrButton', 'GrInput'] }],
})
```

Поле ввода спутника — рамка поля ядра, а не своя копия классов: атрибуты
`grFieldLookAttrs` из `@feugene/granularity/components/GrInput` на элемент рамки и
`GrInput` в `dependencies` провайдера ядра ([`field.md`](./field.md)). Так поле пикера или
редактора меняется вместе с полями ядра в каждой теме.

Хелперы, которые делят между собой два компонента пакета, кладите в
`src/components/shared/` — **не** в директорию одного из них. Импорт из чужой
директории компонента сборка считает объявленным ребром и требует его в
`dependencies`, а объявив, заставляет потребителя, выбравшего один компонент,
оплатить CSS и safelist второго целиком.

## 5. Локализация компонентов через `@feugene/fint-i18n`

Этот раздел нужен, только если у компонентов пакета есть **встроенные интерфейсные строки** (подписи,
кнопки, `aria-label`, служебные сообщения). Общая философия локализации — в
[`localization.md`](./localization.md): источник правды по переводам всегда остаётся у приложения,
пакет лишь поставляет словари и берёт готовый перевод из общего i18n-слоя. Companion-пакет повторяет
ту же схему, что и ядро (`packages/granularity/src/i18n`), — тогда потребитель подключает ваши
переводы **тем же** `createFintI18n`, что и переводы ядра, без отдельной инфраструктуры.

Каноническая раскладка (см. также `docs/en/authoring-localization-packages.md` в документации
`@feugene/fint-i18n`):

```
src/i18n/
├── locales/                 # плоские JSON-словари, по одному на локаль
│   ├── en.json
│   └── ru.json
├── messages/
│   ├── const.ts             # имя блока (namespace)
│   ├── en.ts                # per-locale loader: только английский
│   ├── ru.ts
│   └── index.ts             # barrel: реэкспорт по имени + блок
├── adapter.ts               # (опц.) ключ provide/inject и тип адаптера
├── all.ts                   # агрегат всех локалей — демо/e2e/тулинг
└── index.ts                 # реэкспорт adapter + messages
```

### 5.1. Блок (namespace) и словари

`fint-i18n` изолирует ключи по **блокам** (см. `docs/en/blocks.md` в документации `@feugene/fint-i18n`).
Возьмите блок, **уникальный** для пакета, — не `gr` (его занимает ядро), иначе ключи столкнутся при
merge словарей:

```ts
// src/i18n/messages/const.ts
export const MY_PACKAGE_I18N_BLOCK = 'myPkg'
```

Словари — плоские JSON, сгруппированные по компонентам; ключ в UI собирается как
`<block>.<component>.<key>` (напр. `myPkg.thing.submit`):

```jsonc
// src/i18n/locales/en.json
{ "thing": { "submit": "Submit", "remove": "Remove \"{name}\"" } }
```

### 5.2. Per-locale loaders (tree-shaking по языкам)

**Один экспорт на локаль** — это требование бандлера потребителя: только так неиспользуемые языки
вытряхиваются из сборки. Каждый модуль вешает `import()`-loader словаря на свой блок:

```ts
// src/i18n/messages/en.ts
import type { LocaleLoaderCollection } from '@feugene/fint-i18n/core'
import { MY_PACKAGE_I18N_BLOCK } from './const'

export const en = {
  en: { [MY_PACKAGE_I18N_BLOCK]: () => import('../locales/en.json') },
} satisfies LocaleLoaderCollection

export default en
```

```ts
// src/i18n/messages/index.ts  — barrel: реэкспорт по имени, БЕЗ жирного default
export { MY_PACKAGE_I18N_BLOCK } from './const'
export { en } from './en'
export { ru } from './ru'
```

```ts
// src/i18n/all.ts  — агрегат: ТОЛЬКО для демо/e2e/тулинга, не реэкспортить из index.ts
import type { LocaleLoaderCollection } from '@feugene/fint-i18n/core'
import { en } from './messages/en'
import { ru } from './messages/ru'

export const all: LocaleLoaderCollection[] = [en, ru]
export default all
```

> Не реэкспортируйте `all` из `messages/index.ts`: иначе `import { en } from '<pkg>/i18n'` затянет
> обратно `ru`, `de`, … и tree-shaking по языкам сломается.

### 5.3. Как компонент читает перевод

Берите готовый композабл ядра — своего резолвера писать не нужно:

```vue
<!-- src/components/GrMyThing/GrMyThing.vue -->
<script setup lang="ts">
import { useGranularityTranslations } from '@feugene/granularity/composables/useGranularityTranslations'

const { t } = useGranularityTranslations()
</script>

<template>
  <button :aria-label="t('myPkg.thing.submit', 'Submit')">
    {{ t('myPkg.thing.submit', 'Submit') }}
  </button>
</template>
```

Ядро у спутника и так обязательный peer, так что новой зависимости это не создаёт. Так
делают все шесть спутников кольца.

Что композабл берёт на себя:

- **два источника инстанса.** Ищется и абстрактный адаптер ядра
  (`GRANULARITY_I18N_KEY`), и инстанс `fint-i18n` по глобальному символу
  `Symbol.for('FintI18n')`, который кладёт `installI18n(app, i18n)`. Приложение на
  `vue-i18n` или `i18next` отдаёт адаптер по ключу ядра, и пакет его видит;
- **`te()` вместо эвристики.** «Есть ли перевод» спрашивается напрямую, если адаптер
  это умеет. Сравнение `t(key) === key` врёт на словаре, где значение совпадает с
  ключом (технические словари кодов): такой перевод считался бы отсутствующим;
- **`{{`/`}}`-экранирование во fallback** и подстановка `{name}` независимо от того,
  переданы ли параметры, — как в самом `fint-i18n`;
- **`locale`** активного адаптера — для `Intl.*` и `localeCompare`.

Своего резолвера в пакете быть не должно: каждая копия расходится с ядром по этим
четырём пунктам молча.

Нет адаптера — возвращается **fallback-текст**, и UI не ломается: `@feugene/fint-i18n`
остаётся optional peer, прямого импорта из него у пакета нет.

> Ключ (`myPkg.thing.submit`) и fallback (`'Submit'`) держите рядом: fallback обязан совпадать с
> английским словарём, чтобы UI выглядел одинаково с переводом и без него.

### 5.4. `package.json` и `vite.config.ts`

Добавьте `@feugene/fint-i18n` в **optional** peer (перевод — не обязателен для работы компонентов),
два subpath-экспорта (`./i18n` и `./i18n/all` — разные entry, импорт одного не тянет другой) и
i18n-entries в сборку. `sideEffects` не должен блокировать модули `i18n/*`:

```jsonc
// package.json
"exports": {
  "./i18n":     { "types": "./dist/types/i18n/index.d.ts", "import": "./dist/i18n/index.js" },
  "./i18n/all": { "types": "./dist/types/i18n/all.d.ts",   "import": "./dist/i18n/all.js" }
},
"peerDependencies": { "@feugene/fint-i18n": ">=0.9.0 <1.0.0" },
"peerDependenciesMeta": { "@feugene/fint-i18n": { "optional": true } }
```

```ts
// vite.config.ts
const entry = {
  'i18n/index': fileURLToPath(new URL('./src/i18n/index.ts', import.meta.url)),
  'i18n/all': fileURLToPath(new URL('./src/i18n/all.ts', import.meta.url)),
}
// rolldownOptions.external — держите fint-i18n снаружи бандла:
//   /^@feugene\/fint-i18n(\/.*)?$/
```

### 5.5. Как это подключает потребитель

Переводы пакета уходят в **тот же** `createFintI18n`, что и словари приложения и ядра, — потребитель
берёт нужные локали (продакшн) либо агрегат (демо/e2e) и регистрирует блок:

```ts
import { createFintI18n } from '@feugene/fint-i18n/core'
import { installI18n } from '@feugene/fint-i18n/vue'
import { en as granEn, ru as granRu, GRANULARITY_I18N_BLOCK } from '@feugene/granularity/i18n'
import { en as myEn, ru as myRu, MY_PACKAGE_I18N_BLOCK } from '@feugene/my-package/i18n'

const i18n = createFintI18n({
  locale: 'ru',
  fallbackLocale: 'en',
  loaders: [granEn, granRu, myEn, myRu], // одна инфраструктура на все пакеты
})

i18n.registerBlocks([GRANULARITY_I18N_BLOCK, MY_PACKAGE_I18N_BLOCK])
await i18n.loadUsedBlocks('ru')
installI18n(app, i18n) // без этого компоненты останутся на fallback-текстах
```

## 6. Granular-provider

Провайдер — реестр компонентов пакета и его паспорт: по нему плагин строит
раскладку `dist` и пишет манифест, а приложение узнаёт состав пакета и словарь,
против которого написаны его классы.

Доноры объявляются **строками**, а не инстансами. Инстанс в `dependencies` втянул
бы ядро в граф объектной формой — то есть заставил бы приложение сканировать его
`dist` вместо того, чтобы прочитать готовый манифест. Базы раскладки
(`packageBaseUrl`) у манифестной формы нет вовсе: она равна директории манифеста.

```ts
// src/granular-provider/shared.ts
import { defineGranumProvider, type GranumComponentDescriptor, type GranumProvider } from '@feugene/granum/contract'
import { grMyThingConfig } from '../components/GrMyThing/config'

export const MY_PROVIDER_ID = '@feugene/my-package'

/** Словарь утилит, против которого написаны классы компонентов, — тот же, что у ядра. */
export const MY_ENGINE_DIALECT = 'unocss/preset-wind3+granum@66'

/** Реестр — именованной мапой: по ней гейт сверяет состав с файловой системой. */
export const myPackageComponentConfigs = {
  GrMyThing: grMyThingConfig,
} satisfies Record<string, GranumComponentDescriptor>

export function createMyProvider(): GranumProvider {
  return defineGranumProvider({
    id: MY_PROVIDER_ID,
    contractVersion: 1,
    engine: { dialect: MY_ENGINE_DIALECT },
    components: Object.values(myPackageComponentConfigs),
    dependencies: ['@feugene/granularity'],
  })
}
```

```ts
// src/granular-provider/index.ts  (browser-entry)
import { createMyProvider } from './shared'

// Реэкспортом: реестр компонентов — публичная информация о пакете.
export * from './shared'

export const myProvider = createMyProvider()
export default myProvider
```

```ts
// src/granular-provider/node.ts  — алиас browser-entry
export * from './index'
// `export *` не пробрасывает default.
export { default } from './index'
```

Два entry остались подпутём совместимости: FS-aware варианта у манифестной формы
нет, ходить в файловую систему провайдеру больше незачем.

Потребитель подключает провайдер по имени рядом с ядром — читаются манифесты,
`dist` никто не сканирует:

```ts
// granum.config.ts приложения
import { defineGranumConfig } from '@feugene/granum/vite'
import { windEngine } from '@feugene/granum-engine-wind'

export default defineGranumConfig({
  engine: windEngine(),
  providers: ['@feugene/granularity', '@feugene/my-package'],
  components: [{ provider: '@feugene/my-package', names: ['GrMyThing'] }],
  appSources: { dirs: ['src'] },
})
```

## 7. Root barrel

```ts
// src/index.ts
export * from './components/GrMyThing'
```

## 8. Авто-импорт через `unplugin-granularity`

Своего резолвера пакету не нужно. `GranularityResolver()` из `@feugene/unplugin-granularity`
находит в `package.json` приложения все `@feugene/granularity-*` и читает их `exports`: каждый ключ
`./components/<Name>` становится тегом `<Name>` без ручного `import`. От пакета требуется ровно то, что
у него и так есть:

- подпуть `./components/<Name>` на каждый компонент — его пишет `granum codegen`;
- у части составного компонента (`GrSchemaField` у `GrSchemaForm`) — подпуть-алиас на модуль
  владельца: его пишет `granum codegen --subcomponents`, а сборка granum 2.1 записывает части в манифест
  владельца (`subcomponents`). Пакет, собранный granum 2.0, приложение на 2.1 видит без частей: `doctor`
  предупреждает `subcomponents-missing`, guard их импорт не проверяет;
- `./package.json` в `exports`, иначе резолвер не прочитает карту;
- имя пакета вида `@feugene/granularity-<имя>`. Пакет с другим именем потребитель называет сам:
  `GranularityResolver({ packages: ['@feugene/granularity', '@acme/kit'] })`.

Имя компонента, которое уже есть у ядра или другого спутника, резолвер не трогает: импорт такого
компонента потребитель пишет руками. Поэтому имена не повторяют чужие.

`createGranularResolver` — общая фабрика резолвера с явным списком имён — остаётся для пакетов, которые
уже публикуют `./resolver`: с ним рядом единый резолвер работает так же, и порядок регистрации не важен.
Новому пакету `./resolver` заводить незачем.

Подробнее про сам резолвер и его опции — [`unplugin.md`](./unplugin.md).

## 9. Гейты пакета — фабриками, а не копиями

Пять обещаний пакет держит теми же проверками, что ядро: покомпонентные токены объявлены, стилевые
значения берутся из шкалы, все точки регистрации сходятся с файловой системой, `defaults.ts`
дополняет реестр по месту объявления, а у каждого компонента есть страница. Раньше первые четыре были
копиями файлов ядра (~450 строк на пакет) и расходились молча. Теперь — вызовы фабрик из
[`@feugene/granularity-test-kit`](../../granularity-test-kit/README.md):

```ts
// src/__tests__/styleTokens.test.ts
import { defineStyleTokensGate } from '@feugene/granularity-test-kit/gates'

defineStyleTokensGate()
```

```ts
// src/__tests__/componentTokens.test.ts
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'

import { grComponentTokens } from '@feugene/granularity/tokens'
import { defineComponentTokensGate } from '@feugene/granularity-test-kit/gates'
import { grDerivedTokens, grFoundationTokens, grRoleTokens } from '@feugene/granularity-tokens'

// Исходники тем каталога — папка `themes` пакета токенов.
const themesDir = join(dirname(createRequire(join(process.cwd(), 'package.json')).resolve('@feugene/granularity-tokens/package.json')), 'themes')

// Всё, что объявили ядро и пакет токенов, легально как употребление — но не как объявление.
defineComponentTokensGate({
  globalTokens: [...grFoundationTokens, ...grDerivedTokens, ...grRoleTokens, ...grComponentTokens],
  // Инлайновые и хуки ядра (`--gr-affix-offset`) читаются с фолбэком законно.
  globalThemeTokens: [...grFoundationTokens, ...grDerivedTokens, ...grRoleTokens, ...grComponentTokens.filter(token => token.kind === 'theme')],
  themeTokenFallback: true,
  hookLiterals: true,
  themesDirAbsent: true,
  themeKindOnly: true,
  // Только у пакета со своими токенами вида `theme`: разделы тем каталога.
  themeSources: { themesDir, packageId: '@feugene/granularity-my-package' },
})
```

Токен вида `theme` спутник читает **без запасного значения**, хук с литералом по умолчанию несёт в
`tokens.json` причину `literal`: геометрия, ступень `size`, нейтральное значение. Дизайн-решение —
цвет, тень, радиус, толщина линии, прозрачность, длительность, кегль — вид `theme`, и его значение
лежит в **каждой** теме каталога, разделом `components/@feugene/granularity-my-package/<GrX>/`;
пакет спутника — в `targets` этих тем. Токены общего SFC группы (`group`, их реестр —
`components/<Group>/tokens.json`) — раздел группы `components/@feugene/granularity-my-package/<Group>/`:
владельца среди компонентов у них нет, и granum (с 3.11) судит такой раздел по всем компонентам
группы. Признаки и границы таких токенов — [«Токены группы»](../../granularity-tokens/docs/concepts.md#токены-группы)
пакета токенов. Полноту держит гейт тем каталога:

```ts
// src/__tests__/catalogThemes.test.ts
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'

import { defineThemeGate, packageComponentTokens } from '@feugene/granularity-test-kit/gates'
import { grThemeCatalog } from '@feugene/granularity-tokens'
import { loadTheme } from '@feugene/granularity-tokens/theme/node'

const themesDir = join(dirname(createRequire(join(process.cwd(), 'package.json')).resolve('@feugene/granularity-tokens/package.json')), 'themes')

defineThemeGate({
  themeDirs: grThemeCatalog.map(theme => join(themesDir, theme.id)),
  targets: { '@feugene/granularity-my-package': packageComponentTokens() },
  loadTheme: dir => loadTheme(dir),
  // Тема каталога несёт разделы многих пакетов; чужие сверяют их гейты.
  onlyTargets: true,
})
```

Такой спутник требует темы со своими значениями явно — `peerDependencies`:
`"@feugene/granularity-tokens": ">=<минор, где появились значения> <3.0.0"`. Вместе с ним
поднимаются нижние границы механизмов, на которых значения доезжают до страницы: ядро
`>=3.1.0` (каталог тем из пакета токенов) и granum `>=3.10.0` (значения компонентов у темы), а
при разделе группы — `>=3.11.0`. Широкая граница здесь — обещание, которого пакет не держит;
`yarn check:ranges` назовёт такой пакет поимённо. Перевод хука в вид
`theme` — мажор спутника: своя тема без `extends` обязана дать значение, иначе `doctor` назовёт его
находкой `theme-incomplete`.

```ts
// src/__tests__/registry.generated.test.ts
import { defineRegistryGate } from '@feugene/granularity-test-kit/gates'
import { MY_PACKAGE_COMPONENTS } from '../componentNames'
import { myPackageComponentConfigs } from '../granular-provider/shared'

defineRegistryGate({ componentConfigs: myPackageComponentConfigs, componentNames: MY_PACKAGE_COMPONENTS })
```

```ts
// src/__tests__/componentDefaults.test.ts
import { defineComponentDefaultsGate } from '@feugene/granularity-test-kit/gates'

defineComponentDefaultsGate({ registryModule: '@feugene/granularity/composables/useGrComponentConfig' })
```

Путь к реестру указывается **на место объявления**, а не на реэкспорт из корня пакета: через
реэкспорт слияние `componentDefaults` отваливается молча — дефолты просто перестают доезжать,
ничего при этом не падая.

```ts
// src/__tests__/gateCoverage.test.ts
import { defineGateCoverage } from '@feugene/granularity-test-kit/gates'

defineGateCoverage()
```

Тест-кит идёт в `devDependencies` и **не зависит от ядра**: реестры токенов и конфигов приходят
аргументом. Поэтому его же фабрики зовёт само ядро, а направление зависимостей остаётся
односторонним. Реестр глобальных токенов спутник берёт у `@feugene/granularity-tokens` — тоже
`devDependency`: в рантайме CSS спутника читает `var(--gr-*)`, и пакет токенов ему не нужен.

Гейты читают собранный `dist` тест-кита — как витрина читает собранный `dist` ядра. Корневые
`test:*` и `typecheck:*` собирают его сами; при прямом `yarn workspace <pkg> test:run` он должен быть
собран (`yarn build:test-kit`).

Пятая фабрика — `defineComponentDocsGate`: страница есть у каждого компонента реестра,
сирот нет, обе обязательные секции на месте, редиректы ведут в живые файлы, имя стоит
ссылкой в индексе. Подключается так же:

```ts
// src/__tests__/componentDocs.test.ts
import { defineComponentDocsGate } from '@feugene/granularity-test-kit/gates'

defineComponentDocsGate()
```

Всё остальное — гейты своего домена — пишется пакетом самостоятельно: они у каждого разные по существу.

Оснастку для них тест-кит отдаёт тремя подпутями, разведёнными **по peer**, чтобы тяжёлый достался
только тому, кто его просил: `./vue` (`queryOne`, `stubElementRects`, `nextFrame`, `fintI18nGlobal`),
`./a11y` (`axeViolations` — отдельно, потому что `axe-core` есть не у всех) и `./e2e` (модель
a11y-гейта, зафиксированный долг, обход по `Tab`, ожидание конца анимации). Peer у всех трёх
опциональные.

```ts
// src/__tests__/a11y.test.ts
import { axeViolations } from '@feugene/granularity-test-kit/a11y'

expect(await axeViolations(wrapper.element as Element)).toEqual([])
```

## 9.1. Документация пакета

Сквозные доки (`docs/model.md`, `docs/a11y.md`, `docs/keyboard.md`, `docs/theming.md`,
`docs/ssr.md`) описывают пакет целиком. Плюс **страница на каждый публичный компонент** —
`docs/components/<Name>.md`, та же раскладка, что в ядре, и тонкий индекс
`docs/components.md` со списком ссылок.

Без страниц компонент спутника выбрать нельзя: у ядра есть каталог, у спутника —
только таблица «Состав» в `README.md`, а она отвечает «что это», но не «когда это
вместо соседа».

Жанр страницы, обязательные секции и запрет на рукописные перечни пропов описаны один
раз — в `packages/granularity/docs/components.md`, раздел «Страница компонента».
**В индексе спутника путь к нему пишется простым текстом, не ссылкой:** относительная
ссылка в чужой пакет ломается в опубликованном тарболе, где рядом лежит только `dist`
установленной зависимости. Копировать спецификацию в каждый пакет нельзя по той же
причине, по которой гейты стали фабриками, — четыре копии разойдутся.

Компоненты спутника попадают и в `docs/COMPONENT-MAP.md` в корне репозитория: карта
выбора кросс-пакетная, иначе потребитель не узнает, что нужный ему компонент лежит в
соседнем пакете.

## 10. Сборка и публикация

```bash
yarn workspace @feugene/my-package build
npx --yes publint@latest --pack npm   # проверка соответствия exports ↔ dist
```

`publint` должен сказать `All good!` — тогда `exports` и реальные файлы `dist` согласованы. Для релиза
используйте отдельный тег вида `my-package-v<semver>` (по образцу `unplugin-granularity-v*` в
`.github/workflows/ci.yml`), чтобы публиковать спутник независимо от ядра.

## Чеклист

- [ ] `package.json`: `type: module`, `sideEffects: ["**/*.css"]`, пер-компонентные `exports`, peer на ядро.
- [ ] `vite.config.ts`: `granumProvider({ provider, engine: windEngine(), entries })`, `libInjectCss`, `external` на peers и тяжёлые deps, своего `build.lib` нет.
- [ ] `granum.manifest.json` в `exports` сразу за `"."`; `granum.config.mjs` + скрипт `doctor` прямым вызовом `granum doctor --strict`.
- [ ] Компоненты `Gr*` + `config.ts` (`defineGranumComponent`), общие хелперы в `components/shared/`, темизация через DS-токены.
- [ ] (Опц., если есть встроенные строки) `src/i18n`: уникальный блок (не `gr`), per-locale loaders, `all.ts` вне barrel; экспорты `./i18n` + `./i18n/all`, `fint-i18n` — optional peer; компоненты читают перевод через резолвер с fallback.
- [ ] Granular-provider: `shared.ts` с диалектом движка и реестром-мапой, доноры строками, browser/node entry; в приложении подключается по имени пакета.
- [ ] `exports` объявляет `./package.json` и подпуть `./components/<Name>` на каждый компонент — по ним `GranularityResolver()` находит компоненты пакета.
- [ ] Гейты: восемь фабрик из `@feugene/granularity-test-kit/gates` (актуальный список — `REQUIRED_GATES` в `gates/coverage.ts`, его же сверяет `defineGateCoverage`); свои гейты домена — рядом.
- [ ] Доки: сквозные `model` / `a11y` / `keyboard` / `theming` / `ssr`, страница на каждый компонент в `docs/components/`, индекс `docs/components.md`, компоненты в развилках `docs/COMPONENT-MAP.md`.
- [ ] `build` зелёный, `publint` — `All good!`.
