import type { GrComponentSize } from '../shared/sizes'

export type GrSwitchSize = GrComponentSize

/** Сторона подписи относительно дорожки — логическая, не физическая (RTL). */
export const GR_SWITCH_LABEL_POSITIONS = ['start', 'end'] as const
export type GrSwitchLabelPosition = typeof GR_SWITCH_LABEL_POSITIONS[number]

type GrSwitchThumbClassOptions = {
    checked: boolean
    size: GrSwitchSize
}

export const rootBase = 'inline-flex items-center gap-2 select-none disabled:cursor-not-allowed'

/** `start` разворачивает ряд, а не меняет порядок узлов: DOM-порядок читает диктор. */
export const rootLabelPositions: Record<GrSwitchLabelPosition, string> = {
    start: 'flex-row-reverse',
    end: '',
}

export const trackBase =
    'relative inline-flex shrink-0 items-center rounded-full border border-[var(--gr-switch-track-brd)] transition-colors duration-[var(--gr-duration-fast)]'

export const trackSizes: Record<GrSwitchSize, string> = {
    xs: 'h-4 w-7',
  sm: 'h-5 w-9',
    md: 'h-6 w-11',
    lg: 'h-7 w-14',
}

export const thumbBase =
    'inline-flex shrink-0 items-center justify-center rounded-full bg-[var(--gr-card)] shadow-[var(--gr-shadow-1)] transition-transform duration-[var(--gr-duration-fast)]'

export const thumbSizes: Record<GrSwitchSize, string> = {
    xs: 'h-3 w-3',
  sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
}

/** Спиннер загрузки живёт в бегунке, поэтому мельче его на ступень. */
export const thumbSpinnerSizes: Record<GrSwitchSize, string> = {
    xs: 'h-2 w-2',
    sm: 'h-2.5 w-2.5',
    md: 'h-3 w-3',
    lg: 'h-4 w-4',
}

export const thumbSpinnerBase = 'animate-spin text-[var(--gr-muted-fg)]'

export const thumbTranslations: Record<GrSwitchSize, { checked: string, unchecked: string }> = {
    xs: {
        checked: 'translate-x-[13px]',
        unchecked: 'translate-x-[2px]',
    },
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

export const labelBase = 'text-[var(--gr-muted-fg)]'

/**
 * Недоступность гасится токеном, а не `opacity`: прозрачность разбавляет
 * выверенные на AA токены текста и роняет контраст подписи.
 */
export const labelDisabledClass = 'text-[var(--gr-disabled-fg)]'

export const labelSizes: Record<GrSwitchSize, string> = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-sm',
    lg: 'text-base',
}

export function grSwitchRootClass(labelPosition: GrSwitchLabelPosition): string {
    return [rootBase, rootLabelPositions[labelPosition]].filter(Boolean).join(' ')
}

export function grSwitchTrackClass(size: GrSwitchSize): string {
    return [trackBase, trackSizes[size]].join(' ')
}

export function grSwitchThumbClass(options: GrSwitchThumbClassOptions): string {
    return [
        thumbBase,
        thumbSizes[options.size],
        thumbTranslations[options.size][options.checked ? 'checked' : 'unchecked'],
    ].join(' ')
}

export function grSwitchSpinnerClass(size: GrSwitchSize): string {
    return [thumbSpinnerBase, thumbSpinnerSizes[size]].join(' ')
}

export function grSwitchLabelClass(size: GrSwitchSize, disabled = false): string {
    return [disabled ? labelDisabledClass : labelBase, labelSizes[size]].join(' ')
}
