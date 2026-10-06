# Вес гранулярных импортов

> Сгенерировано `yarn sizes:docs` по собранному `dist` пакета `@feugene/granularity` 1.0.16.
> Править руками бесполезно — правка потеряется на следующей сборке.

Сколько приезжает потребителю, взявшему один подпуть: gzip самого entry и всего, что он тянет
из `dist`. Общий код лежит в отдельных чанках, поэтому вес самого файла entry ничего не говорит.

**Складывать эти числа нельзя.** Общий чанк посчитан в каждой строке заново, а платится один раз: сумма 5 самых тяжёлых строк даёт 484.1 kB, а вместе они весят 250.0 kB. Вес набора считается объединением — так его и считает `yarn sizes`.

Это верхняя граница: бандлер приложения трясёт дерево дальше и минифицирует повторно.

| Компонент | gzip | файлов | от бареля |
| --- | ---: | ---: | ---: |
| `GrDataTable` | 115.7 kB | 51 | 18 % |
| `GrDialogService` | 98.8 kB | 45 | 15 % |
| `GrTreeSelect` | 91.8 kB | 49 | 14 % |
| `GrPagination` | 89.6 kB | 49 | 14 % |
| `GrPromptDialog` | 88.1 kB | 43 | 14 % |
| `GrSelect` | 79.0 kB | 44 | 12 % |
| `GrColorPicker` | 75.3 kB | 35 | 12 % |
| `GrTransfer` | 68.6 kB | 40 | 11 % |
| `GrJsonViewer` | 66.9 kB | 39 | 10 % |
| `GrAutocomplete` | 65.3 kB | 38 | 10 % |
| `GrContextMenu` | 58.2 kB | 26 | 9 % |
| `GrDropdownMenu` | 56.3 kB | 26 | 9 % |
| `GrConfirmDialog` | 56.2 kB | 29 | 9 % |
| `GrSidebar` | 53.5 kB | 30 | 8 % |
| `GrCommandPalette` | 52.8 kB | 25 | 8 % |
| `GrFormFile` | 49.9 kB | 31 | 8 % |
| `GrInputTag` | 48.3 kB | 28 | 7 % |
| `GrImageViewer` | 42.1 kB | 22 | 6 % |
| `GrDropdown` | 41.8 kB | 20 | 6 % |
| `GrTreeSections` | 41.0 kB | 24 | 6 % |
| `GrDialog` | 39.8 kB | 23 | 6 % |
| `GrTree` | 38.3 kB | 23 | 6 % |
| `GrDrawer` | 38.2 kB | 23 | 6 % |
| `GrPopover` | 37.6 kB | 17 | 6 % |
| `GrToaster` | 37.4 kB | 25 | 6 % |
| `GrFileUpload` | 33.8 kB | 19 | 5 % |
| `GrCarousel` | 29.7 kB | 18 | 5 % |
| `GrModal` | 29.2 kB | 15 | 4 % |
| `GrResponseErrorBanner` | 28.6 kB | 17 | 4 % |
| `GrTooltip` | 26.7 kB | 15 | 4 % |
| `GrSortableList` | 24.7 kB | 15 | 4 % |
| `GrNumberInput` | 24.5 kB | 20 | 4 % |
| `GrList` | 23.2 kB | 13 | 4 % |
| `GrInput` | 19.3 kB | 16 | 3 % |
| `GrBreadcrumbs` | 19.3 kB | 10 | 3 % |
| `GrCollapse` | 18.4 kB | 11 | 3 % |
| `GrRadioGroup` | 18.4 kB | 13 | 3 % |
| `GrStatistic` | 18.3 kB | 12 | 3 % |
| `GrTabsWithPanels` | 17.8 kB | 12 | 3 % |
| `GrSegmented` | 17.6 kB | 11 | 3 % |
| `GrSlider` | 16.7 kB | 12 | 3 % |
| `GrNavbar` | 16.7 kB | 13 | 3 % |
| `GrChip` | 15.6 kB | 10 | 2 % |
| `GrTabs` | 15.6 kB | 10 | 2 % |
| `GrKbd` | 15.0 kB | 8 | 2 % |
| `GrTextarea` | 14.9 kB | 13 | 2 % |
| `GrSteps` | 14.7 kB | 10 | 2 % |
| `GrForm` | 14.5 kB | 8 | 2 % |
| `GrSwitch` | 14.1 kB | 10 | 2 % |
| `GrFilePreview` | 13.8 kB | 8 | 2 % |
| `GrCheckboxGroup` | 13.8 kB | 11 | 2 % |
| `GrButton` | 13.7 kB | 12 | 2 % |
| `GrTable` | 13.7 kB | 10 | 2 % |
| `GrDelta` | 13.3 kB | 9 | 2 % |
| `GrOtpInput` | 13.0 kB | 7 | 2 % |
| `GrRating` | 12.3 kB | 10 | 2 % |
| `GrLink` | 12.3 kB | 8 | 2 % |
| `GrAvatar` | 11.8 kB | 7 | 2 % |
| `GrRadio` | 11.7 kB | 6 | 2 % |
| `GrTimeline` | 11.7 kB | 8 | 2 % |
| `GrScrollSpy` | 11.4 kB | 6 | 2 % |
| `GrCheckbox` | 10.6 kB | 9 | 2 % |
| `GrAlert` | 10.0 kB | 10 | 2 % |
| `GrChipGroup` | 9.7 kB | 9 | 1 % |
| `GrBottomNav` | 9.4 kB | 7 | 1 % |
| `GrFormField` | 9.2 kB | 8 | 1 % |
| `GrSplitter` | 9.2 kB | 7 | 1 % |
| `GrCard` | 9.2 kB | 5 | 1 % |
| `GrLoading` | 9.0 kB | 8 | 1 % |
| `GrEmptyState` | 8.9 kB | 7 | 1 % |
| `GrProgressCircle` | 8.9 kB | 7 | 1 % |
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

Весь пакет из корня — 652.5 kB.
