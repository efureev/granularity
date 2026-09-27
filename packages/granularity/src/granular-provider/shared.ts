// `id`, `theme.*` и реестр компонентов провайдера.
//
// Пути темы — относительно корня раскладки `dist`, а не URL: базу приложение
// берёт из директории манифеста, который пишет `granumProvider()` (C-16).
// Исходники лежат зеркально в `src/`, поэтому `styles/tokens.css` собирается
// из `src/styles/tokens.css` — плагин сборки копирует их сам.
//
// `apps/showcase/scripts/generate-component-api.mjs` читает список компонентов
// из `Object.keys(granularityComponentConfigs)` через vite SSR.
import {
  defineGranumProvider,
  type GranumComponentDescriptor,
  type GranumProvider,
} from '@feugene/granum/contract'
// <granularity:components:imports> — блок генерируется `yarn generate:registry`
import { grAffixConfig } from '../components/GrAffix/config'
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
import { grCarouselConfig } from '../components/GrCarousel/config'
import { grCheckboxConfig } from '../components/GrCheckbox/config'
import { grCheckboxGroupConfig } from '../components/GrCheckboxGroup/config'
import { grChipConfig } from '../components/GrChip/config'
import { grChipGroupConfig } from '../components/GrChipGroup/config'
import { grCollapseConfig } from '../components/GrCollapse/config'
import { grColorPickerConfig } from '../components/GrColorPicker/config'
import { grCommandPaletteConfig } from '../components/GrCommandPalette/config'
import { grConfigProviderConfig } from '../components/GrConfigProvider/config'
import { grConfirmDialogConfig } from '../components/GrConfirmDialog/config'
import { grContextMenuConfig } from '../components/GrContextMenu/config'
import { grDataTableConfig } from '../components/GrDataTable/config'
import { grDeltaConfig } from '../components/GrDelta/config'
import { grDescriptionListConfig } from '../components/GrDescriptionList/config'
import { grDialogConfig } from '../components/GrDialog/config'
import { grDialogServiceConfig } from '../components/GrDialogService/config'
import { grDividerConfig } from '../components/GrDivider/config'
import { grDrawerConfig } from '../components/GrDrawer/config'
import { grDropdownConfig } from '../components/GrDropdown/config'
import { grDropdownMenuConfig } from '../components/GrDropdownMenu/config'
import { grEmptyStateConfig } from '../components/GrEmptyState/config'
import { grFilePreviewConfig } from '../components/GrFilePreview/config'
import { grFileUploadConfig } from '../components/GrFileUpload/config'
import { grFormConfig } from '../components/GrForm/config'
import { grFormFieldConfig } from '../components/GrFormField/config'
import { grFormFileConfig } from '../components/GrFormFile/config'
import { grFormSectionConfig } from '../components/GrFormSection/config'
import { grIconConfig } from '../components/GrIcon/config'
import { grImageViewerConfig } from '../components/GrImageViewer/config'
import { grInputConfig } from '../components/GrInput/config'
import { grInputTagConfig } from '../components/GrInputTag/config'
import { grJsonViewerConfig } from '../components/GrJsonViewer/config'
import { grKbdConfig } from '../components/GrKbd/config'
import { grLinkConfig } from '../components/GrLink/config'
import { grListConfig } from '../components/GrList/config'
import { grLoadingConfig } from '../components/GrLoading/config'
import { grModalConfig } from '../components/GrModal/config'
import { grNavbarConfig } from '../components/GrNavbar/config'
import { grNumberInputConfig } from '../components/GrNumberInput/config'
import { grOtpInputConfig } from '../components/GrOtpInput/config'
import { grPaginationConfig } from '../components/GrPagination/config'
import { grPopoverConfig } from '../components/GrPopover/config'
import { grProgressBarConfig } from '../components/GrProgressBar/config'
import { grProgressCircleConfig } from '../components/GrProgressCircle/config'
import { grPromptDialogConfig } from '../components/GrPromptDialog/config'
import { grRadioConfig } from '../components/GrRadio/config'
import { grRadioGroupConfig } from '../components/GrRadioGroup/config'
import { grRatingConfig } from '../components/GrRating/config'
import { grResponseErrorBannerConfig } from '../components/GrResponseErrorBanner/config'
import { grScrollSpyConfig } from '../components/GrScrollSpy/config'
import { grSegmentedConfig } from '../components/GrSegmented/config'
import { grSelectConfig } from '../components/GrSelect/config'
import { grSidebarConfig } from '../components/GrSidebar/config'
import { grSkeletonConfig } from '../components/GrSkeleton/config'
import { grSliderConfig } from '../components/GrSlider/config'
import { grSortableListConfig } from '../components/GrSortableList/config'
import { grSplitterConfig } from '../components/GrSplitter/config'
import { grStatisticConfig } from '../components/GrStatistic/config'
import { grStepsConfig } from '../components/GrSteps/config'
import { grSwitchConfig } from '../components/GrSwitch/config'
import { grTableConfig } from '../components/GrTable/config'
import { grTabPanelsConfig } from '../components/GrTabPanels/config'
import { grTabsConfig } from '../components/GrTabs/config'
import { grTabsWithPanelsConfig } from '../components/GrTabsWithPanels/config'
import { grTextareaConfig } from '../components/GrTextarea/config'
import { grTimelineConfig } from '../components/GrTimeline/config'
import { grToasterConfig } from '../components/GrToaster/config'
import { grTooltipConfig } from '../components/GrTooltip/config'
import { grTransferConfig } from '../components/GrTransfer/config'
import { grTreeConfig } from '../components/GrTree/config'
import { grTreeSectionsConfig } from '../components/GrTreeSections/config'
import { grTreeSelectConfig } from '../components/GrTreeSelect/config'
import { grValueConfig } from '../components/GrValue/config'
// </granularity:components:imports>

/** Идентификатор провайдера — совпадает с именем пакета. */
export const GRANULARITY_PROVIDER_ID = '@feugene/granularity'

/**
 * Словарь утилит, против которого написаны классы компонентов.
 *
 * Компоненты нарисованы утилитами словаря `preset-wind3`: `sr-only`,
 * `tabular-nums`, `animate-spin`, `divide-y`, `space-y-*`, `border-collapse`,
 * `list-none`, `touch-none`, `table-fixed`. Движок более узкого словаря части из
 * них не знает, и тогда компоненты рисуются не полностью. Суффикс `+granum`
 * добавляет к словарю одно правило — альфу на произвольном цвете.
 *
 * Объявленный диалект превращает расхождение из тихой поломки в громкую: сборка
 * пакета откажется идти на движке другого словаря, а приложение, взявшее такой
 * движок, получит `provider-dialect-mismatch` и поимённый список потерянных
 * классов.
 */
export const GRANULARITY_ENGINE_DIALECT = 'unocss/preset-wind3+granum@66'

/** Встроенные темы пакета. Единственный источник правды о списке тем. */
export const granularityThemeNames = ['light', 'dark'] as const
export type GranularityThemeName = (typeof granularityThemeNames)[number]

/** Темы, активные по умолчанию, если окружение не переопределяет выбор. */
export const granularityDefaultThemes: readonly GranularityThemeName[] = ['light']

const theme = {
  baseCss: 'styles/base.css',
  tokensCss: 'styles/tokens.css',
  themes: {
    light: 'styles/themes/light.css',
    dark: 'styles/themes/dark.css',
  },
  defaultThemes: granularityDefaultThemes,
} as const

/**
 * Реестр публичных компонентов. Ключи совпадают с subpath-экспортом
 * `@feugene/granularity/components/<Name>`.
 */
export const granularityComponentConfigs = {
  // <granularity:components:registry> — блок генерируется `yarn generate:registry`
  GrAffix: grAffixConfig,
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
  GrCarousel: grCarouselConfig,
  GrCheckbox: grCheckboxConfig,
  GrCheckboxGroup: grCheckboxGroupConfig,
  GrChip: grChipConfig,
  GrChipGroup: grChipGroupConfig,
  GrCollapse: grCollapseConfig,
  GrColorPicker: grColorPickerConfig,
  GrCommandPalette: grCommandPaletteConfig,
  GrConfigProvider: grConfigProviderConfig,
  GrConfirmDialog: grConfirmDialogConfig,
  GrContextMenu: grContextMenuConfig,
  GrDataTable: grDataTableConfig,
  GrDelta: grDeltaConfig,
  GrDescriptionList: grDescriptionListConfig,
  GrDialog: grDialogConfig,
  GrDialogService: grDialogServiceConfig,
  GrDivider: grDividerConfig,
  GrDrawer: grDrawerConfig,
  GrDropdown: grDropdownConfig,
  GrDropdownMenu: grDropdownMenuConfig,
  GrEmptyState: grEmptyStateConfig,
  GrFilePreview: grFilePreviewConfig,
  GrFileUpload: grFileUploadConfig,
  GrForm: grFormConfig,
  GrFormField: grFormFieldConfig,
  GrFormFile: grFormFileConfig,
  GrFormSection: grFormSectionConfig,
  GrIcon: grIconConfig,
  GrImageViewer: grImageViewerConfig,
  GrInput: grInputConfig,
  GrInputTag: grInputTagConfig,
  GrJsonViewer: grJsonViewerConfig,
  GrKbd: grKbdConfig,
  GrLink: grLinkConfig,
  GrList: grListConfig,
  GrLoading: grLoadingConfig,
  GrModal: grModalConfig,
  GrNavbar: grNavbarConfig,
  GrNumberInput: grNumberInputConfig,
  GrOtpInput: grOtpInputConfig,
  GrPagination: grPaginationConfig,
  GrPopover: grPopoverConfig,
  GrProgressBar: grProgressBarConfig,
  GrProgressCircle: grProgressCircleConfig,
  GrPromptDialog: grPromptDialogConfig,
  GrRadio: grRadioConfig,
  GrRadioGroup: grRadioGroupConfig,
  GrRating: grRatingConfig,
  GrResponseErrorBanner: grResponseErrorBannerConfig,
  GrScrollSpy: grScrollSpyConfig,
  GrSegmented: grSegmentedConfig,
  GrSelect: grSelectConfig,
  GrSidebar: grSidebarConfig,
  GrSkeleton: grSkeletonConfig,
  GrSlider: grSliderConfig,
  GrSortableList: grSortableListConfig,
  GrSplitter: grSplitterConfig,
  GrStatistic: grStatisticConfig,
  GrSteps: grStepsConfig,
  GrSwitch: grSwitchConfig,
  GrTable: grTableConfig,
  GrTabPanels: grTabPanelsConfig,
  GrTabs: grTabsConfig,
  GrTabsWithPanels: grTabsWithPanelsConfig,
  GrTextarea: grTextareaConfig,
  GrTimeline: grTimelineConfig,
  GrToaster: grToasterConfig,
  GrTooltip: grTooltipConfig,
  GrTransfer: grTransferConfig,
  GrTree: grTreeConfig,
  GrTreeSections: grTreeSectionsConfig,
  GrTreeSelect: grTreeSelectConfig,
  GrValue: grValueConfig,
  // </granularity:components:registry>
}

export type GranularityComponentName = keyof typeof granularityComponentConfigs

/** Базовый набор компонентов в порядке реестра. */
const baseComponents: readonly GranumComponentDescriptor[] = Object.values(
  granularityComponentConfigs,
)

/**
 * Собирает granum-провайдер пакета.
 *
 * `overrides` — точка расширения для потребителя: дескриптор с именем из
 * базового реестра заменяет его, остальные дописываются в конец.
 */
export function createGranularityProvider(
  overrides: readonly GranumComponentDescriptor[] = [],
): GranumProvider {
  const overrideByName = new Map(
    overrides.map(component => [component.name, component]),
  )
  const components: GranumComponentDescriptor[] = [
    ...baseComponents.map(component => overrideByName.get(component.name) ?? component),
    ...overrides.filter(component => !baseComponents.some(base => base.name === component.name)),
  ]

  return defineGranumProvider({
    id: GRANULARITY_PROVIDER_ID,
    contractVersion: 1,
    engine: { dialect: GRANULARITY_ENGINE_DIALECT },
    components,
    theme,
  })
}
