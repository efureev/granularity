import { granumProvider } from '@feugene/granum/build'
import { windEngine } from '@feugene/granum-engine-wind'
import { defineConfig } from 'vite'
import { granularityTokensProvider } from './src/granum-provider'

/**
 * Браузерная сборка пакета токенов — провайдер granum без компонентов: реестр,
 * сборщик тем, а рядом каталог тем с манифестом. Данные тем, реестр и формулы
 * генератор кладёт в `generated/` (`scripts/generate.mjs --dist`), плагин
 * проверяет тему по реестру и копирует их в `dist`.
 *
 * `theme/node` читает файлы — точка входа только для Node: проверка границы
 * browser/node её не судит, а `node:*` в ней остаются импортами, а не
 * заглушкой Vite. Entry лежит на той же глубине, что исходник: `theme/node`
 * находит встроенные темы пакета путём `../../themes`.
 */
export default defineConfig({
  plugins: [granumProvider({
    provider: granularityTokensProvider,
    engine: windEngine(),
    sourceDir: 'generated',
    entries: {
      'theme/index': 'src/theme/index.ts',
      'theme/apply': 'src/theme/apply.ts',
      'theme/node': { path: 'src/theme/node.ts', env: 'node' },
    },
  })],
  build: {
    target: 'esnext',
    emptyOutDir: true,
    rolldownOptions: {
      output: {
        chunkFileNames: 'chunks/[name]-[hash].js',
      },
    },
  },
})
