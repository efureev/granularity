export type GrDialogSize = 'sm' | 'md' | 'lg' | 'xl' | 'full'

export interface GrDialogSectionConfig {
  paddingX?: string
  paddingY?: string
  bordered?: boolean
}

export const DEFAULT_GR_DIALOG_HEADER_CONFIG: Required<GrDialogSectionConfig> = {
  paddingX: 'px-5',
  paddingY: 'py-3',
  bordered: true,
}

export const DEFAULT_GR_DIALOG_FOOTER_CONFIG: Required<GrDialogSectionConfig> = {
  paddingX: 'px-5',
  paddingY: 'py-4',
  bordered: true,
}

// `GrDialog` уважает `paddingX/paddingY` из `bodyConfig`, а `bordered` игнорирует
// (у body-секции нет разумной «верхней» рамки отдельно от хедера/футера).
export const DEFAULT_GR_DIALOG_BODY_CONFIG: Required<GrDialogSectionConfig> = {
  paddingX: 'px-5',
  paddingY: 'py-5',
  bordered: false,
}

export function resolveGrDialogSectionConfig(
  config: GrDialogSectionConfig | undefined,
  defaults: Required<GrDialogSectionConfig>,
): Required<GrDialogSectionConfig> {
  return {
    paddingX: config?.paddingX ?? defaults.paddingX,
    paddingY: config?.paddingY ?? defaults.paddingY,
    bordered: config?.bordered ?? defaults.bordered,
  }
}

/**
 * Нормализует title: пустые/пробельные значения считаются отсутствующими.
 * Единый источник истины для `GrDialog` и `GrDialogHeader`.
 */
export function resolveGrDialogTitle(raw: string | undefined): string | undefined {
  return raw?.trim() || undefined
}
