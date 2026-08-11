import { splitClassTokens } from '../shared/classTokens'
import {
  panelBaseClass,
  panelSizeClassBySize,
  presetBaseClass,
  presetSelectedClass,
  presetsGridClass,
  previewClass,
  rowClass,
  rowLabelClass,
  rowValueClass,
  swatchBaseClass,
  swatchFillClass,
  triggerBaseClass,
  triggerDisabledClass,
  triggerEnabledClass,
  triggerInvalidClass,
  triggerSizeClassBySize,
  triggerSwatchSizeBySize,
  triggerValueClass,
} from './grColorPickerStyles'

// Классы из вычисляемых мап и литералов `.ts`-хелпера UnoCSS сканом не находит.
//
// `checkerClass` сюда не входит намеренно: это класс-маркер под собственный
// `<style>` компонента, а не утилита — CSS из него не генерируется, и гейт
// `documentedConfig` справедливо на такой записи падает.
export const grColorPickerSafelist = [...new Set([
  ...Object.values(triggerSizeClassBySize).flatMap(splitClassTokens),
  ...Object.values(triggerSwatchSizeBySize).flatMap(splitClassTokens),
  ...Object.values(panelSizeClassBySize).flatMap(splitClassTokens),
  ...splitClassTokens(triggerBaseClass),
  ...splitClassTokens(triggerDisabledClass),
  ...splitClassTokens(triggerEnabledClass),
  ...splitClassTokens(triggerInvalidClass),
  ...splitClassTokens(triggerValueClass),
  ...splitClassTokens(swatchBaseClass),
  ...splitClassTokens(swatchFillClass),
  ...splitClassTokens(panelBaseClass),
  ...splitClassTokens(previewClass),
  ...splitClassTokens(rowClass),
  ...splitClassTokens(rowLabelClass),
  ...splitClassTokens(rowValueClass),
  ...splitClassTokens(presetsGridClass),
  ...splitClassTokens(presetBaseClass),
  ...splitClassTokens(presetSelectedClass),
])]
