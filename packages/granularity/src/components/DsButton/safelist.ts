import {splitClassTokens} from '../shared/classTokens'
import {
    base,
    sizes,
    squareSizes,
    tones,
    variantClass,
    type DsButtonTone,
    type DsButtonVariant,
} from './dsButtonStyles'

const variantTokens = (Object.keys(tones) as DsButtonTone[]).flatMap(tone =>
    (['primary', 'secondary', 'outline', 'ghost', 'ghost-border'] as DsButtonVariant[])
        .flatMap(variant => splitClassTokens(variantClass(variant, tone))),
)

export const dsButtonClassTokens = {
    base: splitClassTokens(base),
    sizes: Object.values(sizes).flatMap(splitClassTokens),
    squareSizes: Object.values(squareSizes).flatMap(splitClassTokens),
    variants: variantTokens,
} as const

export const dsButtonSafelist = [...new Set([
    ...dsButtonClassTokens.base,
    ...dsButtonClassTokens.sizes,
    ...dsButtonClassTokens.squareSizes,
    ...dsButtonClassTokens.variants,
])]
