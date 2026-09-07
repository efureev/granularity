import type { ComputedRef, Ref } from 'vue'

import { useOptionPanelVirtualization } from '../../shared/optionPanel'
import type { GrSelectOption, GrSelectValue } from '../grSelectStyles'
import type { GrSelectPanelItem, GrSelectPanelRow } from './useSelectPanelItems'

/**
 * Виртуализация панели `GrSelect` — тонкая обёртка над общей машинерией
 * (`shared/optionPanel`): алгоритм тот же, что у `GrAutocomplete`, и держать
 * его в двух местах значило бы разойтись молча.
 *
 * Своё здесь только имя ведущей строки: у селекта это «Add …».
 */
export interface UseSelectVirtualizationOptions<TValue extends GrSelectValue> {
  panelItems: ComputedRef<GrSelectPanelItem<TValue>[]>
  panelRows: ComputedRef<GrSelectPanelRow<TValue>[]>
  canAddCustom: ComputedRef<boolean>
  /** Контейнер списка: по нему считается окно и замеряются строки. */
  listboxEl: Ref<HTMLElement | null>
  enabled: () => boolean
  maxHeight: () => number
}

export interface SelectVirtualization<TValue extends GrSelectValue> {
  virtualEnabled: ComputedRef<boolean>
  /** Сдвиг набора: строка «Add …» стоит перед опциями. */
  addOffset: ComputedRef<number>
  scrollToIndex: (index: number) => void
  /** Замер строки: оценка высоты уточняется по реальному узлу. */
  measure: (index: number, el: Element | null) => void
  /** ARIA набора для опции; вне виртуализации набор виден по DOM. */
  optionSetProps: (index: number) => Record<string, number> | undefined
  addOptionSetProps: ComputedRef<Record<string, number> | undefined>
  showAddOption: ComputedRef<boolean>
  renderedPanelRows: ComputedRef<GrSelectPanelRow<TValue>[]>
  listboxStyle: ComputedRef<Record<string, string>>
}

export function useSelectVirtualization<TValue extends GrSelectValue>(
  options: UseSelectVirtualizationOptions<TValue>,
): SelectVirtualization<TValue> {
  const panel = useOptionPanelVirtualization<GrSelectOption<TValue>>({
    panelItems: options.panelItems,
    panelRows: options.panelRows,
    hasLeadingRow: options.canAddCustom,
    listboxEl: options.listboxEl,
    enabled: options.enabled,
    maxHeight: options.maxHeight,
  })

  return {
    virtualEnabled: panel.virtualEnabled,
    addOffset: panel.addOffset,
    scrollToIndex: panel.scrollToIndex,
    measure: panel.measure,
    optionSetProps: panel.optionSetProps,
    addOptionSetProps: panel.leadingRowSetProps,
    showAddOption: panel.showLeadingRow,
    renderedPanelRows: panel.renderedPanelRows,
    listboxStyle: panel.listboxStyle,
  }
}
