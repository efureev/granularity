export type GrAutocompleteSize = 'xs' | 'sm' | 'md' | 'lg'
/** Опция автокомплита. Значение и метка — строки (как у `GrSelect`). */
export type GrAutocompleteOption = { value: string, label: string, disabled?: boolean }
export type GrAutocompleteModelValue = string | string[]

/**
 * Оболочка (визуально повторяет `GrInput`): бордер + focus-ring по `focus-within`,
 * т.к. фокус живёт на вложенном `<input role="combobox">`. Flex-контейнер с
 * `flex-wrap` — чтобы chips в multiple-режиме переносились и коробка росла в высоту.
 */
export const autocompleteShellBase = 'relative flex w-full flex-wrap items-center gap-1 rounded-md border bg-[var(--bg)] text-[var(--fg)] transition-colors duration-150 focus-within:ring-2 focus-within:ring-[var(--ring)]'

// Размеры совпадают с `GrInput`/`GrSelect` (h → min-h, чтобы multiple мог расти).
export const autocompleteSizeClassBySize: Record<GrAutocompleteSize, string> = {
  xs: 'min-h-7 px-2.5 py-1 text-[12px]',
  sm: 'min-h-8 px-3 py-1 text-[13px]',
  md: 'min-h-10 px-3 py-1.5 text-[14px]',
  lg: 'min-h-11 px-4 py-2 text-[16px]',
}

// Chip (multiple): удаляемый тег выбранного значения перед инпутом.
export const autocompleteChipClass = 'inline-flex max-w-full items-center gap-1 rounded-[6px] bg-[color-mix(in_srgb,var(--muted)_35%,transparent)] px-1.5 py-0.5 text-[12px] leading-tight text-[var(--fg)]'

export function autocompleteShellClass(options: {
  size: GrAutocompleteSize
  disabled: boolean
  invalid: boolean
}): string {
  return [
    autocompleteShellBase,
    autocompleteSizeClassBySize[options.size],
    options.invalid ? 'border-[var(--gr-danger)] focus-within:ring-[var(--gr-danger)]' : 'border-[var(--brd)]',
    options.disabled ? 'cursor-not-allowed opacity-50' : '',
  ]
    .filter(Boolean)
    .join(' ')
}

/**
 * Панель списка опций — тот же «язык» поверхностей, что у `GrSelect`
 * (card + бордер + shadow-2 + скругление). Держим локальную копию строки,
 * чтобы не тянуть зависимость от `GrSelect` (компоненты гранулярно независимы).
 */
export const autocompletePanelClasses = 'rounded-[var(--gr-radius-xl)] border border-[var(--brd)] bg-[var(--card)] text-[var(--card-fg)] shadow-[var(--gr-shadow-2)] overflow-hidden'
