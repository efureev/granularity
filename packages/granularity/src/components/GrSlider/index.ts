export { default } from './GrSlider.vue'
export { default as GrSlider } from './GrSlider.vue'
export { grSliderConfig } from './config'
// Реэкспорт затягивает `defaults.ts` (и его аугментацию реестра) к потребителю.
export type { GrSliderConfigurableProps } from './defaults'
export type {
  GrSliderMarks,
  GrSliderModelValue,
  GrSliderProps,
  GrSliderSize,
} from './GrSlider.vue'
export { grSliderSafelist } from './safelist'
