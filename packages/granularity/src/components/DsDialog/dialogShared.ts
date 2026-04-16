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

export function getDsDialogPanelClass(size: DsDialogSize): string {
  const widthBySize: Record<DsDialogSize, string> = {
    sm: 'max-w-[420px]',
    md: 'max-w-[560px]',
    lg: 'max-w-[720px]',
    xl: 'max-w-[920px]',
    full: 'max-w-none',
  }

  const radiusBySize: Record<DsDialogSize, string> = {
    sm: 'rounded-[var(--ds-radius-xl)]',
    md: 'rounded-[var(--ds-radius-xl)]',
    lg: 'rounded-[var(--ds-radius-xl)]',
    xl: 'rounded-[var(--ds-radius-xl)]',
    full: 'rounded-none sm:rounded-[var(--ds-radius-xl)]',
  }

  const heightBySize: Record<DsDialogSize, string> = {
    sm: '',
    md: '',
    lg: '',
    xl: '',
    full: 'h-[100svh] sm:h-auto',
  }

  return [
    'w-full overflow-hidden',
    'relative z-10',
    widthBySize[size],
    heightBySize[size],
    radiusBySize[size],
    'border border-[var(--brd)] bg-[var(--card)] text-[var(--card-fg)] shadow-[var(--ds-shadow-2)] outline-none',
  ].join(' ')
}