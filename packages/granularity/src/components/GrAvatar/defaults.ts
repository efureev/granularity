import type { GrComponentSize } from '../shared/sizes'

import type { GrAvatarShape } from './grAvatarStyles'

/**
 * Пропы `GrAvatar`, настраиваемые глобально через
 * `<GrConfigProvider :component-defaults="{ GrAvatar: { … } }">`.
 * Только оформление — см. `GrButton/defaults.ts`.
 */
export interface GrAvatarConfigurableProps {
  size: GrComponentSize
  shape: GrAvatarShape
}

declare module '../../composables/useGrComponentConfig' {
  interface GrComponentDefaultsRegistry {
    GrAvatar: GrAvatarConfigurableProps
  }
}
