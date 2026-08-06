export { default } from './GrTreeSelect.vue'
export { default as GrTreeSelect } from './GrTreeSelect.vue'
export type { GrTreeSelectModelValue, GrTreeSelectProps, GrTreeSelectValueDisplay } from './grTreeSelectTypes'
export { grTreeSelectConfig } from './config'
// Реэкспорт затягивает `defaults.ts` (и его аугментацию реестра) к потребителю.
export type { GrTreeSelectConfigurableProps } from './defaults'
export { grTreeSelectSafelist } from './safelist'