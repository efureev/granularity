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
  /**
   * Тултип рамы позиционирует `useFloating` ядра: имя слоя уходит туда
   * параметром, а `var()` собирается в рантайме (`overlayStack.ts` ядра).
   * В исходниках `var(--gr-z-tooltip)` не встречается ни разу.
   *
   * `gr-z-modal` — из ветки `calc(var(--gr-z-modal) + N)`: график, открытый
   * ВНУТРИ модалки, обязан показать тултип над ней. Токен принадлежит ядру,
   * но читает его рама — поле про потребление, а не про владение. Без него
   * приложение, взявшее только график, теряет его при обрезке токенов:
   * проверено `granular prune`, `--gr-z-modal` уходил в removed.
   */
  dynamicTokens: ['gr-z-tooltip', 'gr-z-modal'],
  group: 'GrChartFrame',
  safelist: grChartLineSafelist,
  dependencies: [{ provider: '@feugene/granularity', components: ['GrEmptyState', 'GrSkeleton'] }],
})
