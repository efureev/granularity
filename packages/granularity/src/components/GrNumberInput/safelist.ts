import { splitClassTokens } from '../shared/classTokens'
import { controlPillPaddingXClass, controlShapeRadiusClass } from '../shared/controlShape'
import { controlStateIconClass, controlStateIconColors } from '../shared/controlState'
import {
  borderClassByState,
  clearButtonClass,
  disabledShellClass,
  invalidBorderClass,
  stepperCompactClass,
  stepperWideClass,
  sizeClassBySize,
  textAlignClassByAlign,
  paddingXClass,
  shellHeightClass,
} from './grNumberInputStyles'

// В safelist кладём только динамические токены, выбираемые по ключам в рантайме
// (`size`/`textAlign`/`state`/`disabled`). Литералы shell/input/controls прописаны
// статически в шаблоне — UnoCSS находит их сканом.
export const grNumberInputSafelist = [...new Set([
  ...Object.values(sizeClassBySize).flatMap(splitClassTokens),
  ...Object.values(shellHeightClass).flatMap(splitClassTokens),
  ...Object.values(paddingXClass).flatMap(map => Object.values(map)).flatMap(splitClassTokens),
  // Общий модуль лежит в чанке без адреса — его классы объявляет каждый импортёр.
  ...Object.values(controlShapeRadiusClass).flatMap(splitClassTokens),
  ...Object.values(controlPillPaddingXClass).flatMap(splitClassTokens),
  ...Object.values(textAlignClassByAlign).flatMap(splitClassTokens),
  ...Object.values(borderClassByState).flatMap(splitClassTokens),
  ...splitClassTokens(invalidBorderClass),
  ...splitClassTokens(disabledShellClass),
  ...splitClassTokens(stepperCompactClass),
  ...splitClassTokens(stepperWideClass),
  ...splitClassTokens(clearButtonClass),
  // Общий модуль лежит в чанке без адреса — его классы объявляет каждый импортёр.
  ...splitClassTokens(controlStateIconClass),
  ...Object.values(controlStateIconColors).flatMap(splitClassTokens),
  ...splitClassTokens('absolute top-1/2 -translate-y-1/2 sr-only'),
])]
