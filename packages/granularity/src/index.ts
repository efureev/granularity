// <granularity:components> — блок генерируется `yarn generate:registry` из `src/components/`
export * from './components/GrAlert'
export * from './components/GrAutocomplete'
export * from './components/GrAvatar'
export * from './components/GrBadge'
export * from './components/GrBadgeWrap'
export * from './components/GrBottomNav'
export * from './components/GrBreadcrumbs'
export * from './components/GrButton'
export * from './components/GrButtonGroup'
export * from './components/GrCard'
export * from './components/GrCheckbox'
export * from './components/GrCheckboxGroup'
export * from './components/GrCollapse'
export * from './components/GrColorPicker'
export * from './components/GrCommandPalette'
export * from './components/GrConfigProvider'
export * from './components/GrConfirmDialog'
export * from './components/GrDataTable'
export * from './components/GrDialog'
export * from './components/GrDialogService'
export * from './components/GrDivider'
export * from './components/GrDrawer'
export * from './components/GrDropdown'
export * from './components/GrDropdownMenu'
export * from './components/GrEmptyState'
export * from './components/GrFileUpload'
export * from './components/GrForm'
export * from './components/GrFormField'
export * from './components/GrFormFile'
export * from './components/GrFormSection'
export * from './components/GrIcon'
export * from './components/GrImageViewer'
export * from './components/GrInput'
export * from './components/GrInputTag'
export * from './components/GrKbd'
export * from './components/GrLink'
export * from './components/GrList'
export * from './components/GrLoading'
export * from './components/GrModal'
export * from './components/GrNavbar'
export * from './components/GrNumberInput'
export * from './components/GrPagination'
export * from './components/GrPopover'
export * from './components/GrProgressBar'
export * from './components/GrPromptDialog'
export * from './components/GrRadio'
export * from './components/GrRadioGroup'
export * from './components/GrRating'
export * from './components/GrResponseErrorBanner'
export * from './components/GrSegmented'
export * from './components/GrSelect'
export * from './components/GrSidebar'
export * from './components/GrSkeleton'
export * from './components/GrSlider'
export * from './components/GrStatistic'
export * from './components/GrSwitch'
export * from './components/GrTable'
export * from './components/GrTabPanels'
export * from './components/GrTabs'
export * from './components/GrTextarea'
export * from './components/GrTimeline'
export * from './components/GrToaster'
export * from './components/GrTooltip'
export * from './components/GrTree'
export * from './components/GrTreeSelect'
// </granularity:components>

// Runtime composables, публикуемые пакетом через root-barrel
// Примитивы оверлеев: на них построены все всплывающие компоненты пакета, и
// потребитель строит свои поповеры/меню на тех же — иначе его слои разъедутся
// с библиотечными по Esc и по позиционированию.
export { useDismissible } from './composables/useDismissible'
export type { UseDismissibleOptions } from './composables/useDismissible'
export { useFocusTrap } from './composables/useFocusTrap'
export type { UseFocusTrapOptions } from './composables/useFocusTrap'
export { usePortalTarget } from './composables/usePortalTarget'
export type { PortalTarget } from './composables/usePortalTarget'
export { useOverlayLayer } from './composables/useOverlayLayer'
export type { OverlayLayerHandle, UseOverlayLayerOptions } from './composables/useOverlayLayer'
export { useFloating } from './composables/useFloating'
export type { UseFloatingOptions, UseFloatingPlacement, UseFloatingReturn } from './composables/useFloating'
// Общий живой регион: объявить событие скринридеру из любого места приложения.
export { useAnnouncer } from './composables/useAnnouncer'
export type { GrAnnounceOptions, GrAnnouncer, GrAnnouncerPoliteness } from './composables/useAnnouncer'
// Виртуализация длинного списка: геометрия окна без своей разметки.
export { useVirtualList } from './composables/useVirtualList'
export type { GrVirtualAlign, UseVirtualListOptions, UseVirtualListReturn } from './composables/useVirtualList'
// Контракт форм-контрола: сведение собственных пропов с контекстом `GrFormField`.
// Публичен ради сторонних контролов — без него контракт пакета не выполнить.
export { useGrFormControl } from './composables/useGrFormControl'
export type { GrFormControlProps, GrFormControlState } from './composables/useGrFormControl'
export { GRANULARITY_THEME_STATE, granularityThemePlugin, initThemeEarly, useTheme } from './composables/useTheme'
export type { ThemeName, UseThemeOptions } from './composables/useTheme'
export { GRANULARITY_TOAST_STATE, granularityToastPlugin, useToast } from './composables/useToast'
export type {
  GranularityToastPluginOptions,
  GrToastTone,
  Toast,
  ToastInput,
  ToastPromiseMessages,
  ToastState,
} from './composables/useToast'
// Единый перечень дизайн-тонов для прикладного кода: `GR_TONES`/`GrTone`.
// Используется как источник истины и для типов, и для рантайм‑итераций
// (валидация, фильтры, генерация safelist).
export { GR_TONES } from './components/shared/tones'
export type { GrTone } from './components/shared/tones'

// File validation — реэкспортируем типы, чтобы прикладной код мог писать
// `import type { FileValidationIssue } from '@feugene/granularity'` без
// дополнительного subpath‑импорта. Сами раннеры/валидаторы доступны из
// `@feugene/granularity/fileValidation`.
export type * from './fileValidation/types'

// Публичные директивы пакета и фабрика `createLoading` — реэкспорт
// из root-barrel, чтобы прикладной код мог писать `import { vHotkey,
// createLoading } from '@feugene/granularity'` без subpath-импорта.
export * from './directives'
