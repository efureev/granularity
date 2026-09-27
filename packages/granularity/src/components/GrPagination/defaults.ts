import type { GrComponentSize } from '../shared/configContext'

/** Пропы `GrPagination`, настраиваемые глобально через `componentDefaults`. */
export interface GrPaginationConfigurableProps {
  size: GrComponentSize
}

declare module '../../composables/useGrComponentConfig' {
  interface GrComponentDefaultsRegistry {
    GrPagination: GrPaginationConfigurableProps
  }
}
