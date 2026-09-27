import { defineGranumComponent } from '@feugene/granum/contract'

import { grChipSafelist } from './safelist'

export const grChipConfig = defineGranumComponent(import.meta.url, {
  name: 'GrChip',
  // `GrBadge` — импорт его класс-мап и safelist; `GrIcon` не рендерится,
  // крестик — прямой `~icons`-компонент, поэтому его в зависимостях нет.
  dependencies: ['GrBadge'],
  safelist: grChipSafelist,
})
