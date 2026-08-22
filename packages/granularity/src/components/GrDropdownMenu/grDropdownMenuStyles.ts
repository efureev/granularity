export type GrDropdownMenuItemAlign = 'left' | 'center' | 'right'
export type GrDropdownMenuItemVariant = 'default' | 'danger'
export type GrDropdownMenuHeaderAlign = GrDropdownMenuItemAlign
export type GrDropdownMenuColumnAlign = GrDropdownMenuItemAlign
export type GrDropdownMenuColumnsCount = 2 | 3 | 4

export const alignClass: Record<GrDropdownMenuItemAlign, string> = {
  left: 'justify-start text-left',
  center: 'justify-center text-center',
  right: 'justify-end text-right',
}

export const textAlignClass: Record<GrDropdownMenuHeaderAlign, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
}

export const colsClass: Record<GrDropdownMenuColumnsCount, string> = {
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
}

/**
 * Радиус здесь не украшение: фон подсветки лежит на самом пункте, а панель
 * `GrDropdown` скруглена на 16 px и содержимое не обрезает. Прямоугольник во всю
 * ширину заливал бы угловые сегменты, вырезанные этим радиусом. Восемь
 * пикселей — та же ступень, что у опций `GrSelect` и `GrAutocomplete`; внутренний
 * угол панели после рамки и поля ≈ 11 px, так что подсветка до скругления не
 * достаёт. Радиус в базовом классе, а не отдельной константой: hover, disabled и
 * кольцо фокуса висят на одном элементе.
 */
export const itemBaseClass = 'w-full min-h-10 px-4 py-2.5 rounded-[var(--gr-radius-md)] flex items-center gap-2 text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] transition-colors duration-[var(--gr-duration-fast)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)]'

// Насыщенный тон как цвет текста запрещён — для текста есть `-text`-роль.
export const itemVariantClass: Record<GrDropdownMenuItemVariant, string> = {
  default: 'text-[var(--gr-fg)]',
  danger: 'text-[var(--gr-danger-text)]',
}

export const itemInteractiveClass = 'cursor-pointer hover:bg-[var(--gr-accent)] hover:text-[var(--gr-accent-fg)]'

// Disabled гасится фоном, а не `opacity`: прозрачность разбавляет выверенные на
// AA токены текста. `pointer-events-none` оставлен — он же гасит hover.
export const itemDisabledClass = 'cursor-not-allowed pointer-events-none bg-[var(--gr-muted)] text-[var(--gr-muted-fg)]'

export const itemIndicatorClass = 'h-3.5 w-3.5 shrink-0'
export const itemShortcutClass = 'ml-auto pl-4 text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]'

export const headerClass = 'px-4 py-2 text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] tracking-wide text-[var(--gr-muted-fg)]'

export const listBaseClass = 'w-full'
export const dividersClass = 'divide-y divide-[var(--gr-brd)]'
/**
 * Линия у края панели рисуется псевдоэлементом с инсетом, а не рамкой бокса.
 *
 * Список лежит в поле панели — 1 px рамки плюс 4 px `p-1`, — а угол скруглён на
 * `--gr-radius-xl` (16 px). На глубине 5 px дуга ещё идёт: штрих рамки занимает
 * там `x ∈ [4.4, 5.8]`, и правило во всю ширину, начинаясь на `x = 5`, упирается
 * не в вертикальный край, а в дугу. Вместо двух самостоятельных линий у каждого
 * угла виден клин, в который они сходятся.
 *
 * Инсет тот же, что у `GrDropdownMenuDivider :inset` (8 px), и уводит концы из
 * полосы радиуса. Пункты при этом остаются во всю ширину: их ширина — часть
 * попадания подсветки в поле панели, и сжимать список целиком нельзя.
 *
 * Та же арифметика уже учтена у `itemBaseClass`; здесь она доведена до линий.
 */
export const borderEdgeClass = 'relative'
export const borderTopClass = 'before:absolute before:inset-x-2 before:top-0 before:h-px before:bg-[var(--gr-brd)] before:content-empty'
export const borderBottomClass = 'after:absolute after:inset-x-2 after:bottom-0 after:h-px after:bg-[var(--gr-brd)] after:content-empty'

export const columnsBaseClass = 'w-full grid divide-x divide-[var(--gr-brd)]'
export const columnBaseClass = 'px-3 py-2 flex items-center'

export const dividerClass = 'border-t border-[var(--gr-brd)]'
export const dividerInsetClass = 'mx-2'

export function grDropdownMenuItemClass(options: {
  align: GrDropdownMenuItemAlign
  variant: GrDropdownMenuItemVariant
  disabled: boolean
}): string {
  return [
    itemBaseClass,
    alignClass[options.align],
    options.disabled ? itemDisabledClass : itemVariantClass[options.variant],
    options.disabled ? '' : itemInteractiveClass,
  ].filter(Boolean).join(' ')
}

export function grDropdownMenuListClass(options: {
  dividers: boolean
  borderTop: boolean
  borderBottom: boolean
}): string {
  return [
    listBaseClass,
    options.dividers ? dividersClass : '',
    // `relative` нужен обеим линиям и ставится один раз: это система координат
    // для псевдоэлемента, а не признак самой линии.
    options.borderTop || options.borderBottom ? borderEdgeClass : '',
    options.borderTop ? borderTopClass : '',
    options.borderBottom ? borderBottomClass : '',
  ].filter(Boolean).join(' ')
}
