import {splitClassTokens} from '../shared/classTokens'
import {grButtonSafelist} from '../GrButton/safelist'
import {
    grRadioControlCheckedClass,
    grRadioControlUncheckedClass,
    grRadioDisabledClass,
    grRadioDotBaseClass,
    grRadioDotCheckedClass,
    grRadioDotUncheckedClass,
    grRadioEnabledClass,
    grRadioRootDisabledClass,
    grRadioRootEnabledClass,
} from './grRadioStyles'
export const grRadioSafelist = [...new Set([
    ...grButtonSafelist,
    ...splitClassTokens(grRadioDisabledClass),
    ...splitClassTokens(grRadioEnabledClass),
    ...splitClassTokens(grRadioRootDisabledClass),
    ...splitClassTokens(grRadioRootEnabledClass),
    ...splitClassTokens(grRadioControlCheckedClass),
    ...splitClassTokens(grRadioControlUncheckedClass),
    ...splitClassTokens(grRadioDotCheckedClass),
    ...splitClassTokens(grRadioDotUncheckedClass),
    ...splitClassTokens(grRadioDotBaseClass),
])]
