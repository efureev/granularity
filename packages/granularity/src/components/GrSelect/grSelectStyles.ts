import type { GrComponentSize, GrControlState } from '../shared/sizes'

export type GrSelectView = 'default' | 'link'
export type GrSelectSize = GrComponentSize
export type GrSelectVariant = 'primary' | 'default' | 'muted' | 'danger'
export type GrSelectUnderline = 'auto' | 'always' | 'none'
export type GrSelectOptionsView = 'native' | 'panel'
/**
 * Тип значения опции. Ограничен примитивами, которые переживают путь через DOM:
 * нативный `<select>` хранит в `option.value` только строку, поэтому значение
 * должно однозначно восстанавливаться из своего строкового представления.
 * Объектные модели потребовали бы отдельного key-экстрактора — см. `docs/components.md`.
 */
/**
 * Значение опции. Объект допустим, но тогда обязателен проп `valueKey`: в DOM
 * значение живёт строкой, и без ключа объекты неотличимы друг от друга.
 */
export type GrSelectValue = string | number | object
export type GrSelectState = GrControlState

export type GrSelectOption<TValue extends GrSelectValue = string> = {
  value: TValue
  label: string
  disabled?: boolean
}
/** Группа опций: заголовок `label` + вложенные опции `options`. */
export type GrSelectOptionGroup<TValue extends GrSelectValue = string> = {
  label: string
  options: GrSelectOption<TValue>[]
}
/** Элемент списка опций: либо одиночная опция, либо группа опций. */
export type GrSelectOptionOrGroup<TValue extends GrSelectValue = string> =
  | GrSelectOption<TValue>
  | GrSelectOptionGroup<TValue>
export type GrSelectModelValue<TValue extends GrSelectValue = string> = TValue | TValue[]

export const defaultBaseClass = 'w-full rounded-[var(--gr-radius-control)] border bg-[var(--gr-bg)] text-[var(--gr-fg)] transition-colors duration-[var(--gr-duration-fast)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)]'

/**
 * Цвет рамки по состоянию — та же карта, что у `GrInput` и `GrTextarea`: поля
 * одной формы обязаны показывать ошибку одинаково.
 */
export const borderClassByState: Record<GrSelectState, string> = {
  default: 'border-[var(--gr-brd)]',
  success: 'border-[var(--gr-success)] focus-visible:ring-[var(--gr-success)]',
  warning: 'border-[var(--gr-warning)] focus-visible:ring-[var(--gr-warning)]',
  danger: 'border-[var(--gr-danger)] focus-visible:ring-[var(--gr-danger)]',
}

/**
 * Ошибка валидации красится своей ролью, а не декоративным тоном `danger`:
 * `state="danger"` — это подсветка по решению разработчика, `invalid` — вердикт
 * валидации, и тема вправе развести их по цвету.
 */
export const invalidBorderClass = 'border-[var(--gr-invalid-brd)] focus-visible:ring-[var(--gr-invalid-ring)]'
export const linkBaseClass = 'cursor-pointer inline-block w-auto align-baseline appearance-none bg-transparent border border-transparent px-0 py-0 rounded-[var(--gr-radius-control)] transition-colors duration-[var(--gr-duration-fast)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)]'


export const selectSizeClassBySize: Record<GrSelectSize, string> = {
  xs: 'h-7 px-2.5 text-[length:var(--gr-control-text-xs)] leading-[var(--gr-control-leading-xs)]',
  sm: 'h-8 px-3 text-[length:var(--gr-control-text-sm)] leading-[var(--gr-control-leading-sm)]',
  md: 'h-10 px-3 text-[length:var(--gr-control-text-md)] leading-[var(--gr-control-leading-md)]',
  lg: 'h-11 px-4 text-[length:var(--gr-control-text-lg)] leading-[var(--gr-control-leading-lg)]',
}

export const selectLinkSizeClassBySize: Record<GrSelectSize, string> = {
  xs: 'text-[length:var(--gr-control-text-xs)] leading-[var(--gr-control-leading-xs)]',
  sm: 'text-[length:var(--gr-control-text-sm)] leading-[var(--gr-control-leading-sm)]',
  md: 'text-[length:var(--gr-control-text-md)] leading-[var(--gr-control-leading-md)]',
  lg: 'text-[length:var(--gr-control-text-lg)] leading-[var(--gr-control-leading-lg)]',
}

/**
 * Ссылка — это ТЕКСТ на фоне страницы, поэтому опасный тон берётся из
 * `--gr-danger-text`, а не из насыщенного `--gr-danger` (последний под текст не
 * рассчитан). Hover/active выводятся подмесом `--gr-fg` — той же формулой, что
 * `GrLink`. `primary` берётся из `--gr-primary-text` по той же причине: на фоне
 * страницы насыщенный `--gr-primary` под текст не рассчитан.
 *
 * Классы записаны литералами, а не собраны интерполяцией: safelist и скан
 * UnoCSS читают исходник, и вычисленная строка для них не класс.
 */
export const selectLinkVariantClassByVariant: Record<GrSelectVariant, string> = {
  primary: 'text-[var(--gr-primary-text)] hover:text-[color-mix(in_srgb,var(--gr-primary-text)_92%,var(--gr-fg))] active:text-[color-mix(in_srgb,var(--gr-primary-text)_84%,var(--gr-fg))]',
  default: 'text-[var(--gr-fg)] hover:text-[var(--gr-primary-text)] active:text-[color-mix(in_srgb,var(--gr-primary-text)_84%,var(--gr-fg))]',
  muted: 'text-[var(--gr-muted-fg)] hover:text-[var(--gr-fg)] active:text-[var(--gr-fg)]',
  danger: 'text-[var(--gr-danger-text)] hover:text-[color-mix(in_srgb,var(--gr-danger-text)_92%,var(--gr-fg))] active:text-[color-mix(in_srgb,var(--gr-danger-text)_84%,var(--gr-fg))]',
}

/**
 * Variant-классы для видимой метки в `view="link"` + `optionsView="native"`.
 * Hover-цвет приходит через `peer-hover:` от прозрачного `<select>`-overlay,
 * т.к. видимая метка имеет `pointer-events-none` и не получает hover напрямую.
 */
export const selectLinkNativeLabelVariantClassByVariant: Record<GrSelectVariant, string> = {
  primary: 'text-[var(--gr-primary-text)] peer-hover:text-[color-mix(in_srgb,var(--gr-primary-text)_92%,var(--gr-fg))] peer-active:text-[color-mix(in_srgb,var(--gr-primary-text)_84%,var(--gr-fg))]',
  default: 'text-[var(--gr-fg)] peer-hover:text-[var(--gr-primary-text)] peer-active:text-[color-mix(in_srgb,var(--gr-primary-text)_84%,var(--gr-fg))]',
  muted: 'text-[var(--gr-muted-fg)] peer-hover:text-[var(--gr-fg)] peer-active:text-[var(--gr-fg)]',
  danger: 'text-[var(--gr-danger-text)] peer-hover:text-[color-mix(in_srgb,var(--gr-danger-text)_92%,var(--gr-fg))] peer-active:text-[color-mix(in_srgb,var(--gr-danger-text)_84%,var(--gr-fg))]',
}

function selectLinkUnderlineClass(options: { underline: GrSelectUnderline, disabled: boolean }): string {
  if (options.disabled) return 'no-underline'
  if (options.underline === 'always') return 'underline underline-offset-4'
  if (options.underline === 'none') return 'no-underline'
  return 'no-underline hover:underline hover:underline-offset-4'
}

/**
 * Underline-классы для видимой метки в `view="link"` + `optionsView="native"`.
 * Видимая метка имеет `pointer-events-none`, а hover получает прозрачный
 * `<select>`-overlay (peer), поэтому для `underline="auto"` используем
 * `peer-hover:underline` вместо `hover:underline`.
 */
function selectLinkNativeLabelUnderlineClass(options: { underline: GrSelectUnderline, disabled: boolean }): string {
  if (options.disabled) return 'no-underline'
  if (options.underline === 'always') return 'underline underline-offset-4'
  if (options.underline === 'none') return 'no-underline'
  return 'no-underline peer-hover:underline peer-hover:underline-offset-4'
}

/**
 * Классы прозрачного `<select>`-overlay для `view="link"` + `optionsView="native"`.
 * Нативный селект растягивается на всю обёртку, но визуально невидим — ширину обёртки
 * задаёт видимый `<span>` с выбранной меткой, благодаря чему компонент в закрытом
 * состоянии занимает столько места, сколько нужно текущей опции (а не самой длинной).
 */
export const grSelectLinkNativeOverlayClass = 'peer absolute inset-0 w-full h-full m-0 p-0 border-0 bg-transparent text-transparent appearance-none opacity-0 cursor-pointer disabled:cursor-not-allowed focus:outline-none'

/**
 * Классы видимой метки для `view="link"` + `optionsView="native"` (поверх прозрачного `<select>`).
 * Получает все link-стили (size/variant/underline), а также focus-ring через `peer-focus-visible`.
 */
export const grSelectLinkNativeLabelBaseClass = 'pointer-events-none inline-block whitespace-nowrap align-baseline rounded-[var(--gr-radius-control)] transition-colors duration-[var(--gr-duration-fast)]'
export const grSelectLinkNativeLabelDisabledClass = 'cursor-not-allowed text-[var(--gr-muted-fg)] no-underline'
export const grSelectLinkNativeLabelFocusClass = 'peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--gr-ring)]'

export function grSelectLinkNativeLabelClass(options: {
  size: GrSelectSize
  variant: GrSelectVariant
  underline: GrSelectUnderline
  disabled: boolean
}): string {
  return [
    grSelectLinkNativeLabelBaseClass,
    selectLinkSizeClassBySize[options.size],
    selectLinkNativeLabelUnderlineClass({ underline: options.underline, disabled: options.disabled }),
    selectLinkNativeLabelVariantClassByVariant[options.variant],
    options.disabled ? grSelectLinkNativeLabelDisabledClass : '',
    grSelectLinkNativeLabelFocusClass,
  ]
    .filter(Boolean)
    .join(' ')
}

export function grSelectClass(options: {
  view: GrSelectView
  size: GrSelectSize
  disabled: boolean
  variant: GrSelectVariant
  underline: GrSelectUnderline
  state?: GrSelectState
  invalid?: boolean
}): string {
  if (options.view === 'link') {
    return [
      selectLinkSizeClassBySize[options.size],
      selectLinkUnderlineClass({ underline: options.underline, disabled: options.disabled }),
      selectLinkVariantClassByVariant[options.variant],
      'disabled:cursor-not-allowed disabled:text-[var(--gr-muted-fg)] disabled:no-underline',
    ].join(' ')
  }

  return [
    selectSizeClassBySize[options.size],
    // `invalid` сильнее `state`: ошибка перекрывает любую другую подсветку.
    options.invalid ? invalidBorderClass : borderClassByState[options.state ?? 'default'],
    // Заблокированный контрол гасится фоном и цветом текста, а не `opacity`:
    // прозрачность разбавляет выверенные на AA токены и роняет контраст.
    'disabled:cursor-not-allowed disabled:bg-[var(--gr-muted)] disabled:text-[var(--gr-muted-fg)]',
  ].join(' ')
}

export function grSelectNativeClass(options: {
  view: GrSelectView
  size: GrSelectSize
  disabled: boolean
  variant: GrSelectVariant
  underline: GrSelectUnderline
  showNativeChevron: boolean
  state?: GrSelectState
  invalid?: boolean
}): string {
  return [
    grSelectClass(options),
    options.showNativeChevron ? 'appearance-none pr-9' : '',
  ]
    .filter(Boolean)
    .join(' ')
}

export function grSelectTriggerClass(options: {
  view: GrSelectView
  optionsView: GrSelectOptionsView
  size: GrSelectSize
  disabled: boolean
  variant: GrSelectVariant
  underline: GrSelectUnderline
  state?: GrSelectState
  invalid?: boolean
}): string {
  if (options.optionsView !== 'panel') {
    return grSelectClass(options)
  }

  if (options.view === 'link') {
    return [
      grSelectClass(options),
      'inline-flex items-center gap-1 text-left',
    ].join(' ')
  }

  return [
    grSelectClass(options),
    'flex items-center justify-between text-left',
  ].join(' ')
}

export const grSelectPanelClasses = 'rounded-[var(--gr-radius-xl)] border border-[var(--gr-brd)] bg-[var(--gr-card)] text-[var(--gr-card-fg)] shadow-[var(--gr-shadow-2)] overflow-hidden'

/** Общая подсветка наведения и активной опции панели. */
const selectOptionHighlight = 'bg-[color-mix(in_srgb,var(--gr-muted)_30%,transparent)]'

export const selectOptionBaseClass = 'rounded-[var(--gr-radius-md)] px-3 py-2 text-left text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)]'
export const selectOptionLinkWidthClass = 'block min-w-full w-max whitespace-nowrap'
export const selectOptionWidthClass = 'w-full'
export const selectOptionEnabledClass = `hover:${selectOptionHighlight}`
export const selectOptionActiveClass = selectOptionHighlight
/** Выключенная опция гасится токеном текста — по той же причине, что и контрол. */
export const selectOptionDisabledClass = 'cursor-not-allowed text-[var(--gr-muted-fg)]'

export function grSelectOptionClass(options: {
  view: GrSelectView
  disabled: boolean
  active: boolean
}): string {
  return [
    selectOptionBaseClass,
    options.view === 'link' ? selectOptionLinkWidthClass : selectOptionWidthClass,
    options.disabled ? selectOptionDisabledClass : selectOptionEnabledClass,
    !options.disabled && options.active ? selectOptionActiveClass : '',
  ]
    .filter(Boolean)
    .join(' ')
}
