import { defineGranumComponent } from '@feugene/granum/contract'

import { grChartLineSafelist } from './safelist'

/**
 * `GrEmptyState` и `GrSkeleton` объявлены зависимостями потому, что рама их
 * **рендерит**: без объявления они не попадут в замыкание селекции, и
 * потребитель получит пустое состояние без стилей и скелет без фона.
 *
 * `group` помечает, что рама у графиков общая: шаблоны живут в
 * `src/components/GrChartFrame/shared/` и уезжают в общий чанк, который входит
 * в файлы каждого дотянувшегося компонента. Ребром графа он не становится —
 * иначе вынесенный хелпер превращал бы соседей в зависимости друг друга, — а
 * классы из него сборка извлекает по графу бандла, не требуя перечисления в
 * safelist.
 *
 * Ту же группу получают остальные графики: рама у них общая, ради этого
 * механизм и существует.
 */
export const grChartLineConfig = defineGranumComponent(import.meta.url, {
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
   * проверено `granum prune`, `--gr-z-modal` уходил в removed.
   */
  dynamicTokens: ['gr-z-tooltip', 'gr-z-modal'],
  group: 'GrChartFrame',
  safelist: grChartLineSafelist,
  dependencies: [{ provider: '@feugene/granularity', components: ['GrEmptyState', 'GrSkeleton'] }],
})
