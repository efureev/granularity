import type { GrComponentSize } from '../GrConfigProvider/context'

/** Пропы `GrTooltip`, настраиваемые глобально через `componentDefaults`. */
export interface GrTooltipConfigurableProps {
  size: GrComponentSize
}

declare module '../../composables/useGrComponentConfig' {
  interface GrComponentDefaultsRegistry {
    GrTooltip: GrTooltipConfigurableProps
  }
}
