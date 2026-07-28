import type { GrButtonSize } from '../GrButton/grButtonStyles'

/** Размерная шкала общая с формным рядом (`GrRadio`, `GrInput`, `GrButton`). */
export type GrCheckboxSize = GrButtonSize

export const rootBase = 'inline-flex items-center select-none'

export const rootGaps: Record<GrCheckboxSize, string> = {
    xs: 'gap-1.5',
    sm: 'gap-1.5',
    md: 'gap-2',
    lg: 'gap-2',
}

export const rootDisabledClass = 'cursor-not-allowed opacity-70'
export const rootEnabledClass = 'cursor-pointer'

export const controlBase = 'rounded border flex items-center justify-center transition-colors duration-150 focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_var(--gr-ring),0_0_0_4px_var(--gr-bg)]'

export const controlSizes: Record<GrCheckboxSize, string> = {
    xs: 'h-3 w-3',
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
}

export const controlCheckedClass = 'border-[var(--gr-primary)] bg-[var(--gr-primary)]'
export const controlUncheckedClass = 'border-[var(--gr-brd)] bg-[var(--gr-bg)]'

// Цвет задаётся состоянием, а не базой: `text-transparent` и `text-[var(--gr-primary-fg)]`
// генерируют одно и то же свойство, и победит не тот, кто правее в атрибуте, а тот,
// кто ниже в сгенерированном CSS. Держим их взаимоисключающими.
export const iconBase = 'gr-checkbox-icon'
export const iconColorClass = 'text-[var(--gr-primary-fg)]'

export const iconSizes: Record<GrCheckboxSize, string> = {
    xs: 'h-2.5 w-2.5',
    sm: 'h-3 w-3',
    md: 'h-3.5 w-3.5',
    lg: 'h-4 w-4',
}

// Галочка «проявляется» анимацией, поэтому у неё есть состояние, а у тире — нет.
export const iconCheckTransitionClass = 'transition-transform transition-opacity duration-150'
export const iconCheckVisibleClass = 'opacity-100 scale-100 text-[var(--gr-primary-fg)]'
export const iconCheckHiddenClass = 'opacity-0 scale-75 text-transparent'

export const labelBase = 'text-[var(--gr-muted-fg)]'

export const labelSizes: Record<GrCheckboxSize, string> = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-sm',
    lg: 'text-base',
}

export function grCheckboxRootClass(options: { size: GrCheckboxSize, disabled: boolean }): string {
    return [
        rootBase,
        rootGaps[options.size],
        options.disabled ? rootDisabledClass : rootEnabledClass,
    ].join(' ')
}

export function grCheckboxControlClass(options: { size: GrCheckboxSize, active: boolean }): string {
    return [
        controlBase,
        controlSizes[options.size],
        options.active ? controlCheckedClass : controlUncheckedClass,
    ].join(' ')
}

export function grCheckboxIndeterminateIconClass(size: GrCheckboxSize): string {
    return [iconBase, iconSizes[size], iconColorClass].join(' ')
}

export function grCheckboxCheckIconClass(options: { size: GrCheckboxSize, checked: boolean }): string {
    return [
        iconBase,
        iconSizes[options.size],
        iconCheckTransitionClass,
        options.checked ? iconCheckVisibleClass : iconCheckHiddenClass,
    ].join(' ')
}

export function grCheckboxLabelClass(size: GrCheckboxSize): string {
    return [labelBase, labelSizes[size]].join(' ')
}
