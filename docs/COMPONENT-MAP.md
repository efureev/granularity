# Карта компонентов

Ответ на вопрос «какой компонент взять под эту задачу» — по всем пакетам сразу:
ядро `@feugene/granularity` и спутники `granularity-charts`, `granularity-chrono`,
`granularity-dashboard`, `granularity-datasource`, `granularity-editor`,
`granularity-forms-schema` и `granularity-media`.

Читается сверху вниз: **Развилки** ставят различающий вопрос и приводят к одному
компоненту, **Решение — не компонент** ловит задачи, которые компонентом не
решаются, **Составные семейства** показывают, из чего собран выбранный компонент,
**Быстрый выбор** — алфавитный список на случай, когда имя уже известно.
Подробности всегда на странице компонента: она объясняет, почему устроено так, и
где проходит граница с соседом.

Карта живёт в корне репозитория, а не в пакете: она ссылается на все пакеты
сразу, поэтому в опубликованный тарбол любого из них попасть не может.

## Развилки

### Ввод значения руками

| Что вводят | Компонент |
| --- | --- |
| строку в одну строку | [`GrInput`](../packages/granularity/docs/components/GrInput.md) |
| текст в несколько строк | [`GrTextarea`](../packages/granularity/docs/components/GrTextarea.md) |
| текст с форматированием: абзацы, списки, заголовки | [`GrRichText`](../packages/granularity-editor/docs/components/GrRichText.md) |
| число со ступенями и границами | [`GrNumberInput`](../packages/granularity/docs/components/GrNumberInput.md) |
| число перетаскиванием, диапазон «от–до» | [`GrSlider`](../packages/granularity/docs/components/GrSlider.md) |
| оценку символами | [`GrRating`](../packages/granularity/docs/components/GrRating.md) |
| цвет | [`GrColorPicker`](../packages/granularity/docs/components/GrColorPicker.md) |
| набор своих строк-тегов | [`GrInputTag`](../packages/granularity/docs/components/GrInputTag.md) |
| файл как значение поля формы | [`GrFormFile`](../packages/granularity/docs/components/GrFormFile.md) |
| файл с отправкой на сервер и прогрессом | [`GrFileUpload`](../packages/granularity/docs/components/GrFileUpload.md) |

Граница `GrFormFile` / `GrFileUpload` — кто отправляет. У первого файл это
значение `v-model`, отправляет форма; второй грузит сам и показывает прогресс.

### Файл, который уже лежит

Различитель — **что с файлом делают**: отправляют новый (развилка выше) или
показывают сохранённый.

| Что происходит | Компонент |
| --- | --- |
| плитка вложения в ленте: картинка либо иконка по типу | [`GrFilePreview`](../packages/granularity/docs/components/GrFilePreview.md) |
| картинку рассматривают во весь экран | [`GrImageViewer`](../packages/granularity/docs/components/GrImageViewer.md) |
| набор картинок листают прямо на странице | [`GrCarousel`](../packages/granularity/docs/components/GrCarousel.md) |
| из картинки вырезают кадр перед отправкой | [`GrImageCrop`](../packages/granularity-media/docs/components/GrImageCrop.md) |
| картинку снимают камерой прямо сейчас | [`GrCameraCapture`](../packages/granularity-media/docs/components/GrCameraCapture.md) |
| камерой читают QR или штрихкод | [`GrCodeScanner`](../packages/granularity-media/docs/components/GrCodeScanner.md) |
| видео проигрывают на странице | [`GrVideoPlayer`](../packages/granularity-media/docs/components/GrVideoPlayer.md) |
| показать содержимое файла текстом | [`GrCodeBlock`](../packages/granularity-code/docs/components/GrCodeBlock.md) |

Различитель `GrCodeScanner` / `GrCameraCapture` — **что уходит наружу**: у
первого строка из кода, у второго файл. Сканер кадр не сохраняет вовсе.

Различитель `GrCameraCapture` / `GrImageCrop` — **откуда берётся картинка**: первый
её создаёт, второй обрабатывает уже существующую. Рядом они и работают: снял —
кадрировал.

Различитель `GrImageViewer` / `GrImageCrop` — **что остаётся после**. Первый
ничего не меняет: пользователь посмотрел и закрыл. Второй производит новый
файл, и его результат уезжает на сервер.

`GrFilePreview` просмотрщик не открывает — он эмитит `click`, а окно показывает
потребитель. Пары «плитка + просмотрщик» одним компонентом в пакете нет
намеренно: набор плиток и просмотр набора — разные состояния страницы.

### Выбор из набора готовых значений

Различитель — **сколько вариантов**, **просматривают их или ищут** и **какова
судьба выбранного**.

| Что происходит | Компонент |
| --- | --- |
| 2–5 вариантов, все видны, один активен | [`GrSegmented`](../packages/granularity/docs/components/GrSegmented.md) |
| до ~7 вариантов вертикально, значение формы | [`GrRadioGroup`](../packages/granularity/docs/components/GrRadioGroup.md) |
| один переключатель вне группы | [`GrRadio`](../packages/granularity/docs/components/GrRadio.md) |
| несколько значений из короткого списка | [`GrCheckboxGroup`](../packages/granularity/docs/components/GrCheckboxGroup.md) |
| 5–50 вариантов, список закрыт, их просматривают | [`GrSelect`](../packages/granularity/docs/components/GrSelect.md) |
| десятки и больше, их ищут вводом | [`GrAutocomplete`](../packages/granularity/docs/components/GrAutocomplete.md) |
| выбранное — само список: его видят целиком и упорядочивают | [`GrTransfer`](../packages/granularity/docs/components/GrTransfer.md) |
| варианты — дерево с уровнями | [`GrTreeSelect`](../packages/granularity/docs/components/GrTreeSelect.md) |
| справочника нет, значения вводят свои | [`GrInputTag`](../packages/granularity/docs/components/GrInputTag.md) |
| выбирают команду приложения, а не значение поля | [`GrCommandPalette`](../packages/granularity/docs/components/GrCommandPalette.md) |

`GrSelect` против `GrAutocomplete` — не режим одного компонента: там пользователь
выбирает из готового списка, здесь ищет вводом, и роль `combobox` носят разные
элементы.

`GrCheckboxGroup`, `GrSelect` с `multiple` и `GrTransfer` — три ответа на «выбрать
несколько», и различает их **судьба выбранного**: у группы чекбоксов оно совпадает
со списком вариантов, у селекта сжато в строку триггера, у трансфера это
самостоятельная панель со своим порядком. Порядок и есть водораздел — он значим
только в третьем случае.

`GrTransfer` против `GrSortableList` — **один список или два**: первый переносит
через границу, второй переставляет внутри неё.

### Двоичный выбор и переключение режима

Различитель — **когда применяется**.

| Что происходит | Компонент |
| --- | --- |
| настройка включается немедленно, без «Сохранить» | [`GrSwitch`](../packages/granularity/docs/components/GrSwitch.md) |
| значение уедет с отправкой формы | [`GrCheckbox`](../packages/granularity/docs/components/GrCheckbox.md) |
| 2–5 режимов отображения одного и того же | [`GrSegmented`](../packages/granularity/docs/components/GrSegmented.md) |
| разделы с разным содержимым | [`GrTabs`](../packages/granularity/docs/components/GrTabs.md) + [`GrTabPanels`](../packages/granularity/docs/components/GrTabPanels.md) |

### Форма как целое

| Нужно | Берите |
| --- | --- |
| обвязка одного поля: подпись, подсказка, ошибка, `id` | [`GrFormField`](../packages/granularity/docs/components/GrFormField.md) |
| правила валидации, блокировка отправки, скролл к ошибке | [`GrForm`](../packages/granularity/docs/components/GrForm.md) |
| смысловой блок полей с заголовком | [`GrFormSection`](../packages/granularity/docs/components/GrFormSection.md) |
| дефолты, размер, локаль и тема на всё поддерево | [`GrConfigProvider`](../packages/granularity/docs/components/GrConfigProvider.md) |
| поля описаны схемой бэкенда — zod, JSON Schema, OpenAPI | [`GrSchemaForm`](../packages/granularity-forms-schema/docs/components/GrSchemaForm.md) |

Контролы про форму не знают: оркестрация подключается через `GrFormField` по
`name`, поэтому в валидацию попадает любой существующий контрол без правок.

### Слой поверх страницы

Различитель двойной: **что показываем** и **блокирует ли это страницу**.

| Что показываем | Блокирует страницу | Компонент |
| --- | --- | --- |
| текстовую подсказку к контролу | нет | [`GrTooltip`](../packages/granularity/docs/components/GrTooltip.md) |
| список действий, пункты готовые | нет | [`GrDropdownMenu`](../packages/granularity/docs/components/GrDropdownMenu.md) |
| список действий, пункты свои | нет | [`GrDropdown`](../packages/granularity/docs/components/GrDropdown.md) |
| список действий по правому клику, у курсора | нет | [`GrContextMenu`](../packages/granularity/docs/components/GrContextMenu.md) |
| произвольное содержимое у якоря | по `modal` | [`GrPopover`](../packages/granularity/docs/components/GrPopover.md) |
| окно «шапка — тело — подвал» | да | [`GrDialog`](../packages/granularity/docs/components/GrDialog.md) |
| окно с нестандартной раскладкой | да | [`GrModal`](../packages/granularity/docs/components/GrModal.md) |
| панель у края экрана | по `modal` | [`GrDrawer`](../packages/granularity/docs/components/GrDrawer.md) |
| «да/нет» по опасному действию | да | [`GrConfirmDialog`](../packages/granularity/docs/components/GrConfirmDialog.md) |
| запрос одного значения | да | [`GrPromptDialog`](../packages/granularity/docs/components/GrPromptDialog.md) |
| то же, но вызовом из кода, без разметки | да | [`GrDialogService`](../packages/granularity/docs/components/GrDialogService.md) |
| поиск по командам приложения (⌘K) | да | [`GrCommandPalette`](../packages/granularity/docs/components/GrCommandPalette.md) |
| изображение во весь экран | да | [`GrImageViewer`](../packages/granularity/docs/components/GrImageViewer.md) |

`GrTooltip` не годится ни для чего интерактивного: панель не принимает
указатель, навести на неё курсор нельзя. Нужен интерактив у якоря — `GrPopover`.

### Список строк и таблица

Различитель — **кто рисует строку** и **что с ней можно делать**.

| Что происходит | Компонент |
| --- | --- |
| строки однородные, разметку даёт компонент | [`GrList`](../packages/granularity/docs/components/GrList.md) |
| строки — пары «характеристика → значение» | [`GrDescriptionList`](../packages/granularity/docs/components/GrDescriptionList.md) |
| пары — метаданные строкой, а не столбцом | [`GrDescriptionList`](../packages/granularity/docs/components/GrDescriptionList.md) с `layout="flow"` |
| таблица данных: сортировка, выбор строк, колонки, итог | [`GrDataTable`](../packages/granularity/docs/components/GrDataTable.md) |
| разметку `<tr>`/`<td>` пишет потребитель | [`GrTable`](../packages/granularity/docs/components/GrTable.md) |
| строки вложены друг в друга | [`GrTree`](../packages/granularity/docs/components/GrTree.md) |
| строки переносят из одного списка в другой | [`GrTransfer`](../packages/granularity/docs/components/GrTransfer.md) |
| порядок строк меняет пользователь | [`GrSortableList`](../packages/granularity/docs/components/GrSortableList.md) |
| строки — события во времени | [`GrTimeline`](../packages/granularity/docs/components/GrTimeline.md) |
| строк больше, чем помещается на экран | [`GrPagination`](../packages/granularity/docs/components/GrPagination.md) |
| строк тысячи, и страницы не нужны | [`GrList`](../packages/granularity/docs/components/GrList.md) / [`GrDataTable`](../packages/granularity/docs/components/GrDataTable.md) с `virtual` |

По умолчанию берут `GrDataTable`: сортировка, выбор, порядок и ширина колонок,
итог и виртуализация уже внутри. `GrTable` — обёртка над чужой разметкой: она
добавляет `caption`, состояния и скролл-регион, не трогая `<tr>` и `<td>`.

Компонента, связывающего таблицу с фильтрами и пагинацией, в карте нет намеренно:
это не компонент, а **состояние**. Сортировка, фильтры, страница, поиск, адресная
строка и защита от гонок живут в `useDataSource`
([`granularity-datasource`](../packages/granularity-datasource/README.md)) —
он отдаёт готовые объекты пропов, которые раскрываются в `GrDataTable` и
`GrPagination` через `v-bind`.

### Сообщение пользователю

Различитель — **откуда пришло** и **сколько живёт**.

| Что происходит | Компонент |
| --- | --- |
| сообщение в потоке страницы, живёт пока актуально | [`GrAlert`](../packages/granularity/docs/components/GrAlert.md) |
| сообщение приходит поверх страницы и уходит само | [`GrToaster`](../packages/granularity/docs/components/GrToaster.md) |
| ошибка ответа сервера: статус, детали, «Повторить» | [`GrResponseErrorBanner`](../packages/granularity/docs/components/GrResponseErrorBanner.md) |
| на экране пусто, и надо объяснить почему | [`GrEmptyState`](../packages/granularity/docs/components/GrEmptyState.md) |

`GrToaster` на приложение ставится **один**: очередь живёт в `useToast`.

### Загрузка и ожидание

Различитель — **знаем ли долю выполненного** и **что происходит с контентом**.

| Что происходит | Компонент |
| --- | --- |
| контента ещё нет, показываем его форму | [`GrSkeleton`](../packages/granularity/docs/components/GrSkeleton.md) |
| контент есть, но занят — гасим его целиком | [`GrLoading`](../packages/granularity/docs/components/GrLoading.md) |
| доля известна, места по ширине хватает | [`GrProgressBar`](../packages/granularity/docs/components/GrProgressBar.md) |
| доля известна, места по ширине нет | [`GrProgressCircle`](../packages/granularity/docs/components/GrProgressCircle.md) |
| загрузка закончилась, и данных не оказалось | [`GrEmptyState`](../packages/granularity/docs/components/GrEmptyState.md) |

### Навигация по приложению

| Где | Компонент |
| --- | --- |
| верхняя панель, лендмарк `banner` | [`GrNavbar`](../packages/granularity/docs/components/GrNavbar.md) |
| боковое меню, сворачиваемое до иконок | [`GrSidebar`](../packages/granularity/docs/components/GrSidebar.md) |
| нижняя панель разделов на мобильном | [`GrBottomNav`](../packages/granularity/docs/components/GrBottomNav.md) |
| путь до текущей страницы | [`GrBreadcrumbs`](../packages/granularity/docs/components/GrBreadcrumbs.md) |
| разделы внутри одной страницы | [`GrTabs`](../packages/granularity/docs/components/GrTabs.md) + [`GrTabPanels`](../packages/granularity/docs/components/GrTabPanels.md) |
| оглавление длинной страницы, подсветка по прокрутке | [`GrScrollSpy`](../packages/granularity/docs/components/GrScrollSpy.md) |
| этапы процесса по порядку | [`GrSteps`](../packages/granularity/docs/components/GrSteps.md) |
| страницы длинного списка | [`GrPagination`](../packages/granularity/docs/components/GrPagination.md) |
| одиночный переход | [`GrLink`](../packages/granularity/docs/components/GrLink.md) |

Различитель между вкладками и шагами — **порядок**: вкладки равноправны и
переключаются как угодно, шаги идут один за другим, помнят пройденное и умеют не
пустить вперёд. Отсюда у шагов `aria-current`, а у вкладок `aria-selected`.

Различитель `GrScrollSpy` / `GrTabs` — **скрыты ли разделы**. У вкладок в DOM живёт
только текущая панель, и пользователь выбирает раздел; у оглавления все разделы на
странице сразу, читатель идёт по ним подряд, а оглавление лишь показывает, где он.
Отсюда и роли: `tablist` с `tabpanel` против `navigation` со ссылками.

### Действие

| Что происходит | Компонент |
| --- | --- |
| действие на месте | [`GrButton`](../packages/granularity/docs/components/GrButton.md) |
| несколько действий одного класса в ряд | [`GrButtonGroup`](../packages/granularity/docs/components/GrButtonGroup.md) |
| действий много, они прячутся под кнопку | [`GrDropdownMenu`](../packages/granularity/docs/components/GrDropdownMenu.md) |
| переход, а не действие | [`GrLink`](../packages/granularity/docs/components/GrLink.md) |

Кнопка меняет состояние, ссылка меняет адрес. Ссылка, стилизованная под кнопку,
остаётся ссылкой — у `GrButton` для этого есть подмена корневого тега.

### Метка, подпись, значение

| Что показываем | Компонент |
| --- | --- |
| статус или ярлык текстом | [`GrBadge`](../packages/granularity/docs/components/GrBadge.md) |
| снимаемую или выбираемую метку | [`GrChip`](../packages/granularity/docs/components/GrChip.md) |
| набор таких меток с общим выбором | [`GrChipGroup`](../packages/granularity/docs/components/GrChipGroup.md) |
| счётчик поверх чужого контрола | [`GrBadgeWrap`](../packages/granularity/docs/components/GrBadgeWrap.md) |
| человека или сущность картинкой | [`GrAvatar`](../packages/granularity/docs/components/GrAvatar.md) |
| иконку из любого набора | [`GrIcon`](../packages/granularity/docs/components/GrIcon.md) |
| клавишу или сочетание | [`GrKbd`](../packages/granularity/docs/components/GrKbd.md) |
| крупный числовой показатель с динамикой | [`GrStatistic`](../packages/granularity/docs/components/GrStatistic.md) |
| величину со знаком и тоном внутри строки текста | [`GrDelta`](../packages/granularity/docs/components/GrDelta.md) |
| величину с припиской — валютой, единицей — и ничего сверх | [`GrValue`](../packages/granularity/docs/components/GrValue.md) |

Различитель между бейджем и чипом — **интерактив**, а не вид: по чипу кликают,
его снимают, он получает фокус. Отсюда у него роль, клавиатура и высота цели
нажатия, которых у метки нет и быть не должно.

Различитель у первых двух — **место в вёрстке**, а не тип величины:
`GrStatistic` это блочная плитка со своей подписью, `GrDelta` — фрагмент
предложения, у которого ни подписи, ни поверхности нет.

`GrValue` — примитив под обоими: он показывает запись величины и решает, как
выглядят её приписки. Берут его напрямую, когда пишут свой компонент с
величиной и не хотят ни знака с тоном, ни плитки с подписью.

### Технические данные как есть

Значение пришло `unknown` из БД или от чужого сервиса, и показать его надо
целиком, ничего не переписывая. Различитель — **читают или обходят**.

| Что происходит | Компонент |
| --- | --- |
| текст или JSON читают целиком и копируют | [`GrCodeBlock`](../packages/granularity-code/docs/components/GrCodeBlock.md) |
| код **правят**, а не читают | [`GrCodeEditor`](../packages/granularity-code/docs/components/GrCodeEditor.md) |
| две версии **сравнивают**: что изменилось | [`GrDiff`](../packages/granularity-code/docs/components/GrDiff.md) |
| по чужому `unknown` ходят: сворачивают узлы, ищут ключ | [`GrJsonViewer`](../packages/granularity/docs/components/GrJsonViewer.md) |
| дерево своих данных: выбор узла, чекбоксы, перенос | [`GrTree`](../packages/granularity/docs/components/GrTree.md) |
| то же, но верхний уровень — рубрика, а не узел | [`GrTreeSections`](../packages/granularity/docs/components/GrTreeSections.md) |
| данные разложены по колонкам и известны заранее | [`GrDataTable`](../packages/granularity/docs/components/GrDataTable.md) |
| это пара «характеристика → значение», а не документ | [`GrDescriptionList`](../packages/granularity/docs/components/GrDescriptionList.md) |

Первые три — один пакет `@feugene/granularity-code` и один вопрос из трёх слов:
**показать, править, сравнить**. Различитель между ними — глагол, и другого не
нужно. Платит за это только тот, кому нужен редактор: блок и дифф не тянут ни
одной зависимости, CodeMirror приезжает лишь с `GrCodeEditor`.

Различитель между `GrCodeBlock` и `GrJsonViewer` — **читают или ищут**. Ответ на двести строк
копируют в тикет целиком (`GrCodeBlock`); в ответе на две тысячи узлов ищут одно
поле (`GrJsonViewer`). Между `GrJsonViewer` и `GrTree` различитель другой — чьи
данные: первый разбирает `unknown` сам, второму дерево приносят готовым.

### Раскладка и поверхности

| Что нужно | Компонент |
| --- | --- |
| поверхность с рамкой, фоном и тенью | [`GrCard`](../packages/granularity/docs/components/GrCard.md) |
| блок остаётся на виду при прокрутке | [`GrAffix`](../packages/granularity/docs/components/GrAffix.md) |
| разделить контент линией | [`GrDivider`](../packages/granularity/docs/components/GrDivider.md) |
| две панели, границу двигает пользователь | [`GrSplitter`](../packages/granularity/docs/components/GrSplitter.md) |
| содержимого много, показывают не всё сразу | [`GrCollapse`](../packages/granularity/docs/components/GrCollapse.md) |
| кадры листают вбок, по одному за раз | [`GrCarousel`](../packages/granularity/docs/components/GrCarousel.md) |
| сетка виджетов, которую двигает пользователь | [`GrDashboard`](../packages/granularity-dashboard/docs/components/GrDashboard.md) |
| виджет на такой сетке | [`GrDashboardItem`](../packages/granularity-dashboard/docs/components/GrDashboardItem.md) |
| переключатель режима и сброс раскладки | [`GrDashboardToolbar`](../packages/granularity-dashboard/docs/components/GrDashboardToolbar.md) |
| каталог виджетов для добавления | [`GrDashboardPalette`](../packages/granularity-dashboard/docs/components/GrDashboardPalette.md) |
| окно параметров одного виджета | [`GrDashboardItemSettings`](../packages/granularity-dashboard/docs/components/GrDashboardItemSettings.md) |

`GrSplitter` — про размер двух областей, `GrDashboard` — про положение многих
виджетов на сетке. Общего у них только жест.

Различитель `GrCarousel` / `GrTabs` — **назван ли раздел**. У вкладок каждый
раздел имеет имя, и пользователь выбирает конкретный («Доставка», «Отзывы»); у
карусели кадры равноправны и безымянны, их листают по порядку. Отсюда и разные
роли: `tablist` с `tabpanel` против `group` с `aria-roledescription="carousel"`.

Различитель `GrCarousel` / `GrImageViewer` — **где происходит просмотр**. Карусель
живёт в потоке страницы, и страница остаётся рабочей; просмотрщик открывает кадр
поверх неё, с масштабом и поворотом. Пара штатная: карусель отдаёт клик по кадру,
просмотрщик открывает приложение.

Различитель `GrCarousel` / `GrCollapse` — **сколько показано разом**. Аккордеон
раскрывает несколько секций сразу и растёт вниз; карусель всегда показывает одно
окно постоянной ширины и двигает его вбок.

Различитель `GrAffix` / `GrNavbar` — **чей это край**. Шапка приложения одна, она
лендмарк и всегда непрозрачна; аффикс — любой блок внутри своего блока, и фон с
тенью он получает только прилипнув. Заголовок `GrTable` и закреплённые колонки
`GrDataTable` — тот же приём внутри таблицы, отдельного компонента для них не надо.

### График

Различитель — **вопрос, который задают данным**.

| Вопрос к данным | Компонент |
| --- | --- |
| как величина менялась | [`GrChartLine`](../packages/granularity-charts/docs/components/GrChartLine.md) |
| как менялось целое и вклад частей в него | [`GrChartArea`](../packages/granularity-charts/docs/components/GrChartArea.md) |
| сколько у каждой категории | [`GrChartBar`](../packages/granularity-charts/docs/components/GrChartBar.md) |
| из чего состоит одно целое | [`GrChartPie`](../packages/granularity-charts/docs/components/GrChartPie.md) |
| как из начала периода получился конец | [`GrChartWaterfall`](../packages/granularity-charts/docs/components/GrChartWaterfall.md) |
| где теряются пользователи между ступенями | [`GrChartFunnel`](../packages/granularity-charts/docs/components/GrChartFunnel.md) |
| какой формы профиль по нескольким осям | [`GrChartRadar`](../packages/granularity-charts/docs/components/GrChartRadar.md) |
| где горячо в матрице двух измерений | [`GrChartHeatmap`](../packages/granularity-charts/docs/components/GrChartHeatmap.md) |
| тренд в ячейке таблицы или в карточке | [`GrSparkline`](../packages/granularity-charts/docs/components/GrSparkline.md) |
| насколько величина близка к цели и к порогу | [`GrChartBullet`](../packages/granularity-charts/docs/components/GrChartBullet.md) |
| какая доля одного показателя набрана | [`GrProgressCircle`](../packages/granularity/docs/components/GrProgressCircle.md) |
| одно число крупно, с динамикой | [`GrStatistic`](../packages/granularity/docs/components/GrStatistic.md) |

Одно число — не график: `GrStatistic` и `GrProgressCircle` из ядра, за ними не
тянется пакет графиков.

### Дата и время

Различитель — **вводят или показывают** и **момент это или длина промежутка**.

| Что происходит | Компонент |
| --- | --- |
| вводят дату | [`GrDatePicker`](../packages/granularity-chrono/docs/components/GrDatePicker.md) |
| вводят период «с — по» | [`GrDateRangePicker`](../packages/granularity-chrono/docs/components/GrDateRangePicker.md) |
| вводят дату и время вместе | [`GrDateTimePicker`](../packages/granularity-chrono/docs/components/GrDateTimePicker.md) |
| вводят только время | [`GrTimePicker`](../packages/granularity-chrono/docs/components/GrTimePicker.md) |
| сетка месяца нужна сама по себе, без поля | [`GrCalendar`](../packages/granularity-chrono/docs/components/GrCalendar.md) |
| показывают момент относительно сейчас | [`GrRelativeTime`](../packages/granularity-chrono/docs/components/GrRelativeTime.md) |
| показывают, сколько длилось | [`GrDuration`](../packages/granularity-chrono/docs/components/GrDuration.md) |

Календарь событий, агенду и Гант этот пакет не закрывает — см. «Чего в
экосистеме нет».

## Решение — не компонент

Задачи, с которыми приходят в карту, но закрывает их директива или composable.
Компонента под них нет и не будет: разметку в этих случаях пишет потребитель.

| Задача | Чем закрывается |
| --- | --- |
| индикатор поверх готового блока, императивно | `v-loading` — [директивы](../packages/granularity/docs/directives.md) |
| строк тысячи, а разметку строки пишете свою | `useVirtualList` — [виртуализация](../packages/granularity/docs/virtual-list.md) |
| светлая и тёмная тема приложения | `useTheme` — [темы](../packages/granularity/docs/theming.md) |
| уведомление из кода | `useToast` — очередь единственного [`GrToaster`](../packages/granularity/docs/components/GrToaster.md) |
| таблица ↔ фильтры ↔ страница ↔ URL ↔ сервер | `useDataSource` — [`granularity-datasource`](../packages/granularity-datasource/README.md) |
| горячие клавиши на элементе | `v-hotkey` — [директивы](../packages/granularity/docs/directives.md) |
| файлы бросают на свою область | `v-dropzone` — [директивы](../packages/granularity/docs/directives.md) |
| высота поля растёт по содержимому | `v-autosize` — [директивы](../packages/granularity/docs/directives.md) |
| перетаскивание в своём списке | `useDragSort` — [перенос строк](../packages/granularity/docs/drag-sort.md) |
| изменение надо объявить скринридеру | `useAnnouncer` — [живой регион](../packages/granularity/docs/announcer.md) |
| свой оверлей: слой, фокус, закрытие, позиция | `useOverlayLayer`, `useFocusTrap`, `useDismissible`, `useFloating` — [оверлеи](../packages/granularity/docs/overlays.md) |

Дефолты контролов, локаль и тему поддерева задаёт `GrConfigProvider` — он в
развилке «Форма как целое», хотя действует на всё приложение.

## Составные семейства

Части приезжают из того же subpath, что и родитель, — отдельно их не подключают.
Подробности всегда на странице родителя.

| Родитель | Части |
| --- | --- |
| [`GrAvatar`](../packages/granularity/docs/components/GrAvatar.md) | `GrAvatarGroup` |
| [`GrCarousel`](../packages/granularity/docs/components/GrCarousel.md) | `GrCarouselSlide` |
| [`GrCollapse`](../packages/granularity/docs/components/GrCollapse.md) | `GrCollapseItem` |
| [`GrDialog`](../packages/granularity/docs/components/GrDialog.md) | `GrDialogHeader`, `GrDialogFooter`, `GrDialogCloseButton` |
| [`GrDialogService`](../packages/granularity/docs/components/GrDialogService.md) | `GrDialogServiceHost` |
| [`GrDropdownMenu`](../packages/granularity/docs/components/GrDropdownMenu.md) | `GrDropdownMenuList`, `GrDropdownMenuGroup`, `GrDropdownMenuHeader`, `GrDropdownMenuItem`, `GrDropdownMenuDivider`, `GrDropdownMenuColumns`, `GrDropdownMenuColumn` |
| [`GrList`](../packages/granularity/docs/components/GrList.md) | `GrListItem` |
| [`GrResponseErrorBanner`](../packages/granularity/docs/components/GrResponseErrorBanner.md) | `GrFormErrorBanner`, `GrUploadErrorBanner` |
| [`GrSchemaForm`](../packages/granularity-forms-schema/docs/components/GrSchemaForm.md) | `GrSchemaField`, `GrSchemaArrayField`, `GrSchemaUnionField`, `GrSchemaAdditionalFields` |
| [`GrSidebar`](../packages/granularity/docs/components/GrSidebar.md) | `GrSidebarGroup`, `GrSidebarItem` |
| [`GrTabPanels`](../packages/granularity/docs/components/GrTabPanels.md) | `GrTabPanel` |
| [`GrTimeline`](../packages/granularity/docs/components/GrTimeline.md) | `GrTimelineItem` |

## Быстрый выбор

Алфавитный список всех публичных компонентов экосистемы. Колонка «Берут, когда»
повторяет первый пункт секции `## Когда брать` соответствующей страницы.

<!-- component-map:generated:start -->
| Компонент | Пакет | Берут, когда |
| --- | --- | --- |
| [`GrAffix`](../packages/granularity/docs/components/GrAffix.md) | ядро | действия длинной формы |
| [`GrAlert`](../packages/granularity/docs/components/GrAlert.md) | ядро | сообщение относится к месту на странице |
| [`GrAutocomplete`](../packages/granularity/docs/components/GrAutocomplete.md) | ядро | вариантов слишком много для списка |
| [`GrAvatar`](../packages/granularity/docs/components/GrAvatar.md) | ядро | человека или сущность узнают по картинке |
| [`GrBadge`](../packages/granularity/docs/components/GrBadge.md) | ядро | статус нужен словом |
| [`GrBadgeWrap`](../packages/granularity/docs/components/GrBadgeWrap.md) | ядро | счётчик относится к контролу |
| [`GrBottomNav`](../packages/granularity/docs/components/GrBottomNav.md) | ядро | мобильный интерфейс |
| [`GrBreadcrumbs`](../packages/granularity/docs/components/GrBreadcrumbs.md) | ядро | вложенность реальна |
| [`GrButton`](../packages/granularity/docs/components/GrButton.md) | ядро | действие меняет состояние |
| [`GrButtonGroup`](../packages/granularity/docs/components/GrButtonGroup.md) | ядро | действия одного класса стоят рядом |
| [`GrCalendar`](../packages/granularity-chrono/docs/components/GrCalendar.md) | chrono | календарь и есть экран |
| [`GrCameraCapture`](../packages/granularity-media/docs/components/GrCameraCapture.md) | media | аватар без файлового менеджера |
| [`GrCard`](../packages/granularity/docs/components/GrCard.md) | ядро | контенту нужна поверхность |
| [`GrCarousel`](../packages/granularity/docs/components/GrCarousel.md) | ядро | галерея товара или объекта |
| [`GrChartArea`](../packages/granularity-charts/docs/components/GrChartArea.md) | charts | целое и вклад частей в него во времени |
| [`GrChartBar`](../packages/granularity-charts/docs/components/GrChartBar.md) | charts | сколько у каждой категории |
| [`GrChartBullet`](../packages/granularity-charts/docs/components/GrChartBullet.md) | charts | метрика с порогами, которые уже есть в данных |
| [`GrChartFunnel`](../packages/granularity-charts/docs/components/GrChartFunnel.md) | charts | последовательность ступеней, где каждая — подмножество предыдущей |
| [`GrChartHeatmap`](../packages/granularity-charts/docs/components/GrChartHeatmap.md) | charts | матрица удержания по когортам |
| [`GrChartLine`](../packages/granularity-charts/docs/components/GrChartLine.md) | charts | как величина менялась |
| [`GrChartPie`](../packages/granularity-charts/docs/components/GrChartPie.md) | charts | из чего состоит одно целое |
| [`GrChartRadar`](../packages/granularity-charts/docs/components/GrChartRadar.md) | charts | форма профиля по нескольким метрикам |
| [`GrChartWaterfall`](../packages/granularity-charts/docs/components/GrChartWaterfall.md) | charts | движение от остатка к остатку |
| [`GrCheckbox`](../packages/granularity/docs/components/GrCheckbox.md) | ядро | согласие или флаг в форме |
| [`GrCheckboxGroup`](../packages/granularity/docs/components/GrCheckboxGroup.md) | ядро | значений несколько из короткого набора |
| [`GrChip`](../packages/granularity/docs/components/GrChip.md) | ядро | снимаемая метка у сущности |
| [`GrChipGroup`](../packages/granularity/docs/components/GrChipGroup.md) | ядро | фильтры списка строкой |
| [`GrCodeBlock`](../packages/granularity-code/docs/components/GrCodeBlock.md) | code | показать ответ сервиса как есть |
| [`GrCodeEditor`](../packages/granularity-code/docs/components/GrCodeEditor.md) | code | Конфиг в админке |
| [`GrCodeScanner`](../packages/granularity-media/docs/components/GrCodeScanner.md) | media | вход по QR |
| [`GrCollapse`](../packages/granularity/docs/components/GrCollapse.md) | ядро | содержимого много, а нужно не всё сразу |
| [`GrColorPicker`](../packages/granularity/docs/components/GrColorPicker.md) | ядро | цвет задаёт пользователь |
| [`GrCommandPalette`](../packages/granularity/docs/components/GrCommandPalette.md) | ядро | команд много и они разбросаны по интерфейсу |
| [`GrConfigProvider`](../packages/granularity/docs/components/GrConfigProvider.md) | ядро | размеры контролов едины на приложение |
| [`GrConfirmDialog`](../packages/granularity/docs/components/GrConfirmDialog.md) | ядро | действие необратимо |
| [`GrContextMenu`](../packages/granularity/docs/components/GrContextMenu.md) | ядро | действия над строкой списка или узлом дерева |
| [`GrDashboard`](../packages/granularity-dashboard/docs/components/GrDashboard.md) | dashboard | раскладку определяет пользователь |
| [`GrDashboardItem`](../packages/granularity-dashboard/docs/components/GrDashboardItem.md) | dashboard | любой виджет внутри `GrDashboard` |
| [`GrDashboardItemSettings`](../packages/granularity-dashboard/docs/components/GrDashboardItemSettings.md) | dashboard | у виджета есть что настраивать |
| [`GrDashboardPalette`](../packages/granularity-dashboard/docs/components/GrDashboardPalette.md) | dashboard | набор виджетов выбирает пользователь |
| [`GrDashboardToolbar`](../packages/granularity-dashboard/docs/components/GrDashboardToolbar.md) | dashboard | дашборд редактируемый |
| [`GrDataTable`](../packages/granularity/docs/components/GrDataTable.md) | ядро | строки сортируют |
| [`GrDatePicker`](../packages/granularity-chrono/docs/components/GrDatePicker.md) | chrono | дата — значение поля формы |
| [`GrDateRangePicker`](../packages/granularity-chrono/docs/components/GrDateRangePicker.md) | chrono | отчёт за период |
| [`GrDateTimePicker`](../packages/granularity-chrono/docs/components/GrDateTimePicker.md) | chrono | момент, а не день |
| [`GrDelta`](../packages/granularity/docs/components/GrDelta.md) | ядро | число со знаком стоит в предложении |
| [`GrDescriptionList`](../packages/granularity/docs/components/GrDescriptionList.md) | ядро | карточка объекта |
| [`GrDialog`](../packages/granularity/docs/components/GrDialog.md) | ядро | окно с шапкой, телом и подвалом |
| [`GrDialogService`](../packages/granularity/docs/components/GrDialogService.md) | ядро | окно вызывается из кода |
| [`GrDiff`](../packages/granularity-code/docs/components/GrDiff.md) | code | Журнал аудита |
| [`GrDivider`](../packages/granularity/docs/components/GrDivider.md) | ядро | блоки надо разделить |
| [`GrDrawer`](../packages/granularity/docs/components/GrDrawer.md) | ядро | панель приходит от края |
| [`GrDropdown`](../packages/granularity/docs/components/GrDropdown.md) | ядро | меню со своими пунктами |
| [`GrDropdownMenu`](../packages/granularity/docs/components/GrDropdownMenu.md) | ядро | действия над объектом |
| [`GrDuration`](../packages/granularity-chrono/docs/components/GrDuration.md) | chrono | сколько заняло |
| [`GrEmptyState`](../packages/granularity/docs/components/GrEmptyState.md) | ядро | список пуст с самого начала |
| [`GrFilePreview`](../packages/granularity/docs/components/GrFilePreview.md) | ядро | лента вложений |
| [`GrFileUpload`](../packages/granularity/docs/components/GrFileUpload.md) | ядро | файл уходит на сервер сразу |
| [`GrForm`](../packages/granularity/docs/components/GrForm.md) | ядро | полей больше одного и они проверяются |
| [`GrFormField`](../packages/granularity/docs/components/GrFormField.md) | ядро | у поля есть подпись |
| [`GrFormFile`](../packages/granularity/docs/components/GrFormFile.md) | ядро | файл — значение поля |
| [`GrFormSection`](../packages/granularity/docs/components/GrFormSection.md) | ядро | форма длинная |
| [`GrIcon`](../packages/granularity/docs/components/GrIcon.md) | ядро | иконке нужен единый размер |
| [`GrImageCrop`](../packages/granularity-media/docs/components/GrImageCrop.md) | media | аватар из загруженного файла |
| [`GrImageViewer`](../packages/granularity/docs/components/GrImageViewer.md) | ядро | картинку нужно рассмотреть |
| [`GrInput`](../packages/granularity/docs/components/GrInput.md) | ядро | вводится строка |
| [`GrInputTag`](../packages/granularity/docs/components/GrInputTag.md) | ядро | значения придумывает пользователь |
| [`GrJsonViewer`](../packages/granularity/docs/components/GrJsonViewer.md) | ядро | ответ чужого сервиса разбирают по полям |
| [`GrKbd`](../packages/granularity/docs/components/GrKbd.md) | ядро | показывается сочетание клавиш |
| [`GrLink`](../packages/granularity/docs/components/GrLink.md) | ядро | нужен переход |
| [`GrList`](../packages/granularity/docs/components/GrList.md) | ядро | строки однородные |
| [`GrLoading`](../packages/granularity/docs/components/GrLoading.md) | ядро | контент уже есть и обновляется |
| [`GrModal`](../packages/granularity/docs/components/GrModal.md) | ядро | своя раскладка поверх страницы |
| [`GrNavbar`](../packages/granularity/docs/components/GrNavbar.md) | ядро | у приложения есть верхняя панель |
| [`GrNumberInput`](../packages/granularity/docs/components/GrNumberInput.md) | ядро | значение числовое |
| [`GrPagination`](../packages/granularity/docs/components/GrPagination.md) | ядро | список не помещается на экран |
| [`GrPopover`](../packages/granularity/docs/components/GrPopover.md) | ядро | своё содержимое у якоря |
| [`GrProgressBar`](../packages/granularity/docs/components/GrProgressBar.md) | ядро | доля выполненного известна |
| [`GrProgressCircle`](../packages/granularity/docs/components/GrProgressCircle.md) | ядро | места по ширине нет |
| [`GrPromptDialog`](../packages/granularity/docs/components/GrPromptDialog.md) | ядро | нужно одно значение |
| [`GrRadio`](../packages/granularity/docs/components/GrRadio.md) | ядро | переключатель стоит отдельно |
| [`GrRadioGroup`](../packages/granularity/docs/components/GrRadioGroup.md) | ядро | вариантов до семи и все видны |
| [`GrRating`](../packages/granularity/docs/components/GrRating.md) | ядро | оценка ставится в один клик |
| [`GrRelativeTime`](../packages/granularity-chrono/docs/components/GrRelativeTime.md) | chrono | свежесть важнее точности |
| [`GrResponseErrorBanner`](../packages/granularity/docs/components/GrResponseErrorBanner.md) | ядро | запрос упал |
| [`GrRichText`](../packages/granularity-editor/docs/components/GrRichText.md) | editor | текст, который читатель увидит оформленным |
| [`GrSchemaForm`](../packages/granularity-forms-schema/docs/components/GrSchemaForm.md) | forms-schema | бэкенд уже описывает контракт |
| [`GrScrollSpy`](../packages/granularity/docs/components/GrScrollSpy.md) | ядро | длинная страница с разделами |
| [`GrSegmented`](../packages/granularity/docs/components/GrSegmented.md) | ядро | переключение вида одного и того же |
| [`GrSelect`](../packages/granularity/docs/components/GrSelect.md) | ядро | поле формы со списком значений |
| [`GrSidebar`](../packages/granularity/docs/components/GrSidebar.md) | ядро | разделов много и они постоянны |
| [`GrSkeleton`](../packages/granularity/docs/components/GrSkeleton.md) | ядро | контента ещё нет |
| [`GrSlider`](../packages/granularity/docs/components/GrSlider.md) | ядро | точное число не важно |
| [`GrSortableList`](../packages/granularity/docs/components/GrSortableList.md) | ядро | порядок задаёт пользователь |
| [`GrSparkline`](../packages/granularity-charts/docs/components/GrSparkline.md) | charts | тренд в ячейке таблицы |
| [`GrSplitter`](../packages/granularity/docs/components/GrSplitter.md) | ядро | двум областям нужна общая граница |
| [`GrStatistic`](../packages/granularity/docs/components/GrStatistic.md) | ядро | один показатель — главный |
| [`GrSteps`](../packages/granularity/docs/components/GrSteps.md) | ядро | оформление заказа или регистрация |
| [`GrSwitch`](../packages/granularity/docs/components/GrSwitch.md) | ядро | настройка включается сразу |
| [`GrTable`](../packages/granularity/docs/components/GrTable.md) | ядро | ячейки оформляет потребитель |
| [`GrTabPanels`](../packages/granularity/docs/components/GrTabPanels.md) | ядро | к вкладкам нужны панели |
| [`GrTabs`](../packages/granularity/docs/components/GrTabs.md) | ядро | разделы с разным содержимым |
| [`GrTextarea`](../packages/granularity/docs/components/GrTextarea.md) | ядро | текст длиннее строки |
| [`GrTimeline`](../packages/granularity/docs/components/GrTimeline.md) | ядро | события идут во времени |
| [`GrTimePicker`](../packages/granularity-chrono/docs/components/GrTimePicker.md) | chrono | время без даты |
| [`GrToaster`](../packages/granularity/docs/components/GrToaster.md) | ядро | действие завершилось |
| [`GrTooltip`](../packages/granularity/docs/components/GrTooltip.md) | ядро | подпись к иконочной кнопке |
| [`GrTransfer`](../packages/granularity/docs/components/GrTransfer.md) | ядро | состав набирают из справочника |
| [`GrTree`](../packages/granularity/docs/components/GrTree.md) | ядро | данные вложены |
| [`GrTreeSections`](../packages/granularity/docs/components/GrTreeSections.md) | ядро | корни — категории, а не элементы |
| [`GrTreeSelect`](../packages/granularity/docs/components/GrTreeSelect.md) | ядро | варианты вложены |
| [`GrValue`](../packages/granularity/docs/components/GrValue.md) | ядро | пишете свой компонент с величиной |
| [`GrVideoPlayer`](../packages/granularity-media/docs/components/GrVideoPlayer.md) | media | ролик внутри страницы продукта |
<!-- component-map:generated:end -->

Различитель `GrTreeSections` / `GrTree` — **выбирается ли корень**. У дерева
корень такой же узел, как любой другой; у секций он стал заголовком раздела, и
внутри это не одно дерево с заголовками между строк, а несколько отдельных —
`role="tree"` требует, чтобы его детьми были `treeitem`.

## Чего в экосистеме нет

Здесь перечислено то, за чем нет смысла идти в карту: компонента не существует
ни в одном пакете, и ближайший сосед задачу не закрывает.

**Планируется в ядро.** `GrMenu` — вертикальное меню навигации (меню действий по
правому клику закрывает `GrContextMenu`, вложенных подменю нет ни у кого).

**Планируется отдельными пакетами.** Просмотр markdown, календарь событий и
Гант, редактор кода и diff, выгрузка в XLSX и PDF, карта, схема связей,
продуктовые туры.

**Не будет.** 3D и география у графиков — это карта, отдельный пакет. Экспорта
графика в PNG или SVG тоже не будет: DOM компонента у приложения уже есть, и
снимок с него — его задача.
Отдельного пакета иконок не будет: связка `unplugin-icons` с UnoCSS уже решает
задачу. Отдельного пакета перетаскивания не будет: примитивы жеста
(`useDragGesture`, `useDragSort`) живут в ядре, композиты — в `dashboard`.
