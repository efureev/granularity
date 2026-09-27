import { splitClassTokens } from '../../internal/classTokens'

import { ALL_GRID_CLASSES } from './grSchemaFormStyles'

/**
 * Классы сетки — единственное, что пакет рисует сам.
 *
 * Список остался с тех времён, когда общий чанк `dist/chunks/`, куда уезжает
 * `.ts`-хелпер сетки, был вне скана. granum доходит до него по графу бандла
 * компонента, поэтому все 86 записей `granum doctor` показывает кодом
 * `safelist-redundant`; убирать их стоит генератором, а не руками.
 */
export const grSchemaFormSafelist = [...new Set(
  ALL_GRID_CLASSES.flatMap(splitClassTokens),
)]
