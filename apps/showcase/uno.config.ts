import {
    defineConfig,
    presetAttributify,
    presetIcons,
    presetMini,
    transformerDirectives,
    transformerVariantGroup,
} from 'unocss'

import { granularContent, type PresetGranularNodeOptions } from '@feugene/unocss-preset-granular/node'
import { presetGranularNode } from '@feugene/unocss-preset-granular/node'
import granularityProvider from '@feugene/granularity/granular-provider/node'
import {
    animationPreflights,
    animationRules,
    colorOpacityRules,
    filterRules,
    spacingRules,
    spacingVariants,
} from '@feugene/unocss-mini-extra-rules'

export const showcaseGranularOptions: PresetGranularNodeOptions = {
    providers: [granularityProvider],
    components: 'all',
    themes: {names: ['light', 'dark']},
    layer: 'granular' as const,
}

const granularContentConfig = granularContent(showcaseGranularOptions)

// Ограничиваем сканирование Uno исходниками showcase: это предотвращает
// случайное вытягивание утилит из playground/dist-артефактов пакета и
// делает build детерминированным между окружениями.
export const showcaseContentIncludes: RegExp[] = [
    /\/apps\/showcase\/src\/.*\.(?:vue|[jt]sx?|mdx?|html|css)$/,
]

export default defineConfig({
    content: {
        ...granularContentConfig,
        pipeline: {
            ...(granularContentConfig.pipeline ?? {}),
            include: showcaseContentIncludes,
        },
    },
    // Дополнительные правила поверх preset-mini из
    // `@feugene/unocss-mini-extra-rules`: spinner-анимация, bracket‑color с
    // `/NN` opacity, расширенные filter/backdrop‑filter утилиты и
    // Tailwind‑совместимые `space-*` / `divide-*`.
    rules: [
        ...animationRules,
        ...colorOpacityRules,
        ...filterRules,
        ...spacingRules,
    ],
    variants: [
        ...spacingVariants,
    ],
    preflights: [
        ...animationPreflights,
    ],
    presets: [
        presetMini(),
        presetGranularNode(showcaseGranularOptions),
        presetAttributify(),
        presetIcons({
            scale: 1.05,
            extraProperties: {
                display: 'inline-block',
            },
        }),
    ],
    transformers: [
        transformerDirectives(),
        transformerVariantGroup(),
    ],
})
