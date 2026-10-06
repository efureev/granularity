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
 * Safelist пуст. Кегль и цвет корня лежат здесь целыми литералами, и granum
 * извлекает их сам: модуль уезжает в общий `dist/chunks/`, но сборка доходит
 * до него по графу бандла компонента. Список, который здесь был, пережил
 * UnoCSS-пресет — тот общий чанк не сканировал.
 *
 * Всё остальное оформление — настоящий CSS в `styles.css`, а не утилиты: оно
 * держится на потомках разметки, собранной рендерером, а утилитой можно
 * пометить только тот узел, который рендер-функция создаёт сама.
 */
export const grMarkdownSafelist: string[] = []
