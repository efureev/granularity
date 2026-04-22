import { splitClassTokens } from '../shared/classTokens'
import { PLACEMENT_CLASS } from './dsToasterStyles'

// В safelist попадают только те классы, которые приходят в шаблон динамически
// (через `:class`/`PLACEMENT_CLASS`). Литералы из шаблона (`class="..."`)
// UnoCSS находит статическим сканом и дублировать их здесь не нужно.
export const dsToasterSafelist = [...new Set(
  Object.values(PLACEMENT_CLASS).flatMap(splitClassTokens),
)]
