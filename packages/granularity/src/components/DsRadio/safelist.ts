import {splitClassTokens} from '../shared/classTokens'
import {dsButtonSafelist} from '../DsButton/safelist'
import {
    dsRadioControlCheckedClass,
    dsRadioControlUncheckedClass,
    dsRadioDisabledClass,
    dsRadioDotBaseClass,
    dsRadioDotCheckedClass,
    dsRadioDotUncheckedClass,
    dsRadioEnabledClass,
    dsRadioRootDisabledClass,
    dsRadioRootEnabledClass,
} from './dsRadioStyles'
export const dsRadioSafelist = [...new Set([
    ...dsButtonSafelist,
    ...splitClassTokens(dsRadioDisabledClass),
    ...splitClassTokens(dsRadioEnabledClass),
    ...splitClassTokens(dsRadioRootDisabledClass),
    ...splitClassTokens(dsRadioRootEnabledClass),
    ...splitClassTokens(dsRadioControlCheckedClass),
    ...splitClassTokens(dsRadioControlUncheckedClass),
    ...splitClassTokens(dsRadioDotCheckedClass),
    ...splitClassTokens(dsRadioDotUncheckedClass),
    ...splitClassTokens(dsRadioDotBaseClass),
])]
