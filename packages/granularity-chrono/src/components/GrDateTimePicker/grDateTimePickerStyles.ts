import type { GrPickerSize } from '../../internal/pickerFieldStyles'

export type GrDateTimePickerSize = GrPickerSize

/**
 * Классы панели «сетка + колонки».
 *
 * Своих цветов у неё нет: сетку красит `GrCalendar`, колонки — `GrTimePicker`,
 * подвал — `GrButton`. Здесь только раскладка и разделители, поэтому и токенов
 * компонент не заводит.
 */

export const dateTimePanelClass = 'flex flex-wrap items-start gap-3'

/** Колонки времени отделены от сетки чертой, а не воздухом: панель широкая. */
export const dateTimeDividerClass = 'self-stretch border-l border-[var(--gr-brd)]'

export const dateTimeFooterClass
  = 'mt-3 flex items-center justify-end gap-2 border-t border-[var(--gr-brd)] pt-3'
