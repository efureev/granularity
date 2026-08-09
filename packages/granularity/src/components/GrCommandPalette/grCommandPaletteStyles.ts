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
export const commandSearchInputClass = 'min-w-0 flex-1 bg-transparent py-3.5 text-[length:var(--gr-command-input-font-size,15px)] text-[var(--gr-fg)] placeholder:text-[var(--gr-muted-fg)] focus:outline-none'

export const commandGroupLabelClass = 'px-3 pb-1 pt-3 text-[length:var(--gr-control-text-2xs)] font-medium uppercase tracking-wide text-[var(--gr-muted-fg)]'

/** Описание под меткой команды. Цвет приходит из `commandItemMutedClass`. */
export const commandItemDescriptionClass = 'block truncate text-[length:var(--gr-text-xs)]'

export const commandItemMutedEnabledClass = 'text-[var(--gr-muted-fg)]'
export const commandItemMutedDisabledClass = 'text-[var(--gr-disabled-fg)]'

/**
 * Приглушённые части команды — иконка и описание.
 *
 * Гаснут вместе со строкой: свой `--gr-muted-fg` оставил бы у выключенной
 * команды иконку темнее её же метки.
 */
export function commandItemMutedClass(disabled: boolean): string {
  return disabled ? commandItemMutedDisabledClass : commandItemMutedEnabledClass
}

/** Совпавший с запросом фрагмент. Фон — тот же токен подсветки, что у активной строки. */
export const commandMatchClass = 'rounded-[var(--gr-radius-xs)] bg-[var(--gr-command-match-bg,color-mix(in_srgb,var(--gr-primary)_22%,transparent))] text-[var(--gr-fg)]'

/**
 * Цвета текста в базе нет намеренно: два `text-[…]` в одном списке классов
 * разрешаются порядком правил в сгенерированном CSS, а не порядком в атрибуте, —
 * и цвет выключенной команды молча проигрывал бы базовому.
 */
export const commandItemBaseClass = 'flex w-full items-center gap-3 rounded-[var(--gr-command-item-radius,10px)] px-3 py-2 text-left text-[length:var(--gr-control-text-md)]'
export const commandItemEnabledClass = 'cursor-pointer text-[var(--gr-fg)]'
export const commandItemActiveClass = 'bg-[var(--gr-command-active-bg,color-mix(in_srgb,var(--gr-muted)_45%,transparent))]'
/**
 * Выключенная команда гасится токенами состояния, а не `opacity`: прозрачность
 * разбавляет выверенные на AA токены текста и роняет контраст.
 */
export const commandItemDisabledClass = 'cursor-not-allowed bg-[var(--gr-disabled-bg)] text-[var(--gr-disabled-fg)]'

export function commandItemClass(options: { active: boolean, disabled: boolean }): string {
  return [
    commandItemBaseClass,
    options.disabled ? commandItemDisabledClass : commandItemEnabledClass,
    options.active && !options.disabled ? commandItemActiveClass : '',
  ]
    .filter(Boolean)
    .join(' ')
}

export const commandEmptyClass = 'px-4 py-10 text-center text-[length:var(--gr-control-text-sm)] text-[var(--gr-muted-fg)]'
export const commandFooterClass = 'flex items-center gap-3 border-t border-[var(--gr-brd)] px-4 py-2 text-[length:var(--gr-control-text-2xs)] text-[var(--gr-muted-fg)]'
