import {
    dsButtonBaseClass,
    dsButtonClass,
    type DsButtonSize,
    type DsButtonTone,
    type DsButtonVariant,
} from '../DsButton/dsButtonStyles'

export type DsRadioVariant = 'radiobox' | 'button'

export const dsRadioDisabledClass = 'opacity-50 cursor-not-allowed'
export const dsRadioEnabledClass = 'cursor-pointer'
export const dsRadioRootDisabledClass = 'cursor-not-allowed opacity-70'
export const dsRadioRootEnabledClass = 'cursor-pointer'
export const dsRadioControlCheckedClass = 'border-[var(--primary)] bg-[color-mix(in_srgb,var(--primary)_10%,var(--bg))]'
export const dsRadioControlUncheckedClass = 'border-[var(--brd)] bg-[var(--bg)]'
export const dsRadioDotCheckedClass = 'bg-[var(--primary)] opacity-100 scale-100'
export const dsRadioDotUncheckedClass = 'bg-transparent opacity-0 scale-75'
// Базовые классы «точки» внутри radiobox — нестандартные (`h-[6px]`, `w-[6px]`, произвольный transition).
// Вынесены сюда, чтобы `safelist` мог гарантировать их присутствие в сборке даже при tree-shaking шаблона.
export const dsRadioDotBaseClass = 'h-[6px] w-[6px] rounded-full transition-[transform,opacity,background-color] duration-150'

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
        options.disabled ? dsRadioDisabledClass : dsRadioEnabledClass,
    ].join(' ')
}

export function dsRadioRootClass(disabled: boolean): string {
    return disabled ? dsRadioRootDisabledClass : dsRadioRootEnabledClass
}

export function dsRadioControlClass(checked: boolean): string {
    return checked ? dsRadioControlCheckedClass : dsRadioControlUncheckedClass
}

export function dsRadioDotClass(checked: boolean): string {
    return checked ? dsRadioDotCheckedClass : dsRadioDotUncheckedClass
}
