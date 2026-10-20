# Вес гранулярных импортов

> Сгенерировано `yarn sizes:docs` по собранному `dist` пакета `@feugene/granularity` 2.3.0.
> Править руками бесполезно — правка потеряется на следующей сборке.

Сколько приезжает потребителю, взявшему один подпуть: gzip самого entry и всего, что он тянет
из `dist`. Общий код лежит в отдельных чанках, поэтому вес самого файла entry ничего не говорит.

**Складывать эти числа нельзя.** Общий чанк посчитан в каждой строке заново, а платится один раз: сумма 5 самых тяжёлых строк даёт 524.9 kB, а вместе они весят 260.0 kB. Вес набора считается объединением — так его и считает `yarn sizes`.

Это верхняя граница: бандлер приложения трясёт дерево дальше и минифицирует повторно.

| Компонент | gzip | файлов | от бареля |
| --- | ---: | ---: | ---: |
| `GrDataTable` | 124.0 kB | 56 | 19 % |
| `GrDialogService` | 108.1 kB | 51 | 16 % |
| `GrPagination` | 99.5 kB | 55 | 15 % |
| `GrPromptDialog` | 97.4 kB | 49 | 15 % |
| `GrTreeSelect` | 96.0 kB | 52 | 14 % |
| `GrSelect` | 83.9 kB | 47 | 13 % |
| `GrColorPicker` | 79.4 kB | 38 | 12 % |
| `GrTransfer` | 78.8 kB | 47 | 12 % |
| `GrJsonViewer` | 76.4 kB | 45 | 12 % |
| `GrAutocomplete` | 68.7 kB | 40 | 10 % |
| `GrConfirmDialog` | 65.4 kB | 35 | 10 % |
| `GrSidebar` | 62.7 kB | 36 | 9 % |
| `GrContextMenu` | 61.6 kB | 28 | 9 % |
| `GrDropdownMenu` | 59.6 kB | 28 | 9 % |
| `GrFormFile` | 59.2 kB | 37 | 9 % |
| `GrCommandPalette` | 56.1 kB | 27 | 8 % |
| `GrInputTag` | 52.3 kB | 31 | 8 % |
| `GrDialog` | 48.9 kB | 29 | 7 % |
| `GrDrawer` | 47.4 kB | 29 | 7 % |
| `GrToaster` | 46.6 kB | 31 | 7 % |
| `GrImageViewer` | 45.9 kB | 25 | 7 % |
| `GrDropdown` | 45.1 kB | 22 | 7 % |
| `GrTreeSections` | 44.5 kB | 26 | 7 % |
| `GrTree` | 41.6 kB | 25 | 6 % |
| `GrPopover` | 40.9 kB | 19 | 6 % |
| `GrResponseErrorBanner` | 37.8 kB | 23 | 6 % |
| `GrFileUpload` | 37.7 kB | 22 | 6 % |
| `GrCarousel` | 33.1 kB | 20 | 5 % |
| `GrModal` | 32.6 kB | 17 | 5 % |
| `GrTooltip` | 30.5 kB | 18 | 5 % |
| `GrNumberInput` | 28.4 kB | 23 | 4 % |
| `GrSortableList` | 28.0 kB | 17 | 4 % |
| `GrList` | 26.6 kB | 15 | 4 % |
| `GrNavbar` | 25.9 kB | 19 | 4 % |
| `GrRadioGroup` | 23.6 kB | 15 | 4 % |
| `GrBreadcrumbs` | 23.4 kB | 14 | 4 % |
| `GrButton` | 23.0 kB | 18 | 3 % |
| `GrInput` | 22.7 kB | 18 | 3 % |
| `GrCollapse` | 22.4 kB | 14 | 3 % |
| `GrStatistic` | 22.0 kB | 14 | 3 % |
| `GrTabsWithPanels` | 21.1 kB | 14 | 3 % |
| `GrSegmented` | 20.7 kB | 13 | 3 % |
| `GrSlider` | 20.1 kB | 14 | 3 % |
| `GrChip` | 19.0 kB | 12 | 3 % |
| `GrTabs` | 18.9 kB | 12 | 3 % |
| `GrKbd` | 18.4 kB | 10 | 3 % |
| `GrTextarea` | 18.3 kB | 15 | 3 % |
| `GrSteps` | 18.1 kB | 12 | 3 % |
| `GrSwitch` | 17.5 kB | 12 | 3 % |
| `GrFilePreview` | 17.1 kB | 10 | 3 % |
| `GrTable` | 17.0 kB | 12 | 3 % |
| `GrCheckboxGroup` | 17.0 kB | 13 | 3 % |
| `GrDelta` | 16.7 kB | 11 | 3 % |
| `GrRadio` | 16.6 kB | 8 | 3 % |
| `GrLink` | 16.4 kB | 12 | 2 % |
| `GrOtpInput` | 16.3 kB | 9 | 2 % |
| `GrRating` | 15.7 kB | 12 | 2 % |
| `GrAvatar` | 15.1 kB | 9 | 2 % |
| `GrTimeline` | 15.0 kB | 10 | 2 % |
| `GrForm` | 14.6 kB | 8 | 2 % |
| `GrCheckbox` | 13.9 kB | 11 | 2 % |
| `GrAlert` | 13.3 kB | 12 | 2 % |
| `GrChipGroup` | 13.0 kB | 11 | 2 % |
| `GrLoading` | 12.9 kB | 11 | 2 % |
| `GrEmptyState` | 12.9 kB | 10 | 2 % |
| `GrBottomNav` | 12.8 kB | 9 | 2 % |
| `GrFormField` | 12.6 kB | 10 | 2 % |
| `GrSplitter` | 12.6 kB | 9 | 2 % |
| `GrCard` | 12.4 kB | 7 | 2 % |
| `GrProgressCircle` | 12.2 kB | 9 | 2 % |
| `GrBadge` | 11.9 kB | 8 | 2 % |
| `GrScrollSpy` | 11.5 kB | 6 | 2 % |
| `GrConfigProvider` | 11.0 kB | 8 | 2 % |
| `GrDescriptionList` | 10.7 kB | 6 | 2 % |
| `GrProgressBar` | 9.9 kB | 8 | 1 % |
| `GrIcon` | 8.9 kB | 7 | 1 % |
| `GrDivider` | 8.6 kB | 6 | 1 % |
| `GrButtonGroup` | 7.9 kB | 7 | 1 % |
| `GrFormSection` | 7.8 kB | 6 | 1 % |
| `GrAffix` | 6.4 kB | 3 | < 1 % |
| `GrBadgeWrap` | 5.5 kB | 5 | < 1 % |
| `GrTabPanels` | 2.6 kB | 4 | < 1 % |
| `GrValue` | 2.1 kB | 3 | < 1 % |
| `GrSkeleton` | 1.7 kB | 3 | < 1 % |

Весь пакет из корня — 663.6 kB.
