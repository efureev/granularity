import type { GrComponentSize } from '../shared/configContext'

/**
 * Пропы `GrOtpInput`, настраиваемые глобально через `componentDefaults`.
 * Только оформление и поведение по умолчанию — см. `GrButton/defaults.ts`.
 */
export interface GrOtpInputConfigurableProps {
  size: GrComponentSize
  length: number
  masked: boolean
}

declare module '../../composables/useGrComponentConfig' {
  interface GrComponentDefaultsRegistry {
    GrOtpInput: GrOtpInputConfigurableProps
  }
}
