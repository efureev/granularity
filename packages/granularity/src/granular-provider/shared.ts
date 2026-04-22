// Общий код browser- и node-entry granular-provider'а.
//
// Оба entry (`./index.ts`, `./node.ts`) отличаются только конфигом
// `DsButton`: browser берёт облегчённый `DsButton/config.ts` (без
// `tokenDefinitionsFromCssSync`, т.е. без `node:fs`), а node-entry —
// `DsButton/config.node.ts` (с FS-резолвом токенов тем).
//
// Чтобы не дублировать `id`, `theme.*`, список остальных компонентов и
// `packageBaseUrl`, они собраны в фабрике `createGranularityProvider`,
// принимающей `DsButton`-конфиг снаружи.
//
// ВАЖНО: все `new URL('../styles/...', import.meta.url)` намеренно находятся
// здесь — `shared.ts` лежит в той же директории, что и `index.ts` / `node.ts`,
// поэтому относительные пути идентичны. Это ОК для браузера: бандлеры
// транслируют такие конструкции в статические asset-URL и `node:*` в бандл
// не утаскивают.
import {
  defineGranularProvider,
  type GranularComponentDescriptor,
  type GranularProvider,
} from '@feugene/unocss-preset-granular/contract'
import { dsAlertConfig } from '../components/DsAlert/config'
import { dsCardConfig } from '../components/DsCard/config'
import { dsFormFieldConfig } from '../components/DsFormField/config'
import { dsInputConfig } from '../components/DsInput/config'
import { dsRadioConfig } from '../components/DsRadio/config'

/** Идентификатор провайдера — совпадает с именем пакета. */
export const GRANULARITY_PROVIDER_ID = '@feugene/granularity'

// runtime-concat: литерал `new URL('..', import.meta.url)` rolldown заменяет
// на `data:`-URL, поэтому собираем корень пакета из `import.meta.url` вручную
// (отрезая два последних сегмента: имя файла и каталог `granular-provider/`).
const packageBaseUrl = `${import.meta.url.slice(
  0,
  import.meta.url.lastIndexOf('/', import.meta.url.lastIndexOf('/') - 1) + 1,
)}`

const theme = {
  baseCssUrl: new URL('../styles/base.css', import.meta.url).href,
  tokensCssUrl: new URL('../styles/tokens.css', import.meta.url).href,
  themes: {
    light: new URL('../styles/themes/light.css', import.meta.url).href,
    dark: new URL('../styles/themes/dark.css', import.meta.url).href,
  },
  defaultThemes: ['light'] as const,
} as const

/**
 * Базовый набор browser-safe компонентов пакета. `DsButton` сюда намеренно
 * не включён — его конфиг всегда приходит снаружи (browser/node-вариант),
 * как и любые другие компоненты, которым нужен node-only вариант конфига.
 */
const baseComponents: readonly GranularComponentDescriptor[] = [
  dsAlertConfig,
  dsCardConfig,
  dsFormFieldConfig,
  dsInputConfig,
  dsRadioConfig,
]

/**
 * Собирает granular-provider пакета `@feugene/granularity`.
 *
 * Принимает массив внешних `GranularComponentDescriptor`'ов — это компоненты,
 * у которых есть отдельные browser/node варианты (например, `DsButton` с
 * `tokenDefinitionsFromCssSync`), либо любые будущие добавления. Дескрипторы
 * с именем, которое уже присутствует в базовом наборе, переопределяют его
 * (побеждает переданный снаружи), остальные — добавляются в конец списка.
 */
export function createGranularityProvider(
  overrides: readonly GranularComponentDescriptor[],
): GranularProvider {
  const overrideNames = new Set(overrides.map(component => component.name))
  const components: GranularComponentDescriptor[] = [
    ...baseComponents.filter(component => !overrideNames.has(component.name)),
    ...overrides,
  ]

  return defineGranularProvider({
    id: GRANULARITY_PROVIDER_ID,
    contractVersion: 1,
    packageBaseUrl,
    components,
    theme,
  })
}
