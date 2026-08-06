import type { GrOverlaySize } from '../shared/sizes'

export type GrCommandPaletteSize = GrOverlaySize

/**
 * Кастомизация через CSS-переменные:
 *
 * - `--gr-command-active-bg` — фон активной (подсвеченной) команды.
 * - `--gr-command-match-bg` — фон совпавшего с запросом фрагмента.
 * - `--gr-command-list-max-height` — максимальная высота списка (иначе — проп `maxHeight`).
 */

// Размер палитры ложится на размеры панели `GrModal` — палитра не изобретает свои ширины.
export const commandPaletteModalSizeBySize: Record<GrCommandPaletteSize, GrOverlaySize> = {
  sm: 'sm',
  md: 'md',
  lg: 'lg',
  xl: 'xl',
  full: 'full',
}

export const commandSearchRowClass = 'flex items-center gap-2 border-b border-[var(--gr-brd)] px-4'
export const commandSearchInputClass = 'min-w-0 flex-1 bg-transparent py-3.5 text-[15px] text-[var(--gr-fg)] placeholder:text-[var(--gr-muted-fg)] focus:outline-none'

export const commandGroupLabelClass = 'px-3 pb-1 pt-3 text-[11px] font-medium uppercase tracking-wide text-[var(--gr-muted-fg)]'

/** Описание под меткой команды. */
export const commandItemDescriptionClass = 'block truncate text-[length:var(--gr-text-xs)] text-[var(--gr-muted-fg)]'

/** Совпавший с запросом фрагмент. Фон — тот же токен подсветки, что у активной строки. */
export const commandMatchClass = 'rounded-[3px] bg-[var(--gr-command-match-bg,color-mix(in_srgb,var(--gr-primary)_22%,transparent))] text-[var(--gr-fg)]'

export const commandItemBaseClass = 'flex w-full items-center gap-3 rounded-[10px] px-3 py-2 text-left text-[14px] text-[var(--gr-fg)]'
export const commandItemActiveClass = 'bg-[var(--gr-command-active-bg,color-mix(in_srgb,var(--gr-muted)_45%,transparent))]'
export const commandItemDisabledClass = 'cursor-not-allowed opacity-50'

export function commandItemClass(options: { active: boolean, disabled: boolean }): string {
  return [
    commandItemBaseClass,
    options.disabled ? commandItemDisabledClass : 'cursor-pointer',
    options.active && !options.disabled ? commandItemActiveClass : '',
  ]
    .filter(Boolean)
    .join(' ')
}

export const commandEmptyClass = 'px-4 py-10 text-center text-[13px] text-[var(--gr-muted-fg)]'
export const commandFooterClass = 'flex items-center gap-3 border-t border-[var(--gr-brd)] px-4 py-2 text-[11px] text-[var(--gr-muted-fg)]'
