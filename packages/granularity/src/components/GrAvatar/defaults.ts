import type { GrComponentSize } from '../shared/sizes'

/**
 * Пропы `GrAvatar`, настраиваемые глобально через
 * `<GrConfigProvider :component-defaults="{ GrAvatar: { … } }">`.
 * Только оформление — см. `GrButton/defaults.ts`.
 */
export interface GrAvatarConfigurableProps {
  size: GrComponentSize
}

declare module '../GrConfigProvider/context' {
  interface GrComponentDefaultsRegistry {
    GrAvatar: GrAvatarConfigurableProps
  }
}
