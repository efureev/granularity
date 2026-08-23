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
// Базовые классы «точки» внутри radiobox — нестандартный transition. Вынесены сюда,
// чтобы `safelist` гарантировал их присутствие в сборке даже при tree-shaking шаблона.
export const grRadioDotBaseClass = 'rounded-[var(--gr-radius-full)] transition-[transform,opacity,background-color] duration-[var(--gr-duration-fast)]'

/**
 * Ступени `radiobox`: коробка, точка и кегли подписи с описанием.
 *
 * До этого коробка была зашита `h-4 w-4` в шаблоне, а кегли — фиксированным
 * `--gr-text-sm`: вариант `radiobox` не масштабировался вовсе, хотя `size` у
 * компонента был и работал для варианта `button`. Ступени согласованы с высотой
 * кнопки (`grButtonStyles.sizes`: 28/32/40/44) — радио стоит в тех же формах.
 */
export const grRadioControlSizes: Record<GrButtonSize, string> = {
  xs: 'h-3.5 w-3.5',
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
}

export const grRadioDotSizes: Record<GrButtonSize, string> = {
  xs: 'h-[5px] w-[5px]',
  sm: 'h-[6px] w-[6px]',
  md: 'h-2 w-2',
  lg: 'h-2.5 w-2.5',
}

const grRadioLabelTexts: Record<GrButtonSize, string> = {
  xs: 'text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)]',
  sm: 'text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)]',
  md: 'text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)]',
  lg: 'text-[length:var(--gr-text-base)] leading-[var(--gr-leading-base)]',
}

export const grRadioDescriptionSizes: Record<GrButtonSize, string> = {
  xs: 'text-[length:var(--gr-text-2xs)] leading-[var(--gr-leading-2xs)] text-[var(--gr-muted-fg)]',
  sm: 'text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]',
  md: 'text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]',
  lg: 'text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-muted-fg)]',
}

/** Выбранный вариант выделяется текстом, а не только точкой. */
export const grRadioLabelCheckedColorClass = 'text-[var(--gr-fg)] font-500'
export const grRadioLabelColorClass = 'text-[var(--gr-muted-fg)]'

export function grRadioLabelClassFor(size: GrButtonSize, checked: boolean): string {
  return [
    grRadioLabelTexts[size],
    checked ? grRadioLabelCheckedColorClass : grRadioLabelColorClass,
  ].join(' ')
}

export const grRadioLabelSizes = grRadioLabelTexts

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
  if (options.disabled)
    return grRadioRootDisabledClass
  return options.readonly ? grRadioRootReadonlyClass : grRadioRootEnabledClass
}

export function grRadioControlClass(options: {
  checked: boolean
  disabled: boolean
  invalid: boolean
  size: GrButtonSize
}): string {
  const state = options.disabled
    ? grRadioControlDisabledClass
    : options.invalid && !options.checked
      ? grRadioControlInvalidClass
      : options.checked ? grRadioControlCheckedClass : grRadioControlUncheckedClass

  return [grRadioControlSizes[options.size], state].join(' ')
}

export function grRadioDotClass(options: { checked: boolean, disabled: boolean }): string {
  if (!options.checked)
    return grRadioDotUncheckedClass

  return options.disabled ? grRadioDotDisabledClass : grRadioDotCheckedClass
}
