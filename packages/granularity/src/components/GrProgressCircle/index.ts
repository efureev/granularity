import type { ComponentExposed } from '../shared/instance'
import type GrProgressCircleComponent from './GrProgressCircle.vue'

export { default } from './GrProgressCircle.vue'
export { default as GrProgressCircle } from './GrProgressCircle.vue'
export type {
  GrProgressCircleProps,
  GrProgressCircleShape,
  GrProgressCircleSize,
  GrProgressCircleTone,
} from './GrProgressCircle.vue'
export { grProgressCircleConfig } from './config'
export { arcGeometry, clampProgress, GR_PROGRESS_CIRCLE_SHAPES } from './geometry'
export type { GrArcGeometry } from './geometry'
export { grProgressCircleSafelist } from './safelist'
export type { GrProgressCircleConfigurableProps } from './defaults'
export type GrProgressCircleInstance = ComponentExposed<typeof GrProgressCircleComponent>
