import type { GrCommandPaletteSize } from './grCommandPaletteStyles'

/**
 * Пропы `GrCommandPalette`, настраиваемые глобально через
 * `<GrConfigProvider :component-defaults="{ GrCommandPalette: { … } }">`.
 * Только оформление — см. `GrButton/defaults.ts`.
 */
export interface GrCommandPaletteConfigurableProps {
  size: GrCommandPaletteSize
}

declare module '../GrConfigProvider/context' {
  interface GrComponentDefaultsRegistry {
    GrCommandPalette: GrCommandPaletteConfigurableProps
  }
}
