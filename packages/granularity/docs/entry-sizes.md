# Вес гранулярных импортов

> Сгенерировано `yarn sizes:docs` по собранному `dist` пакета `@feugene/granularity` 2.2.0.
> Править руками бесполезно — правка потеряется на следующей сборке.

Сколько приезжает потребителю, взявшему один подпуть: gzip самого entry и всего, что он тянет
из `dist`. Общий код лежит в отдельных чанках, поэтому вес самого файла entry ничего не говорит.

**Складывать эти числа нельзя.** Общий чанк посчитан в каждой строке заново, а платится один раз: сумма 5 самых тяжёлых строк даёт 522.4 kB, а вместе они весят 259.4 kB. Вес набора считается объединением — так его и считает `yarn sizes`.

Это верхняя граница: бандлер приложения трясёт дерево дальше и минифицирует повторно.

| Компонент | gzip | файлов | от бареля |
| --- | ---: | ---: | ---: |
| `GrDataTable` | 123.4 kB | 56 | 19 % |
| `GrDialogService` | 107.5 kB | 51 | 16 % |
| `GrPagination` | 98.9 kB | 55 | 15 % |
| `GrPromptDialog` | 96.8 kB | 49 | 15 % |
| `GrTreeSelect` | 95.9 kB | 52 | 14 % |
| `GrSelect` | 83.8 kB | 47 | 13 % |
| `GrColorPicker` | 79.3 kB | 38 | 12 % |
| `GrTransfer` | 77.9 kB | 47 | 12 % |
| `GrJsonViewer` | 75.8 kB | 45 | 11 % |
| `GrAutocomplete` | 68.6 kB | 40 | 10 % |
| `GrConfirmDialog` | 64.8 kB | 35 | 10 % |
| `GrSidebar` | 62.1 kB | 36 | 9 % |
| `GrContextMenu` | 61.5 kB | 28 | 9 % |
| `GrDropdownMenu` | 59.5 kB | 28 | 9 % |
| `GrFormFile` | 58.6 kB | 37 | 9 % |
| `GrCommandPalette` | 56.0 kB | 27 | 8 % |
| `GrInputTag` | 52.2 kB | 31 | 8 % |
| `GrDialog` | 48.4 kB | 29 | 7 % |
| `GrDrawer` | 46.8 kB | 29 | 7 % |
| `GrToaster` | 46.0 kB | 31 | 7 % |
| `GrImageViewer` | 45.8 kB | 25 | 7 % |
| `GrDropdown` | 45.0 kB | 22 | 7 % |
| `GrTreeSections` | 44.5 kB | 26 | 7 % |
| `GrTree` | 41.6 kB | 25 | 6 % |
| `GrPopover` | 40.8 kB | 19 | 6 % |
| `GrFileUpload` | 37.6 kB | 22 | 6 % |
| `GrResponseErrorBanner` | 37.2 kB | 23 | 6 % |
| `GrCarousel` | 33.0 kB | 20 | 5 % |
| `GrModal` | 32.5 kB | 17 | 5 % |
| `GrTooltip` | 30.4 kB | 18 | 5 % |
| `GrNumberInput` | 28.3 kB | 23 | 4 % |
| `GrSortableList` | 28.0 kB | 17 | 4 % |
| `GrList` | 26.5 kB | 15 | 4 % |
| `GrNavbar` | 25.3 kB | 19 | 4 % |
| `GrBreadcrumbs` | 23.3 kB | 14 | 4 % |
| `GrRadioGroup` | 22.9 kB | 15 | 3 % |
| `GrInput` | 22.6 kB | 18 | 3 % |
| `GrButton` | 22.4 kB | 18 | 3 % |
| `GrCollapse` | 22.3 kB | 14 | 3 % |
| `GrStatistic` | 21.9 kB | 14 | 3 % |
| `GrTabsWithPanels` | 21.0 kB | 14 | 3 % |
| `GrSegmented` | 20.6 kB | 13 | 3 % |
| `GrSlider` | 20.0 kB | 14 | 3 % |
| `GrChip` | 18.9 kB | 12 | 3 % |
| `GrTabs` | 18.8 kB | 12 | 3 % |
| `GrKbd` | 18.3 kB | 10 | 3 % |
| `GrTextarea` | 18.2 kB | 15 | 3 % |
| `GrSteps` | 18.0 kB | 12 | 3 % |
| `GrSwitch` | 17.4 kB | 12 | 3 % |
| `GrFilePreview` | 17.0 kB | 10 | 3 % |
| `GrTable` | 16.9 kB | 12 | 3 % |
| `GrCheckboxGroup` | 16.9 kB | 13 | 3 % |
| `GrDelta` | 16.6 kB | 11 | 3 % |
| `GrLink` | 16.3 kB | 12 | 2 % |
| `GrRadio` | 16.3 kB | 8 | 2 % |
| `GrOtpInput` | 16.2 kB | 9 | 2 % |
| `GrRating` | 15.6 kB | 12 | 2 % |
| `GrAvatar` | 15.1 kB | 9 | 2 % |
| `GrTimeline` | 14.9 kB | 10 | 2 % |
| `GrForm` | 14.6 kB | 8 | 2 % |
| `GrCheckbox` | 13.8 kB | 11 | 2 % |
| `GrAlert` | 13.3 kB | 12 | 2 % |
| `GrChipGroup` | 12.9 kB | 11 | 2 % |
| `GrLoading` | 12.8 kB | 11 | 2 % |
| `GrEmptyState` | 12.8 kB | 10 | 2 % |
| `GrBottomNav` | 12.7 kB | 9 | 2 % |
| `GrFormField` | 12.5 kB | 10 | 2 % |
| `GrSplitter` | 12.5 kB | 9 | 2 % |
| `GrCard` | 12.4 kB | 7 | 2 % |
| `GrProgressCircle` | 12.0 kB | 9 | 2 % |
| `GrBadge` | 11.8 kB | 8 | 2 % |
| `GrScrollSpy` | 11.5 kB | 6 | 2 % |
| `GrConfigProvider` | 10.9 kB | 8 | 2 % |
| `GrDescriptionList` | 10.6 kB | 6 | 2 % |
| `GrProgressBar` | 9.8 kB | 8 | 1 % |
| `GrIcon` | 8.9 kB | 7 | 1 % |
| `GrDivider` | 8.5 kB | 6 | 1 % |
| `GrFormSection` | 7.7 kB | 6 | 1 % |
| `GrAffix` | 6.4 kB | 3 | < 1 % |
| `GrBadgeWrap` | 5.5 kB | 5 | < 1 % |
| `GrTabPanels` | 2.6 kB | 4 | < 1 % |
| `GrValue` | 2.1 kB | 3 | < 1 % |
| `GrSkeleton` | 1.7 kB | 3 | < 1 % |
| `GrButtonGroup` | 1.5 kB | 4 | < 1 % |

Весь пакет из корня — 662.7 kB.
