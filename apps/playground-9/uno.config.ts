import { defineConfig, presetMini } from 'unocss'
import {granularContent, presetGranularNode, type PresetGranularNodeOptions} from '@feugene/unocss-preset-granular/node'
// import granularityProvider from '@feugene/granularity/granular-provider/node'
import extraGranularityProvider from '@feugene/extra-granularity/granular-provider/node'

// Композит `XgQuickForm` транзитивно подтянет все нужные примитивы granularity
// через cross-provider `dependencies` в его `config.ts`. Дополнительно включаем
// `DsCard`, который используется напрямую в playground'е.
export const playground9Components = [
  '@feugene/extra-granularity:XgQuickForm',
  '@feugene/granularity:DsCard',
] as const
export const playground9GranularityLayer = 'granular'

const granularOptions: PresetGranularNodeOptions = {
  providers: [
    // granularityProvider,
    extraGranularityProvider,
  ],
  components: [...playground9Components],
  layer: playground9GranularityLayer,
}


export default defineConfig({
  presets: [
    presetMini({
      variablePrefix: 'ds-',
    }),
    presetGranularNode(granularOptions),
  ],
  // `@unocss/vite` читает `content.filesystem` только из top-level user-config,
  // поэтому подключаем хелпер `granularContent` — он автоматически соберёт
  // globs по выбранным компонентам (+ их транзитивным `dependencies`) и
  // расширит `pipeline.include` до `.js`, чтобы extractor увидел утилитарные
  // классы в скомпилированных SFC‑чанках.
  content: granularContent(granularOptions),
})
