import type { GrVirtualListSnapshot } from '../internal/devChannel'

/**
 * Виртуализатор выбранного компонента.
 *
 * Число узлов в DOM видно и в браузере, поэтому раздел отвечает на другое:
 * какие индексы в окне, сколько всего элементов и насколько оценка высоты
 * разошлась с фактическим замером. Расхождение — тихий дефект: список
 * начинает прыгать при прокрутке, а узлов по-прежнему «правильные десятки».
 */

/** Насколько замер разошёлся с оценкой, чтобы считать это подозрительным. */
const DRIFT_RATIO = 0.25

export interface VirtualListState {
  key: string
  value: unknown
}

export function virtualListFor(lists: GrVirtualListSnapshot[], uid: number | undefined): GrVirtualListSnapshot | null {
  if (uid === undefined)
    return null

  return lists.find(list => list.uid === uid) ?? null
}

export function virtualListState(list: GrVirtualListSnapshot): VirtualListState[] {
  const drifted = list.measured !== null && Math.abs(list.measured - list.estimated) > list.estimated * DRIFT_RATIO

  return [
    { key: 'rendered', value: `${list.rendered} of ${list.total}` },
    { key: 'window', value: `[${list.range.start}, ${list.range.end})` },
    { key: 'estimated item size', value: `${list.estimated} px` },
    { key: 'measured item size', value: list.measured === null ? '— (nothing measured yet)' : `${Math.round(list.measured * 10) / 10} px` },
    // Сама по себе разница нормальна: оценка на то и оценка. Заметная — повод
    // проверить, не прыгает ли список при прокрутке.
    { key: 'estimate drift', value: drifted ? 'noticeable — check scrolling' : 'within tolerance' },
  ]
}
