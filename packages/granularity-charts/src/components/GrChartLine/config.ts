import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

import { grChartLineSafelist } from './safelist'

/**
 * `GrEmptyState` и `GrSkeleton` объявлены зависимостями потому, что рама их
 * **рендерит**: без объявления пресет не подмешает их CSS, и потребитель
 * получит пустое состояние без стилей и скелет без фона.
 *
 * `group` — штатный механизм пресета под общие SFC. Шаблоны рамы живут в
 * `src/components/GrChartFrame/shared/`, их чанки уезжают в
 * `dist/groups/GrChartFrame/shared/`, и по этому полю пресет сканирует их
 * дополнительно к `dist/components/GrChartLine/`. Без него общий шаблон не
 * сканировался бы вовсе: он не принадлежит ни одному компоненту, и классы из
 * него пришлось бы перечислять в safelist руками — включая литералы.
 *
 * Ту же группу получат `GrChartArea`, `GrChartBar` и `GrChartPie`: рама у них
 * общая, ради этого механизм и существует.
 */
export const grChartLineConfig = defineGranularComponent(import.meta.url, {
  name: 'GrChartLine',
  group: 'GrChartFrame',
  safelist: grChartLineSafelist,
  dependencies: [{ provider: '@feugene/granularity', components: ['GrEmptyState', 'GrSkeleton'] }],
})
