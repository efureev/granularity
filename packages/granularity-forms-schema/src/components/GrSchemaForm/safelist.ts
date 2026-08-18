import { splitClassTokens } from '../../internal/classTokens'

import { ALL_GRID_CLASSES } from './grSchemaFormStyles'

/**
 * Классы сетки — единственное, что пакет рисует сам.
 *
 * Все до одного объявляются здесь, потому что живут в `.ts`-хелпере: он уезжает
 * в общий чанк `dist/chunks/`, которого скан UnoCSS не видит. Классы из
 * шаблонов SFC перечислять не нужно — они компилируются в чанк самого
 * компонента, то есть в область скана.
 */
export const grSchemaFormSafelist = [...new Set(
  ALL_GRID_CLASSES.flatMap(splitClassTokens),
)]
