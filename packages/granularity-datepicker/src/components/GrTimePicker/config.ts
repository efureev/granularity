import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

/**
 * Granular-конфиг пресета `GrTimePicker`. Зависит от `GrDateTimePicker`.
 */
export const grTimePickerConfig = defineGranularComponent(import.meta.url, {
  name: 'GrTimePicker',
  dependencies: [
    { provider: '@feugene/granularity-datepicker', components: ['GrDateTimePicker'] },
  ],
})
