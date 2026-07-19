import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

/**
 * Granular-конфиг `GrDateTimePicker`.
 *
 * Компонент — тонкая обёртка над `@vuepic/vue-datepicker`; он не использует
 * примитивы `@feugene/granularity`, поэтому `dependencies` не нужны. UnoCSS
 * подтянет utility-классы обёртки (input/menu) через `content.filesystem`
 * пресета, сканируя SFC-чанки этого компонента.
 */
export const grDateTimePickerConfig = defineGranularComponent(import.meta.url, {
  name: 'GrDateTimePicker',
})
