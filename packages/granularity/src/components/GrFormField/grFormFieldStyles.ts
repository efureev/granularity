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
  xs: 'text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)]',
  sm: 'text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)]',
  md: 'text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)]',
  lg: 'text-[length:var(--gr-text-base)] leading-[var(--gr-leading-base)]',
}

/** Подсказка набирается на ступень мельче подписи — она вторична. */
export const hintTexts: Record<GrFormFieldSize, string> = {
  xs: 'text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)]',
  sm: 'text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)]',
  md: 'text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)]',
  lg: 'text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)]',
}

export const errorTexts: Record<GrFormFieldSize, string> = labelTexts

/**
 * Резерв строки сообщения (`reserveMessage`): пустой контейнер держит высоту
 * одной строки ошибки, и появление текста не сдвигает форму.
 */
export const errorReserveClass: Record<GrFormFieldSize, string> = {
  xs: 'min-h-[var(--gr-leading-xs)]',
  sm: 'min-h-[var(--gr-leading-sm)]',
  md: 'min-h-[var(--gr-leading-sm)]',
  lg: 'min-h-[var(--gr-leading-base)]',
}

/**
 * Подпись сбоку высотой с однострочный контрол того же размера и по центру:
 * так она стоит на линии текста в поле, а не над ним.
 */
export const labelInlineHeights: Record<GrFormFieldSize, string> = {
  xs: 'min-h-7',
  sm: 'min-h-8',
  md: 'min-h-10',
  lg: 'min-h-11',
}

/** Сторона подписи относительно контрола — логическая, не физическая (RTL). */
export const GR_FORM_FIELD_LABEL_POSITIONS = ['top', 'start'] as const
export type GrFormFieldLabelPosition = typeof GR_FORM_FIELD_LABEL_POSITIONS[number]

export const rootColumnClass = 'flex flex-col'
export const rootRowClass = 'flex items-start'
export const labelInlineClass = 'shrink-0 flex items-center'
export const controlColumnClass = 'flex flex-col min-w-0 flex-1'

export const labelBaseClass = 'text-[var(--gr-muted-fg)]'
export const hintBaseClass = 'text-[var(--gr-muted-fg)]'
export const errorBaseClass = 'text-[var(--gr-invalid-text)]'
export const requiredMarkClass = 'text-[var(--gr-invalid-text)]'
