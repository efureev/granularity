import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { granumProvider } from '@feugene/granum/build'
import { windEngine } from '@feugene/granum-engine-wind'

import { granularityEditorProvider } from './src/granular-provider'

/**
 * Build-конфиг пакета `@feugene/granularity-editor`.
 *
 * TipTap и ProseMirror остаются external и объявлены **peer**, а не своей
 * зависимостью: ProseMirror обязан быть в приложении в одном экземпляре.
 * Второй даёт два реестра схем, и первое же расширение потребителя падает на
 * чужом документе.
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
  'editor': 'src/editor/index.ts',
  'markdown': 'src/markdown/index.ts',
  'granular-provider': 'src/granular-provider/index.ts',
  'granular-provider-node': 'src/granular-provider/node.ts',
  'resolver': 'src/resolver.ts',
  'i18n/index': 'src/i18n/index.ts',
  'i18n/all': 'src/i18n/all.ts',
}

export default defineConfig({
  plugins: [
    vue(),
    /*
     * `libInjectCss` здесь НЕТ: он вшивал CSS компонента в его JS-чанк, а
     * granum доставляет тот же файл из манифеста — вместе двойная доставка, и
     * второй экземпляр вне слоёв `granum.*` (INV-CSS-5). До granum 1.0.2 сборка
     * её не ловила: плагин `enforce: 'post'` пишет позже, чем granum смотрит.
     */
    granumProvider({
      provider: granularityEditorProvider,
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
        'marked',
        /^@tiptap\/.*/,
        /^prosemirror-.*/,
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
