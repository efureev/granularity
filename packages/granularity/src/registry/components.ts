import { dsAlertConfig } from '../components/DsAlert/config'
import { dsAvatarConfig } from '../components/DsAvatar/config'
import { dsBadgeConfig } from '../components/DsBadge/config'
import { dsBadgeWrapConfig } from '../components/DsBadgeWrap/config'
import { dsBottomNavConfig } from '../components/DsBottomNav/config'
import { dsButtonConfig } from '../components/DsButton/config'
import { dsButtonGroupConfig } from '../components/DsButtonGroup/config'
import { dsCheckboxConfig } from '../components/DsCheckbox/config'
import { dsCardConfig } from '../components/DsCard/config'
import { dsCollapseConfig } from '../components/DsCollapse/config'
import { dsConfirmDialogConfig } from '../components/DsConfirmDialog/config'
import { dsDataTableConfig } from '../components/DsDataTable/config'
import { dsDrawerConfig } from '../components/DsDrawer/config'
import { dsDropdownConfig } from '../components/DsDropdown/config'
import { dsDropdownMenuConfig } from '../components/DsDropdownMenu/config'
import { dsDialogConfig } from '../components/DsDialog/config'
import { dsEmptyStateConfig } from '../components/DsEmptyState/config'
import { dsFileUploadConfig } from '../components/DsFileUpload/config'
import { dsFormFileConfig } from '../components/DsFormFile/config'
import { dsFormFieldConfig } from '../components/DsFormField/config'
import { dsFormSectionConfig } from '../components/DsFormSection/config'
import { dsIconConfig } from '../components/DsIcon/config'
import { dsImageViewerConfig } from '../components/DsImageViewer/config'
import { dsInputConfig } from '../components/DsInput/config'
import { dsNumberInputConfig } from '../components/DsNumberInput/config'
import { dsInputTagConfig } from '../components/DsInputTag/config'
import { dsListConfig } from '../components/DsList/config'
import { dsLinkConfig } from '../components/DsLink/config'
import { dsLoadingConfig } from '../components/DsLoading/config'
import { dsModalConfig } from '../components/DsModal/config'
import { dsNavbarConfig } from '../components/DsNavbar/config'
import { dsPaginationConfig } from '../components/DsPagination/config'
import { dsProgressBarConfig } from '../components/DsProgressBar/config'
import { dsPromptDialogConfig } from '../components/DsPromptDialog/config'
import { dsRadioConfig } from '../components/DsRadio/config'
import { dsRadioGroupConfig } from '../components/DsRadioGroup/config'
import { dsSelectConfig } from '../components/DsSelect/config'
import { dsSegmentedConfig } from '../components/DsSegmented/config'
import { dsSidebarConfig } from '../components/DsSidebar/config'
import { dsSkeletonConfig } from '../components/DsSkeleton/config'
import { dsSwitchConfig } from '../components/DsSwitch/config'
import { dsTableConfig } from '../components/DsTable/config'
import { dsTabsConfig } from '../components/DsTabs/config'
import { dsToasterConfig } from '../components/DsToaster/config'
import { dsTextareaConfig } from '../components/DsTextarea/config'
import { dsTreeConfig } from '../components/DsTree/config'
import { dsTreeSelectConfig } from '../components/DsTreeSelect/config'
import { dsTooltipConfig } from '../components/DsTooltip/config'

import type { GranularityComponentConfig } from './componentConfig'

export const granularityComponentConfigs = {
  DsAlert: dsAlertConfig,
  DsAvatar: dsAvatarConfig,
  DsBadge: dsBadgeConfig,
  DsBadgeWrap: dsBadgeWrapConfig,
  DsBottomNav: dsBottomNavConfig,
  DsButton: dsButtonConfig,
  DsButtonGroup: dsButtonGroupConfig,
  DsCard: dsCardConfig,
  DsCollapse: dsCollapseConfig,
  DsConfirmDialog: dsConfirmDialogConfig,
  DsDataTable: dsDataTableConfig,
  DsDrawer: dsDrawerConfig,
  DsDropdown: dsDropdownConfig,
  DsDropdownMenu: dsDropdownMenuConfig,
  DsCheckbox: dsCheckboxConfig,
  DsDialog: dsDialogConfig,
  DsEmptyState: dsEmptyStateConfig,
  DsFileUpload: dsFileUploadConfig,
  DsFormFile: dsFormFileConfig,
  DsFormField: dsFormFieldConfig,
  DsFormSection: dsFormSectionConfig,
  DsIcon: dsIconConfig,
  DsImageViewer: dsImageViewerConfig,
  DsInput: dsInputConfig,
  DsNumberInput: dsNumberInputConfig,
  DsInputTag: dsInputTagConfig,
  DsList: dsListConfig,
  DsLink: dsLinkConfig,
  DsLoading: dsLoadingConfig,
  DsModal: dsModalConfig,
  DsNavbar: dsNavbarConfig,
  DsPagination: dsPaginationConfig,
  DsProgressBar: dsProgressBarConfig,
  DsPromptDialog: dsPromptDialogConfig,
  DsRadio: dsRadioConfig,
  DsRadioGroup: dsRadioGroupConfig,
  DsSelect: dsSelectConfig,
  DsSegmented: dsSegmentedConfig,
  DsSidebar: dsSidebarConfig,
  DsSkeleton: dsSkeletonConfig,
  DsSwitch: dsSwitchConfig,
  DsTable: dsTableConfig,
  DsTabs: dsTabsConfig,
  DsToaster: dsToasterConfig,
  DsTextarea: dsTextareaConfig,
  DsTree: dsTreeConfig,
  DsTreeSelect: dsTreeSelectConfig,
  DsTooltip: dsTooltipConfig,
} as const satisfies Record<string, GranularityComponentConfig>

export type GranularityComponentName = keyof typeof granularityComponentConfigs

export type GranularityComponentSelection = 'all' | GranularityComponentName[]

export function resolveGranularityComponentSelection(
  selection: GranularityComponentSelection = 'all',
): readonly GranularityComponentName[] {
  if (selection === 'all')
    return Object.keys(granularityComponentConfigs) as GranularityComponentName[]

  return selection
}

export function resolveGranularityComponentNames(
  selection: GranularityComponentSelection = 'all',
): GranularityComponentName[] {
  const resolved: GranularityComponentName[] = []
  const resolvedSet = new Set<GranularityComponentName>()
  const resolving = new Set<GranularityComponentName>()

  function visit(componentName: GranularityComponentName): void {
    if (resolvedSet.has(componentName))
      return

    if (resolving.has(componentName)) {
      throw new Error(
        `Circular granularity component dependency detected: ${[...resolving, componentName].join(' -> ')}`,
      )
    }

    resolving.add(componentName)

    for (const dependencyName of granularityComponentConfigs[componentName].dependencies as GranularityComponentName[])
      visit(dependencyName)

    resolving.delete(componentName)
    resolvedSet.add(componentName)
    resolved.push(componentName)
  }

  for (const componentName of resolveGranularityComponentSelection(selection))
    visit(componentName)

  return resolved
}

export const granularityComponents = Object.fromEntries(
  Object.entries(granularityComponentConfigs).map(([name, config]) => [name, config.safelist]),
) as Record<GranularityComponentName, readonly string[]>
