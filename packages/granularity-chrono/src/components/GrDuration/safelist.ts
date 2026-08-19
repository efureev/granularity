import { splitClassTokens } from '../../internal/classTokens'

import { durationClass } from './grDurationStyles'

/**
 * Класс приезжает из `.ts`-хелпера, а пресет сканирует только
 * `dist/components/<Name>/**` — без safelist он молча не сгенерируется.
 */
export const grDurationSafelist: string[] = splitClassTokens(durationClass)
