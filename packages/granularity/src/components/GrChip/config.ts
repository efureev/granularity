import { defineGranumComponent } from '@feugene/granum/contract'

import { grChipSafelist } from './safelist'

export const grChipConfig = defineGranumComponent(import.meta.url, {
  name: 'GrChip',
  // `GrBadge` — палитра и радиусы чипа: корень ставит атрибуты бейджа
  // (`grBadgeLookAttrs`), и красит их лист `GrBadge`. `GrIcon` не рендерится,
  // крестик — прямой `~icons`-компонент, поэтому его в зависимостях нет.
  dependencies: ['GrBadge'],
  safelist: grChipSafelist,
})
