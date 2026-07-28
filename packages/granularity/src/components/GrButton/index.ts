export { default } from './GrButton.vue'
export { default as GrButton } from './GrButton.vue'
export { grButtonConfig } from './config'
// Реэкспорт обязателен: он затягивает `defaults.ts` в граф типов потребителя,
// а вместе с ним — аугментацию реестра `GrConfigProvider`.
export type { GrButtonConfigurableProps } from './defaults'

export type { GrButtonSize, GrButtonTone, GrButtonVariant } from './grButtonStyles'
export { grButtonClass } from './grButtonStyles'
export { grButtonClassTokens, grButtonSafelist } from './safelist'
