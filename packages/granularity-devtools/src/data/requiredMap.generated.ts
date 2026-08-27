/**
 * Обязательные пропы компонентов ядра.
 *
 * **Генерируется** `yarn generate:required-map` из `dist/web-types.json` ядра —
 * править руками бессмысленно, следующая генерация затрёт. Гейт актуальности —
 * `src/__tests__/requiredMap.generated.test.ts`.
 */
export const GR_REQUIRED_PROPS: Record<string, readonly string[]> = {
  GrAutocomplete: ['modelValue'],
  GrBottomNav: ['modelValue', 'items'],
  GrBreadcrumbs: ['items'],
  GrCheckboxGroup: ['modelValue'],
  GrCodeBlock: ['code'],
  GrColorPicker: ['modelValue'],
  GrCommandPalette: ['modelValue'],
  GrConfirmDialog: ['modelValue'],
  GrDataTable: ['rows', 'columns'],
  GrDelta: ['value'],
  GrDescriptionList: ['items'],
  GrDialog: ['modelValue'],
  GrDrawer: ['modelValue'],
  GrForm: ['model'],
  GrFormFile: ['modelValue'],
  GrImageViewer: ['modelValue', 'urlList'],
  GrInputTag: ['modelValue'],
  GrJsonViewer: ['value'],
  GrModal: ['modelValue'],
  GrNumberInput: ['modelValue'],
  GrPagination: ['page', 'pageSize', 'total'],
  GrProgressBar: ['value'],
  GrPromptDialog: ['modelValue', 'value'],
  GrRadio: ['value'],
  GrRadioGroup: ['modelValue'],
  GrRating: ['modelValue'],
  GrResponseErrorBanner: ['error'],
  GrSegmented: ['modelValue', 'options'],
  GrSelect: ['modelValue'],
  GrSlider: ['modelValue'],
  GrSortableList: ['modelValue'],
  GrStatistic: ['value'],
  GrSteps: ['modelValue', 'steps'],
  GrTabPanels: ['modelValue'],
  GrTabs: ['modelValue', 'tabs'],
  GrTextarea: ['modelValue'],
  GrTree: ['data'],
  GrTreeSelect: ['modelValue', 'data'],
}
