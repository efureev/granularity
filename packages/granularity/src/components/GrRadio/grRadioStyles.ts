import {
    grButtonBaseClass,
    grButtonClass,
    type GrButtonSize,
    type GrButtonTone,
    type GrButtonVariant,
} from '../GrButton/grButtonStyles'

export type GrRadioVariant = 'radiobox' | 'button'

export const grRadioDisabledClass = 'opacity-50 cursor-not-allowed'
export const grRadioEnabledClass = 'cursor-pointer'
export const grRadioRootDisabledClass = 'cursor-not-allowed opacity-70'
export const grRadioRootEnabledClass = 'cursor-pointer'
export const grRadioControlCheckedClass = 'border-[var(--primary)] bg-[color-mix(in_srgb,var(--primary)_10%,var(--bg))]'
export const grRadioControlUncheckedClass = 'border-[var(--brd)] bg-[var(--bg)]'
export const grRadioDotCheckedClass = 'bg-[var(--primary)] opacity-100 scale-100'
export const grRadioDotUncheckedClass = 'bg-transparent opacity-0 scale-75'
// Базовые классы «точки» внутри radiobox — нестандартные (`h-[6px]`, `w-[6px]`, произвольный transition).
// Вынесены сюда, чтобы `safelist` мог гарантировать их присутствие в сборке даже при tree-shaking шаблона.
export const grRadioDotBaseClass = 'h-[6px] w-[6px] rounded-full transition-[transform,opacity,background-color] duration-150'

export function grRadioButtonClass(options: {
    checked: boolean
    disabled: boolean
    size: GrButtonSize
    buttonVariant: GrButtonVariant
    buttonTone: GrButtonTone
    selectedButtonVariant: GrButtonVariant
    selectedButtonTone: GrButtonTone
}): string {
    const variant = options.checked ? options.selectedButtonVariant : options.buttonVariant
    const tone = options.checked ? options.selectedButtonTone : options.buttonTone

    return [
        grButtonBaseClass,
        grButtonClass({
            variant,
            tone,
            size: options.size,
            square: false,
        }),
        options.disabled ? grRadioDisabledClass : grRadioEnabledClass,
    ].join(' ')
}

export function grRadioRootClass(disabled: boolean): string {
    return disabled ? grRadioRootDisabledClass : grRadioRootEnabledClass
}

export function grRadioControlClass(checked: boolean): string {
    return checked ? grRadioControlCheckedClass : grRadioControlUncheckedClass
}

export function grRadioDotClass(checked: boolean): string {
    return checked ? grRadioDotCheckedClass : grRadioDotUncheckedClass
}
