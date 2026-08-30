import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

import { grChartRadarSafelist } from './safelist'

/**
 * `group` тот же, что у остальных графиков: рама у них общая, её чанки уезжают
 * в `dist/groups/GrChartFrame/shared/`, и по этому полю пресет сканирует их
 * дополнительно к `dist/components/GrChartRadar/`.
 *
 * `GrEmptyState` и `GrSkeleton` объявлены зависимостями потому, что рама их
 * **рендерит**: без объявления пресет не подмешает их CSS.
 */
export const grChartRadarConfig = defineGranularComponent(import.meta.url, {
  name: 'GrChartRadar',
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
  safelist: grChartRadarSafelist,
  dependencies: [{ provider: '@feugene/granularity', components: ['GrEmptyState', 'GrSkeleton'] }],
})
