export { default } from './GrDiff.vue'
export { default as GrDiff } from './GrDiff.vue'
export { grDiffConfig } from './config'
export type { GrDiffEmits, GrDiffHunk, GrDiffMode, GrDiffProps } from './GrDiff.vue'
// Реэкспорт затягивает `defaults.ts` (и его аугментацию реестра) к потребителю.
export type { GrDiffConfigurableProps } from './defaults'
export { grDiffSafelist } from './safelist'
