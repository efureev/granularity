import { splitClassTokens } from '../../internal/classTokens'

import { relativeTimeClass } from './grRelativeTimeStyles'

/**
 * Класс приезжает из `.ts`-хелпера, а пресет сканирует только
 * `dist/components/<Name>/**` — без safelist он молча не сгенерируется.
 */
export const grRelativeTimeSafelist: string[] = splitClassTokens(relativeTimeClass)
