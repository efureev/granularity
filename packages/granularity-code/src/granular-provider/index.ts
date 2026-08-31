// Browser-entry granular-provider'а `@feugene/granularity-code`.
import { granularityProvider } from '@feugene/granularity/granular-provider'
import { resolvePackageBaseUrl } from '@feugene/unocss-preset-granular/contract'

import { createGranularityCodeProvider } from './shared'

/**
 * База пакета считается здесь, а не в `shared`: место entry-файла в `dist`
 * задано конфигом сборки, а общий модуль бандлер волен и вынести в чанк, и
 * заинлайнить сюда — глубина оказалась бы разной.
 *
 * `levelsUp: 0` — сам каталог файла, то есть `dist/`. Не заменять на
 * `new URL('.', import.meta.url)`: Vite и rolldown распознают этот литерал и
 * подставляют `data:`-URL, после чего scan-директории пустеют.
 */
const packageBaseUrl = resolvePackageBaseUrl(import.meta.url, 0)

export * from './shared'

export const granularityCodeProvider = createGranularityCodeProvider(granularityProvider, packageBaseUrl)

export default granularityCodeProvider
