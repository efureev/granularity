# Вес гранулярных импортов

> Сгенерировано `yarn sizes:docs` по собранному `dist` пакета `@feugene/granularity` 0.53.1.
> Править руками бесполезно — правка потеряется на следующей сборке.

Сколько приезжает потребителю, взявшему один подпуть: gzip самого entry и всего, что он тянет
из `dist`. Общий код лежит в отдельных чанках, поэтому вес самого файла entry ничего не говорит.

**Складывать эти числа нельзя.** Общий чанк посчитан в каждой строке заново, а платится один раз: сумма 5 самых тяжёлых строк даёт 471.1 kB, а вместе они весят 250.2 kB. Вес набора считается объединением — так его и считает `yarn sizes`.

Это верхняя граница: бандлер приложения трясёт дерево дальше и минифицирует повторно.

| Компонент | gzip | файлов | от бареля |
| --- | ---: | ---: | ---: |
| `GrDataTable` | 115.0 kB | 56 | 17 % |
| `GrDialogService` | 95.3 kB | 47 | 14 % |
| `GrTreeSelect` | 91.5 kB | 52 | 14 % |
| `GrPagination` | 84.8 kB | 50 | 13 % |
| `GrPromptDialog` | 84.6 kB | 45 | 13 % |
| `GrSelect` | 76.2 kB | 46 | 11 % |
| `GrColorPicker` | 75.4 kB | 38 | 11 % |
| `GrTransfer` | 66.9 kB | 41 | 10 % |
| `GrJsonViewer` | 65.7 kB | 39 | 10 % |
| `GrAutocomplete` | 62.8 kB | 39 | 9 % |
| `GrContextMenu` | 57.5 kB | 27 | 9 % |
| `GrDropdownMenu` | 56.9 kB | 29 | 8 % |
| `GrConfirmDialog` | 54.6 kB | 29 | 8 % |
| `GrCommandPalette` | 54.4 kB | 29 | 8 % |
| `GrSidebar` | 52.9 kB | 32 | 8 % |
| `GrFormFile` | 48.1 kB | 35 | 7 % |
| `GrInputTag` | 47.5 kB | 31 | 7 % |
| `GrImageViewer` | 43.5 kB | 25 | 6 % |
| `GrTreeSections` | 42.9 kB | 26 | 6 % |
| `GrDropdown` | 42.7 kB | 23 | 6 % |
| `GrTree` | 39.3 kB | 24 | 6 % |
| `GrDialog` | 38.9 kB | 24 | 6 % |
| `GrPopover` | 38.5 kB | 19 | 6 % |
| `GrDrawer` | 37.9 kB | 24 | 6 % |
| `GrToaster` | 36.6 kB | 27 | 5 % |
| `GrFileUpload` | 31.0 kB | 21 | 5 % |
| `GrModal` | 30.5 kB | 17 | 5 % |
| `GrCarousel` | 29.7 kB | 19 | 4 % |
| `GrTooltip` | 27.8 kB | 19 | 4 % |
| `GrResponseErrorBanner` | 26.5 kB | 15 | 4 % |
| `GrSortableList` | 25.8 kB | 18 | 4 % |
| `GrNumberInput` | 24.6 kB | 22 | 4 % |
| `GrList` | 24.5 kB | 17 | 4 % |
| `GrCollapse` | 20.3 kB | 15 | 3 % |
| `GrBreadcrumbs` | 19.6 kB | 13 | 3 % |
| `GrStatistic` | 19.4 kB | 15 | 3 % |
| `GrInput` | 18.8 kB | 16 | 3 % |
| `GrTabsWithPanels` | 18.1 kB | 14 | 3 % |
| `GrRadioGroup` | 17.3 kB | 14 | 3 % |
| `GrTabs` | 16.7 kB | 13 | 2 % |
| `GrChip` | 16.4 kB | 13 | 2 % |
| `GrSegmented` | 16.3 kB | 10 | 2 % |
| `GrKbd` | 16.2 kB | 10 | 2 % |
| `GrSlider` | 15.8 kB | 13 | 2 % |
| `GrNavbar` | 15.5 kB | 14 | 2 % |
| `GrSteps` | 14.8 kB | 11 | 2 % |
| `GrDelta` | 14.6 kB | 11 | 2 % |
| `GrTextarea` | 14.2 kB | 14 | 2 % |
| `GrFilePreview` | 14.0 kB | 10 | 2 % |
| `GrForm` | 13.7 kB | 8 | 2 % |
| `GrTimeline` | 13.6 kB | 11 | 2 % |
| `GrSwitch` | 13.6 kB | 10 | 2 % |
| `GrTable` | 13.4 kB | 11 | 2 % |
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
| `GrBadge` | 10.0 kB | 10 | 1 % |
| `GrAlert` | 10.0 kB | 10 | 1 % |
| `GrFormField` | 9.8 kB | 10 | 1 % |
| `GrCard` | 9.7 kB | 6 | 1 % |
| `GrBottomNav` | 8.9 kB | 7 | 1 % |
| `GrDescriptionList` | 8.3 kB | 5 | 1 % |
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

Весь пакет из корня — 675.0 kB.
