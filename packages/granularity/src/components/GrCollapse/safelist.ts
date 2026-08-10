import { splitClassTokens } from '../shared/classTokens'

import {
  collapseBodyBase,
  collapseBodyPaddings,
  collapseChevronBase,
  collapseChevronExpandedClass,
  collapseEmptyBase,
  collapseExtraPaddings,
  collapseHeaderBase,
  collapseHeaderDisabledClass,
  collapseHeaderEnabledClass,
  collapseHeaderPaddings,
  collapseRowBase,
  collapseRowDisabledClass,
  collapseRowEnabledClass,
  collapseTitleBase,
  collapseTitleTexts,
} from './grCollapseStyles'

export const grCollapseClassTokens = {
  rowBase: splitClassTokens(collapseRowBase),
  rowState: [
    ...splitClassTokens(collapseRowEnabledClass),
    ...splitClassTokens(collapseRowDisabledClass),
  ],
  extraPaddings: Object.values(collapseExtraPaddings).flatMap(splitClassTokens),
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
  empty: splitClassTokens(collapseEmptyBase),
  chevron: [
    ...splitClassTokens(collapseChevronBase),
    ...splitClassTokens(collapseChevronExpandedClass),
  ],
} as const

export const grCollapseSafelist = [...new Set(Object.values(grCollapseClassTokens).flat())]
