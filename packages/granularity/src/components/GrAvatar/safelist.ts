import { splitClassTokens } from '../shared/classTokens'
import {
  avatarToneClasses,
  groupBaseClass,
  groupItemClass,
  groupOverflowClass,
  mediaClass,
  mediaClipClass,
  rootBaseClass,
  rootNeutralClass,
  rootStatusClass,
  shapes,
  statusDotClass,
  statusToneClass,
} from './grAvatarStyles'

export const grAvatarClassTokens = {
  shapes: Object.values(shapes).flatMap(splitClassTokens),
  root: [
    ...splitClassTokens(rootBaseClass),
    ...splitClassTokens(rootNeutralClass),
    ...splitClassTokens(rootStatusClass),
    // Палитра автоцвета живёт в `.ts`-хелпере: её литералы пресет не видит.
    ...avatarToneClasses.flatMap(splitClassTokens),
  ],
  media: [...splitClassTokens(mediaClass), ...splitClassTokens(mediaClipClass)],
  status: [
    ...splitClassTokens(statusDotClass),
    ...Object.values(statusToneClass).flatMap(splitClassTokens),
  ],
  group: [
    ...splitClassTokens(groupBaseClass),
    ...splitClassTokens(groupItemClass),
    ...splitClassTokens(groupOverflowClass),
  ],
} as const

export const grAvatarSafelist = [...new Set([
  ...grAvatarClassTokens.shapes,
  ...grAvatarClassTokens.root,
  ...grAvatarClassTokens.media,
  ...grAvatarClassTokens.status,
  ...grAvatarClassTokens.group,
])]
