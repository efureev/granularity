import { splitClassTokens } from '../../internal/classTokens'
import { pickerFieldClassTokens } from '../../internal/pickerFieldStyles'
import { presetRowClassTokens } from '../../internal/presetRowStyles'
import { rangeTimeLabelClass, rangeTimeRowClass } from './grDateRangePickerStyles'

/**
 * Классы поля приходят из общего модуля, а он уезжает в `dist/chunks/` —
 * пресет сканирует только `dist/components/<Name>/**`. Полоса диапазона
 * объявлена в safelist `GrCalendar` и приезжает через граф зависимостей.
 */
export const grDateRangePickerSafelist: string[] = [
  ...pickerFieldClassTokens,
  ...presetRowClassTokens,
  rangeTimeRowClass,
  rangeTimeLabelClass,
].flatMap(splitClassTokens)
