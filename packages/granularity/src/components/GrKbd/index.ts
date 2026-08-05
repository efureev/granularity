export { default } from './GrKbd.vue'
export { default as GrKbd } from './GrKbd.vue'
export type { GrKbdPlatform, GrKbdSize } from './GrKbd.vue'
export { grKbdConfig } from './config'
// Реэкспорт затягивает `defaults.ts` (и его аугментацию реестра) к потребителю.
export type { GrKbdConfigurableProps } from './defaults'
export { grKbdSafelist } from './safelist'
