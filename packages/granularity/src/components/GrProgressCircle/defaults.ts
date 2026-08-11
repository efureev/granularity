import type { GrProgressCircleShape } from './geometry'
import type { GrProgressCircleSize, GrProgressCircleTone } from './grProgressCircleStyles'

/**
 * Пропы `GrProgressCircle`, настраиваемые глобально через `componentDefaults`.
 *
 * Только оформление: значение и режим принадлежат конкретному экземпляру.
 */
export interface GrProgressCircleConfigurableProps {
  size: GrProgressCircleSize
  tone: GrProgressCircleTone
  shape: GrProgressCircleShape
  trackless: boolean
}

declare module '../GrConfigProvider/context' {
  interface GrComponentDefaultsRegistry {
    GrProgressCircle: GrProgressCircleConfigurableProps
  }
}
