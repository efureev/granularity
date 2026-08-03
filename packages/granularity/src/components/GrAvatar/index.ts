export { default } from './GrAvatar.vue'
export { default as GrAvatar } from './GrAvatar.vue'
export { grAvatarConfig } from './config'

export type { GrAvatarShape } from './grAvatarStyles'
export { grAvatarSafelist } from './safelist'
// Реэкспорт затягивает `defaults.ts` (и его аугментацию реестра) к потребителю.
export type { GrAvatarConfigurableProps } from './defaults'
