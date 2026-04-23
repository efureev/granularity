<script setup lang="ts">
import {computed, defineAsyncComponent, watch} from 'vue'
import {RouterLink, useRoute} from 'vue-router'

import {useFintI18n} from '@feugene/fint-i18n/vue'
import {DsCard} from '@feugene/granularity'

import {
  getShowcaseComponentBySlug,
} from '../app/showcase'
import {useShowcasePageI18n} from '../app/useShowcasePageI18n'
import EventsTable from '../components/doc/EventsTable.vue'
import ExampleCard from '../components/doc/ExampleCard.vue'
import InfoSectionCard from '../components/doc/InfoSectionCard.vue'
import MethodsTable from '../components/doc/MethodsTable.vue'
import PropsTable from '../components/doc/PropsTable.vue'
import SlotsTable from '../components/doc/SlotsTable.vue'
import {
  createAccessibilityItems,
  createDependencyItems,
  createRelatedLinks,
} from '../components/doc/entityPageHelpers'
import {getShowcaseComponentDoc} from '../content/componentDocs'

const route = useRoute()
const {t} = useFintI18n()
const {localizePageByName, useI18nScope} = useShowcasePageI18n()

const previewRegistry = {
  'ds-alert-closable-flow': defineAsyncComponent(() => import('../demos/components/ds-alert/DsAlertClosableDemo.vue')),
  'ds-alert-custom-colors': defineAsyncComponent(() => import('../demos/components/ds-alert/DsAlertCustomColorsDemo.vue')),
  'ds-alert-variant-matrix': defineAsyncComponent(() => import('../demos/components/ds-alert/DsAlertVariantsDemo.vue')),
  'ds-avatar-image-fallback': defineAsyncComponent(() => import('../demos/components/ds-avatar/DsAvatarImageFallbackDemo.vue')),
  'ds-avatar-size-shape': defineAsyncComponent(() => import('../demos/components/ds-avatar/DsAvatarSizeShapeDemo.vue')),
  'ds-avatar-team-row': defineAsyncComponent(() => import('../demos/components/ds-avatar/DsAvatarTeamRowDemo.vue')),
  'ds-badge-builder': defineAsyncComponent(() => import('../demos/components/ds-badge/DsBadgeBuilderDemo.vue')),
  'ds-badge-size-radius': defineAsyncComponent(() => import('../demos/components/ds-badge/DsBadgeSizeRadiusDemo.vue')),
  'ds-badge-toolbar-filters': defineAsyncComponent(() => import('../demos/components/ds-badge/DsBadgeToolbarFiltersDemo.vue')),
  'ds-badge-variant-scale': defineAsyncComponent(() => import('../demos/components/ds-badge/DsBadgeVariantScaleDemo.vue')),
  'ds-badge-wrap-counter': defineAsyncComponent(() => import('../demos/components/ds-badge-wrap/DsBadgeWrapCounterDemo.vue')),
  'ds-badge-wrap-dot-status': defineAsyncComponent(() => import('../demos/components/ds-badge-wrap/DsBadgeWrapDotStatusDemo.vue')),
  'ds-badge-wrap-tab-notification': defineAsyncComponent(() => import('../demos/components/ds-badge-wrap/DsBadgeWrapTabNotificationDemo.vue')),
  'ds-bottom-nav-basic-flow': defineAsyncComponent(() => import('../demos/components/ds-bottom-nav/DsBottomNavBasicFlowDemo.vue')),
  'ds-bottom-nav-external-state': defineAsyncComponent(() => import('../demos/components/ds-bottom-nav/DsBottomNavExternalStateDemo.vue')),
  'ds-bottom-nav-mobile-shell': defineAsyncComponent(() => import('../demos/components/ds-bottom-nav/DsBottomNavMobileShellDemo.vue')),
  'ds-button-group-filter-rail': defineAsyncComponent(() => import('../demos/components/ds-button-group/DsButtonGroupFilterRailDemo.vue')),
  'ds-button-group-segmented': defineAsyncComponent(() => import('../demos/components/ds-button-group/DsButtonGroupSegmentedDemo.vue')),
  'ds-button-group-toolbar': defineAsyncComponent(() => import('../demos/components/ds-button-group/DsButtonGroupToolbarDemo.vue')),
  'ds-button-builder': defineAsyncComponent(() => import('../demos/components/ds-button/DsButtonBuilderDemo.vue')),
  'ds-button-state-matrix': defineAsyncComponent(() => import('../demos/components/ds-button/DsButtonMatrixDemo.vue')),
  'ds-card-action-panel': defineAsyncComponent(() => import('../demos/components/ds-card/DsCardActionPanelDemo.vue')),
  'ds-card-basic-surface': defineAsyncComponent(() => import('../demos/components/ds-card/DsCardBasicSurfaceDemo.vue')),
  'ds-card-kpi-grid': defineAsyncComponent(() => import('../demos/components/ds-card/DsCardKpiGridDemo.vue')),
  'ds-checkbox-interactive-label': defineAsyncComponent(() => import('../demos/components/ds-checkbox/DsCheckboxInteractiveLabelDemo.vue')),
  'ds-checkbox-native-form': defineAsyncComponent(() => import('../demos/components/ds-checkbox/DsCheckboxNativeFormDemo.vue')),
  'ds-checkbox-state-matrix': defineAsyncComponent(() => import('../demos/components/ds-checkbox/DsCheckboxStatesDemo.vue')),
  'ds-collapse-accordion-flow': defineAsyncComponent(() => import('../demos/components/ds-collapse/DsCollapseAccordionDemo.vue')),
  'ds-collapse-disabled-state': defineAsyncComponent(() => import('../demos/components/ds-collapse/DsCollapseDisabledStateDemo.vue')),
  'ds-collapse-multi-section': defineAsyncComponent(() => import('../demos/components/ds-collapse/DsCollapseMultiSectionDemo.vue')),
  'ds-confirm-dialog-button-matrix': defineAsyncComponent(() => import('../demos/components/ds-confirm-dialog/DsConfirmDialogButtonMatrixDemo.vue')),
  'ds-confirm-dialog-custom-body': defineAsyncComponent(() => import('../demos/components/ds-confirm-dialog/DsConfirmDialogCustomBodyDemo.vue')),
  'ds-confirm-dialog-destructive': defineAsyncComponent(() => import('../demos/components/ds-confirm-dialog/DsConfirmDialogDestructiveDemo.vue')),
  'ds-data-table-custom-cells': defineAsyncComponent(() => import('../demos/components/ds-data-table/DsDataTableCustomCellsDemo.vue')),
  'ds-data-table-filtered-view': defineAsyncComponent(() => import('../demos/components/ds-data-table/DsDataTableFilteredViewDemo.vue')),
  'ds-data-table-sortable-columns': defineAsyncComponent(() => import('../demos/components/ds-data-table/DsDataTableSortableColumnsDemo.vue')),
  'ds-dialog-basic-flow': defineAsyncComponent(() => import('../demos/components/ds-dialog/DsDialogBasicFlowDemo.vue')),
  'ds-dialog-guarded-backdrop': defineAsyncComponent(() => import('../demos/components/ds-dialog/DsDialogGuardedBackdropDemo.vue')),
  'ds-dialog-section-config': defineAsyncComponent(() => import('../demos/components/ds-dialog/DsDialogSectionConfigDemo.vue')),
  'ds-dropdown-alignment-width': defineAsyncComponent(() => import('../demos/components/ds-dropdown/DsDropdownAlignmentDemo.vue')),
  'ds-dropdown-basic-menu': defineAsyncComponent(() => import('../demos/components/ds-dropdown/DsDropdownBasicMenuDemo.vue')),
  'ds-dropdown-persistent-content': defineAsyncComponent(() => import('../demos/components/ds-dropdown/DsDropdownPersistentContentDemo.vue')),
  'ds-dropdown-menu-grouped-actions': defineAsyncComponent(() => import('../demos/components/ds-dropdown-menu/DsDropdownMenuGroupedActionsDemo.vue')),
  'ds-dropdown-menu-quick-actions': defineAsyncComponent(() => import('../demos/components/ds-dropdown-menu/DsDropdownMenuQuickActionsDemo.vue')),
  'ds-dropdown-menu-shortcut-grid': defineAsyncComponent(() => import('../demos/components/ds-dropdown-menu/DsDropdownMenuShortcutGridDemo.vue')),
  'ds-drawer-filter-panel': defineAsyncComponent(() => import('../demos/components/ds-drawer/DsDrawerFilterPanelDemo.vue')),
  'ds-drawer-guarded-size': defineAsyncComponent(() => import('../demos/components/ds-drawer/DsDrawerGuardedSizeDemo.vue')),
  'ds-drawer-left-rail': defineAsyncComponent(() => import('../demos/components/ds-drawer/DsDrawerLeftRailDemo.vue')),
  'ds-empty-state-primary-action': defineAsyncComponent(() => import('../demos/components/ds-empty-state/DsEmptyStateActionDemo.vue')),
  'ds-empty-state-search-flow': defineAsyncComponent(() => import('../demos/components/ds-empty-state/DsEmptyStateSearchDemo.vue')),
  'ds-empty-state-split-layout': defineAsyncComponent(() => import('../demos/components/ds-empty-state/DsEmptyStateSplitLayoutDemo.vue')),
  'ds-file-upload-custom-ui': defineAsyncComponent(() => import('../demos/components/ds-file-upload/DsFileUploadCustomUiDemo.vue')),
  'ds-file-upload-disabled-and-limit': defineAsyncComponent(() => import('../demos/components/ds-file-upload/DsFileUploadDisabledDemo.vue')),
  'ds-file-upload-validation': defineAsyncComponent(() => import('../demos/components/ds-file-upload/DsFileUploadValidationDemo.vue')),
  'ds-form-field-basic-label': defineAsyncComponent(() => import('../demos/components/ds-form-field/DsFormFieldBasicDemo.vue')),
  'ds-form-field-custom-label': defineAsyncComponent(() => import('../demos/components/ds-form-field/DsFormFieldCustomLabelDemo.vue')),
  'ds-form-field-error-state': defineAsyncComponent(() => import('../demos/components/ds-form-field/DsFormFieldErrorDemo.vue')),
  'ds-form-file-basic-selection': defineAsyncComponent(() => import('../demos/components/ds-form-file/DsFormFileBasicSelectionDemo.vue')),
  'ds-form-file-custom-validation': defineAsyncComponent(() => import('../demos/components/ds-form-file/DsFormFileValidationDemo.vue')),
  'ds-form-file-multiple-queue': defineAsyncComponent(() => import('../demos/components/ds-form-file/DsFormFileMultipleQueueDemo.vue')),
  'ds-form-section-nested-groups': defineAsyncComponent(() => import('../demos/components/ds-form-section/DsFormSectionNestedGroupsDemo.vue')),
  'ds-form-section-profile-layout': defineAsyncComponent(() => import('../demos/components/ds-form-section/DsFormSectionProfileDemo.vue')),
  'ds-form-section-stacked-flow': defineAsyncComponent(() => import('../demos/components/ds-form-section/DsFormSectionStackedFlowDemo.vue')),
  'ds-icon-inline-copy': defineAsyncComponent(() => import('../demos/components/ds-icon/DsIconInlineCopyDemo.vue')),
  'ds-icon-size-scale': defineAsyncComponent(() => import('../demos/components/ds-icon/DsIconSizeScaleDemo.vue')),
  'ds-icon-status-card': defineAsyncComponent(() => import('../demos/components/ds-icon/DsIconStatusCardDemo.vue')),
  'ds-image-viewer-async-media': defineAsyncComponent(() => import('../demos/components/ds-image-viewer/DsImageViewerAsyncMediaDemo.vue')),
  'ds-image-viewer-gallery': defineAsyncComponent(() => import('../demos/components/ds-image-viewer/DsImageViewerGalleryDemo.vue')),
  'ds-image-viewer-toolbar-slot': defineAsyncComponent(() => import('../demos/components/ds-image-viewer/DsImageViewerToolbarSlotDemo.vue')),
  'ds-input-addons-width-guards': defineAsyncComponent(() => import('../demos/components/ds-input/DsInputAddonsDemo.vue')),
  'ds-input-size-and-alignment': defineAsyncComponent(() => import('../demos/components/ds-input/DsInputSizingDemo.vue')),
  'ds-input-tag-basic-flow': defineAsyncComponent(() => import('../demos/components/ds-input-tag/DsInputTagBasicFlowDemo.vue')),
  'ds-input-tag-custom-slot': defineAsyncComponent(() => import('../demos/components/ds-input-tag/DsInputTagCustomTagDemo.vue')),
  'ds-input-tag-max-state': defineAsyncComponent(() => import('../demos/components/ds-input-tag/DsInputTagMaxStateDemo.vue')),
  'ds-input-validation-states': defineAsyncComponent(() => import('../demos/components/ds-input/DsInputStatesDemo.vue')),
  'ds-link-builder': defineAsyncComponent(() => import('../demos/components/ds-link/DsLinkBuilderDemo.vue')),
  'ds-link-disabled-states': defineAsyncComponent(() => import('../demos/components/ds-link/DsLinkDisabledStatesDemo.vue')),
  'ds-link-external': defineAsyncComponent(() => import('../demos/components/ds-link/DsLinkExternalDemo.vue')),
  'ds-link-variants': defineAsyncComponent(() => import('../demos/components/ds-link/DsLinkVariantsDemo.vue')),
  'ds-list-empty-state': defineAsyncComponent(() => import('../demos/components/ds-list/DsListEmptyStateDemo.vue')),
  'ds-list-queue-actions': defineAsyncComponent(() => import('../demos/components/ds-list/DsListQueueActionsDemo.vue')),
  'ds-list-settings': defineAsyncComponent(() => import('../demos/components/ds-list/DsListSettingsDemo.vue')),
  'ds-loading-custom-appearance': defineAsyncComponent(() => import('../demos/components/ds-loading/DsLoadingCustomAppearanceDemo.vue')),
  'ds-loading-fullscreen': defineAsyncComponent(() => import('../demos/components/ds-loading/DsLoadingFullscreenDemo.vue')),
  'ds-loading-inline-overlay': defineAsyncComponent(() => import('../demos/components/ds-loading/DsLoadingInlineDemo.vue')),
  'ds-modal-backdrop-guard': defineAsyncComponent(() => import('../demos/components/ds-modal/DsModalBackdropGuardDemo.vue')),
  'ds-modal-basic-flow': defineAsyncComponent(() => import('../demos/components/ds-modal/DsModalBasicFlowDemo.vue')),
  'ds-modal-size-switcher': defineAsyncComponent(() => import('../demos/components/ds-modal/DsModalSizeSwitcherDemo.vue')),
  'ds-navbar-actions-slot': defineAsyncComponent(() => import('../demos/components/ds-navbar/DsNavbarActionsDemo.vue')),
  'ds-navbar-menu-toggle': defineAsyncComponent(() => import('../demos/components/ds-navbar/DsNavbarMenuToggleDemo.vue')),
  'ds-navbar-title-slot': defineAsyncComponent(() => import('../demos/components/ds-navbar/DsNavbarTitleSlotDemo.vue')),
  'ds-number-input-alignment-addons': defineAsyncComponent(() => import('../demos/components/ds-number-input/DsNumberInputAlignmentDemo.vue')),
  'ds-number-input-controls': defineAsyncComponent(() => import('../demos/components/ds-number-input/DsNumberInputControlsDemo.vue')),
  'ds-number-input-decimal-separator': defineAsyncComponent(() => import('../demos/components/ds-number-input/DsNumberInputSeparatorDemo.vue')),
  'ds-pagination-basic-flow': defineAsyncComponent(() => import('../demos/components/ds-pagination/DsPaginationBasicFlowDemo.vue')),
  'ds-pagination-page-size-guard': defineAsyncComponent(() => import('../demos/components/ds-pagination/DsPaginationPageSizeDemo.vue')),
  'ds-pagination-table-composition': defineAsyncComponent(() => import('../demos/components/ds-pagination/DsPaginationTableCompositionDemo.vue')),
  'ds-progress-bar-basic-flow': defineAsyncComponent(() => import('../demos/components/ds-progress-bar/DsProgressBarBasicDemo.vue')),
  'ds-progress-bar-clamped-values': defineAsyncComponent(() => import('../demos/components/ds-progress-bar/DsProgressBarClampDemo.vue')),
  'ds-progress-bar-pipeline-stages': defineAsyncComponent(() => import('../demos/components/ds-progress-bar/DsProgressBarPipelineDemo.vue')),
  'ds-prompt-dialog-optional-value': defineAsyncComponent(() => import('../demos/components/ds-prompt-dialog/DsPromptDialogOptionalValueDemo.vue')),
  'ds-prompt-dialog-rename-flow': defineAsyncComponent(() => import('../demos/components/ds-prompt-dialog/DsPromptDialogRenameDemo.vue')),
  'ds-prompt-dialog-reset-flow': defineAsyncComponent(() => import('../demos/components/ds-prompt-dialog/DsPromptDialogResetFlowDemo.vue')),
  'ds-radio-button-variant': defineAsyncComponent(() => import('../demos/components/ds-radio/DsRadioButtonVariantDemo.vue')),
  'ds-radio-group-button-variant': defineAsyncComponent(() => import('../demos/components/ds-radio-group/DsRadioGroupButtonDemo.vue')),
  'ds-radio-group-custom-slots': defineAsyncComponent(() => import('../demos/components/ds-radio-group/DsRadioGroupCustomSlotsDemo.vue')),
  'ds-radio-group-inheritance': defineAsyncComponent(() => import('../demos/components/ds-radio/DsRadioGroupInheritanceDemo.vue')),
  'ds-radio-group-options': defineAsyncComponent(() => import('../demos/components/ds-radio-group/DsRadioGroupOptionsDemo.vue')),
  'ds-radio-standalone-controlled': defineAsyncComponent(() => import('../demos/components/ds-radio/DsRadioStandaloneDemo.vue')),
  'ds-segmented-basic-pills': defineAsyncComponent(() => import('../demos/components/ds-segmented/DsSegmentedBasicDemo.vue')),
  'ds-segmented-button-variant': defineAsyncComponent(() => import('../demos/components/ds-segmented/DsSegmentedButtonDemo.vue')),
  'ds-segmented-content': defineAsyncComponent(() => import('../demos/components/ds-segmented/DsSegmentedContentDemo.vue')),
  'ds-segmented-states': defineAsyncComponent(() => import('../demos/components/ds-segmented/DsSegmentedStatesDemo.vue')),
  'ds-select-custom-value': defineAsyncComponent(() => import('../demos/components/ds-select/DsSelectCustomValueDemo.vue')),
  'ds-select-native-modes': defineAsyncComponent(() => import('../demos/components/ds-select/DsSelectModesDemo.vue')),
  'ds-select-panel-multiple': defineAsyncComponent(() => import('../demos/components/ds-select/DsSelectPanelDemo.vue')),
  'ds-sidebar-basic-sections': defineAsyncComponent(() => import('../demos/components/ds-sidebar/DsSidebarBasicSectionsDemo.vue')),
  'ds-sidebar-documentation-nav': defineAsyncComponent(() => import('../demos/components/ds-sidebar/DsSidebarDocumentationNavDemo.vue')),
  'ds-sidebar-filter-rail': defineAsyncComponent(() => import('../demos/components/ds-sidebar/DsSidebarFilterRailDemo.vue')),
  'ds-skeleton-dashboard-layout': defineAsyncComponent(() => import('../demos/components/ds-skeleton/DsSkeletonDashboardDemo.vue')),
  'ds-skeleton-list-placeholder': defineAsyncComponent(() => import('../demos/components/ds-skeleton/DsSkeletonListDemo.vue')),
  'ds-skeleton-text-card': defineAsyncComponent(() => import('../demos/components/ds-skeleton/DsSkeletonTextCardDemo.vue')),
  'ds-switch-builder': defineAsyncComponent(() => import('../demos/components/ds-switch/DsSwitchBuilderDemo.vue')),
  'ds-switch-custom-colors': defineAsyncComponent(() => import('../demos/components/ds-switch/DsSwitchColorsDemo.vue')),
  'ds-switch-disabled-labeled': defineAsyncComponent(() => import('../demos/components/ds-switch/DsSwitchDisabledDemo.vue')),
  'ds-switch-size-scale': defineAsyncComponent(() => import('../demos/components/ds-switch/DsSwitchSizesDemo.vue')),
  'ds-table-basic-rows': defineAsyncComponent(() => import('../demos/components/ds-table/DsTableBasicRowsDemo.vue')),
  'ds-table-empty-state': defineAsyncComponent(() => import('../demos/components/ds-table/DsTableEmptyStateDemo.vue')),
  'ds-table-loading-state': defineAsyncComponent(() => import('../demos/components/ds-table/DsTableLoadingStateDemo.vue')),
  'ds-tabs-badge-navigation': defineAsyncComponent(() => import('../demos/components/ds-tabs/DsTabsBadgeDemo.vue')),
  'ds-tabs-basic-switch': defineAsyncComponent(() => import('../demos/components/ds-tabs/DsTabsBasicSwitchDemo.vue')),
  'ds-tabs-panel-layout': defineAsyncComponent(() => import('../demos/components/ds-tabs/DsTabsPanelLayoutDemo.vue')),
  'ds-textarea-disabled-state': defineAsyncComponent(() => import('../demos/components/ds-textarea/DsTextareaDisabledDemo.vue')),
  'ds-textarea-rows-layout': defineAsyncComponent(() => import('../demos/components/ds-textarea/DsTextareaRowsDemo.vue')),
  'ds-textarea-validation-states': defineAsyncComponent(() => import('../demos/components/ds-textarea/DsTextareaStatesDemo.vue')),
  'ds-toaster-queue-flow': defineAsyncComponent(() => import('../demos/components/ds-toaster/DsToasterQueueDemo.vue')),
  'ds-toaster-sticky-host': defineAsyncComponent(() => import('../demos/components/ds-toaster/DsToasterStickyDemo.vue')),
  'ds-toaster-variant-push': defineAsyncComponent(() => import('../demos/components/ds-toaster/DsToasterVariantDemo.vue')),
  'ds-tree-drag-and-slot': defineAsyncComponent(() => import('../demos/components/ds-tree/DsTreeDragAndSlotDemo.vue')),
  'ds-tree-expanded-state': defineAsyncComponent(() => import('../demos/components/ds-tree/DsTreeExpandedStateDemo.vue')),
  'ds-tree-filtering': defineAsyncComponent(() => import('../demos/components/ds-tree/DsTreeFilteringDemo.vue')),
  'ds-tree-select-custom-slots': defineAsyncComponent(() => import('../demos/components/ds-tree-select/DsTreeSelectCustomSlotsDemo.vue')),
  'ds-tree-select-multiple-filter': defineAsyncComponent(() => import('../demos/components/ds-tree-select/DsTreeSelectMultipleFilterDemo.vue')),
  'ds-tree-select-path-display': defineAsyncComponent(() => import('../demos/components/ds-tree-select/DsTreeSelectPathDisplayDemo.vue')),
  'ds-tooltip-custom-tone': defineAsyncComponent(() => import('../demos/components/ds-tooltip/DsTooltipToneDemo.vue')),
  'ds-tooltip-custom-trigger': defineAsyncComponent(() => import('../demos/components/ds-tooltip/DsTooltipCustomTriggerDemo.vue')),
  'ds-tooltip-inline-help': defineAsyncComponent(() => import('../demos/components/ds-tooltip/DsTooltipInlineHelpDemo.vue')),
} as const

const componentEntity = computed(() => {
  return getShowcaseComponentBySlug(String(route.params.componentSlug ?? ''))
})

const componentDoc = computed(() => {
  if (!componentEntity.value)
    return undefined

  return getShowcaseComponentDoc(componentEntity.value)
})

const accessibilityItems = computed(() => createAccessibilityItems(componentEntity.value, t))
const dependencyItems = computed(() => createDependencyItems(componentEntity.value, t))
const relatedLinks = computed(() => createRelatedLinks(componentEntity.value, t))
const componentsPage = computed(() => localizePageByName('components'))

function resolvePreviewComponent(previewKey?: string) {
  if (!previewKey)
    return undefined

  return previewRegistry[previewKey as keyof typeof previewRegistry]
}

watch(componentEntity, () => {
  if (componentEntity.value) {
    useI18nScope(['components.' + componentEntity.value.name])
  }
}, {immediate: true})
</script>

<template>
  <div v-if="componentEntity && componentDoc" class="space-y-8">
    <div>
      <h1 class="max-w-4xl text-3xl font-semibold leading-tight lg:text-4xl">
        {{ componentEntity.title }}
      </h1>
      <div class="flex flex-wrap items-center gap-3 mt-5">
        <span class="showcase-kicker text-xs font-semibold tracking-[0.18em]">
          {{ componentsPage.eyebrow }} / {{ componentEntity.group }}
        </span>
      </div>
      <div class="mt-2 space-y-4">
        <p class="showcase-text-muted max-w-3xl text-base leading-7">
          {{ componentEntity.summary }}
        </p>
      </div>
    </div>

    <section id="live-examples" class="scroll-mt-28 space-y-4">
      <div class="space-y-2">
        <h2 class="text-2xl font-semibold">
          {{ t('showcase.detailPage.liveExamples.title') }}
        </h2>
        <p class="showcase-text-muted text-sm leading-6">
          {{ t('showcase.detailPage.liveExamples.descriptionComponent') }}
        </p>
      </div>

      <div class="grid gap-6">
        <ExampleCard
            v-for="example in componentDoc.examples"
            :key="example.id"
            :title="example.title"
            :description="example.description"
            :code="example.code"
            :note="example.note"
        >
          <template v-if="resolvePreviewComponent(example.previewKey)" #preview>
            <component :is="resolvePreviewComponent(example.previewKey)"/>
          </template>
        </ExampleCard>
      </div>
    </section>

    <section id="api" class="scroll-mt-28 space-y-4">
      <h2 class="text-2xl font-semibold">
        {{ t('showcase.detailPage.api.title') }}
      </h2>
      <div class="grid gap-4">
        <PropsTable :items="componentEntity.apiSections.find(section => section.key === 'props')?.items ?? []"/>
        <SlotsTable :items="componentEntity.apiSections.find(section => section.key === 'slots')?.items ?? []"/>
        <EventsTable :items="componentEntity.apiSections.find(section => section.key === 'events')?.items ?? []"/>
        <MethodsTable :items="componentEntity.apiSections.find(section => section.key === 'methods')?.items ?? []"/>
      </div>
    </section>

    <section id="integration-notes" class="scroll-mt-28 space-y-4">
      <div class="space-y-2">
        <h2 class="text-2xl font-semibold">
          {{ t('showcase.detailPage.implementationNotes.title') }}
        </h2>
        <p class="showcase-text-muted max-w-3xl text-sm leading-6">
          {{ t('showcase.detailPage.implementationNotes.description') }}
        </p>
      </div>

      <div class="grid gap-4 lg:grid-cols-3">
        <InfoSectionCard :title="t('showcase.detailPage.info.accessibilityTitle')" :items="accessibilityItems" variant="list"/>
        <InfoSectionCard :title="t('showcase.detailPage.info.dependenciesTitle')" :items="dependencyItems" variant="chips"/>
        <InfoSectionCard :title="t('showcase.detailPage.info.relatedLinksTitle')" :links="relatedLinks" variant="links"/>
      </div>
    </section>
  </div>

  <DsCard
      v-else
      class="showcase-panel rounded-3xl border p-8"
  >
    <h1 class="text-3xl font-semibold">
      {{ t('showcase.detailPage.notFoundComponent.title') }}
    </h1>
    <p class="showcase-text-muted mt-4 max-w-2xl text-sm leading-6">
      {{ t('showcase.detailPage.notFoundComponent.description') }}
    </p>
    <RouterLink
        to="/components"
        class="showcase-link-chip mt-6 inline-flex rounded-full border px-4 py-2 text-sm font-semibold transition-colors"
    >
      {{ t('showcase.detailPage.notFoundComponent.action') }}
    </RouterLink>
  </DsCard>
</template>