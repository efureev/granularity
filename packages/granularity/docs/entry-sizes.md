# Вес гранулярных импортов

> Сгенерировано `yarn sizes:docs` по собранному `dist` пакета `@feugene/granularity` 0.38.0.
> Править руками бесполезно — правка потеряется на следующей сборке.

Сколько приезжает потребителю, взявшему один подпуть: gzip самого entry и всего, что он тянет
из `dist`. Общий код лежит в отдельных чанках, поэтому вес самого файла entry ничего не говорит.

**Складывать эти числа нельзя.** Общий чанк посчитан в каждой строке заново, а платится один раз: сумма 5 самых тяжёлых строк даёт 381.7 kB, а вместе они весят 171.1 kB. Вес набора считается объединением — так его и считает `yarn sizes`.

Это верхняя граница: бандлер приложения трясёт дерево дальше и минифицирует повторно.

| Компонент | gzip | файлов | от бареля |
| --- | ---: | ---: | ---: |
| `GrDialogService` | 89.3 kB | 44 | 16 % |
| `GrPromptDialog` | 78.6 kB | 42 | 14 % |
| `GrPagination` | 76.1 kB | 45 | 14 % |
| `GrTreeSelect` | 70.3 kB | 41 | 13 % |
| `GrSelect` | 67.4 kB | 41 | 12 % |
| `GrColorPicker` | 64.6 kB | 35 | 12 % |
| `GrJsonViewer` | 58.1 kB | 35 | 11 % |
| `GrAutocomplete` | 56.3 kB | 37 | 10 % |
| `GrConfirmDialog` | 53.2 kB | 28 | 10 % |
| `GrContextMenu` | 50.1 kB | 26 | 9 % |
| `GrDataTable` | 50.0 kB | 31 | 9 % |
| `GrCommandPalette` | 49.6 kB | 27 | 9 % |
| `GrDropdownMenu` | 48.8 kB | 27 | 9 % |
| `GrImageViewer` | 42.2 kB | 25 | 8 % |
| `GrDropdown` | 41.3 kB | 23 | 8 % |
| `GrDialog` | 37.8 kB | 24 | 7 % |
| `GrPopover` | 36.9 kB | 19 | 7 % |
| `GrDrawer` | 36.6 kB | 24 | 7 % |
| `GrTree` | 36.1 kB | 22 | 7 % |
| `GrInputTag` | 33.7 kB | 25 | 6 % |
| `GrToaster` | 31.7 kB | 25 | 6 % |
| `GrFileUpload` | 31.0 kB | 21 | 6 % |
| `GrModal` | 29.2 kB | 17 | 5 % |
| `GrFormFile` | 27.4 kB | 23 | 5 % |
| `GrResponseErrorBanner` | 26.2 kB | 14 | 5 % |
| `GrTooltip` | 26.0 kB | 18 | 5 % |
| `GrSortableList` | 23.8 kB | 15 | 4 % |
| `GrList` | 22.5 kB | 16 | 4 % |
| `GrCodeBlock` | 20.8 kB | 16 | 4 % |
| `GrNumberInput` | 20.5 kB | 18 | 4 % |
| `GrBreadcrumbs` | 19.5 kB | 13 | 4 % |
| `GrSidebar` | 19.0 kB | 16 | 4 % |
| `GrCollapse` | 18.8 kB | 14 | 3 % |
| `GrStatistic` | 18.2 kB | 14 | 3 % |
| `GrRadioGroup` | 17.3 kB | 14 | 3 % |
| `GrTabs` | 16.0 kB | 11 | 3 % |
| `GrSlider` | 15.4 kB | 13 | 3 % |
| `GrChip` | 15.4 kB | 13 | 3 % |
| `GrNavbar` | 15.4 kB | 14 | 3 % |
| `GrSegmented` | 15.1 kB | 10 | 3 % |
| `GrSteps` | 14.7 kB | 11 | 3 % |
| `GrInput` | 14.6 kB | 13 | 3 % |
| `GrDelta` | 14.0 kB | 11 | 3 % |
| `GrForm` | 13.7 kB | 8 | 3 % |
| `GrTimeline` | 13.6 kB | 11 | 3 % |
| `GrKbd` | 12.6 kB | 9 | 2 % |
| `GrCheckboxGroup` | 12.2 kB | 11 | 2 % |
| `GrLink` | 12.2 kB | 11 | 2 % |
| `GrTextarea` | 11.9 kB | 12 | 2 % |
| `GrTable` | 11.7 kB | 11 | 2 % |
| `GrAvatar` | 11.7 kB | 9 | 2 % |
| `GrRating` | 11.4 kB | 10 | 2 % |
| `GrRadio` | 11.3 kB | 8 | 2 % |
| `GrButton` | 11.0 kB | 11 | 2 % |
| `GrFilePreview` | 10.5 kB | 7 | 2 % |
| `GrSwitch` | 10.4 kB | 10 | 2 % |
| `GrChipGroup` | 10.4 kB | 10 | 2 % |
| `GrLoading` | 10.3 kB | 12 | 2 % |
| `GrCheckbox` | 10.2 kB | 10 | 2 % |
| `GrEmptyState` | 10.1 kB | 10 | 2 % |
| `GrSplitter` | 10.1 kB | 9 | 2 % |
| `GrProgressCircle` | 10.1 kB | 9 | 2 % |
| `GrFormField` | 9.8 kB | 10 | 2 % |
| `GrAlert` | 9.6 kB | 9 | 2 % |
| `GrBottomNav` | 8.9 kB | 7 | 2 % |
| `GrBadge` | 8.5 kB | 10 | 2 % |
| `GrCard` | 8.3 kB | 5 | 2 % |
| `GrDescriptionList` | 7.8 kB | 5 | 1 % |
| `GrConfigProvider` | 7.4 kB | 6 | 1 % |
| `GrProgressBar` | 7.1 kB | 7 | 1 % |
| `GrBadgeWrap` | 6.3 kB | 7 | 1 % |
| `GrIcon` | 6.2 kB | 7 | 1 % |
| `GrDivider` | 6.1 kB | 5 | 1 % |
| `GrFormSection` | 5.2 kB | 5 | < 1 % |
| `GrValue` | 2.7 kB | 4 | < 1 % |
| `GrSkeleton` | 1.9 kB | 4 | < 1 % |
| `GrTabPanels` | 1.9 kB | 3 | < 1 % |
| `GrButtonGroup` | 1.8 kB | 5 | < 1 % |

Весь пакет из корня — 542.9 kB.
