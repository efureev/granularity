# playground-9 — композит `@feugene/extra-granularity` + примитивы `@feugene/granularity`

Это приложение демонстрирует, **как сочетать в одном проекте композитный
компонент из верхнего пакета** (`@feugene/extra-granularity`) **и прямые
импорты примитивов** из рантайма (`@feugene/granularity`), не теряя
гранулярность и tree-shaking.

Используется всё сразу:

1. **Композитный компонент** `XgQuickForm` из пакета
   [`@feugene/extra-granularity`](../../packages/extra-granularity) —
   собран из трёх примитивов granularity: `DsFormField`, `DsInput`,
   `DsButton`.
2. **Прямые импорты примитивов** `DsButton` и `DsCard` из корневой
   точки входа `@feugene/granularity` — показывают, что barrel-импорт из
   корня пакета тоже tree-shakeable (благодаря `sideEffects: ["**/*.css"]`
   в рантайм-пакете).
3. **Авто-импорт `Ds*`** через
   [`@feugene/unplugin-granularity`](../../packages/unplugin-granularity)
   поверх `unplugin-vue-components` (как в `playground-8`) — на случай,
   если в шаблонах появятся ещё `Ds*`, не упомянутые в `<script setup>`.
4. **UnoCSS + `presetGranularityNode`** — токены тем и preflight-ы
   именно тех примитивов, что реально используются (как в
   `playground-5`). Никаких `foundation.css` /
   `components/<Name>/styles.css` руками.

## Зачем здесь два уровня абстракции

- `@feugene/granularity` остаётся **минимальным рантаймом** из атомарных
  `Ds*`-примитивов.
- `@feugene/extra-granularity` — слой выше: уже готовые сценарии (формы,
  списки, диалоги), собранные из тех же примитивов. У него собственный
  релизный цикл и `peerDependency` на granularity, так что версии можно
  двигать независимо.
- В приложении обычно **нужны оба уровня одновременно**: композиты для
  типовых сценариев и «голые» примитивы для всего остального (кнопка
  действия, карточка-обёртка, иконка и т. п.). Этот playground
  показывает, что такое сочетание не ломает tree-shaking ни на одном из
  уровней.

## Что делает приложение

- Форма «добавить задачу» из композита `XgQuickForm` (v-model +
  `@submit`): одно поле ввода с лейблом и ошибкой, кнопка `Submit`.
- Список добавленных значений ниже.
- Демонстрационная секция `DsCard` с `DsButton` внутри — импортированы
  напрямую из корня `@feugene/granularity` (`import { DsButton, DsCard }
  from '@feugene/granularity'`).

## Как это устроено

### `src/App.vue`

```vue
<script setup lang="ts">
import { ref } from 'vue'
// Композит — всегда явным sub-path импортом.
import { XgQuickForm } from '@feugene/extra-granularity/components/XgQuickForm'
// Примитивы можно и из корня — barrel tree-shake'ается rollup'ом.
import { DsButton, DsCard } from '@feugene/granularity'

const items = ref<string[]>([])
const error = ref<string | undefined>(undefined)

function onSubmit(value: string) {
  if (!value) return (error.value = 'Поле не может быть пустым')
  error.value = undefined
  items.value.unshift(value)
}
</script>

<template>
  <XgQuickForm
    label="Добавить задачу"
    placeholder="Введите текст и нажмите Enter…"
    submit-label="Добавить"
    :error="error"
    @submit="onSubmit"
  />
  <!-- Прямое использование примитивов из корня granularity. -->
  <DsCard class="p-4">
    <DsButton>test</DsButton>
  </DsCard>
</template>
```

### `vite.config.ts`

```ts
import Components from 'unplugin-vue-components/vite'
import UnoCSS from 'unocss/vite'
import { GranularityResolver } from '@feugene/unplugin-granularity'

export default defineConfig({
  plugins: [
    vue(),
    UnoCSS({ configFile: './uno.config.ts' }),
    Components({
      dts: './components.d.ts',
      // В этом playground'е директив нет — отключаем их авто-импорт.
      resolvers: [GranularityResolver({ directives: false })],
    }),
  ],
})
```

### `uno.config.ts`

```ts
import { defineConfig, presetMini } from 'unocss'
import { presetGranularityNode } from '@feugene/granularity/uno-node'

export default defineConfig({
  presets: [
    presetMini(),
    presetGranularityNode({
      // Ровно те примитивы, что реально используются в приложении
      // (и внутри XgQuickForm, и напрямую).
      components: ['DsFormField', 'DsInput', 'DsButton', 'DsCard'],
      layer: 'granularity',
    }),
  ],
})
```

### `src/granularity.ts`

```ts
// Preflights примитивов + токены тем — из preset'а.
import 'virtual:uno:granularity.css'
// Стили композита — единственный CSS-импорт из extra-granularity.
import '@feugene/extra-granularity/components/XgQuickForm/styles.css'
```

## Когда выбирать такой подход

- Когда в приложениях повторяются **одни и те же связки** примитивов
  (форма-инпут-кнопка, карточка-списком, диалог-подтверждения, …) — их
  логично вынести в общий пакет над granularity.
- Когда хочется **свой UI-kit поверх дизайн-системы**, не раздувая
  `granularity` «толстыми» компонентами.
- Когда разные команды/проекты зависят от одного набора композитов, но
  релиз рантайма должен быть независимым.

## Нюансы и подводные камни

- 🟢 **Barrel-импорт из корня `@feugene/granularity`** работает
  без потери tree-shaking: `sideEffects: ["**/*.css"]` в рантайм-пакете
  позволяет rollup выбросить все неиспользуемые re-export'ы. В бандле
  остаются только реально использованные примитивы. Если вы видите в
  сборке «лишние» `Ds*` — проверяйте, что ваш сборщик уважает
  `sideEffects`.
- 🟢 **Tree-shaking по CSS**: в `granularity-*.css` только layer
  `granularity` для примитивов из whitelist `presetGranularityNode`.
  Поэтому whitelist должен перечислять все примитивы, реально
  используемые — **включая те, что вы импортируете напрямую из корня
  пакета**, а не только те, что внутри композитов.
- 🟡 **Композиты `Xg*` не резолвятся `GranularityResolver`-ом** по
  умолчанию — импортируйте их явно sub-path'ом
  (`@feugene/extra-granularity/components/<Name>`), либо напишите
  собственный резолвер для `@feugene/extra-granularity`.
- 🟡 **`GranularityResolver` дополняет прямые импорты, а не заменяет их**.
  Если вы уже импортировали `DsButton` в `<script setup>`, он попадёт в
  бандл один раз — второй импорт от резолвера не создаётся. Два способа
  регистрации мирно сосуществуют.
- 🟡 **Whitelist `presetGranularityNode`** должен совпадать с тем, что
  реально используется (в композитах + напрямую). Если добавили
  `<DsModal>` — добавьте его и в `components: [...]` конфига UnoCSS,
  иначе preflight-ов не будет.
- 🔴 **В `extra-granularity` не переносите примитивы.** Всё, что можно
  сделать одним `Ds*`, должно оставаться в `granularity`.

## Скрипты

```bash
yarn workspace @feugene/granularity-playground-9 dev
yarn workspace @feugene/granularity-playground-9 build
```

## Проверка tree-shaking

После production-сборки (`yarn workspace … build`) в `dist/assets`
встречаются только реально использованные примитивы и композиты. Пример
текущей сборки:

```
dist/assets/granularity-*.js   → внутри найдены имена DsFormField, DsInput, DsButton
dist/assets/index-*.js         → DsFormField, DsInput, DsButton, XgQuickForm
dist/assets/vue-*.js           → { }
```

Других `Ds*` (DsAlert, DsBadge, DsModal, DsDrawer, …) и директив в
бандле нет — контракт «три примитива внутри композита + явные
`DsButton`/`DsCard` снаружи + один композит `XgQuickForm`» выполняется.

> Если в вашей сборке не находится след от `DsCard`, несмотря на его
> импорт в `<script setup>`, — это ожидаемо: rollup может минифицировать
> идентификаторы имён SFC. Для честной проверки ищите не только имена
> экспортов, но и class-селекторы вида `ds-card` в `dist/assets/*.css`.
