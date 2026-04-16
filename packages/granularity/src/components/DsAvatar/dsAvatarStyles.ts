import { splitClassTokens } from '../shared/classTokens'

export type DsAvatarShape = 'circle' | 'square'

const shapes: Record<DsAvatarShape, string> = {
    circle: 'rounded-full',
    square: 'rounded-[10px]',
}


export const dsAvatarClassTokens = {
    shapes: Object.values(shapes).flatMap(splitClassTokens),
} as const

export const dsAvatarSafelist = [...new Set([
    ...dsAvatarClassTokens.shapes,
])]

export function dsAvatarClass(shape: DsAvatarShape): string {
    return [shapes[shape]].join(' ')
}