/**
 * Арифметика липкой панели. Без Vue и без DOM — проверяется без монтирования.
 *
 * Вынесено сюда всё, что в jsdom не проверяется в принципе: там нет раскладки,
 * `getBoundingClientRect` отдаёт нули, а `getComputedStyle(el).top` при классовой
 * вёрстке всегда `auto`, потому что UnoCSS в тестах не исполняется. Через
 * смонтированный компонент ни одна ветка ниже не достижима — здесь достижимы все.
 */

export const GR_AFFIX_PLACEMENTS = ['top', 'bottom'] as const

export type GrAffixPlacement = typeof GR_AFFIX_PLACEMENTS[number]

/** Предок делает из себя скроллпорт и прокручивается: `sticky` внутри работает. */
const SCROLLABLE = new Set(['auto', 'scroll', 'overlay'])

/** Предок делает из себя скроллпорт, но прокручивать его нечем: `sticky` внутри мёртв. */
const CLIPPING = new Set(['hidden', 'clip'])

/**
 * Значение пропа `offset` в CSS-длину для инлайновой переменной.
 *
 * Строка уходит как есть и намеренно не валидируется: `4rem`,
 * `var(--gr-navbar-height)`, `calc(var(--gr-navbar-height) + 8px)` обязаны работать — иначе проп
 * проигрывает голому `style`. Отрицательное число зажимается в ноль: отрицательный
 * порог у `sticky` прячет панель за край, и это всегда ошибка, а не приём.
 *
 * `undefined` означает «не писать переменную вовсе» — тогда класс падает на
 * `var(--gr-affix-offset, 0px)`, то есть на каскад.
 */
export function affixOffsetLength(value: number | string | undefined): string | undefined {
  if (value == null)
    return undefined

  if (typeof value === 'number') {
    if (!Number.isFinite(value))
      return undefined

    // Число выносится в переменную, чтобы литерал остался одним токеном:
    // safelist-гейт разбирает шаблонные строки по пробелам и обломок вроде
    // `value)}px` принимает за утилиту UnoCSS — которой он, по совпадению, и
    // оказывается.
    const px = Math.max(0, value)

    return `${px}px`
  }

  const trimmed = value.trim()

  return trimmed === '' ? undefined : trimmed
}

/**
 * `rootMargin` наблюдателя: поджимает ровно тот край, к которому прилипаем, ровно
 * на отступ. Тогда `rootBounds` записи — это и есть линия прилипания, и состояние
 * читается сравнением двух чисел.
 *
 * Единицы только `px`: `rootMargin` процентов не по осям и произвольных длин не
 * принимает, поэтому отступ приходит сюда уже замеренным.
 */
export function affixRootMargin(placement: GrAffixPlacement, offsetPx: number): string {
  const px = Number.isFinite(offsetPx) ? Math.max(0, Math.round(offsetPx)) : 0
  const negative = -px
  const inset = `${negative}px`
  const zero = '0px'

  return placement === 'top'
    ? [inset, zero, zero, zero].join(' ')
    : [zero, zero, inset, zero].join(' ')
}

/** Прямоугольники одной записи наблюдателя — ровно то, что из неё читается. */
export interface GrAffixEntryGeometry {
  boundingClientRect: { top: number, bottom: number }
  rootBounds: { top: number, bottom: number } | null
}

/**
 * Прилипло ли — по одной записи наблюдателя.
 *
 * Считаем по прямоугольникам, а не по `isIntersecting`: тот означает сразу две
 * разные вещи — «сентинел ещё не доехал до линии» и «уже уехал за неё», — и
 * различает их только геометрия, которую запись и так несёт.
 *
 * `rootBounds` уже поджат `rootMargin`'ом (так определено спецификацией), поэтому
 * его край и есть линия прилипания.
 */
export function isAffixStuck(
  entry: GrAffixEntryGeometry,
  placement: GrAffixPlacement,
  previous: boolean,
): boolean {
  const bounds = entry.rootBounds
  // Пустой `rootBounds` бывает в кросс-доменном фрейме. Гадать там не на чем, и
  // прошлое состояние честнее выдуманного.
  if (!bounds)
    return previous

  return placement === 'top'
    ? entry.boundingClientRect.top < bounds.top
    : entry.boundingClientRect.bottom > bounds.bottom
}

/** Один предок в том виде, в каком его видит компонент. */
export interface GrAffixAncestor {
  /** Что вернул `getComputedStyle(el).overflowY`. */
  overflowY: string
  /** Метка для текста предупреждения: тег плюс классы. */
  label: string
}

export interface GrAffixScrollScan {
  /** Индекс предка-скроллера в переданном списке; `-1` — прокручивается вьюпорт. */
  scrollerIndex: number
  /** Предок, который стал скроллпортом раньше скроллера: внутри него `sticky` мёртв. */
  clipperLabel: string | null
}

/**
 * Один проход по цепочке предков, два ответа: root наблюдателя и повод для
 * dev-предупреждения.
 *
 * Читается вычисленный `overflow-y`, а не объявленный и не классы, и это не
 * придирка: при `overflow-x: hidden; overflow-y: visible` спецификация превращает
 * вычисленный `overflow-y` в `auto` — предок действительно становится рабочим
 * скроллпортом. Проверка по классу `overflow-x-hidden` дала бы здесь ложную
 * тревогу на совершенно исправной вёрстке.
 *
 * Обход останавливается на первом скроллере: всё выше него к прилипанию отношения
 * не имеет, поэтому и клипер над скроллером виновным не считается. Ровно такая
 * пара есть в витрине — внешняя панель `overflow-hidden`, внутри `overflow-y-auto`.
 */
export function scanAffixAncestors(ancestors: readonly GrAffixAncestor[]): GrAffixScrollScan {
  let clipperLabel: string | null = null

  for (let index = 0; index < ancestors.length; index += 1) {
    const { overflowY, label } = ancestors[index]

    if (SCROLLABLE.has(overflowY))
      return { scrollerIndex: index, clipperLabel }

    if (clipperLabel === null && CLIPPING.has(overflowY))
      clipperLabel = label
  }

  return { scrollerIndex: -1, clipperLabel }
}
