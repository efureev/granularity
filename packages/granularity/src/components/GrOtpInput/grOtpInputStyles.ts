import type { GrComponentSize } from '../shared/sizes'

export type GrOtpInputSize = GrComponentSize

/**
 * `w-fit` тут не украшение. Гридовый или флексовый родитель **блокифицирует**
 * `inline-flex`, и ряд растягивался на всю колонку: сами ячейки оставались на
 * месте, а невидимое поле поверх них ловило клики далеко справа от кода.
 */
export const rootBaseClass = 'relative inline-flex w-fit items-center'

export const rootGaps: Record<GrOtpInputSize, string> = {
  xs: 'gap-1',
  sm: 'gap-1.5',
  md: 'gap-2',
  lg: 'gap-2',
}

/**
 * Настоящее поле лежит **поверх** ряда ячеек и невидимо: текст, каретка и
 * подсветка выделения прозрачны, всё видимое рисуют ячейки.
 *
 * Оно остаётся полноценным `<input>`, и потому даром достаются вставка,
 * автозаполнение кода из SMS, отмена, выделение и вся каретка со стрелками —
 * см. `docs/components/GrOtpInput.md`.
 *
 * `z-index` не нужен: поле позиционировано, ячейки — нет, а позиционированный
 * элемент и так красится поверх статичных соседей. Литерал слоя тут был бы
 * лишней записью в шкале `docs/z-index.md`.
 */
export const fieldClass = 'absolute inset-0 w-full cursor-text bg-transparent text-transparent [caret-color:transparent] outline-none selection:bg-transparent disabled:cursor-not-allowed'

export const cellBaseClass = 'relative inline-flex shrink-0 items-center justify-center rounded-[var(--gr-radius-control)] border [font-variant-numeric:tabular-nums] transition-colors duration-[var(--gr-duration-fast)]'

/**
 * Сторона ячейки повторяет высоту `GrInput` на той же ступени: код стоит в
 * форме рядом с полями, и ряд обязан садиться с ними в одну линию.
 *
 * Через хук, а не классом-числом: квадратная ячейка — решение оформления, и
 * макет вправе сделать её шире.
 */
export const cellSizes: Record<GrOtpInputSize, string> = {
  xs: 'h-[var(--gr-otp-input-cell-size,1.75rem)] w-[var(--gr-otp-input-cell-size,1.75rem)] text-[length:var(--gr-control-text-xs)] leading-[var(--gr-control-leading-xs)]',
  sm: 'h-[var(--gr-otp-input-cell-size,2rem)] w-[var(--gr-otp-input-cell-size,2rem)] text-[length:var(--gr-control-text-sm)] leading-[var(--gr-control-leading-sm)]',
  md: 'h-[var(--gr-otp-input-cell-size,2.5rem)] w-[var(--gr-otp-input-cell-size,2.5rem)] text-[length:var(--gr-control-text-md)] leading-[var(--gr-control-leading-md)]',
  lg: 'h-[var(--gr-otp-input-cell-size,2.75rem)] w-[var(--gr-otp-input-cell-size,2.75rem)] text-[length:var(--gr-control-text-lg)] leading-[var(--gr-control-leading-lg)]',
}

export const cellIdleClass = 'border-[var(--gr-brd)] bg-[var(--gr-bg)] text-[var(--gr-fg)]'

/** Активная ячейка — та, в которой стоит каретка, и только пока поле в фокусе. */
export const cellActiveClass = 'border-[var(--gr-otp-input-active-brd,var(--gr-primary))] ring-2 ring-[var(--gr-ring)]'

/**
 * Вердикт валидации красится своей ролью, а не декоративным `danger`: тема
 * вправе развести подсветку по решению разработчика и ошибку формы.
 */
export const cellInvalidClass = 'border-[var(--gr-invalid-brd)] bg-[var(--gr-bg)] text-[var(--gr-fg)]'

export const cellInvalidActiveClass = 'ring-2 ring-[var(--gr-invalid-ring)]'

/**
 * Недоступность гасится фоном, а не `opacity`: прозрачность разбавляет
 * выверенные на AA токены текста и роняет контраст кода.
 */
export const cellDisabledClass = 'border-[var(--gr-disabled-brd)] bg-[var(--gr-disabled-bg)] text-[var(--gr-disabled-fg)]'

export const placeholderClass = 'text-[var(--gr-muted-fg)]'

/**
 * Каретка рисуется своей, потому что настоящая скрыта вместе с текстом.
 * Мигание — CSS-анимация, значит подчиняется глобальному клампу движения
 * пакета (`docs/motion.md`), а не собственному таймеру.
 */
export const caretClass = 'pointer-events-none absolute h-[1em] w-px bg-[var(--gr-otp-input-caret,var(--gr-primary))]'

export const separatorClass = 'select-none px-0.5 text-[var(--gr-muted-fg)]'

export function grOtpInputRootClass(size: GrOtpInputSize): string {
  return [rootBaseClass, rootGaps[size]].join(' ')
}

type GrOtpInputCellClassOptions = {
  size: GrOtpInputSize
  active: boolean
  invalid: boolean
  disabled: boolean
}

export function grOtpInputCellClass(options: GrOtpInputCellClassOptions): string {
  const tokens = [cellBaseClass, cellSizes[options.size]]

  if (options.disabled)
    tokens.push(cellDisabledClass)
  else if (options.invalid)
    tokens.push(cellInvalidClass, options.active ? cellInvalidActiveClass : '')
  else
    tokens.push(cellIdleClass, options.active ? cellActiveClass : '')

  return tokens.filter(Boolean).join(' ')
}
