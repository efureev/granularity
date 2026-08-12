import type { GrComponentSize } from '../GrConfigProvider/context'

/**
 * Пропы `GrPopover`, настраиваемые глобально через `componentDefaults`.
 *
 * Только оформление: `open` и обработчики принадлежат конкретному экземпляру и
 * через конфиг задаваться не должны.
 */
export interface GrPopoverConfigurableProps {
  size: GrComponentSize
}

declare module '../../composables/useGrComponentConfig' {
  interface GrComponentDefaultsRegistry {
    GrPopover: GrPopoverConfigurableProps
  }
}
