import { splitClassTokens } from '../../internal/classTokens'

import {
  clearButtonClass,
  fieldBaseClass,
  fieldDisabledClass,
  fieldEnabledClass,
  fieldInvalidClass,
  fieldSizes,
  iconClass,
  indicatorClass,
  spinnerClass,
  trailingZoneClass,
} from './grDatePickerStyles'

/**
 * Классы из `.ts`-хелпера обязаны быть в safelist: хелпер уезжает в общий
 * `dist/chunks/`, а пресет сканирует только `dist/components/<Name>/**`.
 *
 * Ссылки на сами константы, а не копии строками: копия расходится молча.
 */
export const grDatePickerSafelist: string[] = [
  ...splitClassTokens(fieldBaseClass),
  ...splitClassTokens(fieldEnabledClass),
  ...splitClassTokens(fieldDisabledClass),
  ...splitClassTokens(fieldInvalidClass),
  ...Object.values(fieldSizes).flatMap(splitClassTokens),
  ...splitClassTokens(trailingZoneClass),
  ...splitClassTokens(indicatorClass),
  ...splitClassTokens(clearButtonClass),
  ...splitClassTokens(iconClass),
  ...splitClassTokens(spinnerClass),
]
