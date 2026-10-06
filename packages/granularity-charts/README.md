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
// granum.config.ts
import { defineGranumConfig } from '@feugene/granum/vite'
import { windEngine } from '@feugene/granum-engine-wind'

export default defineGranumConfig({
  engine: windEngine(),
  providers: ['@feugene/granularity', '@feugene/granularity-charts'],
  components: 'all',
  appSources: { dirs: ['src'] },
})
```

Оба пакета — по имени, а не импортированными объектами: каждый отгружает свой
`granum.manifest.json`, и granum читает его вместо скана `dist`. Ядро нужно в
списке и само по себе: от него приезжают токены, база и темы.

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

## Вес гранулярного импорта

<!-- entry-sizes:generated:start lang=ru -->
| Что берут | gzip | от бареля |
| --- | ---: | ---: |
| весь пакет из корня | 77.1 kB | 100 % |
| самый лёгкий компонент — `GrSparkline` | 8.4 kB | 11 % |
| медианный компонент — `GrChartBar` | 28.8 kB | 37 % |
| 5 самых тяжёлых вместе | 51.8 kB | 67 % |

Числа **не складываются**: общий код посчитан в каждой строке заново, а платится один раз —
поэтому набор компонентов и показан объединением, а не суммой. Это верхняя граница: gzip всего,
что подпуть тянет из `dist`, а бандлер приложения трясёт дальше и минифицирует повторно.

Вес каждого компонента — [`docs/entry-sizes.md`](./docs/entry-sizes.md).
<!-- entry-sizes:generated:end -->

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
