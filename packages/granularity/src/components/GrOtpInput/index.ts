import type { ComponentExposed } from '../shared/instance'
import type GrOtpInputComponent from './GrOtpInput.vue'

export { default } from './GrOtpInput.vue'
export { default as GrOtpInput } from './GrOtpInput.vue'
export { grOtpInputConfig } from './config'
// Реэкспорт затягивает `defaults.ts` (и его аугментацию реестра) к потребителю.
export type { GrOtpInputConfigurableProps } from './defaults'
export { grOtpInputSafelist } from './safelist'

export type { GrOtpInputEmits, GrOtpInputProps, GrOtpInputSize, GrOtpInputType } from './GrOtpInput.vue'
export type GrOtpInputInstance = ComponentExposed<typeof GrOtpInputComponent>
