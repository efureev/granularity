import type { GrComponentSize } from '../GrConfigProvider/context'

/**
 * Пропы `GrInputTag`, настраиваемые глобально через `componentDefaults`.
 *
 * `size` типизируем через `GrComponentSize` (та же шкала `xs…lg`), а не через
 * `GrInputTagSize`: последний выводится из `GrInput.vue`, который импортирует
 * контекст, — получился бы цикл модулей (то же ограничение, что у `GrInput`).
 */
export interface GrInputTagConfigurableProps {
  size: GrComponentSize
  clearable: boolean
}

declare module '../GrConfigProvider/context' {
  interface GrComponentDefaultsRegistry {
    GrInputTag: GrInputTagConfigurableProps
  }
}
