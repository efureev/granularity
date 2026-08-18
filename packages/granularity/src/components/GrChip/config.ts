import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

import { grChipSafelist } from './safelist'

export const grChipConfig = defineGranularComponent(import.meta.url, {
  name: 'GrChip',
  // `GrBadge` — импорт его класс-мап и safelist; `GrIcon` не рендерится,
  // крестик — прямой `~icons`-компонент, поэтому его в зависимостях нет.
  dependencies: ['GrBadge'],
  safelist: grChipSafelist,
})
