# Вес гранулярных импортов

> Сгенерировано `yarn sizes:docs` по собранному `dist` пакета `@feugene/granularity` 1.0.9.
> Править руками бесполезно — правка потеряется на следующей сборке.

Сколько приезжает потребителю, взявшему один подпуть: gzip самого entry и всего, что он тянет
из `dist`. Общий код лежит в отдельных чанках, поэтому вес самого файла entry ничего не говорит.

**Складывать эти числа нельзя.** Общий чанк посчитан в каждой строке заново, а платится один раз: сумма 5 самых тяжёлых строк даёт 466.5 kB, а вместе они весят 243.5 kB. Вес набора считается объединением — так его и считает `yarn sizes`.

Это верхняя граница: бандлер приложения трясёт дерево дальше и минифицирует повторно.

| Компонент | gzip | файлов | от бареля |
| --- | ---: | ---: | ---: |
| `GrDataTable` | 113.1 kB | 49 | 18 % |
| `GrDialogService` | 94.7 kB | 43 | 15 % |
| `GrTreeSelect` | 89.4 kB | 48 | 14 % |
| `GrPagination` | 85.3 kB | 47 | 13 % |
| `GrPromptDialog` | 84.0 kB | 41 | 13 % |
| `GrSelect` | 75.5 kB | 43 | 12 % |
| `GrColorPicker` | 72.0 kB | 33 | 11 % |
| `GrTransfer` | 65.6 kB | 37 | 10 % |
| `GrJsonViewer` | 64.3 kB | 37 | 10 % |
| `GrAutocomplete` | 63.3 kB | 37 | 10 % |
| `GrContextMenu` | 57.9 kB | 26 | 9 % |
| `GrDropdownMenu` | 56.0 kB | 26 | 9 % |
| `GrConfirmDialog` | 55.3 kB | 28 | 9 % |
| `GrCommandPalette` | 52.3 kB | 25 | 8 % |
| `GrSidebar` | 52.2 kB | 29 | 8 % |
| `GrInputTag` | 46.3 kB | 27 | 7 % |
| `GrFormFile` | 46.0 kB | 29 | 7 % |
| `GrImageViewer` | 42.1 kB | 22 | 7 % |
| `GrDropdown` | 41.6 kB | 20 | 7 % |
| `GrTreeSections` | 40.9 kB | 24 | 6 % |
| `GrDialog` | 38.9 kB | 22 | 6 % |
| `GrTree` | 38.1 kB | 23 | 6 % |
| `GrDrawer` | 37.6 kB | 22 | 6 % |
| `GrPopover` | 37.4 kB | 17 | 6 % |
| `GrToaster` | 36.3 kB | 24 | 6 % |
| `GrFileUpload` | 29.6 kB | 17 | 5 % |
| `GrCarousel` | 29.5 kB | 18 | 5 % |
| `GrModal` | 29.1 kB | 15 | 5 % |
| `GrResponseErrorBanner` | 28.0 kB | 16 | 4 % |
| `GrTooltip` | 26.3 kB | 15 | 4 % |
| `GrSortableList` | 24.4 kB | 15 | 4 % |
| `GrList` | 23.2 kB | 13 | 4 % |
| `GrNumberInput` | 22.8 kB | 19 | 4 % |
| `GrBreadcrumbs` | 19.3 kB | 10 | 3 % |
| `GrCollapse` | 18.4 kB | 11 | 3 % |
| `GrStatistic` | 18.3 kB | 12 | 3 % |
| `GrInput` | 17.4 kB | 14 | 3 % |
| `GrTabsWithPanels` | 17.3 kB | 12 | 3 % |
| `GrRadioGroup` | 16.5 kB | 12 | 3 % |
| `GrNavbar` | 15.7 kB | 12 | 2 % |
| `GrChip` | 15.3 kB | 10 | 2 % |
| `GrSegmented` | 15.1 kB | 9 | 2 % |
| `GrTabs` | 15.1 kB | 10 | 2 % |
| `GrKbd` | 15.0 kB | 8 | 2 % |
| `GrSteps` | 14.4 kB | 10 | 2 % |
| `GrSlider` | 14.2 kB | 11 | 2 % |
| `GrForm` | 13.7 kB | 8 | 2 % |
| `GrTable` | 13.7 kB | 10 | 2 % |
| `GrFilePreview` | 13.3 kB | 8 | 2 % |
| `GrDelta` | 13.3 kB | 9 | 2 % |
| `GrButton` | 13.0 kB | 11 | 2 % |
| `GrTextarea` | 13.0 kB | 12 | 2 % |
| `GrSwitch` | 12.5 kB | 9 | 2 % |
| `GrLink` | 12.3 kB | 8 | 2 % |
| `GrCheckboxGroup` | 11.9 kB | 10 | 2 % |
| `GrAvatar` | 11.8 kB | 7 | 2 % |
| `GrTimeline` | 11.7 kB | 8 | 2 % |
| `GrOtpInput` | 11.4 kB | 6 | 2 % |
| `GrScrollSpy` | 11.2 kB | 6 | 2 % |
| `GrRating` | 10.6 kB | 9 | 2 % |
| `GrRadio` | 10.0 kB | 5 | 2 % |
| `GrAlert` | 10.0 kB | 10 | 2 % |
| `GrChipGroup` | 9.7 kB | 9 | 2 % |
| `GrBottomNav` | 9.4 kB | 7 | 1 % |
| `GrCard` | 9.2 kB | 5 | 1 % |
| `GrCheckbox` | 9.0 kB | 8 | 1 % |
| `GrLoading` | 9.0 kB | 8 | 1 % |
| `GrSplitter` | 9.0 kB | 7 | 1 % |
| `GrEmptyState` | 8.9 kB | 7 | 1 % |
| `GrProgressCircle` | 8.9 kB | 7 | 1 % |
| `GrFormField` | 8.8 kB | 8 | 1 % |
| `GrBadge` | 8.7 kB | 6 | 1 % |
| `GrDescriptionList` | 7.5 kB | 4 | 1 % |
| `GrConfigProvider` | 7.4 kB | 6 | 1 % |
| `GrProgressBar` | 6.7 kB | 6 | 1 % |
| `GrAffix` | 6.3 kB | 3 | < 1 % |
| `GrBadgeWrap` | 5.4 kB | 5 | < 1 % |
| `GrDivider` | 5.3 kB | 4 | < 1 % |
| `GrIcon` | 5.1 kB | 4 | < 1 % |
| `GrFormSection` | 4.5 kB | 4 | < 1 % |
| `GrTabPanels` | 2.6 kB | 4 | < 1 % |
| `GrValue` | 2.1 kB | 3 | < 1 % |
| `GrSkeleton` | 1.7 kB | 3 | < 1 % |
| `GrButtonGroup` | 1.5 kB | 4 | < 1 % |

Весь пакет из корня — 636.2 kB.
