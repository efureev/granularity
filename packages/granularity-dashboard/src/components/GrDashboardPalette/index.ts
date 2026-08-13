export { default } from './GrDashboardPalette.vue'
export { default as GrDashboardPalette } from './GrDashboardPalette.vue'
export { grDashboardPaletteConfig } from './config'
// Реэкспорт затягивает `defaults.ts` (и его аугментацию реестра) к потребителю.
export type { GrDashboardPaletteConfigurableProps } from './defaults'
export type { GrDashboardPaletteItem, GrDashboardPaletteSize } from './grDashboardPaletteStyles'
export { grDashboardPaletteSafelist } from './safelist'
export type { GrDashboardPaletteEmits, GrDashboardPaletteProps } from './GrDashboardPalette.vue'
