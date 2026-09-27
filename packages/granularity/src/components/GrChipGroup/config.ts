import { defineGranumComponent } from '@feugene/granum/contract'

import { grChipGroupSafelist } from './safelist'

export const grChipGroupConfig = defineGranumComponent(import.meta.url, {
  name: 'GrChipGroup',
  // Чипы приходят слотом — их рисует потребитель, поэтому ребра графа тут нет:
  // общий контекст группы лежит в `components/shared/chipGroupContext.ts`, а
  // не в директории `GrChip`, иначе импорт ключа стал бы ребром (C-10).
  safelist: grChipGroupSafelist,
})
