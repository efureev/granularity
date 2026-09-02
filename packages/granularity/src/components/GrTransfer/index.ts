import type { ComponentExposed } from '../shared/instance'
import type GrTransferComponent from './GrTransfer.vue'

export { default } from './GrTransfer.vue'
export { default as GrTransfer } from './GrTransfer.vue'
export { grTransferConfig } from './config'
// Реэкспорт затягивает `defaults.ts` (и его аугментацию реестра) к потребителю.
export type { GrTransferConfigurableProps } from './defaults'
export type { GrTransferEmits, GrTransferProps } from './GrTransfer.vue'
export type { GrTransferSize } from './grTransferStyles'
export { grTransferSafelist } from './safelist'
export type {
  GrTransferDirection,
  GrTransferKey,
  GrTransferSide,
} from './transferModel'
export type GrTransferInstance = ComponentExposed<typeof GrTransferComponent>
