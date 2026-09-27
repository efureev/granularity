import { defineGranumComponent } from '@feugene/granum/contract'

import { grDropdownSafelist } from './safelist'

export const grDropdownConfig = defineGranumComponent(import.meta.url, {
  name: 'GrDropdown',
  safelist: grDropdownSafelist,
  // Панель, слой и портал рисует `GrPopover`: без ребра графа потребитель,
  // выбравший одно меню, получил бы панель без поверхности и без фона.
  dependencies: ['GrPopover'],
})
