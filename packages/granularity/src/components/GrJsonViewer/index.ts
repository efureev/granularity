import type { ComponentExposed } from '../shared/instance'
import type GrJsonViewerComponent from './GrJsonViewer.vue'

export { default } from './GrJsonViewer.vue'
export { default as GrJsonViewer } from './GrJsonViewer.vue'
export { grJsonViewerConfig } from './config'
// Реэкспорт затягивает `defaults.ts` (и его аугментацию реестра) к потребителю.
export type { GrJsonViewerConfigurableProps } from './defaults'

export type {
  GrJsonNode,
  GrJsonNodeKind,
  GrJsonViewerEmits,
  GrJsonViewerProps,
} from './GrJsonViewer.vue'
export { grJsonViewerSafelist } from './safelist'
export type GrJsonViewerInstance = ComponentExposed<typeof GrJsonViewerComponent>
