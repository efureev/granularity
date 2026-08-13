import type { ComponentExposed } from '../shared/instance'
import type GrSplitterComponent from './GrSplitter.vue'

export { default } from './GrSplitter.vue'
export { default as GrSplitter } from './GrSplitter.vue'
export type { GrSplitterEmits, GrSplitterOrientation, GrSplitterProps } from './GrSplitter.vue'
export { grSplitterConfig } from './config'
export { sizeFromPointer } from './splitterGeometry'
export type { GrSplitterBounds } from './splitterGeometry'
export { grSplitterSafelist } from './safelist'
export type { GrSplitterConfigurableProps } from './defaults'
export type GrSplitterInstance = ComponentExposed<typeof GrSplitterComponent>
