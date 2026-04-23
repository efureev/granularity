// Общий код browser- и node-entry granular-provider'а `@feugene/extra-granularity`.
//
// Оба entry (`./index.ts`, `./node.ts`) отличаются только инстансом
// `granularityProvider`, который попадает в `dependencies`: browser-entry
// использует browser-вариант из `@feugene/granularity/granular-provider`,
// node-entry — FS-aware вариант из `.../granular-provider/node`. Всё
// остальное (id, `packageBaseUrl`, список компонентов) идентично и живёт
// здесь, в фабрике `createExtraGranularityProvider`.
import {
    defineGranularProvider,
    type GranularProvider,
} from '@feugene/unocss-preset-granular/contract'

import {xgQuickFormConfig} from '../components/XgQuickForm/config'

/** Идентификатор провайдера — совпадает с именем пакета. */
export const EXTRA_GRANULARITY_PROVIDER_ID = '@feugene/extra-granularity'

// runtime-concat: литерал `new URL('..', import.meta.url)` rolldown заменяет
// на `data:`-URL, поэтому собираем корень пакета из `import.meta.url` вручную
// (отрезая два последних сегмента: имя файла и каталог `granular-provider/`).
const packageBaseUrl = `${import.meta.url.slice(
    0,
    import.meta.url.lastIndexOf('/', import.meta.url.lastIndexOf('/') - 1) + 1,
)}`

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
