import {
  grButtonBaseClass,
  grButtonClass,
  sizes as grButtonSizes,
  type GrButtonSize,
  type GrButtonTone,
  type GrButtonVariant,
} from '../GrButton/grButtonStyles'

export type GrRadioVariant = 'radiobox' | 'button'

export const grRadioEnabledClass = 'cursor-pointer'

/**
 * Отключённая кнопка-радио гасится, но НЕ теряет состояние: в отключённой
 * группе всё равно должно быть видно, что выбрано. Поэтому не отдаём вид
 * `GrButton`-у (его disabled состояние-слепой), а держим свою пару.
 */
export const grRadioButtonDisabledClass = 'cursor-not-allowed bg-transparent text-[var(--gr-muted-fg)] border border-[var(--gr-brd)]'
export const grRadioButtonDisabledCheckedClass = 'cursor-not-allowed bg-[var(--gr-muted)] text-[var(--gr-fg)] border border-[var(--gr-muted-fg)]'

/**
 * Отключённый переключатель гасится токенами, а не `opacity`: прозрачность
 * разбавляет выверенные на AA цвета текста.
 */
export const grRadioRootDisabledClass = 'cursor-not-allowed text-[var(--gr-muted-fg)]'
export const grRadioRootEnabledClass = 'cursor-pointer'
/** Только для чтения: значение видно и читается, но курсор не обещает клика. */
export const grRadioRootReadonlyClass = 'cursor-default'

export const grRadioControlCheckedClass = 'border-[var(--gr-primary)] bg-[color-mix(in_srgb,var(--gr-primary)_10%,var(--gr-bg))]'
export const grRadioControlUncheckedClass = 'border-[var(--gr-brd)] bg-[var(--gr-bg)]'
export const grRadioControlDisabledClass = 'border-[var(--gr-brd)] bg-[var(--gr-muted)]'
export const grRadioControlInvalidClass = 'border-[var(--gr-danger)] bg-[var(--gr-bg)]'

export const grRadioDotCheckedClass = 'bg-[var(--gr-primary)] opacity-100 scale-100'
export const grRadioDotUncheckedClass = 'bg-transparent opacity-0 scale-75'
export const grRadioDotDisabledClass = 'bg-[var(--gr-muted-fg)] opacity-100 scale-100'
// Базовые классы «точки» внутри radiobox — нестандартные (`h-[6px]`, `w-[6px]`, произвольный transition).
// Вынесены сюда, чтобы `safelist` мог гарантировать их присутствие в сборке даже при tree-shaking шаблона.
export const grRadioDotBaseClass = 'h-[6px] w-[6px] rounded-full transition-[transform,opacity,background-color] duration-150'

/** Выбранный вариант выделяется текстом, а не только точкой. */
export const grRadioLabelCheckedClass = 'text-sm text-[var(--gr-fg)] font-500'
export const grRadioLabelClass = 'text-sm text-[var(--gr-muted-fg)]'
export const grRadioDescriptionClass = 'text-[length:var(--gr-text-xs)] text-[var(--gr-muted-fg)]'

export function grRadioButtonClass(options: {
  checked: boolean
  disabled: boolean
  readonly: boolean
  size: GrButtonSize
  buttonVariant: GrButtonVariant
  buttonTone: GrButtonTone
  selectedButtonVariant: GrButtonVariant
  selectedButtonTone: GrButtonTone
}): string {
  if (options.disabled) {
    return [
      grButtonBaseClass,
      grButtonSizes[options.size],
      options.checked ? grRadioButtonDisabledCheckedClass : grRadioButtonDisabledClass,
    ].join(' ')
  }

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
    options.readonly ? grRadioRootReadonlyClass : grRadioEnabledClass,
  ].join(' ')
}

export function grRadioRootClass(options: { disabled: boolean, readonly: boolean }): string {
  if (options.disabled) return grRadioRootDisabledClass
  return options.readonly ? grRadioRootReadonlyClass : grRadioRootEnabledClass
}

export function grRadioControlClass(options: {
  checked: boolean
  disabled: boolean
  invalid: boolean
}): string {
  if (options.disabled)
    return grRadioControlDisabledClass

  if (options.invalid && !options.checked)
    return grRadioControlInvalidClass

  return options.checked ? grRadioControlCheckedClass : grRadioControlUncheckedClass
}

export function grRadioDotClass(options: { checked: boolean, disabled: boolean }): string {
  if (!options.checked)
    return grRadioDotUncheckedClass

  return options.disabled ? grRadioDotDisabledClass : grRadioDotCheckedClass
}

export function grRadioLabelTextClass(checked: boolean): string {
  return checked ? grRadioLabelCheckedClass : grRadioLabelClass
}
