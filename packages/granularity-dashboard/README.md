# `@feugene/granularity-dashboard`

Сетка виджетов для дизайн-системы [`@feugene/granularity`](../granularity/): перетаскивание,
растягивание, брейкпоинты и раскладка, которая переживает перезагрузку. Без единой зависимости —
коллизии, компактизация и геометрия сетки это арифметика над целыми числами.

```bash
yarn add @feugene/granularity-dashboard
```

## Что внутри

| Компонент | Зачем |
| --- | --- |
| `GrDashboard` | сетка: раскладка, брейкпоинты, режимы просмотра и редактирования |
| `GrDashboardItem` | виджет на сетке поверх `GrCard` ядра |
| `GrDashboardToolbar` | переключатель режима и сброс раскладки |
| `GrDashboardPalette` | каталог виджетов, которые можно добавить |
| `useDashboardLayout` | сохранение и восстановление раскладки |
| `./layout` | чистая арифметика раскладки: ни Vue, ни DOM |

## Как это выглядит

```vue
<script setup lang="ts">
import {
  GrDashboard,
  GrDashboardItem,
  GrDashboardToolbar,
  localStorageLayoutStorage,
  useDashboardLayout,
} from '@feugene/granularity-dashboard'
import { ref } from 'vue'

const mode = ref<'view' | 'edit'>('view')

const { layout, reset } = useDashboardLayout({
  initial: {
    lg: [
      { id: 'revenue', x: 0, y: 0, w: 8, h: 3 },
      { id: 'funnel', x: 8, y: 0, w: 4, h: 3, minW: 3 },
    ],
  },
  storage: localStorageLayoutStorage(),
  key: 'analytics',
})
</script>

<template>
  <GrDashboardToolbar v-model:mode="mode" resettable @reset="reset" />

  <GrDashboard v-model:layout="layout" :mode="mode">
    <GrDashboardItem item-id="revenue" title="Выручка">
      <RevenueChart />
    </GrDashboardItem>
    <GrDashboardItem item-id="funnel" title="Воронка" :min-w="3">
      <FunnelChart />
    </GrDashboardItem>
  </GrDashboard>
</template>
```

## Подключение

### CSS

Пакет перечисляется именем, рядом с ядром: `granum` читает
`dist/granum.manifest.json` каждого через `exports`, а не сканирует
`node_modules`.

```ts
// granum.config.ts
import { defineGranumConfig } from '@feugene/granum/vite'
import { windEngine } from '@feugene/granum-engine-wind'

export default defineGranumConfig({
  engine: windEngine(),
  providers: ['@feugene/granularity', '@feugene/granularity-dashboard'],
  components: ['@feugene/granularity-dashboard:GrDashboard'],
})
```

Классы компонентов написаны против словаря `unocss/preset-wind3+granum@66`.
Движок другого диалекта заставит `granum` сообщить `provider-dialect-mismatch` и
перечислить отброшенные классы, а не отрисовать сетку наполовину.

### Авто-импорт

Резолвер пакета ставится **перед** жадным `GranularityResolver()` ядра: компоненты начинаются с
того же префикса `Gr*`, и жадный резолвер перехватил бы их.

```ts
import { GranularityDashboardResolver } from '@feugene/granularity-dashboard/resolver'
import { GranularityResolver } from '@feugene/unplugin-granularity'

Components({ resolvers: [GranularityDashboardResolver(), GranularityResolver()] })
```

### Переводы

```ts
import { GRANULARITY_I18N_BLOCK, en as coreEn, ru as coreRu } from '@feugene/granularity/i18n'
import { GR_DASHBOARD_I18N_BLOCK, en, ru } from '@feugene/granularity-dashboard/i18n'

const i18n = createFintI18n({ locale: 'ru', loaders: [coreEn, coreRu, en, ru] })
i18n.registerBlocks([GRANULARITY_I18N_BLOCK, GR_DASHBOARD_I18N_BLOCK])
```

Без адаптера компоненты показывают английский текст, а не ключи.

## Вес гранулярного импорта

<!-- entry-sizes:generated:start lang=ru -->
| Что берут | gzip | от бареля |
| --- | ---: | ---: |
| весь пакет из корня | 25.7 kB | 100 % |
| самый лёгкий компонент — `GrDashboardToolbar` | 1.7 kB | 7 % |
| медианный компонент — `GrDashboardItemSettings` | 5.2 kB | 20 % |
| 5 самых тяжёлых вместе | 22.3 kB | 87 % |

Числа **не складываются**: общий код посчитан в каждой строке заново, а платится один раз —
поэтому набор компонентов и показан объединением, а не суммой. Это верхняя граница: gzip всего,
что подпуть тянет из `dist`, а бандлер приложения трясёт дальше и минифицирует повторно.

Вес каждого компонента — [`docs/entry-sizes.md`](./docs/entry-sizes.md).
<!-- entry-sizes:generated:end -->

## Документация

| Файл | О чём |
| --- | --- |
| [`docs/model.md`](./docs/model.md) | модель раскладки, компактизация, брейкпоинты, сохранение |
| [`docs/keyboard.md`](./docs/keyboard.md) | карта клавиш |
| [`docs/a11y.md`](./docs/a11y.md) | роли, имена, что произносится |
| [`docs/theming.md`](./docs/theming.md) | токены пакета |
| [`docs/ssr.md`](./docs/ssr.md) | серверный рендер |

## Границы

Пакет не рисует содержимое виджета и не ходит за данными — это дело приложения. Графики —
[`@feugene/granularity-charts`](../granularity-charts/), время —
[`@feugene/granularity-chrono`](../granularity-chrono/). Конструктором отчётов пакет не является.
