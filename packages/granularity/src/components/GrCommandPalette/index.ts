import type { ComponentExposed } from '../shared/instance'
import type GrCommandPaletteComponent from './GrCommandPalette.vue'

export { default } from './GrCommandPalette.vue'
export { default as GrCommandPalette } from './GrCommandPalette.vue'
export { grCommandPaletteConfig } from './config'
export type {
  GrCommandFilter,
  GrCommandGroup,
  GrCommandItem,
  GrCommandPaletteProps,
  GrCommandPaletteSize,
} from './GrCommandPalette.vue'
export { grCommandPaletteSafelist } from './safelist'
export type { GrCommandPaletteEmits } from './GrCommandPalette.vue'
export type GrCommandPaletteInstance = ComponentExposed<typeof GrCommandPaletteComponent>
