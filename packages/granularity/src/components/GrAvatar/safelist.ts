import { splitClassTokens } from '../shared/classTokens'
import {
  groupBaseClass,
  groupItemClass,
  groupOverflowClass,
  mediaClass,
  rootBaseClass,
  rootStatusClass,
  shapes,
  statusDotClass,
  statusToneClass,
} from './grAvatarStyles'

export const grAvatarClassTokens = {
  shapes: Object.values(shapes).flatMap(splitClassTokens),
  root: [...splitClassTokens(rootBaseClass), ...splitClassTokens(rootStatusClass)],
  media: splitClassTokens(mediaClass),
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
