import type { GrComponentSize } from './sizes'

/**
 * Форма рамки контрола — ось, соседняя размеру.
 *
 * Значения названы по самой форме, а не по тому, чей это дефолт: у полей-коробок
 * дефолт `box`, у `GrSegmented` — `pill`, и каждый сохраняет свой нынешний вид.
 * Назови мы их `default`/`alternate`, одно и то же слово означало бы у соседних
 * компонентов разные скругления.
 *
 * `box`, а не `rounded`: последнее — имя uno-утилиты, и гейт радиусов
 * (`styleTokens`) справедливо считает его литералом шкалы.
 */
export const GR_CONTROL_SHAPES = ['box', 'pill'] as const

export type GrControlShape = typeof GR_CONTROL_SHAPES[number]

/**
 * Скругление по форме и ступени. Радиусы — токены основания, поэтому тема видит
 * их так же, как остальную шкалу: коробка берёт `--gr-radius-control-<ступень>`,
 * и тема, у которой крупное поле скруглено сильнее мелкого, задаёт это там.
 */
export const controlShapeRadiusClass: Record<GrControlShape, Record<GrComponentSize, string>> = {
  pill: {
    xs: 'rounded-[var(--gr-radius-full)]',
    sm: 'rounded-[var(--gr-radius-full)]',
    md: 'rounded-[var(--gr-radius-full)]',
    lg: 'rounded-[var(--gr-radius-full)]',
  },
  box: {
    xs: 'rounded-[var(--gr-radius-control-xs)]',
    sm: 'rounded-[var(--gr-radius-control-sm)]',
    md: 'rounded-[var(--gr-radius-control-md)]',
    lg: 'rounded-[var(--gr-radius-control-lg)]',
  },
}

/**
 * Горизонтальный отступ пилюли: **не меньше половины высоты контрола**, иначе
 * текст заезжает в дугу. Замер, из-за которого правило и появилось: `GrInput` в
 * `md` это `h-10 px-3` — дуга 20 px при отступе 12 px.
 *
 * Значения выровнены по шкале утилит, поэтому у `lg` (44 px, половина 22)
 * отступ 24 px: запас в сторону увеличения безопасен, в сторону уменьшения —
 * нет. Высоты у всех семи полей-коробок общие (`h-7/h-8/h-10/h-11`), так что
 * таблица одна на них всех.
 */
export const controlPillPaddingXClass: Record<GrComponentSize, string> = {
  xs: 'px-3.5',
  sm: 'px-4',
  md: 'px-5',
  lg: 'px-6',
}

/**
 * То же число, но значением: аддоны и приставки задают отступы инлайн-стилем, а
 * он перекрывает класс. Расходиться этим двум нельзя — сторожит
 * `controlShape.test.ts`.
 */
export const controlPillPaddingX: Record<GrComponentSize, string> = {
  xs: '14px',
  sm: '16px',
  md: '20px',
  lg: '24px',
}
