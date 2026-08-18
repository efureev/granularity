import type { ComponentExposed } from '../shared/instance'
import type GrStepsComponent from './GrSteps.vue'

export { default } from './GrSteps.vue'
export { default as GrSteps } from './GrSteps.vue'
export { grStepsConfig } from './config'
// Реэкспорт затягивает `defaults.ts` (и его аугментацию реестра) к потребителю.
export type { GrStepsConfigurableProps } from './defaults'
export type { GrStepsOrientation, GrStepsSize, GrStepsVariant } from './grStepsStyles'
export { grStepsSafelist } from './safelist'
export type { GrStep, GrStepStatus } from './stepsModel'
export type { GrStepsEmits, GrStepsProps } from './GrSteps.vue'
export type GrStepsInstance = ComponentExposed<typeof GrStepsComponent>
