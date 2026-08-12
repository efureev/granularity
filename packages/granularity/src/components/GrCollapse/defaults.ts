import type { GrComponentSize } from '../shared/sizes'
import type { GrCollapseHeadingLevel, GrCollapseIconPosition } from './grCollapseContext'

/**
 * Пропы `GrCollapse`, настраиваемые глобально через
 * `<GrConfigProvider :component-defaults="{ GrCollapse: { … } }">`.
 * Только оформление — см. `GrButton/defaults.ts`.
 */
export interface GrCollapseConfigurableProps {
  size: GrComponentSize
  divided: boolean
  borderless: boolean
  expandIconPosition: GrCollapseIconPosition
  headingLevel: GrCollapseHeadingLevel
}

declare module '../../composables/useGrComponentConfig' {
  interface GrComponentDefaultsRegistry {
    GrCollapse: GrCollapseConfigurableProps
  }
}
