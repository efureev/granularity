// `id`, `packageBaseUrl` и реестр компонентов провайдера.
//
// Списки под маркерами генерируются `yarn generate:registry` — руками внутри
// них не писать, следующая генерация затрёт.
import {
  defineGranularProvider,
  type GranularComponentDescriptor,
  type GranularProvider,
} from '@feugene/unocss-preset-granular/contract'
// <granularity:components:imports> — блок генерируется `yarn generate:registry`
import { grChartAreaConfig } from '../components/GrChartArea/config'
import { grChartLineConfig } from '../components/GrChartLine/config'
import { grChartPieConfig } from '../components/GrChartPie/config'
import { grSparklineConfig } from '../components/GrSparkline/config'
// </granularity:components:imports>

/** Идентификатор провайдера — совпадает с именем пакета. */
export const GRANULARITY_CHARTS_PROVIDER_ID = '@feugene/granularity-charts'

/**
 * Реестр компонентов пакета — именованной мапой, а не инлайн-массивом.
 *
 * Именно по нему гейт реестров сверяет состав с файловой системой, а
 * генератор раскладывает компонент по пяти спискам.
 *
 * `GrChartFrame` здесь нет и не будет: рама не публичный компонент, у неё нет
 * ни `index.ts`, ни `config.ts` (гейт `frameOwnership.test.ts`).
 */
export const granularityChartsComponentConfigs = {
  // <granularity:components:registry> — блок генерируется `yarn generate:registry`
  GrChartArea: grChartAreaConfig,
  GrChartLine: grChartLineConfig,
  GrChartPie: grChartPieConfig,
  GrSparkline: grSparklineConfig,
  // </granularity:components:registry>
} satisfies Record<string, GranularComponentDescriptor>

export type GranularityChartsComponentName = keyof typeof granularityChartsComponentConfigs

/**
 * Собирает granular-provider пакета.
 *
 * Принимает `granularityProvider` снаружи — в зависимости от entry это будет
 * browser- или node-вариант провайдера `@feugene/granularity`. Это важно,
 * чтобы у пресета был ровно один инстанс с данным `id`.
 *
 * `packageBaseUrl` тоже приходит снаружи, из самого entry: он считается от
 * `import.meta.url`, а этот модуль бандлер волен и вынести в общий чанк, и
 * заинлайнить в entry — то есть положить на разную глубину. Промах на уровень
 * даёт `dist/components/<Name>/`, которых нет, пресет молча пропускает скан, и
 * в CSS остаётся только то, что перечислено в safelist.
 */
export function createGranularityChartsProvider(
  granularityProvider: GranularProvider,
  packageBaseUrl: string,
): GranularProvider {
  return defineGranularProvider({
    id: GRANULARITY_CHARTS_PROVIDER_ID,
    contractVersion: 1,
    packageBaseUrl,
    components: Object.values(granularityChartsComponentConfigs),
    dependencies: [granularityProvider],
  })
}
