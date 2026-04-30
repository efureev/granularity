import {splitClassTokens} from '../shared/classTokens'
import {
    base,
    sizes,
    squareSizes,
    tones,
    variantClass,
    type GrButtonTone,
    type GrButtonVariant,
} from './grButtonStyles'

const variantTokens = (Object.keys(tones) as GrButtonTone[]).flatMap(tone =>
    (['primary', 'secondary', 'outline', 'ghost', 'ghost-border'] as GrButtonVariant[])
        .flatMap(variant => splitClassTokens(variantClass(variant, tone))),
)

export const grButtonClassTokens = {
    base: splitClassTokens(base),
    sizes: Object.values(sizes).flatMap(splitClassTokens),
    squareSizes: Object.values(squareSizes).flatMap(splitClassTokens),
    variants: variantTokens,
} as const

export const grButtonSafelist = [...new Set([
    ...grButtonClassTokens.base,
    ...grButtonClassTokens.sizes,
    ...grButtonClassTokens.squareSizes,
    ...grButtonClassTokens.variants,
])]
