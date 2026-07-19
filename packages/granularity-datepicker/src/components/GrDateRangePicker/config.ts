import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

/**
 * Granular-конфиг пресета `GrDateRangePicker`. Зависит от `GrDateTimePicker`.
 */
export const grDateRangePickerConfig = defineGranularComponent(import.meta.url, {
  name: 'GrDateRangePicker',
  dependencies: [
    { provider: '@feugene/granularity-datepicker', components: ['GrDateTimePicker'] },
  ],
})
