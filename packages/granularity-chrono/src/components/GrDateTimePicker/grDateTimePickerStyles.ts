import type { GrPickerSize } from '../../internal/pickerFieldStyles'

export type GrDateTimePickerSize = GrPickerSize

/**
 * Классы панели «сетка + колонки».
 *
 * Колонки стоят **под** сеткой, а не сбоку: панель поповера ограничена по
 * ширине (`max-w` в `GrPopover`), и в ряд они всё равно переносились бы —
 * только с вертикальной чертой поперёк переноса. Своих цветов у панели нет:
 * сетку красит `GrCalendar`, колонки — `GrTimePicker`, подвал — `GrButton`.
 */

export const dateTimePanelClass = 'flex flex-col items-center gap-3'

/** Черта отделяет время от сетки — по той же стороне, с которой оно приходит. */
export const dateTimeTimeClass = 'w-full border-t border-[var(--gr-brd)] pt-3'

export const dateTimeFooterClass
  = 'mt-3 flex items-center justify-end gap-2 border-t border-[var(--gr-brd)] pt-3'
