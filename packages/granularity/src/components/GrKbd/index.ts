export { default } from './GrKbd.vue'
export { default as GrKbd } from './GrKbd.vue'
export type { GrKbdPlatform, GrKbdSize } from './GrKbd.vue'
export { grKbdConfig } from './config'
// Реэкспорт затягивает `defaults.ts` (и его аугментацию реестра) к потребителю.
export type { GrKbdConfigurableProps } from './defaults'
export { grKbdSafelist } from './safelist'
/**
 * Каталог поддерживаемых клавиш: по нему витрина и дока строят список, а не
 * держат свою копию.
 */
export { findKbdToken, GR_KBD_TOKENS } from '../shared/hotkeyTokens'
export type { GrKbdKeyName, GrKbdTokenGroup, GrKbdTokenSpec } from '../shared/hotkeyTokens'
export type { GrKbdProps } from './GrKbd.vue'
