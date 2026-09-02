import type { GrComponentSize } from '../GrConfigProvider/context'

/** Пропы `GrTransfer`, настраиваемые глобально через `componentDefaults`. */
export interface GrTransferConfigurableProps {
  size: GrComponentSize
  /**
   * Перетаскивание — усиление поверх кнопок, а не контракт: приложение вправе
   * выключить его на всё поддерево, и клавиатурный путь от этого не пострадает.
   */
  draggable: boolean
}

declare module '../../composables/useGrComponentConfig' {
  interface GrComponentDefaultsRegistry {
    GrTransfer: GrTransferConfigurableProps
  }
}
