# Вес гранулярных импортов

> Сгенерировано `yarn sizes:docs` по собранному `dist` пакета `@feugene/granularity` 3.2.2.
> Править руками бесполезно — правка потеряется на следующей сборке.

Сколько приезжает потребителю, взявшему один подпуть: gzip самого entry и всего, что он тянет
из `dist`. Общий код лежит в отдельных чанках, поэтому вес самого файла entry ничего не говорит.

**Складывать эти числа нельзя.** Общий чанк посчитан в каждой строке заново, а платится один раз: сумма 5 самых тяжёлых строк даёт 540.6 kB, а вместе они весят 264.7 kB. Вес набора считается объединением — так его и считает `yarn sizes`.

Это верхняя граница: бандлер приложения трясёт дерево дальше и минифицирует повторно.

| Компонент | gzip | файлов | от бареля |
| --- | ---: | ---: | ---: |
| `GrDataTable` | 126.9 kB | 56 | 19 % |
| `GrDialogService` | 111.5 kB | 51 | 17 % |
| `GrPagination` | 103.2 kB | 55 | 15 % |
| `GrPromptDialog` | 100.7 kB | 49 | 15 % |
| `GrTreeSelect` | 98.4 kB | 52 | 15 % |
| `GrSelect` | 86.3 kB | 47 | 13 % |
| `GrTransfer` | 82.1 kB | 47 | 12 % |
| `GrColorPicker` | 81.8 kB | 38 | 12 % |
| `GrJsonViewer` | 79.6 kB | 45 | 12 % |
| `GrAutocomplete` | 72.3 kB | 41 | 11 % |
| `GrConfirmDialog` | 67.3 kB | 35 | 10 % |
| `GrSidebar` | 64.7 kB | 36 | 10 % |
| `GrContextMenu` | 62.4 kB | 28 | 9 % |
| `GrFormFile` | 61.4 kB | 37 | 9 % |
| `GrDropdownMenu` | 60.5 kB | 28 | 9 % |
| `GrCommandPalette` | 56.9 kB | 27 | 8 % |
| `GrInputTag` | 55.8 kB | 32 | 8 % |
| `GrDialog` | 51.0 kB | 29 | 8 % |
| `GrDrawer` | 49.5 kB | 29 | 7 % |
| `GrToaster` | 48.7 kB | 31 | 7 % |
| `GrImageViewer` | 46.7 kB | 25 | 7 % |
| `GrDropdown` | 45.9 kB | 22 | 7 % |
| `GrTreeSections` | 45.4 kB | 26 | 7 % |
| `GrTree` | 42.5 kB | 25 | 6 % |
| `GrPopover` | 41.7 kB | 19 | 6 % |
| `GrResponseErrorBanner` | 39.7 kB | 23 | 6 % |
| `GrFileUpload` | 38.9 kB | 22 | 6 % |
| `GrCarousel` | 33.9 kB | 20 | 5 % |
| `GrModal` | 33.4 kB | 17 | 5 % |
| `GrTooltip` | 31.3 kB | 18 | 5 % |
| `GrNumberInput` | 30.5 kB | 23 | 5 % |
| `GrSortableList` | 28.9 kB | 17 | 4 % |
| `GrNavbar` | 27.9 kB | 19 | 4 % |
| `GrList` | 27.5 kB | 15 | 4 % |
| `GrRadioGroup` | 25.5 kB | 15 | 4 % |
| `GrButton` | 25.0 kB | 18 | 4 % |
| `GrInput` | 24.8 kB | 18 | 4 % |
| `GrBreadcrumbs` | 24.2 kB | 14 | 4 % |
| `GrTabsWithPanels` | 23.7 kB | 15 | 4 % |
| `GrCollapse` | 23.2 kB | 14 | 3 % |
| `GrStatistic` | 22.8 kB | 14 | 3 % |
| `GrSegmented` | 21.7 kB | 13 | 3 % |
| `GrTextarea` | 21.6 kB | 16 | 3 % |
| `GrSlider` | 21.3 kB | 14 | 3 % |
| `GrChip` | 20.1 kB | 12 | 3 % |
| `GrTabs` | 19.8 kB | 12 | 3 % |
| `GrKbd` | 19.2 kB | 10 | 3 % |
| `GrSteps` | 18.8 kB | 12 | 3 % |
| `GrSwitch` | 18.8 kB | 12 | 3 % |
| `GrRadio` | 18.5 kB | 8 | 3 % |
| `GrTable` | 18.2 kB | 12 | 3 % |
| `GrCheckboxGroup` | 18.1 kB | 13 | 3 % |
| `GrFilePreview` | 17.9 kB | 10 | 3 % |
| `GrTimeline` | 17.9 kB | 11 | 3 % |
| `GrDelta` | 17.5 kB | 11 | 3 % |
| `GrOtpInput` | 17.3 kB | 9 | 3 % |
| `GrLink` | 17.2 kB | 12 | 3 % |
| `GrRating` | 16.9 kB | 12 | 3 % |
| `GrAvatar` | 16.0 kB | 9 | 2 % |
| `GrCheckbox` | 15.0 kB | 11 | 2 % |
| `GrForm` | 14.6 kB | 8 | 2 % |
| `GrAlert` | 14.1 kB | 12 | 2 % |
| `GrChipGroup` | 13.8 kB | 11 | 2 % |
| `GrEmptyState` | 13.7 kB | 10 | 2 % |
| `GrLoading` | 13.7 kB | 11 | 2 % |
| `GrBottomNav` | 13.6 kB | 9 | 2 % |
| `GrFormField` | 13.5 kB | 10 | 2 % |
| `GrSplitter` | 13.4 kB | 9 | 2 % |
| `GrCard` | 13.3 kB | 7 | 2 % |
| `GrProgressCircle` | 12.9 kB | 9 | 2 % |
| `GrBadge` | 12.7 kB | 8 | 2 % |
| `GrConfigProvider` | 12.2 kB | 8 | 2 % |
| `GrDescriptionList` | 11.5 kB | 6 | 2 % |
| `GrScrollSpy` | 11.5 kB | 6 | 2 % |
| `GrProgressBar` | 10.7 kB | 8 | 2 % |
| `GrIcon` | 9.8 kB | 7 | 1 % |
| `GrDivider` | 9.5 kB | 6 | 1 % |
| `GrButtonGroup` | 8.8 kB | 7 | 1 % |
| `GrFormSection` | 8.6 kB | 6 | 1 % |
| `GrAffix` | 6.3 kB | 3 | < 1 % |
| `GrBadgeWrap` | 5.5 kB | 5 | < 1 % |
| `GrTabPanels` | 2.6 kB | 4 | < 1 % |
| `GrValue` | 2.1 kB | 3 | < 1 % |
| `GrSkeleton` | 1.7 kB | 3 | < 1 % |

Весь пакет из корня — 672.5 kB.
