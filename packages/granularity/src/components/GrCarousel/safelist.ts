import { splitClassTokens } from '../shared/classTokens'
import { GR_TONES } from '../shared/tones'
import { grCarouselDotActiveClass, grCarouselThumbActiveClass } from './grCarouselStyles'

/**
 * Только текущий переключатель: его классы склеиваются в рантайме из тона и
 * скобок `arbitrary()` (`grCarouselStyles.ts`: `grCarouselDotActiveClass` —
 * заливка, обвод и его отступ; `grCarouselThumbActiveClass` — рамка миниатюры),
 * и целиком их нет ни в одной строке кода. Тон приходит пропом, поэтому
 * объявлена вся шкала. Остальное компонент берёт литералами, и granum извлекает
 * это из его чанков сам, включая общие.
 */
export const grCarouselSafelist = [...new Set([
  ...GR_TONES.flatMap(tone => splitClassTokens(grCarouselDotActiveClass(tone))),
  ...GR_TONES.flatMap(tone => splitClassTokens(grCarouselThumbActiveClass(tone))),
])]
