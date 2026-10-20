# Вес гранулярных импортов

> Сгенерировано `yarn sizes:docs` по собранному `dist` пакета `@feugene/granularity` 2.4.0.
> Править руками бесполезно — правка потеряется на следующей сборке.

Сколько приезжает потребителю, взявшему один подпуть: gzip самого entry и всего, что он тянет
из `dist`. Общий код лежит в отдельных чанках, поэтому вес самого файла entry ничего не говорит.

**Складывать эти числа нельзя.** Общий чанк посчитан в каждой строке заново, а платится один раз: сумма 5 самых тяжёлых строк даёт 527.5 kB, а вместе они весят 260.5 kB. Вес набора считается объединением — так его и считает `yarn sizes`.

Это верхняя граница: бандлер приложения трясёт дерево дальше и минифицирует повторно.

| Компонент | gzip | файлов | от бареля |
| --- | ---: | ---: | ---: |
| `GrDataTable` | 124.5 kB | 56 | 19 % |
| `GrDialogService` | 108.6 kB | 51 | 16 % |
| `GrPagination` | 100.0 kB | 55 | 15 % |
| `GrPromptDialog` | 97.9 kB | 49 | 15 % |
| `GrTreeSelect` | 96.5 kB | 52 | 14 % |
| `GrSelect` | 84.4 kB | 47 | 13 % |
| `GrColorPicker` | 79.9 kB | 38 | 12 % |
| `GrTransfer` | 79.3 kB | 47 | 12 % |
| `GrJsonViewer` | 76.9 kB | 45 | 12 % |
| `GrAutocomplete` | 69.2 kB | 40 | 10 % |
| `GrConfirmDialog` | 65.9 kB | 35 | 10 % |
| `GrSidebar` | 63.2 kB | 36 | 10 % |
| `GrContextMenu` | 62.1 kB | 28 | 9 % |
| `GrDropdownMenu` | 60.1 kB | 28 | 9 % |
| `GrFormFile` | 59.7 kB | 37 | 9 % |
| `GrCommandPalette` | 56.7 kB | 27 | 9 % |
| `GrInputTag` | 52.8 kB | 31 | 8 % |
| `GrDialog` | 49.5 kB | 29 | 7 % |
| `GrDrawer` | 48.0 kB | 29 | 7 % |
| `GrToaster` | 47.1 kB | 31 | 7 % |
| `GrImageViewer` | 46.4 kB | 25 | 7 % |
| `GrDropdown` | 45.6 kB | 22 | 7 % |
| `GrTreeSections` | 45.1 kB | 26 | 7 % |
| `GrTree` | 42.2 kB | 25 | 6 % |
| `GrPopover` | 41.4 kB | 19 | 6 % |
| `GrResponseErrorBanner` | 38.3 kB | 23 | 6 % |
| `GrFileUpload` | 38.2 kB | 22 | 6 % |
| `GrCarousel` | 33.6 kB | 20 | 5 % |
| `GrModal` | 33.1 kB | 17 | 5 % |
| `GrTooltip` | 31.0 kB | 18 | 5 % |
| `GrNumberInput` | 28.9 kB | 23 | 4 % |
| `GrSortableList` | 28.6 kB | 17 | 4 % |
| `GrList` | 27.1 kB | 15 | 4 % |
| `GrNavbar` | 26.5 kB | 19 | 4 % |
| `GrRadioGroup` | 24.1 kB | 15 | 4 % |
| `GrBreadcrumbs` | 23.9 kB | 14 | 4 % |
| `GrButton` | 23.5 kB | 18 | 4 % |
| `GrInput` | 23.2 kB | 18 | 3 % |
| `GrCollapse` | 22.9 kB | 14 | 3 % |
| `GrStatistic` | 22.5 kB | 14 | 3 % |
| `GrTabsWithPanels` | 21.6 kB | 14 | 3 % |
| `GrSegmented` | 21.2 kB | 13 | 3 % |
| `GrSlider` | 20.6 kB | 14 | 3 % |
| `GrChip` | 19.5 kB | 12 | 3 % |
| `GrTabs` | 19.4 kB | 12 | 3 % |
| `GrKbd` | 18.9 kB | 10 | 3 % |
| `GrTextarea` | 18.8 kB | 15 | 3 % |
| `GrSteps` | 18.6 kB | 12 | 3 % |
| `GrSwitch` | 18.0 kB | 12 | 3 % |
| `GrFilePreview` | 17.6 kB | 10 | 3 % |
| `GrTable` | 17.5 kB | 12 | 3 % |
| `GrCheckboxGroup` | 17.5 kB | 13 | 3 % |
| `GrDelta` | 17.2 kB | 11 | 3 % |
| `GrRadio` | 17.1 kB | 8 | 3 % |
| `GrLink` | 16.9 kB | 12 | 3 % |
| `GrOtpInput` | 16.8 kB | 9 | 3 % |
| `GrRating` | 16.2 kB | 12 | 2 % |
| `GrAvatar` | 15.7 kB | 9 | 2 % |
| `GrTimeline` | 15.5 kB | 10 | 2 % |
| `GrForm` | 14.7 kB | 8 | 2 % |
| `GrCheckbox` | 14.4 kB | 11 | 2 % |
| `GrAlert` | 13.9 kB | 12 | 2 % |
| `GrChipGroup` | 13.5 kB | 11 | 2 % |
| `GrLoading` | 13.4 kB | 11 | 2 % |
| `GrEmptyState` | 13.4 kB | 10 | 2 % |
| `GrBottomNav` | 13.3 kB | 9 | 2 % |
| `GrFormField` | 13.1 kB | 10 | 2 % |
| `GrSplitter` | 13.1 kB | 9 | 2 % |
| `GrCard` | 13.0 kB | 7 | 2 % |
| `GrProgressCircle` | 12.7 kB | 9 | 2 % |
| `GrBadge` | 12.4 kB | 8 | 2 % |
| `GrConfigProvider` | 11.9 kB | 8 | 2 % |
| `GrScrollSpy` | 11.5 kB | 6 | 2 % |
| `GrDescriptionList` | 11.2 kB | 6 | 2 % |
| `GrProgressBar` | 10.4 kB | 8 | 2 % |
| `GrIcon` | 9.5 kB | 7 | 1 % |
| `GrDivider` | 9.1 kB | 6 | 1 % |
| `GrButtonGroup` | 8.5 kB | 7 | 1 % |
| `GrFormSection` | 8.3 kB | 6 | 1 % |
| `GrAffix` | 6.4 kB | 3 | < 1 % |
| `GrBadgeWrap` | 5.5 kB | 5 | < 1 % |
| `GrTabPanels` | 2.6 kB | 4 | < 1 % |
| `GrValue` | 2.1 kB | 3 | < 1 % |
| `GrSkeleton` | 1.7 kB | 3 | < 1 % |

Весь пакет из корня — 665.5 kB.
