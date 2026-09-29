import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { granumProvider } from '@feugene/granum/build'
import { windEngine } from '@feugene/granum-engine-wind'

import { granularityMediaProvider } from './src/granular-provider'

/**
 * Entry, которые строит не плагин: резолвер, i18n и служебные точки входа.
 * Entry компонентов и `index` `granumProvider()` собирает сам из реестра
 * провайдера — руками их больше не ведут, поэтому сгенерированного блока entry
 * в этом файле нет.
 */
const extraEntries: Record<string, string> = {
  'granular-provider': 'src/granular-provider/index.ts',
  'granular-provider-node': 'src/granular-provider/node.ts',
  'resolver': 'src/resolver.ts',
  'i18n/index': 'src/i18n/index.ts',
  'i18n/all': 'src/i18n/all.ts',
}

/**
 * Build-конфиг пакета `@feugene/granularity-media`.
 *
 * Своих зависимостей у пакета нет: кроп, снимок и разбор кодов держатся на
 * Canvas и браузерных API, а не на библиотеке. Наружу остаются только peers.
 *
 * Раскладку `dist` ведёт `granumProvider()`: он строит entry компонентов из
 * реестра провайдера, извлекает классы и потребляемые токены по графу бандла и
 * пишет `dist/granum.manifest.json` — по нему приложение собирает CSS, ничего
 * не сканируя в `node_modules`.
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
      provider: granularityMediaProvider,
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
        /^@feugene\/fint-i18n(\/.*)?$/,
        // Build-time helper deps of the optional `./resolver` entry.
        '@feugene/unplugin-granularity',
        'unplugin-vue-components',
        /^unplugin-vue-components\/.*/,
      ],
    },
  },
  define: {
    // Скобки обязательны, а `typeof process` в выражении быть не должно — оно
    // гасило бы гард в браузере целиком. Разбор — `packages/granularity/vite.config.ts`.
    __GR_DEV__: '(process.env.NODE_ENV !== \'production\')',
  },
})
