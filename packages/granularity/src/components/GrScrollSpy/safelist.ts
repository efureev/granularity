import { splitClassTokens } from '../shared/classTokens'

import {
  scrollSpyItemActiveClass,
  scrollSpyItemAncestorClass,
  scrollSpyItemBaseClass,
  scrollSpyItemIdleClass,
  scrollSpyListClass,
  scrollSpyRootClass,
} from './grScrollSpyStyles'

export const grScrollSpySafelist = [...new Set([
  ...splitClassTokens(scrollSpyRootClass),
  ...splitClassTokens(scrollSpyListClass),
  ...splitClassTokens(scrollSpyItemBaseClass),
  ...splitClassTokens(scrollSpyItemIdleClass),
  ...splitClassTokens(scrollSpyItemAncestorClass),
  ...splitClassTokens(scrollSpyItemActiveClass),
])]
