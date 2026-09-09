# Вес гранулярных импортов

> Сгенерировано `yarn sizes:docs` по собранному `dist` пакета `@feugene/granularity` 0.50.0.
> Править руками бесполезно — правка потеряется на следующей сборке.

Сколько приезжает потребителю, взявшему один подпуть: gzip самого entry и всего, что он тянет
из `dist`. Общий код лежит в отдельных чанках, поэтому вес самого файла entry ничего не говорит.

**Складывать эти числа нельзя.** Общий чанк посчитан в каждой строке заново, а платится один раз: сумма 5 самых тяжёлых строк даёт 456.7 kB, а вместе они весят 241.5 kB. Вес набора считается объединением — так его и считает `yarn sizes`.

Это верхняя граница: бандлер приложения трясёт дерево дальше и минифицирует повторно.

| Компонент | gzip | файлов | от бареля |
| --- | ---: | ---: | ---: |
| `GrDataTable` | 108.7 kB | 56 | 16 % |
| `GrDialogService` | 93.3 kB | 46 | 14 % |
| `GrTreeSelect` | 89.4 kB | 51 | 14 % |
| `GrPagination` | 82.7 kB | 49 | 13 % |
| `GrPromptDialog` | 82.6 kB | 44 | 13 % |
| `GrSelect` | 74.0 kB | 45 | 11 % |
| `GrColorPicker` | 73.0 kB | 37 | 11 % |
| `GrTransfer` | 65.0 kB | 40 | 10 % |
| `GrJsonViewer` | 63.8 kB | 38 | 10 % |
| `GrAutocomplete` | 62.8 kB | 39 | 10 % |
| `GrConfirmDialog` | 54.6 kB | 29 | 8 % |
| `GrCommandPalette` | 54.4 kB | 29 | 8 % |
| `GrSidebar` | 52.9 kB | 32 | 8 % |
| `GrContextMenu` | 51.1 kB | 26 | 8 % |
| `GrDropdownMenu` | 50.2 kB | 28 | 8 % |
| `GrInputTag` | 47.5 kB | 31 | 7 % |
| `GrFormFile` | 46.7 kB | 34 | 7 % |
| `GrImageViewer` | 43.5 kB | 25 | 7 % |
| `GrTreeSections` | 42.9 kB | 26 | 6 % |
| `GrDropdown` | 42.4 kB | 23 | 6 % |
| `GrTree` | 39.3 kB | 24 | 6 % |
| `GrDialog` | 38.9 kB | 24 | 6 % |
| `GrPopover` | 38.2 kB | 19 | 6 % |
| `GrDrawer` | 37.9 kB | 24 | 6 % |
| `GrToaster` | 36.6 kB | 27 | 6 % |
| `GrFileUpload` | 31.0 kB | 21 | 5 % |
| `GrModal` | 30.5 kB | 17 | 5 % |
| `GrCarousel` | 29.7 kB | 19 | 4 % |
| `GrTooltip` | 27.7 kB | 19 | 4 % |
| `GrResponseErrorBanner` | 26.5 kB | 15 | 4 % |
| `GrSortableList` | 24.4 kB | 17 | 4 % |
| `GrNumberInput` | 22.9 kB | 21 | 3 % |
| `GrList` | 22.5 kB | 16 | 3 % |
| `GrBreadcrumbs` | 19.6 kB | 13 | 3 % |
| `GrCollapse` | 18.8 kB | 14 | 3 % |
| `GrStatistic` | 18.2 kB | 14 | 3 % |
| `GrTabsWithPanels` | 18.1 kB | 14 | 3 % |
| `GrRadioGroup` | 17.3 kB | 14 | 3 % |
| `GrInput` | 16.9 kB | 15 | 3 % |
| `GrTabs` | 16.7 kB | 13 | 3 % |
| `GrChip` | 16.4 kB | 13 | 2 % |
| `GrKbd` | 16.2 kB | 10 | 2 % |
| `GrSlider` | 15.8 kB | 13 | 2 % |
| `GrNavbar` | 15.5 kB | 14 | 2 % |
| `GrSegmented` | 15.2 kB | 10 | 2 % |
| `GrSteps` | 14.8 kB | 11 | 2 % |
| `GrDelta` | 14.6 kB | 11 | 2 % |
| `GrTextarea` | 14.2 kB | 14 | 2 % |
| `GrForm` | 13.7 kB | 8 | 2 % |
| `GrTimeline` | 13.6 kB | 11 | 2 % |
| `GrSwitch` | 13.6 kB | 10 | 2 % |
| `GrTable` | 13.4 kB | 11 | 2 % |
| `GrFilePreview` | 12.8 kB | 9 | 2 % |
| `GrAvatar` | 12.8 kB | 9 | 2 % |
| `GrOtpInput` | 12.6 kB | 8 | 2 % |
| `GrCheckboxGroup` | 12.2 kB | 11 | 2 % |
| `GrLink` | 12.2 kB | 11 | 2 % |
| `GrScrollSpy` | 12.1 kB | 7 | 2 % |
| `GrRating` | 11.4 kB | 10 | 2 % |
| `GrRadio` | 11.3 kB | 8 | 2 % |
| `GrButton` | 11.0 kB | 11 | 2 % |
| `GrChipGroup` | 10.4 kB | 10 | 2 % |
| `GrEmptyState` | 10.3 kB | 10 | 2 % |
| `GrLoading` | 10.3 kB | 12 | 2 % |
| `GrCheckbox` | 10.2 kB | 10 | 2 % |
| `GrSplitter` | 10.1 kB | 9 | 2 % |
| `GrProgressCircle` | 10.1 kB | 9 | 2 % |
| `GrBadge` | 10.0 kB | 10 | 2 % |
| `GrAlert` | 10.0 kB | 10 | 2 % |
| `GrFormField` | 9.8 kB | 10 | 1 % |
| `GrBottomNav` | 8.9 kB | 7 | 1 % |
| `GrDescriptionList` | 8.3 kB | 5 | 1 % |
| `GrCard` | 8.3 kB | 5 | 1 % |
| `GrConfigProvider` | 7.4 kB | 6 | 1 % |
| `GrAffix` | 7.3 kB | 4 | 1 % |
| `GrProgressBar` | 7.2 kB | 8 | 1 % |
| `GrBadgeWrap` | 6.3 kB | 7 | < 1 % |
| `GrIcon` | 6.2 kB | 7 | < 1 % |
| `GrDivider` | 6.1 kB | 5 | < 1 % |
| `GrFormSection` | 5.2 kB | 5 | < 1 % |
| `GrValue` | 2.7 kB | 4 | < 1 % |
| `GrTabPanels` | 2.6 kB | 4 | < 1 % |
| `GrSkeleton` | 1.9 kB | 4 | < 1 % |
| `GrButtonGroup` | 1.8 kB | 5 | < 1 % |

Весь пакет из корня — 660.6 kB.
