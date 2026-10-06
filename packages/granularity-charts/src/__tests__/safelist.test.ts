import { defineSafelistGate } from '@feugene/granularity-test-kit/gates'

import { granularityChartsComponentConfigs } from '../granular-provider/shared'

/**
 * Safelist компонента — только классы, собранные в рантайме из частей. Всё, что
 * лежит в коде целым литералом, granum извлекает сам, обходя граф бандла
 * компонента вместе с общими чанками; такая запись в safelist лишняя.
 */
defineSafelistGate({ componentConfigs: granularityChartsComponentConfigs })
