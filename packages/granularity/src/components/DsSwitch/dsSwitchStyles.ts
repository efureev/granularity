export type DsSwitchSize = 'sm' | 'md' | 'lg'

type DsSwitchThumbClassOptions = {
    checked: boolean
    size: DsSwitchSize
}

export const trackBase =
    'relative inline-flex items-center rounded-full border border-[var(--ds-switch-track-brd)] transition-colors duration-150'

export const trackSizes: Record<DsSwitchSize, string> = {
    sm: 'h-5 w-9',
    md: 'h-6 w-11',
    lg: 'h-7 w-14',
}

export const thumbBase =
    'inline-block rounded-full bg-[var(--card)] shadow-[var(--ds-shadow-1)] transition-transform duration-150'

export const thumbSizes: Record<DsSwitchSize, string> = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
}

export const thumbTranslations: Record<DsSwitchSize, { checked: string, unchecked: string }> = {
    sm: {
        checked: 'translate-x-[17px]',
        unchecked: 'translate-x-[2px]',
    },
    md: {
        checked: 'translate-x-5',
        unchecked: 'translate-x-[2px]',
    },
    lg: {
        checked: 'translate-x-[28px]',
        unchecked: 'translate-x-[3px]',
    },
}

export const labelBase = 'text-[var(--muted-fg)]'

export const labelSizes: Record<DsSwitchSize, string> = {
    sm: 'text-sm',
    md: 'text-sm',
    lg: 'text-base',
}

export function dsSwitchTrackClass(size: DsSwitchSize): string {
    return [trackBase, trackSizes[size]].join(' ')
}

export function dsSwitchThumbClass(options: DsSwitchThumbClassOptions): string {
    return [
        thumbBase,
        thumbSizes[options.size],
        thumbTranslations[options.size][options.checked ? 'checked' : 'unchecked'],
    ].join(' ')
}

export function dsSwitchLabelClass(size: DsSwitchSize): string {
    return [labelBase, labelSizes[size]].join(' ')
}
