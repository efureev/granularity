# Вес гранулярных импортов

> Сгенерировано `yarn sizes:docs` по собранному `dist` пакета `@feugene/granularity` 1.0.0.
> Править руками бесполезно — правка потеряется на следующей сборке.

Сколько приезжает потребителю, взявшему один подпуть: gzip самого entry и всего, что он тянет
из `dist`. Общий код лежит в отдельных чанках, поэтому вес самого файла entry ничего не говорит.

**Складывать эти числа нельзя.** Общий чанк посчитан в каждой строке заново, а платится один раз: сумма 5 самых тяжёлых строк даёт 470.5 kB, а вместе они весят 248.6 kB. Вес набора считается объединением — так его и считает `yarn sizes`.

Это верхняя граница: бандлер приложения трясёт дерево дальше и минифицирует повторно.

| Компонент | gzip | файлов | от бареля |
| --- | ---: | ---: | ---: |
| `GrDataTable` | 115.1 kB | 54 | 17 % |
| `GrDialogService` | 95.4 kB | 47 | 14 % |
| `GrTreeSelect` | 90.3 kB | 51 | 14 % |
| `GrPagination` | 85.0 kB | 49 | 13 % |
| `GrPromptDialog` | 84.7 kB | 45 | 13 % |
| `GrSelect` | 76.4 kB | 45 | 11 % |
| `GrColorPicker` | 75.4 kB | 37 | 11 % |
| `GrTransfer` | 66.4 kB | 39 | 10 % |
| `GrJsonViewer` | 64.5 kB | 38 | 10 % |
| `GrAutocomplete` | 63.1 kB | 38 | 9 % |
| `GrContextMenu` | 57.5 kB | 27 | 9 % |
| `GrDropdownMenu` | 57.3 kB | 29 | 9 % |
| `GrConfirmDialog` | 54.7 kB | 29 | 8 % |
| `GrCommandPalette` | 54.6 kB | 28 | 8 % |
| `GrSidebar` | 53.2 kB | 31 | 8 % |
| `GrFormFile` | 48.3 kB | 33 | 7 % |
| `GrInputTag` | 47.7 kB | 30 | 7 % |
| `GrImageViewer` | 43.7 kB | 24 | 7 % |
| `GrDropdown` | 43.0 kB | 23 | 6 % |
| `GrTreeSections` | 41.7 kB | 25 | 6 % |
| `GrDialog` | 39.3 kB | 24 | 6 % |
| `GrPopover` | 38.9 kB | 19 | 6 % |
| `GrDrawer` | 38.1 kB | 23 | 6 % |
| `GrTree` | 37.7 kB | 23 | 6 % |
| `GrToaster` | 36.7 kB | 25 | 5 % |
| `GrFileUpload` | 31.0 kB | 19 | 5 % |
| `GrModal` | 30.9 kB | 17 | 5 % |
| `GrCarousel` | 29.7 kB | 18 | 4 % |
| `GrTooltip` | 28.0 kB | 18 | 4 % |
| `GrResponseErrorBanner` | 26.5 kB | 15 | 4 % |
| `GrSortableList` | 26.2 kB | 18 | 4 % |
| `GrNumberInput` | 24.8 kB | 21 | 4 % |
| `GrList` | 24.5 kB | 15 | 4 % |
| `GrCollapse` | 20.5 kB | 14 | 3 % |
| `GrBreadcrumbs` | 19.8 kB | 12 | 3 % |
| `GrStatistic` | 19.6 kB | 14 | 3 % |
| `GrInput` | 19.2 kB | 16 | 3 % |
| `GrTabsWithPanels` | 17.8 kB | 13 | 3 % |
| `GrRadioGroup` | 17.0 kB | 13 | 3 % |
| `GrTabs` | 16.8 kB | 12 | 3 % |
| `GrChip` | 16.7 kB | 13 | 3 % |
| `GrSegmented` | 16.7 kB | 10 | 2 % |
| `GrKbd` | 16.5 kB | 10 | 2 % |
| `GrSlider` | 16.1 kB | 13 | 2 % |
| `GrNavbar` | 15.8 kB | 13 | 2 % |
| `GrDelta` | 14.9 kB | 11 | 2 % |
| `GrSteps` | 14.9 kB | 10 | 2 % |
| `GrTextarea` | 14.5 kB | 14 | 2 % |
| `GrFilePreview` | 14.1 kB | 9 | 2 % |
| `GrSwitch` | 14.0 kB | 10 | 2 % |
| `GrForm` | 13.7 kB | 8 | 2 % |
| `GrTable` | 13.6 kB | 10 | 2 % |
| `GrAvatar` | 13.0 kB | 8 | 2 % |
| `GrTimeline` | 12.9 kB | 9 | 2 % |
| `GrOtpInput` | 12.8 kB | 7 | 2 % |
| `GrLink` | 12.8 kB | 10 | 2 % |
| `GrScrollSpy` | 12.4 kB | 7 | 2 % |
| `GrCheckboxGroup` | 12.2 kB | 11 | 2 % |
| `GrRating` | 11.7 kB | 10 | 2 % |
| `GrRadio` | 11.6 kB | 8 | 2 % |
| `GrButton` | 11.4 kB | 11 | 2 % |
| `GrChipGroup` | 10.8 kB | 10 | 2 % |
| `GrCheckbox` | 10.5 kB | 10 | 2 % |
| `GrEmptyState` | 10.5 kB | 9 | 2 % |
| `GrLoading` | 10.5 kB | 11 | 2 % |
| `GrBadge` | 10.2 kB | 9 | 2 % |
| `GrFormField` | 10.2 kB | 10 | 2 % |
| `GrProgressCircle` | 10.2 kB | 8 | 2 % |
| `GrCard` | 10.1 kB | 6 | 2 % |
| `GrSplitter` | 10.0 kB | 8 | 1 % |
| `GrAlert` | 10.0 kB | 10 | 1 % |
| `GrBottomNav` | 9.2 kB | 7 | 1 % |
| `GrDescriptionList` | 8.6 kB | 5 | 1 % |
| `GrAffix` | 7.7 kB | 4 | 1 % |
| `GrConfigProvider` | 7.4 kB | 6 | 1 % |
| `GrProgressBar` | 7.3 kB | 7 | 1 % |
| `GrDivider` | 6.5 kB | 5 | < 1 % |
| `GrBadgeWrap` | 6.4 kB | 6 | < 1 % |
| `GrIcon` | 6.4 kB | 6 | < 1 % |
| `GrFormSection` | 5.5 kB | 5 | < 1 % |
| `GrValue` | 3.0 kB | 4 | < 1 % |
| `GrTabPanels` | 2.6 kB | 4 | < 1 % |
| `GrSkeleton` | 1.7 kB | 3 | < 1 % |
| `GrButtonGroup` | 1.5 kB | 4 | < 1 % |

Весь пакет из корня — 668.9 kB.
