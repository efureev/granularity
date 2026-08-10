import { defineAsyncComponent } from 'vue'

/**
 * Реестр демо витрины: ключ примера и путь файла относительно `src/demos`.
 *
 * Одна запись на ключ, и из неё берутся обе вещи сразу: компонент превью и его
 * исходник для сниппета под превью. Поэтому показать один файл, а отрисовать
 * другой физически невозможно — ровно поэтому у примеров компонентов больше нет
 * поля `code`. Раньше сниппет был копией демо, и 102 копии из 253 разошлись с
 * оригиналом: читатель видел код, которого превью над ним не рисовало.
 *
 * Порядок — алфавитный по ключу, его держит гейт `examplePreviews.test.ts`.
 */
export const demoPathByPreviewKey = {
  'extra-date-basic':                       'extra/granularity-datepicker/GrDatePickerBasicDemo.vue',
  'extra-date-range':                       'extra/granularity-datepicker/GrDateRangePickerDemo.vue',
  'extra-datepicker-localized':             'extra/granularity-datepicker/GrDateTimePickerLocalizedDemo.vue',
  'extra-datepicker-modes':                 'extra/granularity-datepicker/GrDateTimePickerModesDemo.vue',
  'extra-time-basic':                       'extra/granularity-datepicker/GrTimePickerBasicDemo.vue',
  'gr-alert-actions':                       'components/gr-alert/GrAlertActionsDemo.vue',
  'gr-alert-closable-flow':                 'components/gr-alert/GrAlertClosableDemo.vue',
  'gr-alert-custom-colors':                 'components/gr-alert/GrAlertCustomColorsDemo.vue',
  'gr-alert-variant-matrix':                'components/gr-alert/GrAlertVariantsDemo.vue',
  'gr-autocomplete-addons':                 'components/gr-autocomplete/GrAutocompleteAddonsDemo.vue',
  'gr-autocomplete-async':                  'components/gr-autocomplete/GrAutocompleteAsyncDemo.vue',
  'gr-autocomplete-basic':                  'components/gr-autocomplete/GrAutocompleteBasicDemo.vue',
  'gr-autocomplete-multiple':               'components/gr-autocomplete/GrAutocompleteMultipleDemo.vue',
  'gr-autocomplete-virtual':                'components/gr-autocomplete/GrAutocompleteVirtualDemo.vue',
  'gr-avatar-image-fallback':               'components/gr-avatar/GrAvatarImageFallbackDemo.vue',
  'gr-avatar-size-shape':                   'components/gr-avatar/GrAvatarSizeShapeDemo.vue',
  'gr-avatar-team-row':                     'components/gr-avatar/GrAvatarTeamRowDemo.vue',
  'gr-badge-builder':                       'components/gr-badge/GrBadgeBuilderDemo.vue',
  'gr-badge-size-radius':                   'components/gr-badge/GrBadgeSizeRadiusDemo.vue',
  'gr-badge-toolbar-filters':               'components/gr-badge/GrBadgeToolbarFiltersDemo.vue',
  'gr-badge-variant-scale':                 'components/gr-badge/GrBadgeVariantScaleDemo.vue',
  'gr-badge-wrap-counter':                  'components/gr-badge-wrap/GrBadgeWrapCounterDemo.vue',
  'gr-badge-wrap-dot-status':               'components/gr-badge-wrap/GrBadgeWrapDotStatusDemo.vue',
  'gr-badge-wrap-tab-notification':         'components/gr-badge-wrap/GrBadgeWrapTabNotificationDemo.vue',
  'gr-bottom-nav-custom-item':              'components/gr-bottom-nav/GrBottomNavCustomItemDemo.vue',
  'gr-bottom-nav-basic-flow':               'components/gr-bottom-nav/GrBottomNavBasicFlowDemo.vue',
  'gr-bottom-nav-external-state':           'components/gr-bottom-nav/GrBottomNavExternalStateDemo.vue',
  'gr-bottom-nav-mobile-shell':             'components/gr-bottom-nav/GrBottomNavMobileShellDemo.vue',
  'gr-breadcrumbs-auto-collapse':           'components/gr-breadcrumbs/GrBreadcrumbsAutoCollapseDemo.vue',
  'gr-breadcrumbs-basic':                   'components/gr-breadcrumbs/GrBreadcrumbsBasicDemo.vue',
  'gr-breadcrumbs-collapsed':               'components/gr-breadcrumbs/GrBreadcrumbsCollapsedDemo.vue',
  'gr-breadcrumbs-icons':                   'components/gr-breadcrumbs/GrBreadcrumbsIconsDemo.vue',
  'gr-button-builder':                      'components/gr-button/GrButtonBuilderDemo.vue',
  'gr-button-group-filter-rail':            'components/gr-button-group/GrButtonGroupFilterRailDemo.vue',
  'gr-button-group-orientation':            'components/gr-button-group/GrButtonGroupOrientationDemo.vue',
  'gr-button-group-segmented':              'components/gr-button-group/GrButtonGroupSegmentedDemo.vue',
  'gr-button-group-shared-style':           'components/gr-button-group/GrButtonGroupSharedStyleDemo.vue',
  'gr-button-group-toolbar':                'components/gr-button-group/GrButtonGroupToolbarDemo.vue',
  'gr-button-slots-and-states':             'components/gr-button/GrButtonSlotsDemo.vue',
  'gr-button-state-matrix':                 'components/gr-button/GrButtonMatrixDemo.vue',
  'gr-card-action-panel':                   'components/gr-card/GrCardActionPanelDemo.vue',
  'gr-card-basic-surface':                  'components/gr-card/GrCardBasicSurfaceDemo.vue',
  'gr-card-kpi-grid':                       'components/gr-card/GrCardKpiGridDemo.vue',
  'gr-card-variants':                       'components/gr-card/GrCardVariantsDemo.vue',
  'gr-checkbox-group-basic':                'components/gr-checkbox-group/GrCheckboxGroupBasicDemo.vue',
  'gr-checkbox-group-form':                 'components/gr-checkbox-group/GrCheckboxGroupFormDemo.vue',
  'gr-checkbox-interactive-label':          'components/gr-checkbox/GrCheckboxInteractiveLabelDemo.vue',
  'gr-checkbox-native-form':                'components/gr-checkbox/GrCheckboxNativeFormDemo.vue',
  'gr-checkbox-sizes':                      'components/gr-checkbox/GrCheckboxSizesDemo.vue',
  'gr-checkbox-state-matrix':               'components/gr-checkbox/GrCheckboxStatesDemo.vue',
  'gr-collapse-accordion-flow':             'components/gr-collapse/GrCollapseAccordionDemo.vue',
  'gr-collapse-borderless':                 'components/gr-collapse/GrCollapseBorderlessDemo.vue',
  'gr-collapse-empty':                      'components/gr-collapse/GrCollapseEmptyDemo.vue',
  'gr-collapse-disabled-state':             'components/gr-collapse/GrCollapseDisabledStateDemo.vue',
  'gr-collapse-guard':                      'components/gr-collapse/GrCollapseGuardDemo.vue',
  'gr-collapse-multi-section':              'components/gr-collapse/GrCollapseMultiSectionDemo.vue',
  'gr-command-palette-async':               'components/gr-command-palette/GrCommandPaletteAsyncDemo.vue',
  'gr-command-palette-basic':               'components/gr-command-palette/GrCommandPaletteBasicDemo.vue',
  'gr-command-palette-recent':              'components/gr-command-palette/GrCommandPaletteRecentDemo.vue',
  'gr-command-palette-virtual':             'components/gr-command-palette/GrCommandPaletteVirtualDemo.vue',
  'gr-config-provider-defaults':            'components/gr-config-provider/GrConfigProviderDefaultsDemo.vue',
  'gr-config-provider-dialog':              'components/gr-config-provider/GrConfigProviderDialogDemo.vue',
  'gr-config-provider-nested':              'components/gr-config-provider/GrConfigProviderNestedDemo.vue',
  'gr-config-provider-read':                'components/gr-config-provider/GrConfigProviderReadDemo.vue',
  'gr-config-provider-size':                'components/gr-config-provider/GrConfigProviderSizeDemo.vue',
  'gr-config-provider-theme-island':        'components/gr-config-provider/GrConfigProviderThemeIslandDemo.vue',
  'gr-confirm-dialog-async-confirm':        'components/gr-confirm-dialog/GrConfirmDialogAsyncConfirmDemo.vue',
  'gr-confirm-dialog-button-matrix':        'components/gr-confirm-dialog/GrConfirmDialogButtonMatrixDemo.vue',
  'gr-confirm-dialog-custom-body':          'components/gr-confirm-dialog/GrConfirmDialogCustomBodyDemo.vue',
  'gr-confirm-dialog-destructive':          'components/gr-confirm-dialog/GrConfirmDialogDestructiveDemo.vue',
  'gr-confirm-dialog-service-link':         'components/gr-confirm-dialog/GrDialogServiceLinkDemo.vue',
  'gr-data-table-controlled-sort':          'components/gr-data-table/GrDataTableControlledSortDemo.vue',
  'gr-data-table-custom-cells':             'components/gr-data-table/GrDataTableCustomCellsDemo.vue',
  'gr-data-table-filtered-view':            'components/gr-data-table/GrDataTableFilteredViewDemo.vue',
  'gr-data-table-row-guards':               'components/gr-data-table/GrDataTableRowGuardsDemo.vue',
  'gr-data-table-selection-sticky':         'components/gr-data-table/GrDataTableSelectionStickyDemo.vue',
  'gr-data-table-sizes':                    'components/gr-data-table/GrDataTableSizesDemo.vue',
  'gr-data-table-sortable-columns':         'components/gr-data-table/GrDataTableSortableColumnsDemo.vue',
  'gr-data-table-virtual':                  'components/gr-data-table/GrDataTableVirtualDemo.vue',
  'gr-dialog-basic-flow':                   'components/gr-dialog/GrDialogBasicFlowDemo.vue',
  'gr-dialog-guarded-backdrop':             'components/gr-dialog/GrDialogGuardedBackdropDemo.vue',
  'gr-dialog-scrollable-body':              'components/gr-dialog/GrDialogScrollableBodyDemo.vue',
  'gr-dialog-section-config':               'components/gr-dialog/GrDialogSectionConfigDemo.vue',
  'gr-divider-basic':                       'components/gr-divider/GrDividerBasicDemo.vue',
  'gr-divider-variants':                    'components/gr-divider/GrDividerVariantsDemo.vue',
  'gr-drawer-bottom-sheet':                 'components/gr-drawer/GrDrawerBottomSheetDemo.vue',
  'gr-drawer-custom-header':                'components/gr-drawer/GrDrawerCustomHeaderDemo.vue',
  'gr-drawer-filter-panel':                 'components/gr-drawer/GrDrawerFilterPanelDemo.vue',
  'gr-drawer-guarded-size':                 'components/gr-drawer/GrDrawerGuardedSizeDemo.vue',
  'gr-drawer-left-rail':                    'components/gr-drawer/GrDrawerLeftRailDemo.vue',
  'gr-drawer-non-modal':                    'components/gr-drawer/GrDrawerNonModalDemo.vue',
  'gr-drawer-persistent-form':              'components/gr-drawer/GrDrawerPersistentFormDemo.vue',
  'gr-dropdown-alignment-width':            'components/gr-dropdown/GrDropdownAlignmentDemo.vue',
  'gr-dropdown-basic-menu':                 'components/gr-dropdown/GrDropdownBasicMenuDemo.vue',
  'gr-dropdown-hover':                      'components/gr-dropdown/GrDropdownHoverDemo.vue',
  'gr-dropdown-menu-declarative':           'components/gr-dropdown-menu/GrDropdownMenuDeclarativeDemo.vue',
  'gr-dropdown-menu-grouped-actions':       'components/gr-dropdown-menu/GrDropdownMenuGroupedActionsDemo.vue',
  'gr-dropdown-menu-quick-actions':         'components/gr-dropdown-menu/GrDropdownMenuQuickActionsDemo.vue',
  'gr-dropdown-menu-shortcut-grid':         'components/gr-dropdown-menu/GrDropdownMenuShortcutGridDemo.vue',
  'gr-dropdown-persistent-content':         'components/gr-dropdown/GrDropdownPersistentContentDemo.vue',
  'gr-empty-state-primary-action':          'components/gr-empty-state/GrEmptyStateActionDemo.vue',
  'gr-empty-state-search-flow':             'components/gr-empty-state/GrEmptyStateSearchDemo.vue',
  'gr-empty-state-split-layout':            'components/gr-empty-state/GrEmptyStateSplitLayoutDemo.vue',
  'gr-file-upload-action-xhr':              'components/gr-file-upload/GrFileUploadActionXhrDemo.vue',
  'gr-file-upload-custom-ui':               'components/gr-file-upload/GrFileUploadCustomUiDemo.vue',
  'gr-file-upload-disabled-and-limit':      'components/gr-file-upload/GrFileUploadDisabledDemo.vue',
  'gr-file-upload-per-file':                'components/gr-file-upload/GrFileUploadPerFileDemo.vue',
  'gr-file-upload-progress':                'components/gr-file-upload/GrFileUploadProgressDemo.vue',
  'gr-file-upload-progress-slot':           'components/gr-file-upload/GrFileUploadProgressSlotDemo.vue',
  'gr-file-upload-retry':                   'components/gr-file-upload/GrFileUploadRetryDemo.vue',
  'gr-file-upload-sizes':                   'components/gr-file-upload/GrFileUploadSizesDemo.vue',
  'gr-file-upload-validation':              'components/gr-file-upload/GrFileUploadValidationDemo.vue',
  'gr-form-custom-control':                 'components/gr-form/GrFormCustomControlDemo.vue',
  'gr-form-editing':                        'components/gr-form/GrFormEditingDemo.vue',
  'gr-form-field-basic-label':              'components/gr-form-field/GrFormFieldBasicDemo.vue',
  'gr-form-field-context':                  'components/gr-form-field/GrFormFieldContextDemo.vue',
  'gr-form-field-custom-control':           'components/gr-form-field/GrFormFieldCustomControlDemo.vue',
  'gr-form-field-custom-label':             'components/gr-form-field/GrFormFieldCustomLabelDemo.vue',
  'gr-form-field-error-state':              'components/gr-form-field/GrFormFieldErrorDemo.vue',
  'gr-form-field-inline-label':             'components/gr-form-field/GrFormFieldInlineLabelDemo.vue',
  'gr-form-file-basic-selection':           'components/gr-form-file/GrFormFileBasicSelectionDemo.vue',
  'gr-form-file-custom-validation':         'components/gr-form-file/GrFormFileValidationDemo.vue',
  'gr-form-file-multiple-queue':            'components/gr-form-file/GrFormFileMultipleQueueDemo.vue',
  'gr-form-file-preview':                   'components/gr-form-file/GrFormFilePreviewDemo.vue',
  'gr-form-file-server-errors':             'components/gr-form-file/GrFormFileServerErrorsDemo.vue',
  'gr-form-file-sizes':                     'components/gr-form-file/GrFormFileSizesDemo.vue',
  'gr-form-mixed-controls':                 'components/gr-form/GrFormMixedControlsDemo.vue',
  'gr-form-section-actions':                'components/gr-form-section/GrFormSectionActionsDemo.vue',
  'gr-form-section-bordered':               'components/gr-form-section/GrFormSectionBorderedDemo.vue',
  'gr-form-section-nested-groups':          'components/gr-form-section/GrFormSectionNestedGroupsDemo.vue',
  'gr-form-section-profile-layout':         'components/gr-form-section/GrFormSectionProfileDemo.vue',
  'gr-form-section-stacked-flow':           'components/gr-form-section/GrFormSectionStackedFlowDemo.vue',
  'gr-form-validation':                     'components/gr-form/GrFormValidationDemo.vue',
  'gr-icon-inline-copy':                    'components/gr-icon/GrIconInlineCopyDemo.vue',
  'gr-icon-semantics':                      'components/gr-icon/GrIconSemanticsDemo.vue',
  'gr-icon-size-scale':                     'components/gr-icon/GrIconSizeScaleDemo.vue',
  'gr-icon-status-card':                    'components/gr-icon/GrIconStatusCardDemo.vue',
  'gr-image-viewer-alt-and-append':         'components/gr-image-viewer/GrImageViewerAltAndAppendDemo.vue',
  'gr-image-viewer-async-media':            'components/gr-image-viewer/GrImageViewerAsyncMediaDemo.vue',
  'gr-image-viewer-gallery':                'components/gr-image-viewer/GrImageViewerGalleryDemo.vue',
  'gr-image-viewer-real-size':              'components/gr-image-viewer/GrImageViewerRealSizeDemo.vue',
  'gr-image-viewer-toolbar-slot':           'components/gr-image-viewer/GrImageViewerToolbarSlotDemo.vue',
  'gr-image-viewer-zoom-download':          'components/gr-image-viewer/GrImageViewerZoomDownloadDemo.vue',
  'gr-input-addon-slots':                   'components/gr-input/GrInputAddonSlotsDemo.vue',
  'gr-input-addons-basic':                  'components/gr-input/GrInputAddonsDemo.vue',
  'gr-input-enhancements':                  'components/gr-input/GrInputEnhancementsDemo.vue',
  'gr-input-events-and-loading':            'components/gr-input/GrInputEventsDemo.vue',
  'gr-input-size-and-alignment':            'components/gr-input/GrInputSizingDemo.vue',
  'gr-input-tag-addons':                    'components/gr-input-tag/GrInputTagAddonsDemo.vue',
  'gr-input-tag-basic-flow':                'components/gr-input-tag/GrInputTagBasicFlowDemo.vue',
  'gr-input-tag-custom-slot':               'components/gr-input-tag/GrInputTagCustomTagDemo.vue',
  'gr-input-tag-max-state':                 'components/gr-input-tag/GrInputTagMaxStateDemo.vue',
  'gr-input-tag-validation':                'components/gr-input-tag/GrInputTagValidationDemo.vue',
  'gr-input-validation-states':             'components/gr-input/GrInputStatesDemo.vue',
  'gr-kbd-basic':                           'components/gr-kbd/GrKbdBasicDemo.vue',
  'gr-kbd-hotkey-hints':                    'components/gr-kbd/GrKbdHotkeyHintsDemo.vue',
  'gr-link-builder':                        'components/gr-link/GrLinkBuilderDemo.vue',
  'gr-link-disabled-states':                'components/gr-link/GrLinkDisabledStatesDemo.vue',
  'gr-link-external':                       'components/gr-link/GrLinkExternalDemo.vue',
  'gr-link-variants':                       'components/gr-link/GrLinkVariantsDemo.vue',
  'gr-list-empty-state':                    'components/gr-list/GrListEmptyStateDemo.vue',
  'gr-list-navigation':                     'components/gr-list/GrListNavigationDemo.vue',
  'gr-list-queue-actions':                  'components/gr-list/GrListQueueActionsDemo.vue',
  'gr-list-settings':                       'components/gr-list/GrListSettingsDemo.vue',
  'gr-list-virtual':                        'components/gr-list/GrListVirtualDemo.vue',
  'gr-loading-custom-appearance':           'components/gr-loading/GrLoadingCustomAppearanceDemo.vue',
  'gr-loading-delay-slot':                  'components/gr-loading/GrLoadingDelaySlotDemo.vue',
  'gr-loading-directive':                   'components/gr-loading/GrLoadingDirectiveDemo.vue',
  'gr-loading-fullscreen':                  'components/gr-loading/GrLoadingFullscreenDemo.vue',
  'gr-loading-inline-overlay':              'components/gr-loading/GrLoadingInlineDemo.vue',
  'gr-modal-backdrop-guard':                'components/gr-modal/GrModalBackdropGuardDemo.vue',
  'gr-modal-basic-flow':                    'components/gr-modal/GrModalBasicFlowDemo.vue',
  'gr-modal-dialog-service':                'components/gr-modal/GrModalDialogServiceDemo.vue',
  'gr-modal-scroll-lifecycle':              'components/gr-modal/GrModalScrollLifecycleDemo.vue',
  'gr-modal-size-switcher':                 'components/gr-modal/GrModalSizeSwitcherDemo.vue',
  'gr-navbar-actions-slot':                 'components/gr-navbar/GrNavbarActionsDemo.vue',
  'gr-navbar-menu-toggle':                  'components/gr-navbar/GrNavbarMenuToggleDemo.vue',
  'gr-navbar-title-slot':                   'components/gr-navbar/GrNavbarTitleSlotDemo.vue',
  'gr-number-input-alignment-addons':       'components/gr-number-input/GrNumberInputAlignmentDemo.vue',
  'gr-number-input-controls':               'components/gr-number-input/GrNumberInputControlsDemo.vue',
  'gr-number-input-decimal-separator':      'components/gr-number-input/GrNumberInputSeparatorDemo.vue',
  'gr-number-input-grouping':               'components/gr-number-input/GrNumberInputGroupingDemo.vue',
  'gr-pagination-basic-flow':               'components/gr-pagination/GrPaginationBasicFlowDemo.vue',
  'gr-pagination-compact-jumper':           'components/gr-pagination/GrPaginationCompactJumperDemo.vue',
  'gr-pagination-page-size-guard':          'components/gr-pagination/GrPaginationPageSizeDemo.vue',
  'gr-pagination-sizes':                    'components/gr-pagination/GrPaginationSizesDemo.vue',
  'gr-pagination-table-composition':        'components/gr-pagination/GrPaginationTableCompositionDemo.vue',
  'gr-popover-confirm':                     'components/gr-popover/GrPopoverConfirmDemo.vue',
  'gr-popover-form':                        'components/gr-popover/GrPopoverFormDemo.vue',
  'gr-popover-modal':                       'components/gr-popover/GrPopoverModalDemo.vue',
  'gr-popover-placement':                   'components/gr-popover/GrPopoverPlacementDemo.vue',
  'gr-progress-bar-basic-flow':             'components/gr-progress-bar/GrProgressBarBasicDemo.vue',
  'gr-progress-bar-clamped-values':         'components/gr-progress-bar/GrProgressBarClampDemo.vue',
  'gr-progress-bar-indeterminate':          'components/gr-progress-bar/GrProgressBarIndeterminateDemo.vue',
  'gr-progress-bar-pipeline-stages':        'components/gr-progress-bar/GrProgressBarPipelineDemo.vue',
  'gr-progress-bar-sizes':                  'components/gr-progress-bar/GrProgressBarSizesDemo.vue',
  'gr-progress-bar-value-and-buffer':       'components/gr-progress-bar/GrProgressBarValueBufferDemo.vue',
  'gr-prompt-dialog-multiline-rules':       'components/gr-prompt-dialog/GrPromptDialogMultilineRulesDemo.vue',
  'gr-prompt-dialog-optional-value':        'components/gr-prompt-dialog/GrPromptDialogOptionalValueDemo.vue',
  'gr-prompt-dialog-rename-flow':           'components/gr-prompt-dialog/GrPromptDialogRenameDemo.vue',
  'gr-prompt-dialog-reset-flow':            'components/gr-prompt-dialog/GrPromptDialogResetFlowDemo.vue',
  'gr-prompt-dialog-service-link':          'components/gr-confirm-dialog/GrDialogServiceLinkDemo.vue',
  'gr-radio-button-variant':                'components/gr-radio/GrRadioButtonVariantDemo.vue',
  'gr-radio-descriptions':                  'components/gr-radio/GrRadioDescriptionsDemo.vue',
  'gr-radio-group-button-variant':          'components/gr-radio-group/GrRadioGroupButtonDemo.vue',
  'gr-radio-group-custom-slots':            'components/gr-radio-group/GrRadioGroupCustomSlotsDemo.vue',
  'gr-radio-group-inheritance':             'components/gr-radio/GrRadioGroupInheritanceDemo.vue',
  'gr-radio-group-options':                 'components/gr-radio-group/GrRadioGroupOptionsDemo.vue',
  'gr-radio-standalone-controlled':         'components/gr-radio/GrRadioStandaloneDemo.vue',
  'gr-rating-basic':                        'components/gr-rating/GrRatingBasicDemo.vue',
  'gr-rating-custom':                       'components/gr-rating/GrRatingCustomDemo.vue',
  'gr-rating-half':                         'components/gr-rating/GrRatingHalfDemo.vue',
  'gr-response-error-banner-fallback':      'components/gr-response-error-banner/GrResponseErrorBannerFallbackDemo.vue',
  'gr-response-error-banner-form':          'components/gr-response-error-banner/GrFormErrorBannerDemo.vue',
  'gr-response-error-banner-kind-filter':   'components/gr-response-error-banner/GrResponseErrorBannerKindFilterDemo.vue',
  'gr-response-error-banner-presets':       'components/gr-response-error-banner/GrResponseErrorBannerPresetsDemo.vue',
  'gr-response-error-banner-upload':        'components/gr-response-error-banner/GrUploadErrorBannerDemo.vue',
  'gr-segmented-basic-pills':               'components/gr-segmented/GrSegmentedBasicDemo.vue',
  'gr-segmented-button-variant':            'components/gr-segmented/GrSegmentedButtonDemo.vue',
  'gr-segmented-content':                   'components/gr-segmented/GrSegmentedContentDemo.vue',
  'gr-segmented-states':                    'components/gr-segmented/GrSegmentedStatesDemo.vue',
  'gr-select-addons':                       'components/gr-select/GrSelectAddonsDemo.vue',
  'gr-select-builder':                      'components/gr-select/GrSelectBuilderDemo.vue',
  'gr-select-custom-value':                 'components/gr-select/GrSelectCustomValueDemo.vue',
  'gr-select-filter-loading-tags':          'components/gr-select/GrSelectFilterLoadingTagsDemo.vue',
  'gr-select-groups':                       'components/gr-select/GrSelectGroupsDemo.vue',
  'gr-select-native-modes':                 'components/gr-select/GrSelectModesDemo.vue',
  'gr-select-panel-multiple':               'components/gr-select/GrSelectPanelDemo.vue',
  'gr-select-remote-search':                'components/gr-select/GrSelectRemoteSearchDemo.vue',
  'gr-select-virtual':                      'components/gr-select/GrSelectVirtualDemo.vue',
  'gr-sidebar-basic-sections':              'components/gr-sidebar/GrSidebarBasicSectionsDemo.vue',
  'gr-sidebar-documentation-nav':           'components/gr-sidebar/GrSidebarDocumentationNavDemo.vue',
  'gr-sidebar-filter-rail':                 'components/gr-sidebar/GrSidebarFilterRailDemo.vue',
  'gr-skeleton-dashboard-layout':           'components/gr-skeleton/GrSkeletonDashboardDemo.vue',
  'gr-skeleton-list-placeholder':           'components/gr-skeleton/GrSkeletonListDemo.vue',
  'gr-skeleton-text-card':                  'components/gr-skeleton/GrSkeletonTextCardDemo.vue',
  'gr-slider-basic':                        'components/gr-slider/GrSliderBasicDemo.vue',
  'gr-slider-custom':                       'components/gr-slider/GrSliderCustomDemo.vue',
  'gr-slider-marks':                        'components/gr-slider/GrSliderMarksDemo.vue',
  'gr-slider-range':                        'components/gr-slider/GrSliderRangeDemo.vue',
  'gr-statistic-basic':                     'components/gr-statistic/GrStatisticBasicDemo.vue',
  'gr-statistic-slots':                     'components/gr-statistic/GrStatisticSlotsDemo.vue',
  'gr-statistic-trend':                     'components/gr-statistic/GrStatisticTrendDemo.vue',
  'gr-switch-builder':                      'components/gr-switch/GrSwitchBuilderDemo.vue',
  'gr-switch-custom-colors':                'components/gr-switch/GrSwitchColorsDemo.vue',
  'gr-switch-disabled-labeled':             'components/gr-switch/GrSwitchDisabledDemo.vue',
  'gr-switch-size-scale':                   'components/gr-switch/GrSwitchSizesDemo.vue',
  'gr-tab-panels-basic':                    'components/gr-tab-panels/GrTabPanelsBasicDemo.vue',
  'gr-tab-panels-keep-alive':               'components/gr-tab-panels/GrTabPanelsKeepAliveDemo.vue',
  'gr-table-basic-rows':                    'components/gr-table/GrTableBasicRowsDemo.vue',
  'gr-table-empty-state':                   'components/gr-table/GrTableEmptyStateDemo.vue',
  'gr-table-loading-state':                 'components/gr-table/GrTableLoadingStateDemo.vue',
  'gr-table-sizes':                         'components/gr-table/GrTableSizesDemo.vue',
  'gr-tabs-activation':                     'components/gr-tabs/GrTabsActivationDemo.vue',
  'gr-tabs-badge-navigation':               'components/gr-tabs/GrTabsBadgeDemo.vue',
  'gr-tabs-basic-switch':                   'components/gr-tabs/GrTabsBasicSwitchDemo.vue',
  'gr-tabs-panel-layout':                   'components/gr-tabs/GrTabsPanelLayoutDemo.vue',
  'gr-tabs-sizes':                          'components/gr-tabs/GrTabsSizesDemo.vue',
  'gr-textarea-autosize':                   'components/gr-textarea/GrTextareaAutosizeDemo.vue',
  'gr-textarea-disabled-state':             'components/gr-textarea/GrTextareaDisabledDemo.vue',
  'gr-textarea-rows-layout':                'components/gr-textarea/GrTextareaRowsDemo.vue',
  'gr-textarea-sizes':                      'components/gr-textarea/GrTextareaSizesDemo.vue',
  'gr-textarea-validation-states':          'components/gr-textarea/GrTextareaStatesDemo.vue',
  'gr-toaster-action':                      'components/gr-toaster/GrToasterActionDemo.vue',
  'gr-toaster-action-slot':                 'components/gr-toaster/GrToasterActionSlotDemo.vue',
  'gr-toaster-builder':                     'components/gr-toaster/GrToasterBuilderDemo.vue',
  'gr-toaster-focus-hotkey':                'components/gr-toaster/GrToasterFocusHotkeyDemo.vue',
  'gr-toaster-queue-flow':                  'components/gr-toaster/GrToasterQueueDemo.vue',
  'gr-toaster-sticky-host':                 'components/gr-toaster/GrToasterStickyDemo.vue',
  'gr-tooltip-custom-tone':                 'components/gr-tooltip/GrTooltipToneDemo.vue',
  'gr-tooltip-custom-trigger':              'components/gr-tooltip/GrTooltipCustomTriggerDemo.vue',
  'gr-tooltip-inline-help':                 'components/gr-tooltip/GrTooltipInlineHelpDemo.vue',
  'gr-tooltip-placement':                   'components/gr-tooltip/GrTooltipPlacementDemo.vue',
  'gr-tooltip-sizes':                       'components/gr-tooltip/GrTooltipSizesDemo.vue',
  'gr-tree-checkboxes':                     'components/gr-tree/GrTreeCheckboxesDemo.vue',
  'gr-tree-drag-and-slot':                  'components/gr-tree/GrTreeDragAndSlotDemo.vue',
  'gr-tree-expanded-state':                 'components/gr-tree/GrTreeExpandedStateDemo.vue',
  'gr-tree-filtering':                      'components/gr-tree/GrTreeFilteringDemo.vue',
  'gr-tree-keyboard':                       'components/gr-tree/GrTreeKeyboardDemo.vue',
  'gr-tree-lazy':                           'components/gr-tree/GrTreeLazyDemo.vue',
  'gr-tree-select-addons':                  'components/gr-tree-select/GrTreeSelectAddonsDemo.vue',
  'gr-tree-select-custom-slots':            'components/gr-tree-select/GrTreeSelectCustomSlotsDemo.vue',
  'gr-tree-select-keyboard':                'components/gr-tree-select/GrTreeSelectKeyboardDemo.vue',
  'gr-tree-select-multiple-filter':         'components/gr-tree-select/GrTreeSelectMultipleFilterDemo.vue',
  'gr-tree-select-path-display':            'components/gr-tree-select/GrTreeSelectPathDisplayDemo.vue',
  'gr-tree-sizes':                          'components/gr-tree/GrTreeSizesDemo.vue',
  'gr-tree-virtual':                        'components/gr-tree/GrTreeVirtualDemo.vue',
} as const

export type ShowcaseDemoPreviewKey = keyof typeof demoPathByPreviewKey

/**
 * Оба глоба намеренно по одному шаблону: модуль и его исходник обязаны
 * приезжать из одного файла. Оба ленивые — исходник грузится вместе с демо,
 * когда открыта страница компонента, а не в общий бандл витрины.
 */
const demoModules = import.meta.glob('./**/*.vue')
const demoSources = import.meta.glob('./**/*.{vue,ts}', { query: '?raw', import: 'default' })

function demoPath(previewKey: string | undefined): string | undefined {
  if (!previewKey)
    return undefined

  return demoPathByPreviewKey[previewKey as ShowcaseDemoPreviewKey]
}

export function resolveDemoComponent(previewKey?: string) {
  const path = demoPath(previewKey)
  const loader = path ? demoModules[`./${path}`] : undefined

  return loader ? defineAsyncComponent(loader as () => Promise<never>) : undefined
}

async function loadSource(path: string): Promise<string | undefined> {
  const loader = demoSources[`./${path}`]

  return loader ? (await loader()) as string : undefined
}

/** Соседние файлы демо: `import X from './X.vue'`, `from './useThing'`. */
function localImportsOf(path: string, source: string): string[] {
  const dir = path.slice(0, path.lastIndexOf('/'))

  return [...source.matchAll(/from '\.\/([\w./-]+)'/g)].flatMap((match) => {
    const target = match[1]
    const candidates = /\.\w+$/.test(target) ? [target] : [`${target}.ts`, `${target}.vue`]

    return candidates
      .map(candidate => `${dir}/${candidate}`)
      .filter(candidate => `./${candidate}` in demoSources)
  })
}

/**
 * Исходник демо для сниппета под превью.
 *
 * Демо, собранное из нескольких файлов, приезжает целиком: сначала соседи,
 * потом сам демо-файл. Иначе читатель увидит в разметке `<DialogCaller />` без
 * единого намёка, откуда тот взялся. Формат заголовков — из
 * `.claude/rules/showcase-conventions.md`.
 */
export async function resolveDemoSource(previewKey?: string): Promise<string | undefined> {
  const path = demoPath(previewKey)
  if (!path)
    return undefined

  const source = await loadSource(path)
  if (source === undefined)
    return undefined

  const collected = new Map<string, string>()
  const queue = localImportsOf(path, source)

  while (queue.length > 0) {
    const next = queue.shift() as string
    if (collected.has(next))
      continue

    const dependency = await loadSource(next)
    if (dependency === undefined)
      continue

    collected.set(next, dependency)
    queue.push(...localImportsOf(next, dependency))
  }

  if (collected.size === 0)
    return source.trim()

  const fileName = (value: string) => value.slice(value.lastIndexOf('/') + 1)

  return [...collected.entries(), [path, source] as const]
    .map(([file, content]) => `<!-- ${fileName(file)} -->\n${content.trim()}`)
    .join('\n\n')
}
