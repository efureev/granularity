import { granumProvider } from '@feugene/granum/build'
import { windEngine } from '@feugene/granum-engine-wind'
import { defineConfig } from 'vite'

import { showcaseIconsProvider } from './granum.provider'

/**
 * Сборка провайдера правил. Компонентов у него нет, поэтому `indexEntry: false`
 * — собирать нечего, кроме модуля правил, на который ссылается манифест
 * (`engineModule`). Приложение грузит его по этой ссылке.
 */
export default defineConfig({
  build: {
    minify: false,
    lib: { entry: { engine: 'src/engine.ts' }, formats: ['es'] },
    rolldownOptions: { external: [/^node:/, /^@feugene\/granum/, /^@iconify-json\//] },
  },
  plugins: [
    granumProvider({
      provider: showcaseIconsProvider,
      engine: windEngine(),
      engineModule: 'engine.js',
      indexEntry: false,
    }),
  ],
})
