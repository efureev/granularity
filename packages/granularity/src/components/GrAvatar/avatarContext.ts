import type { InjectionKey } from 'vue'

import type { GrAvatarShape } from './grAvatarStyles'
import type { GrSizeWithPx } from '../shared/sizes'

/**
 * Контекст `GrAvatarGroup`: размер и форма задаются на группе, чтобы ряд
 * аватаров не расползался, когда потребитель забыл повторить пропы у каждого.
 */
export interface GrAvatarGroupContext {
  size?: GrSizeWithPx
  shape?: GrAvatarShape
}

export const GR_AVATAR_GROUP_KEY: InjectionKey<GrAvatarGroupContext> = Symbol.for('@feugene/granularity/avatar-group')
