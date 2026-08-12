import type { GrComponentSize } from '@feugene/granularity/components/GrConfigProvider'

/** Шкала размеров одна на всю систему — своего кортежа пакет не заводит. */
export type GrPickerSize = GrComponentSize

/**
 * Классы поля, общие для всех пикеров пакета.
 *
 * Поле собрано своими классами, а не core-`GrInput`: пакет вторичный, и копия
 * класс-строк дешевле, чем сцепка оболочки пикера с поверхностью пропов чужого
 * поля. Расплата известна — копия может отстать от оригинала.
 *
 * Модуль общий, поэтому уезжает в `dist/chunks/`, куда скан `content.filesystem`
 * не заглядывает: пресет сканирует только `dist/components/<Name>/**`. Каждый
 * пикер обязан перечислить эти классы в своём `safelist.ts` — для того тут и
 * экспортируется `pickerFieldSafelist`.
 *
 * Литералов кеглей, радиусов и длительностей здесь нет, как и утилит uno-шкалы
 * (`text-sm`, `rounded-md`): темой они не настраиваются, а выглядят правильно.
 */

export const fieldSizes: Record<GrPickerSize, string> = {
  xs: 'h-7 pl-2.5 text-[length:var(--gr-control-text-xs)]',
  sm: 'h-8 pl-3 text-[length:var(--gr-control-text-sm)]',
  md: 'h-10 pl-3 text-[length:var(--gr-control-text-md)]',
  lg: 'h-11 pl-4 text-[length:var(--gr-control-text-lg)]',
}

export const fieldBaseClass
  = 'w-full cursor-pointer truncate rounded-[var(--gr-radius-control)] border pr-9 '
    + 'transition-colors duration-[var(--gr-duration-fast)] ease-[var(--gr-ease-out)] '
    + 'placeholder:text-[var(--gr-muted-fg)] '
    + 'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)]'

/**
 * Disabled красится фоном и цветом текста, а не прозрачностью: `opacity`
 * разбавляет выверенные на AA токены и роняет контраст подписи.
 */
export const fieldEnabledClass = 'bg-[var(--gr-bg)] text-[var(--gr-fg)] border-[var(--gr-brd)]'
export const fieldDisabledClass
  = 'cursor-not-allowed bg-[var(--gr-disabled-bg)] text-[var(--gr-disabled-fg)] border-[var(--gr-brd)]'

/**
 * Вердикт валидации красится своей ролью, а не декоративным тоном `danger`:
 * тема вправе развести подсветку и ошибку по цвету.
 */
export const fieldInvalidClass = 'border-[var(--gr-invalid-brd)] focus-visible:ring-[var(--gr-invalid-ring)]'

export interface PickerFieldClassOptions {
  size: GrPickerSize
  disabled: boolean
  invalid: boolean
}

export function pickerFieldClass(options: PickerFieldClassOptions): string {
  return [
    fieldBaseClass,
    fieldSizes[options.size],
    options.disabled ? fieldDisabledClass : fieldEnabledClass,
    options.invalid ? fieldInvalidClass : '',
  ].filter(Boolean).join(' ')
}

/** Зона справа: индикатор, спиннер и кнопка очистки лежат друг на друге. */
export const trailingZoneClass = 'absolute inset-y-0 right-2 flex items-center'

export const indicatorClass = 'pointer-events-none text-[var(--gr-muted-fg)]'

export const clearButtonClass
  = 'inline-flex h-6 w-6 items-center justify-center rounded-[var(--gr-radius-sm)] '
    + 'text-[var(--gr-muted-fg)] transition-colors duration-[var(--gr-duration-fast)] ease-[var(--gr-ease-out)] '
    + 'hover:bg-[var(--gr-muted)] hover:text-[var(--gr-fg)] '
    + 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)]'

export const iconClass = 'h-4 w-4'

export const spinnerClass = 'h-4 w-4 animate-spin text-[var(--gr-muted-fg)]'

/**
 * Классы поля для safelist пикера. Ссылки на сами константы, а не их копии
 * строками: копия расходится с оригиналом молча.
 */
export const pickerFieldClassTokens: string[] = [
  fieldBaseClass,
  fieldEnabledClass,
  fieldDisabledClass,
  fieldInvalidClass,
  ...Object.values(fieldSizes),
  trailingZoneClass,
  indicatorClass,
  clearButtonClass,
  iconClass,
  spinnerClass,
]
