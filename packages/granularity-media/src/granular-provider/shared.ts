// `id` и реестр компонентов провайдера.
//
// Списки под маркерами генерируются `yarn generate:registry` — руками внутри
// них не писать, следующая генерация затрёт.
import {
  defineGranumProvider,
  type GranumComponentDescriptor,
  type GranumProvider,
} from '@feugene/granum/contract'
// <granularity:components:imports> — блок генерируется `yarn generate:registry`
import { grCameraCaptureConfig } from '../components/GrCameraCapture/config'
import { grCodeScannerConfig } from '../components/GrCodeScanner/config'
import { grImageCropConfig } from '../components/GrImageCrop/config'
import { grVideoPlayerConfig } from '../components/GrVideoPlayer/config'
// </granularity:components:imports>

/** Идентификатор провайдера — совпадает с именем пакета. */
export const GRANULARITY_MEDIA_PROVIDER_ID = '@feugene/granularity-media'

/** Донор: компоненты пакета опираются на компоненты ядра. */
const GRANULARITY_CORE_PROVIDER_ID = '@feugene/granularity'

/**
 * Словарь утилит, против которого написаны классы компонентов, — тот же, что у
 * ядра. Сборка сверит объявление с диалектом движка, которым её запустили, и не
 * даст записать в манифест чужой словарь.
 */
export const GRANULARITY_MEDIA_ENGINE_DIALECT = 'unocss/preset-wind3+granum@66'

/**
 * Реестр компонентов пакета — именованной мапой, а не инлайн-массивом.
 *
 * Именно по нему гейт реестров сверяет состав с файловой системой, а
 * генератор — раскладывает компонент по четырём спискам.
 */
export const granularityMediaComponentConfigs = {
  // <granularity:components:registry> — блок генерируется `yarn generate:registry`
  GrCameraCapture: grCameraCaptureConfig,
  GrCodeScanner: grCodeScannerConfig,
  GrImageCrop: grImageCropConfig,
  GrVideoPlayer: grVideoPlayerConfig,
  // </granularity:components:registry>
} satisfies Record<string, GranumComponentDescriptor>

export type GranularityMediaComponentName = keyof typeof granularityMediaComponentConfigs

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
export function createGranularityMediaProvider(): GranumProvider {
  return defineGranumProvider({
    id: GRANULARITY_MEDIA_PROVIDER_ID,
    contractVersion: 1,
    engine: { dialect: GRANULARITY_MEDIA_ENGINE_DIALECT },
    components: Object.values(granularityMediaComponentConfigs),
    dependencies: [GRANULARITY_CORE_PROVIDER_ID],
  })
}
