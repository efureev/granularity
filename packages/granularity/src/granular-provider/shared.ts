// `id`, `theme.*`, `packageBaseUrl` и реестр компонентов провайдера.
//
// Все `new URL('../styles/...', import.meta.url)` обязаны лежать именно здесь:
// `shared.ts` в одной директории с `index.ts` / `node.ts`, поэтому
// относительные пути совпадают. Для браузера безопасно — бандлеры
// транслируют такие литералы в статические asset-URL.
//
// `apps/showcase/scripts/generate-component-api.mjs` читает список компонентов
// из `Object.keys(granularityComponentConfigs)` через vite SSR.
import {
  defineGranularProvider,
  type GranularComponentDescriptor,
  type GranularProvider,
  resolvePackageBaseUrl,
} from '@feugene/unocss-preset-granular/contract'
// <granularity:components:imports> — блок генерируется `yarn generate:registry`
import { grAlertConfig } from '../components/GrAlert/config'
import { grAutocompleteConfig } from '../components/GrAutocomplete/config'
import { grAvatarConfig } from '../components/GrAvatar/config'
import { grBadgeConfig } from '../components/GrBadge/config'
import { grBadgeWrapConfig } from '../components/GrBadgeWrap/config'
import { grBottomNavConfig } from '../components/GrBottomNav/config'
import { grBreadcrumbsConfig } from '../components/GrBreadcrumbs/config'
import { grButtonConfig } from '../components/GrButton/config'
import { grButtonGroupConfig } from '../components/GrButtonGroup/config'
import { grCardConfig } from '../components/GrCard/config'
import { grCheckboxConfig } from '../components/GrCheckbox/config'
import { grCheckboxGroupConfig } from '../components/GrCheckboxGroup/config'
import { grCollapseConfig } from '../components/GrCollapse/config'
import { grColorPickerConfig } from '../components/GrColorPicker/config'
import { grCommandPaletteConfig } from '../components/GrCommandPalette/config'
import { grConfigProviderConfig } from '../components/GrConfigProvider/config'
import { grConfirmDialogConfig } from '../components/GrConfirmDialog/config'
import { grDataTableConfig } from '../components/GrDataTable/config'
import { grDialogConfig } from '../components/GrDialog/config'
import { grDialogServiceConfig } from '../components/GrDialogService/config'
import { grDividerConfig } from '../components/GrDivider/config'
import { grDrawerConfig } from '../components/GrDrawer/config'
import { grDropdownConfig } from '../components/GrDropdown/config'
import { grDropdownMenuConfig } from '../components/GrDropdownMenu/config'
import { grEmptyStateConfig } from '../components/GrEmptyState/config'
import { grFileUploadConfig } from '../components/GrFileUpload/config'
import { grFormConfig } from '../components/GrForm/config'
import { grFormFieldConfig } from '../components/GrFormField/config'
import { grFormFileConfig } from '../components/GrFormFile/config'
import { grFormSectionConfig } from '../components/GrFormSection/config'
import { grIconConfig } from '../components/GrIcon/config'
import { grImageViewerConfig } from '../components/GrImageViewer/config'
import { grInputConfig } from '../components/GrInput/config'
import { grInputTagConfig } from '../components/GrInputTag/config'
import { grKbdConfig } from '../components/GrKbd/config'
import { grLinkConfig } from '../components/GrLink/config'
import { grListConfig } from '../components/GrList/config'
import { grLoadingConfig } from '../components/GrLoading/config'
import { grModalConfig } from '../components/GrModal/config'
import { grNavbarConfig } from '../components/GrNavbar/config'
import { grNumberInputConfig } from '../components/GrNumberInput/config'
import { grPaginationConfig } from '../components/GrPagination/config'
import { grPopoverConfig } from '../components/GrPopover/config'
import { grProgressBarConfig } from '../components/GrProgressBar/config'
import { grPromptDialogConfig } from '../components/GrPromptDialog/config'
import { grRadioConfig } from '../components/GrRadio/config'
import { grRadioGroupConfig } from '../components/GrRadioGroup/config'
import { grRatingConfig } from '../components/GrRating/config'
import { grResponseErrorBannerConfig } from '../components/GrResponseErrorBanner/config'
import { grSegmentedConfig } from '../components/GrSegmented/config'
import { grSelectConfig } from '../components/GrSelect/config'
import { grSidebarConfig } from '../components/GrSidebar/config'
import { grSkeletonConfig } from '../components/GrSkeleton/config'
import { grSliderConfig } from '../components/GrSlider/config'
import { grStatisticConfig } from '../components/GrStatistic/config'
import { grSwitchConfig } from '../components/GrSwitch/config'
import { grTableConfig } from '../components/GrTable/config'
import { grTabPanelsConfig } from '../components/GrTabPanels/config'
import { grTabsConfig } from '../components/GrTabs/config'
import { grTextareaConfig } from '../components/GrTextarea/config'
import { grToasterConfig } from '../components/GrToaster/config'
import { grTooltipConfig } from '../components/GrTooltip/config'
import { grTreeConfig } from '../components/GrTree/config'
import { grTreeSelectConfig } from '../components/GrTreeSelect/config'
// </granularity:components:imports>

/** Идентификатор провайдера — совпадает с именем пакета. */
export const GRANULARITY_PROVIDER_ID = '@feugene/granularity'

// Не заменять на `new URL('..', import.meta.url)`: Vite и rolldown распознают
// этот литерал и подставляют `data:`-URL, после чего scan-директории пустеют.
const packageBaseUrl = resolvePackageBaseUrl(import.meta.url)

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
 * Реестр публичных компонентов. Ключи совпадают с subpath-экспортом
 * `@feugene/granularity/components/<Name>`.
 */
export const granularityComponentConfigs = {
  // <granularity:components:registry> — блок генерируется `yarn generate:registry`
  GrAlert: grAlertConfig,
  GrAutocomplete: grAutocompleteConfig,
  GrAvatar: grAvatarConfig,
  GrBadge: grBadgeConfig,
  GrBadgeWrap: grBadgeWrapConfig,
  GrBottomNav: grBottomNavConfig,
  GrBreadcrumbs: grBreadcrumbsConfig,
  GrButton: grButtonConfig,
  GrButtonGroup: grButtonGroupConfig,
  GrCard: grCardConfig,
  GrCheckbox: grCheckboxConfig,
  GrCheckboxGroup: grCheckboxGroupConfig,
  GrCollapse: grCollapseConfig,
  GrColorPicker: grColorPickerConfig,
  GrCommandPalette: grCommandPaletteConfig,
  GrConfigProvider: grConfigProviderConfig,
  GrConfirmDialog: grConfirmDialogConfig,
  GrDataTable: grDataTableConfig,
  GrDialog: grDialogConfig,
  GrDialogService: grDialogServiceConfig,
  GrDivider: grDividerConfig,
  GrDrawer: grDrawerConfig,
  GrDropdown: grDropdownConfig,
  GrDropdownMenu: grDropdownMenuConfig,
  GrEmptyState: grEmptyStateConfig,
  GrFileUpload: grFileUploadConfig,
  GrForm: grFormConfig,
  GrFormField: grFormFieldConfig,
  GrFormFile: grFormFileConfig,
  GrFormSection: grFormSectionConfig,
  GrIcon: grIconConfig,
  GrImageViewer: grImageViewerConfig,
  GrInput: grInputConfig,
  GrInputTag: grInputTagConfig,
  GrKbd: grKbdConfig,
  GrLink: grLinkConfig,
  GrList: grListConfig,
  GrLoading: grLoadingConfig,
  GrModal: grModalConfig,
  GrNavbar: grNavbarConfig,
  GrNumberInput: grNumberInputConfig,
  GrPagination: grPaginationConfig,
  GrPopover: grPopoverConfig,
  GrProgressBar: grProgressBarConfig,
  GrPromptDialog: grPromptDialogConfig,
  GrRadio: grRadioConfig,
  GrRadioGroup: grRadioGroupConfig,
  GrRating: grRatingConfig,
  GrResponseErrorBanner: grResponseErrorBannerConfig,
  GrSegmented: grSegmentedConfig,
  GrSelect: grSelectConfig,
  GrSidebar: grSidebarConfig,
  GrSkeleton: grSkeletonConfig,
  GrSlider: grSliderConfig,
  GrStatistic: grStatisticConfig,
  GrSwitch: grSwitchConfig,
  GrTable: grTableConfig,
  GrTabPanels: grTabPanelsConfig,
  GrTabs: grTabsConfig,
  GrTextarea: grTextareaConfig,
  GrToaster: grToasterConfig,
  GrTooltip: grTooltipConfig,
  GrTree: grTreeConfig,
  GrTreeSelect: grTreeSelectConfig,
  // </granularity:components:registry>
}

export type GranularityComponentName = keyof typeof granularityComponentConfigs

/** Базовый набор компонентов в порядке реестра. */
const baseComponents: readonly GranularComponentDescriptor[] = Object.values(
  granularityComponentConfigs,
)

/**
 * Собирает granular-provider пакета.
 *
 * `overrides` — точка расширения для потребителя: дескриптор с именем из
 * базового реестра заменяет его, остальные дописываются в конец.
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
