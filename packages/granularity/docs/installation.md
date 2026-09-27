# Установка и подключение

Этот пакет — [`@feugene/granularity`][granularity-repo] —
дизайн-система на `Vue 3`, собранная конвейером [`@feugene/granum`][granum].
Единственный поддерживаемый и документированный способ подключения — плагин
`granum()` из [`@feugene/granum/vite`][granum] и `granum.config.ts`
приложения; провайдер подключается по имени пакета, а его
`granum.manifest.json` плагин находит через `exports`.

Остальные варианты (прямые CSS-импорты, root import со «всем сразу», подключение
`styles.css` и т.п.) не поддерживаются и в этой инструкции не описываются.

> Общие принципы (контракт провайдера, слои каскада, обрезка токенов,
> диагностика) описаны в документации granum:
> [`granum/docs/ru/getting-started.md`][granum-getting-started] и
> [`granum/docs/ru/usage-in-apps.md`][granum-usage].

## Требования

- **Node ≥ 22**
- **ESM only** (`"type": "module"` в `package.json` приложения)
- [`vue`][vue] `^3` — peer-зависимость пакета (устанавливает приложение).
- [`@floating-ui/dom`][floating-ui] `^1.8` — **обязательная** runtime
  peer-зависимость пакета (устанавливает приложение).
- [`@feugene/granum`][granum] `≥ 0.2 < 1` — peer-зависимость пакета
  (устанавливает приложение, на build-time).
- `@feugene/granum-engine-mini` `^0.2` — движок утилит; тоже ставит приложение.
  Своей реализации движка в granum нет, и словарь классов выбирает тот, кто
  отвечает за результат сборки, то есть приложение.
- [`vite`][vite] `^8` — peer-зависимость granum: плагин живёт в сборке
  приложения.

## Установка

В **приложении**:

```bash
yarn add vue @feugene/granularity @floating-ui/dom
yarn add -D @feugene/granum @feugene/granum-engine-mini
```

Почему `@feugene/granularity` стоит в `dependencies`:

- компоненты и директивы пакета импортируются из исходников приложения и
  попадают в runtime-бандл.

Почему `@floating-ui/dom` стоит в `dependencies` приложения, а не внутри пакета:

- на нём построено позиционирование (`GrDropdown`, `GrSelect`, `GrAutocomplete`,
  `GrTreeSelect`, `GrTooltip`, `GrPopover`), то есть библиотека исполняется в
  рантайме приложения;
- пакет держит её в `external` и не бандлит внутрь `dist`. Иначе приложение,
  которое само использует floating-ui, получало бы вторую копию.

Установить его нужно **обязательно**: без него приложение упадёт на первом же
импорте выпадающего списка.

Модальный слой (`GrModal`, `GrDialog`, `GrDrawer`, `GrImageViewer`,
`GrCommandPalette`) внешних зависимостей не требует вовсе: ловушка фокуса,
`inert` для фона, порядок Esc и возврат фокуса — собственные примитивы пакета
(`useFocusTrap`, `useOverlayLayer`).

Почему `@feugene/granum` стоит в `devDependencies`:

- он выполняется исключительно на build-time (плагин Vite плюс
  `granum.config.ts`) и ни одной строкой не попадает в итоговый бандл
  приложения. Единственное исключение — `@feugene/granum/runtime`
  (переключение тем): если он вам нужен, пакет переезжает в `dependencies`.

Почему пакетов два, а не один: granum — это конвейер (резолвер, слои каскада,
манифесты, отчёт), а реализации движка утилит в нём нет вовсе. Движок решает,
какой класс во что превращается, — то есть отвечает за результат, — поэтому его
выбирает приложение и передаёт **инстансом**. `@feugene/granum-engine-mini` —
реализация по умолчанию: `preset-mini` плюс доп-правила, на которых нарисованы
компоненты пакета. Движок обязан объявлять тот же словарь, что и пакет
(`unocss/preset-mini+granum@66`), иначе granum скажет
`provider-dialect-mismatch` и перечислит классы, которые пришлось выбросить —
см. [«Словарь утилит» в `granum.md`](./granum.md#словарь-утилит-диалект-и-отпечаток).

Провайдер приложению импортировать не нужно вовсе: плагин читает
`granum.manifest.json` пакета через его `exports`, а код пакета ради
резолюции не исполняет.

## Базовый `granum.config.ts`

Самый минимальный рабочий конфиг — движок, имя пакета в `providers` и
директории исходников приложения. Никаких `components`, `themes`,
`pruneTokens` пока нет:

```ts
import { defineGranumConfig } from '@feugene/granum/vite'
import { miniEngine } from '@feugene/granum-engine-mini'

export default defineGranumConfig({
  engine: miniEngine(),
  providers: ['@feugene/granularity'],
  appSources: { dirs: ['src'] },
})
```

Что это уже даёт:

- утилиты генерирует `miniEngine()` — `preset-mini` плюс доп-правила пакета;
  `engine` единственное обязательное поле конфига, опустить его нельзя;
- в сборку подмешиваются `tokens.css`, `base.css` и тема `light` пакета;
- включены все компоненты, объявленные в провайдере (эквивалент
  `components: 'all'` по умолчанию), их CSS и safelist;
- классы разметки самого приложения извлекаются из `appSources`.

Дальнейшие секции показывают, как **наращивать** этот базовый пример
опциями по мере необходимости. Все эти опции — необязательные.

## Иконки

**Свои иконки пакет привозит с собой.** Стрелка селекта, крестик очистки,
галочка выбранной опции, спиннер, ручка переноса — всё это компилируется в
`dist` при сборке пакета. Ставить `unplugin-icons` или коллекцию иконок ради
них не нужно, и от вашего `uno.config.ts` они не зависят.

**Своя иконка приходит двумя способами.** Пропы `icon` (`GrTabs`,
`GrBreadcrumbs`, `GrStatistic`, `GrSidebarItem`, `GrBottomNav`,
`GrCommandPalette`, `GrRating`, `GrTree`) принимают либо Vue-компонент, либо
класс иконки:

```vue
<script setup>
import IconUser from '~icons/lucide/user'
</script>

<template>
  <!-- Компонент: работает всегда, ничего настраивать не нужно. -->
  <GrTabs :tabs="[{ value: 'a', label: 'Профиль', icon: IconUser }]" />

  <!-- Класс: CSS для него генерирует ВАШ конфиг, см. ниже. -->
  <GrTabs :tabs="[{ value: 'a', label: 'Профиль', icon: 'i-lucide-user' }]" />
</template>
```

Класс `i-lucide-*` — утилита, и делает её не пакет, а ваша сборка.
`miniEngine()` правил иконок не знает, а поля для правил у конфига granum нет:
правила приложения передаются фабрике движка — `miniEngine({ rules: [...] })`.

Поэтому рабочих вариантов два: передавать иконку Vue-компонентом (работает без
настройки) либо завести правило самому — своё правило фабрике или движок,
который умеет иконки. Подробнее —
[«Иконки классом» в `granum.md`](./granum.md).

Без правила класс останется классом: место под иконку будет, картинки не будет,
и сборка при этом пройдёт молча — но granum назовёт такой класс в отчёте
(`classes.unmatched`), а не проглотит. Со стороны пакета границу держит гейт
`src/__tests__/iconContract.test.ts` — он не даёт собственным иконкам пакета
снова уехать в классы.

### Сужаем список компонентов

Чтобы не тянуть в бандл CSS всех компонентов — явно выбираем нужные:

```ts
defineGranumConfig({
  engine: miniEngine(),
  providers: ['@feugene/granularity'],
  components: [
    { provider: '@feugene/granularity', names: ['GrButton'] },
  ],
  appSources: { dirs: ['src'] },
})
```

Зависимости компонента дописывать не нужно: селекция замыкается транзитивно по
графу из манифеста. Импорт компонента вне селекции ловит `js.guard` — по
умолчанию ошибкой сборки, а не голым рендером.

### Темы

По умолчанию активны темы, объявленные провайдером в `defaultThemes` (у пакета
это `light`). Возьмём обе:

```ts
defineGranumConfig({
  engine: miniEngine(),
  providers: ['@feugene/granularity'],
  components: [{ provider: '@feugene/granularity', names: ['GrButton'] }],
  themes: { names: ['light', 'dark'] },
})
```

Своя тема приложения задаётся здесь же — `themes.define` с `extends` или
`tokensRef`; переопределение отдельных значений — `themes.tokenOverrides`.
Подробности — в [`theming.md`](./theming.md).

### Обрезка неиспользуемых токенов

Пакет объявляет больше двух сотен токенов, и приложению редко нужны все:

```ts
defineGranumConfig({
  engine: miniEngine(),
  providers: ['@feugene/granularity'],
  components: [{ provider: '@feugene/granularity', names: ['GrButton'] }],
  appSources: { dirs: ['src'] },
  pruneTokens: { mode: 'on' },
})
```

Порядок внедрения — `mode: 'report'`, посмотреть план в
`dist/granum-report.json`, затем `'on'`. `appSources` при этом обязателен:
токен, который приложение взяло само, иначе уедет из CSS при зелёной сборке.

### Сканирования `node_modules` больше нет

На пресете v1 приложение должно было объяснить экстрактору, где лежат
собранные чанки компонентов (`granularContent`, `content.filesystem`) — в granum
этого канала нет вовсе: классы компонентов и потребляемые ими токены посчитаны
на сборке пакета и лежат в `granum.manifest.json`. Приложение объявляет только
свои исходники — `appSources`.

Все доступные опции (`engine`, `components`, `themes`, `appSources`, `css`,
`js`, `pruneTokens`, `report`) описаны в [`granum.md`](./granum.md) и
[документации granum][granum-usage].

## Подключение к `Vite`

```ts
// vite.config.ts
import { granum } from '@feugene/granum/vite'
import Vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

import granumConfig from './granum.config'

export default defineConfig({
  plugins: [
    Vue(),
    granum(granumConfig),
  ],
})
```

В точке входа приложения импортируется виртуальный CSS плагина — один модуль
со всеми пятью слоями каскада:

```ts
// main.ts
import '@unocss/reset/tailwind-compat.css'
import 'virtual:granum.css'

import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')
```

Готовый пример такой связки — в `apps/showcase` и `apps/playground-5`
этого репозитория.

Каркас приложения целиком — со всеми файлами, точкой входа и вариантом для
серверного рендера — в [`./getting-started.md`](./getting-started.md).

## Опциональные интеграции

Следующие вспомогательные пакеты не обязательны, но часто используются
вместе с `@feugene/granularity`:

- [`@feugene/unplugin-granularity`](../../unplugin-granularity/README.md) —
  авто-импорт компонентов и директив пакета в шаблонах `Vue` (build-time
  резолвер для [`unplugin-vue-components`][unplugin-vue-components]).
  Подробности — в [`./unplugin.md`](./unplugin.md).
- `createGranularity` из пакета — runtime-адаптер, единый bootstrap-вход
  для директив, `provide`, `app.config.globalProperties`. Подробности —
  в [`./vue-plugin.md`](./vue-plugin.md).

Оба варианта дополняют основной способ установки и не заменяют его.

## Ссылки

- Репозиторий пакета: <https://github.com/efureev/granularity>
- Конвейер, которым собран пакет: [`@feugene/granum`][granum]
  ([docs/ru][granum-docs])
- [`vite`][vite]
- [`vue`][vue]
- [`@floating-ui/dom`][floating-ui]
- [`unplugin-vue-components`][unplugin-vue-components]

[granularity-repo]: https://github.com/efureev/granularity
[granum]: https://github.com/efureev/granum
[granum-docs]: ../../../../granum/docs/ru/README.md
[granum-getting-started]: ../../../../granum/docs/ru/getting-started.md
[granum-usage]: ../../../../granum/docs/ru/usage-in-apps.md
[vite]: https://github.com/vitejs/vite
[vue]: https://github.com/vuejs/core
[floating-ui]: https://github.com/floating-ui/floating-ui
[unplugin-vue-components]: https://github.com/unplugin/unplugin-vue-components
