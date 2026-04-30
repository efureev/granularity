<script setup lang="ts">
import {computed, defineAsyncComponent, watch} from 'vue'
import {RouterLink, useRoute} from 'vue-router'

import {useFintI18n} from '@feugene/fint-i18n/vue'
import {GrCard} from '@feugene/granularity'

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
  'ds-alert-closable-flow': defineAsyncComponent(() => import('../demos/components/ds-alert/GrAlertClosableDemo.vue')),
  'ds-alert-custom-colors': defineAsyncComponent(() => import('../demos/components/ds-alert/GrAlertCustomColorsDemo.vue')),
  'ds-alert-variant-matrix': defineAsyncComponent(() => import('../demos/components/ds-alert/GrAlertVariantsDemo.vue')),
  'ds-avatar-image-fallback': defineAsyncComponent(() => import('../demos/components/ds-avatar/GrAvatarImageFallbackDemo.vue')),
  'ds-avatar-size-shape': defineAsyncComponent(() => import('../demos/components/ds-avatar/GrAvatarSizeShapeDemo.vue')),
  'ds-avatar-team-row': defineAsyncComponent(() => import('../demos/components/ds-avatar/GrAvatarTeamRowDemo.vue')),
  'ds-badge-builder': defineAsyncComponent(() => import('../demos/components/ds-badge/GrBadgeBuilderDemo.vue')),
  'ds-badge-size-radius': defineAsyncComponent(() => import('../demos/components/ds-badge/GrBadgeSizeRadiusDemo.vue')),
  'ds-badge-toolbar-filters': defineAsyncComponent(() => import('../demos/components/ds-badge/GrBadgeToolbarFiltersDemo.vue')),
  'ds-badge-variant-scale': defineAsyncComponent(() => import('../demos/components/ds-badge/GrBadgeVariantScaleDemo.vue')),
  'ds-badge-wrap-counter': defineAsyncComponent(() => import('../demos/components/ds-badge-wrap/GrBadgeWrapCounterDemo.vue')),
  'ds-badge-wrap-dot-status': defineAsyncComponent(() => import('../demos/components/ds-badge-wrap/GrBadgeWrapDotStatusDemo.vue')),
  'ds-badge-wrap-tab-notification': defineAsyncComponent(() => import('../demos/components/ds-badge-wrap/GrBadgeWrapTabNotificationDemo.vue')),
  'ds-bottom-nav-basic-flow': defineAsyncComponent(() => import('../demos/components/ds-bottom-nav/GrBottomNavBasicFlowDemo.vue')),
  'ds-bottom-nav-external-state': defineAsyncComponent(() => import('../demos/components/ds-bottom-nav/GrBottomNavExternalStateDemo.vue')),
  'ds-bottom-nav-mobile-shell': defineAsyncComponent(() => import('../demos/components/ds-bottom-nav/GrBottomNavMobileShellDemo.vue')),
  'ds-button-group-filter-rail': defineAsyncComponent(() => import('../demos/components/ds-button-group/GrButtonGroupFilterRailDemo.vue')),
  'ds-button-group-segmented': defineAsyncComponent(() => import('../demos/components/ds-button-group/GrButtonGroupSegmentedDemo.vue')),
  'ds-button-group-toolbar': defineAsyncComponent(() => import('../demos/components/ds-button-group/GrButtonGroupToolbarDemo.vue')),
  'ds-button-builder': defineAsyncComponent(() => import('../demos/components/ds-button/GrButtonBuilderDemo.vue')),
  'ds-button-state-matrix': defineAsyncComponent(() => import('../demos/components/ds-button/GrButtonMatrixDemo.vue')),
  'ds-card-action-panel': defineAsyncComponent(() => import('../demos/components/ds-card/GrCardActionPanelDemo.vue')),
  'ds-card-basic-surface': defineAsyncComponent(() => import('../demos/components/ds-card/GrCardBasicSurfaceDemo.vue')),
  'ds-card-kpi-grid': defineAsyncComponent(() => import('../demos/components/ds-card/GrCardKpiGridDemo.vue')),
  'ds-checkbox-interactive-label': defineAsyncComponent(() => import('../demos/components/ds-checkbox/GrCheckboxInteractiveLabelDemo.vue')),
  'ds-checkbox-native-form': defineAsyncComponent(() => import('../demos/components/ds-checkbox/GrCheckboxNativeFormDemo.vue')),
  'ds-checkbox-state-matrix': defineAsyncComponent(() => import('../demos/components/ds-checkbox/GrCheckboxStatesDemo.vue')),
  'ds-collapse-accordion-flow': defineAsyncComponent(() => import('../demos/components/ds-collapse/GrCollapseAccordionDemo.vue')),
  'ds-collapse-disabled-state': defineAsyncComponent(() => import('../demos/components/ds-collapse/GrCollapseDisabledStateDemo.vue')),
  'ds-collapse-multi-section': defineAsyncComponent(() => import('../demos/components/ds-collapse/GrCollapseMultiSectionDemo.vue')),
  'ds-confirm-dialog-button-matrix': defineAsyncComponent(() => import('../demos/components/ds-confirm-dialog/GrConfirmDialogButtonMatrixDemo.vue')),
  'ds-confirm-dialog-custom-body': defineAsyncComponent(() => import('../demos/components/ds-confirm-dialog/GrConfirmDialogCustomBodyDemo.vue')),
  'ds-confirm-dialog-destructive': defineAsyncComponent(() => import('../demos/components/ds-confirm-dialog/GrConfirmDialogDestructiveDemo.vue')),
  'ds-data-table-custom-cells': defineAsyncComponent(() => import('../demos/components/ds-data-table/GrDataTableCustomCellsDemo.vue')),
  'ds-data-table-filtered-view': defineAsyncComponent(() => import('../demos/components/ds-data-table/GrDataTableFilteredViewDemo.vue')),
  'ds-data-table-sortable-columns': defineAsyncComponent(() => import('../demos/components/ds-data-table/GrDataTableSortableColumnsDemo.vue')),
  'ds-dialog-basic-flow': defineAsyncComponent(() => import('../demos/components/ds-dialog/GrDialogBasicFlowDemo.vue')),
  'ds-dialog-guarded-backdrop': defineAsyncComponent(() => import('../demos/components/ds-dialog/GrDialogGuardedBackdropDemo.vue')),
  'ds-dialog-section-config': defineAsyncComponent(() => import('../demos/components/ds-dialog/GrDialogSectionConfigDemo.vue')),
  'ds-dropdown-alignment-width': defineAsyncComponent(() => import('../demos/components/ds-dropdown/GrDropdownAlignmentDemo.vue')),
  'ds-dropdown-basic-menu': defineAsyncComponent(() => import('../demos/components/ds-dropdown/GrDropdownBasicMenuDemo.vue')),
  'ds-dropdown-persistent-content': defineAsyncComponent(() => import('../demos/components/ds-dropdown/GrDropdownPersistentContentDemo.vue')),
  'ds-dropdown-menu-grouped-actions': defineAsyncComponent(() => import('../demos/components/ds-dropdown-menu/GrDropdownMenuGroupedActionsDemo.vue')),
  'ds-dropdown-menu-quick-actions': defineAsyncComponent(() => import('../demos/components/ds-dropdown-menu/GrDropdownMenuQuickActionsDemo.vue')),
  'ds-dropdown-menu-shortcut-grid': defineAsyncComponent(() => import('../demos/components/ds-dropdown-menu/GrDropdownMenuShortcutGridDemo.vue')),
  'ds-drawer-filter-panel': defineAsyncComponent(() => import('../demos/components/ds-drawer/GrDrawerFilterPanelDemo.vue')),
  'ds-drawer-guarded-size': defineAsyncComponent(() => import('../demos/components/ds-drawer/GrDrawerGuardedSizeDemo.vue')),
  'ds-drawer-left-rail': defineAsyncComponent(() => import('../demos/components/ds-drawer/GrDrawerLeftRailDemo.vue')),
  'ds-empty-state-primary-action': defineAsyncComponent(() => import('../demos/components/ds-empty-state/GrEmptyStateActionDemo.vue')),
  'ds-empty-state-search-flow': defineAsyncComponent(() => import('../demos/components/ds-empty-state/GrEmptyStateSearchDemo.vue')),
  'ds-empty-state-split-layout': defineAsyncComponent(() => import('../demos/components/ds-empty-state/GrEmptyStateSplitLayoutDemo.vue')),
  'ds-file-upload-custom-ui': defineAsyncComponent(() => import('../demos/components/ds-file-upload/GrFileUploadCustomUiDemo.vue')),
  'ds-file-upload-disabled-and-limit': defineAsyncComponent(() => import('../demos/components/ds-file-upload/GrFileUploadDisabledDemo.vue')),
  'ds-file-upload-validation': defineAsyncComponent(() => import('../demos/components/ds-file-upload/GrFileUploadValidationDemo.vue')),
  'ds-form-field-basic-label': defineAsyncComponent(() => import('../demos/components/ds-form-field/GrFormFieldBasicDemo.vue')),
  'ds-form-field-custom-label': defineAsyncComponent(() => import('../demos/components/ds-form-field/GrFormFieldCustomLabelDemo.vue')),
  'ds-form-field-error-state': defineAsyncComponent(() => import('../demos/components/ds-form-field/GrFormFieldErrorDemo.vue')),
  'ds-form-file-basic-selection': defineAsyncComponent(() => import('../demos/components/ds-form-file/GrFormFileBasicSelectionDemo.vue')),
  'ds-form-file-custom-validation': defineAsyncComponent(() => import('../demos/components/ds-form-file/GrFormFileValidationDemo.vue')),
  'ds-form-file-multiple-queue': defineAsyncComponent(() => import('../demos/components/ds-form-file/GrFormFileMultipleQueueDemo.vue')),
  'ds-form-section-nested-groups': defineAsyncComponent(() => import('../demos/components/ds-form-section/GrFormSectionNestedGroupsDemo.vue')),
  'ds-form-section-profile-layout': defineAsyncComponent(() => import('../demos/components/ds-form-section/GrFormSectionProfileDemo.vue')),
  'ds-form-section-stacked-flow': defineAsyncComponent(() => import('../demos/components/ds-form-section/GrFormSectionStackedFlowDemo.vue')),
  'ds-icon-inline-copy': defineAsyncComponent(() => import('../demos/components/ds-icon/GrIconInlineCopyDemo.vue')),
  'ds-icon-size-scale': defineAsyncComponent(() => import('../demos/components/ds-icon/GrIconSizeScaleDemo.vue')),
  'ds-icon-status-card': defineAsyncComponent(() => import('../demos/components/ds-icon/GrIconStatusCardDemo.vue')),
  'ds-image-viewer-async-media': defineAsyncComponent(() => import('../demos/components/ds-image-viewer/GrImageViewerAsyncMediaDemo.vue')),
  'ds-image-viewer-gallery': defineAsyncComponent(() => import('../demos/components/ds-image-viewer/GrImageViewerGalleryDemo.vue')),
  'ds-image-viewer-toolbar-slot': defineAsyncComponent(() => import('../demos/components/ds-image-viewer/GrImageViewerToolbarSlotDemo.vue')),
  'ds-input-addons-width-guards': defineAsyncComponent(() => import('../demos/components/ds-input/GrInputAddonsDemo.vue')),
  'ds-input-size-and-alignment': defineAsyncComponent(() => import('../demos/components/ds-input/GrInputSizingDemo.vue')),
  'ds-input-tag-basic-flow': defineAsyncComponent(() => import('../demos/components/ds-input-tag/GrInputTagBasicFlowDemo.vue')),
  'ds-input-tag-custom-slot': defineAsyncComponent(() => import('../demos/components/ds-input-tag/GrInputTagCustomTagDemo.vue')),
  'ds-input-tag-max-state': defineAsyncComponent(() => import('../demos/components/ds-input-tag/GrInputTagMaxStateDemo.vue')),
  'ds-input-validation-states': defineAsyncComponent(() => import('../demos/components/ds-input/GrInputStatesDemo.vue')),
  'ds-link-builder': defineAsyncComponent(() => import('../demos/components/ds-link/GrLinkBuilderDemo.vue')),
  'ds-link-disabled-states': defineAsyncComponent(() => import('../demos/components/ds-link/GrLinkDisabledStatesDemo.vue')),
  'ds-link-external': defineAsyncComponent(() => import('../demos/components/ds-link/GrLinkExternalDemo.vue')),
  'ds-link-variants': defineAsyncComponent(() => import('../demos/components/ds-link/GrLinkVariantsDemo.vue')),
  'ds-list-empty-state': defineAsyncComponent(() => import('../demos/components/ds-list/GrListEmptyStateDemo.vue')),
  'ds-list-queue-actions': defineAsyncComponent(() => import('../demos/components/ds-list/GrListQueueActionsDemo.vue')),
  'ds-list-settings': defineAsyncComponent(() => import('../demos/components/ds-list/GrListSettingsDemo.vue')),
  'ds-loading-custom-appearance': defineAsyncComponent(() => import('../demos/components/ds-loading/GrLoadingCustomAppearanceDemo.vue')),
  'ds-loading-fullscreen': defineAsyncComponent(() => import('../demos/components/ds-loading/GrLoadingFullscreenDemo.vue')),
  'ds-loading-inline-overlay': defineAsyncComponent(() => import('../demos/components/ds-loading/GrLoadingInlineDemo.vue')),
  'ds-modal-backdrop-guard': defineAsyncComponent(() => import('../demos/components/ds-modal/GrModalBackdropGuardDemo.vue')),
  'ds-modal-basic-flow': defineAsyncComponent(() => import('../demos/components/ds-modal/GrModalBasicFlowDemo.vue')),
  'ds-modal-size-switcher': defineAsyncComponent(() => import('../demos/components/ds-modal/GrModalSizeSwitcherDemo.vue')),
  'ds-navbar-actions-slot': defineAsyncComponent(() => import('../demos/components/ds-navbar/GrNavbarActionsDemo.vue')),
  'ds-navbar-menu-toggle': defineAsyncComponent(() => import('../demos/components/ds-navbar/GrNavbarMenuToggleDemo.vue')),
  'ds-navbar-title-slot': defineAsyncComponent(() => import('../demos/components/ds-navbar/GrNavbarTitleSlotDemo.vue')),
  'ds-number-input-alignment-addons': defineAsyncComponent(() => import('../demos/components/ds-number-input/GrNumberInputAlignmentDemo.vue')),
  'ds-number-input-controls': defineAsyncComponent(() => import('../demos/components/ds-number-input/GrNumberInputControlsDemo.vue')),
  'ds-number-input-decimal-separator': defineAsyncComponent(() => import('../demos/components/ds-number-input/GrNumberInputSeparatorDemo.vue')),
  'ds-pagination-basic-flow': defineAsyncComponent(() => import('../demos/components/ds-pagination/GrPaginationBasicFlowDemo.vue')),
  'ds-pagination-page-size-guard': defineAsyncComponent(() => import('../demos/components/ds-pagination/GrPaginationPageSizeDemo.vue')),
  'ds-pagination-table-composition': defineAsyncComponent(() => import('../demos/components/ds-pagination/GrPaginationTableCompositionDemo.vue')),
  'ds-progress-bar-basic-flow': defineAsyncComponent(() => import('../demos/components/ds-progress-bar/GrProgressBarBasicDemo.vue')),
  'ds-progress-bar-clamped-values': defineAsyncComponent(() => import('../demos/components/ds-progress-bar/GrProgressBarClampDemo.vue')),
  'ds-progress-bar-pipeline-stages': defineAsyncComponent(() => import('../demos/components/ds-progress-bar/GrProgressBarPipelineDemo.vue')),
  'ds-prompt-dialog-optional-value': defineAsyncComponent(() => import('../demos/components/ds-prompt-dialog/GrPromptDialogOptionalValueDemo.vue')),
  'ds-prompt-dialog-rename-flow': defineAsyncComponent(() => import('../demos/components/ds-prompt-dialog/GrPromptDialogRenameDemo.vue')),
  'ds-prompt-dialog-reset-flow': defineAsyncComponent(() => import('../demos/components/ds-prompt-dialog/GrPromptDialogResetFlowDemo.vue')),
  'ds-radio-button-variant': defineAsyncComponent(() => import('../demos/components/ds-radio/GrRadioButtonVariantDemo.vue')),
  'ds-radio-group-button-variant': defineAsyncComponent(() => import('../demos/components/ds-radio-group/GrRadioGroupButtonDemo.vue')),
  'ds-radio-group-custom-slots': defineAsyncComponent(() => import('../demos/components/ds-radio-group/GrRadioGroupCustomSlotsDemo.vue')),
  'ds-radio-group-inheritance': defineAsyncComponent(() => import('../demos/components/ds-radio/GrRadioGroupInheritanceDemo.vue')),
  'ds-radio-group-options': defineAsyncComponent(() => import('../demos/components/ds-radio-group/GrRadioGroupOptionsDemo.vue')),
  'ds-radio-standalone-controlled': defineAsyncComponent(() => import('../demos/components/ds-radio/GrRadioStandaloneDemo.vue')),
  'ds-segmented-basic-pills': defineAsyncComponent(() => import('../demos/components/ds-segmented/GrSegmentedBasicDemo.vue')),
  'ds-segmented-button-variant': defineAsyncComponent(() => import('../demos/components/ds-segmented/GrSegmentedButtonDemo.vue')),
  'ds-segmented-content': defineAsyncComponent(() => import('../demos/components/ds-segmented/GrSegmentedContentDemo.vue')),
  'ds-segmented-states': defineAsyncComponent(() => import('../demos/components/ds-segmented/GrSegmentedStatesDemo.vue')),
  'ds-select-custom-value': defineAsyncComponent(() => import('../demos/components/ds-select/GrSelectCustomValueDemo.vue')),
  'ds-select-native-modes': defineAsyncComponent(() => import('../demos/components/ds-select/GrSelectModesDemo.vue')),
  'ds-select-panel-multiple': defineAsyncComponent(() => import('../demos/components/ds-select/GrSelectPanelDemo.vue')),
  'ds-sidebar-basic-sections': defineAsyncComponent(() => import('../demos/components/ds-sidebar/GrSidebarBasicSectionsDemo.vue')),
  'ds-sidebar-documentation-nav': defineAsyncComponent(() => import('../demos/components/ds-sidebar/GrSidebarDocumentationNavDemo.vue')),
  'ds-sidebar-filter-rail': defineAsyncComponent(() => import('../demos/components/ds-sidebar/GrSidebarFilterRailDemo.vue')),
  'ds-skeleton-dashboard-layout': defineAsyncComponent(() => import('../demos/components/ds-skeleton/GrSkeletonDashboardDemo.vue')),
  'ds-skeleton-list-placeholder': defineAsyncComponent(() => import('../demos/components/ds-skeleton/GrSkeletonListDemo.vue')),
  'ds-skeleton-text-card': defineAsyncComponent(() => import('../demos/components/ds-skeleton/GrSkeletonTextCardDemo.vue')),
  'ds-switch-builder': defineAsyncComponent(() => import('../demos/components/ds-switch/GrSwitchBuilderDemo.vue')),
  'ds-switch-custom-colors': defineAsyncComponent(() => import('../demos/components/ds-switch/GrSwitchColorsDemo.vue')),
  'ds-switch-disabled-labeled': defineAsyncComponent(() => import('../demos/components/ds-switch/GrSwitchDisabledDemo.vue')),
  'ds-switch-size-scale': defineAsyncComponent(() => import('../demos/components/ds-switch/GrSwitchSizesDemo.vue')),
  'ds-table-basic-rows': defineAsyncComponent(() => import('../demos/components/ds-table/GrTableBasicRowsDemo.vue')),
  'ds-table-empty-state': defineAsyncComponent(() => import('../demos/components/ds-table/GrTableEmptyStateDemo.vue')),
  'ds-table-loading-state': defineAsyncComponent(() => import('../demos/components/ds-table/GrTableLoadingStateDemo.vue')),
  'ds-tabs-badge-navigation': defineAsyncComponent(() => import('../demos/components/ds-tabs/GrTabsBadgeDemo.vue')),
  'ds-tabs-basic-switch': defineAsyncComponent(() => import('../demos/components/ds-tabs/GrTabsBasicSwitchDemo.vue')),
  'ds-tabs-panel-layout': defineAsyncComponent(() => import('../demos/components/ds-tabs/GrTabsPanelLayoutDemo.vue')),
  'ds-textarea-disabled-state': defineAsyncComponent(() => import('../demos/components/ds-textarea/GrTextareaDisabledDemo.vue')),
  'ds-textarea-rows-layout': defineAsyncComponent(() => import('../demos/components/ds-textarea/GrTextareaRowsDemo.vue')),
  'ds-textarea-validation-states': defineAsyncComponent(() => import('../demos/components/ds-textarea/GrTextareaStatesDemo.vue')),
  'ds-toaster-builder': defineAsyncComponent(() => import('../demos/components/ds-toaster/GrToasterBuilderDemo.vue')),
  'ds-toaster-queue-flow': defineAsyncComponent(() => import('../demos/components/ds-toaster/GrToasterQueueDemo.vue')),
  'ds-toaster-sticky-host': defineAsyncComponent(() => import('../demos/components/ds-toaster/GrToasterStickyDemo.vue')),
  'ds-tree-drag-and-slot': defineAsyncComponent(() => import('../demos/components/ds-tree/GrTreeDragAndSlotDemo.vue')),
  'ds-tree-expanded-state': defineAsyncComponent(() => import('../demos/components/ds-tree/GrTreeExpandedStateDemo.vue')),
  'ds-tree-filtering': defineAsyncComponent(() => import('../demos/components/ds-tree/GrTreeFilteringDemo.vue')),
  'ds-tree-select-custom-slots': defineAsyncComponent(() => import('../demos/components/ds-tree-select/GrTreeSelectCustomSlotsDemo.vue')),
  'ds-tree-select-multiple-filter': defineAsyncComponent(() => import('../demos/components/ds-tree-select/GrTreeSelectMultipleFilterDemo.vue')),
  'ds-tree-select-path-display': defineAsyncComponent(() => import('../demos/components/ds-tree-select/GrTreeSelectPathDisplayDemo.vue')),
  'ds-tooltip-custom-tone': defineAsyncComponent(() => import('../demos/components/ds-tooltip/GrTooltipToneDemo.vue')),
  'ds-tooltip-custom-trigger': defineAsyncComponent(() => import('../demos/components/ds-tooltip/GrTooltipCustomTriggerDemo.vue')),
  'ds-tooltip-inline-help': defineAsyncComponent(() => import('../demos/components/ds-tooltip/GrTooltipInlineHelpDemo.vue')),
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

  <GrCard
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
  </GrCard>
</template>