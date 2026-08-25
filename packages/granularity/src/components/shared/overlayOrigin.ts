import type { Placement } from '@floating-ui/dom'

/**
 * `transform-origin` для scale-анимации всплывающей панели.
 *
 * Ключ — `resolvedPlacement`, то есть положение **после** `flip`: если снизу не
 * хватило места и панель перевернуло вверх, origin переворачивается вместе с
 * ней. Координаты панели к этому моменту уже посчитал `useFloating`, здесь
 * остаётся только направление роста относительно триггера.
 *
 * До выноса карта существовала копиями в `GrPopover` и `GrDropdown` — двенадцать
 * записей, совпадавших дословно, вместе с комментарием об одном и том же.
 *
 * Отдельным модулем от поверхности намеренно: списки выбора берут поверхность,
 * но своей анимации роста не имеют, и импорт соседа затащил бы им в чанк восемь
 * классов, которыми они не пользуются. Гейт `src/__tests__/safelist.test.ts`
 * назвал бы их поимённо — и был бы прав.
 *
 * Модуль безадресный: в `dist` он уезжает в общий чанк, который пресет не
 * сканирует, поэтому каждый потребитель объявляет эти классы в своём `safelist.ts`.
 */
export const overlayOriginClassByPlacement: Record<Placement, string> = {
  'bottom-start': 'origin-top-left',
  'bottom-end': 'origin-top-right',
  'bottom': 'origin-top',
  'top-start': 'origin-bottom-left',
  'top-end': 'origin-bottom-right',
  'top': 'origin-bottom',
  'left-start': 'origin-top-right',
  'left-end': 'origin-bottom-right',
  'left': 'origin-right',
  'right-start': 'origin-top-left',
  'right-end': 'origin-bottom-left',
  'right': 'origin-left',
}

export function overlayOriginClass(placement: Placement): string {
  return overlayOriginClassByPlacement[placement] ?? 'origin-top'
}
