import { splitClassTokens } from '../shared/classTokens'
import { shapes } from './dsAvatarStyles'

export const dsAvatarClassTokens = {
    shapes: Object.values(shapes).flatMap(splitClassTokens),
} as const

export const dsAvatarSafelist = [...new Set([
    ...dsAvatarClassTokens.shapes,
])]
