# Вес гранулярных импортов

> Сгенерировано `yarn sizes:docs` по собранному `dist` пакета `@feugene/granularity` 1.0.11.
> Править руками бесполезно — правка потеряется на следующей сборке.

Сколько приезжает потребителю, взявшему один подпуть: gzip самого entry и всего, что он тянет
из `dist`. Общий код лежит в отдельных чанках, поэтому вес самого файла entry ничего не говорит.

**Складывать эти числа нельзя.** Общий чанк посчитан в каждой строке заново, а платится один раз: сумма 5 самых тяжёлых строк даёт 474.7 kB, а вместе они весят 246.0 kB. Вес набора считается объединением — так его и считает `yarn sizes`.

Это верхняя граница: бандлер приложения трясёт дерево дальше и минифицирует повторно.

| Компонент | gzip | файлов | от бареля |
| --- | ---: | ---: | ---: |
| `GrDataTable` | 114.8 kB | 50 | 18 % |
| `GrDialogService` | 96.5 kB | 44 | 15 % |
| `GrTreeSelect` | 90.9 kB | 49 | 14 % |
| `GrPagination` | 86.8 kB | 48 | 14 % |
| `GrPromptDialog` | 85.7 kB | 42 | 13 % |
| `GrSelect` | 77.0 kB | 44 | 12 % |
| `GrColorPicker` | 73.8 kB | 34 | 11 % |
| `GrTransfer` | 67.3 kB | 38 | 10 % |
| `GrJsonViewer` | 65.7 kB | 38 | 10 % |
| `GrAutocomplete` | 64.7 kB | 38 | 10 % |
| `GrContextMenu` | 58.2 kB | 26 | 9 % |
| `GrDropdownMenu` | 56.3 kB | 26 | 9 % |
| `GrConfirmDialog` | 55.6 kB | 28 | 9 % |
| `GrCommandPalette` | 52.8 kB | 25 | 8 % |
| `GrSidebar` | 52.4 kB | 29 | 8 % |
| `GrInputTag` | 47.7 kB | 28 | 7 % |
| `GrFormFile` | 47.4 kB | 30 | 7 % |
| `GrImageViewer` | 42.1 kB | 22 | 7 % |
| `GrDropdown` | 41.8 kB | 20 | 7 % |
| `GrTreeSections` | 40.9 kB | 24 | 6 % |
| `GrDialog` | 39.2 kB | 22 | 6 % |
| `GrTree` | 38.1 kB | 23 | 6 % |
| `GrDrawer` | 37.6 kB | 22 | 6 % |
| `GrPopover` | 37.6 kB | 17 | 6 % |
| `GrToaster` | 36.3 kB | 24 | 6 % |
| `GrFileUpload` | 30.8 kB | 18 | 5 % |
| `GrCarousel` | 29.7 kB | 18 | 5 % |
| `GrModal` | 29.2 kB | 15 | 5 % |
| `GrResponseErrorBanner` | 28.0 kB | 16 | 4 % |
| `GrTooltip` | 26.5 kB | 15 | 4 % |
| `GrSortableList` | 24.4 kB | 15 | 4 % |
| `GrNumberInput` | 24.1 kB | 20 | 4 % |
| `GrList` | 23.2 kB | 13 | 4 % |
| `GrBreadcrumbs` | 19.3 kB | 10 | 3 % |
| `GrInput` | 18.7 kB | 15 | 3 % |
| `GrCollapse` | 18.4 kB | 11 | 3 % |
| `GrStatistic` | 18.3 kB | 12 | 3 % |
| `GrRadioGroup` | 18.0 kB | 13 | 3 % |
| `GrTabsWithPanels` | 17.3 kB | 12 | 3 % |
| `GrSegmented` | 16.4 kB | 10 | 3 % |
| `GrNavbar` | 15.7 kB | 12 | 2 % |
| `GrSlider` | 15.5 kB | 12 | 2 % |
| `GrChip` | 15.4 kB | 10 | 2 % |
| `GrTabs` | 15.1 kB | 10 | 2 % |
| `GrKbd` | 15.0 kB | 8 | 2 % |
| `GrSteps` | 14.6 kB | 10 | 2 % |
| `GrTextarea` | 14.3 kB | 13 | 2 % |
| `GrSwitch` | 13.7 kB | 10 | 2 % |
| `GrForm` | 13.7 kB | 8 | 2 % |
| `GrTable` | 13.7 kB | 10 | 2 % |
| `GrCheckboxGroup` | 13.4 kB | 11 | 2 % |
| `GrFilePreview` | 13.3 kB | 8 | 2 % |
| `GrDelta` | 13.3 kB | 9 | 2 % |
| `GrButton` | 13.1 kB | 11 | 2 % |
| `GrOtpInput` | 12.7 kB | 7 | 2 % |
| `GrLink` | 12.3 kB | 8 | 2 % |
| `GrRating` | 11.9 kB | 10 | 2 % |
| `GrAvatar` | 11.8 kB | 7 | 2 % |
| `GrTimeline` | 11.7 kB | 8 | 2 % |
| `GrScrollSpy` | 11.4 kB | 6 | 2 % |
| `GrRadio` | 11.4 kB | 6 | 2 % |
| `GrCheckbox` | 10.3 kB | 9 | 2 % |
| `GrAlert` | 10.0 kB | 10 | 2 % |
| `GrChipGroup` | 9.7 kB | 9 | 2 % |
| `GrBottomNav` | 9.4 kB | 7 | 1 % |
| `GrCard` | 9.2 kB | 5 | 1 % |
| `GrLoading` | 9.0 kB | 8 | 1 % |
| `GrSplitter` | 9.0 kB | 7 | 1 % |
| `GrEmptyState` | 8.9 kB | 7 | 1 % |
| `GrProgressCircle` | 8.9 kB | 7 | 1 % |
| `GrFormField` | 8.8 kB | 8 | 1 % |
| `GrBadge` | 8.7 kB | 6 | 1 % |
| `GrDescriptionList` | 7.5 kB | 4 | 1 % |
| `GrConfigProvider` | 7.4 kB | 6 | 1 % |
| `GrProgressBar` | 6.7 kB | 6 | 1 % |
| `GrAffix` | 6.4 kB | 3 | < 1 % |
| `GrBadgeWrap` | 5.4 kB | 5 | < 1 % |
| `GrDivider` | 5.3 kB | 4 | < 1 % |
| `GrIcon` | 5.1 kB | 4 | < 1 % |
| `GrFormSection` | 4.5 kB | 4 | < 1 % |
| `GrTabPanels` | 2.6 kB | 4 | < 1 % |
| `GrValue` | 2.1 kB | 3 | < 1 % |
| `GrSkeleton` | 1.7 kB | 3 | < 1 % |
| `GrButtonGroup` | 1.5 kB | 4 | < 1 % |

Весь пакет из корня — 642.4 kB.
