import {splitClassTokens} from '../shared/classTokens'
import {rootBackdropBlurClass, rootBackgroundClass, rootModeClass} from './grLoadingStyles'

export const grLoadingSafelist = [...new Set([
    ...Object.values(rootModeClass).flatMap(splitClassTokens),
    ...splitClassTokens(rootBackgroundClass),
    ...splitClassTokens(rootBackdropBlurClass),
])]
