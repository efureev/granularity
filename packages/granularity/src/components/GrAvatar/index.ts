export { default } from './GrAvatar.vue'
export { default as GrAvatar } from './GrAvatar.vue'
export { default as GrAvatarGroup, type GrAvatarGroupProps } from './GrAvatarGroup.vue'
export { grAvatarConfig } from './config'
export { GR_AVATAR_STATUSES } from './grAvatarStyles'
export type { GrAvatarProps, GrAvatarStatus } from './GrAvatar.vue'

export type { GrAvatarShape } from './grAvatarStyles'
export { initialsFrom } from './grAvatarStyles'
export { grAvatarSafelist } from './safelist'
// Реэкспорт затягивает `defaults.ts` (и его аугментацию реестра) к потребителю.
export type { GrAvatarConfigurableProps } from './defaults'
