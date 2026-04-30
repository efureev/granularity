import { splitClassTokens } from '../shared/classTokens'
import {
  panelSideClass,
  panelTransitionClass,
  panelWidthBySize,
} from './grDrawerStyles'

// Safelist содержит только динамические токены, выбираемые в рантайме через
// ключи (`side`/`size`). Литералы, прописанные статически в шаблоне и в функции
// `grDrawerPanelClass`, UnoCSS находит сканом и здесь не дублируются.
export const grDrawerSafelist = [...new Set([
  ...Object.values(panelSideClass).flatMap(splitClassTokens),
  ...Object.values(panelWidthBySize).flatMap(splitClassTokens),
  ...Object.values(panelTransitionClass).flatMap(splitClassTokens),
])]
