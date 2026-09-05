# Вес гранулярных импортов

> Сгенерировано `yarn sizes:docs` по собранному `dist` пакета `@feugene/granularity` 0.47.0.
> Править руками бесполезно — правка потеряется на следующей сборке.

Сколько приезжает потребителю, взявшему один подпуть: gzip самого entry и всего, что он тянет
из `dist`. Общий код лежит в отдельных чанках, поэтому вес самого файла entry ничего не говорит.

**Складывать эти числа нельзя.** Общий чанк посчитан в каждой строке заново, а платится один раз: сумма 5 самых тяжёлых строк даёт 396.0 kB, а вместе они весят 177.4 kB. Вес набора считается объединением — так его и считает `yarn sizes`.

Это верхняя граница: бандлер приложения трясёт дерево дальше и минифицирует повторно.

| Компонент | gzip | файлов | от бареля |
| --- | ---: | ---: | ---: |
| `GrDialogService` | 91.4 kB | 46 | 15 % |
| `GrPromptDialog` | 80.8 kB | 44 | 13 % |
| `GrPagination` | 78.3 kB | 47 | 13 % |
| `GrTreeSelect` | 75.8 kB | 45 | 13 % |
| `GrSelect` | 69.7 kB | 43 | 12 % |
| `GrColorPicker` | 66.6 kB | 37 | 11 % |
| `GrJsonViewer` | 63.0 kB | 38 | 10 % |
| `GrTransfer` | 59.4 kB | 38 | 10 % |
| `GrAutocomplete` | 56.9 kB | 37 | 9 % |
| `GrConfirmDialog` | 53.5 kB | 29 | 9 % |
| `GrDataTable` | 50.7 kB | 32 | 8 % |
| `GrCommandPalette` | 50.1 kB | 27 | 8 % |
| `GrContextMenu` | 50.1 kB | 26 | 8 % |
| `GrDropdownMenu` | 48.8 kB | 27 | 8 % |
| `GrTreeSections` | 42.4 kB | 26 | 7 % |
| `GrImageViewer` | 42.4 kB | 25 | 7 % |
| `GrDropdown` | 41.3 kB | 23 | 7 % |
| `GrTree` | 38.8 kB | 24 | 6 % |
| `GrDialog` | 37.8 kB | 24 | 6 % |
| `GrPopover` | 37.2 kB | 19 | 6 % |
| `GrDrawer` | 36.8 kB | 24 | 6 % |
| `GrInputTag` | 35.8 kB | 27 | 6 % |
| `GrToaster` | 32.1 kB | 26 | 5 % |
| `GrFileUpload` | 31.0 kB | 21 | 5 % |
| `GrModal` | 29.4 kB | 17 | 5 % |
| `GrFormFile` | 27.4 kB | 23 | 5 % |
| `GrResponseErrorBanner` | 26.5 kB | 15 | 4 % |
| `GrTooltip` | 26.2 kB | 18 | 4 % |
| `GrCarousel` | 26.0 kB | 17 | 4 % |
| `GrSortableList` | 24.2 kB | 16 | 4 % |
| `GrNumberInput` | 22.7 kB | 20 | 4 % |
| `GrList` | 22.5 kB | 16 | 4 % |
| `GrBreadcrumbs` | 19.6 kB | 13 | 3 % |
| `GrSidebar` | 19.0 kB | 16 | 3 % |
| `GrCollapse` | 18.8 kB | 14 | 3 % |
| `GrStatistic` | 18.2 kB | 14 | 3 % |
| `GrRadioGroup` | 17.3 kB | 14 | 3 % |
| `GrInput` | 16.6 kB | 15 | 3 % |
| `GrTabs` | 16.4 kB | 12 | 3 % |
| `GrSlider` | 15.4 kB | 13 | 3 % |
| `GrChip` | 15.4 kB | 13 | 3 % |
| `GrNavbar` | 15.4 kB | 14 | 3 % |
| `GrSegmented` | 15.2 kB | 10 | 3 % |
| `GrSteps` | 14.8 kB | 11 | 2 % |
| `GrDelta` | 14.3 kB | 11 | 2 % |
| `GrTextarea` | 13.8 kB | 14 | 2 % |
| `GrForm` | 13.7 kB | 8 | 2 % |
| `GrTimeline` | 13.6 kB | 11 | 2 % |
| `GrKbd` | 13.2 kB | 9 | 2 % |
| `GrFilePreview` | 12.8 kB | 9 | 2 % |
| `GrCheckboxGroup` | 12.2 kB | 11 | 2 % |
| `GrLink` | 12.2 kB | 11 | 2 % |
| `GrScrollSpy` | 12.1 kB | 7 | 2 % |
| `GrTable` | 11.7 kB | 11 | 2 % |
| `GrAvatar` | 11.7 kB | 9 | 2 % |
| `GrRating` | 11.4 kB | 10 | 2 % |
| `GrRadio` | 11.3 kB | 8 | 2 % |
| `GrButton` | 11.0 kB | 11 | 2 % |
| `GrSwitch` | 10.4 kB | 10 | 2 % |
| `GrChipGroup` | 10.4 kB | 10 | 2 % |
| `GrLoading` | 10.3 kB | 12 | 2 % |
| `GrCheckbox` | 10.2 kB | 10 | 2 % |
| `GrEmptyState` | 10.1 kB | 10 | 2 % |
| `GrSplitter` | 10.1 kB | 9 | 2 % |
| `GrProgressCircle` | 10.1 kB | 9 | 2 % |
| `GrAlert` | 10.0 kB | 10 | 2 % |
| `GrFormField` | 9.8 kB | 10 | 2 % |
| `GrBottomNav` | 8.9 kB | 7 | 1 % |
| `GrBadge` | 8.5 kB | 10 | 1 % |
| `GrDescriptionList` | 8.3 kB | 5 | 1 % |
| `GrCard` | 8.3 kB | 5 | 1 % |
| `GrConfigProvider` | 7.4 kB | 6 | 1 % |
| `GrAffix` | 7.3 kB | 4 | 1 % |
| `GrProgressBar` | 7.2 kB | 8 | 1 % |
| `GrBadgeWrap` | 6.3 kB | 7 | 1 % |
| `GrIcon` | 6.2 kB | 7 | 1 % |
| `GrDivider` | 6.1 kB | 5 | 1 % |
| `GrFormSection` | 5.2 kB | 5 | < 1 % |
| `GrValue` | 2.7 kB | 4 | < 1 % |
| `GrSkeleton` | 1.9 kB | 4 | < 1 % |
| `GrTabPanels` | 1.9 kB | 3 | < 1 % |
| `GrButtonGroup` | 1.8 kB | 5 | < 1 % |

Весь пакет из корня — 601.8 kB.
