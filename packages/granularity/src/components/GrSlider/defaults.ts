import type { GrSliderSize } from './grSliderStyles'

/**
 * Пропы `GrSlider`, настраиваемые глобально через
 * `<GrConfigProvider :component-defaults="{ GrSlider: { … } }">`.
 * Только оформление — см. `GrButton/defaults.ts`.
 */
export interface GrSliderConfigurableProps {
  size: GrSliderSize
}

declare module '../GrConfigProvider/context' {
  interface GrComponentDefaultsRegistry {
    GrSlider: GrSliderConfigurableProps
  }
}
