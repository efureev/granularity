import { splitClassTokens } from '../shared/classTokens'
import {
  base,
  blockClass,
  disabledClassByVariant,
  paddingEnd,
  paddingEndAdorned,
  paddingStart,
  paddingStartAdorned,
  pressClass,
  sizeBase,
  glyphSizes,
  solidImageClass,
  stepRadius,
  squareSizes,
  surfaceShadowClass,
  pressedClass,
  tones,
  variantClass,
  type GrButtonTone,
  type GrButtonVariant,
} from './grButtonStyles'

const variantTokens = (Object.keys(tones) as GrButtonTone[]).flatMap(tone =>
  (['primary', 'secondary', 'outline', 'ghost', 'ghost-border'] as GrButtonVariant[])
    .flatMap(variant => [...splitClassTokens(variantClass(variant, tone)), ...splitClassTokens(pressedClass(variant, tone))]),
)

export const grButtonClassTokens = {
  base: splitClassTokens(base),
  sizes: [sizeBase, stepRadius, paddingStart, paddingEnd, paddingStartAdorned, paddingEndAdorned, glyphSizes]
    .flatMap(map => Object.values(map).flatMap(splitClassTokens)),
  squareSizes: Object.values(squareSizes).flatMap(splitClassTokens),
  variants: variantTokens,
  states: [
    ...splitClassTokens(blockClass),
    ...splitClassTokens(pressClass),
    ...Object.values(disabledClassByVariant).flatMap(splitClassTokens),
  ],
} as const

/**
 * Только матрица тон × вариант: `grButtonStyles.ts: variantClass` клеит каждый
 * её класс из префикса и токена тона (`bg-${withVar(tokens.solidBackground)}`),
 * и целиком их нет ни в одной строке кода. Тон и вариант приходят пропом, из
 * `GrButtonGroup` или `GrConfigProvider`, поэтому объявлена вся матрица — 8 × 5.
 *
 * Собранное узнаётся по скобкам, которые подставляет `withVar` и тень объёма
 * с цветом тона. Литеральные куски той же функции (`bg-transparent`, `border`,
 * `border-transparent`, тень нейтральной плашки), база,
 * размеры, квадрат, `block` и отключённое состояние лежат строками целиком —
 * granum извлекает их из чанков компонента сам.
 *
 * Ту же матрицу рисует вид `button` у `GrRadio` (через `grButtonClass`): к нему
 * она приезжает зависимостью `GrButton` вместе со всеми классами её чанка.
 */
const literalVariantTokens = new Set([...splitClassTokens(surfaceShadowClass), ...splitClassTokens(solidImageClass)])

export const grButtonSafelist = [...new Set(
  grButtonClassTokens.variants.filter(token => token.includes('[') && !literalVariantTokens.has(token)),
)]
