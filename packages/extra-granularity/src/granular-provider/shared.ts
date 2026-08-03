// `id`, `packageBaseUrl` и список компонентов провайдера.
import {
    defineGranularProvider,
    type GranularProvider,
    resolvePackageBaseUrl,
} from '@feugene/unocss-preset-granular/contract'

import {xgQuickFormConfig} from '../components/XgQuickForm/config'

/** Идентификатор провайдера — совпадает с именем пакета. */
export const EXTRA_GRANULARITY_PROVIDER_ID = '@feugene/extra-granularity'

// Не заменять на `new URL('..', import.meta.url)`: Vite и rolldown распознают
// этот литерал и подставляют `data:`-URL, после чего scan-директории пустеют.
const packageBaseUrl = resolvePackageBaseUrl(import.meta.url)

/**
 * Собирает granular-provider пакета `@feugene/extra-granularity`.
 *
 * Принимает `granularityProvider` снаружи — в зависимости от entry это будет
 * browser- или node-вариант провайдера `@feugene/granularity`. Это важно,
 * чтобы у пресета `presetGranularNode` был ровно один инстанс с данным `id`.
 */
export function createExtraGranularityProvider(
    granularityProvider: GranularProvider,
): GranularProvider {
    return defineGranularProvider({
        id: EXTRA_GRANULARITY_PROVIDER_ID,
        contractVersion: 1,
        packageBaseUrl,
        components: [xgQuickFormConfig],
        dependencies: [granularityProvider],
    })
}
