# Вес гранулярных импортов

> Сгенерировано `yarn sizes:docs` по собранному `dist` пакета `@feugene/granularity` 3.6.0.
> Править руками бесполезно — правка потеряется на следующей сборке.

Сколько приезжает потребителю, взявшему один подпуть: gzip самого entry и всего, что он тянет
из `dist`. Общий код лежит в отдельных чанках, поэтому вес самого файла entry ничего не говорит.

**Складывать эти числа нельзя.** Общий чанк посчитан в каждой строке заново, а платится один раз: сумма 5 самых тяжёлых строк даёт 503.9 kB, а вместе они весят 251.5 kB. Вес набора считается объединением — так его и считает `yarn sizes`.

Это верхняя граница: бандлер приложения трясёт дерево дальше и минифицирует повторно.

| Компонент | gzip | файлов | от бареля |
| --- | ---: | ---: | ---: |
| `GrDataTable` | 121.5 kB | 56 | 19 % |
| `GrDialogService` | 104.6 kB | 51 | 16 % |
| `GrPromptDialog` | 93.8 kB | 49 | 15 % |
| `GrTreeSelect` | 92.5 kB | 53 | 14 % |
| `GrPagination` | 91.6 kB | 56 | 14 % |
| `GrSelect` | 80.5 kB | 48 | 12 % |
| `GrColorPicker` | 79.9 kB | 38 | 12 % |
| `GrTransfer` | 75.0 kB | 47 | 12 % |
| `GrJsonViewer` | 73.4 kB | 46 | 11 % |
| `GrAutocomplete` | 66.3 kB | 41 | 10 % |
| `GrConfirmDialog` | 62.7 kB | 35 | 10 % |
| `GrContextMenu` | 62.4 kB | 28 | 10 % |
| `GrDropdownMenu` | 60.5 kB | 28 | 9 % |
| `GrSidebar` | 60.1 kB | 36 | 9 % |
| `GrCommandPalette` | 56.9 kB | 27 | 9 % |
| `GrFormFile` | 56.8 kB | 37 | 9 % |
| `GrInputTag` | 49.9 kB | 32 | 8 % |
| `GrImageViewer` | 46.7 kB | 25 | 7 % |
| `GrDialog` | 46.3 kB | 29 | 7 % |
| `GrDropdown` | 45.9 kB | 22 | 7 % |
| `GrTreeSections` | 45.4 kB | 26 | 7 % |
| `GrDrawer` | 44.8 kB | 29 | 7 % |
| `GrToaster` | 44.1 kB | 31 | 7 % |
| `GrTree` | 42.5 kB | 25 | 7 % |
| `GrPopover` | 41.7 kB | 19 | 6 % |
| `GrFileUpload` | 38.9 kB | 22 | 6 % |
| `GrResponseErrorBanner` | 35.0 kB | 23 | 5 % |
| `GrCarousel` | 33.9 kB | 20 | 5 % |
| `GrModal` | 33.4 kB | 17 | 5 % |
| `GrTooltip` | 31.3 kB | 18 | 5 % |
| `GrNumberInput` | 29.4 kB | 24 | 5 % |
| `GrSortableList` | 28.9 kB | 17 | 4 % |
| `GrList` | 27.5 kB | 15 | 4 % |
| `GrBreadcrumbs` | 24.2 kB | 14 | 4 % |
| `GrNavbar` | 23.3 kB | 19 | 4 % |
| `GrCollapse` | 23.2 kB | 14 | 4 % |
| `GrInput` | 23.1 kB | 18 | 4 % |
| `GrStatistic` | 22.8 kB | 14 | 4 % |
| `GrTabsWithPanels` | 21.9 kB | 15 | 3 % |
| `GrSlider` | 21.3 kB | 14 | 3 % |
| `GrRadioGroup` | 19.6 kB | 15 | 3 % |
| `GrTextarea` | 19.4 kB | 16 | 3 % |
| `GrKbd` | 19.2 kB | 10 | 3 % |
| `GrSteps` | 18.8 kB | 12 | 3 % |
| `GrButton` | 18.6 kB | 17 | 3 % |
| `GrSegmented` | 18.6 kB | 13 | 3 % |
| `GrTable` | 18.2 kB | 12 | 3 % |
| `GrTabs` | 18.0 kB | 12 | 3 % |
| `GrFilePreview` | 18.0 kB | 10 | 3 % |
| `GrTimeline` | 17.9 kB | 11 | 3 % |
| `GrDelta` | 17.5 kB | 11 | 3 % |
| `GrCheckboxGroup` | 17.4 kB | 13 | 3 % |
| `GrOtpInput` | 17.3 kB | 9 | 3 % |
| `GrLink` | 17.2 kB | 12 | 3 % |
| `GrRating` | 16.9 kB | 12 | 3 % |
| `GrChip` | 16.2 kB | 12 | 3 % |
| `GrAvatar` | 16.0 kB | 9 | 2 % |
| `GrSwitch` | 15.2 kB | 12 | 2 % |
| `GrForm` | 14.6 kB | 8 | 2 % |
| `GrCheckbox` | 14.3 kB | 11 | 2 % |
| `GrAlert` | 14.1 kB | 12 | 2 % |
| `GrChipGroup` | 13.8 kB | 11 | 2 % |
| `GrEmptyState` | 13.7 kB | 10 | 2 % |
| `GrLoading` | 13.7 kB | 11 | 2 % |
| `GrBottomNav` | 13.6 kB | 9 | 2 % |
| `GrFormField` | 13.5 kB | 10 | 2 % |
| `GrSplitter` | 13.4 kB | 9 | 2 % |
| `GrCard` | 13.3 kB | 7 | 2 % |
| `GrProgressCircle` | 12.9 kB | 9 | 2 % |
| `GrRadio` | 12.3 kB | 8 | 2 % |
| `GrConfigProvider` | 12.2 kB | 8 | 2 % |
| `GrDescriptionList` | 11.5 kB | 6 | 2 % |
| `GrScrollSpy` | 11.5 kB | 6 | 2 % |
| `GrProgressBar` | 10.7 kB | 8 | 2 % |
| `GrBadge` | 10.0 kB | 7 | 2 % |
| `GrIcon` | 9.8 kB | 7 | 2 % |
| `GrDivider` | 9.5 kB | 6 | 1 % |
| `GrButtonGroup` | 8.8 kB | 7 | 1 % |
| `GrFormSection` | 8.6 kB | 6 | 1 % |
| `GrAffix` | 6.3 kB | 3 | < 1 % |
| `GrBadgeWrap` | 5.5 kB | 5 | < 1 % |
| `GrTabPanels` | 2.6 kB | 4 | < 1 % |
| `GrValue` | 2.1 kB | 3 | < 1 % |
| `GrSkeleton` | 1.7 kB | 3 | < 1 % |

Весь пакет из корня — 646.0 kB.
