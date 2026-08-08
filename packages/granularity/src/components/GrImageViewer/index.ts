import type { ComponentExposed } from '../shared/instance'
import type GrImageViewerComponent from './GrImageViewer.vue'

export { default } from './GrImageViewer.vue'
export { default as GrImageViewer } from './GrImageViewer.vue'
export type { GrImageViewerItem, GrImageViewerSource } from './GrImageViewer.vue'
export { grImageViewerConfig } from './config'
export { grImageViewerSafelist } from './safelist'
export type { GrImageViewerProps } from './GrImageViewer.vue'
export type { GrImageViewerEmits } from './GrImageViewer.vue'
export type GrImageViewerInstance = ComponentExposed<typeof GrImageViewerComponent>
