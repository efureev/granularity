// Только тип: `import type` стирается на сборке и ребра графа компонентов не создаёт.
import type { GrDialogSize } from '@feugene/granularity/components/GrDialog'

export type GrDashboardItemSettingsSize = GrDialogSize

export const bodyClass = 'flex flex-col gap-4 min-w-0'

/**
 * Ширина и высота стоят рядом, а не друг под другом: это одна величина из двух
 * чисел, и разнесённые по строкам они читаются как два не связанных поля.
 */
export const sizeRowClass = 'grid grid-cols-2 gap-3 min-w-0'

/**
 * Отказ показывается на месте, а не тостом: причина относится к тому, что
 * человек только что ввёл, и уезжать за ней в угол экрана он не должен.
 */
export const refusalClass = [
  'text-[var(--gr-invalid-text)]',
  'text-[length:var(--gr-control-text-sm)] leading-[var(--gr-control-leading-sm)]',
].join(' ')

export const footerClass = 'flex items-center justify-end gap-2'
