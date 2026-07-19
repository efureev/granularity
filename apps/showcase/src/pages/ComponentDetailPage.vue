<script setup lang="ts">
import {computed, defineAsyncComponent, onUnmounted, watch} from 'vue'
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
const i18n = useFintI18n()
const {t} = i18n
const {localizePageByName, localizeEntitySummary} = useShowcasePageI18n()


// Каждый компонент — отдельный i18n-блок (`components.<Name>`). Блок грузится
// лениво при открытии страницы компонента и выгружается при уходе на другой
// компонент, чтобы не держать в памяти переводы всех компонентов сразу.
let activeI18nBlock: string | null = null

function setActiveI18nBlock(blockName: string | null) {
  if (blockName === activeI18nBlock)
    return

  const previous = activeI18nBlock
  activeI18nBlock = blockName

  if (previous) {
    i18n.unregisterUsage(previous)
    for (const locale of i18n.getKnownLocales())
      i18n.unloadBlock(previous, locale)
  }

  if (blockName) {
    i18n.registerUsage(blockName)
    void i18n.loadBlock(blockName)
  }
}

const previewRegistry = {
  'gr-alert-closable-flow': defineAsyncComponent(() => import('../demos/components/gr-alert/GrAlertClosableDemo.vue')),
  'gr-alert-custom-colors': defineAsyncComponent(() => import('../demos/components/gr-alert/GrAlertCustomColorsDemo.vue')),
  'gr-alert-variant-matrix': defineAsyncComponent(() => import('../demos/components/gr-alert/GrAlertVariantsDemo.vue')),
  'gr-avatar-image-fallback': defineAsyncComponent(() => import('../demos/components/gr-avatar/GrAvatarImageFallbackDemo.vue')),
  'gr-avatar-size-shape': defineAsyncComponent(() => import('../demos/components/gr-avatar/GrAvatarSizeShapeDemo.vue')),
  'gr-avatar-team-row': defineAsyncComponent(() => import('../demos/components/gr-avatar/GrAvatarTeamRowDemo.vue')),
  'gr-badge-builder': defineAsyncComponent(() => import('../demos/components/gr-badge/GrBadgeBuilderDemo.vue')),
  'gr-badge-size-radius': defineAsyncComponent(() => import('../demos/components/gr-badge/GrBadgeSizeRadiusDemo.vue')),
  'gr-badge-toolbar-filters': defineAsyncComponent(() => import('../demos/components/gr-badge/GrBadgeToolbarFiltersDemo.vue')),
  'gr-badge-variant-scale': defineAsyncComponent(() => import('../demos/components/gr-badge/GrBadgeVariantScaleDemo.vue')),
  'gr-badge-wrap-counter': defineAsyncComponent(() => import('../demos/components/gr-badge-wrap/GrBadgeWrapCounterDemo.vue')),
  'gr-badge-wrap-dot-status': defineAsyncComponent(() => import('../demos/components/gr-badge-wrap/GrBadgeWrapDotStatusDemo.vue')),
  'gr-badge-wrap-tab-notification': defineAsyncComponent(() => import('../demos/components/gr-badge-wrap/GrBadgeWrapTabNotificationDemo.vue')),
  'gr-bottom-nav-basic-flow': defineAsyncComponent(() => import('../demos/components/gr-bottom-nav/GrBottomNavBasicFlowDemo.vue')),
  'gr-bottom-nav-external-state': defineAsyncComponent(() => import('../demos/components/gr-bottom-nav/GrBottomNavExternalStateDemo.vue')),
  'gr-bottom-nav-mobile-shell': defineAsyncComponent(() => import('../demos/components/gr-bottom-nav/GrBottomNavMobileShellDemo.vue')),
  'gr-button-group-filter-rail': defineAsyncComponent(() => import('../demos/components/gr-button-group/GrButtonGroupFilterRailDemo.vue')),
  'gr-button-group-segmented': defineAsyncComponent(() => import('../demos/components/gr-button-group/GrButtonGroupSegmentedDemo.vue')),
  'gr-button-group-toolbar': defineAsyncComponent(() => import('../demos/components/gr-button-group/GrButtonGroupToolbarDemo.vue')),
  'gr-button-builder': defineAsyncComponent(() => import('../demos/components/gr-button/GrButtonBuilderDemo.vue')),
  'gr-button-state-matrix': defineAsyncComponent(() => import('../demos/components/gr-button/GrButtonMatrixDemo.vue')),
  'gr-card-action-panel': defineAsyncComponent(() => import('../demos/components/gr-card/GrCardActionPanelDemo.vue')),
  'gr-card-basic-surface': defineAsyncComponent(() => import('../demos/components/gr-card/GrCardBasicSurfaceDemo.vue')),
  'gr-card-kpi-grid': defineAsyncComponent(() => import('../demos/components/gr-card/GrCardKpiGridDemo.vue')),
  'gr-checkbox-interactive-label': defineAsyncComponent(() => import('../demos/components/gr-checkbox/GrCheckboxInteractiveLabelDemo.vue')),
  'gr-checkbox-native-form': defineAsyncComponent(() => import('../demos/components/gr-checkbox/GrCheckboxNativeFormDemo.vue')),
  'gr-checkbox-state-matrix': defineAsyncComponent(() => import('../demos/components/gr-checkbox/GrCheckboxStatesDemo.vue')),
  'gr-collapse-accordion-flow': defineAsyncComponent(() => import('../demos/components/gr-collapse/GrCollapseAccordionDemo.vue')),
  'gr-collapse-disabled-state': defineAsyncComponent(() => import('../demos/components/gr-collapse/GrCollapseDisabledStateDemo.vue')),
  'gr-collapse-multi-section': defineAsyncComponent(() => import('../demos/components/gr-collapse/GrCollapseMultiSectionDemo.vue')),
  'gr-confirm-dialog-button-matrix': defineAsyncComponent(() => import('../demos/components/gr-confirm-dialog/GrConfirmDialogButtonMatrixDemo.vue')),
  'gr-confirm-dialog-custom-body': defineAsyncComponent(() => import('../demos/components/gr-confirm-dialog/GrConfirmDialogCustomBodyDemo.vue')),
  'gr-confirm-dialog-destructive': defineAsyncComponent(() => import('../demos/components/gr-confirm-dialog/GrConfirmDialogDestructiveDemo.vue')),
  'gr-confirm-dialog-service-link': defineAsyncComponent(() => import('../demos/components/gr-confirm-dialog/GrDialogServiceLinkDemo.vue')),
  'gr-data-table-custom-cells': defineAsyncComponent(() => import('../demos/components/gr-data-table/GrDataTableCustomCellsDemo.vue')),
  'gr-data-table-filtered-view': defineAsyncComponent(() => import('../demos/components/gr-data-table/GrDataTableFilteredViewDemo.vue')),
  'gr-data-table-sortable-columns': defineAsyncComponent(() => import('../demos/components/gr-data-table/GrDataTableSortableColumnsDemo.vue')),
  'gr-dialog-basic-flow': defineAsyncComponent(() => import('../demos/components/gr-dialog/GrDialogBasicFlowDemo.vue')),
  'gr-dialog-guarded-backdrop': defineAsyncComponent(() => import('../demos/components/gr-dialog/GrDialogGuardedBackdropDemo.vue')),
  'gr-dialog-section-config': defineAsyncComponent(() => import('../demos/components/gr-dialog/GrDialogSectionConfigDemo.vue')),
  'gr-dropdown-alignment-width': defineAsyncComponent(() => import('../demos/components/gr-dropdown/GrDropdownAlignmentDemo.vue')),
  'gr-dropdown-basic-menu': defineAsyncComponent(() => import('../demos/components/gr-dropdown/GrDropdownBasicMenuDemo.vue')),
  'gr-dropdown-persistent-content': defineAsyncComponent(() => import('../demos/components/gr-dropdown/GrDropdownPersistentContentDemo.vue')),
  'gr-dropdown-menu-grouped-actions': defineAsyncComponent(() => import('../demos/components/gr-dropdown-menu/GrDropdownMenuGroupedActionsDemo.vue')),
  'gr-dropdown-menu-quick-actions': defineAsyncComponent(() => import('../demos/components/gr-dropdown-menu/GrDropdownMenuQuickActionsDemo.vue')),
  'gr-dropdown-menu-shortcut-grid': defineAsyncComponent(() => import('../demos/components/gr-dropdown-menu/GrDropdownMenuShortcutGridDemo.vue')),
  'gr-drawer-filter-panel': defineAsyncComponent(() => import('../demos/components/gr-drawer/GrDrawerFilterPanelDemo.vue')),
  'gr-drawer-guarded-size': defineAsyncComponent(() => import('../demos/components/gr-drawer/GrDrawerGuardedSizeDemo.vue')),
  'gr-drawer-left-rail': defineAsyncComponent(() => import('../demos/components/gr-drawer/GrDrawerLeftRailDemo.vue')),
  'gr-empty-state-primary-action': defineAsyncComponent(() => import('../demos/components/gr-empty-state/GrEmptyStateActionDemo.vue')),
  'gr-empty-state-search-flow': defineAsyncComponent(() => import('../demos/components/gr-empty-state/GrEmptyStateSearchDemo.vue')),
  'gr-empty-state-split-layout': defineAsyncComponent(() => import('../demos/components/gr-empty-state/GrEmptyStateSplitLayoutDemo.vue')),
  'gr-file-upload-action-xhr': defineAsyncComponent(() => import('../demos/components/gr-file-upload/GrFileUploadActionXhrDemo.vue')),
  'gr-file-upload-custom-ui': defineAsyncComponent(() => import('../demos/components/gr-file-upload/GrFileUploadCustomUiDemo.vue')),
  'gr-file-upload-disabled-and-limit': defineAsyncComponent(() => import('../demos/components/gr-file-upload/GrFileUploadDisabledDemo.vue')),
  'gr-file-upload-progress': defineAsyncComponent(() => import('../demos/components/gr-file-upload/GrFileUploadProgressDemo.vue')),
  'gr-file-upload-progress-slot': defineAsyncComponent(() => import('../demos/components/gr-file-upload/GrFileUploadProgressSlotDemo.vue')),
  'gr-file-upload-validation': defineAsyncComponent(() => import('../demos/components/gr-file-upload/GrFileUploadValidationDemo.vue')),
  'gr-form-field-basic-label': defineAsyncComponent(() => import('../demos/components/gr-form-field/GrFormFieldBasicDemo.vue')),
  'gr-form-field-custom-label': defineAsyncComponent(() => import('../demos/components/gr-form-field/GrFormFieldCustomLabelDemo.vue')),
  'gr-form-field-error-state': defineAsyncComponent(() => import('../demos/components/gr-form-field/GrFormFieldErrorDemo.vue')),
  'gr-form-file-basic-selection': defineAsyncComponent(() => import('../demos/components/gr-form-file/GrFormFileBasicSelectionDemo.vue')),
  'gr-form-file-custom-validation': defineAsyncComponent(() => import('../demos/components/gr-form-file/GrFormFileValidationDemo.vue')),
  'gr-form-file-multiple-queue': defineAsyncComponent(() => import('../demos/components/gr-form-file/GrFormFileMultipleQueueDemo.vue')),
  'gr-form-section-nested-groups': defineAsyncComponent(() => import('../demos/components/gr-form-section/GrFormSectionNestedGroupsDemo.vue')),
  'gr-form-section-profile-layout': defineAsyncComponent(() => import('../demos/components/gr-form-section/GrFormSectionProfileDemo.vue')),
  'gr-form-section-stacked-flow': defineAsyncComponent(() => import('../demos/components/gr-form-section/GrFormSectionStackedFlowDemo.vue')),
  'gr-icon-inline-copy': defineAsyncComponent(() => import('../demos/components/gr-icon/GrIconInlineCopyDemo.vue')),
  'gr-icon-size-scale': defineAsyncComponent(() => import('../demos/components/gr-icon/GrIconSizeScaleDemo.vue')),
  'gr-icon-status-card': defineAsyncComponent(() => import('../demos/components/gr-icon/GrIconStatusCardDemo.vue')),
  'gr-image-viewer-async-media': defineAsyncComponent(() => import('../demos/components/gr-image-viewer/GrImageViewerAsyncMediaDemo.vue')),
  'gr-image-viewer-gallery': defineAsyncComponent(() => import('../demos/components/gr-image-viewer/GrImageViewerGalleryDemo.vue')),
  'gr-image-viewer-real-size': defineAsyncComponent(() => import('../demos/components/gr-image-viewer/GrImageViewerRealSizeDemo.vue')),
  'gr-image-viewer-toolbar-slot': defineAsyncComponent(() => import('../demos/components/gr-image-viewer/GrImageViewerToolbarSlotDemo.vue')),
  'gr-input-addons-basic': defineAsyncComponent(() => import('../demos/components/gr-input/GrInputAddonsDemo.vue')),
  'gr-input-addon-slots': defineAsyncComponent(() => import('../demos/components/gr-input/GrInputAddonSlotsDemo.vue')),
  'gr-input-size-and-alignment': defineAsyncComponent(() => import('../demos/components/gr-input/GrInputSizingDemo.vue')),
  'gr-input-tag-basic-flow': defineAsyncComponent(() => import('../demos/components/gr-input-tag/GrInputTagBasicFlowDemo.vue')),
  'gr-input-tag-custom-slot': defineAsyncComponent(() => import('../demos/components/gr-input-tag/GrInputTagCustomTagDemo.vue')),
  'gr-input-tag-max-state': defineAsyncComponent(() => import('../demos/components/gr-input-tag/GrInputTagMaxStateDemo.vue')),
  'gr-input-validation-states': defineAsyncComponent(() => import('../demos/components/gr-input/GrInputStatesDemo.vue')),
  'gr-link-builder': defineAsyncComponent(() => import('../demos/components/gr-link/GrLinkBuilderDemo.vue')),
  'gr-link-disabled-states': defineAsyncComponent(() => import('../demos/components/gr-link/GrLinkDisabledStatesDemo.vue')),
  'gr-link-external': defineAsyncComponent(() => import('../demos/components/gr-link/GrLinkExternalDemo.vue')),
  'gr-link-variants': defineAsyncComponent(() => import('../demos/components/gr-link/GrLinkVariantsDemo.vue')),
  'gr-list-empty-state': defineAsyncComponent(() => import('../demos/components/gr-list/GrListEmptyStateDemo.vue')),
  'gr-list-queue-actions': defineAsyncComponent(() => import('../demos/components/gr-list/GrListQueueActionsDemo.vue')),
  'gr-list-settings': defineAsyncComponent(() => import('../demos/components/gr-list/GrListSettingsDemo.vue')),
  'gr-loading-custom-appearance': defineAsyncComponent(() => import('../demos/components/gr-loading/GrLoadingCustomAppearanceDemo.vue')),
  'gr-loading-fullscreen': defineAsyncComponent(() => import('../demos/components/gr-loading/GrLoadingFullscreenDemo.vue')),
  'gr-loading-inline-overlay': defineAsyncComponent(() => import('../demos/components/gr-loading/GrLoadingInlineDemo.vue')),
  'gr-modal-backdrop-guard': defineAsyncComponent(() => import('../demos/components/gr-modal/GrModalBackdropGuardDemo.vue')),
  'gr-modal-basic-flow': defineAsyncComponent(() => import('../demos/components/gr-modal/GrModalBasicFlowDemo.vue')),
  'gr-modal-dialog-service': defineAsyncComponent(() => import('../demos/components/gr-modal/GrModalDialogServiceDemo.vue')),
  'gr-modal-size-switcher': defineAsyncComponent(() => import('../demos/components/gr-modal/GrModalSizeSwitcherDemo.vue')),
  'gr-navbar-actions-slot': defineAsyncComponent(() => import('../demos/components/gr-navbar/GrNavbarActionsDemo.vue')),
  'gr-navbar-menu-toggle': defineAsyncComponent(() => import('../demos/components/gr-navbar/GrNavbarMenuToggleDemo.vue')),
  'gr-navbar-title-slot': defineAsyncComponent(() => import('../demos/components/gr-navbar/GrNavbarTitleSlotDemo.vue')),
  'gr-number-input-alignment-addons': defineAsyncComponent(() => import('../demos/components/gr-number-input/GrNumberInputAlignmentDemo.vue')),
  'gr-number-input-controls': defineAsyncComponent(() => import('../demos/components/gr-number-input/GrNumberInputControlsDemo.vue')),
  'gr-number-input-decimal-separator': defineAsyncComponent(() => import('../demos/components/gr-number-input/GrNumberInputSeparatorDemo.vue')),
  'gr-pagination-basic-flow': defineAsyncComponent(() => import('../demos/components/gr-pagination/GrPaginationBasicFlowDemo.vue')),
  'gr-pagination-page-size-guard': defineAsyncComponent(() => import('../demos/components/gr-pagination/GrPaginationPageSizeDemo.vue')),
  'gr-pagination-table-composition': defineAsyncComponent(() => import('../demos/components/gr-pagination/GrPaginationTableCompositionDemo.vue')),
  'gr-progress-bar-basic-flow': defineAsyncComponent(() => import('../demos/components/gr-progress-bar/GrProgressBarBasicDemo.vue')),
  'gr-progress-bar-clamped-values': defineAsyncComponent(() => import('../demos/components/gr-progress-bar/GrProgressBarClampDemo.vue')),
  'gr-progress-bar-pipeline-stages': defineAsyncComponent(() => import('../demos/components/gr-progress-bar/GrProgressBarPipelineDemo.vue')),
  'gr-prompt-dialog-optional-value': defineAsyncComponent(() => import('../demos/components/gr-prompt-dialog/GrPromptDialogOptionalValueDemo.vue')),
  'gr-prompt-dialog-rename-flow': defineAsyncComponent(() => import('../demos/components/gr-prompt-dialog/GrPromptDialogRenameDemo.vue')),
  'gr-prompt-dialog-reset-flow': defineAsyncComponent(() => import('../demos/components/gr-prompt-dialog/GrPromptDialogResetFlowDemo.vue')),
  'gr-prompt-dialog-service-link': defineAsyncComponent(() => import('../demos/components/gr-confirm-dialog/GrDialogServiceLinkDemo.vue')),
  'gr-radio-button-variant': defineAsyncComponent(() => import('../demos/components/gr-radio/GrRadioButtonVariantDemo.vue')),
  'gr-radio-group-button-variant': defineAsyncComponent(() => import('../demos/components/gr-radio-group/GrRadioGroupButtonDemo.vue')),
  'gr-radio-group-custom-slots': defineAsyncComponent(() => import('../demos/components/gr-radio-group/GrRadioGroupCustomSlotsDemo.vue')),
  'gr-radio-group-inheritance': defineAsyncComponent(() => import('../demos/components/gr-radio/GrRadioGroupInheritanceDemo.vue')),
  'gr-radio-group-options': defineAsyncComponent(() => import('../demos/components/gr-radio-group/GrRadioGroupOptionsDemo.vue')),
  'gr-radio-standalone-controlled': defineAsyncComponent(() => import('../demos/components/gr-radio/GrRadioStandaloneDemo.vue')),
  'gr-segmented-basic-pills': defineAsyncComponent(() => import('../demos/components/gr-segmented/GrSegmentedBasicDemo.vue')),
  'gr-segmented-button-variant': defineAsyncComponent(() => import('../demos/components/gr-segmented/GrSegmentedButtonDemo.vue')),
  'gr-segmented-content': defineAsyncComponent(() => import('../demos/components/gr-segmented/GrSegmentedContentDemo.vue')),
  'gr-segmented-states': defineAsyncComponent(() => import('../demos/components/gr-segmented/GrSegmentedStatesDemo.vue')),
  'gr-select-builder': defineAsyncComponent(() => import('../demos/components/gr-select/GrSelectBuilderDemo.vue')),
  'gr-select-custom-value': defineAsyncComponent(() => import('../demos/components/gr-select/GrSelectCustomValueDemo.vue')),
  'gr-select-groups': defineAsyncComponent(() => import('../demos/components/gr-select/GrSelectGroupsDemo.vue')),
  'gr-select-native-modes': defineAsyncComponent(() => import('../demos/components/gr-select/GrSelectModesDemo.vue')),
  'gr-select-panel-multiple': defineAsyncComponent(() => import('../demos/components/gr-select/GrSelectPanelDemo.vue')),
  'gr-sidebar-basic-sections': defineAsyncComponent(() => import('../demos/components/gr-sidebar/GrSidebarBasicSectionsDemo.vue')),
  'gr-sidebar-documentation-nav': defineAsyncComponent(() => import('../demos/components/gr-sidebar/GrSidebarDocumentationNavDemo.vue')),
  'gr-sidebar-filter-rail': defineAsyncComponent(() => import('../demos/components/gr-sidebar/GrSidebarFilterRailDemo.vue')),
  'gr-skeleton-dashboard-layout': defineAsyncComponent(() => import('../demos/components/gr-skeleton/GrSkeletonDashboardDemo.vue')),
  'gr-skeleton-list-placeholder': defineAsyncComponent(() => import('../demos/components/gr-skeleton/GrSkeletonListDemo.vue')),
  'gr-skeleton-text-card': defineAsyncComponent(() => import('../demos/components/gr-skeleton/GrSkeletonTextCardDemo.vue')),
  'gr-switch-builder': defineAsyncComponent(() => import('../demos/components/gr-switch/GrSwitchBuilderDemo.vue')),
  'gr-switch-custom-colors': defineAsyncComponent(() => import('../demos/components/gr-switch/GrSwitchColorsDemo.vue')),
  'gr-switch-disabled-labeled': defineAsyncComponent(() => import('../demos/components/gr-switch/GrSwitchDisabledDemo.vue')),
  'gr-switch-size-scale': defineAsyncComponent(() => import('../demos/components/gr-switch/GrSwitchSizesDemo.vue')),
  'gr-table-basic-rows': defineAsyncComponent(() => import('../demos/components/gr-table/GrTableBasicRowsDemo.vue')),
  'gr-table-empty-state': defineAsyncComponent(() => import('../demos/components/gr-table/GrTableEmptyStateDemo.vue')),
  'gr-table-loading-state': defineAsyncComponent(() => import('../demos/components/gr-table/GrTableLoadingStateDemo.vue')),
  'gr-response-error-banner-form': defineAsyncComponent(() => import('../demos/components/gr-response-error-banner/GrFormErrorBannerDemo.vue')),
  'gr-response-error-banner-kind-filter': defineAsyncComponent(() => import('../demos/components/gr-response-error-banner/GrResponseErrorBannerKindFilterDemo.vue')),
  'gr-response-error-banner-presets': defineAsyncComponent(() => import('../demos/components/gr-response-error-banner/GrResponseErrorBannerPresetsDemo.vue')),
  'gr-response-error-banner-upload': defineAsyncComponent(() => import('../demos/components/gr-response-error-banner/GrUploadErrorBannerDemo.vue')),
  'gr-tabs-badge-navigation': defineAsyncComponent(() => import('../demos/components/gr-tabs/GrTabsBadgeDemo.vue')),
  'gr-tabs-basic-switch': defineAsyncComponent(() => import('../demos/components/gr-tabs/GrTabsBasicSwitchDemo.vue')),
  'gr-tabs-panel-layout': defineAsyncComponent(() => import('../demos/components/gr-tabs/GrTabsPanelLayoutDemo.vue')),
  'gr-textarea-disabled-state': defineAsyncComponent(() => import('../demos/components/gr-textarea/GrTextareaDisabledDemo.vue')),
  'gr-textarea-rows-layout': defineAsyncComponent(() => import('../demos/components/gr-textarea/GrTextareaRowsDemo.vue')),
  'gr-textarea-validation-states': defineAsyncComponent(() => import('../demos/components/gr-textarea/GrTextareaStatesDemo.vue')),
  'gr-toaster-builder': defineAsyncComponent(() => import('../demos/components/gr-toaster/GrToasterBuilderDemo.vue')),
  'gr-toaster-queue-flow': defineAsyncComponent(() => import('../demos/components/gr-toaster/GrToasterQueueDemo.vue')),
  'gr-toaster-sticky-host': defineAsyncComponent(() => import('../demos/components/gr-toaster/GrToasterStickyDemo.vue')),
  'gr-tree-drag-and-slot': defineAsyncComponent(() => import('../demos/components/gr-tree/GrTreeDragAndSlotDemo.vue')),
  'gr-tree-expanded-state': defineAsyncComponent(() => import('../demos/components/gr-tree/GrTreeExpandedStateDemo.vue')),
  'gr-tree-filtering': defineAsyncComponent(() => import('../demos/components/gr-tree/GrTreeFilteringDemo.vue')),
  'gr-tree-select-custom-slots': defineAsyncComponent(() => import('../demos/components/gr-tree-select/GrTreeSelectCustomSlotsDemo.vue')),
  'gr-tree-select-multiple-filter': defineAsyncComponent(() => import('../demos/components/gr-tree-select/GrTreeSelectMultipleFilterDemo.vue')),
  'gr-tree-select-path-display': defineAsyncComponent(() => import('../demos/components/gr-tree-select/GrTreeSelectPathDisplayDemo.vue')),
  'gr-tooltip-custom-tone': defineAsyncComponent(() => import('../demos/components/gr-tooltip/GrTooltipToneDemo.vue')),
  'gr-tooltip-custom-trigger': defineAsyncComponent(() => import('../demos/components/gr-tooltip/GrTooltipCustomTriggerDemo.vue')),
  'gr-tooltip-inline-help': defineAsyncComponent(() => import('../demos/components/gr-tooltip/GrTooltipInlineHelpDemo.vue')),
} as const

const componentEntity = computed(() => {
  return getShowcaseComponentBySlug(String(route.params.componentSlug ?? ''))
})

const componentDoc = computed(() => {
  if (!componentEntity.value)
    return undefined

  return getShowcaseComponentDoc(componentEntity.value)
})

// Тексты example-карточек живут в `*.examples.ts` как fallback, а переводы —
// в блоке `components.<Name>.examples.<id>.{title,description,note}`. Если ключа
// нет (компонент ещё не локализован) — показываем исходную строку из examples.ts.
const localizedExamples = computed(() => {
  const doc = componentDoc.value
  const name = componentEntity.value?.name

  if (!doc || !name)
    return []

  return doc.examples.map((example) => {
    const baseKey = `components.${name}.examples.${example.id}`
    const translate = <T extends string | undefined>(field: string, fallback: T): string | T => {
      const key = `${baseKey}.${field}`
      const result = t(key)
      return result === key ? fallback : result
    }

    return {
      ...example,
      title: translate('title', example.title),
      description: translate('description', example.description),
      note: translate('note', example.note),
    }
  })
})

const accessibilityItems = computed(() => createAccessibilityItems(componentEntity.value, t))
const dependencyItems = computed(() => createDependencyItems(componentEntity.value, t))
const relatedLinks = computed(() => createRelatedLinks(componentEntity.value, t))
const componentsPage = computed(() => localizePageByName('components'))
const componentSummary = computed(() =>
  componentEntity.value ? localizeEntitySummary(componentEntity.value) : '',
)

function resolvePreviewComponent(previewKey?: string) {
  if (!previewKey)
    return undefined

  return previewRegistry[previewKey as keyof typeof previewRegistry]
}

watch(componentEntity, () => {
  setActiveI18nBlock(componentEntity.value ? 'components.' + componentEntity.value.name : null)
}, {immediate: true})

onUnmounted(() => {
  setActiveI18nBlock(null)
})
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
          {{ componentSummary }}
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
            v-for="example in localizedExamples"
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
        <InfoSectionCard :title="t('showcase.detailPage.info.accessibilityTitle')" :items="accessibilityItems"
                         variant="list"/>
        <InfoSectionCard :title="t('showcase.detailPage.info.dependenciesTitle')" :items="dependencyItems"
                         variant="chips"/>
        <InfoSectionCard :title="t('showcase.detailPage.info.relatedLinksTitle')" :links="relatedLinks"
                         variant="links"/>
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