import { defineGranumComponent } from '@feugene/granum/contract'

import { grChartWaterfallSafelist } from './safelist'

/**
 * `group` тот же, что у остальных графиков: рама у них общая, и её чанк тоже.
 * Ребром графа компонентов общий чанк не становится — иначе вынесенный хелпер
 * превращал бы соседей в зависимости друг друга; в файлы каждого дотянувшегося
 * компонента он входит, и классы рамы сборка извлекает оттуда сама.
 *
 * `GrEmptyState` и `GrSkeleton` объявлены зависимостями потому, что рама их
 * **рендерит**: без объявления они не попадут в замыкание селекции, и
 * приложение не подмешает их CSS.
 */
export const grChartWaterfallConfig = defineGranumComponent(import.meta.url, {
  name: 'GrChartWaterfall',
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
  safelist: grChartWaterfallSafelist,
  dependencies: [{ provider: '@feugene/granularity', components: ['GrEmptyState', 'GrSkeleton'] }],
})
