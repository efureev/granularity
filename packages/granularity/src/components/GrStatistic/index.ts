export { default } from './GrStatistic.vue'
export { default as GrStatistic } from './GrStatistic.vue'
export { grStatisticConfig } from './config'
export { formatStatisticValue } from './formatStatisticValue'
export type {
  GrStatisticEmits,
  GrStatisticFormatOptions,
  GrStatisticProps,
  GrStatisticSize,
  GrStatisticTone,
  GrStatisticTrend,
} from './GrStatistic.vue'
export { grStatisticSafelist } from './safelist'
// Реэкспорт затягивает `defaults.ts` (и его аугментацию реестра) к потребителю.
export type { GrStatisticConfigurableProps } from './defaults'
