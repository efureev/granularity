import type { GrUiColumns } from '../../ui-schema'

/**
 * Оформительские пропы, которые приложение задаёт один раз на всё поддерево.
 *
 * Раскладка формы — сквозное решение продукта: колонки, положение подписи и её
 * ширина одинаковы во всех формах приложения, и повторять их на каждой значит
 * гарантированно однажды разойтись.
 */
export interface GrSchemaFormConfigurableProps {
  columns: GrUiColumns
  labelPosition: 'top' | 'start'
  labelWidth: string | number
  headingLevel: 2 | 3 | 4 | 5 | 6
}

declare module '@feugene/granularity/composables/useGrComponentConfig' {
  interface GrComponentDefaultsRegistry {
    GrSchemaForm: GrSchemaFormConfigurableProps
  }
}
