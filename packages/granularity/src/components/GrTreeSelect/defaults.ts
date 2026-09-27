import type { GrControlShape } from '../shared/controlShape'

import type { GrComponentSize } from '../shared/configContext'

/** Пропы `GrTreeSelect`, настраиваемые глобально через `componentDefaults`. */
export interface GrTreeSelectConfigurableProps {
  size: GrComponentSize
  /** Форма рамки — см. `components/shared/controlShape.ts`. */
  shape: GrControlShape
}

declare module '../../composables/useGrComponentConfig' {
  interface GrComponentDefaultsRegistry {
    GrTreeSelect: GrTreeSelectConfigurableProps
  }
}
