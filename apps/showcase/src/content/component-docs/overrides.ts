import { showcaseComponentDetailSections } from '../../app/showcase'

import {
  grButtonExamples,
  grAutocompleteExamples,
  grSelectExamples,
  grSliderExamples,
  grSortableListExamples,
  grSplitterExamples,
  grFilePreviewExamples,
  grFileUploadExamples,
  grModalExamples,
  grDialogExamples,
  grDrawerExamples,
  grConfirmDialogExamples,
  grContextMenuExamples,
  grPromptDialogExamples,
  grToasterExamples,
  grLoadingExamples,
  grCollapseExamples,
  grConfigProviderExamples,
  grEmptyStateExamples,
  grBreadcrumbsExamples,
  grPopoverExamples,
  grProgressBarExamples,
  grProgressCircleExamples,
  grSkeletonExamples,
  grDropdownExamples,
  grDataTableExamples,
  grChipExamples,
  grChipGroupExamples,
  grDeltaExamples,
  grDescriptionListExamples,
  grPaginationExamples,
  grTabsExamples,
  grJsonViewerExamples,
  grKbdExamples,
  grDividerExamples,
  grTabPanelsExamples,
  grTransferExamples,
  grTreeExamples,
  grTreeSelectExamples,
  grValueExamples,
  grTimelineExamples,
  grTooltipExamples,
  grInputExamples,
  grNumberInputExamples,
  grTextareaExamples,
  grSwitchExamples,
  grCheckboxExamples,
  grCheckboxGroupExamples,
  grRadioExamples,
  grRadioGroupExamples,
  grResponseErrorBannerExamples,
  grColorPickerExamples,
  grSegmentedExamples,
  grFormExamples,
  grFormFieldExamples,
  grFormFileExamples,
  grFormSectionExamples,
  grInputTagExamples,
  grAlertExamples,
  grAvatarExamples,
  grBadgeExamples,
  grBadgeWrapExamples,
  grCardExamples,
  grCarouselExamples,
  grBottomNavExamples,
  grNavbarExamples,
  grSidebarExamples,
  grButtonGroupExamples,
  grDropdownMenuExamples,
  grIconExamples,
  grImageViewerExamples,
  grLinkExamples,
  grListExamples,
  grTableExamples,
  grRatingExamples,
  grStatisticExamples,
  grStepsExamples,
  grCommandPaletteExamples,
} from './examples'
import type { ShowcaseComponentDocMeta, ShowcaseComponentExampleDoc, ShowcaseComponentOverviewDoc } from './types'

function createComponentDocMeta(
  examples: ShowcaseComponentExampleDoc[],
  overview?: ShowcaseComponentOverviewDoc,
): ShowcaseComponentDocMeta {
  return {
    sections: showcaseComponentDetailSections,
    overview,
    examples,
  }
}

const grTransferOverview: ShowcaseComponentOverviewDoc = {
  paragraphs: [
    'Два списка рядом и перенос между ними: слева справочник, справа то, что отобрали. Назначение прав, состав рассылки, колонки отчёта — там, где важно видеть обе стороны сразу.',
    'Правая панель — не просто «выбранное»: её можно переставлять, и порядок уезжает в модель. Именно этим компонент отличается от мультиселекта, где выбранное сжато в строку триггера.',
  ],
  features: [
    'Мультивыбор строк: `Ctrl` добавляет по одной, `Shift` берёт диапазон, «выбрать всё показанное» — одну отфильтрованную пачку.',
    'Перенос кнопками, перетаскиванием и с клавиатуры — все три пути равноправны и объявляются скринридеру.',
    'Поиск в каждой панели по отдельности: длинный справочник сужается, уже отобранное при этом не теряется.',
    'Порядок правой панели меняется перетаскиванием и `Alt` + стрелкой — и это и есть значение `v-model`.',
    'Своя строка слотом `#item`, поэлементные запреты, состояния `disabled` и `readonly`.',
    'Интеграция с `GrFormField` и кастомизация через переменные `--gr-transfer-*`.',
  ],
}

const grAutocompleteOverview: ShowcaseComponentOverviewDoc = {
  paragraphs: [
    'Поле поиска, которое помогает выбрать нужное за секунды. Пользователь начинает печатать — список сам сужается до подходящих вариантов. Идеально, когда опций много: пользователи, города, теги, репозитории, в том числе с подгрузкой с сервера.',
    'Это отдельный компонент, а не режим `GrSelect`: там пользователь выбирает из готового списка, а здесь — ищет вводом. Разные задачи — свой компонент, заточенный под поиск, чтобы оба оставались простыми и предсказуемыми.',
  ],
  features: [
    'Живой поиск по мере ввода — мгновенная фильтрация вариантов.',
    'Подгрузка вариантов с сервера со спиннером и состояниями «ничего не найдено» / «введите ещё пару символов».',
    'Множественный выбор тегами: удобно добавлять и удалять, в том числе с клавиатуры.',
    'Можно разрешить свои значения, которых нет в списке.',
    'Полностью управляется с клавиатуры и доступен для скринридеров.',
    'Кнопка очистки, кастомизация вида опций и пустых состояний, аккуратная интеграция с формами.',
  ],
}

const grCarouselOverview: ShowcaseComponentOverviewDoc = {
  paragraphs: [
    'Галерея, которую листают: кадры на всю ширину, стрелки по краям, точки под лентой или полоса миниатюр. Свайп пальцем и мышью — из коробки, отдельная библиотека жестов не нужна.',
    'Кадр — ваша разметка внутри `GrCarouselSlide`: фотография товара, карточка отзыва, экран знакомства с сервисом. Компонент отвечает за ленту, роли и клавиатуру, содержимое остаётся вашим.',
  ],
  features: [
    'Стрелки, точки и полоса миниатюр — включаются по отдельности.',
    'Свайп пальцем и протяжка мышью, без сторонних зависимостей.',
    'Автопрокрутка с кнопкой паузы: наведение и фокус останавливают её сами.',
    'Клавиатура по WAI-ARIA: стрелки по переключателям, `Home`/`End` — к краям.',
    '`prefers-reduced-motion` гасит и переход к кадру, и автолистание.',
    'Один кадр и пустая лента — валидные состояния: лишние кнопки не рисуются.',
    'Кастомизация через CSS-переменные (`--gr-carousel-*`), без новых пропов.',
  ],
  lists: [
    {
      title: 'CSS-переменные для кастомизации',
      items: [
        '`--gr-carousel-control-bg` — подложка стрелок и кнопки паузы. По умолчанию `--gr-bg`.',
        '`--gr-carousel-dot-active` — цвет текущей точки и рамки текущей миниатюры.',
        '`--gr-carousel-dot-size` — диаметр точки-индикатора.',
        '`--gr-carousel-thumb-width` / `--gr-carousel-thumb-height` — размер миниатюры.',
        '`--gr-carousel-gap` — просвет между переключателями.',
      ],
    },
  ],
}

const grSliderOverview: ShowcaseComponentOverviewDoc = {
  paragraphs: [
    'Ползунок для выбора числа перетаскиванием — быстрый и наглядный способ задать громкость, цену, яркость или любой параметр в понятных границах. Значение всегда видно, а «прилипание» к шагу не даёт промахнуться.',
    'Работает и как выбор диапазона: включите `range` — и получите два бегунка «от и до», которые не мешают друг другу. Всё управляется мышью, тачем и клавиатурой, и доступно для скринридеров.',
  ],
  features: [
    'Одно значение или диапазон «от–до» двумя бегунками.',
    'Шаг, границы `min`/`max` и метки делений с подписями.',
    'Всплывающее значение над бегунком с любым форматом (проценты, валюта…).',
    'Полное управление с клавиатуры: стрелки, PageUp/Down, Home/End.',
    'Размеры `sm` / `md` / `lg` и состояние `disabled`.',
    'Кастомизация цвета и размера через CSS-переменные (`--gr-slider-*`), без новых пропов.',
    'Доступность из коробки: `role="slider"` с корректными границами для скринридеров.',
  ],
  lists: [
    {
      title: 'CSS-переменные для кастомизации',
      items: [
        '`--gr-slider-fill` — цвет активной (заполненной) части. По умолчанию `--gr-primary`.',
        '`--gr-slider-rail` — цвет фона дорожки (неактивная часть).',
        '`--gr-slider-thumb-bg` — заливка бегунка. По умолчанию `--gr-bg`.',
        '`--gr-slider-thumb-border` — цвет окантовки бегунка. По умолчанию равен `--gr-slider-fill`.',
        '`--gr-slider-thumb-size` — диаметр бегунка. По умолчанию — из пропа `size`.',
        '`--gr-slider-track-height` — толщина дорожки. По умолчанию — из пропа `size`.',
      ],
    },
  ],
}

const grFormOverview: ShowcaseComponentOverviewDoc = {
  paragraphs: [
    'Оркестратор форм: собирает поля, проверяет их по декларативным правилам и не даёт отправить форму, пока всё не валидно. Экономит рутину — не нужно вручную развешивать ошибки по каждому полю.',
    'Главное — как это устроено: сами контролы (`GrInput`, `GrSelect`, `GrAutocomplete`, …) ничего не знают про форму. Оркестрация подключается через `GrFormField` (по `name`), который уже связан с контролами. Поэтому любой существующий контрол попадает в валидацию без единой правки.',
  ],
  features: [
    'Декларативные правила по имени поля: `required`, `min`/`max`/`len`, `pattern`, `type` (email/url).',
    'Кастомные и async-валидаторы с доступом ко всей модели (например, совпадение паролей).',
    'Ошибки и маркер обязательности сами появляются в `GrFormField` — контролы не трогаем.',
    'Триггеры валидации: on-blur, on-change, on-submit (настраивается на форме и на правиле).',
    'Скролл и фокус к первой ошибке после отправки.',
    'Императивный API через ref: `validate()`, `validateField()`, `clearValidate()`, `resetFields()`.',
    'Локализованные сообщения по умолчанию (`gr.form.*`, en/ru/es), перекрываются своим текстом.',
  ],
  lists: [
    {
      title: 'Контролы, совместимые с GrForm',
      items: [
        '`GrInput` — текст, email, пароль и другие нативные типы.',
        '`GrTextarea` — многострочный ввод.',
        '`GrSelect` — выбор из списка (в т.ч. множественный).',
        '`GrAutocomplete` — поиск с подсказками и тегами.',
        '`GrSlider` — число или диапазон.',
        'Любой свой контрол, который читает `useGrFormFieldContext()` — интегрируется без правок формы (см. пример «Custom control + custom validator»).',
      ],
    },
    {
      title: 'Встроенные правила (rules)',
      items: [
        '`required` — значение не должно быть пустым (пустая строка/массив/`null`).',
        '`min` / `max` — граница длины строки/массива или величины числа.',
        '`len` — точная длина строки/массива или точное значение числа.',
        '`pattern` — соответствие `RegExp` (проверяется по `String(value)`).',
        '`type: "email"` — валидный email-адрес.',
        '`type: "url"` — валидный URL.',
        '`validator` — своя (в т.ч. async) функция `(value, model) => true | string`; получает всю модель.',
        '`message` — переопределяет дефолтный текст ошибки для правила.',
        '`trigger` — когда правило срабатывает: `blur` | `change` | `submit` (без него — на любом).',
      ],
    },
  ],
}

const grConfigProviderOverview: ShowcaseComponentOverviewDoc = {
  paragraphs: [
    'Одно место для глобальных дефолтов дизайн-системы: размер контролов, дефолтные пропсы отдельных компонентов и адаптер переводов. Не нужно повторять `size` или `variant` в каждом вызове и вручную инжектить i18n — задали один раз на `GrConfigProvider`, и всё поддерево это подхватывает.',
    'Работает через provide/inject и рендерится прозрачно (`display: contents`), поэтому не влияет на разметку. Провайдеры можно вкладывать: дочерний мержится поверх родительского, так что глобальную тему легко точечно переопределить в отдельном поддереве.',
  ],
  features: [
    '`size` — дефолтный размер вложенных контролов формы (`GrButton`, `GrInput`, `GrSelect`, `GrAutocomplete`, `GrNumberInput`, `GrSegmented`, `GrSlider`, `GrRating`, `GrSwitch`, `GrRadio`/`GrRadioGroup`); локальный проп всегда побеждает.',
    '`componentDefaults` — дефолтные пропсы по имени компонента: `{ GrButton: { variant: "outline" } }`. Настраиваемые пропы перечислены ниже, опечатка в имени компонента или пропа — ошибка типа.',
    '`i18n` — адаптер переводов, прокидывается вложенным компонентам без ручного inject.',
    'Вложенные провайдеры мержатся с родительским (наследование + точечное переопределение).',
    'Прозрачный рендер (`display: contents`) — не ломает flex/grid-разметку.',
    'Императивные диалоги `useDialogService` наследуют конфиг наравне с обычными компонентами.',
  ],
  lists: [
    {
      title: 'Императивные диалоги и границы провайдера',
      items: [
        '`useDialogService` монтирует хост в `body`, вне дерева компонентов: обычный `inject` туда не дотягивается, потому что у такого корня нет родительского компонента.',
        'Пакет закрывает это сам — сервис захватывает конфиг в момент вызова `useDialogService()`. От приложения ничего не требуется.',
        'Захват происходит в `useDialogService()`, а не в `confirm()`: получайте сервис в `setup` компонента внутри провайдера: синглтон из модуля или стора дерева не видит и откатится на дефолты компонентов.',
        'Каждый экземпляр сервиса несёт свой конфиг: два поддерева с разными провайдерами не перемешиваются, хотя хост общий.',
        'Приоритет внутри диалога: опции вызова → `useDialogService(defaults)` → провайдер → дефолты компонентов.',
        'Телепорты (`GrModal`, `GrDrawer`, панель `GrSelect`) под это ограничение не попадают: они переносят DOM, но сохраняют цепочку компонентов, и конфиг доходит до них обычным способом.',
        '`v-loading` / `createLoading` — тоже императивный API, но у `GrLoading` нет настраиваемых пропов, наследовать пока нечего.',
      ],
    },
    {
      title: 'Как компонент подключается к конфигу',
      items: [
        '`useGrConfig()` — читает конфиг ближайшего провайдера (или пустой, если провайдера нет).',
        '`useGrComponentSize(() => props.size, { component: "GrButton" })` — эффективный размер: локальный проп → `componentDefaults` → глобальный `size` → `md`.',
        '`useGrComponentProp("GrButton", "variant", () => props.variant, "primary")` — любой настраиваемый проп по той же схеме.',
        'Условие подключения: у такого пропа в `withDefaults` должен стоять `undefined`, а «настоящий» дефолт переезжает в резолвер — иначе Vue подставит его раньше, чем компонент заглянет в конфиг.',
      ],
    },
    {
      title: 'Что настраивается через componentDefaults',
      items: [
        '`GrButton` — `variant`, `tone`, `size`, `square`.',
        '`GrSelect` — `size`, `variant`, `underline`, `clearable`.',
        '`GrInput`, `GrAutocomplete` — `size`, `clearable`.',
        '`GrSegmented` — `size`, `variant`.',
        '`GrBadge` — `tone`, `size`, `radius`.',
        '`GrNumberInput`, `GrSlider`, `GrRating`, `GrSwitch`, `GrRadio`/`GrRadioGroup` — `size`.',
        'Список закрытый: через конфиг настраивается только оформление, но не `modelValue` и не обработчики.',
        'Контракт объявляет сам компонент — в своей папке (`GrButton/defaults.ts`), а провайдер про конкретные компоненты не знает. Поэтому `componentDefaults` типизирован ровно теми компонентами, которые вы импортировали.',
      ],
    },
  ],
}

const grRatingOverview: ShowcaseComponentOverviewDoc = {
  paragraphs: [
    'Оценка звёздами — самый привычный способ спросить «как вам?» и показать, что ответили другие. Один клик ставит оценку, повторный её снимает, а половинки дают ту самую точность «4,5».',
    'Тот же компонент работает и как витрина чужих оценок: режим `readonly` показывает результат, не притворяясь полем ввода. Символ, цвет и размер меняются под бренд без единой строчки CSS.',
  ],
  features: [
    'Целые и половинчатые оценки, сброс повторным кликом.',
    'Предпросмотр под курсором — видно, что получится, ещё до клика.',
    'Режимы `readonly` и `disabled` для показа чужих оценок.',
    'Любой символ вместо звезды: иконка пропом `icon` или свой слот.',
    'Тона, размеры `sm` / `md` / `lg` и цвет через `--gr-rating-color`.',
    'Клавиатура и скринридеры из коробки: стрелки, Home/End, «4 из 5» голосом.',
  ],
  lists: [
    {
      title: 'CSS-переменные для кастомизации',
      items: [
        '`--gr-rating-color` — цвет залитых символов. По умолчанию — из пропа `tone`.',
        '`--gr-rating-void-color` — цвет пустых символов.',
        '`--gr-rating-symbol-size` — размер символа. По умолчанию — из пропа `size`.',
      ],
    },
  ],
}

const grModalOverview: ShowcaseComponentOverviewDoc = {
  paragraphs: [
    'Окно как механика, а не как оформление: слой поверх страницы, Esc и возврат фокуса на триггер, ловушка Tab внутри окна, блокировка прокрутки под ним и порядок, когда окон несколько. Всё, ради чего модалку обычно пишут руками и потом год чинят.',
    'Внутри панели — ваша разметка, ровно как написана: своих отступов `GrModal` не добавляет ни пикселя, поэтому примеры ниже выглядят «в край». Это не недоделка, а условие: паддинг внутри панели пришлось бы отменять отрицательными марджинами каждый раз, когда в окне картинка во всю ширину, таблица, карта или тулбар. Нужны привычные поля, шапка и подвал с выверенным ритмом — берите `GrDialog`: он построен на этом же окне и добавляет к нему раскладку.',
  ],
  features: [
    'Esc, `inert` и возврат фокуса — из общего стека слоёв',
    'Скролл всей страницы или только тела окна',
    'Пять размеров, включая полноэкранный',
    'Поля и раскладка — в `GrDialog` поверх него',
  ],
}

const grContextMenuOverview = {
  paragraphs: [
    'Действия там, где пользователь уже смотрит: правый клик по строке, узлу дерева или свободной области вместо поездки мышью к кнопке «⋯».',
  ],
  features: [
    'Меню собирается под то, по чему кликнули',
    'Открывается и с клавиатуры: Shift+F10',
    'Shift + правый клик остаётся браузеру',
    'Закрывается при прокрутке, как нативное',
  ],
}

const grStepsOverview = {
  paragraphs: [
    'Показывает, где пользователь в многошаговом процессе: что пройдено, где он сейчас и куда можно вернуться. Умеет не пустить вперёд, пока текущий шаг не сошёлся.',
  ],
  features: [
    'Горизонтальная лента и вертикальная колонка',
    'Гейт перехода: валидация шага вашим кодом',
    'Шаг с ошибкой виден в ленте',
    'Компактный вид для узкой колонки',
  ],
}

const grStatisticOverview: ShowcaseComponentOverviewDoc = {
  paragraphs: [
    'Ключевая цифра, которую видно с другого конца комнаты: выручка, число пользователей, конверсия. Подпись, приписки и форматирование разрядов — уже внутри, считать и склеивать строки не нужно.',
    'Строка динамики со стрелкой и цветом сразу отвечает на вопрос «стало лучше или хуже», а состояние загрузки держит высоту блока, чтобы дашборд не прыгал при обновлении данных.',
  ],
  features: [
    'Форматирование чисел: точность, разделители разрядов и дробной части.',
    'Префикс и суффикс — валюта, проценты, единицы измерения.',
    'Строка динамики `up` / `down` / `flat` со стрелкой и цветом.',
    'Иконка показателя и тон значения под смысл метрики.',
    'Тон по знаку величины: убыток краснеет сам, а у себестоимости цвета зеркальны.',
    'Состояние загрузки без скачков вёрстки.',
    'Нечисловые значения («2 ч 15 мин», «—») выводятся как есть.',
  ],
}

const grFilePreviewOverview: ShowcaseComponentOverviewDoc = {
  paragraphs: [
    'Лента вложений, в которой вперемешку чеки, договоры и выгрузки. Картинка показывается картинкой, всё остальное — иконкой своего вида: PDF, документ, таблица, архив. Одним правилом такой набор не покажешь, а `<img>` на PDF рисует битую иконку.',
    'Тип берётся из `mime`, а не из расширения: расширение врёт. Пустой тип, незнакомый тип и сорвавшаяся загрузка ведут в одну и ту же аккуратную заглушку — состояние «превью нет» здесь штатное, а не сбой.',
  ],
  features: [
    'Шесть видов файла по MIME, своя иконка на каждый.',
    'Сорвавшаяся загрузка деградирует в заглушку со своим значком.',
    '`alt` из имени файла — и пустой `alt`, когда имени нет: выдумка хуже пустоты.',
    'Плитка становится контролом только по `clickable` или `href`.',
    'Ленивая загрузка и соотношение сторон, держащее место до картинки.',
    'Фон, цвет иконки и скругление — точки кастомизации `--gr-file-preview-*`.',
  ],
}

const grChipOverview = {
  paragraphs: [
    'Метка, с которой можно работать: снять крестиком, отметить нажатием, поставить иконку. Там, где `GrBadge` только показывает статус, чип отвечает на действие.',
  ],
  features: [
    'Крестик со снятием — и мышью, и с клавиатуры',
    'Режим переключателя для фильтров',
    'Восемь тонов и четыре размера, общие с бейджем',
    'Иконка перед подписью',
  ],
}

const grChipGroupOverview = {
  paragraphs: [
    'Набор чипов с общим значением: фильтры списка, метки записи, быстрый выбор периода. Группа сама ведёт выбор, роли и клавиатуру — весь набор занимает одну остановку Tab.',
  ],
  features: [
    'Одиночный и множественный выбор',
    'Стрелки водят фокус, Home и End — к краям',
    'Delete снимает чип под фокусом',
    'Значение уходит в нативную форму по name',
  ],
}

const grDeltaOverview: ShowcaseComponentOverviewDoc = {
  paragraphs: [
    'Изменение прямо в строке текста: «Маржа −$12.50», «Конверсия +8.4 %». Знак, цвет и стрелка отвечают «лучше или хуже» до того, как читатель разберёт саму цифру.',
    'Компонент знает, что рост бывает плохим: для оттока и времени отклика цвет инвертируется, а знак остаётся при величине. Ноль остаётся нейтральным, а «нет данных» не притворяется нулём.',
  ],
  features: [
    'Знак и разряды ставит `Intl` — по локали приложения или по заданной.',
    'Полярность: рост — успех, рост — проблема или знак без оценки.',
    'Ноль нейтрален при любой полярности.',
    'Отсутствующая величина печатается прочерком, без тона и приписок.',
    'Необязательная стрелка направления, скрытая от скринридера.',
    'Префикс и суффикс — валюта, проценты, единицы.',
  ],
}

const grDescriptionListOverview: ShowcaseComponentOverviewDoc = {
  paragraphs: [
    'Карточка объекта, в которой значения стоят ровной колонкой: реквизиты заказа, параметры документа, сводка профиля. Подписи не «плавают» по длине, а длинный идентификатор переносится, а не рвёт вёрстку.',
    'Под капотом — настоящий список определений, поэтому пары читаются скринридером как пары, а не как поток текста. Любое значение можно заменить бейджем, ссылкой или относительным временем, не переписывая разметку.',
  ],
  features: [
    'Раскладка «подпись слева», «подпись сверху» или строкой с переносом.',
    'До четырёх колонок для длинных списков — пара между ними не разрывается.',
    'Слоты на конкретную пару: бейдж статуса, ссылка, относительное время.',
    'Пустое значение печатается прочерком и строку не теряет.',
    'Тон значения под смысл: просроченный срок, отрицательный баланс.',
    'Плотность, разделители и ширина колонки подписей — пропами.',
  ],
}

const grCommandPaletteOverview: ShowcaseComponentOverviewDoc = {
  paragraphs: [
    'Один ⌘K — и всё приложение под рукой: команды, разделы, документы. Пользователю не нужно помнить, где спрятан пункт меню, достаточно начать печатать.',
    'Команды группируются, показывают свои сочетания клавиш и ищутся по метке, описанию и синонимам. Поиск можно оставить локальным или отдать серверу — палитра одинаково хорошо работает в обоих режимах.',
  ],
  features: [
    'Открытие глобальным сочетанием (⌘K / Ctrl+K) или программно.',
    'Группы, иконки, описания и подсказки сочетаний у команд.',
    'Поиск по метке, описанию, группе и ключевым словам-синонимам.',
    'Удалённый поиск: событие `search` + внешние `items` и `loading`.',
    'Слоты для своей строки команды, пустого состояния и подвала.',
    'Клавиатура целиком: стрелки, Home/End, Enter, Esc — фокус не покидает поиск.',
  ],
}

const grBreadcrumbsOverview = {
  paragraphs: [
    'Shows where the user is and gives one click back to any level above. Built on GrLink, so it works with any router through `as`.',
  ],
  features: [
    'The current page is announced as such — screen readers answer «where am I»',
    'Long paths collapse in the middle; the ellipsis expands them in place',
    'Icons, a custom separator and per-item labels',
    'Any link component through `as`: Vue Router, Nuxt, Inertia',
    'Size and separator come from GrConfigProvider — one setting for the whole app',
  ],
}

const grPopoverOverview = {
  paragraphs: [
    'Anchored panel with any content you like: settings, a short form, a confirmation. It positions itself against the trigger, flips near the viewport edge and closes on Esc or a click outside.',
  ],
  features: [
    'Any content — the panel is a container, not a fixed layout',
    'Placement on all four sides, with automatic flip and shift at the edge',
    'Closes on Esc and on a click outside; a click inside keeps it open',
    'Controlled via v-model:open or left to manage itself',
    'Role is a prop — build a menu, a listbox or a colour picker on top of it',
  ],
}

const grSortableListOverview = {
  paragraphs: [
    'Список, порядок которого задаёт пользователь: приоритеты задач, поля отчёта, шаги маршрута, колонки таблицы.',
    'Переносится мышью, пальцем и с клавиатуры — последнее и есть причина держать компонент в дизайн-системе: самописная сортировка почти всегда остаётся без клавиатуры, то есть недоступной.',
  ],
  features: [
    'Ручка тянет строку, а сама строка остаётся кликабельной — внутри можно держать ссылки и кнопки.',
    'Клавиатура: Space берёт, стрелки двигают, Space кладёт, Esc отменяет; каждый шаг объявляется скринридеру.',
    '`v-model` отдаёт новый массив и не мутирует входной; рядом — событие `move` с парой индексов.',
    '`max-height` включает автопрокрутку у краёв, `orientation="horizontal"` разворачивает список и ось клавиатуры.',
  ],
}

export const componentDocOverrides: Partial<Record<string, ShowcaseComponentDocMeta>> = {
  GrConfigProvider: createComponentDocMeta(grConfigProviderExamples, grConfigProviderOverview),
  GrForm: createComponentDocMeta(grFormExamples, grFormOverview),
  GrButton: createComponentDocMeta(grButtonExamples),
  GrAutocomplete: createComponentDocMeta(grAutocompleteExamples, grAutocompleteOverview),
  GrSlider: createComponentDocMeta(grSliderExamples, grSliderOverview),
  GrSortableList: createComponentDocMeta(grSortableListExamples, grSortableListOverview),
  GrSplitter: createComponentDocMeta(grSplitterExamples),
  GrRating: createComponentDocMeta(grRatingExamples, grRatingOverview),
  GrStatistic: createComponentDocMeta(grStatisticExamples, grStatisticOverview),
  GrSteps: createComponentDocMeta(grStepsExamples, grStepsOverview),
  GrCommandPalette: createComponentDocMeta(grCommandPaletteExamples, grCommandPaletteOverview),
  GrSelect: createComponentDocMeta(grSelectExamples),
  GrFilePreview: createComponentDocMeta(grFilePreviewExamples, grFilePreviewOverview),
  GrFileUpload: createComponentDocMeta(grFileUploadExamples),
  GrModal: createComponentDocMeta(grModalExamples, grModalOverview),
  GrDialog: createComponentDocMeta(grDialogExamples),
  GrDrawer: createComponentDocMeta(grDrawerExamples),
  GrConfirmDialog: createComponentDocMeta(grConfirmDialogExamples),
  GrContextMenu: createComponentDocMeta(grContextMenuExamples, grContextMenuOverview),
  GrPromptDialog: createComponentDocMeta(grPromptDialogExamples),
  GrToaster: createComponentDocMeta(grToasterExamples),
  GrLoading: createComponentDocMeta(grLoadingExamples),
  GrCollapse: createComponentDocMeta(grCollapseExamples),
  GrEmptyState: createComponentDocMeta(grEmptyStateExamples),
  GrPopover: createComponentDocMeta(grPopoverExamples, grPopoverOverview),
  GrProgressBar: createComponentDocMeta(grProgressBarExamples),
  GrProgressCircle: createComponentDocMeta(grProgressCircleExamples),
  GrSkeleton: createComponentDocMeta(grSkeletonExamples),
  GrDropdown: createComponentDocMeta(grDropdownExamples),
  GrDataTable: createComponentDocMeta(grDataTableExamples),
  GrChip: createComponentDocMeta(grChipExamples, grChipOverview),
  GrChipGroup: createComponentDocMeta(grChipGroupExamples, grChipGroupOverview),
  GrDelta: createComponentDocMeta(grDeltaExamples, grDeltaOverview),
  GrDescriptionList: createComponentDocMeta(grDescriptionListExamples, grDescriptionListOverview),
  GrPagination: createComponentDocMeta(grPaginationExamples),
  GrTabs: createComponentDocMeta(grTabsExamples),
  GrTabPanels: createComponentDocMeta(grTabPanelsExamples),
  GrJsonViewer: createComponentDocMeta(grJsonViewerExamples),
  GrKbd: createComponentDocMeta(grKbdExamples),
  GrDivider: createComponentDocMeta(grDividerExamples),
  GrTransfer: createComponentDocMeta(grTransferExamples, grTransferOverview),
  GrTree: createComponentDocMeta(grTreeExamples),
  GrTreeSelect: createComponentDocMeta(grTreeSelectExamples),
  GrValue: createComponentDocMeta(grValueExamples),
  GrTooltip: createComponentDocMeta(grTooltipExamples),
  GrTimeline: createComponentDocMeta(grTimelineExamples),
  GrInput: createComponentDocMeta(grInputExamples),
  GrNumberInput: createComponentDocMeta(grNumberInputExamples),
  GrTextarea: createComponentDocMeta(grTextareaExamples),
  GrSwitch: createComponentDocMeta(grSwitchExamples),
  GrCheckbox: createComponentDocMeta(grCheckboxExamples),
  GrCheckboxGroup: createComponentDocMeta(grCheckboxGroupExamples),
  GrRadio: createComponentDocMeta(grRadioExamples),
  GrRadioGroup: createComponentDocMeta(grRadioGroupExamples),
  GrResponseErrorBanner: createComponentDocMeta(grResponseErrorBannerExamples),
  GrColorPicker: createComponentDocMeta(grColorPickerExamples),
  GrSegmented: createComponentDocMeta(grSegmentedExamples),
  GrFormField: createComponentDocMeta(grFormFieldExamples),
  GrFormFile: createComponentDocMeta(grFormFileExamples),
  GrFormSection: createComponentDocMeta(grFormSectionExamples),
  GrInputTag: createComponentDocMeta(grInputTagExamples),
  GrAlert: createComponentDocMeta(grAlertExamples),
  GrAvatar: createComponentDocMeta(grAvatarExamples),
  GrBadge: createComponentDocMeta(grBadgeExamples),
  GrBadgeWrap: createComponentDocMeta(grBadgeWrapExamples),
  GrCard: createComponentDocMeta(grCardExamples),
  GrCarousel: createComponentDocMeta(grCarouselExamples, grCarouselOverview),
  GrBottomNav: createComponentDocMeta(grBottomNavExamples),
  GrBreadcrumbs: createComponentDocMeta(grBreadcrumbsExamples, grBreadcrumbsOverview),
  GrNavbar: createComponentDocMeta(grNavbarExamples),
  GrSidebar: createComponentDocMeta(grSidebarExamples),
  GrButtonGroup: createComponentDocMeta(grButtonGroupExamples),
  GrDropdownMenu: createComponentDocMeta(grDropdownMenuExamples),
  GrIcon: createComponentDocMeta(grIconExamples),
  GrImageViewer: createComponentDocMeta(grImageViewerExamples),
  GrLink: createComponentDocMeta(grLinkExamples),
  GrList: createComponentDocMeta(grListExamples),
  GrTable: createComponentDocMeta(grTableExamples),
}
