# Вес гранулярных импортов

> Сгенерировано `yarn sizes:docs` по собранному `dist` пакета `@feugene/granularity` 1.1.1.
> Править руками бесполезно — правка потеряется на следующей сборке.

Сколько приезжает потребителю, взявшему один подпуть: gzip самого entry и всего, что он тянет
из `dist`. Общий код лежит в отдельных чанках, поэтому вес самого файла entry ничего не говорит.

**Складывать эти числа нельзя.** Общий чанк посчитан в каждой строке заново, а платится один раз: сумма 5 самых тяжёлых строк даёт 487.1 kB, а вместе они весят 251.9 kB. Вес набора считается объединением — так его и считает `yarn sizes`.

Это верхняя граница: бандлер приложения трясёт дерево дальше и минифицирует повторно.

| Компонент | gzip | файлов | от бареля |
| --- | ---: | ---: | ---: |
| `GrDataTable` | 115.8 kB | 51 | 18 % |
| `GrDialogService` | 99.0 kB | 45 | 15 % |
| `GrTreeSelect` | 92.7 kB | 50 | 14 % |
| `GrPagination` | 91.3 kB | 50 | 14 % |
| `GrPromptDialog` | 88.3 kB | 43 | 13 % |
| `GrSelect` | 80.6 kB | 45 | 12 % |
| `GrColorPicker` | 76.1 kB | 36 | 12 % |
| `GrTransfer` | 69.4 kB | 41 | 11 % |
| `GrJsonViewer` | 67.3 kB | 39 | 10 % |
| `GrAutocomplete` | 65.4 kB | 38 | 10 % |
| `GrContextMenu` | 58.3 kB | 26 | 9 % |
| `GrDropdownMenu` | 56.3 kB | 26 | 9 % |
| `GrConfirmDialog` | 56.3 kB | 29 | 9 % |
| `GrSidebar` | 53.6 kB | 30 | 8 % |
| `GrCommandPalette` | 52.9 kB | 25 | 8 % |
| `GrFormFile` | 50.1 kB | 31 | 8 % |
| `GrInputTag` | 48.5 kB | 28 | 7 % |
| `GrImageViewer` | 42.2 kB | 22 | 6 % |
| `GrDropdown` | 41.8 kB | 20 | 6 % |
| `GrTreeSections` | 41.3 kB | 24 | 6 % |
| `GrDialog` | 39.9 kB | 23 | 6 % |
| `GrTree` | 38.4 kB | 23 | 6 % |
| `GrDrawer` | 38.3 kB | 23 | 6 % |
| `GrPopover` | 37.6 kB | 17 | 6 % |
| `GrToaster` | 37.5 kB | 25 | 6 % |
| `GrFileUpload` | 33.9 kB | 19 | 5 % |
| `GrCarousel` | 29.8 kB | 18 | 5 % |
| `GrModal` | 29.3 kB | 15 | 4 % |
| `GrResponseErrorBanner` | 28.7 kB | 17 | 4 % |
| `GrTooltip` | 26.7 kB | 15 | 4 % |
| `GrSortableList` | 24.8 kB | 15 | 4 % |
| `GrNumberInput` | 24.6 kB | 20 | 4 % |
| `GrList` | 23.4 kB | 13 | 4 % |
| `GrInput` | 19.5 kB | 16 | 3 % |
| `GrBreadcrumbs` | 19.4 kB | 10 | 3 % |
| `GrStatistic` | 18.7 kB | 12 | 3 % |
| `GrCollapse` | 18.6 kB | 11 | 3 % |
| `GrRadioGroup` | 18.4 kB | 13 | 3 % |
| `GrTabsWithPanels` | 17.9 kB | 12 | 3 % |
| `GrSegmented` | 17.6 kB | 11 | 3 % |
| `GrSlider` | 16.8 kB | 12 | 3 % |
| `GrNavbar` | 16.8 kB | 13 | 3 % |
| `GrChip` | 15.8 kB | 10 | 2 % |
| `GrTabs` | 15.7 kB | 10 | 2 % |
| `GrKbd` | 15.2 kB | 8 | 2 % |
| `GrTextarea` | 15.0 kB | 13 | 2 % |
| `GrSteps` | 14.8 kB | 10 | 2 % |
| `GrForm` | 14.6 kB | 8 | 2 % |
| `GrSwitch` | 14.2 kB | 10 | 2 % |
| `GrFilePreview` | 13.9 kB | 8 | 2 % |
| `GrButton` | 13.8 kB | 12 | 2 % |
| `GrTable` | 13.8 kB | 10 | 2 % |
| `GrCheckboxGroup` | 13.8 kB | 11 | 2 % |
| `GrDelta` | 13.4 kB | 9 | 2 % |
| `GrOtpInput` | 13.1 kB | 7 | 2 % |
| `GrRating` | 12.4 kB | 10 | 2 % |
| `GrLink` | 12.4 kB | 8 | 2 % |
| `GrAvatar` | 11.9 kB | 7 | 2 % |
| `GrTimeline` | 11.8 kB | 8 | 2 % |
| `GrRadio` | 11.7 kB | 6 | 2 % |
| `GrScrollSpy` | 11.5 kB | 6 | 2 % |
| `GrCheckbox` | 10.6 kB | 9 | 2 % |
| `GrAlert` | 10.1 kB | 10 | 2 % |
| `GrChipGroup` | 9.8 kB | 9 | 1 % |
| `GrBottomNav` | 9.5 kB | 7 | 1 % |
| `GrFormField` | 9.3 kB | 8 | 1 % |
| `GrSplitter` | 9.3 kB | 7 | 1 % |
| `GrCard` | 9.2 kB | 5 | 1 % |
| `GrLoading` | 9.1 kB | 8 | 1 % |
| `GrEmptyState` | 9.1 kB | 7 | 1 % |
| `GrProgressCircle` | 8.9 kB | 7 | 1 % |
| `GrBadge` | 8.7 kB | 6 | 1 % |
| `GrConfigProvider` | 7.5 kB | 6 | 1 % |
| `GrDescriptionList` | 7.5 kB | 4 | 1 % |
| `GrProgressBar` | 6.7 kB | 6 | 1 % |
| `GrAffix` | 6.4 kB | 3 | < 1 % |
| `GrBadgeWrap` | 5.5 kB | 5 | < 1 % |
| `GrDivider` | 5.3 kB | 4 | < 1 % |
| `GrIcon` | 5.1 kB | 4 | < 1 % |
| `GrFormSection` | 4.5 kB | 4 | < 1 % |
| `GrTabPanels` | 2.6 kB | 4 | < 1 % |
| `GrValue` | 2.1 kB | 3 | < 1 % |
| `GrSkeleton` | 1.7 kB | 3 | < 1 % |
| `GrButtonGroup` | 1.5 kB | 4 | < 1 % |

Весь пакет из корня — 655.4 kB.
