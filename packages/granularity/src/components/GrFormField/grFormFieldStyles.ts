import type { GrComponentSize } from '../shared/sizes'

export type GrFormFieldSize = GrComponentSize

/** Вертикальный ритм поля: подпись → подсказка → контрол → ошибка. */
export const fieldGaps: Record<GrFormFieldSize, string> = {
  xs: 'gap-1',
  sm: 'gap-1.5',
  md: 'gap-2',
  lg: 'gap-2',
}

export const labelTexts: Record<GrFormFieldSize, string> = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-sm',
  lg: 'text-base',
}

/** Подсказка набирается на ступень мельче подписи — она вторична. */
export const hintTexts: Record<GrFormFieldSize, string> = {
  xs: 'text-xs',
  sm: 'text-xs',
  md: 'text-xs',
  lg: 'text-sm',
}

export const errorTexts: Record<GrFormFieldSize, string> = labelTexts

/** Сторона подписи относительно контрола — логическая, не физическая (RTL). */
export const GR_FORM_FIELD_LABEL_POSITIONS = ['top', 'start'] as const
export type GrFormFieldLabelPosition = typeof GR_FORM_FIELD_LABEL_POSITIONS[number]

export const rootColumnClass = 'flex flex-col'
export const rootRowClass = 'flex items-start'
export const labelInlineClass = 'shrink-0'
export const controlColumnClass = 'flex flex-col min-w-0 flex-1'

export const labelBaseClass = 'text-[var(--gr-muted-fg)]'
export const hintBaseClass = 'text-[var(--gr-muted-fg)]'
export const errorBaseClass = 'text-[var(--gr-danger-text)]'
export const requiredMarkClass = 'text-[var(--gr-danger-text)]'
