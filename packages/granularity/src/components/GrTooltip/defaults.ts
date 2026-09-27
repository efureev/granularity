import type { GrComponentSize } from '../shared/configContext'

/** Пропы `GrTooltip`, настраиваемые глобально через `componentDefaults`. */
export interface GrTooltipConfigurableProps {
  size: GrComponentSize
}

declare module '../../composables/useGrComponentConfig' {
  interface GrComponentDefaultsRegistry {
    GrTooltip: GrTooltipConfigurableProps
  }
}
