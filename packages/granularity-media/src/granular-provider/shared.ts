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
import { grCameraCaptureConfig } from '../components/GrCameraCapture/config'
import { grCodeScannerConfig } from '../components/GrCodeScanner/config'
import { grImageCropConfig } from '../components/GrImageCrop/config'
// </granularity:components:imports>

/** Идентификатор провайдера — совпадает с именем пакета. */
export const GRANULARITY_MEDIA_PROVIDER_ID = '@feugene/granularity-media'

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
  // </granularity:components:registry>
} satisfies Record<string, GranularComponentDescriptor>

export type GranularityMediaComponentName = keyof typeof granularityMediaComponentConfigs

/**
 * Собирает granular-provider пакета.
 *
 * Принимает `granularityProvider` снаружи — в зависимости от entry это будет
 * browser- или node-вариант провайдера `@feugene/granularity`. Это важно,
 * чтобы у пресета был ровно один инстанс с данным `id`.
 *
 * `packageBaseUrl` тоже приходит снаружи, из самого entry, и это не церемония:
 * он считается от `import.meta.url`, а этот модуль бандлер волен и вынести в
 * общий чанк, и заинлайнить в entry — то есть положить на разную глубину.
 * Промах на уровень даёт `dist/components/<Name>/`, которых нет, пресет молча
 * пропускает скан, и в CSS остаётся только то, что перечислено в safelist.
 */
export function createGranularityMediaProvider(
  granularityProvider: GranularProvider,
  packageBaseUrl: string,
): GranularProvider {
  return defineGranularProvider({
    id: GRANULARITY_MEDIA_PROVIDER_ID,
    contractVersion: 1,
    packageBaseUrl,
    components: Object.values(granularityMediaComponentConfigs),
    dependencies: [granularityProvider],
  })
}
