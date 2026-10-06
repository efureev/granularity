# Вес гранулярных импортов

> Сгенерировано `yarn sizes:docs` по собранному `dist` пакета `@feugene/granularity` 1.0.6.
> Править руками бесполезно — правка потеряется на следующей сборке.

Сколько приезжает потребителю, взявшему один подпуть: gzip самого entry и всего, что он тянет
из `dist`. Общий код лежит в отдельных чанках, поэтому вес самого файла entry ничего не говорит.

**Складывать эти числа нельзя.** Общий чанк посчитан в каждой строке заново, а платится один раз: сумма 5 самых тяжёлых строк даёт 458.5 kB, а вместе они весят 241.6 kB. Вес набора считается объединением — так его и считает `yarn sizes`.

Это верхняя граница: бандлер приложения трясёт дерево дальше и минифицирует повторно.

| Компонент | gzip | файлов | от бареля |
| --- | ---: | ---: | ---: |
| `GrDataTable` | 111.5 kB | 48 | 18 % |
| `GrDialogService` | 93.4 kB | 42 | 15 % |
| `GrTreeSelect` | 88.2 kB | 47 | 14 % |
| `GrPagination` | 82.8 kB | 45 | 13 % |
| `GrPromptDialog` | 82.7 kB | 40 | 13 % |
| `GrSelect` | 74.3 kB | 42 | 12 % |
| `GrColorPicker` | 72.0 kB | 33 | 11 % |
| `GrTransfer` | 64.3 kB | 36 | 10 % |
| `GrJsonViewer` | 62.9 kB | 36 | 10 % |
| `GrAutocomplete` | 62.1 kB | 36 | 10 % |
| `GrContextMenu` | 56.5 kB | 25 | 9 % |
| `GrDropdownMenu` | 54.7 kB | 25 | 9 % |
| `GrConfirmDialog` | 54.0 kB | 27 | 9 % |
| `GrCommandPalette` | 52.3 kB | 25 | 8 % |
| `GrSidebar` | 50.8 kB | 28 | 8 % |
| `GrFormFile` | 45.4 kB | 29 | 7 % |
| `GrInputTag` | 45.2 kB | 26 | 7 % |
| `GrImageViewer` | 42.1 kB | 22 | 7 % |
| `GrDropdown` | 41.6 kB | 20 | 7 % |
| `GrTreeSections` | 40.9 kB | 24 | 6 % |
| `GrTree` | 38.1 kB | 23 | 6 % |
| `GrDialog` | 37.6 kB | 21 | 6 % |
| `GrPopover` | 37.4 kB | 17 | 6 % |
| `GrDrawer` | 36.2 kB | 21 | 6 % |
| `GrToaster` | 35.0 kB | 23 | 6 % |
| `GrCarousel` | 29.5 kB | 18 | 5 % |
| `GrFileUpload` | 29.5 kB | 17 | 5 % |
| `GrModal` | 29.1 kB | 15 | 5 % |
| `GrResponseErrorBanner` | 26.6 kB | 15 | 4 % |
| `GrTooltip` | 26.3 kB | 15 | 4 % |
| `GrSortableList` | 23.9 kB | 15 | 4 % |
| `GrNumberInput` | 22.8 kB | 19 | 4 % |
| `GrList` | 22.7 kB | 13 | 4 % |
| `GrCollapse` | 17.9 kB | 11 | 3 % |
| `GrStatistic` | 17.8 kB | 12 | 3 % |
| `GrInput` | 17.4 kB | 14 | 3 % |
| `GrBreadcrumbs` | 17.4 kB | 9 | 3 % |
| `GrTabsWithPanels` | 17.3 kB | 12 | 3 % |
| `GrRadioGroup` | 16.5 kB | 12 | 3 % |
| `GrSegmented` | 15.1 kB | 9 | 2 % |
| `GrTabs` | 15.1 kB | 10 | 2 % |
| `GrKbd` | 15.0 kB | 8 | 2 % |
| `GrSteps` | 14.4 kB | 10 | 2 % |
| `GrNavbar` | 14.3 kB | 11 | 2 % |
| `GrSlider` | 14.2 kB | 11 | 2 % |
| `GrChip` | 14.2 kB | 9 | 2 % |
| `GrForm` | 13.7 kB | 8 | 2 % |
| `GrTable` | 13.7 kB | 10 | 2 % |
| `GrDelta` | 13.3 kB | 9 | 2 % |
| `GrTextarea` | 13.0 kB | 12 | 2 % |
| `GrFilePreview` | 12.8 kB | 8 | 2 % |
| `GrSwitch` | 12.5 kB | 9 | 2 % |
| `GrCheckboxGroup` | 11.9 kB | 10 | 2 % |
| `GrButton` | 11.7 kB | 10 | 2 % |
| `GrTimeline` | 11.7 kB | 8 | 2 % |
| `GrAvatar` | 11.4 kB | 7 | 2 % |
| `GrOtpInput` | 11.4 kB | 6 | 2 % |
| `GrScrollSpy` | 11.2 kB | 6 | 2 % |
| `GrLink` | 10.9 kB | 7 | 2 % |
| `GrRating` | 10.6 kB | 9 | 2 % |
| `GrRadio` | 10.0 kB | 5 | 2 % |
| `GrAlert` | 10.0 kB | 10 | 2 % |
| `GrChipGroup` | 9.7 kB | 9 | 2 % |
| `GrCheckbox` | 9.0 kB | 8 | 1 % |
| `GrLoading` | 9.0 kB | 8 | 1 % |
| `GrSplitter` | 9.0 kB | 7 | 1 % |
| `GrEmptyState` | 8.9 kB | 7 | 1 % |
| `GrProgressCircle` | 8.9 kB | 7 | 1 % |
| `GrFormField` | 8.8 kB | 8 | 1 % |
| `GrBadge` | 8.7 kB | 6 | 1 % |
| `GrCard` | 8.7 kB | 5 | 1 % |
| `GrBottomNav` | 8.0 kB | 6 | 1 % |
| `GrDescriptionList` | 7.5 kB | 4 | 1 % |
| `GrConfigProvider` | 7.4 kB | 6 | 1 % |
| `GrProgressBar` | 6.7 kB | 6 | 1 % |
| `GrAffix` | 6.3 kB | 3 | < 1 % |
| `GrDivider` | 5.3 kB | 4 | < 1 % |
| `GrIcon` | 5.1 kB | 4 | < 1 % |
| `GrBadgeWrap` | 5.1 kB | 5 | < 1 % |
| `GrFormSection` | 4.5 kB | 4 | < 1 % |
| `GrTabPanels` | 2.6 kB | 4 | < 1 % |
| `GrValue` | 2.1 kB | 3 | < 1 % |
| `GrSkeleton` | 1.7 kB | 3 | < 1 % |
| `GrButtonGroup` | 1.5 kB | 4 | < 1 % |

Весь пакет из корня — 633.6 kB.
