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
