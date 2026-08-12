import type { GrBreadcrumbsSize } from './grBreadcrumbsStyles'

/**
 * Пропы `GrBreadcrumbs`, настраиваемые глобально через
 * `<GrConfigProvider :component-defaults="{ GrBreadcrumbs: { … } }">`.
 * Только оформление — см. `GrButton/defaults.ts`.
 */
export interface GrBreadcrumbsConfigurableProps {
  size: GrBreadcrumbsSize
  separator: string
}

declare module '../../composables/useGrComponentConfig' {
  interface GrComponentDefaultsRegistry {
    GrBreadcrumbs: GrBreadcrumbsConfigurableProps
  }
}
