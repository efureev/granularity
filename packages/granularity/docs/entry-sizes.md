# Вес гранулярных импортов

> Сгенерировано `yarn sizes:docs` по собранному `dist` пакета `@feugene/granularity` 2.0.0.
> Править руками бесполезно — правка потеряется на следующей сборке.

Сколько приезжает потребителю, взявшему один подпуть: gzip самого entry и всего, что он тянет
из `dist`. Общий код лежит в отдельных чанках, поэтому вес самого файла entry ничего не говорит.

**Складывать эти числа нельзя.** Общий чанк посчитан в каждой строке заново, а платится один раз: сумма 5 самых тяжёлых строк даёт 521.5 kB, а вместе они весят 259.3 kB. Вес набора считается объединением — так его и считает `yarn sizes`.

Это верхняя граница: бандлер приложения трясёт дерево дальше и минифицирует повторно.

| Компонент | gzip | файлов | от бареля |
| --- | ---: | ---: | ---: |
| `GrDataTable` | 123.2 kB | 56 | 19 % |
| `GrDialogService` | 107.3 kB | 51 | 16 % |
| `GrPagination` | 98.7 kB | 55 | 15 % |
| `GrPromptDialog` | 96.6 kB | 49 | 15 % |
| `GrTreeSelect` | 95.7 kB | 52 | 14 % |
| `GrSelect` | 83.7 kB | 47 | 13 % |
| `GrColorPicker` | 79.1 kB | 38 | 12 % |
| `GrTransfer` | 77.7 kB | 47 | 12 % |
| `GrJsonViewer` | 75.6 kB | 45 | 11 % |
| `GrAutocomplete` | 68.4 kB | 40 | 10 % |
| `GrConfirmDialog` | 64.6 kB | 35 | 10 % |
| `GrSidebar` | 61.9 kB | 36 | 9 % |
| `GrContextMenu` | 61.3 kB | 28 | 9 % |
| `GrDropdownMenu` | 59.3 kB | 28 | 9 % |
| `GrFormFile` | 58.4 kB | 37 | 9 % |
| `GrCommandPalette` | 55.9 kB | 27 | 8 % |
| `GrInputTag` | 52.0 kB | 31 | 8 % |
| `GrDialog` | 48.2 kB | 29 | 7 % |
| `GrDrawer` | 46.7 kB | 29 | 7 % |
| `GrToaster` | 45.8 kB | 31 | 7 % |
| `GrImageViewer` | 45.7 kB | 25 | 7 % |
| `GrDropdown` | 44.8 kB | 22 | 7 % |
| `GrTreeSections` | 44.3 kB | 26 | 7 % |
| `GrTree` | 41.4 kB | 25 | 6 % |
| `GrPopover` | 40.6 kB | 19 | 6 % |
| `GrFileUpload` | 37.5 kB | 22 | 6 % |
| `GrResponseErrorBanner` | 37.0 kB | 23 | 6 % |
| `GrCarousel` | 32.8 kB | 20 | 5 % |
| `GrModal` | 32.3 kB | 17 | 5 % |
| `GrTooltip` | 30.3 kB | 18 | 5 % |
| `GrNumberInput` | 28.1 kB | 23 | 4 % |
| `GrSortableList` | 27.8 kB | 17 | 4 % |
| `GrList` | 26.3 kB | 15 | 4 % |
| `GrNavbar` | 25.2 kB | 19 | 4 % |
| `GrBreadcrumbs` | 23.1 kB | 14 | 3 % |
| `GrRadioGroup` | 22.8 kB | 15 | 3 % |
| `GrInput` | 22.4 kB | 18 | 3 % |
| `GrButton` | 22.2 kB | 18 | 3 % |
| `GrCollapse` | 22.1 kB | 14 | 3 % |
| `GrStatistic` | 21.7 kB | 14 | 3 % |
| `GrTabsWithPanels` | 20.8 kB | 14 | 3 % |
| `GrSegmented` | 20.5 kB | 13 | 3 % |
| `GrSlider` | 19.8 kB | 14 | 3 % |
| `GrChip` | 18.7 kB | 12 | 3 % |
| `GrTabs` | 18.7 kB | 12 | 3 % |
| `GrKbd` | 18.1 kB | 10 | 3 % |
| `GrTextarea` | 18.0 kB | 15 | 3 % |
| `GrSteps` | 17.8 kB | 12 | 3 % |
| `GrSwitch` | 17.2 kB | 12 | 3 % |
| `GrFilePreview` | 16.9 kB | 10 | 3 % |
| `GrTable` | 16.8 kB | 12 | 3 % |
| `GrCheckboxGroup` | 16.7 kB | 13 | 3 % |
| `GrDelta` | 16.4 kB | 11 | 2 % |
| `GrLink` | 16.1 kB | 12 | 2 % |
| `GrRadio` | 16.1 kB | 8 | 2 % |
| `GrOtpInput` | 16.0 kB | 9 | 2 % |
| `GrRating` | 15.4 kB | 12 | 2 % |
| `GrAvatar` | 14.9 kB | 9 | 2 % |
| `GrTimeline` | 14.7 kB | 10 | 2 % |
| `GrForm` | 14.6 kB | 8 | 2 % |
| `GrCheckbox` | 13.6 kB | 11 | 2 % |
| `GrAlert` | 13.1 kB | 12 | 2 % |
| `GrChipGroup` | 12.7 kB | 11 | 2 % |
| `GrLoading` | 12.6 kB | 11 | 2 % |
| `GrEmptyState` | 12.6 kB | 10 | 2 % |
| `GrBottomNav` | 12.5 kB | 9 | 2 % |
| `GrFormField` | 12.3 kB | 10 | 2 % |
| `GrSplitter` | 12.3 kB | 9 | 2 % |
| `GrCard` | 12.2 kB | 7 | 2 % |
| `GrProgressCircle` | 11.9 kB | 9 | 2 % |
| `GrBadge` | 11.6 kB | 8 | 2 % |
| `GrScrollSpy` | 11.5 kB | 6 | 2 % |
| `GrConfigProvider` | 10.7 kB | 8 | 2 % |
| `GrDescriptionList` | 10.4 kB | 6 | 2 % |
| `GrProgressBar` | 9.6 kB | 8 | 1 % |
| `GrIcon` | 8.7 kB | 7 | 1 % |
| `GrDivider` | 8.3 kB | 6 | 1 % |
| `GrFormSection` | 7.5 kB | 6 | 1 % |
| `GrAffix` | 6.4 kB | 3 | < 1 % |
| `GrBadgeWrap` | 5.5 kB | 5 | < 1 % |
| `GrTabPanels` | 2.6 kB | 4 | < 1 % |
| `GrValue` | 2.1 kB | 3 | < 1 % |
| `GrSkeleton` | 1.7 kB | 3 | < 1 % |
| `GrButtonGroup` | 1.5 kB | 4 | < 1 % |

Весь пакет из корня — 662.5 kB.
