import { splitClassTokens } from '../shared/classTokens'
import {
    labelBase,
    labelSizes,
    thumbBase,
    thumbSizes,
    thumbTranslations,
    trackBase,
    trackSizes,
} from './grSwitchStyles'

export const grSwitchClassTokens = {
    trackBase: splitClassTokens(trackBase),
    trackSizes: Object.values(trackSizes).flatMap(splitClassTokens),
    thumbBase: splitClassTokens(thumbBase),
    thumbSizes: Object.values(thumbSizes).flatMap(splitClassTokens),
    thumbTranslations: Object.values(thumbTranslations).flatMap(({checked, unchecked}) => {
        return [...splitClassTokens(checked), ...splitClassTokens(unchecked)]
    }),
    labelBase: splitClassTokens(labelBase),
    labelSizes: Object.values(labelSizes).flatMap(splitClassTokens),
} as const

export const grSwitchSafelist = [...new Set([
    ...grSwitchClassTokens.trackBase,
    ...grSwitchClassTokens.trackSizes,
    ...grSwitchClassTokens.thumbBase,
    ...grSwitchClassTokens.thumbSizes,
    ...grSwitchClassTokens.thumbTranslations,
    ...grSwitchClassTokens.labelBase,
    ...grSwitchClassTokens.labelSizes,
])]
