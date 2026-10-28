import type { GrComponentSize } from '../shared/sizes'
import { overlayListPanelClass } from '../shared/overlayListPanel'
import { overlayPanelSurfaceClass } from '../shared/overlayPanelSurface'

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
/**
 * Группа опций: заголовок `label` + вложенные опции `options`.
 *
 * Форма та же, что у `GrSelect`: два соседних контрола, у которых списки
 * различаются только способом ввода, обязаны принимать данные одинаково.
 */
export type GrAutocompleteOptionGroup<TValue extends GrAutocompleteValue = string> = {
  label: string
  options: GrAutocompleteOption<TValue>[]
}

/** Элемент списка: либо одиночная опция, либо группа. */
export type GrAutocompleteOptionOrGroup<TValue extends GrAutocompleteValue = string>
  = | GrAutocompleteOption<TValue>
    | GrAutocompleteOptionGroup<TValue>

/** Группа опознаётся по наличию вложенного списка, а не по служебному полю. */
export function isAutocompleteOptionGroup<TValue extends GrAutocompleteValue>(
  item: GrAutocompleteOptionOrGroup<TValue>,
): item is GrAutocompleteOptionGroup<TValue> {
  return Array.isArray((item as GrAutocompleteOptionGroup<TValue>).options)
}

export type GrAutocompleteModelValue<TValue extends GrAutocompleteValue = string> = TValue | TValue[]

/**
 * Оболочка — flex-контейнер с `flex-wrap`, чтобы чипы в `multiple` переносились и
 * коробка росла в высоту. Рамку рисует лист поля (`GrInput`), кольцо — по
 * `focus-within`: фокус живёт на вложенном `<input role="combobox">`. Цвет текста
 * — утилитой: `docs/field.md`.
 */
export const autocompleteShellBase = 'relative flex w-full flex-wrap items-center gap-1'

export const autocompleteSizeClassBySize: Record<GrAutocompleteSize, string> = {
  xs: 'px-2.5 py-1 text-[length:var(--gr-control-text-xs)] leading-[var(--gr-control-leading-xs)]',
  sm: 'px-3 py-1 text-[length:var(--gr-control-text-sm)] leading-[var(--gr-control-leading-sm)]',
  md: 'px-3 py-1.5 text-[length:var(--gr-control-text-md)] leading-[var(--gr-control-leading-md)]',
  lg: 'px-4 py-2 text-[length:var(--gr-control-text-lg)] leading-[var(--gr-control-leading-lg)]',
}

export function autocompleteShellClass(options: { size: GrAutocompleteSize, disabled: boolean }): string {
  return [
    autocompleteShellBase,
    autocompleteSizeClassBySize[options.size],
    options.disabled ? 'text-[var(--gr-disabled-fg)]' : 'text-[var(--gr-fg)]',
  ].join(' ')
}

/** Общая подсветка наведения и активной опции. */
const autocompleteOptionHighlight = 'bg-[var(--gr-autocomplete-option-active-bg)]'

export const autocompleteOptionBaseClass = 'w-full rounded-[var(--gr-radius-md)] px-3 py-2 text-left text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)]'
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

/**
 * Строка состояния панели: загрузка, «введите ещё N», «ничего не найдено».
 *
 * По центру и с двойным вертикальным воздухом — как у `GrSelect` и палитры команд.
 * Слева, как у опций, она стоять не может: опции лежат внутри listbox с его `p-1`,
 * а состояние — сиблинг, и текст расходился с опциями на 4px.
 */
export const autocompleteStateClass = 'flex items-center justify-center gap-2 px-3 py-4 text-center text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-muted-fg)]'

/**
 * Панель списка опций — тот же «язык» поверхностей, что у `GrSelect`
 * (card + бордер + shadow-2 + скругление). Держим локальную копию строки,
 * чтобы не тянуть зависимость от `GrSelect` (компоненты гранулярно независимы).
 */
export const autocompletePanelClasses = `${overlayPanelSurfaceClass} ${overlayListPanelClass} overflow-hidden`
