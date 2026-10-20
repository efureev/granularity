import type { GrButtonGroupAppearance } from '../shared/buttonGroupContext'

/**
 * Пропы `GrButtonGroup`, которые можно задать глобально — темой
 * (`componentDefaults` в `theme.json`) или `GrConfigProvider`.
 */
export interface GrButtonGroupConfigurableProps {
  appearance: GrButtonGroupAppearance
}

declare module '../../composables/useGrComponentConfig' {
  interface GrComponentDefaultsRegistry {
    GrButtonGroup: GrButtonGroupConfigurableProps
  }
}
