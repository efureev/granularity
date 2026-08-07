/**
 * Кастомизация через CSS-переменные:
 *
 * - `--gr-navbar-height` — высота панели (по умолчанию `56px`).
 */
export const navbarBaseClass = 'h-[var(--gr-navbar-height,56px)] border-b border-[var(--gr-brd)] bg-[var(--gr-bg)] flex items-center gap-4 px-4 sm:px-6'

/**
 * Прилипшая шапка идёт слоем ниже якорных панелей: она обязана перекрывать
 * контент, но не выпадашки, тултипы и модалки — иначе открытый список уезжал бы
 * под неё.
 */
export const navbarStickyClass = 'sticky top-0 z-[var(--gr-z-navbar)]'

export const navbarSideClass = 'flex min-w-0 items-center gap-3'

/**
 * Центрировать содержимое относительно панели можно только когда боковые зоны
 * делят остаток поровну: у центра с одним `flex-1` середина считается от
 * остатка, а не от панели, и уезжает вслед за более широким боком.
 */
export const navbarSideGrowClass = 'flex-1'
export const navbarRightAlignClass = 'justify-end'

export const navbarCenterClass = 'flex min-w-0 flex-1 items-center justify-center gap-3'

export const navbarTitleClass = 'text-[length:var(--gr-text-sm)] font-700'

export function grNavbarRootClass(sticky: boolean): string {
  return [navbarBaseClass, sticky ? navbarStickyClass : ''].filter(Boolean).join(' ')
}
