import { splitClassTokens } from '../../internal/classTokens'
import { pickerFieldClassTokens } from '../../internal/pickerFieldStyles'
import { presetRowClassTokens } from '../../internal/presetRowStyles'

/**
 * Классы поля приходят из общего модуля, а он уезжает в `dist/chunks/` —
 * пресет сканирует только `dist/components/<Name>/**`. Своих классов у пикера
 * нет: панель рисует `GrCalendar`, её safelist объявлен там.
 */
export const grDatePickerSafelist: string[] = [
  ...pickerFieldClassTokens,
  ...presetRowClassTokens,
].flatMap(splitClassTokens)
