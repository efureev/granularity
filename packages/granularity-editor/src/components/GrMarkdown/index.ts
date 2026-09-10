export { default } from './GrMarkdown.vue'
export { default as GrMarkdown } from './GrMarkdown.vue'
export { grMarkdownConfig } from './config'
export { default as GrMarkdownCode } from './GrMarkdownCode.vue'
export type { GrMarkdownCodeProps } from './GrMarkdownCode.vue'
export type { GrMarkdownConfigurableProps } from './defaults'
export { estimateBlockSize } from './estimateBlockSize'
export { grMarkdownSafelist } from './grMarkdownStyles'
export type { GrMarkdownDensity, GrMarkdownSize } from './grMarkdownStyles'
export type { GrMarkdownEmits, GrMarkdownProps } from './GrMarkdown.vue'
export type { GrMarkdownRenderContext, GrMarkdownRenderers } from './renderNodes'

/**
 * Типы дерева — из корня пакета тоже: их называют эмиты и `components`,
 * и потребитель не должен искать их по подпутям.
 */
export type {
  GrMarkdownEngine,
  GrMarkdownParseOptions,
  GrMdAlertTone,
  GrMdBlock,
  GrMdBlockNode,
  GrMdHeading,
  GrMdHtmlMode,
  GrMdInline,
} from '../../markdown/types'
