import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { granumProvider } from '@feugene/granum/build'
import { windEngine } from '@feugene/granum-engine-wind'

import { granularityChartsProvider } from './src/granular-provider'

/**
 * Build-конфиг пакета `@feugene/granularity-charts`.
 *
 * — `vue`, `@feugene/granularity` и `@feugene/granum` остаются external
 *   (peer-зависимости) — пакет не дублирует их рантайм;
 * — собственных runtime-зависимостей нет: шкалы, деления и раскладка это
 *   обычная арифметика, форматирование даёт `Intl`;
 * — арифметика (`chart/`) и композаблы отдаются своими entry: их берут и без
 *   компонентов — например чтобы посчитать деления для своей разметки.
 *
 * Раскладку `dist` и entry компонентов ведёт `granumProvider()`: он строит их
 * из реестра провайдера, извлекает классы и потребляемые токены по графу
 * бандла и пишет `dist/granum.manifest.json`. Руками их больше не перечисляют,
 * поэтому сгенерированного блока entry в этом файле нет.
 */

/**
 * Entry, которые строит не плагин: слои пакета и служебные точки входа. Entry
 * компонентов и `index` `granumProvider()` собирает сам из реестра провайдера.
 */
const extraEntries: Record<string, string> = {
  'granular-provider': 'src/granular-provider/index.ts',
  'granular-provider-node': 'src/granular-provider/node.ts',
  'resolver': 'src/resolver.ts',
  'chart/index': 'src/chart/index.ts',
  'composables/useChartScale': 'src/composables/useChartScale.ts',
  'composables/useChartTicks': 'src/composables/useChartTicks.ts',
  'composables/useChartTooltip': 'src/composables/useChartTooltip.ts',
  'i18n/index': 'src/i18n/index.ts',
  'i18n/all': 'src/i18n/all.ts',
}

export default defineConfig({
  plugins: [
    vue(),
    /*
     * `libInjectCss` здесь НЕТ: он вшивал CSS компонента в его JS-чанк, а
     * granum доставляет тот же файл из манифеста — вместе двойная доставка
     * мимо слоёв `granum.*` (INV-CSS-5). Своего CSS у компонентов пока нет.
     */
    granumProvider({
      provider: granularityChartsProvider,
      engine: windEngine(),
      entries: extraEntries,
    }),
  ],
  // Дословно как в ядре: скобки обязательны, а `typeof process` в выражении быть не
  // должно — оно гасило бы гард в браузере. Разбор — `packages/granularity/vite.config.ts`.
  define: {
    __GR_DEV__: '(process.env.NODE_ENV !== \'production\')',
  },
  build: {
    target: 'esnext',
    minify: 'oxc',
    cssCodeSplit: true,
    reportCompressedSize: true,
    emptyOutDir: true,
    rolldownOptions: {
      external: [
        /^node:/,
        'vue',
        /^@feugene\/granularity(\/.*)?$/,
        // Тип `LocaleLoaderCollection` стирается на сборке, но правило общее:
        // i18n-слой принадлежит приложению, а не пакету.
        /^@feugene\/fint-i18n(\/.*)?$/,
        // Build-time helper deps of the optional `./resolver` entry.
        '@feugene/unplugin-granularity',
        'unplugin-vue-components',
        /^unplugin-vue-components\/.*/,
      ],
    },
  },
})
