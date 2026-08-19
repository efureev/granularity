/**
 * Ряд готовых периодов в подвале панели.
 *
 * Перенос обязателен: подписи задаёт потребитель, и пять штук вроде «Последние
 * 30 дней» в строку панели шириной с месяц не помещаются. Черта отделяет
 * шорткаты от сетки — та же, что у подвала `GrDateTimePicker`.
 *
 * Своих цветов у ряда нет: кнопки красит `GrButton`.
 */
export const presetRowClass
  = 'mt-3 flex flex-wrap items-center gap-1.5 border-t border-[var(--gr-brd)] pt-3'

/** Для safelist потребителей: модуль общий, а значит уезжает в `dist/chunks/`. */
export const presetRowClassTokens: readonly string[] = [presetRowClass]
