import { showcaseComponentDetailSections } from '../../app/showcase'

import {
  grButtonExamples,
  grAutocompleteExamples,
  grSelectExamples,
  grSliderExamples,
  grFileUploadExamples,
  grModalExamples,
  grDialogExamples,
  grDrawerExamples,
  grConfirmDialogExamples,
  grPromptDialogExamples,
  grToasterExamples,
  grLoadingExamples,
  grCollapseExamples,
  grConfigProviderExamples,
  grEmptyStateExamples,
  grProgressBarExamples,
  grSkeletonExamples,
  grDropdownExamples,
  grDataTableExamples,
  grPaginationExamples,
  grTabsExamples,
  grKbdExamples,
  grDividerExamples,
  grTabPanelsExamples,
  grTreeExamples,
  grTreeSelectExamples,
  grTooltipExamples,
  grInputExamples,
  grNumberInputExamples,
  grTextareaExamples,
  grSwitchExamples,
  grCheckboxExamples,
  grRadioExamples,
  grRadioGroupExamples,
  grResponseErrorBannerExamples,
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
    'Одно место для глобальных дефолтов дизайн-системы: размер контролов, база z-index для оверлеев, per-component дефолтные пропсы и адаптер переводов. Не нужно повторять `size` в каждом вызове и вручную инжектить i18n — задали один раз на `GrConfigProvider`, и всё поддерево это подхватывает.',
    'Работает через provide/inject и рендерится прозрачно (`display: contents`), поэтому не влияет на разметку. Провайдеры можно вкладывать: дочерний мержится поверх родительского, так что глобальную тему легко точечно переопределить в отдельном поддереве.',
  ],
  features: [
    '`size` — дефолтный размер вложенных контролов; локальный проп всегда побеждает.',
    '`zIndexBase` — база z-index для оверлеев (пробрасывается как CSS-переменная `--gr-z-base`).',
    '`componentDefaults` — дефолтные пропсы по имени компонента: `{ GrButton: { variant: "secondary" } }`.',
    '`i18n` — адаптер переводов, прокидывается вложенным компонентам без ручного inject.',
    'Вложенные провайдеры мержатся с родительским (наследование + точечное переопределение).',
    'Прозрачный рендер (`display: contents`) — не ломает flex/grid-разметку.',
  ],
  lists: [
    {
      title: 'Как компонент подключается к конфигу',
      items: [
        '`useGrConfig()` — читает конфиг ближайшего провайдера (или пустой, если провайдера нет).',
        '`useGrComponentSize(() => props.size)` — эффективный размер: локальный проп → конфиг → `md`.',
        '`useGrComponentDefaults("GrButton")` — дефолтные пропсы компонента из провайдера.',
        'Проп `size` из провайдера уже читают `GrButton` и `GrInput`; остальные контролы можно подключить тем же хелпером.',
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
    'Состояние загрузки без скачков вёрстки.',
    'Нечисловые значения («2 ч 15 мин», «—») выводятся как есть.',
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

export const componentDocOverrides: Partial<Record<string, ShowcaseComponentDocMeta>> = {
  GrConfigProvider: createComponentDocMeta(grConfigProviderExamples, grConfigProviderOverview),
  GrForm: createComponentDocMeta(grFormExamples, grFormOverview),
  GrButton: createComponentDocMeta(grButtonExamples),
  GrAutocomplete: createComponentDocMeta(grAutocompleteExamples, grAutocompleteOverview),
  GrSlider: createComponentDocMeta(grSliderExamples, grSliderOverview),
  GrRating: createComponentDocMeta(grRatingExamples, grRatingOverview),
  GrStatistic: createComponentDocMeta(grStatisticExamples, grStatisticOverview),
  GrCommandPalette: createComponentDocMeta(grCommandPaletteExamples, grCommandPaletteOverview),
  GrSelect: createComponentDocMeta(grSelectExamples),
  GrFileUpload: createComponentDocMeta(grFileUploadExamples),
  GrModal: createComponentDocMeta(grModalExamples),
  GrDialog: createComponentDocMeta(grDialogExamples),
  GrDrawer: createComponentDocMeta(grDrawerExamples),
  GrConfirmDialog: createComponentDocMeta(grConfirmDialogExamples),
  GrPromptDialog: createComponentDocMeta(grPromptDialogExamples),
  GrToaster: createComponentDocMeta(grToasterExamples),
  GrLoading: createComponentDocMeta(grLoadingExamples),
  GrCollapse: createComponentDocMeta(grCollapseExamples),
  GrEmptyState: createComponentDocMeta(grEmptyStateExamples),
  GrProgressBar: createComponentDocMeta(grProgressBarExamples),
  GrSkeleton: createComponentDocMeta(grSkeletonExamples),
  GrDropdown: createComponentDocMeta(grDropdownExamples),
  GrDataTable: createComponentDocMeta(grDataTableExamples),
  GrPagination: createComponentDocMeta(grPaginationExamples),
  GrTabs: createComponentDocMeta(grTabsExamples),
  GrTabPanels: createComponentDocMeta(grTabPanelsExamples),
  GrKbd: createComponentDocMeta(grKbdExamples),
  GrDivider: createComponentDocMeta(grDividerExamples),
  GrTree: createComponentDocMeta(grTreeExamples),
  GrTreeSelect: createComponentDocMeta(grTreeSelectExamples),
  GrTooltip: createComponentDocMeta(grTooltipExamples),
  GrInput: createComponentDocMeta(grInputExamples),
  GrNumberInput: createComponentDocMeta(grNumberInputExamples),
  GrTextarea: createComponentDocMeta(grTextareaExamples),
  GrSwitch: createComponentDocMeta(grSwitchExamples),
  GrCheckbox: createComponentDocMeta(grCheckboxExamples),
  GrRadio: createComponentDocMeta(grRadioExamples),
  GrRadioGroup: createComponentDocMeta(grRadioGroupExamples),
  GrResponseErrorBanner: createComponentDocMeta(grResponseErrorBannerExamples),
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
  GrBottomNav: createComponentDocMeta(grBottomNavExamples),
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
