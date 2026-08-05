import { splitClassTokens } from '../shared/classTokens'

import {
  badgeClass,
  chromeButtonClass,
  emptyStateClass,
  scrimClass,
  toolbarButtonClass,
  toolbarSeparatorClass,
  toolbarShellClass,
} from './grImageViewerStyles'

export const grImageViewerSafelist = [...new Set([
  ...splitClassTokens(scrimClass),
  ...splitClassTokens(chromeButtonClass),
  ...splitClassTokens(toolbarButtonClass),
  ...splitClassTokens(toolbarShellClass),
  ...splitClassTokens(toolbarSeparatorClass),
  ...splitClassTokens(badgeClass),
  ...splitClassTokens(emptyStateClass),
])]
