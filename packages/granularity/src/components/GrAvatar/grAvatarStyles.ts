export type GrAvatarShape = 'circle' | 'square'

export const shapes: Record<GrAvatarShape, string> = {
    circle: 'rounded-full',
    square: 'rounded-[10px]',
}

export function grAvatarClass(shape: GrAvatarShape): string {
    return [shapes[shape]].join(' ')
}
