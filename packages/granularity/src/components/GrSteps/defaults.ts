import type { GrStepsOrientation, GrStepsSize, GrStepsVariant } from './grStepsStyles'

/**
 * Пропы `GrSteps`, настраиваемые глобально через `componentDefaults`.
 * Оформление и правило перехода — то, что приложение задаёт один раз на все
 * мастера; текущий шаг относится к экземпляру и сюда не входит.
 */
export interface GrStepsConfigurableProps {
  size: GrStepsSize
  orientation: GrStepsOrientation
  variant: GrStepsVariant
  linear: boolean
  clickable: boolean
}

declare module '../../composables/useGrComponentConfig' {
  interface GrComponentDefaultsRegistry {
    GrSteps: GrStepsConfigurableProps
  }
}
