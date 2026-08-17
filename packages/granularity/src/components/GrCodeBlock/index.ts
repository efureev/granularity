export { default } from './GrCodeBlock.vue'
export { default as GrCodeBlock } from './GrCodeBlock.vue'
export { grCodeBlockConfig } from './config'
export type {
  GrCodeBlockEmits,
  GrCodeBlockLanguage,
  GrCodeBlockProps,
  GrCodeToken,
  GrCodeTokenKind,
} from './GrCodeBlock.vue'
// Реэкспорт затягивает `defaults.ts` (и его аугментацию реестра) к потребителю.
export type { GrCodeBlockConfigurableProps } from './defaults'
export { grCodeBlockSafelist } from './safelist'
