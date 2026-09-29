import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { granumProvider } from '@feugene/granum/build'
import { windEngine } from '@feugene/granum-engine-wind'

import { granularityCodeProvider } from './src/granular-provider'

/**
 * Build-конфиг пакета `@feugene/granularity-code`.
 *
 * — `vue`, `@feugene/granularity` и `@feugene/granum` остаются external
 *   (peer-зависимости) — пакет не дублирует их рантайм;
 * — **CodeMirror тоже external**, и это не оптимизация: `@codemirror/state`
 *   обязан быть в приложении в одном экземпляре, второй даёт два набора типов
 *   состояния, и первое же расширение потребителя падает на чужом документе.
 *   Та же причина, по которой `granularity-editor` держит внешним ProseMirror;
 * — собственных runtime-зависимостей у пакета нет. Подсветка приходит функцией
 *   по контракту `GrCodeTokenizer`, поэтому Shiki здесь не упомянут вовсе:
 *   его нет ни в манифесте, ни в импортах.
 *
 * Раскладку `dist` ведёт `granumProvider()`: каждый компонент он публикует
 * отдельным `components/<Name>/index` entry для tree-shake, SFC-чанки кладёт в
 * `components/<Name>/chunks/`, извлекает классы и потребляемые токены по графу
 * бандла и пишет `dist/granum.manifest.json`. Entry компонентов руками больше
 * не перечисляют, поэтому сгенерированного блока в этом файле нет.
 */
/**
 * Entry, которые строит не плагин: слои пакета и служебные точки входа. Entry
 * компонентов и `index` `granumProvider()` собирает сам из реестра провайдера.
 */
const extraEntries: Record<string, string> = {
  'granular-provider': 'src/granular-provider/index.ts',
  'granular-provider-node': 'src/granular-provider/node.ts',
  'resolver': 'src/resolver.ts',
  'diff/index': 'src/diff/index.ts',
  'highlight/index': 'src/highlight/index.ts',
  'i18n/index': 'src/i18n/index.ts',
  'i18n/all': 'src/i18n/all.ts',
}

export default defineConfig({
  plugins: [
    vue(),
    /*
     * `libInjectCss` здесь НЕТ, и это не упущение.
     *
     * Он вписывал в JS-чанк компонента `import '../styles.css'`, и до granum
     * это был единственный канал: потребитель получал стили тем, что
     * импортировал компонент. granum доставляет тот же файл приложению через
     * манифест (`css: ['components/<Name>/styles.css']`), и вместе выходила
     * двойная доставка — один и тот же CSS в общем листе и отдельным чанком,
     * причём второй раз ВНЕ слоёв `granum.*` и потому сильнее всей библиотеки.
     *
     * Ядро сняло плагин при переезде на granum; спутники остались на старом
     * конфиге. Предупреждение `css-double-delivery` (INV-CSS-5) это не поймало:
     * granum смотрит бандл раньше, чем `libInjectCss` вписывает импорт, —
     * в `chunk.code` на тот момент его ещё нет.
     */
    granumProvider({
      provider: granularityCodeProvider,
      engine: windEngine(),
      entries: extraEntries,
    }),
  ],
  /**
   * `__GR_DEV__` разворачивается в текст гарда на нашей сборке — свернуть его
   * бандлеру потребителя. Скобки обязательны: `!__GR_DEV__` без них развернулось
   * бы в `!process.env.NODE_ENV !== 'production'`.
   */
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
        /^@feugene\/fint-i18n(\/.*)?$/,
        /^@codemirror\/.*/,
        // Build-time helper deps of the optional `./resolver` entry.
        '@feugene/unplugin-granularity',
        'unplugin-vue-components',
        /^unplugin-vue-components\/.*/,
      ],
    },
  },
})
