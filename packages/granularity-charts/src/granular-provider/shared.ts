// `id`, диалект движка и реестр компонентов провайдера.
//
// Списки под маркерами генерируются `yarn generate:registry` — руками внутри
// них не писать, следующая генерация затрёт.
import {
  defineGranumProvider,
  type GranumComponentDescriptor,
  type GranumProvider,
} from '@feugene/granum/contract'
// <granularity:components:imports> — блок генерируется `yarn generate:registry`
import { grChartAreaConfig } from '../components/GrChartArea/config'
import { grChartBarConfig } from '../components/GrChartBar/config'
import { grChartBulletConfig } from '../components/GrChartBullet/config'
import { grChartFunnelConfig } from '../components/GrChartFunnel/config'
import { grChartHeatmapConfig } from '../components/GrChartHeatmap/config'
import { grChartLineConfig } from '../components/GrChartLine/config'
import { grChartPieConfig } from '../components/GrChartPie/config'
import { grChartRadarConfig } from '../components/GrChartRadar/config'
import { grChartWaterfallConfig } from '../components/GrChartWaterfall/config'
import { grSparklineConfig } from '../components/GrSparkline/config'
// </granularity:components:imports>

/** Идентификатор провайдера — совпадает с именем пакета. */
export const GRANULARITY_CHARTS_PROVIDER_ID = '@feugene/granularity-charts'

/** Донор: компоненты пакета опираются на компоненты ядра. */
const GRANULARITY_CORE_PROVIDER_ID = '@feugene/granularity'

/**
 * Словарь утилит, против которого написаны классы компонентов, — тот же, что у
 * ядра. Сборка сверит объявление с диалектом движка, которым её запустили, и не
 * даст записать в манифест чужой словарь.
 */
export const GRANULARITY_CHARTS_ENGINE_DIALECT = 'unocss/preset-wind3+granum@66'

/**
 * Реестр компонентов пакета — именованной мапой, а не инлайн-массивом.
 *
 * Именно по нему гейт реестров сверяет состав с файловой системой, а
 * генератор раскладывает компонент по спискам.
 *
 * `GrChartFrame` здесь нет и не будет: рама не публичный компонент, у неё нет
 * ни `index.ts`, ни `config.ts` (гейт `frameOwnership.test.ts`).
 */
export const granularityChartsComponentConfigs = {
  // <granularity:components:registry> — блок генерируется `yarn generate:registry`
  GrChartArea: grChartAreaConfig,
  GrChartBar: grChartBarConfig,
  GrChartBullet: grChartBulletConfig,
  GrChartFunnel: grChartFunnelConfig,
  GrChartHeatmap: grChartHeatmapConfig,
  GrChartLine: grChartLineConfig,
  GrChartPie: grChartPieConfig,
  GrChartRadar: grChartRadarConfig,
  GrChartWaterfall: grChartWaterfallConfig,
  GrSparkline: grSparklineConfig,
  // </granularity:components:registry>
} satisfies Record<string, GranumComponentDescriptor>

export type GranularityChartsComponentName = keyof typeof granularityChartsComponentConfigs

/**
 * Собирает провайдера пакета.
 *
 * Донор объявлен строкой, а не инстансом: приложение подключает оба пакета по
 * имени, и каждый приезжает своим манифестом. Инстанс в `dependencies` втянул
 * бы ядро в граф объектной формой — то есть заставил бы приложение сканировать
 * его `dist` вместо того, чтобы прочитать готовый манифест (C-4).
 *
 * База раскладки здесь не нужна вовсе: у манифестной формы она равна директории
 * манифеста, и считать её от `import.meta.url` больше незачем.
 */
export function createGranularityChartsProvider(): GranumProvider {
  return defineGranumProvider({
    id: GRANULARITY_CHARTS_PROVIDER_ID,
    contractVersion: 1,
    engine: { dialect: GRANULARITY_CHARTS_ENGINE_DIALECT },
    components: Object.values(granularityChartsComponentConfigs),
    dependencies: [GRANULARITY_CORE_PROVIDER_ID],
  })
}
