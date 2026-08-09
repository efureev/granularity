import type { GrComponentSize } from '../shared/sizes'

export type GrAutocompleteSize = GrComponentSize
/**
 * Тип значения опции — те же примитивы, что у `GrSelect`: значение должно
 * однозначно восстанавливаться из строкового представления.
 */
export type GrAutocompleteValue = string | number

/** Опция автокомплита. Метка — строка, значение параметризуется. */
export type GrAutocompleteOption<TValue extends GrAutocompleteValue = string> = {
  value: TValue
  label: string
  disabled?: boolean
}
export type GrAutocompleteModelValue<TValue extends GrAutocompleteValue = string> = TValue | TValue[]

/**
 * Оболочка (визуально повторяет `GrInput`): бордер + focus-ring по `focus-within`,
 * т.к. фокус живёт на вложенном `<input role="combobox">`. Flex-контейнер с
 * `flex-wrap` — чтобы chips в multiple-режиме переносились и коробка росла в высоту.
 */
export const autocompleteShellBase = 'relative flex w-full flex-wrap items-center gap-1 rounded-md border text-[var(--gr-fg)] transition-colors duration-[var(--gr-duration-fast)] focus-within:ring-2 focus-within:ring-[var(--gr-ring)]'

export const autocompleteShellEnabledClass = 'bg-[var(--gr-bg)]'

/**
 * Заблокированная оболочка гасится фоном, а не `opacity` (как `GrInput`):
 * прозрачность разбавляет выверенные на AA токены текста и роняет контраст.
 * Фон взаимоисключающий с `autocompleteShellEnabledClass` — два `bg-*` одной
 * специфичности разрулил бы порядок в сгенерированном CSS, а не порядок в
 * списке классов.
 */
export const autocompleteShellDisabledClass = 'bg-[var(--gr-muted)] text-[var(--gr-muted-fg)] cursor-not-allowed'

/**
 * Ошибка валидации красится своей ролью, а не декоративным тоном `danger`:
 * тема вправе развести вердикт валидации и подсветку по решению разработчика.
 */
export const invalidShellClass = 'border-[var(--gr-invalid-brd)] focus-within:ring-[var(--gr-invalid-ring)]'

// Размеры совпадают с `GrInput`/`GrSelect` (h → min-h, чтобы multiple мог расти).
export const autocompleteSizeClassBySize: Record<GrAutocompleteSize, string> = {
  xs: 'min-h-7 px-2.5 py-1 text-[length:var(--gr-control-text-xs)]',
  sm: 'min-h-8 px-3 py-1 text-[length:var(--gr-control-text-sm)]',
  md: 'min-h-10 px-3 py-1.5 text-[length:var(--gr-control-text-md)]',
  lg: 'min-h-11 px-4 py-2 text-[length:var(--gr-control-text-lg)]',
}

// Chip (multiple): удаляемый тег выбранного значения перед инпутом.
export const autocompleteChipClass = 'inline-flex max-w-full items-center gap-1 rounded-[var(--gr-radius-chip)] bg-[color-mix(in_srgb,var(--gr-muted)_35%,transparent)] px-1.5 py-0.5 text-[length:var(--gr-control-text-xs)] leading-tight text-[var(--gr-fg)]'

export function autocompleteShellClass(options: {
  size: GrAutocompleteSize
  disabled: boolean
  invalid: boolean
}): string {
  return [
    autocompleteShellBase,
    autocompleteSizeClassBySize[options.size],
    options.invalid ? invalidShellClass : 'border-[var(--gr-brd)]',
    options.disabled ? autocompleteShellDisabledClass : autocompleteShellEnabledClass,
  ]
    .filter(Boolean)
    .join(' ')
}

/** Общая подсветка наведения и активной опции. */
const autocompleteOptionHighlight = 'bg-[color-mix(in_srgb,var(--gr-muted)_30%,transparent)]'

export const autocompleteOptionBaseClass = 'w-full rounded-[var(--gr-radius-md)] px-3 py-2 text-left text-[length:var(--gr-text-sm)]'
export const autocompleteOptionActiveClass = autocompleteOptionHighlight
export const autocompleteOptionEnabledClass = `hover:${autocompleteOptionHighlight}`
/** Выключенная опция гасится токеном текста — по той же причине, что и оболочка. */
export const autocompleteOptionDisabledClass = 'cursor-not-allowed text-[var(--gr-muted-fg)]'

export function autocompleteOptionClass(options: { disabled: boolean, active: boolean }): string {
  return [
    autocompleteOptionBaseClass,
    options.disabled ? autocompleteOptionDisabledClass : autocompleteOptionEnabledClass,
    !options.disabled && options.active ? autocompleteOptionActiveClass : '',
  ]
    .filter(Boolean)
    .join(' ')
}

/** Строка состояния панели: загрузка, «введите ещё N», «ничего не найдено». */
export const autocompleteStateClass = 'flex items-center gap-2 px-3 py-2 text-[length:var(--gr-text-sm)] text-[var(--gr-muted-fg)]'

/**
 * Панель списка опций — тот же «язык» поверхностей, что у `GrSelect`
 * (card + бордер + shadow-2 + скругление). Держим локальную копию строки,
 * чтобы не тянуть зависимость от `GrSelect` (компоненты гранулярно независимы).
 */
export const autocompletePanelClasses = 'rounded-[var(--gr-radius-xl)] border border-[var(--gr-brd)] bg-[var(--gr-card)] text-[var(--gr-card-fg)] shadow-[var(--gr-shadow-2)] overflow-hidden'
