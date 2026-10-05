import { GR_TONES } from '../shared/tones'
import { grProgressBarFillClass } from './grStyle'

// Заливку по тону клеит `grStyle.ts: grProgressBarFillClass` — `bg-` к `[var(...)]`
// из мапы `toneVars`, и целиком класс не лежит ни в одной строке кода. Поэтому
// семейство объявлено по всем тонам. Остальное (толщина трека, зазоры, кегль
// подписи, буфер) — литералы, granum извлекает их из чанков компонента сам.
export const grProgressBarSafelist: string[] = GR_TONES.map(tone => grProgressBarFillClass(tone))
