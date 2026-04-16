export type DsIconSize = 'sm' | 'md' | 'lg'

export function resolveDsIconSizePx(size: DsIconSize | number): number {
    if (typeof size === 'number') return size

    const map: Record<DsIconSize, number> = {
        sm: 16,
        md: 18,
        lg: 20,
    }

    return map[size]
}