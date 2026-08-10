import type { GrTone } from '../shared/tones'
import type { GrAlertLive } from './GrAlert.vue'
import type { GrAlertVariant } from './grAlertStyles'

/**
 * Пропы `GrAlert`, настраиваемые глобально через
 * `<GrConfigProvider :component-defaults="{ GrAlert: { … } }">`.
 *
 * `live` выбивается из правила «только оформление» (ср. `GrButton/defaults.ts`)
 * намеренно: режим объявления скринридеру — решение уровня приложения, а не
 * отдельного сообщения. Продукт, у которого алерты не должны перебивать речь,
 * иначе обязан ставить `live="polite"` на каждый.
 */
export interface GrAlertConfigurableProps {
  tone: GrTone
  variant: GrAlertVariant
  closable: boolean
  live: GrAlertLive
}

declare module '../GrConfigProvider/context' {
  interface GrComponentDefaultsRegistry {
    GrAlert: GrAlertConfigurableProps
  }
}
