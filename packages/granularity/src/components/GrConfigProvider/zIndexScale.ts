/**
 * Шкала слоёв, задаваемая пропом `zIndexBase` у `GrConfigProvider`.
 *
 * Переменные ставятся на `<html>`, а не на обёртку провайдера: панели
 * телепортируются в `body`, то есть живут вне его DOM-поддерева, и
 * «настройка слоёв поддеревом» была бы ложным обещанием.
 *
 * Отсюда же следует, что владелец шкалы один на документ: два провайдера с
 * разными базами — это гонка, о которой надо сказать вслух, а не тихо
 * применить последнюю.
 */

/**
 * Смещения те же, что в `styles/tokens.css`: шаг 50 оставляет приложению место
 * вклиниться между слоями, а тосты стоят выше модалок.
 */
export const GR_Z_INDEX_OFFSETS: Record<string, number> = {
  // Шапка ниже якорных панелей: она перекрывает контент, но не выпадашки.
  '--gr-z-navbar': -100,
  '--gr-z-dropdown': 0,
  '--gr-z-tooltip': 50,
  '--gr-z-modal': 100,
  '--gr-z-toast': 200,
}

let owner: symbol | null = null

/**
 * Ставит шкалу от базы и возвращает функцию отката к прежним значениям.
 * `null` — нечего ставить (нет базы или нет документа).
 */
export function applyGrZIndexBase(token: symbol, base: number | undefined): (() => void) | null {
  if (typeof document === 'undefined' || base == null) {
    if (owner === token) owner = null
    return null
  }

  if (owner && owner !== token && __GR_DEV__) {
    console.warn(
      '[GrConfigProvider] zIndexBase задан больше чем одним провайдером. '
      + 'Шкала слоёв одна на документ (панели телепортируются в body), поэтому применится последняя.',
    )
  }
  owner = token

  const root = document.documentElement
  const previous = Object.keys(GR_Z_INDEX_OFFSETS)
    .map(name => [name, root.style.getPropertyValue(name)] as const)

  for (const [name, offset] of Object.entries(GR_Z_INDEX_OFFSETS))
    root.style.setProperty(name, String(base + offset))

  return () => {
    for (const [name, value] of previous) {
      if (value) root.style.setProperty(name, value)
      else root.style.removeProperty(name)
    }
    if (owner === token) owner = null
  }
}

/** Тестовая очистка владельца шкалы между кейсами. */
export function resetGrZIndexOwner(): void {
  owner = null
}
