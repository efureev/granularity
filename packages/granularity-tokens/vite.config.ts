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
 * `theme/node` здесь нет: он читает файлы и собирается отдельно
 * (`vite.node.config.ts`), иначе проверка границы browser/node отвергла бы
 * сборку целиком.
 */
export default defineConfig({
  plugins: [granumProvider({
    provider: granularityTokensProvider,
    engine: windEngine(),
    sourceDir: 'generated',
    entries: {
      'theme/index': 'src/theme/index.ts',
      'theme/apply': 'src/theme/apply.ts',
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
