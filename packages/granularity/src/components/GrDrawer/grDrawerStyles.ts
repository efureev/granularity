import type { GrOverlaySize } from '../shared/sizes'

export type GrDrawerSide = 'left' | 'right' | 'top' | 'bottom'
export type GrDrawerSize = GrOverlaySize

/** Ось, по которой панель выезжает и по которой считается её размер. */
export type GrDrawerAxis = 'horizontal' | 'vertical'

export function grDrawerAxis(side: GrDrawerSide): GrDrawerAxis {
  return side === 'left' || side === 'right' ? 'horizontal' : 'vertical'
}

/**
 * Настройка паддингов и рамки секции. Структурно совпадает с
 * `GrDialogSectionConfig` намеренно: потребитель не должен переучиваться при
 * переходе между двумя оверлеями библиотеки. Свой тип, а не импорт из
 * `GrDialog`, — чтобы не тянуть чужой чанк ради двух полей.
 */
export interface GrDrawerSectionConfig {
  paddingX?: string
  paddingY?: string
  bordered?: boolean
}

export const DEFAULT_GR_DRAWER_HEADER_CONFIG: Required<GrDrawerSectionConfig> = {
  paddingX: 'px-5',
  paddingY: 'py-4',
  bordered: true,
}

export const DEFAULT_GR_DRAWER_BODY_CONFIG: Required<GrDrawerSectionConfig> = {
  paddingX: 'px-5',
  paddingY: 'py-5',
  bordered: false,
}

export const DEFAULT_GR_DRAWER_FOOTER_CONFIG: Required<GrDrawerSectionConfig> = {
  paddingX: 'px-5',
  paddingY: 'py-4',
  bordered: true,
}

export function resolveGrDrawerSectionConfig(
  config: GrDrawerSectionConfig | undefined,
  defaults: Required<GrDrawerSectionConfig>,
): Required<GrDrawerSectionConfig> {
  return {
    paddingX: config?.paddingX ?? defaults.paddingX,
    paddingY: config?.paddingY ?? defaults.paddingY,
    bordered: config?.bordered ?? defaults.bordered,
  }
}

/** Слой модального класса — тот же, что у `GrModal`: бэкдроп, фокус, scroll-lock. */
export const rootClass = 'fixed inset-0 z-[var(--gr-z-modal)]'

/**
 * Немодальная панель обязана пропускать клики мимо себя: корень растянут на весь
 * экран ради позиционирования, и без этого «немодальный» режим гасил бы всю
 * страницу — ровно то, чего он должен избегать. Панель кликабельность себе
 * возвращает.
 */
export const rootPassThroughClass = 'pointer-events-none'
export const panelInteractiveClass = 'pointer-events-auto'

export const overlayClass = 'fixed inset-0 bg-[var(--gr-overlay-bg)]'

/** Ширина панели для боковых сторон. */
export const panelWidthBySize: Record<GrDrawerSize, string> = {
  sm: 'w-[360px] max-w-[90vw]',
  md: 'w-[420px] max-w-[92vw]',
  lg: 'w-[560px] max-w-[94vw]',
  xl: 'w-[720px] max-w-[96vw]',
  full: 'w-[100vw]',
}

/** Высота панели для верхней и нижней сторон — та же шкала, но по своей оси. */
export const panelHeightBySize: Record<GrDrawerSize, string> = {
  sm: 'h-[280px] max-h-[90vh]',
  md: 'h-[360px] max-h-[92vh]',
  lg: 'h-[480px] max-h-[94vh]',
  xl: 'h-[640px] max-h-[96vh]',
  full: 'h-[100vh]',
}

export const panelSizeByAxis: Record<GrDrawerAxis, Record<GrDrawerSize, string>> = {
  horizontal: panelWidthBySize,
  vertical: panelHeightBySize,
}

/**
 * Позиция панели. Растяжка по поперечной оси живёт здесь же: у боковой панели
 * это `inset-y-0`, у верхней и нижней — `inset-x-0`, и держать их в разметке
 * значило бы иметь в шаблоне половину стороны.
 */
export const panelSideClass: Record<GrDrawerSide, string> = {
  left: 'inset-y-0 left-0 border-r',
  right: 'inset-y-0 right-0 border-l',
  top: 'inset-x-0 top-0 border-b',
  bottom: 'inset-x-0 bottom-0 border-t',
}

export const panelTransitionClass: Record<GrDrawerSide, string> = {
  left: '-translate-x-full',
  right: 'translate-x-full',
  top: '-translate-y-full',
  bottom: 'translate-y-full',
}

export const panelBaseClass = 'fixed flex flex-col border-[var(--gr-brd)] bg-[var(--gr-card)] text-[var(--gr-card-fg)] shadow-[var(--gr-shadow-2)] outline-none'

export const headerBorderClass = 'border-b border-[var(--gr-brd)]'
export const footerBorderClass = 'border-t border-[var(--gr-brd)]'
export const titleClass = 'text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] font-700 min-w-0 truncate'

/** Скрытый заголовок: имя слоя есть даже там, где шапки на экране нет. */
export const srOnlyTitleClass = 'sr-only'

// Произвольный размер отменяет размерный класс: иначе `w-[420px]` из шкалы
// спорил бы с инлайновым стилем панели.
export function grDrawerPanelClass(options: {
  side: GrDrawerSide
  size: GrDrawerSize
  hasCustomLength: boolean
}): string {
  const axis = grDrawerAxis(options.side)

  return [
    panelBaseClass,
    panelInteractiveClass,
    panelSideClass[options.side],
    options.hasCustomLength ? '' : panelSizeByAxis[axis][options.size],
  ].filter(Boolean).join(' ')
}

export function grDrawerPanelEnterFrom(side: GrDrawerSide): string {
  return panelTransitionClass[side]
}
