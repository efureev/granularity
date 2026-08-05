import type { GrOverlaySize } from '../shared/sizes'

export type GrDrawerSide = 'left' | 'right'
export type GrDrawerSize = GrOverlaySize

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

export const overlayClass = 'fixed inset-0 bg-[var(--gr-overlay-bg)]'

export const panelWidthBySize: Record<GrDrawerSize, string> = {
  sm: 'w-[360px] max-w-[90vw]',
  md: 'w-[420px] max-w-[92vw]',
  lg: 'w-[560px] max-w-[94vw]',
  xl: 'w-[720px] max-w-[96vw]',
  full: 'w-[100vw]',
}

export const panelSideClass: Record<GrDrawerSide, string> = {
  left: 'left-0 border-r',
  right: 'right-0 border-l',
}

export const panelTransitionClass: Record<GrDrawerSide, string> = {
  left: '-translate-x-full',
  right: 'translate-x-full',
}

export const panelBaseClass = 'border-[var(--gr-brd)] bg-[var(--gr-card)] text-[var(--gr-card-fg)] shadow-[var(--gr-shadow-2)] outline-none'

export const headerBorderClass = 'border-b border-[var(--gr-brd)]'
export const footerBorderClass = 'border-t border-[var(--gr-brd)]'
export const titleClass = 'text-[length:var(--gr-text-sm)] font-700 min-w-0 truncate'

// Произвольная ширина отменяет размерный класс: иначе `w-[420px]` из шкалы
// спорил бы с инлайновым стилем панели.
export function grDrawerPanelClass(options: {
  side: GrDrawerSide
  size: GrDrawerSize
  width?: string | number
}): string {
  return [
    panelSideClass[options.side],
    options.width === undefined ? panelWidthBySize[options.size] : '',
    panelBaseClass,
  ].filter(Boolean).join(' ')
}

export function grDrawerPanelEnterFrom(side: GrDrawerSide): string {
  return panelTransitionClass[side]
}
