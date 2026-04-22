export type DsDialogSize = 'sm' | 'md' | 'lg' | 'xl' | 'full'

export interface DsDialogSectionConfig {
  paddingX?: string
  paddingY?: string
  bordered?: boolean
}

export const DEFAULT_DS_DIALOG_HEADER_CONFIG: Required<DsDialogSectionConfig> = {
  paddingX: 'px-5',
  paddingY: 'py-3',
  bordered: true,
}

export const DEFAULT_DS_DIALOG_FOOTER_CONFIG: Required<DsDialogSectionConfig> = {
  paddingX: 'px-5',
  paddingY: 'py-4',
  bordered: true,
}

// `DsDialog` уважает `paddingX/paddingY` из `bodyConfig`, а `bordered` игнорирует
// (у body-секции нет разумной «верхней» рамки отдельно от хедера/футера).
export const DEFAULT_DS_DIALOG_BODY_CONFIG: Required<DsDialogSectionConfig> = {
  paddingX: 'px-5',
  paddingY: 'py-5',
  bordered: false,
}

export function resolveDsDialogSectionConfig(
  config: DsDialogSectionConfig | undefined,
  defaults: Required<DsDialogSectionConfig>,
): Required<DsDialogSectionConfig> {
  return {
    paddingX: config?.paddingX ?? defaults.paddingX,
    paddingY: config?.paddingY ?? defaults.paddingY,
    bordered: config?.bordered ?? defaults.bordered,
  }
}

/**
 * Нормализует title: пустые/пробельные значения считаются отсутствующими.
 * Единый источник истины для `DsDialog` и `DsDialogHeader`.
 */
export function resolveDsDialogTitle(raw: string | undefined): string | undefined {
  return raw?.trim() || undefined
}
