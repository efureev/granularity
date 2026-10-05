import { splitClassTokens } from '../shared/classTokens'
import {
  hoverableClass,
  stickyColumnHoverableClass,
  stickyColumnStripedClass,
  stripedClass,
} from './grTableStyles'

/**
 * Только полоса и подсветка строк: эти классы склеиваются шаблонной строкой из
 * атрибута служебной строки и оттенка (`grTableStyles.ts`: `stripedClass`,
 * `hoverableClass`, `stickyColumnStripedClass`, `stickyColumnHoverableClass`),
 * и целиком их нет ни в одной строке кода. Остальное — шаблон, мапа кеглей,
 * классы служебных строк — лежит литералами, и granum извлекает это из чанков
 * компонента сам, включая общие.
 */
export const grTableSafelist = [...new Set([
  ...splitClassTokens(stripedClass),
  ...splitClassTokens(hoverableClass),
  ...splitClassTokens(stickyColumnStripedClass),
  ...splitClassTokens(stickyColumnHoverableClass),
])]
