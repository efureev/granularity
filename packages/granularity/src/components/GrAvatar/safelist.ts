import { splitClassTokens } from '../shared/classTokens'
import { shapes } from './grAvatarStyles'

export const grAvatarClassTokens = {
    shapes: Object.values(shapes).flatMap(splitClassTokens),
} as const

export const grAvatarSafelist = [...new Set([
    ...grAvatarClassTokens.shapes,
])]
