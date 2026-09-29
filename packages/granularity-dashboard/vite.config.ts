import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { granumProvider } from '@feugene/granum/build'
import { windEngine } from '@feugene/granum-engine-wind'

import { granularityDashboardProvider } from './src/granular-provider'

/**
 * Entry, которые строит не плагин: композаблы, арифметика раскладки, i18n и
 * служебные точки входа. Entry компонентов и `index` `granumProvider()`
 * собирает сам из реестра провайдера — руками их больше не ведут, поэтому
 * сгенерированного блока entry в этом файле нет.
 *
 * Арифметика раскладки (`layout/`) отдаётся своим entry: её берут и без
 * компонентов — например чтобы проверить пришедшую с сервера раскладку.
 */
const extraEntries: Record<string, string> = {
  'granular-provider': 'src/granular-provider/index.ts',
  'granular-provider-node': 'src/granular-provider/node.ts',
  'resolver': 'src/resolver.ts',
  'composables/useDashboardLayout': 'src/composables/useDashboardLayout.ts',
  'composables/useDashboardTransfer': 'src/composables/useDashboardTransfer.ts',
  'layout/index': 'src/layout/index.ts',
  'i18n/index': 'src/i18n/index.ts',
  'i18n/all': 'src/i18n/all.ts',
}

/**
 * Build-конфиг пакета `@feugene/granularity-dashboard`.
 *
 * — `vue` и `@feugene/granularity` остаются external (peer-зависимости) —
 *   пакет не дублирует их рантайм; `@feugene/granum` держит снаружи сам плагин;
 * — собственных runtime-зависимостей нет: коллизии, компактизация и геометрия
 *   сетки это обычная арифметика над целыми числами;
 * — раскладку `dist` и entry компонентов ведёт `granumProvider()`: он строит
 *   их из реестра провайдера, извлекает классы и потребляемые токены по графу
 *   бандла и пишет `dist/granum.manifest.json`. Общие шаблоны рамы приезжают в
 *   классы того компонента, который до них дотягивается, — поэтому чанк с ними
 *   больше не обязан лежать в отдельной директории группы.
 */
export default defineConfig({
  plugins: [
    vue(),
    /*
     * `libInjectCss` здесь НЕТ, и это не упущение.
     *
     * Он вписывал в JS-чанк компонента `import '../styles.css'`, и до granum
     * это был единственный канал доставки стилей. granum доставляет CSS
     * компонента приложению через манифест, и вместе вышла бы двойная
     * доставка — один и тот же файл в общем листе и отдельным чанком, причём
     * второй раз ВНЕ слоёв `granum.*` и потому сильнее всей библиотеки.
     *
     * У этого пакета компонентного CSS сегодня нет, и плагин стоял вхолостую.
     * Убран до того, как появится первый компонент со стилями: с ним ловушка
     * захлопнулась бы молча.
     */
    granumProvider({
      provider: granularityDashboardProvider,
      engine: windEngine(),
      entries: extraEntries,
    }),
  ],
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
