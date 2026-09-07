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

/**
 * Уровни заголовка шапки.
 *
 * Единица разрешена, в отличие от `GrCard`, где шкала начинается с двойки:
 * карточка никогда не бывает заголовком страницы, а шапка раздела — бывает, и
 * имя раздела в ней и есть `h1`.
 */
export const GR_NAVBAR_HEADING_LEVELS = [1, 2, 3, 4, 5, 6] as const

export type GrNavbarHeadingLevel = typeof GR_NAVBAR_HEADING_LEVELS[number]

// `m-0` — у нативного заголовка свой браузерный отступ, а префлайт пакета
// сбрасывает `margin` только у `body`. Потребитель с tailwind-совместимым
// сбросом его не увидит, а без такого сброса ряд шапки разъедется по вертикали:
// делать высоту шапки зависимой от чужого CSS нельзя. У `<div>` объявление
// ничего не значит, поэтому вид без `headingLevel` прежний.
export const navbarTitleClass = 'm-0 text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] font-700'

export function grNavbarRootClass(sticky: boolean): string {
  return [navbarBaseClass, sticky ? navbarStickyClass : ''].filter(Boolean).join(' ')
}
