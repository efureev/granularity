import { splitClassTokens } from '../shared/classTokens'

import {
    collapseBodyBase,
    collapseBodyPaddings,
    collapseChevronBase,
    collapseChevronExpandedClass,
    collapseHeaderBase,
    collapseHeaderDisabledClass,
    collapseHeaderEnabledClass,
    collapseHeaderPaddings,
    collapseTitleBase,
    collapseTitleTexts,
} from './grCollapseStyles'

export const grCollapseClassTokens = {
    headerBase: splitClassTokens(collapseHeaderBase),
    headerPaddings: Object.values(collapseHeaderPaddings).flatMap(splitClassTokens),
    headerState: [
        ...splitClassTokens(collapseHeaderEnabledClass),
        ...splitClassTokens(collapseHeaderDisabledClass),
    ],
    titleBase: splitClassTokens(collapseTitleBase),
    titleTexts: Object.values(collapseTitleTexts).flatMap(splitClassTokens),
    bodyBase: splitClassTokens(collapseBodyBase),
    bodyPaddings: Object.values(collapseBodyPaddings).flatMap(splitClassTokens),
    chevron: [
        ...splitClassTokens(collapseChevronBase),
        ...splitClassTokens(collapseChevronExpandedClass),
    ],
} as const

export const grCollapseSafelist = [...new Set(Object.values(grCollapseClassTokens).flat())]
