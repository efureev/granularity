import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

import { grDropdownSafelist } from './safelist'

export const grDropdownConfig = defineGranularComponent(import.meta.url, {
  name: 'GrDropdown',
  safelist: grDropdownSafelist,
  // Панель, слой и портал рисует `GrPopover`: без ребра графа потребитель,
  // выбравший одно меню, получил бы панель без поверхности и без фона.
  dependencies: ['GrPopover'],
})
