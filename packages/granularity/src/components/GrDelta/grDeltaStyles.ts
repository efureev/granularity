import type { GrComponentSize } from '../shared/sizes'

import type { GrDeltaTone } from './deltaTone'

/**
 * Классы `GrDelta`.
 *
 * Тон перечислен целиком по одному литералу на ветку: UnoCSS сканирует исходный
 * текст файла, и собранное шаблонной строкой имя (`text-[var(--gr-${tone}-text)]`)
 * уехало бы в CSS литералом.
 */

/**
 * Величина стоит в строке текста, поэтому наследует её кегль и выравнивание.
 *
 * Общего `gap` нет намеренно: префикс — это валюта, и «$ 12,50» с зазором
 * читается как опечатка. Отбивку получают только стрелка и суффикс.
 */
export const deltaRootClass = 'inline-flex items-baseline tabular-nums'

/**
 * Величина стоит **в строке текста**, и приписка при ней приглушения не
 * получает: «−15 %» набирается кеглем и цветом строки целиком, иначе процент
 * оказывается мельче окружающих слов.
 *
 * Дефолт `GrValue` рассчитан на плитку, где величина крупная и приписке есть
 * куда уменьшаться. Здесь он переопределяется — ровно теми же токенами, что
 * доступны потребителю.
 *
 * `currentColor` и `1em`, а не `inherit`: у пользовательского свойства
 * `inherit` значит «наследовать саму переменную», то есть ничего.
 */
export const deltaValueStyle: Record<string, string> = {
  '--gr-value-suffix-color': 'currentColor',
  '--gr-value-suffix-size': '1em',
}

/** Суффикс — единица измерения, и от числа он отбивается: «−15 %», «120 мс». */

/**
 * Стрелка выравнивается по строке, а не по базовой линии: у svg её нет.
 *
 * Размер — в `em`, потому что на ступени `md` кегля у величины нет вовсе:
 * пиксельная лестница оставила бы стрелку 14-пиксельной внутри заголовка.
 * Чуть меньше единицы: стрелка декоративна, и равный вес спорил бы с самим
 * числом.
 */
export const deltaArrowClass = 'mr-0.5 self-center shrink-0 h-[0.875em] w-[0.875em]'

export const deltaToneClass: Record<GrDeltaTone, string> = {
  success: 'text-[var(--gr-success-text)]',
  danger: 'text-[var(--gr-danger-text)]',
  neutral: 'text-[var(--gr-muted-fg)]',
}

/** Прочерк вместо величины: тона у него нет, но и цвет основного текста ему не нужен. */
export const deltaEmptyClass = 'text-[var(--gr-muted-fg)]'

/**
 * `md` пуст намеренно: на ступени по умолчанию величина набирается кеглем той
 * строки, в которой стоит. Фиксированные 13 px разъезжаются и вверх, и вниз —
 * внутри заголовка величина оставалась бы мелкой, в подписи под графиком
 * крупной. Ступени по краям остаются явными: они нужны, когда величина стоит
 * не в предложении, а в ряду с контролами.
 */
export const deltaSizeClass: Record<GrComponentSize, string> = {
  xs: 'text-[length:var(--gr-control-text-xs)] leading-[var(--gr-control-leading-xs)]',
  sm: 'text-[length:var(--gr-control-text-sm)] leading-[var(--gr-control-leading-sm)]',
  md: '',
  lg: 'text-[length:var(--gr-control-text-lg)] leading-[var(--gr-control-leading-lg)]',
}
