// Общий код browser- и node-entry granular-provider'а.
//
// Оба entry (`./index.ts`, `./node.ts`) отличаются только списком
// компонентов, у которых есть node-only вариант конфига (например,
// `DsButton`, чей `config.node.ts` использует `tokenDefinitionsFromCssSync`
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
import { dsAlertConfig } from '../components/DsAlert/config'
import { dsAvatarConfig } from '../components/DsAvatar/config'
import { dsBadgeConfig } from '../components/DsBadge/config'
import { dsBadgeWrapConfig } from '../components/DsBadgeWrap/config'
import { dsBottomNavConfig } from '../components/DsBottomNav/config'
import { dsButtonConfig } from '../components/DsButton/config'
import { dsButtonGroupConfig } from '../components/DsButtonGroup/config'
import { dsCardConfig } from '../components/DsCard/config'
import { dsCheckboxConfig } from '../components/DsCheckbox/config'
import { dsCollapseConfig } from '../components/DsCollapse/config'
import { dsConfirmDialogConfig } from '../components/DsConfirmDialog/config'
import { dsDataTableConfig } from '../components/DsDataTable/config'
import { dsDialogConfig } from '../components/DsDialog/config'
import { dsDrawerConfig } from '../components/DsDrawer/config'
import { dsDropdownConfig } from '../components/DsDropdown/config'
import { dsDropdownMenuConfig } from '../components/DsDropdownMenu/config'
import { dsEmptyStateConfig } from '../components/DsEmptyState/config'
import { dsFileUploadConfig } from '../components/DsFileUpload/config'
import { dsFormFieldConfig } from '../components/DsFormField/config'
import { dsFormFileConfig } from '../components/DsFormFile/config'
import { dsFormSectionConfig } from '../components/DsFormSection/config'
import { dsIconConfig } from '../components/DsIcon/config'
import { dsImageViewerConfig } from '../components/DsImageViewer/config'
import { dsInputConfig } from '../components/DsInput/config'
import { dsInputTagConfig } from '../components/DsInputTag/config'
import { dsLinkConfig } from '../components/DsLink/config'
import { dsListConfig } from '../components/DsList/config'
import { dsLoadingConfig } from '../components/DsLoading/config'
import { dsModalConfig } from '../components/DsModal/config'
import { dsNavbarConfig } from '../components/DsNavbar/config'
import { dsNumberInputConfig } from '../components/DsNumberInput/config'
import { dsPaginationConfig } from '../components/DsPagination/config'
import { dsProgressBarConfig } from '../components/DsProgressBar/config'
import { dsPromptDialogConfig } from '../components/DsPromptDialog/config'
import { dsRadioConfig } from '../components/DsRadio/config'
import { dsRadioGroupConfig } from '../components/DsRadioGroup/config'
import { dsSegmentedConfig } from '../components/DsSegmented/config'
import { dsSelectConfig } from '../components/DsSelect/config'
import { dsSidebarConfig } from '../components/DsSidebar/config'
import { dsSkeletonConfig } from '../components/DsSkeleton/config'
import { dsSwitchConfig } from '../components/DsSwitch/config'
import { dsTableConfig } from '../components/DsTable/config'
import { dsTabsConfig } from '../components/DsTabs/config'
import { dsTextareaConfig } from '../components/DsTextarea/config'
import { dsToasterConfig } from '../components/DsToaster/config'
import { dsTooltipConfig } from '../components/DsTooltip/config'
import { dsTreeConfig } from '../components/DsTree/config'
import { dsTreeSelectConfig } from '../components/DsTreeSelect/config'

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
 * (например, `DsButton` с `tokenDefinitionsFromCssSync`), browser‑конфиг
 * остаётся здесь, а node‑вариант подставляется снаружи через
 * `createGranularityProvider(overrides)` — см. `./index.ts` (browser)
 * и `./node.ts` (node).
 *
 * Формат записи `<Name>: ds<Name>Config` критичен для regex‑парсинга
 * в `apps/showcase/scripts/generate-component-api.mjs`, не ломайте его.
 */
export const granularityComponentConfigs = {
  DsAlert: dsAlertConfig,
  DsAvatar: dsAvatarConfig,
  DsBadge: dsBadgeConfig,
  DsBadgeWrap: dsBadgeWrapConfig,
  DsBottomNav: dsBottomNavConfig,
  DsButton: dsButtonConfig,
  DsButtonGroup: dsButtonGroupConfig,
  DsCard: dsCardConfig,
  DsCheckbox: dsCheckboxConfig,
  DsCollapse: dsCollapseConfig,
  DsConfirmDialog: dsConfirmDialogConfig,
  DsDataTable: dsDataTableConfig,
  DsDialog: dsDialogConfig,
  DsDrawer: dsDrawerConfig,
  DsDropdown: dsDropdownConfig,
  DsDropdownMenu: dsDropdownMenuConfig,
  DsEmptyState: dsEmptyStateConfig,
  DsFileUpload: dsFileUploadConfig,
  DsFormField: dsFormFieldConfig,
  DsFormFile: dsFormFileConfig,
  DsFormSection: dsFormSectionConfig,
  DsIcon: dsIconConfig,
  DsImageViewer: dsImageViewerConfig,
  DsInput: dsInputConfig,
  DsInputTag: dsInputTagConfig,
  DsLink: dsLinkConfig,
  DsList: dsListConfig,
  DsLoading: dsLoadingConfig,
  DsModal: dsModalConfig,
  DsNavbar: dsNavbarConfig,
  DsNumberInput: dsNumberInputConfig,
  DsPagination: dsPaginationConfig,
  DsProgressBar: dsProgressBarConfig,
  DsPromptDialog: dsPromptDialogConfig,
  DsRadio: dsRadioConfig,
  DsRadioGroup: dsRadioGroupConfig,
  DsSegmented: dsSegmentedConfig,
  DsSelect: dsSelectConfig,
  DsSidebar: dsSidebarConfig,
  DsSkeleton: dsSkeletonConfig,
  DsSwitch: dsSwitchConfig,
  DsTable: dsTableConfig,
  DsTabs: dsTabsConfig,
  DsTextarea: dsTextareaConfig,
  DsToaster: dsToasterConfig,
  DsTooltip: dsTooltipConfig,
  DsTree: dsTreeConfig,
  DsTreeSelect: dsTreeSelectConfig,
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
 * у которых есть node-only вариант конфига (например, `DsButton` с
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
