import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

/**
 * Granular-конфиг пресета `GrDatePicker`. Сам пресет utility-классов не
 * добавляет — он зависит от `GrDateTimePicker`, чьи классы и подтянутся.
 */
export const grDatePickerConfig = defineGranularComponent(import.meta.url, {
  name: 'GrDatePicker',
  dependencies: [
    { provider: '@feugene/granularity-datepicker', components: ['GrDateTimePicker'] },
  ],
})
