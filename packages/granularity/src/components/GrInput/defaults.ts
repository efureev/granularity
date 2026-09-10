import type { GrControlShape } from '../shared/controlShape'
import type { GrComponentSize } from '../GrConfigProvider/context'

/**
 * Пропы `GrInput`, настраиваемые глобально через `componentDefaults`.
 * Только оформление и поведение по умолчанию — см. `GrButton/defaults.ts`.
 *
 * `size` типизируем через `GrComponentSize` (та же шкала `xs…lg`), а не через
 * `GrInputSize`: последний объявлен в `GrInput.vue`, который импортирует
 * контекст, — получился бы цикл модулей.
 */
export interface GrInputConfigurableProps {
  size: GrComponentSize
  clearable: boolean
  /** Форма рамки — см. `components/shared/controlShape.ts`. */
  shape: GrControlShape
}

declare module '../../composables/useGrComponentConfig' {
  interface GrComponentDefaultsRegistry {
    GrInput: GrInputConfigurableProps
  }
}
