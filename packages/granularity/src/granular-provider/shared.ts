// Общий код browser- и node-entry granular-provider'а.
//
// Оба entry (`./index.ts`, `./node.ts`) отличаются только списком
// компонентов, у которых есть node-only вариант конфига (например,
// `GrButton`, чей `config.node.ts` использует `tokenDefinitionsFromCssSync`
// и тянет `node:fs`). Browser-вариант таких компонентов берёт облегчённый
// `./config.ts`, node-вариант — `./config.node.ts`. Всё остальное — `id`,
// `theme.*`, `packageBaseUrl` и полный список browser-safe компонентов —
// живёт здесь.
//
// ВАЖНО: все `new URL('../styles/...', import.meta.url)` намеренно находятся
// здесь — `shared.ts` лежит в той же директории, что и `index.ts` / `node.ts`,
// поэтому относительные пути идентичны. Это ОК для браузера: бандлеры
// транслируют такие конструкции в статические asset-URL и `node:*` в бандл
// не утаскивают.
//
// Ключи записи `<Name>: ds<Name>Config` в `granularityComponentConfigs`
// критичны для regex‑парсинга в `apps/showcase/scripts/generate-component-api.mjs`,
// не ломайте формат.
import {
  defineGranularProvider,
  type GranularComponentDescriptor,
  type GranularProvider,
} from '@feugene/unocss-preset-granular/contract'
import { grAlertConfig } from '../components/GrAlert/config'
import { grAvatarConfig } from '../components/GrAvatar/config'
import { grBadgeConfig } from '../components/GrBadge/config'
import { grBadgeWrapConfig } from '../components/GrBadgeWrap/config'
import { grBottomNavConfig } from '../components/GrBottomNav/config'
import { grButtonConfig } from '../components/GrButton/config'
import { grButtonGroupConfig } from '../components/GrButtonGroup/config'
import { grCardConfig } from '../components/GrCard/config'
import { grCheckboxConfig } from '../components/GrCheckbox/config'
import { grCollapseConfig } from '../components/GrCollapse/config'
import { grConfirmDialogConfig } from '../components/GrConfirmDialog/config'
import { grDataTableConfig } from '../components/GrDataTable/config'
import { grDialogConfig } from '../components/GrDialog/config'
import { grDrawerConfig } from '../components/GrDrawer/config'
import { grDropdownConfig } from '../components/GrDropdown/config'
import { grDropdownMenuConfig } from '../components/GrDropdownMenu/config'
import { grEmptyStateConfig } from '../components/GrEmptyState/config'
import { grFileUploadConfig } from '../components/GrFileUpload/config'
import { grFormFieldConfig } from '../components/GrFormField/config'
import { grFormFileConfig } from '../components/GrFormFile/config'
import { grFormSectionConfig } from '../components/GrFormSection/config'
import { grIconConfig } from '../components/GrIcon/config'
import { grImageViewerConfig } from '../components/GrImageViewer/config'
import { grInputConfig } from '../components/GrInput/config'
import { grInputTagConfig } from '../components/GrInputTag/config'
import { grLinkConfig } from '../components/GrLink/config'
import { grListConfig } from '../components/GrList/config'
import { grLoadingConfig } from '../components/GrLoading/config'
import { grModalConfig } from '../components/GrModal/config'
import { grNavbarConfig } from '../components/GrNavbar/config'
import { grNumberInputConfig } from '../components/GrNumberInput/config'
import { grPaginationConfig } from '../components/GrPagination/config'
import { grProgressBarConfig } from '../components/GrProgressBar/config'
import { grPromptDialogConfig } from '../components/GrPromptDialog/config'
import { grRadioConfig } from '../components/GrRadio/config'
import { grRadioGroupConfig } from '../components/GrRadioGroup/config'
import { grSegmentedConfig } from '../components/GrSegmented/config'
import { grSelectConfig } from '../components/GrSelect/config'
import { grSidebarConfig } from '../components/GrSidebar/config'
import { grSkeletonConfig } from '../components/GrSkeleton/config'
import { grSwitchConfig } from '../components/GrSwitch/config'
import { grTableConfig } from '../components/GrTable/config'
import { grTabsConfig } from '../components/GrTabs/config'
import { grTextareaConfig } from '../components/GrTextarea/config'
import { grToasterConfig } from '../components/GrToaster/config'
import { grTooltipConfig } from '../components/GrTooltip/config'
import { grTreeConfig } from '../components/GrTree/config'
import { grTreeSelectConfig } from '../components/GrTreeSelect/config'

/** Идентификатор провайдера — совпадает с именем пакета. */
export const GRANULARITY_PROVIDER_ID = '@feugene/granularity'

// runtime-concat: литерал `new URL('..', import.meta.url)` rolldown заменяет
// на `data:`-URL, поэтому собираем корень пакета из `import.meta.url` вручную
// (отрезая два последних сегмента: имя файла и каталог `granular-provider/`).
const packageBaseUrl = `${import.meta.url.slice(
  0,
  import.meta.url.lastIndexOf('/', import.meta.url.lastIndexOf('/') - 1) + 1,
)}`

/** Встроенные темы пакета. Единственный источник правды о списке тем. */
export const granularityThemeNames = ['light', 'dark'] as const
export type GranularityThemeName = (typeof granularityThemeNames)[number]

/** Темы, активные по умолчанию, если окружение не переопределяет выбор. */
export const granularityDefaultThemes: readonly GranularityThemeName[] = ['light']

const theme = {
  baseCssUrl: new URL('../styles/base.css', import.meta.url).href,
  tokensCssUrl: new URL('../styles/tokens.css', import.meta.url).href,
  themes: {
    light: new URL('../styles/themes/light.css', import.meta.url).href,
    dark: new URL('../styles/themes/dark.css', import.meta.url).href,
  },
  defaultThemes: granularityDefaultThemes,
} as const

/**
 * Полный реестр публичных компонентов пакета `@feugene/granularity`.
 *
 * Ключи — имена компонентов (совпадают с публичным subpath‑экспортом
 * `@feugene/granularity/components/<Name>`). Значения — browser‑safe
 * `ds<Name>Config` из `./config.ts` рядом с SFC.
 *
 * Для компонентов, у которых есть node-only вариант конфига
 * (например, `GrButton` с `tokenDefinitionsFromCssSync`), browser‑конфиг
 * остаётся здесь, а node‑вариант подставляется снаружи через
 * `createGranularityProvider(overrides)` — см. `./index.ts` (browser)
 * и `./node.ts` (node).
 *
 * Формат записи `<Name>: ds<Name>Config` критичен для regex‑парсинга
 * в `apps/showcase/scripts/generate-component-api.mjs`, не ломайте его.
 */
export const granularityComponentConfigs = {
  GrAlert: grAlertConfig,
  GrAvatar: grAvatarConfig,
  GrBadge: grBadgeConfig,
  GrBadgeWrap: grBadgeWrapConfig,
  GrBottomNav: grBottomNavConfig,
  GrButton: grButtonConfig,
  GrButtonGroup: grButtonGroupConfig,
  GrCard: grCardConfig,
  GrCheckbox: grCheckboxConfig,
  GrCollapse: grCollapseConfig,
  GrConfirmDialog: grConfirmDialogConfig,
  GrDataTable: grDataTableConfig,
  GrDialog: grDialogConfig,
  GrDrawer: grDrawerConfig,
  GrDropdown: grDropdownConfig,
  GrDropdownMenu: grDropdownMenuConfig,
  GrEmptyState: grEmptyStateConfig,
  GrFileUpload: grFileUploadConfig,
  GrFormField: grFormFieldConfig,
  GrFormFile: grFormFileConfig,
  GrFormSection: grFormSectionConfig,
  GrIcon: grIconConfig,
  GrImageViewer: grImageViewerConfig,
  GrInput: grInputConfig,
  GrInputTag: grInputTagConfig,
  GrLink: grLinkConfig,
  GrList: grListConfig,
  GrLoading: grLoadingConfig,
  GrModal: grModalConfig,
  GrNavbar: grNavbarConfig,
  GrNumberInput: grNumberInputConfig,
  GrPagination: grPaginationConfig,
  GrProgressBar: grProgressBarConfig,
  GrPromptDialog: grPromptDialogConfig,
  GrRadio: grRadioConfig,
  GrRadioGroup: grRadioGroupConfig,
  GrSegmented: grSegmentedConfig,
  GrSelect: grSelectConfig,
  GrSidebar: grSidebarConfig,
  GrSkeleton: grSkeletonConfig,
  GrSwitch: grSwitchConfig,
  GrTable: grTableConfig,
  GrTabs: grTabsConfig,
  GrTextarea: grTextareaConfig,
  GrToaster: grToasterConfig,
  GrTooltip: grTooltipConfig,
  GrTree: grTreeConfig,
  GrTreeSelect: grTreeSelectConfig,
}

export type GranularityComponentName = keyof typeof granularityComponentConfigs

/** Базовый (browser-safe) набор компонентов в порядке реестра. */
const baseComponents: readonly GranularComponentDescriptor[] = Object.values(
  granularityComponentConfigs,
)

/**
 * Собирает granular-provider пакета `@feugene/granularity`.
 *
 * Принимает массив `GranularComponentDescriptor`'ов — это компоненты,
 * у которых есть node-only вариант конфига (например, `GrButton` с
 * `tokenDefinitionsFromCssSync`). Дескрипторы с именем, которое уже
 * присутствует в базовом наборе, переопределяют его (побеждает
 * переданный снаружи), остальные — добавляются в конец списка.
 */
export function createGranularityProvider(
  overrides: readonly GranularComponentDescriptor[] = [],
): GranularProvider {
  const overrideByName = new Map(
    overrides.map(component => [component.name, component]),
  )
  const components: GranularComponentDescriptor[] = [
    ...baseComponents.map(component => overrideByName.get(component.name) ?? component),
    ...overrides.filter(component => !baseComponents.some(base => base.name === component.name)),
  ]

  return defineGranularProvider({
    id: GRANULARITY_PROVIDER_ID,
    contractVersion: 1,
    packageBaseUrl,
    components,
    theme,
  })
}
