import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

import { grChartBarSafelist } from './safelist'

/**
 * `group` тот же, что у остальных графиков: рама у них общая, её чанки уезжают
 * в `dist/groups/GrChartFrame/shared/`, и по этому полю пресет сканирует их
 * дополнительно к `dist/components/GrChartBar/`.
 *
 * `GrEmptyState` и `GrSkeleton` объявлены зависимостями потому, что рама их
 * **рендерит**: без объявления пресет не подмешает их CSS.
 */
export const grChartBarConfig = defineGranularComponent(import.meta.url, {
  name: 'GrChartBar',
  group: 'GrChartFrame',
  safelist: grChartBarSafelist,
  dependencies: [{ provider: '@feugene/granularity', components: ['GrEmptyState', 'GrSkeleton'] }],
})
