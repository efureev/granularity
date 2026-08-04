import type { GrTone } from '../shared/tones'
import type { GrAlertVariant } from './grAlertStyles'

/**
 * Пропы `GrAlert`, настраиваемые глобально через
 * `<GrConfigProvider :component-defaults="{ GrAlert: { … } }">`.
 * Только оформление — см. `GrButton/defaults.ts`.
 */
export interface GrAlertConfigurableProps {
  tone: GrTone
  variant: GrAlertVariant
  closable: boolean
}

declare module '../GrConfigProvider/context' {
  interface GrComponentDefaultsRegistry {
    GrAlert: GrAlertConfigurableProps
  }
}
