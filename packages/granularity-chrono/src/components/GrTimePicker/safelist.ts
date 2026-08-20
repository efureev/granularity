import { splitClassTokens } from '../../internal/classTokens'
import { pickerFieldClassTokens } from '../../internal/pickerFieldStyles'
import { presetRowClassTokens } from '../../internal/presetRowStyles'

import {
  timeColumnClass,
  timeColumnLabelClass,
  timeOptionClass,
  timeOptionSizes,
  timePanelClass,
} from './grTimePickerStyles'

/**
 * Классы из `.ts`-хелперов обязаны быть в safelist: и общий модуль поля, и
 * стили панели уезжают в `dist/chunks/`, а пресет сканирует только
 * `dist/components/<Name>/**`. Симптом пропуска узнаваемый: размеры работают,
 * цвета прозрачные, фокус-кольца нет.
 */
const optionVariants = (['xs', 'sm', 'md', 'lg'] as const).flatMap(size => [
  timeOptionClass({ size, selected: false, active: false, disabled: false }),
  timeOptionClass({ size, selected: true, active: false, disabled: false }),
  timeOptionClass({ size, selected: false, active: true, disabled: false }),
  timeOptionClass({ size, selected: false, active: false, disabled: true }),
])

export const grTimePickerSafelist: string[] = [
  ...pickerFieldClassTokens.flatMap(splitClassTokens),
  ...presetRowClassTokens.flatMap(splitClassTokens),
  ...splitClassTokens(timePanelClass),
  ...splitClassTokens(timeColumnClass),
  ...splitClassTokens(timeColumnLabelClass),
  ...Object.values(timeOptionSizes).flatMap(splitClassTokens),
  ...optionVariants.flatMap(splitClassTokens),
]
