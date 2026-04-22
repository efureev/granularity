import { splitClassTokens } from '../shared/classTokens'
import {
  panelSideClass,
  panelTransitionClass,
  panelWidthBySize,
} from './dsDrawerStyles'

// Safelist содержит только динамические токены, выбираемые в рантайме через
// ключи (`side`/`size`). Литералы, прописанные статически в шаблоне и в функции
// `dsDrawerPanelClass`, UnoCSS находит сканом и здесь не дублируются.
export const dsDrawerSafelist = [...new Set([
  ...Object.values(panelSideClass).flatMap(splitClassTokens),
  ...Object.values(panelWidthBySize).flatMap(splitClassTokens),
  ...Object.values(panelTransitionClass).flatMap(splitClassTokens),
])]
