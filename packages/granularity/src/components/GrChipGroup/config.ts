import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

import { grChipGroupSafelist } from './safelist'

export const grChipGroupConfig = defineGranularComponent(import.meta.url, {
  name: 'GrChipGroup',
  // Чипы приходят слотом — их рисует потребитель, поэтому ребра графа тут нет.
  safelist: grChipGroupSafelist,
})
