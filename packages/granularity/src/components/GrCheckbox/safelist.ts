import { splitClassTokens } from '../shared/classTokens'

import {
    controlBase,
    controlCheckedClass,
    controlSizes,
    controlUncheckedClass,
    iconCheckHiddenClass,
    iconCheckTransitionClass,
    iconCheckVisibleClass,
    iconColorClass,
    iconSizes,
    labelBase,
    labelSizes,
    rootBase,
    rootDisabledClass,
    rootEnabledClass,
    rootGaps,
} from './grCheckboxStyles'

export const grCheckboxClassTokens = {
    rootBase: splitClassTokens(rootBase),
    rootGaps: Object.values(rootGaps).flatMap(splitClassTokens),
    rootState: [
        ...splitClassTokens(rootDisabledClass),
        ...splitClassTokens(rootEnabledClass),
    ],
    controlBase: splitClassTokens(controlBase),
    controlSizes: Object.values(controlSizes).flatMap(splitClassTokens),
    controlState: [
        ...splitClassTokens(controlCheckedClass),
        ...splitClassTokens(controlUncheckedClass),
    ],
    iconSizes: Object.values(iconSizes).flatMap(splitClassTokens),
    iconState: [
        ...splitClassTokens(iconColorClass),
        ...splitClassTokens(iconCheckTransitionClass),
        ...splitClassTokens(iconCheckVisibleClass),
        ...splitClassTokens(iconCheckHiddenClass),
    ],
    labelBase: splitClassTokens(labelBase),
    labelSizes: Object.values(labelSizes).flatMap(splitClassTokens),
} as const

export const grCheckboxSafelist = [...new Set(Object.values(grCheckboxClassTokens).flat())]
