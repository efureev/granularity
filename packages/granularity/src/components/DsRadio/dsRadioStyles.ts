import {
    dsButtonBaseClass,
    dsButtonClass,
    dsButtonSafelist,
    type DsButtonSize,
    type DsButtonTone,
    type DsButtonVariant,
} from '../DsButton/dsButtonStyles'
import {splitClassTokens} from '../shared/classTokens'

export type DsRadioVariant = 'radiobox' | 'button'

export function dsRadioButtonClass(options: {
    checked: boolean
    disabled: boolean
    size: DsButtonSize
    buttonVariant: DsButtonVariant
    buttonTone: DsButtonTone
    selectedButtonVariant: DsButtonVariant
    selectedButtonTone: DsButtonTone
}): string {
    const variant = options.checked ? options.selectedButtonVariant : options.buttonVariant
    const tone = options.checked ? options.selectedButtonTone : options.buttonTone

    return [
        dsButtonBaseClass,
        dsButtonClass({
            variant,
            tone,
            size: options.size,
            square: false,
        }),
        options.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
    ].join(' ')
}

export function dsRadioRootClass(disabled: boolean): string {
    return disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'
}

export function dsRadioControlClass(checked: boolean): string {
    return checked
        ? 'border-[var(--primary)] bg-[color-mix(in_srgb,var(--primary)_10%,var(--bg))]'
        : 'border-[var(--brd)] bg-[var(--bg)]'
}

export const dsRadioDotBaseClass = 'h-[6px] w-[6px] rounded-full transition-[transform,opacity,background-color] duration-150'

export function dsRadioDotClass(checked: boolean): string {
    return checked
        ? 'bg-[var(--primary)] opacity-100 scale-100'
        : 'bg-transparent opacity-0 scale-75'
}

export const dsRadioSafelist = [...new Set([
    ...dsButtonSafelist,
    ...splitClassTokens('opacity-50 cursor-not-allowed cursor-pointer opacity-70'),
    ...splitClassTokens('border-[var(--primary)] bg-[color-mix(in_srgb,var(--primary)_10%,var(--bg))]'),
    ...splitClassTokens('border-[var(--brd)] bg-[var(--bg)]'),
    ...splitClassTokens(dsRadioDotBaseClass),
    ...splitClassTokens('bg-[var(--primary)] opacity-100 scale-100'),
    ...splitClassTokens('bg-transparent opacity-0 scale-75'),
])]