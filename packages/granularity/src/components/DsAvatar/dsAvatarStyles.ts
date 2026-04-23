export type DsAvatarShape = 'circle' | 'square'

export const shapes: Record<DsAvatarShape, string> = {
    circle: 'rounded-full',
    square: 'rounded-[10px]',
}

export function dsAvatarClass(shape: DsAvatarShape): string {
    return [shapes[shape]].join(' ')
}
