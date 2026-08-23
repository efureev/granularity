# @feugene/granularity-charts

Графики для дизайн-системы [`@feugene/granularity`](https://github.com/efureev/granularity): свой SVG, ноль
зависимостей, рисунок собирается **токенами темы**, а не палитрой вендора — переключение light/dark ничего не
пересоздаёт.

```bash
yarn add @feugene/granularity-charts
```

## Состав

| Компонент | Зачем |
| --- | --- |
| `GrChartArea` | тот же ряд с заливкой до нуля — и складываемый в стек: целое и вклад каждой части |
| `GrChartBar` | величины по категориям: рядом, стопкой или долями до ста процентов |
| `GrChartLine` | ряд во времени или по категориям: оси, сетка, легенда, тултип, клавиатура, скрытая таблица данных |
| `GrChartRadar` | профиль по нескольким осям и сравнение профилей: две шкалы осей, паутина или окружности |
| `GrChartPie` | доли одного целого — кругом или кольцом: угловое попадание, подписи на выносках, легенда со значениями |
| `GrSparkline` | линия без рамы — в ячейку таблицы, в карточку показателя |

Плюс арифметика отдельным subpath — по ней строят свою разметку, когда готового компонента не хватает:

```ts
import { linearTicks, normalizeChartData } from '@feugene/granularity-charts/chart'
import { useChartScale } from '@feugene/granularity-charts/composables/useChartScale'
```

## Подключение

```ts
// uno.config.ts
import granularityProvider from '@feugene/granularity/granular-provider/node'
import granularityChartsProvider from '@feugene/granularity-charts/granular-provider/node'

presetGranularNode({
  providers: [granularityProvider, granularityChartsProvider],
  components: 'all',
})
```

```ts
// vite.config.ts — авто-импорт
import { GranularityResolver } from '@feugene/unplugin-granularity'
import { GranularityChartsResolver } from '@feugene/granularity-charts/resolver'

Components({
  resolvers: [
    GranularityChartsResolver(), // whitelist — раньше…
    GranularityResolver(), // …жадного Gr*-резолвера ядра
  ],
})
```

Локали подключаются вместе со словарём ядра:

```ts
import { en, GR_CHARTS_I18N_BLOCK, ru } from '@feugene/granularity-charts/i18n'
```

## Доки

- [`docs/model.md`](./docs/model.md) — форма данных, шкалы, деления, что считается пропуском;
- [`docs/a11y.md`](./docs/a11y.md) — роли, объявления, скрытая таблица;
- [`docs/keyboard.md`](./docs/keyboard.md) — карта клавиш, края ряда, различия типов графиков;
- [`docs/theming.md`](./docs/theming.md) — токены пакета, палитра серий, различители помимо цвета;
- [`docs/ssr.md`](./docs/ssr.md) — первый рендер от объявленной ширины.

## Границы

Без 3D, без географии (это карта) и без аннотаций. Приближение по абсциссе есть — проп `zoom` у `GrChartLine` и
`GrChartArea`: протяжка, колесо и клавиатура (`+`/`-`, `Shift`+стрелки, `0`), причём клавиатура не отключается.
Порог SVG — около 2 000 точек на серию; canvas-путь за тем же API придёт позже.
