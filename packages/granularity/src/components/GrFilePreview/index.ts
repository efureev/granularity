export { default } from './GrFilePreview.vue'
export { default as GrFilePreview } from './GrFilePreview.vue'
export { grFilePreviewConfig } from './config'
export { fileKindOf, isPreviewableKind } from './fileKindOf'
export type {
  GrFileKind,
  GrFilePreviewEmits,
  GrFilePreviewProps,
  GrFilePreviewRatio,
} from './GrFilePreview.vue'
// Реэкспорт затягивает `defaults.ts` (и его аугментацию реестра) к потребителю.
export type { GrFilePreviewConfigurableProps } from './defaults'
export { grFilePreviewSafelist } from './safelist'
