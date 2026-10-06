import { defineSafelistGate } from '@feugene/granularity-test-kit/gates'

import { granularityComponentConfigs } from '../granular-provider/shared'

/**
 * Safelist компонента — только классы, собранные в рантайме из частей. Всё, что
 * лежит в коде целым литералом, granum извлекает сам, обходя граф бандла
 * компонента вместе с общими чанками; такая запись в safelist лишняя.
 *
 * Гейт общий для всех пакетов дизайн-системы и живёт в test-kit: там же его
 * обоснование и разбор импортов. Из 3478 записей ядра сборка вычищала как уже
 * извлечённые больше трёх тысяч — список пережил переезд с UnoCSS-пресета,
 * который общий чанк не сканировал.
 */
defineSafelistGate({ componentConfigs: granularityComponentConfigs })
