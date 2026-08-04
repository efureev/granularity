import type { GrComponentSize } from '../GrConfigProvider/context'

/** Пропы `GrPagination`, настраиваемые глобально через `componentDefaults`. */
export interface GrPaginationConfigurableProps {
  size: GrComponentSize
}

declare module '../GrConfigProvider/context' {
  interface GrComponentDefaultsRegistry {
    GrPagination: GrPaginationConfigurableProps
  }
}
