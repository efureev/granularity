import { defineGranumComponent } from '@feugene/granum/contract'

import { grColorPickerSafelist } from './safelist'

export const grColorPickerConfig = defineGranumComponent(import.meta.url, {
  name: 'GrColorPicker',
  // Панель, слайдеры и поле рендерятся этим компонентом, поэтому их safelist
  // обязан приехать вместе с ним: иначе у гранулярного импорта панель встанет
  // без стилей, а сборка останется зелёной.
  dependencies: ['GrPopover', 'GrSlider', 'GrInput'],
  safelist: grColorPickerSafelist,
})
