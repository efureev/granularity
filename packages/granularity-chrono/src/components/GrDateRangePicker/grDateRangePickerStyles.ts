import type { GrPickerSize } from '../../internal/pickerFieldStyles'

/**
 * Публичное имя типа размера компонента. Классы поля общие для всех пикеров
 * пакета, полосу диапазона рисует `GrCalendar` — своих классов у пикера нет.
 */
export type GrDateRangePickerSize = GrPickerSize

/** Полоса времени под календарём: та же отбивка, что у `GrDateTimePicker`. */
export const rangeTimeRowClass = 'grid w-full gap-3 border-t border-[var(--gr-brd)] pt-3 sm:grid-cols-2'

/** Подпись над колонками: чей это край периода. */
export const rangeTimeLabelClass = 'mb-1 text-[length:var(--gr-control-text-xs)] leading-[var(--gr-leading-xs)] font-600 text-[var(--gr-muted-fg)]'
