import type { GrButtonSize } from '../GrButton/grButtonStyles'

/** Размерная шкала общая с формным рядом (`GrRadio`, `GrInput`, `GrButton`). */
export type GrCheckboxSize = GrButtonSize

/** Сторона подписи относительно контрола — логическая, не физическая (RTL). */
export const GR_CHECKBOX_LABEL_POSITIONS = ['start', 'end'] as const
export type GrCheckboxLabelPosition = typeof GR_CHECKBOX_LABEL_POSITIONS[number]

export const rootBase = 'inline-flex items-center select-none'

export const rootGaps: Record<GrCheckboxSize, string> = {
  xs: 'gap-1.5',
  sm: 'gap-1.5',
  md: 'gap-2',
  lg: 'gap-2',
}

export const rootDisabledClass = 'cursor-not-allowed'
export const rootEnabledClass = 'cursor-pointer'

// Подпись слева от контрола — порядком флекса, а не физическими отступами.
// `justify-end` обязателен: в `row-reverse` главная ось идёт справа налево, и
// без него растянутая строка (внутри `grid`/`w-full`) прижалась бы к правому краю.
export const rootLabelStartClass = 'flex-row-reverse justify-end'

export const controlBase = 'rounded-[var(--gr-radius-sm)] border flex items-center justify-center transition-colors duration-[var(--gr-duration-fast)] focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_var(--gr-ring),0_0_0_4px_var(--gr-bg)]'

export const controlSizes: Record<GrCheckboxSize, string> = {
  xs: 'h-3 w-3',
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
}

export const controlCheckedClass = 'border-[var(--gr-primary)] bg-[var(--gr-primary)]'
export const controlUncheckedClass = 'border-[var(--gr-brd)] bg-[var(--gr-bg)]'
export const controlInvalidCheckedClass = 'border-[var(--gr-danger)] bg-[var(--gr-danger)]'
export const controlInvalidUncheckedClass = 'border-[var(--gr-danger)] bg-[var(--gr-bg)]'

// Disabled показываем фоном, а не `opacity`: прозрачность разбавляет выверенные
// на AA токены и роняет контраст галочки на заливке.
export const controlDisabledCheckedClass = 'border-[var(--gr-muted-fg)] bg-[var(--gr-muted-fg)]'
export const controlDisabledUncheckedClass = 'border-[var(--gr-brd)] bg-[var(--gr-muted)]'

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
export const iconCheckTransitionClass = 'transition-transform transition-opacity duration-[var(--gr-duration-fast)]'
export const iconCheckVisibleClass = 'opacity-100 scale-100 text-[var(--gr-primary-fg)]'
export const iconCheckHiddenClass = 'opacity-0 scale-75 text-transparent'

export const labelBase = 'text-[var(--gr-muted-fg)]'

export const labelSizes: Record<GrCheckboxSize, string> = {
  xs: 'text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)]',
  sm: 'text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)]',
  md: 'text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)]',
  lg: 'text-[length:var(--gr-text-base)] leading-[var(--gr-leading-base)]',
}

export function grCheckboxRootClass(options: {
  size: GrCheckboxSize
  disabled: boolean
  labelPosition: GrCheckboxLabelPosition
}): string {
  return [
    rootBase,
    rootGaps[options.size],
    options.disabled ? rootDisabledClass : rootEnabledClass,
    options.labelPosition === 'start' ? rootLabelStartClass : '',
  ].filter(Boolean).join(' ')
}

// Порядок состояний — приоритет: недоступный контрол не показывает ни ошибку,
// ни акцент, иначе «выключено» читается как «требует внимания».
export function grCheckboxControlClass(options: {
  size: GrCheckboxSize
  active: boolean
  disabled?: boolean
  invalid?: boolean
}): string {
  return [
    controlBase,
    controlSizes[options.size],
    grCheckboxControlStateClass(options),
  ].join(' ')
}

function grCheckboxControlStateClass(options: { active: boolean, disabled?: boolean, invalid?: boolean }): string {
  if (options.disabled)
    return options.active ? controlDisabledCheckedClass : controlDisabledUncheckedClass

  if (options.invalid)
    return options.active ? controlInvalidCheckedClass : controlInvalidUncheckedClass

  return options.active ? controlCheckedClass : controlUncheckedClass
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
