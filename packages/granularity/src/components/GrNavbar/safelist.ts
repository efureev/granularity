import { splitClassTokens } from '../shared/classTokens'
import {
  navbarBaseClass,
  navbarCenterClass,
  navbarRightAlignClass,
  navbarSideClass,
  navbarSideGrowClass,
  navbarStickyClass,
  navbarTitleClass,
} from './grNavbarStyles'

export const grNavbarSafelist = [...new Set([
  ...splitClassTokens(navbarBaseClass),
  ...splitClassTokens(navbarStickyClass),
  ...splitClassTokens(navbarSideClass),
  ...splitClassTokens(navbarSideGrowClass),
  ...splitClassTokens(navbarRightAlignClass),
  ...splitClassTokens('ml-auto'),
  ...splitClassTokens(navbarCenterClass),
  ...splitClassTokens(navbarTitleClass),
])]
