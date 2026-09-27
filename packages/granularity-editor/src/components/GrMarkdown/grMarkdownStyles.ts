import { splitClassTokens } from '../../internal/classTokens'

export type GrMarkdownSize = 'xs' | 'sm' | 'md' | 'lg'
export type GrMarkdownDensity = 'comfortable' | 'compact'

/**
 * Кегль — **контентной** шкалой, а не контрольной: это текст, который читают,
 * а не подпись на контроле (`packages/granularity/docs/sizes.md`).
 *
 * Межстрочный идёт парой: утилита `text-*` словаря задаёт оба сразу, и кегль,
 * переведённый на токен в одиночку, отдал бы интервал на откуп `body`.
 */
export const sizeClasses = {
  xs: 'text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)]',
  sm: 'text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)]',
  md: 'text-[length:var(--gr-text-base)] leading-[var(--gr-leading-base)]',
  lg: 'text-[length:var(--gr-text-lg)] leading-[var(--gr-leading-lg)]',
} as const satisfies Record<GrMarkdownSize, string>

export const rootClass = 'text-[var(--gr-fg)]'

/**
 * Список остался с тех времён, когда общий `dist/chunks/`, куда уезжает этот
 * модуль, был вне скана: granum доходит до него по графу бандла компонента и
 * показывает записи кодом `safelist-redundant`.
 *
 * Всё остальное оформление — настоящий CSS в `styles.css`, а не утилиты: оно
 * держится на потомках разметки, собранной рендерером, а утилитой можно
 * пометить только тот узел, который рендер-функция создаёт сама.
 */
export const grMarkdownSafelist: string[] = [
  ...Object.values(sizeClasses).flatMap(splitClassTokens),
  ...splitClassTokens(rootClass),
]
