import { defineConfig, presetMini } from 'unocss'
import { presetGranularityNode } from '@feugene/granularity/uno-node'

// Контент, который UnoCSS сканирует на предмет utility-классов.
// Ограничиваем строго исходниками playground-9 — это гарантирует, что в
// финальный `virtual:uno.css` попадут только реально использованные утилиты,
// а preflight с компонентными стилями придёт из `presetGranularityNode`.
export const playground9ContentIncludes = [
  /apps\/playground-9\/src\/.*\.(vue|ts)($|\?)/,
]

// В этом playground'е используется композитный `XgQuickForm` из
// `@feugene/extra-granularity`, собранный ровно из трёх примитивов granularity.
// Передаём их имена в `presetGranularityNode` — preset выдаст preflight
// только с CSS `DsFormField`, `DsInput`, `DsButton` (плюс токены тем), и
// ничего лишнего из пакета.
export const playground9GranularityComponents = ['DsFormField', 'DsInput', 'DsButton', 'DsCard'] as const
export const playground9GranularityLayer = 'granularity'

export default defineConfig({
  content: {
    pipeline: {
      include: playground9ContentIncludes,
    },
  },
  presets: [
    presetMini(),
    presetGranularityNode({
      components: [...playground9GranularityComponents],
      layer: playground9GranularityLayer,
    }),
  ],
})
