import type { ComponentExposed } from '../shared/instance'
import type GrTreeSectionsComponent from './GrTreeSections.vue'

export { default } from './GrTreeSections.vue'
export { default as GrTreeSections } from './GrTreeSections.vue'
export type { GrTreeSectionsEmits, GrTreeSectionsProps } from './GrTreeSections.vue'
export { grTreeSectionsConfig } from './config'
export { grTreeSectionsSafelist } from './safelist'
export type GrTreeSectionsInstance = ComponentExposed<typeof GrTreeSectionsComponent>
