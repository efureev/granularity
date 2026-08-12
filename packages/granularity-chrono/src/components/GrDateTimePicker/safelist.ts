import { splitClassTokens } from '../../internal/classTokens'
import { pickerFieldClassTokens } from '../../internal/pickerFieldStyles'

import {
  dateTimeDividerClass,
  dateTimeFooterClass,
  dateTimePanelClass,
} from './grDateTimePickerStyles'

/**
 * Классы поля приходят из общего модуля, а он уезжает в `dist/chunks/` —
 * пресет сканирует только `dist/components/<Name>/**`. Классы сетки и колонок
 * объявлены в safelist их собственных компонентов и приезжают через граф
 * зависимостей.
 */
export const grDateTimePickerSafelist: string[] = [
  ...pickerFieldClassTokens.flatMap(splitClassTokens),
  ...splitClassTokens(dateTimePanelClass),
  ...splitClassTokens(dateTimeDividerClass),
  ...splitClassTokens(dateTimeFooterClass),
]
