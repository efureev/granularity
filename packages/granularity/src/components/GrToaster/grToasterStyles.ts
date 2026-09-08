export type GrToasterPlacement = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'

// Классы позиционирования контейнера по углам экрана.
// Вынесены в отдельный модуль, чтобы быть единственным источником истины
// для шаблона `GrToaster.vue` и для safelist.
export const PLACEMENT_CLASS: Record<GrToasterPlacement, string> = {
  'top-right': 'right-4 top-4',
  'top-left': 'left-4 top-4',
  'bottom-right': 'right-4 bottom-4',
  'bottom-left': 'left-4 bottom-4',
}

/**
 * Куда смахивается тост: к своему краю экрана. Стек у правого края уходит
 * вправо, у левого — влево; смахивание «вглубь экрана» читалось бы как попытка
 * достать что-то из-под тоста, а не выбросить его.
 */
export const SWIPE_DIRECTION: Record<GrToasterPlacement, 1 | -1> = {
  'top-right': 1,
  'bottom-right': 1,
  'top-left': -1,
  'bottom-left': -1,
}

/** Доля ширины тоста, после которой отпускание закрывает, а не возвращает. */
export const SWIPE_THRESHOLD_RATIO = 0.25

/** Нижняя граница порога: на узком стеке четверть ширины слишком мала. */
export const SWIPE_THRESHOLD_MIN_PX = 56

/**
 * Сопротивление движению не в свою сторону. Жест остаётся живым — тост едет за
 * пальцем, — но закрыть его «наоборот» нельзя: это была бы вторая, неочевидная
 * дорога к тому же действию.
 */
export const SWIPE_RESISTANCE = 4

/**
 * Куда уезжает отпущенный тост. Заведомо дальше своей ширины: он должен уйти
 * за край экрана, а не остановиться на полпути.
 */
export const SWIPE_FLY_OUT_PX = 600

/**
 * Смещение, на котором тост становится полностью прозрачным, — вдвое дальше
 * порога. К моменту закрытия он уже наполовину растворён, и уход не выглядит
 * мгновенным исчезновением.
 */
export function swipeOpacity(offset: number, threshold: number): number {
  return Math.max(0, 1 - Math.abs(offset) / (threshold * 2))
}

/**
 * Куда растёт свёрнутая стопка: от своего угла вглубь экрана. У верхних углов
 * карточки уходят вниз, у нижних — вверх. Иначе стопка вылезала бы за край.
 */
export const STACK_DIRECTION: Record<GrToasterPlacement, 1 | -1> = {
  'top-right': 1,
  'top-left': 1,
  'bottom-right': -1,
  'bottom-left': -1,
}

/** Зазор между тостами в развёрнутой колонке; парен классу `gap-3` в шаблоне. */
export const STACK_GAP_PX = 12

/**
 * Сколько карточек выглядывает из-под передней. Дальние держатся в DOM ради
 * скринридера, но не показываются: четвёртый край в стопке уже не читается как
 * глубина, а выглядит грязью у кромки.
 */
export const STACK_PEEK_DEPTH = 2

/**
 * Насколько глубоко карточка лежит в стопке: `0` — передняя.
 *
 * Передняя всегда ближайшая к своему углу, а колонка отрисовывается сверху
 * вниз: у верхних углов край держит первый тост, у нижних — последний.
 */
export function stackDepth(index: number, count: number, placement: GrToasterPlacement): number {
  return STACK_DIRECTION[placement] === 1 ? index : count - 1 - index
}

/**
 * Трансформ свёрнутой карточки. Считается в CSS, а не в JS, чтобы шаг стопки
 * оставался настраиваемым темой: значения приходят из токенов, а арифметику
 * делает `calc`.
 */
export function collapsedTransform(depth: number, placement: GrToasterPlacement): string {
  const shift = depth * STACK_DIRECTION[placement]

  return `translateY(calc(var(--gr-toaster-stack-peek, 12px) * ${shift})) `
    + `scale(calc(1 - var(--gr-toaster-stack-scale, 0.05) * ${depth}))`
}
