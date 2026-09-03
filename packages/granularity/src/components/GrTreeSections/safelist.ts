import { splitClassTokens } from '../shared/classTokens'

import {
  treeSectionsCountClass,
  treeSectionsGroupClass,
  treeSectionsHeadClass,
  treeSectionsRootClass,
} from './grTreeSectionsStyles'

export const grTreeSectionsSafelist = [...new Set([
  ...splitClassTokens(treeSectionsRootClass),
  ...splitClassTokens(treeSectionsHeadClass),
  ...splitClassTokens(treeSectionsCountClass),
  ...splitClassTokens(treeSectionsGroupClass),
])]
