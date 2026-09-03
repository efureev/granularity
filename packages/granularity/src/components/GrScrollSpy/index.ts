import type { ComponentExposed } from '../shared/instance'
import type GrScrollSpyComponent from './GrScrollSpy.vue'

export { default } from './GrScrollSpy.vue'
export { default as GrScrollSpy } from './GrScrollSpy.vue'
export type { GrScrollSpyEmits, GrScrollSpyProps } from './GrScrollSpy.vue'
export type { GrScrollSpySection } from './scrollSpyItems'
export { grScrollSpyConfig } from './config'
export { grScrollSpySafelist } from './safelist'
export type GrScrollSpyInstance = ComponentExposed<typeof GrScrollSpyComponent>
