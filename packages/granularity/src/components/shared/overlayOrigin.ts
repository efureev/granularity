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
 * классов, которыми они не пользуются. Экстрактор видит модуль целиком, так что
 * эти классы приехали бы и в их CSS.
 *
 * Классы — целые литералы карты, функция только выбирает из неё. granum
 * извлекает их из общего чанка у каждого потребителя сам, safelist им не нужен.
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
