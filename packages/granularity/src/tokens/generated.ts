// СГЕНЕРИРОВАНО `yarn generate:tokens` из `src/components/*/tokens.json` — правки здесь потеряются.

import type { GrComponentToken } from './types'

export const grComponentTokens: GrComponentToken[] = [
  {
    "owner": "GrAffix",
    "name": "--gr-affix-offset",
    "kind": "inline",
    "default": "0px",
    "description": "Отступ от края в прилипшем состоянии. Пишется инлайн из пропа `offset`; заданный в CSS (например на `:root` — высота шапки приложения) работает общим дефолтом для всех аффиксов и подхватывается наблюдателем."
  },
  {
    "owner": "GrAffix",
    "name": "--gr-affix-bg",
    "kind": "hook",
    "default": "var(--gr-bg)",
    "description": "Фон прилипшей панели. Без него уезжающее под неё содержимое просвечивает насквозь. Аффикс внутри карточки берёт `var(--gr-card)`."
  },
  {
    "owner": "GrAffix",
    "name": "--gr-affix-shadow",
    "kind": "hook",
    "default": "var(--gr-shadow-2), при `placement=\"bottom\"` — `var(--gr-affix-shadow-bottom)`",
    "description": "Тень прилипшей панели: она отделяет панель от уезжающего содержимого. Тенью, а не рамкой — рамка меняет высоту в момент прилипания и сдвигает раскладку."
  },
  {
    "owner": "GrAffix",
    "name": "--gr-affix-shadow-bottom",
    "kind": "theme",
    "default": "0 -8px 24px -12px color-mix(in srgb, var(--gr-fg) 45%, transparent)",
    "description": "Тень аффикса у нижнего края (`placement=\"bottom\"`): зеркало `--gr-shadow-2`, отброшенное вверх. Ручка `--gr-affix-shadow` перекрывает её у экземпляра."
  },
  {
    "owner": "GrAffix",
    "name": "--gr-affix-z",
    "kind": "hook",
    "default": "10",
    "description": "Порядок внутри своего stacking-контекста. Не глобальный слой: приложение, которому аффикс нужен на шкале, ставит сюда `var(--gr-z-navbar)` — шаг между слоями шкалы оставлен ровно под это (`docs/z-index.md`).",
    "literal": "Порядок внутри своего stacking-контекста — механика экземпляра, а не язык темы; глобальную шкалу слоёв приложение подставляет само."
  },
  {
    "owner": "GrAlert",
    "name": "--gr-alert-bg",
    "kind": "inline",
    "default": "подложка тона (`--gr-<tone>-light`); у `outline` — `--gr-alert-outline-bg`",
    "description": "Фон полосы уведомления."
  },
  {
    "owner": "GrAlert",
    "name": "--gr-alert-brd",
    "kind": "inline",
    "default": "тон в смеси с `--gr-alert-soft-brd` (у `outline` — с `--gr-alert-outline-brd`) в доле темы",
    "description": "Цвет рамки уведомления."
  },
  {
    "owner": "GrAlert",
    "name": "--gr-alert-text-color",
    "kind": "inline",
    "default": "`--gr-<tone>-text` в смеси с `--gr-alert-body-fg` в доле `--gr-alert-soft-text-tone`; у `outline` — `--gr-alert-body-fg`",
    "description": "Цвет основного текста уведомления."
  },
  {
    "owner": "GrAlert",
    "name": "--gr-alert-title-color",
    "kind": "inline",
    "default": "`--gr-<tone>-text` в смеси с `--gr-fg` в доле `--gr-alert-soft-title-tone`; у `outline` — `--gr-fg`",
    "description": "Цвет заголовка уведомления."
  },
  {
    "owner": "GrAlert",
    "name": "--gr-alert-icon-color",
    "kind": "inline",
    "default": "насыщенный тон (`--gr-<tone>`)",
    "description": "Цвет иконки тона слева от текста."
  },
  {
    "owner": "GrAlert",
    "name": "--gr-alert-close-color",
    "kind": "inline",
    "default": "`--gr-<tone>-text`",
    "description": "Цвет кнопки закрытия в покое."
  },
  {
    "owner": "GrAlert",
    "name": "--gr-alert-close-hover-color",
    "kind": "inline",
    "default": "`--gr-<tone>-text`",
    "description": "Цвет кнопки закрытия под курсором."
  },
  {
    "owner": "GrAlert",
    "name": "--gr-alert-close-hover-bg",
    "kind": "inline",
    "default": "подмес тона к подложке",
    "description": "Фон кнопки закрытия под курсором."
  },
  {
    "owner": "GrAlert",
    "name": "--gr-alert-radius",
    "kind": "theme",
    "default": "var(--gr-radius-lg)",
    "description": "Скругление сообщения."
  },
  {
    "owner": "GrAlert",
    "name": "--gr-alert-title-weight",
    "kind": "theme",
    "default": "var(--gr-font-semibold)",
    "description": "Вес заголовка сообщения."
  },
  {
    "owner": "GrAlert",
    "name": "--gr-alert-body-fg",
    "kind": "theme",
    "default": "var(--gr-muted-fg)",
    "description": "Нейтральный цвет текста сообщения: текст `outline` и основа смеси для текста `soft`."
  },
  {
    "owner": "GrAlert",
    "name": "--gr-alert-soft-brd",
    "kind": "theme",
    "default": "var(--gr-brd)",
    "description": "Нейтральная основа рамки `soft`. Тема без рамки ставит `transparent` вместе с долей тона 0%."
  },
  {
    "owner": "GrAlert",
    "name": "--gr-alert-soft-brd-tone",
    "kind": "theme",
    "default": "35%",
    "description": "Доля тона в рамке `soft`."
  },
  {
    "owner": "GrAlert",
    "name": "--gr-alert-soft-title-tone",
    "kind": "theme",
    "default": "100%",
    "description": "Доля тона в заголовке `soft`: 100% — цветом тона (`-text`), 0% — чернилами `--gr-fg`."
  },
  {
    "owner": "GrAlert",
    "name": "--gr-alert-soft-text-tone",
    "kind": "theme",
    "default": "100%",
    "description": "Доля тона в тексте `soft`: 100% — цветом тона (`-text`), 0% — `--gr-alert-body-fg`."
  },
  {
    "owner": "GrAlert",
    "name": "--gr-alert-outline-bg",
    "kind": "theme",
    "default": "transparent",
    "description": "Подложка `outline`: прозрачная или поверхность карточки."
  },
  {
    "owner": "GrAlert",
    "name": "--gr-alert-outline-brd",
    "kind": "theme",
    "default": "var(--gr-brd)",
    "description": "Нейтральная основа рамки `outline`."
  },
  {
    "owner": "GrAlert",
    "name": "--gr-alert-outline-brd-tone",
    "kind": "theme",
    "default": "45%",
    "description": "Доля тона в рамке `outline`."
  },
  {
    "owner": "GrAutocomplete",
    "name": "--gr-autocomplete-option-active-bg",
    "kind": "theme",
    "default": "color-mix(in srgb, var(--gr-muted) 30%, transparent)",
    "description": "Подсветка опции под указателем и активной с клавиатуры."
  },
  {
    "owner": "GrAvatar",
    "name": "--gr-avatar-square-radius",
    "kind": "theme",
    "default": "10px",
    "description": "Скругление аватара в форме `square`. Не ступень общей шкалы: квадратный аватар мягче плитки, но жёстче чипа."
  },
  {
    "owner": "GrAvatar",
    "name": "--gr-avatar-1-bg",
    "kind": "theme",
    "default": "var(--gr-info-light)",
    "description": "Подложка слота 1 автоцвета (`autoColor`). Живёт в теме компонента, а не в глобальной: палитра нужна одному компоненту."
  },
  {
    "owner": "GrAvatar",
    "name": "--gr-avatar-1-fg",
    "kind": "theme",
    "default": "var(--gr-info-text)",
    "description": "Инициалы на подложке слота 1. Роль `-text`, а не насыщенный тон: тот в роли текста не добирает AA."
  },
  {
    "owner": "GrAvatar",
    "name": "--gr-avatar-2-bg",
    "kind": "theme",
    "default": "var(--gr-warning-light)",
    "description": "Подложка слота 2 автоцвета (`autoColor`). Живёт в теме компонента, а не в глобальной: палитра нужна одному компоненту."
  },
  {
    "owner": "GrAvatar",
    "name": "--gr-avatar-2-fg",
    "kind": "theme",
    "default": "var(--gr-warning-text)",
    "description": "Инициалы на подложке слота 2. Роль `-text`, а не насыщенный тон: тот в роли текста не добирает AA."
  },
  {
    "owner": "GrAvatar",
    "name": "--gr-avatar-3-bg",
    "kind": "theme",
    "default": "var(--gr-success-light)",
    "description": "Подложка слота 3 автоцвета (`autoColor`). Живёт в теме компонента, а не в глобальной: палитра нужна одному компоненту."
  },
  {
    "owner": "GrAvatar",
    "name": "--gr-avatar-3-fg",
    "kind": "theme",
    "default": "var(--gr-success-text)",
    "description": "Инициалы на подложке слота 3. Роль `-text`, а не насыщенный тон: тот в роли текста не добирает AA."
  },
  {
    "owner": "GrAvatar",
    "name": "--gr-avatar-4-bg",
    "kind": "theme",
    "default": "var(--gr-danger-light)",
    "description": "Подложка слота 4 автоцвета (`autoColor`). Живёт в теме компонента, а не в глобальной: палитра нужна одному компоненту."
  },
  {
    "owner": "GrAvatar",
    "name": "--gr-avatar-4-fg",
    "kind": "theme",
    "default": "var(--gr-danger-text)",
    "description": "Инициалы на подложке слота 4. Роль `-text`, а не насыщенный тон: тот в роли текста не добирает AA."
  },
  {
    "owner": "GrAvatar",
    "name": "--gr-avatar-5-bg",
    "kind": "theme",
    "default": "var(--gr-azure-light)",
    "description": "Подложка слота 5 автоцвета (`autoColor`). Живёт в теме компонента, а не в глобальной: палитра нужна одному компоненту."
  },
  {
    "owner": "GrAvatar",
    "name": "--gr-avatar-5-fg",
    "kind": "theme",
    "default": "var(--gr-azure-text)",
    "description": "Инициалы на подложке слота 5. Роль `-text`, а не насыщенный тон: тот в роли текста не добирает AA."
  },
  {
    "owner": "GrAvatar",
    "name": "--gr-avatar-6-bg",
    "kind": "theme",
    "default": "var(--gr-slate-light)",
    "description": "Подложка слота 6 автоцвета (`autoColor`). Живёт в теме компонента, а не в глобальной: палитра нужна одному компоненту."
  },
  {
    "owner": "GrAvatar",
    "name": "--gr-avatar-6-fg",
    "kind": "theme",
    "default": "var(--gr-slate-text)",
    "description": "Инициалы на подложке слота 6. Роль `-text`, а не насыщенный тон: тот в роли текста не добирает AA."
  },
  {
    "owner": "GrAvatar",
    "name": "--gr-avatar-brd",
    "kind": "theme",
    "default": "var(--gr-brd)",
    "description": "Рамка аватара. Тема, где аватар держится заливкой, ставит `transparent`."
  },
  {
    "owner": "GrAvatar",
    "name": "--gr-avatar-weight",
    "kind": "theme",
    "default": "var(--gr-font-bold)",
    "description": "Вес инициалов и счётчика «+N»."
  },
  {
    "owner": "GrAvatar",
    "name": "--gr-avatar-neutral-fg",
    "kind": "theme",
    "default": "var(--gr-muted-fg)",
    "description": "Инициалы на нейтральной заливке и счётчик «+N»."
  },
  {
    "owner": "GrBadge",
    "name": "--gr-badge-semi-radius-xs",
    "kind": "theme",
    "default": "3px",
    "description": "Скругление бейджа `radius=\"semi\"` на ступени `xs`."
  },
  {
    "owner": "GrBadge",
    "name": "--gr-badge-semi-radius-sm",
    "kind": "theme",
    "default": "3px",
    "description": "Скругление бейджа `radius=\"semi\"` на ступени `sm`."
  },
  {
    "owner": "GrBadge",
    "name": "--gr-badge-semi-radius-md",
    "kind": "theme",
    "default": "5px",
    "description": "Скругление бейджа `radius=\"semi\"` на ступени `md`."
  },
  {
    "owner": "GrBadge",
    "name": "--gr-badge-semi-radius-lg",
    "kind": "theme",
    "default": "7px",
    "description": "Скругление бейджа `radius=\"semi\"` на ступени `lg`. Лестница 3/3/5/7 своя: бейдж скругляется медленнее, чем растёт."
  },
  {
    "owner": "GrBadge",
    "name": "--gr-badge-neutral-bg",
    "kind": "theme",
    "default": "var(--gr-fg)",
    "description": "Заливка filled-бейджа нейтрального веса — инверсия страницы. В светлой теме — вес solid-кнопки, в тёмной — роль тона."
  },
  {
    "owner": "GrBadge",
    "name": "--gr-badge-neutral-fg",
    "kind": "theme",
    "default": "var(--gr-bg)",
    "description": "Текст filled-бейджа нейтрального веса — инверсия страницы: полярность задаётся темой, а не заливкой."
  },
  {
    "owner": "GrBadge",
    "name": "--gr-badge-primary-bg",
    "kind": "theme",
    "default": "var(--gr-primary-solid)",
    "description": "Заливка filled-бейджа тона `primary`. В светлой теме — вес solid-кнопки, в тёмной — роль тона."
  },
  {
    "owner": "GrBadge",
    "name": "--gr-badge-primary-fg",
    "kind": "theme",
    "default": "var(--gr-primary-solid-fg)",
    "description": "Текст filled-бейджа тона `primary`: полярность задаётся темой, а не заливкой."
  },
  {
    "owner": "GrBadge",
    "name": "--gr-badge-success-bg",
    "kind": "theme",
    "default": "var(--gr-success-solid)",
    "description": "Заливка filled-бейджа тона `success`. В светлой теме — вес solid-кнопки, в тёмной — роль тона."
  },
  {
    "owner": "GrBadge",
    "name": "--gr-badge-success-fg",
    "kind": "theme",
    "default": "var(--gr-success-solid-fg)",
    "description": "Текст filled-бейджа тона `success`: полярность задаётся темой, а не заливкой."
  },
  {
    "owner": "GrBadge",
    "name": "--gr-badge-warning-bg",
    "kind": "theme",
    "default": "var(--gr-warning-solid)",
    "description": "Заливка filled-бейджа тона `warning`. В светлой теме — вес solid-кнопки, в тёмной — роль тона."
  },
  {
    "owner": "GrBadge",
    "name": "--gr-badge-warning-fg",
    "kind": "theme",
    "default": "var(--gr-warning-solid-fg)",
    "description": "Текст filled-бейджа тона `warning`: полярность задаётся темой, а не заливкой."
  },
  {
    "owner": "GrBadge",
    "name": "--gr-badge-danger-bg",
    "kind": "theme",
    "default": "var(--gr-danger-solid)",
    "description": "Заливка filled-бейджа тона `danger`. В светлой теме — вес solid-кнопки, в тёмной — роль тона."
  },
  {
    "owner": "GrBadge",
    "name": "--gr-badge-danger-fg",
    "kind": "theme",
    "default": "var(--gr-danger-solid-fg)",
    "description": "Текст filled-бейджа тона `danger`: полярность задаётся темой, а не заливкой."
  },
  {
    "owner": "GrBadge",
    "name": "--gr-badge-info-bg",
    "kind": "theme",
    "default": "var(--gr-info-solid)",
    "description": "Заливка filled-бейджа тона `info`. В светлой теме — вес solid-кнопки, в тёмной — роль тона."
  },
  {
    "owner": "GrBadge",
    "name": "--gr-badge-info-fg",
    "kind": "theme",
    "default": "var(--gr-info-solid-fg)",
    "description": "Текст filled-бейджа тона `info`: полярность задаётся темой, а не заливкой."
  },
  {
    "owner": "GrBadge",
    "name": "--gr-badge-slate-bg",
    "kind": "theme",
    "default": "var(--gr-slate-solid)",
    "description": "Заливка filled-бейджа тона `slate`. В светлой теме — вес solid-кнопки, в тёмной — роль тона."
  },
  {
    "owner": "GrBadge",
    "name": "--gr-badge-slate-fg",
    "kind": "theme",
    "default": "var(--gr-slate-solid-fg)",
    "description": "Текст filled-бейджа тона `slate`: полярность задаётся темой, а не заливкой."
  },
  {
    "owner": "GrBadge",
    "name": "--gr-badge-azure-bg",
    "kind": "theme",
    "default": "var(--gr-azure-solid)",
    "description": "Заливка filled-бейджа тона `azure`. В светлой теме — вес solid-кнопки, в тёмной — роль тона."
  },
  {
    "owner": "GrBadge",
    "name": "--gr-badge-azure-fg",
    "kind": "theme",
    "default": "var(--gr-azure-solid-fg)",
    "description": "Текст filled-бейджа тона `azure`: полярность задаётся темой, а не заливкой."
  },
  {
    "owner": "GrBadge",
    "name": "--gr-badge-light-brd",
    "kind": "theme",
    "default": "100%",
    "description": "Сила рамки мягкой метки и чипа: 100% — рамка тона, 0% — рамки не видно."
  },
  {
    "owner": "GrBadgeWrap",
    "name": "--gr-badge-wrap-offset-x",
    "kind": "hook",
    "default": "-0.5rem (для `dot` — 0)",
    "description": "Горизонтальный сдвиг метки относительно угла обёртки.",
    "literal": "Смещение зависит от варианта (`dot` — 0): геометрия компонента."
  },
  {
    "owner": "GrBadgeWrap",
    "name": "--gr-badge-wrap-offset-y",
    "kind": "hook",
    "default": "-0.5rem (для `dot` — 0)",
    "description": "Вертикальный сдвиг метки относительно угла обёртки.",
    "literal": "Смещение зависит от варианта (`dot` — 0): геометрия компонента."
  },
  {
    "owner": "GrBreadcrumbs",
    "name": "--gr-breadcrumbs-separator-fg",
    "kind": "theme",
    "default": "var(--gr-muted-fg)",
    "description": "Цвет разделителя пути. Разделитель — графика, а не текст: тема может держать его тише ссылок."
  },
  {
    "owner": "GrBreadcrumbs",
    "name": "--gr-breadcrumbs-current-weight",
    "kind": "theme",
    "default": "var(--gr-font-semibold)",
    "description": "Вес текущего пункта пути."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-radius",
    "kind": "hook",
    "default": "радиус ступени `--gr-button-radius-<ступень>`",
    "description": "Один радиус на все ступени — ручка приложения (`999px` — капсула). Без неё кнопка берёт радиус своей ступени из темы."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-radius-xs",
    "kind": "theme",
    "default": "0.375rem",
    "description": "Скругление кнопки ступени `xs`. Тема задаёт форму по ступеням: у «Сланца» все 6px, у «Тактильной» — 8 / 8 / 10 / 12px."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-radius-sm",
    "kind": "theme",
    "default": "0.375rem",
    "description": "Скругление кнопки ступени `sm`. Тема задаёт форму по ступеням: у «Сланца» все 6px, у «Тактильной» — 8 / 8 / 10 / 12px."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-radius-md",
    "kind": "theme",
    "default": "0.375rem",
    "description": "Скругление кнопки ступени `md`. Тема задаёт форму по ступеням: у «Сланца» все 6px, у «Тактильной» — 8 / 8 / 10 / 12px."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-radius-lg",
    "kind": "theme",
    "default": "0.375rem",
    "description": "Скругление кнопки ступени `lg`. Тема задаёт форму по ступеням: у «Сланца» все 6px, у «Тактильной» — 8 / 8 / 10 / 12px."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-step-radius",
    "kind": "css",
    "default": "`--gr-button-radius-<ступень>` текущей ступени",
    "description": "Радиус текущей ступени: его ставит правило ступени в листе компонента, `--gr-button-corner-radius` берёт его, когда ручка `--gr-button-radius` не задана."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-corner-radius",
    "kind": "css",
    "default": "var(--gr-button-radius, var(--gr-button-step-radius)); в склеенной группе впереди `--gr-button-group-radius`",
    "description": "Радиус углов кнопки: ручка приложения, иначе радиус ступени; в склеенной `GrButtonGroup` — её ручка впереди. Углы читают его, пока свой угол не задан."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-radius-ss",
    "kind": "hook",
    "default": "var(--gr-button-corner-radius)",
    "description": "Скругление одного угла (начало блока, начало строки). Прикреплённая `GrButtonGroup` гасит им внутренние углы звеньев."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-radius-se",
    "kind": "hook",
    "default": "var(--gr-button-corner-radius)",
    "description": "Скругление одного угла (начало блока, конец строки). Прикреплённая `GrButtonGroup` гасит им внутренние углы звеньев."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-radius-ee",
    "kind": "hook",
    "default": "var(--gr-button-corner-radius)",
    "description": "Скругление одного угла (конец блока, конец строки). Прикреплённая `GrButtonGroup` гасит им внутренние углы звеньев."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-radius-es",
    "kind": "hook",
    "default": "var(--gr-button-corner-radius)",
    "description": "Скругление одного угла (конец блока, начало строки). Прикреплённая `GrButtonGroup` гасит им внутренние углы звеньев."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-square-size",
    "kind": "hook",
    "default": "высота кнопки текущей ступени",
    "description": "Сторона квадратной кнопки (`square`): иконка без подписи обязана остаться квадратом на любой ступени.",
    "literal": "Сторона берётся по ступени `size` из карты компонента (`sizes.md`)."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-font-weight",
    "kind": "theme",
    "default": "var(--gr-font-medium)",
    "description": "Начертание подписи. Кнопка читается как действие, а не как текст рядом с полем: у «Сланца» — medium, у «Чертежа» — 600."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-touch-size",
    "kind": "hook",
    "default": "2.75rem",
    "description": "Высота зоны касания на грубом указателе (`pointer: coarse`). Кнопка ниже неё добирает высоту невидимым `::after`, вид не меняется.",
    "literal": "Минимальная зона касания на грубом указателе (WCAG 2.5.5) — требование доступности, а не язык темы."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-divider",
    "kind": "hook",
    "default": "нет (`0 0 transparent`)",
    "description": "Шов solid-кнопки внутри прикреплённой `GrButtonGroup`: группа ставит его второму из соседних primary-звеньев, кнопка рисует его своей тенью.",
    "literal": "Нейтральное значение «шва нет»: шов ставит `GrButtonGroup`, тема его не задаёт."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-primary-bg",
    "kind": "theme",
    "default": "var(--gr-primary-solid)",
    "description": "Заливка solid-кнопки тона `primary`."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-primary-bg-hover",
    "kind": "theme",
    "default": "var(--gr-primary-solid-hover)",
    "description": "Заливка solid-кнопки тона `primary` под курсором."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-primary-bg-active",
    "kind": "theme",
    "default": "var(--gr-primary-solid-active)",
    "description": "Заливка solid-кнопки тона `primary` в момент нажатия."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-primary-fg",
    "kind": "theme",
    "default": "var(--gr-primary-solid-fg)",
    "description": "Цвет текста на solid-кнопке тона `primary`. Приходит из `--gr-primary-solid-fg`: заливка кнопки рассчитана нести светлый текст, и глобальный `-fg` тона на ней не подходит."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-primary-soft-bg",
    "kind": "theme",
    "default": "color-mix(in srgb, var(--gr-primary) 14%, var(--gr-bg))",
    "description": "Заливка soft-кнопки тона `primary`."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-primary-soft-bg-hover",
    "kind": "theme",
    "default": "color-mix(in srgb, var(--gr-primary) 10%, var(--gr-button-primary-soft-bg))",
    "description": "Заливка soft-кнопки тона `primary` под курсором. Тон подмешивается в саму soft-заливку, поэтому наведение темнеет в светлой теме и светлеет в тёмной."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-primary-soft-bg-active",
    "kind": "theme",
    "default": "color-mix(in srgb, var(--gr-primary) 16%, var(--gr-button-primary-soft-bg))",
    "description": "Заливка soft-кнопки тона `primary` в момент нажатия."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-primary-border-soft",
    "kind": "theme",
    "default": "color-mix(in srgb, var(--gr-primary) 38%, var(--gr-bg))",
    "description": "Рамка secondary-кнопки тона `primary` в покое: тон приглушён, чтобы второстепенный вес не спорил с primary."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-primary-border",
    "kind": "theme",
    "default": "color-mix(in srgb, var(--gr-primary) 70%, var(--gr-bg))",
    "description": "Рамка outline-кнопки тона `primary` в покое и secondary под курсором. Полный тон рамка получает под указателем."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-success-bg",
    "kind": "theme",
    "default": "var(--gr-success-solid)",
    "description": "Заливка solid-кнопки тона `success`."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-success-bg-hover",
    "kind": "theme",
    "default": "var(--gr-success-solid-hover)",
    "description": "Заливка solid-кнопки тона `success` под курсором."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-success-bg-active",
    "kind": "theme",
    "default": "var(--gr-success-solid-active)",
    "description": "Заливка solid-кнопки тона `success` в момент нажатия."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-success-fg",
    "kind": "theme",
    "default": "var(--gr-success-solid-fg)",
    "description": "Цвет текста на solid-кнопке тона `success`. Приходит из `--gr-success-solid-fg`: заливка кнопки рассчитана нести светлый текст, и глобальный `-fg` тона на ней не подходит."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-success-soft-bg",
    "kind": "theme",
    "default": "var(--gr-success-light)",
    "description": "Заливка soft-кнопки тона `success`."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-success-soft-bg-hover",
    "kind": "theme",
    "default": "color-mix(in srgb, var(--gr-success) 10%, var(--gr-button-success-soft-bg))",
    "description": "Заливка soft-кнопки тона `success` под курсором. Тон подмешивается в саму soft-заливку, поэтому наведение темнеет в светлой теме и светлеет в тёмной."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-success-soft-bg-active",
    "kind": "theme",
    "default": "color-mix(in srgb, var(--gr-success) 16%, var(--gr-button-success-soft-bg))",
    "description": "Заливка soft-кнопки тона `success` в момент нажатия."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-success-border-soft",
    "kind": "theme",
    "default": "color-mix(in srgb, var(--gr-success) 38%, var(--gr-bg))",
    "description": "Рамка secondary-кнопки тона `success` в покое: тон приглушён, чтобы второстепенный вес не спорил с primary."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-success-border",
    "kind": "theme",
    "default": "color-mix(in srgb, var(--gr-success) 70%, var(--gr-bg))",
    "description": "Рамка outline-кнопки тона `success` в покое и secondary под курсором. Полный тон рамка получает под указателем."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-warning-bg",
    "kind": "theme",
    "default": "var(--gr-warning-solid)",
    "description": "Заливка solid-кнопки тона `warning`."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-warning-bg-hover",
    "kind": "theme",
    "default": "var(--gr-warning-solid-hover)",
    "description": "Заливка solid-кнопки тона `warning` под курсором."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-warning-bg-active",
    "kind": "theme",
    "default": "var(--gr-warning-solid-active)",
    "description": "Заливка solid-кнопки тона `warning` в момент нажатия."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-warning-fg",
    "kind": "theme",
    "default": "var(--gr-warning-solid-fg)",
    "description": "Цвет текста на solid-кнопке тона `warning`. Приходит из `--gr-warning-solid-fg`: заливка кнопки рассчитана нести светлый текст, и глобальный `-fg` тона на ней не подходит."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-warning-soft-bg",
    "kind": "theme",
    "default": "var(--gr-warning-light)",
    "description": "Заливка soft-кнопки тона `warning`."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-warning-soft-bg-hover",
    "kind": "theme",
    "default": "color-mix(in srgb, var(--gr-warning) 10%, var(--gr-button-warning-soft-bg))",
    "description": "Заливка soft-кнопки тона `warning` под курсором. Тон подмешивается в саму soft-заливку, поэтому наведение темнеет в светлой теме и светлеет в тёмной."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-warning-soft-bg-active",
    "kind": "theme",
    "default": "color-mix(in srgb, var(--gr-warning) 16%, var(--gr-button-warning-soft-bg))",
    "description": "Заливка soft-кнопки тона `warning` в момент нажатия."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-warning-border-soft",
    "kind": "theme",
    "default": "color-mix(in srgb, var(--gr-warning) 38%, var(--gr-bg))",
    "description": "Рамка secondary-кнопки тона `warning` в покое: тон приглушён, чтобы второстепенный вес не спорил с primary."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-warning-border",
    "kind": "theme",
    "default": "color-mix(in srgb, var(--gr-warning) 70%, var(--gr-bg))",
    "description": "Рамка outline-кнопки тона `warning` в покое и secondary под курсором. Полный тон рамка получает под указателем."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-danger-bg",
    "kind": "theme",
    "default": "var(--gr-danger-solid)",
    "description": "Заливка solid-кнопки тона `danger`."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-danger-bg-hover",
    "kind": "theme",
    "default": "var(--gr-danger-solid-hover)",
    "description": "Заливка solid-кнопки тона `danger` под курсором."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-danger-bg-active",
    "kind": "theme",
    "default": "var(--gr-danger-solid-active)",
    "description": "Заливка solid-кнопки тона `danger` в момент нажатия."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-danger-fg",
    "kind": "theme",
    "default": "var(--gr-danger-solid-fg)",
    "description": "Цвет текста на solid-кнопке тона `danger`. Приходит из `--gr-danger-solid-fg`: заливка кнопки рассчитана нести светлый текст, и глобальный `-fg` тона на ней не подходит."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-danger-soft-bg",
    "kind": "theme",
    "default": "var(--gr-danger-light)",
    "description": "Заливка soft-кнопки тона `danger`."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-danger-soft-bg-hover",
    "kind": "theme",
    "default": "color-mix(in srgb, var(--gr-danger) 10%, var(--gr-button-danger-soft-bg))",
    "description": "Заливка soft-кнопки тона `danger` под курсором. Тон подмешивается в саму soft-заливку, поэтому наведение темнеет в светлой теме и светлеет в тёмной."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-danger-soft-bg-active",
    "kind": "theme",
    "default": "color-mix(in srgb, var(--gr-danger) 16%, var(--gr-button-danger-soft-bg))",
    "description": "Заливка soft-кнопки тона `danger` в момент нажатия."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-danger-border-soft",
    "kind": "theme",
    "default": "color-mix(in srgb, var(--gr-danger) 38%, var(--gr-bg))",
    "description": "Рамка secondary-кнопки тона `danger` в покое: тон приглушён, чтобы второстепенный вес не спорил с primary."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-danger-border",
    "kind": "theme",
    "default": "color-mix(in srgb, var(--gr-danger) 70%, var(--gr-bg))",
    "description": "Рамка outline-кнопки тона `danger` в покое и secondary под курсором. Полный тон рамка получает под указателем."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-info-bg",
    "kind": "theme",
    "default": "var(--gr-info-solid)",
    "description": "Заливка solid-кнопки тона `info`."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-info-bg-hover",
    "kind": "theme",
    "default": "var(--gr-info-solid-hover)",
    "description": "Заливка solid-кнопки тона `info` под курсором."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-info-bg-active",
    "kind": "theme",
    "default": "var(--gr-info-solid-active)",
    "description": "Заливка solid-кнопки тона `info` в момент нажатия."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-info-fg",
    "kind": "theme",
    "default": "var(--gr-info-solid-fg)",
    "description": "Цвет текста на solid-кнопке тона `info`. Приходит из `--gr-info-solid-fg`: заливка кнопки рассчитана нести светлый текст, и глобальный `-fg` тона на ней не подходит."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-info-soft-bg",
    "kind": "theme",
    "default": "var(--gr-info-light)",
    "description": "Заливка soft-кнопки тона `info`."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-info-soft-bg-hover",
    "kind": "theme",
    "default": "color-mix(in srgb, var(--gr-info) 10%, var(--gr-button-info-soft-bg))",
    "description": "Заливка soft-кнопки тона `info` под курсором. Тон подмешивается в саму soft-заливку, поэтому наведение темнеет в светлой теме и светлеет в тёмной."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-info-soft-bg-active",
    "kind": "theme",
    "default": "color-mix(in srgb, var(--gr-info) 16%, var(--gr-button-info-soft-bg))",
    "description": "Заливка soft-кнопки тона `info` в момент нажатия."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-info-border-soft",
    "kind": "theme",
    "default": "color-mix(in srgb, var(--gr-info) 38%, var(--gr-bg))",
    "description": "Рамка secondary-кнопки тона `info` в покое: тон приглушён, чтобы второстепенный вес не спорил с primary."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-info-border",
    "kind": "theme",
    "default": "color-mix(in srgb, var(--gr-info) 70%, var(--gr-bg))",
    "description": "Рамка outline-кнопки тона `info` в покое и secondary под курсором. Полный тон рамка получает под указателем."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-slate-bg",
    "kind": "theme",
    "default": "var(--gr-slate-solid)",
    "description": "Заливка solid-кнопки тона `slate`."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-slate-bg-hover",
    "kind": "theme",
    "default": "var(--gr-slate-solid-hover)",
    "description": "Заливка solid-кнопки тона `slate` под курсором."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-slate-bg-active",
    "kind": "theme",
    "default": "var(--gr-slate-solid-active)",
    "description": "Заливка solid-кнопки тона `slate` в момент нажатия."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-slate-fg",
    "kind": "theme",
    "default": "var(--gr-slate-solid-fg)",
    "description": "Цвет текста на solid-кнопке тона `slate`. Приходит из `--gr-slate-solid-fg`: заливка кнопки рассчитана нести светлый текст, и глобальный `-fg` тона на ней не подходит."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-slate-soft-bg",
    "kind": "theme",
    "default": "var(--gr-slate-light)",
    "description": "Заливка soft-кнопки тона `slate`."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-slate-soft-bg-hover",
    "kind": "theme",
    "default": "color-mix(in srgb, var(--gr-slate) 10%, var(--gr-button-slate-soft-bg))",
    "description": "Заливка soft-кнопки тона `slate` под курсором. Тон подмешивается в саму soft-заливку, поэтому наведение темнеет в светлой теме и светлеет в тёмной."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-slate-soft-bg-active",
    "kind": "theme",
    "default": "color-mix(in srgb, var(--gr-slate) 16%, var(--gr-button-slate-soft-bg))",
    "description": "Заливка soft-кнопки тона `slate` в момент нажатия."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-slate-border-soft",
    "kind": "theme",
    "default": "color-mix(in srgb, var(--gr-slate) 38%, var(--gr-bg))",
    "description": "Рамка secondary-кнопки тона `slate` в покое: тон приглушён, чтобы второстепенный вес не спорил с primary."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-slate-border",
    "kind": "theme",
    "default": "color-mix(in srgb, var(--gr-slate) 70%, var(--gr-bg))",
    "description": "Рамка outline-кнопки тона `slate` в покое и secondary под курсором. Полный тон рамка получает под указателем."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-azure-bg",
    "kind": "theme",
    "default": "var(--gr-azure-solid)",
    "description": "Заливка solid-кнопки тона `azure`."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-azure-bg-hover",
    "kind": "theme",
    "default": "var(--gr-azure-solid-hover)",
    "description": "Заливка solid-кнопки тона `azure` под курсором."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-azure-bg-active",
    "kind": "theme",
    "default": "var(--gr-azure-solid-active)",
    "description": "Заливка solid-кнопки тона `azure` в момент нажатия."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-azure-fg",
    "kind": "theme",
    "default": "var(--gr-azure-solid-fg)",
    "description": "Цвет текста на solid-кнопке тона `azure`. Приходит из `--gr-azure-solid-fg`: заливка кнопки рассчитана нести светлый текст, и глобальный `-fg` тона на ней не подходит."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-azure-soft-bg",
    "kind": "theme",
    "default": "var(--gr-azure-light)",
    "description": "Заливка soft-кнопки тона `azure`."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-azure-soft-bg-hover",
    "kind": "theme",
    "default": "color-mix(in srgb, var(--gr-azure) 10%, var(--gr-button-azure-soft-bg))",
    "description": "Заливка soft-кнопки тона `azure` под курсором. Тон подмешивается в саму soft-заливку, поэтому наведение темнеет в светлой теме и светлеет в тёмной."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-azure-soft-bg-active",
    "kind": "theme",
    "default": "color-mix(in srgb, var(--gr-azure) 16%, var(--gr-button-azure-soft-bg))",
    "description": "Заливка soft-кнопки тона `azure` в момент нажатия."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-azure-border-soft",
    "kind": "theme",
    "default": "color-mix(in srgb, var(--gr-azure) 38%, var(--gr-bg))",
    "description": "Рамка secondary-кнопки тона `azure` в покое: тон приглушён, чтобы второстепенный вес не спорил с primary."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-azure-border",
    "kind": "theme",
    "default": "color-mix(in srgb, var(--gr-azure) 70%, var(--gr-bg))",
    "description": "Рамка outline-кнопки тона `azure` в покое и secondary под курсором. Полный тон рамка получает под указателем."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-neutral-soft-bg",
    "kind": "theme",
    "default": "var(--gr-card)",
    "description": "Заливка нейтральной secondary-кнопки — «обычной» кнопки формы: поверхность карточки."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-neutral-soft-bg-hover",
    "kind": "theme",
    "default": "color-mix(in srgb, var(--gr-fg) 6%, var(--gr-card))",
    "description": "Заливка нейтральной soft-кнопки под курсором. Подмешивается цвет текста: своего цвета у нейтрального тона нет."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-neutral-soft-bg-active",
    "kind": "theme",
    "default": "color-mix(in srgb, var(--gr-fg) 11%, var(--gr-card))",
    "description": "Заливка нейтральной soft-кнопки в момент нажатия."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-neutral-border",
    "kind": "theme",
    "default": "color-mix(in srgb, var(--gr-brd) 50%, var(--gr-brd-hover))",
    "description": "Рамка нейтральных secondary и outline: заметнее `--gr-brd`, чтобы белая кнопка не терялась на светлом фоне."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-neutral-border-soft",
    "kind": "theme",
    "default": "var(--gr-button-neutral-border)",
    "description": "Рамка нейтральной `secondary` в покое. Отдельно от рамки `outline`: у плашки рамка тише, чем у контурной кнопки."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-shadow",
    "kind": "theme",
    "default": "inset 0 1px 0 color-mix(in srgb, var(--gr-slate-0) 16%, transparent), var(--gr-shadow-1)",
    "description": "Объём solid-кнопки: блик по верхней кромке и мелкая тень. В тёмной теме блик тише."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-shadow-active",
    "kind": "theme",
    "default": "inset 0 1px 2px color-mix(in srgb, var(--gr-slate-900) 24%, transparent)",
    "description": "Тень solid-кнопки в момент нажатия: уходит внутрь, кнопка выглядит вдавленной."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-surface-shadow",
    "kind": "theme",
    "default": "var(--gr-shadow-1)",
    "description": "Тень нейтральной `secondary` — плашки, лежащей на поверхности карточки. У «Чертежа» — без тени."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-disabled-bg",
    "kind": "theme",
    "default": "var(--gr-disabled-bg)",
    "description": "Заливка недоступной кнопки: она гасится поверхностью, а не прозрачностью. Ссылка на общую роль — недоступное во всём пакете перекрашивается одним местом."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-disabled-fg",
    "kind": "theme",
    "default": "var(--gr-disabled-fg)",
    "description": "Цвет текста недоступной кнопки. Ссылка на общую роль недоступного состояния."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-disabled-brd",
    "kind": "theme",
    "default": "var(--gr-disabled-brd)",
    "description": "Цвет рамки недоступной кнопки. Ссылка на общую роль недоступного состояния."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-neutral-bg",
    "kind": "theme",
    "default": "var(--gr-secondary)",
    "description": "Заливка solid-кнопки тона `neutral`. У «Сланца» — плашка `--gr-secondary`; тема, где главная кнопка не серая, задаёт свою: у «Глины» это графит, в тёмном режиме — светлая заливка."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-neutral-bg-hover",
    "kind": "theme",
    "default": "var(--gr-secondary-hover)",
    "description": "Заливка solid-кнопки `neutral` под указателем."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-neutral-bg-active",
    "kind": "theme",
    "default": "var(--gr-secondary-active)",
    "description": "Заливка solid-кнопки `neutral` в нажатии."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-neutral-fg",
    "kind": "theme",
    "default": "var(--gr-secondary-fg)",
    "description": "Подпись solid-кнопки `neutral`. Тема задаёт её вместе с заливкой."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-ghost-bg-hover",
    "kind": "hook",
    "default": "var(--gr-button-<тон>-ghost-bg-hover)",
    "description": "Подложка прозрачных весов (`outline`, `ghost`, `ghost-border`) под указателем — одна на все тоны: ручка приложения. Без неё — подложка тона из темы, `--gr-button-<тон>-ghost-bg-hover`."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-ghost-bg-active",
    "kind": "hook",
    "default": "var(--gr-button-<тон>-ghost-bg-active)",
    "description": "Подложка прозрачных весов в нажатии — одна на все тоны: ручка приложения. Без неё — `--gr-button-<тон>-ghost-bg-active` из темы."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-primary-ghost-bg-hover",
    "kind": "theme",
    "default": "var(--gr-button-primary-soft-bg-hover)",
    "description": "Подложка прозрачных весов тона `primary` под указателем. У «Сланца» — soft-подложка тона; у «Глины» — оттенок бумаги, общий для всех тонов."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-primary-ghost-bg-active",
    "kind": "theme",
    "default": "var(--gr-button-primary-soft-bg-active)",
    "description": "Подложка прозрачных весов тона `primary` в нажатии."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-neutral-ghost-bg-hover",
    "kind": "theme",
    "default": "var(--gr-button-neutral-soft-bg-hover)",
    "description": "Подложка прозрачных весов тона `neutral` под указателем. У «Сланца» — soft-подложка тона; у «Глины» — оттенок бумаги, общий для всех тонов."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-neutral-ghost-bg-active",
    "kind": "theme",
    "default": "var(--gr-button-neutral-soft-bg-active)",
    "description": "Подложка прозрачных весов тона `neutral` в нажатии."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-success-ghost-bg-hover",
    "kind": "theme",
    "default": "var(--gr-button-success-soft-bg-hover)",
    "description": "Подложка прозрачных весов тона `success` под указателем. У «Сланца» — soft-подложка тона; у «Глины» — оттенок бумаги, общий для всех тонов."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-success-ghost-bg-active",
    "kind": "theme",
    "default": "var(--gr-button-success-soft-bg-active)",
    "description": "Подложка прозрачных весов тона `success` в нажатии."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-warning-ghost-bg-hover",
    "kind": "theme",
    "default": "var(--gr-button-warning-soft-bg-hover)",
    "description": "Подложка прозрачных весов тона `warning` под указателем. У «Сланца» — soft-подложка тона; у «Глины» — оттенок бумаги, общий для всех тонов."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-warning-ghost-bg-active",
    "kind": "theme",
    "default": "var(--gr-button-warning-soft-bg-active)",
    "description": "Подложка прозрачных весов тона `warning` в нажатии."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-danger-ghost-bg-hover",
    "kind": "theme",
    "default": "var(--gr-button-danger-soft-bg-hover)",
    "description": "Подложка прозрачных весов тона `danger` под указателем. У «Сланца» — soft-подложка тона; у «Глины» — оттенок бумаги, общий для всех тонов."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-danger-ghost-bg-active",
    "kind": "theme",
    "default": "var(--gr-button-danger-soft-bg-active)",
    "description": "Подложка прозрачных весов тона `danger` в нажатии."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-info-ghost-bg-hover",
    "kind": "theme",
    "default": "var(--gr-button-info-soft-bg-hover)",
    "description": "Подложка прозрачных весов тона `info` под указателем. У «Сланца» — soft-подложка тона; у «Глины» — оттенок бумаги, общий для всех тонов."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-info-ghost-bg-active",
    "kind": "theme",
    "default": "var(--gr-button-info-soft-bg-active)",
    "description": "Подложка прозрачных весов тона `info` в нажатии."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-slate-ghost-bg-hover",
    "kind": "theme",
    "default": "var(--gr-button-slate-soft-bg-hover)",
    "description": "Подложка прозрачных весов тона `slate` под указателем. У «Сланца» — soft-подложка тона; у «Глины» — оттенок бумаги, общий для всех тонов."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-slate-ghost-bg-active",
    "kind": "theme",
    "default": "var(--gr-button-slate-soft-bg-active)",
    "description": "Подложка прозрачных весов тона `slate` в нажатии."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-azure-ghost-bg-hover",
    "kind": "theme",
    "default": "var(--gr-button-azure-soft-bg-hover)",
    "description": "Подложка прозрачных весов тона `azure` под указателем. У «Сланца» — soft-подложка тона; у «Глины» — оттенок бумаги, общий для всех тонов."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-azure-ghost-bg-active",
    "kind": "theme",
    "default": "var(--gr-button-azure-soft-bg-active)",
    "description": "Подложка прозрачных весов тона `azure` в нажатии."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-primary-glow",
    "kind": "theme",
    "default": "transparent",
    "description": "Цвет тени тона `primary` у solid-кнопки: у «Тактильной» — заливка тона, в светлом режиме 42 %, в тёмном 62 %."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-neutral-glow",
    "kind": "theme",
    "default": "transparent",
    "description": "Цвет тени тона `neutral` у solid-кнопки: у «Тактильной» — заливка тона, в светлом режиме 42 %, в тёмном 62 %."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-success-glow",
    "kind": "theme",
    "default": "transparent",
    "description": "Цвет тени тона `success` у solid-кнопки: у «Тактильной» — заливка тона, в светлом режиме 42 %, в тёмном 62 %."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-warning-glow",
    "kind": "theme",
    "default": "transparent",
    "description": "Цвет тени тона `warning` у solid-кнопки: у «Тактильной» — заливка тона, в светлом режиме 42 %, в тёмном 62 %."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-danger-glow",
    "kind": "theme",
    "default": "transparent",
    "description": "Цвет тени тона `danger` у solid-кнопки: у «Тактильной» — заливка тона, в светлом режиме 42 %, в тёмном 62 %."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-info-glow",
    "kind": "theme",
    "default": "transparent",
    "description": "Цвет тени тона `info` у solid-кнопки: у «Тактильной» — заливка тона, в светлом режиме 42 %, в тёмном 62 %."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-slate-glow",
    "kind": "theme",
    "default": "transparent",
    "description": "Цвет тени тона `slate` у solid-кнопки: у «Тактильной» — заливка тона, в светлом режиме 42 %, в тёмном 62 %."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-azure-glow",
    "kind": "theme",
    "default": "transparent",
    "description": "Цвет тени тона `azure` у solid-кнопки: у «Тактильной» — заливка тона, в светлом режиме 42 %, в тёмном 62 %."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-shimmer-duration",
    "kind": "theme",
    "default": "1.8s",
    "description": "Один проход света по подписи при `loadingIndicator=\"shimmer\"`."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-motion-duration",
    "kind": "theme",
    "default": "var(--gr-duration-fast)",
    "description": "Длительность отклика кнопки — цвета, тени, подъёма, отступа фокуса."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-motion-ease",
    "kind": "theme",
    "default": "var(--gr-ease-out)",
    "description": "Кривая отклика кнопки. У «Тактильной» — пружина."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-focus-offset",
    "kind": "theme",
    "default": "2px",
    "description": "Отступ контура фокуса от кнопки."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-focus-offset-from",
    "kind": "theme",
    "default": "2px",
    "description": "Отступ контура в момент появления фокуса: контур едет от него к `--gr-button-focus-offset`. У «Тактильной» — 6px, у «Сланца» равен конечному, и контур не движется."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-lift",
    "kind": "theme",
    "default": "0px",
    "description": "Подъём живой кнопки под указателем, по вертикали; с reduced-motion — без подъёма. У «Тактильной» — `-1px`."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-solid-image",
    "kind": "theme",
    "default": "none",
    "description": "Слой поверх заливки solid-кнопки (`background-image`): у «Тактильной» — градиент света сверху."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-glow",
    "kind": "theme",
    "default": "0 0 0 0",
    "description": "Геометрия тени цвета тона у solid-кнопки в покое; цвет — `--gr-button-<тон>-glow`."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-glow-hover",
    "kind": "theme",
    "default": "0 0 0 0",
    "description": "Геометрия тени цвета тона под указателем."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-response-color",
    "kind": "theme",
    "default": "transparent",
    "description": "Слой отклика прозрачных весов (`outline`, `ghost`, `ghost-border`) под указателем: у «Тактильной» — подложка, у «Чертежа» — линия хода. Считается от `currentColor` кнопки."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-response-soft-color",
    "kind": "theme",
    "default": "transparent",
    "description": "Слой отклика `secondary` под указателем."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-response-solid-color",
    "kind": "theme",
    "default": "transparent",
    "description": "Слой отклика solid-кнопки под указателем: у «Чертежа» — линия цветом подписи на 65 %."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-response-inset",
    "kind": "theme",
    "default": "0",
    "description": "Положение слоя отклика (`inset`): вся кнопка — `0`, нижняя кромка — `auto -1px -1px`."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-response-height",
    "kind": "theme",
    "default": "auto",
    "description": "Высота слоя отклика: `auto` — по `inset`, линия — `2px`."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-response-from",
    "kind": "theme",
    "default": "none",
    "description": "Трансформация слоя в покое: подложка растёт из `scale(.88)`, линия — из `scaleX(0)`."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-response-opacity",
    "kind": "theme",
    "default": "0",
    "description": "Прозрачность слоя в покое; под указателем — 1."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-response-origin",
    "kind": "theme",
    "default": "50%",
    "description": "Точка, от которой растёт слой, — доля ширины от начала строки: `50%` — из центра, `0%` — от начала строки (линия хода). В RTL отражается."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-response-duration",
    "kind": "theme",
    "default": "var(--gr-duration-fast)",
    "description": "Длительность появления слоя отклика."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-response-ease",
    "kind": "theme",
    "default": "var(--gr-ease-out)",
    "description": "Кривая появления слоя отклика."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-disabled-border-style",
    "kind": "theme",
    "default": "solid",
    "description": "Стиль рамки недоступной кнопки: пунктир читается и без цвета."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-disabled-image",
    "kind": "theme",
    "default": "none",
    "description": "Слой поверх заливки недоступной кнопки: у «Тактильной» — штриховка."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-track-duration",
    "kind": "theme",
    "default": "1.1s",
    "description": "Период бегущего отрезка загрузки (`loadingIndicator: \"track\"`); с reduced-motion — медленнее, но не выключается: другого сигнала у загрузки нет."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-primary-border-hover",
    "kind": "theme",
    "default": "var(--gr-primary)",
    "description": "Рамка `outline` и `ghost-border` тона `primary` под указателем; у `secondary` — в нажатии."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-primary-border-active",
    "kind": "theme",
    "default": "var(--gr-primary-active)",
    "description": "Рамка `outline` и `ghost-border` тона `primary` в нажатии."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-primary-border-soft-hover",
    "kind": "theme",
    "default": "var(--gr-button-primary-border)",
    "description": "Рамка `secondary` тона `primary` под указателем."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-neutral-border-hover",
    "kind": "theme",
    "default": "var(--gr-brd-hover)",
    "description": "Рамка `outline` и `ghost-border` тона `neutral` под указателем; у `secondary` — в нажатии."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-neutral-border-active",
    "kind": "theme",
    "default": "var(--gr-brd-active)",
    "description": "Рамка `outline` и `ghost-border` тона `neutral` в нажатии."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-neutral-border-soft-hover",
    "kind": "theme",
    "default": "var(--gr-button-neutral-border)",
    "description": "Рамка `secondary` тона `neutral` под указателем."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-success-border-hover",
    "kind": "theme",
    "default": "var(--gr-success)",
    "description": "Рамка `outline` и `ghost-border` тона `success` под указателем; у `secondary` — в нажатии."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-success-border-active",
    "kind": "theme",
    "default": "var(--gr-success-active)",
    "description": "Рамка `outline` и `ghost-border` тона `success` в нажатии."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-success-border-soft-hover",
    "kind": "theme",
    "default": "var(--gr-button-success-border)",
    "description": "Рамка `secondary` тона `success` под указателем."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-warning-border-hover",
    "kind": "theme",
    "default": "var(--gr-warning)",
    "description": "Рамка `outline` и `ghost-border` тона `warning` под указателем; у `secondary` — в нажатии."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-warning-border-active",
    "kind": "theme",
    "default": "var(--gr-warning-active)",
    "description": "Рамка `outline` и `ghost-border` тона `warning` в нажатии."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-warning-border-soft-hover",
    "kind": "theme",
    "default": "var(--gr-button-warning-border)",
    "description": "Рамка `secondary` тона `warning` под указателем."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-danger-border-hover",
    "kind": "theme",
    "default": "var(--gr-danger)",
    "description": "Рамка `outline` и `ghost-border` тона `danger` под указателем; у `secondary` — в нажатии."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-danger-border-active",
    "kind": "theme",
    "default": "var(--gr-danger-active)",
    "description": "Рамка `outline` и `ghost-border` тона `danger` в нажатии."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-danger-border-soft-hover",
    "kind": "theme",
    "default": "var(--gr-button-danger-border)",
    "description": "Рамка `secondary` тона `danger` под указателем."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-info-border-hover",
    "kind": "theme",
    "default": "var(--gr-info)",
    "description": "Рамка `outline` и `ghost-border` тона `info` под указателем; у `secondary` — в нажатии."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-info-border-active",
    "kind": "theme",
    "default": "var(--gr-info-active)",
    "description": "Рамка `outline` и `ghost-border` тона `info` в нажатии."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-info-border-soft-hover",
    "kind": "theme",
    "default": "var(--gr-button-info-border)",
    "description": "Рамка `secondary` тона `info` под указателем."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-slate-border-hover",
    "kind": "theme",
    "default": "var(--gr-slate)",
    "description": "Рамка `outline` и `ghost-border` тона `slate` под указателем; у `secondary` — в нажатии."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-slate-border-active",
    "kind": "theme",
    "default": "var(--gr-slate-active)",
    "description": "Рамка `outline` и `ghost-border` тона `slate` в нажатии."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-slate-border-soft-hover",
    "kind": "theme",
    "default": "var(--gr-button-slate-border)",
    "description": "Рамка `secondary` тона `slate` под указателем."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-azure-border-hover",
    "kind": "theme",
    "default": "var(--gr-azure)",
    "description": "Рамка `outline` и `ghost-border` тона `azure` под указателем; у `secondary` — в нажатии."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-azure-border-active",
    "kind": "theme",
    "default": "var(--gr-azure-active)",
    "description": "Рамка `outline` и `ghost-border` тона `azure` в нажатии."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-azure-border-soft-hover",
    "kind": "theme",
    "default": "var(--gr-button-azure-border)",
    "description": "Рамка `secondary` тона `azure` под указателем."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-disabled-outline-brd",
    "kind": "theme",
    "default": "var(--gr-button-disabled-brd)",
    "description": "Рамка недоступной `outline`: у неё нет заливки, и рамка — единственный контур, когда у залитых весов рамки уже нет."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-press-scale",
    "kind": "theme",
    "default": "0.98",
    "description": "Масштаб кнопки в нажатии; 1 — без сжатия. С `prefers-reduced-motion` не действует."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-tone-bg",
    "kind": "css",
    "default": "`--gr-button-<тон>-bg`",
    "description": "Заливка solid-кнопки тона. Ставит правило тона в листе компонента по `data-gr-tone`: правила весов читают одну переменную вместо копии на каждый тон."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-tone-bg-hover",
    "kind": "css",
    "default": "`--gr-button-<тон>-bg-hover`",
    "description": "Заливка solid-кнопки тона под указателем. Ставит правило тона в листе компонента по `data-gr-tone`: правила весов читают одну переменную вместо копии на каждый тон."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-tone-bg-active",
    "kind": "css",
    "default": "`--gr-button-<тон>-bg-active`",
    "description": "Заливка solid-кнопки тона в нажатии. Ставит правило тона в листе компонента по `data-gr-tone`: правила весов читают одну переменную вместо копии на каждый тон."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-tone-fg",
    "kind": "css",
    "default": "`--gr-button-<тон>-fg`",
    "description": "Подпись на заливке solid-кнопки тона. Ставит правило тона в листе компонента по `data-gr-tone`: правила весов читают одну переменную вместо копии на каждый тон."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-tone-text",
    "kind": "css",
    "default": "роль текста тона: `--gr-<тон>-text`, у `primary` — `--gr-accent-fg`, у `neutral` — `--gr-fg`",
    "description": "Подпись прозрачных весов (`outline`, `ghost`, `ghost-border`). Ставит правило тона в листе компонента по `data-gr-tone`: правила весов читают одну переменную вместо копии на каждый тон."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-tone-soft-bg",
    "kind": "css",
    "default": "`--gr-button-<тон>-soft-bg`",
    "description": "Мягкая заливка `secondary`. Ставит правило тона в листе компонента по `data-gr-tone`: правила весов читают одну переменную вместо копии на каждый тон."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-tone-soft-bg-hover",
    "kind": "css",
    "default": "`--gr-button-<тон>-soft-bg-hover`",
    "description": "Мягкая заливка `secondary` под указателем. Ставит правило тона в листе компонента по `data-gr-tone`: правила весов читают одну переменную вместо копии на каждый тон."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-tone-soft-bg-active",
    "kind": "css",
    "default": "`--gr-button-<тон>-soft-bg-active`",
    "description": "Мягкая заливка `secondary` в нажатии. Ставит правило тона в листе компонента по `data-gr-tone`: правила весов читают одну переменную вместо копии на каждый тон."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-tone-soft-fg",
    "kind": "css",
    "default": "роль текста на мягкой подложке тона",
    "description": "Подпись `secondary`. Ставит правило тона в листе компонента по `data-gr-tone`: правила весов читают одну переменную вместо копии на каждый тон."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-tone-ghost-bg-hover",
    "kind": "css",
    "default": "`--gr-button-<тон>-ghost-bg-hover`",
    "description": "Подложка прозрачных весов под указателем; ручка `--gr-button-ghost-bg-hover` впереди. Ставит правило тона в листе компонента по `data-gr-tone`: правила весов читают одну переменную вместо копии на каждый тон."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-tone-ghost-bg-active",
    "kind": "css",
    "default": "`--gr-button-<тон>-ghost-bg-active`",
    "description": "Подложка прозрачных весов в нажатии; ручка `--gr-button-ghost-bg-active` впереди. Ставит правило тона в листе компонента по `data-gr-tone`: правила весов читают одну переменную вместо копии на каждый тон."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-tone-border",
    "kind": "css",
    "default": "`--gr-button-<тон>-border`",
    "description": "Рамка `outline` и `ghost-border` в покое. Ставит правило тона в листе компонента по `data-gr-tone`: правила весов читают одну переменную вместо копии на каждый тон."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-tone-border-hover",
    "kind": "css",
    "default": "`--gr-button-<тон>-border-hover`",
    "description": "Рамка `outline` и `ghost-border` под указателем, рамка `secondary` в нажатии. Ставит правило тона в листе компонента по `data-gr-tone`: правила весов читают одну переменную вместо копии на каждый тон."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-tone-border-active",
    "kind": "css",
    "default": "`--gr-button-<тон>-border-active`",
    "description": "Рамка `outline` и `ghost-border` в нажатии. Ставит правило тона в листе компонента по `data-gr-tone`: правила весов читают одну переменную вместо копии на каждый тон."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-tone-border-soft",
    "kind": "css",
    "default": "`--gr-button-<тон>-border-soft`",
    "description": "Рамка `secondary` в покое. Ставит правило тона в листе компонента по `data-gr-tone`: правила весов читают одну переменную вместо копии на каждый тон."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-tone-border-soft-hover",
    "kind": "css",
    "default": "`--gr-button-<тон>-border-soft-hover`",
    "description": "Рамка `secondary` под указателем. Ставит правило тона в листе компонента по `data-gr-tone`: правила весов читают одну переменную вместо копии на каждый тон."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-tone-glow",
    "kind": "css",
    "default": "`--gr-button-<тон>-glow`",
    "description": "Цвет тени solid-кнопки. Ставит правило тона в листе компонента по `data-gr-tone`: правила весов читают одну переменную вместо копии на каждый тон."
  },
  {
    "owner": "GrButtonGroup",
    "name": "--gr-button-group-radius",
    "kind": "hook",
    "default": "радиус кнопки `--gr-button-corner-radius`",
    "description": "Скругление внешних углов склеенной группы — ручка приложения. Без неё звенья берут свой радиус (`--gr-button-corner-radius`), внутренние углы группа гасит сама. Читает её лист `GrButton`."
  },
  {
    "owner": "GrButtonGroup",
    "name": "--gr-button-group-tray-bg",
    "kind": "hook",
    "default": "var(--gr-muted)",
    "description": "Подложка лотка (`appearance=\"tray\"`), на которой лежат звенья группы."
  },
  {
    "owner": "GrButtonGroup",
    "name": "--gr-button-group-tray-radius",
    "kind": "theme",
    "default": "var(--gr-radius-md)",
    "description": "Скругление лотка `appearance=\"tray\"`. Звено внутри скругляется своей ступенью кнопки: лотку нужен радиус на поле (2px) больше."
  },
  {
    "owner": "GrCard",
    "name": "--gr-card-title-size",
    "kind": "theme",
    "default": "var(--gr-text-sm)",
    "description": "Кегль заголовка карточки из `title`."
  },
  {
    "owner": "GrCard",
    "name": "--gr-card-title-leading",
    "kind": "theme",
    "default": "var(--gr-leading-sm)",
    "description": "Интерлиньяж заголовка карточки."
  },
  {
    "owner": "GrCard",
    "name": "--gr-card-title-weight",
    "kind": "theme",
    "default": "var(--gr-font-semibold)",
    "description": "Вес заголовка карточки. Антикве заголовков (`--gr-font-display`) обычно нужен вес легче, чем гротеску."
  },
  {
    "owner": "GrCard",
    "name": "--gr-card-padding-sm",
    "kind": "theme",
    "default": "0.75rem",
    "description": "Поле карточки `padding=\"sm\"`."
  },
  {
    "owner": "GrCard",
    "name": "--gr-card-padding-md",
    "kind": "theme",
    "default": "1rem",
    "description": "Поле карточки `padding=\"md\"`."
  },
  {
    "owner": "GrCard",
    "name": "--gr-card-padding-lg",
    "kind": "theme",
    "default": "1.5rem",
    "description": "Поле карточки `padding=\"lg\"`."
  },
  {
    "owner": "GrCard",
    "name": "--gr-card-hover-bg",
    "kind": "theme",
    "default": "var(--gr-muted)",
    "description": "Заливка нажимаемой карточки под указателем."
  },
  {
    "owner": "GrCard",
    "name": "--gr-card-hover-brd",
    "kind": "theme",
    "default": "var(--gr-brd)",
    "description": "Рамка нажимаемой карточки под указателем. У `ghost` рамки нет, и наведение её не рисует."
  },
  {
    "owner": "GrCarousel",
    "name": "--gr-carousel-index",
    "kind": "inline",
    "default": "0",
    "description": "Номер текущего слайда. Компонент присваивает его сам, а сдвиг ленты считает CSS: так позиция переживает серверный рендер и гасится глобальным клампом `prefers-reduced-motion` вместе с переходом."
  },
  {
    "owner": "GrCarousel",
    "name": "--gr-carousel-drag",
    "kind": "inline",
    "default": "0px",
    "description": "Смещение ленты за указателем на время жеста. Вне жеста — ноль."
  },
  {
    "owner": "GrCarousel",
    "name": "--gr-carousel-control-bg",
    "kind": "hook",
    "default": "var(--gr-bg)",
    "description": "Подложка стрелок и тумблера автопрокрутки. Они лежат поверх произвольного содержимого слайда, поэтому подложка обязательна: на светлом кадре иконка без неё пропадает."
  },
  {
    "owner": "GrCarousel",
    "name": "--gr-carousel-control-bg-hover",
    "kind": "hook",
    "default": "var(--gr-muted)",
    "description": "Подложка стрелки и тумблера под курсором."
  },
  {
    "owner": "GrCarousel",
    "name": "--gr-carousel-control-fg",
    "kind": "hook",
    "default": "var(--gr-fg)",
    "description": "Цвет иконок стрелок и тумблера."
  },
  {
    "owner": "GrCarousel",
    "name": "--gr-carousel-gap",
    "kind": "hook",
    "default": "0.5rem",
    "description": "Просвет между переключателями в полосе.",
    "literal": "Геометрия раскладки ленты."
  },
  {
    "owner": "GrCarousel",
    "name": "--gr-carousel-dot",
    "kind": "hook",
    "default": "var(--gr-brd)",
    "description": "Цвет неактивной точки-индикатора."
  },
  {
    "owner": "GrCarousel",
    "name": "--gr-carousel-dot-active",
    "kind": "hook",
    "default": "var(--gr-primary)",
    "description": "Цвет текущей точки; он же — рамка текущей миниатюры."
  },
  {
    "owner": "GrCarousel",
    "name": "--gr-carousel-dot-ring-width",
    "kind": "theme",
    "default": "2px",
    "description": "Толщина обвода вокруг текущей точки. Обвод — второй признак текущего кадра помимо заливки: при диаметре в 8 пикселей одного оттенка мало, и на приглушённом тоне разница почти пропадает."
  },
  {
    "owner": "GrCarousel",
    "name": "--gr-carousel-dot-ring-offset",
    "kind": "theme",
    "default": "2px",
    "description": "Зазор между точкой и её обводом."
  },
  {
    "owner": "GrCarousel",
    "name": "--gr-carousel-dot-size",
    "kind": "hook",
    "default": "0.5rem",
    "description": "Диаметр точки-индикатора.",
    "literal": "Геометрия раскладки индикатора."
  },
  {
    "owner": "GrCarousel",
    "name": "--gr-carousel-thumb-width",
    "kind": "hook",
    "default": "4rem",
    "description": "Ширина миниатюры в полосе.",
    "literal": "Геометрия раскладки миниатюр."
  },
  {
    "owner": "GrCarousel",
    "name": "--gr-carousel-thumb-height",
    "kind": "hook",
    "default": "2.5rem",
    "description": "Высота миниатюры. Пропорцию задаёт потребитель парой с шириной: у галереи товара и у ленты обложек она разная.",
    "literal": "Геометрия раскладки миниатюр."
  },
  {
    "owner": "GrCarousel",
    "name": "--gr-carousel-thumbs-fade",
    "kind": "hook",
    "default": "1.5rem",
    "description": "Ширина затухания у края полосы миниатюр. Она же — отступ прокрутки, иначе фокус-кольцо крайней миниатюры оказывается под затуханием.",
    "literal": "Размер затухания у края прокрутки — механика ленты."
  },
  {
    "owner": "GrCarousel",
    "name": "--gr-carousel-thumbs-mask",
    "kind": "css",
    "default": "не задана, пока полоса влезает целиком",
    "description": "Маска затухания полосы миниатюр. Задаётся собственным CSS компонента по `data-overflow`: у какого края есть продолжение, тот и гаснет."
  },
  {
    "owner": "GrChip",
    "name": "--gr-chip-disabled-bg",
    "kind": "hook",
    "default": "var(--gr-muted)",
    "description": "Заливка выключенного чипа. Гасить прозрачностью нельзя: она разбавляет выверенные на AA токены текста и роняет контраст."
  },
  {
    "owner": "GrChip",
    "name": "--gr-chip-disabled-fg",
    "kind": "hook",
    "default": "var(--gr-disabled-fg)",
    "description": "Текст выключенного чипа."
  },
  {
    "owner": "GrChip",
    "name": "--gr-chip-disabled-brd",
    "kind": "hook",
    "default": "var(--gr-brd)",
    "description": "Рамка выключенного чипа."
  },
  {
    "owner": "GrChip",
    "name": "--gr-chip-neutral-bg",
    "kind": "theme",
    "default": "var(--gr-muted)",
    "description": "Заливка нейтрального чипа."
  },
  {
    "owner": "GrChip",
    "name": "--gr-chip-neutral-fg",
    "kind": "theme",
    "default": "var(--gr-fg)",
    "description": "Текст нейтрального чипа."
  },
  {
    "owner": "GrChip",
    "name": "--gr-chip-neutral-brd",
    "kind": "theme",
    "default": "var(--gr-brd)",
    "description": "Рамка нейтрального чипа."
  },
  {
    "owner": "GrChip",
    "name": "--gr-chip-neutral-hover-bg",
    "kind": "theme",
    "default": "var(--gr-muted)",
    "description": "Заливка нажимаемого нейтрального чипа под указателем."
  },
  {
    "owner": "GrChip",
    "name": "--gr-chip-neutral-hover-brd",
    "kind": "theme",
    "default": "var(--gr-brd)",
    "description": "Рамка нажимаемого нейтрального чипа под указателем."
  },
  {
    "owner": "GrColorPicker",
    "name": "--gr-color-picker-checker-size",
    "kind": "hook",
    "default": "6px",
    "description": "Сторона клетки шахматной подложки под прозрачным цветом.",
    "literal": "Шаг шахматки под прозрачным цветом — механика отрисовки."
  },
  {
    "owner": "GrColorPicker",
    "name": "--gr-color-picker-checker-light",
    "kind": "hook",
    "default": "var(--gr-bg)",
    "description": "Светлая клетка шахматной подложки."
  },
  {
    "owner": "GrColorPicker",
    "name": "--gr-color-picker-checker-dark",
    "kind": "hook",
    "default": "var(--gr-muted)",
    "description": "Тёмная клетка шахматной подложки."
  },
  {
    "owner": "GrColorPicker",
    "name": "--gr-color-picker-track-hue",
    "kind": "inline",
    "default": "радуга по кругу оттенков",
    "description": "Градиент дорожки оттенка. Задаётся компонентом: через `--gr-slider-rail` градиент не подать — хук уходит в `background-color`."
  },
  {
    "owner": "GrColorPicker",
    "name": "--gr-color-picker-track-saturation",
    "kind": "inline",
    "default": "от серого к насыщенному при текущих оттенке и светлоте",
    "description": "Градиент дорожки насыщенности."
  },
  {
    "owner": "GrColorPicker",
    "name": "--gr-color-picker-track-lightness",
    "kind": "inline",
    "default": "от чёрного через текущий цвет к белому",
    "description": "Градиент дорожки светлоты."
  },
  {
    "owner": "GrColorPicker",
    "name": "--gr-color-picker-track-alpha",
    "kind": "inline",
    "default": "от прозрачного к текущему цвету",
    "description": "Градиент дорожки прозрачности."
  },
  {
    "owner": "GrColorPicker",
    "name": "--gr-color-picker-area-thumb-size",
    "kind": "hook",
    "default": "0.875rem",
    "description": "Диаметр ручки на области насыщенность × светлота.",
    "literal": "Геометрия бегунка."
  },
  {
    "owner": "GrColorPicker",
    "name": "--gr-color-picker-area-thumb-border",
    "kind": "theme",
    "default": "#fff",
    "description": "Внешний обвод ручки области. От темы не зависит намеренно: под ручкой лежит выбираемый цвет, а не подложка компонента."
  },
  {
    "owner": "GrColorPicker",
    "name": "--gr-color-picker-area-thumb-ring",
    "kind": "theme",
    "default": "rgba(0, 0, 0, 0.45)",
    "description": "Внутренний обвод ручки области: держит её видимой в светлом углу, где белого внешнего обвода не видно."
  },
  {
    "owner": "GrColorPicker",
    "name": "--gr-color-picker-area-saturation",
    "kind": "inline",
    "default": "none",
    "description": "Заливка области по горизонтали: серый → чистый тон при светлоте 50%. Ставится компонентом при каждом изменении оттенка."
  },
  {
    "owner": "GrColorPicker",
    "name": "--gr-color-picker-trigger-hover-brd",
    "kind": "theme",
    "default": "var(--gr-primary)",
    "description": "Рамка триггера под указателем. Тема, где триггер — такое же поле, как остальные, ставит `--gr-input-hover`."
  },
  {
    "owner": "GrCommandPalette",
    "name": "--gr-command-active-bg",
    "kind": "theme",
    "default": "color-mix(in srgb, var(--gr-muted) 45%, transparent)",
    "description": "Фон активного пункта палитры (наведение и клавиатурный курсор)."
  },
  {
    "owner": "GrCommandPalette",
    "name": "--gr-command-match-bg",
    "kind": "theme",
    "default": "color-mix(in srgb, var(--gr-primary) 22%, transparent)",
    "description": "Подсветка совпавшей подстроки в подписи пункта."
  },
  {
    "owner": "GrCommandPalette",
    "name": "--gr-command-item-radius",
    "kind": "theme",
    "default": "10px",
    "description": "Скругление пункта палитры."
  },
  {
    "owner": "GrCommandPalette",
    "name": "--gr-command-input-font-size",
    "kind": "theme",
    "default": "15px",
    "description": "Кегль строки поиска: крупнее пунктов списка, потому что это единственное поле ввода в оверлее."
  },
  {
    "owner": "GrCommandPalette",
    "name": "--gr-command-list-max-height",
    "kind": "hook",
    "default": "значение пропа `maxHeight` в пикселях",
    "description": "Максимальная высота списка; дальше список скроллится.",
    "literal": "Значение пропа `maxHeight`."
  },
  {
    "owner": "GrCommandPalette",
    "name": "--gr-command-results-min-height",
    "kind": "hook",
    "default": "0px",
    "description": "Резерв высоты области результатов — чтобы окно не схлопывалось между «ищем» и «нашлось». Состояние «Ничего не найдено» и загрузка встают по центру резерва.",
    "literal": "Нейтральное значение: без минимума."
  },
  {
    "owner": "GrCommandPalette",
    "name": "--gr-command-group-label-transform",
    "kind": "theme",
    "default": "uppercase",
    "description": "Регистр заголовка группы: `uppercase` или `none`."
  },
  {
    "owner": "GrCommandPalette",
    "name": "--gr-command-group-label-tracking",
    "kind": "theme",
    "default": "0.025em",
    "description": "Разрядка заголовка группы. Капсу она нужна, строчным — нет."
  },
  {
    "owner": "GrCommandPalette",
    "name": "--gr-command-match-weight",
    "kind": "theme",
    "default": "var(--gr-font-regular)",
    "description": "Вес совпавшей с запросом части. Тема без подложки совпадения выделяет его весом."
  },
  {
    "owner": "GrCommandPalette",
    "name": "--gr-command-footer-bg",
    "kind": "theme",
    "default": "transparent",
    "description": "Заливка подвала с подсказками клавиш."
  },
  {
    "owner": "GrDataTable",
    "name": "--gr-datatable-drag-handle",
    "kind": "hook",
    "default": "var(--gr-muted-fg)",
    "description": "Цвет ручки перестановки колонки."
  },
  {
    "owner": "GrDataTable",
    "name": "--gr-datatable-drag-indicator",
    "kind": "hook",
    "default": "var(--gr-primary)",
    "description": "Цвет полосы, показывающей место вставки колонки."
  },
  {
    "owner": "GrDataTable",
    "name": "--gr-datatable-drag-indicator-width",
    "kind": "theme",
    "default": "2px",
    "description": "Толщина полосы места вставки колонки."
  },
  {
    "owner": "GrDataTable",
    "name": "--gr-datatable-resizer",
    "kind": "hook",
    "default": "var(--gr-primary)",
    "description": "Цвет полосы изменения ширины колонки."
  },
  {
    "owner": "GrDataTable",
    "name": "--gr-datatable-resizer-width",
    "kind": "hook",
    "default": "2px",
    "description": "Толщина полосы изменения ширины колонки.",
    "literal": "Зона захвата ручки ширины — механика взаимодействия."
  },
  {
    "owner": "GrDataTable",
    "name": "--gr-datatable-pinned-shadow",
    "kind": "theme",
    "default": "4px 0 6px -4px rgba(0, 0, 0, 0.25)",
    "description": "Тень на границе группы колонок, закреплённых слева."
  },
  {
    "owner": "GrDataTable",
    "name": "--gr-datatable-pinned-shadow-end",
    "kind": "theme",
    "default": "-4px 0 6px -4px rgba(0, 0, 0, 0.25)",
    "description": "Тень на границе группы колонок, закреплённых справа."
  },
  {
    "owner": "GrDataTable",
    "name": "--gr-datatable-detail-bg",
    "kind": "theme",
    "default": "color-mix(in srgb, var(--gr-muted) 45%, transparent)",
    "description": "Фон строки с подробностями. Мягче строки набора: второй ярус читается как вложенное, а не как следующая строка."
  },
  {
    "owner": "GrDataTable",
    "name": "--gr-datatable-detail-accent",
    "kind": "theme",
    "default": "var(--gr-primary)",
    "description": "Полоса слева у строки подробностей. Связывает её со своей строкой, когда между ними прокрутили."
  },
  {
    "owner": "GrDataTable",
    "name": "--gr-datatable-head-weight",
    "kind": "theme",
    "default": "var(--gr-font-bold)",
    "description": "Вес подписи колонки в шапке."
  },
  {
    "owner": "GrDataTable",
    "name": "--gr-datatable-first-row-brd",
    "kind": "theme",
    "default": "var(--gr-brd)",
    "description": "Рамка над первой строкой — граница с шапкой. Тема с линией шапки (`--gr-table-head-line`) ставит `transparent`, иначе граница двоится."
  },
  {
    "owner": "GrDelta",
    "name": "--gr-delta-arrow-size",
    "kind": "hook",
    "default": "0.875em",
    "description": "Сторона стрелки направления. Доля от кегля величины, а не ступень шкалы: на ступени md у дельты своего кегля нет — она набирается кеглем строки, в которой стоит, и пиксельный размер оставил бы стрелку мелкой внутри заголовка.",
    "literal": "Размер стрелки относительно кегля величины."
  },
  {
    "owner": "GrDelta",
    "name": "--gr-delta-arrow-gap",
    "kind": "hook",
    "default": "0.125rem",
    "description": "Отбивка стрелки от величины. Логическая: в RTL встаёт с нужной стороны.",
    "literal": "Геометрия раскладки стрелки."
  },
  {
    "owner": "GrDelta",
    "name": "--gr-delta-suffix-color",
    "kind": "hook",
    "default": "currentColor",
    "description": "Цвет приписки после величины. У дельты она приглушения не получает: «−15 %» набирается цветом строки целиком, иначе процент читается подписью. Токен возвращает приглушение тому, кому оно нужно — переопределение GrValue ссылается на него, а не задаёт цвет инлайном.",
    "literal": "Нейтральное значение: цвет величины."
  },
  {
    "owner": "GrDelta",
    "name": "--gr-delta-suffix-size",
    "kind": "hook",
    "default": "1em",
    "description": "Кегль приписки после величины. По умолчанию равен кеглю самой величины: уменьшённый процент оказался бы мельче окружающих слов.",
    "literal": "Нейтральное значение: кегль величины."
  },
  {
    "owner": "GrDescriptionList",
    "name": "--gr-description-list-column-min",
    "kind": "hook",
    "default": "12rem",
    "description": "Минимальная ширина колонки. Ниже неё сетка отдаёт колонку целиком, а не делит её: в тесной колонке значение переносится посимвольно, и число «30» читается как «3» и «0». Порог считается от ширины контейнера, а не вьюпорта.",
    "literal": "Геометрия раскладки колонок."
  },
  {
    "owner": "GrDescriptionList",
    "name": "--gr-description-list-value-min",
    "kind": "hook",
    "default": "5rem",
    "description": "Сколько места остаётся значению рядом с подписью при `inline`. Складывается с `labelWidth` в минимальную ширину колонки: колонка шириной с одну подпись выжимает значение в букву на строку.",
    "literal": "Геометрия раскладки колонок."
  },
  {
    "owner": "GrDescriptionList",
    "name": "--gr-description-list-label-color",
    "kind": "hook",
    "default": "var(--gr-muted-fg)",
    "description": "Цвет подписи (`<dt>`). Тон задаётся только значению, поэтому подпись перекрашивается отдельно."
  },
  {
    "owner": "GrDescriptionList",
    "name": "--gr-description-list-row-gap",
    "kind": "hook",
    "default": "var(--gr-description-list-row-space) (`density=\"compact\"` — 0.125rem)",
    "description": "Зазор между парами. Не ступень общей шкалы: плотность списка характеристик настраивается отдельно от отступов раскладки.",
    "literal": "Шаг по плотности (`density`) из карты компонента."
  },
  {
    "owner": "GrDescriptionList",
    "name": "--gr-description-list-divider",
    "kind": "hook",
    "default": "var(--gr-brd)",
    "description": "Цвет линии между парами при `divided`."
  },
  {
    "owner": "GrDescriptionList",
    "name": "--gr-description-list-row-space",
    "kind": "theme",
    "default": "0.375rem",
    "description": "Расстояние между строками списка в теме. Хук `--gr-description-list-row-gap` сильнее."
  },
  {
    "owner": "GrDescriptionList",
    "name": "--gr-description-list-divided-space",
    "kind": "theme",
    "default": "0.25rem",
    "description": "Отступ строки от разделительной линии при `divided`."
  },
  {
    "owner": "GrDialog",
    "name": "--gr-dialog-title-size",
    "kind": "theme",
    "default": "var(--gr-control-text-md)",
    "description": "Кегль заголовка окна в шапке `GrDialogHeader`."
  },
  {
    "owner": "GrDialog",
    "name": "--gr-dialog-title-leading",
    "kind": "theme",
    "default": "var(--gr-control-leading-md)",
    "description": "Интерлиньяж заголовка окна."
  },
  {
    "owner": "GrDialog",
    "name": "--gr-dialog-title-weight",
    "kind": "theme",
    "default": "var(--gr-font-bold)",
    "description": "Вес заголовка окна."
  },
  {
    "owner": "GrDialog",
    "name": "--gr-dialog-divider",
    "kind": "theme",
    "default": "var(--gr-brd)",
    "description": "Линия под шапкой и над подвалом окна (`bordered`). Тема, где окно держится полями, а не линиями, ставит `transparent`: место под линию остаётся, раскладка не прыгает."
  },
  {
    "owner": "GrDivider",
    "name": "--gr-divider-thickness",
    "kind": "theme",
    "default": "1px",
    "description": "Толщина разделителя — общая для горизонтального и вертикального."
  },
  {
    "owner": "GrDrawer",
    "name": "--gr-drawer-title-size",
    "kind": "theme",
    "default": "var(--gr-text-sm)",
    "description": "Кегль заголовка шторки."
  },
  {
    "owner": "GrDrawer",
    "name": "--gr-drawer-title-leading",
    "kind": "theme",
    "default": "var(--gr-leading-sm)",
    "description": "Интерлиньяж заголовка шторки."
  },
  {
    "owner": "GrDrawer",
    "name": "--gr-drawer-title-weight",
    "kind": "theme",
    "default": "var(--gr-font-bold)",
    "description": "Вес заголовка шторки."
  },
  {
    "owner": "GrDrawer",
    "name": "--gr-drawer-shadow",
    "kind": "theme",
    "default": "var(--gr-shadow-2)",
    "description": "Тень шторки."
  },
  {
    "owner": "GrDrawer",
    "name": "--gr-drawer-radius",
    "kind": "theme",
    "default": "var(--gr-radius-none)",
    "description": "Скругление внутреннего края шторки — того, что смотрит в страницу."
  },
  {
    "owner": "GrDropdownMenu",
    "name": "--gr-dropdown-menu-item-height",
    "kind": "theme",
    "default": "2.5rem",
    "description": "Минимальная высота пункта меню."
  },
  {
    "owner": "GrDropdownMenu",
    "name": "--gr-dropdown-menu-item-px",
    "kind": "theme",
    "default": "1rem",
    "description": "Поле пункта по горизонтали."
  },
  {
    "owner": "GrDropdownMenu",
    "name": "--gr-dropdown-menu-item-py",
    "kind": "theme",
    "default": "0.625rem",
    "description": "Поле пункта по вертикали. Вместе с интерлиньяжем не должно превышать высоту пункта, иначе пункт вырастет."
  },
  {
    "owner": "GrDropdownMenu",
    "name": "--gr-dropdown-menu-item-hover-bg",
    "kind": "theme",
    "default": "var(--gr-accent)",
    "description": "Подсветка пункта под указателем и раскрытого пункта-подменю."
  },
  {
    "owner": "GrDropdownMenu",
    "name": "--gr-dropdown-menu-item-hover-fg",
    "kind": "theme",
    "default": "var(--gr-accent-fg)",
    "description": "Текст подсвеченного пункта."
  },
  {
    "owner": "GrDropdownMenu",
    "name": "--gr-dropdown-menu-item-danger-hover-bg",
    "kind": "theme",
    "default": "var(--gr-accent)",
    "description": "Подсветка опасного пункта под указателем."
  },
  {
    "owner": "GrDropdownMenu",
    "name": "--gr-dropdown-menu-item-danger-hover-fg",
    "kind": "theme",
    "default": "var(--gr-accent-fg)",
    "description": "Текст подсвеченного опасного пункта."
  },
  {
    "owner": "GrDropdownMenu",
    "name": "--gr-dropdown-menu-item-disabled-bg",
    "kind": "theme",
    "default": "var(--gr-muted)",
    "description": "Заливка недоступного пункта."
  },
  {
    "owner": "GrDropdownMenu",
    "name": "--gr-dropdown-menu-item-disabled-fg",
    "kind": "theme",
    "default": "var(--gr-muted-fg)",
    "description": "Текст недоступного пункта."
  },
  {
    "owner": "GrEmptyState",
    "name": "--gr-empty-state-title-size-xs",
    "kind": "theme",
    "default": "var(--gr-text-xs)",
    "description": "Кегль заголовка пустого состояния на ступени `xs`."
  },
  {
    "owner": "GrEmptyState",
    "name": "--gr-empty-state-title-leading-xs",
    "kind": "theme",
    "default": "var(--gr-leading-xs)",
    "description": "Интерлиньяж заголовка пустого состояния на ступени `xs`."
  },
  {
    "owner": "GrEmptyState",
    "name": "--gr-empty-state-title-size-sm",
    "kind": "theme",
    "default": "var(--gr-text-sm)",
    "description": "Кегль заголовка пустого состояния на ступени `sm`."
  },
  {
    "owner": "GrEmptyState",
    "name": "--gr-empty-state-title-leading-sm",
    "kind": "theme",
    "default": "var(--gr-leading-sm)",
    "description": "Интерлиньяж заголовка пустого состояния на ступени `sm`."
  },
  {
    "owner": "GrEmptyState",
    "name": "--gr-empty-state-title-size-md",
    "kind": "theme",
    "default": "var(--gr-text-sm)",
    "description": "Кегль заголовка пустого состояния на ступени `md`."
  },
  {
    "owner": "GrEmptyState",
    "name": "--gr-empty-state-title-leading-md",
    "kind": "theme",
    "default": "var(--gr-leading-sm)",
    "description": "Интерлиньяж заголовка пустого состояния на ступени `md`."
  },
  {
    "owner": "GrEmptyState",
    "name": "--gr-empty-state-title-size-lg",
    "kind": "theme",
    "default": "var(--gr-text-base)",
    "description": "Кегль заголовка пустого состояния на ступени `lg`."
  },
  {
    "owner": "GrEmptyState",
    "name": "--gr-empty-state-title-leading-lg",
    "kind": "theme",
    "default": "var(--gr-leading-base)",
    "description": "Интерлиньяж заголовка пустого состояния на ступени `lg`."
  },
  {
    "owner": "GrEmptyState",
    "name": "--gr-empty-state-title-weight",
    "kind": "theme",
    "default": "var(--gr-font-bold)",
    "description": "Вес заголовка пустого состояния."
  },
  {
    "owner": "GrEmptyState",
    "name": "--gr-empty-state-icon-brd",
    "kind": "theme",
    "default": "var(--gr-brd)",
    "description": "Рамка плашки значка пустого состояния."
  },
  {
    "owner": "GrEmptyState",
    "name": "--gr-empty-state-icon-fg",
    "kind": "theme",
    "default": "var(--gr-muted-fg)",
    "description": "Цвет значка пустого состояния."
  },
  {
    "owner": "GrEmptyState",
    "name": "--gr-empty-state-icon-radius-xs",
    "kind": "theme",
    "default": "var(--gr-radius-md)",
    "description": "Скругление плашки значка на ступени `xs`. Круг — `var(--gr-radius-full)`."
  },
  {
    "owner": "GrEmptyState",
    "name": "--gr-empty-state-icon-radius-sm",
    "kind": "theme",
    "default": "var(--gr-radius-md)",
    "description": "Скругление плашки значка на ступени `sm`. Круг — `var(--gr-radius-full)`."
  },
  {
    "owner": "GrEmptyState",
    "name": "--gr-empty-state-icon-radius-md",
    "kind": "theme",
    "default": "var(--gr-radius-lg)",
    "description": "Скругление плашки значка на ступени `md`. Круг — `var(--gr-radius-full)`."
  },
  {
    "owner": "GrEmptyState",
    "name": "--gr-empty-state-icon-radius-lg",
    "kind": "theme",
    "default": "var(--gr-radius-lg)",
    "description": "Скругление плашки значка на ступени `lg`. Круг — `var(--gr-radius-full)`."
  },
  {
    "owner": "GrFilePreview",
    "name": "--gr-file-preview-bg",
    "kind": "hook",
    "default": "var(--gr-muted)",
    "description": "Фон плитки. Виден у заглушки целиком, а у картинки — по краям при несовпадении пропорций; на время загрузки место занимает скелет."
  },
  {
    "owner": "GrFilePreview",
    "name": "--gr-file-preview-icon",
    "kind": "hook",
    "default": "var(--gr-muted-fg)",
    "description": "Цвет иконки вида файла и подписи под ней."
  },
  {
    "owner": "GrFilePreview",
    "name": "--gr-file-preview-radius",
    "kind": "hook",
    "default": "var(--gr-radius-md)",
    "description": "Скругление плитки. Отдельный хук, а не ступень общей шкалы: плитка в ленте документов и плитка в строке списка скругляются по-разному."
  },
  {
    "owner": "GrFileUpload",
    "name": "--gr-file-upload-zone-bg",
    "kind": "theme",
    "default": "var(--gr-card)",
    "description": "Заливка зоны сброса."
  },
  {
    "owner": "GrFileUpload",
    "name": "--gr-file-upload-zone-brd",
    "kind": "theme",
    "default": "var(--gr-brd)",
    "description": "Пунктир зоны сброса."
  },
  {
    "owner": "GrFileUpload",
    "name": "--gr-file-upload-zone-hover-bg",
    "kind": "theme",
    "default": "var(--gr-muted)",
    "description": "Заливка зоны под указателем."
  },
  {
    "owner": "GrFileUpload",
    "name": "--gr-file-upload-zone-over-bg",
    "kind": "theme",
    "default": "var(--gr-muted)",
    "description": "Заливка зоны, когда над ней файл."
  },
  {
    "owner": "GrFileUpload",
    "name": "--gr-file-upload-zone-over-brd",
    "kind": "theme",
    "default": "var(--gr-ring)",
    "description": "Рамка зоны, когда над ней файл."
  },
  {
    "owner": "GrFileUpload",
    "name": "--gr-file-upload-icon-brd",
    "kind": "theme",
    "default": "var(--gr-brd)",
    "description": "Рамка плитки значка в зоне."
  },
  {
    "owner": "GrFileUpload",
    "name": "--gr-file-upload-icon-fg",
    "kind": "theme",
    "default": "var(--gr-muted-fg)",
    "description": "Цвет значка в зоне."
  },
  {
    "owner": "GrFileUpload",
    "name": "--gr-file-upload-icon-radius-xs",
    "kind": "theme",
    "default": "var(--gr-radius-md)",
    "description": "Скругление плитки значка на ступени `xs`. Круг — `var(--gr-radius-full)`."
  },
  {
    "owner": "GrFileUpload",
    "name": "--gr-file-upload-icon-radius-sm",
    "kind": "theme",
    "default": "var(--gr-radius-md)",
    "description": "Скругление плитки значка на ступени `sm`. Круг — `var(--gr-radius-full)`."
  },
  {
    "owner": "GrFileUpload",
    "name": "--gr-file-upload-icon-radius-md",
    "kind": "theme",
    "default": "var(--gr-radius-lg)",
    "description": "Скругление плитки значка на ступени `md`. Круг — `var(--gr-radius-full)`."
  },
  {
    "owner": "GrFileUpload",
    "name": "--gr-file-upload-icon-radius-lg",
    "kind": "theme",
    "default": "var(--gr-radius-lg)",
    "description": "Скругление плитки значка на ступени `lg`. Круг — `var(--gr-radius-full)`."
  },
  {
    "owner": "GrFileUpload",
    "name": "--gr-file-upload-list-gap",
    "kind": "theme",
    "default": "0.25rem",
    "description": "Зазор между строками выбранных файлов."
  },
  {
    "owner": "GrFileUpload",
    "name": "--gr-file-upload-item-bg",
    "kind": "theme",
    "default": "transparent",
    "description": "Подложка строки файла. Тема, где файл — плашка, ставит поверхность карточки."
  },
  {
    "owner": "GrFileUpload",
    "name": "--gr-file-upload-item-brd",
    "kind": "theme",
    "default": "transparent",
    "description": "Контур строки файла. Рисуется тенью внутрь: строка не меняет размер."
  },
  {
    "owner": "GrFileUpload",
    "name": "--gr-file-upload-item-radius",
    "kind": "theme",
    "default": "0px",
    "description": "Скругление строки файла."
  },
  {
    "owner": "GrFileUpload",
    "name": "--gr-file-upload-item-padding",
    "kind": "theme",
    "default": "0px",
    "description": "Поле строки файла."
  },
  {
    "owner": "GrFormField",
    "name": "--gr-form-field-label-fg",
    "kind": "theme",
    "default": "var(--gr-muted-fg)",
    "description": "Цвет подписи поля."
  },
  {
    "owner": "GrFormField",
    "name": "--gr-form-field-label-weight",
    "kind": "theme",
    "default": "var(--gr-font-regular)",
    "description": "Вес подписи поля."
  },
  {
    "owner": "GrFormField",
    "name": "--gr-form-field-required-fg",
    "kind": "theme",
    "default": "var(--gr-invalid-text)",
    "description": "Цвет звёздочки обязательного поля. Тема, где звёздочка — пометка, а не тревога, ставит приглушённый цвет."
  },
  {
    "owner": "GrIcon",
    "name": "--gr-icon-size",
    "kind": "css",
    "default": "var(--gr-icon-size-md, 18px)",
    "description": "Итоговый размер иконки. И обёртка, и вложенный SVG считают себя от него, поэтому размер задаётся одной переменной, а не пропами разметки."
  },
  {
    "owner": "GrImageViewer",
    "name": "--gr-image-viewer-scrim",
    "kind": "theme",
    "default": "rgb(0 0 0 / 0.6)",
    "description": "Затемнение под кадром. Плотнее общего `--gr-overlay-bg`: рядом с фотографией подложка обязана убрать фон целиком, а не приглушить его."
  },
  {
    "owner": "GrImageViewer",
    "name": "--gr-image-viewer-chrome-bg",
    "kind": "theme",
    "default": "rgb(0 0 0 / 0.35)",
    "description": "Фон панелей управления просмотрщика."
  },
  {
    "owner": "GrImageViewer",
    "name": "--gr-image-viewer-chrome-bg-hover",
    "kind": "theme",
    "default": "rgb(0 0 0 / 0.55)",
    "description": "Фон кнопки хрома под курсором."
  },
  {
    "owner": "GrImageViewer",
    "name": "--gr-image-viewer-chrome-bg-soft",
    "kind": "theme",
    "default": "rgb(255 255 255 / 0.1)",
    "description": "Мягкая подложка внутри хрома — счётчик кадров, шкала масштаба."
  },
  {
    "owner": "GrImageViewer",
    "name": "--gr-image-viewer-chrome-fg",
    "kind": "theme",
    "default": "rgb(255 255 255 / 0.95)",
    "description": "Основной цвет текста и иконок хрома."
  },
  {
    "owner": "GrImageViewer",
    "name": "--gr-image-viewer-chrome-fg-muted",
    "kind": "theme",
    "default": "rgb(255 255 255 / 0.8)",
    "description": "Приглушённый текст хрома — подписи и вторичные значения."
  },
  {
    "owner": "GrImageViewer",
    "name": "--gr-image-viewer-chrome-brd",
    "kind": "theme",
    "default": "rgb(255 255 255 / 0.2)",
    "description": "Цвет рамок внутри хрома."
  },
  {
    "owner": "GrImageViewer",
    "name": "--gr-image-viewer-ring",
    "kind": "theme",
    "default": "rgb(255 255 255 / 0.8)",
    "description": "Focus-ring внутри просмотрщика: общий `--gr-ring` на тёмном хроме не читается."
  },
  {
    "owner": "GrJsonViewer",
    "name": "--gr-json-viewer-bg",
    "kind": "hook",
    "default": "var(--gr-muted)",
    "description": "Фон панели просмотрщика."
  },
  {
    "owner": "GrJsonViewer",
    "name": "--gr-json-viewer-key",
    "kind": "hook",
    "default": "var(--gr-primary-text)",
    "description": "Цвет имени ключа. Ключ и значение стоят в одной строке через двоеточие, и цвет — единственное, чем они различимы глазом."
  },
  {
    "owner": "GrJsonViewer",
    "name": "--gr-json-viewer-string",
    "kind": "hook",
    "default": "var(--gr-success-text)",
    "description": "Цвет строкового значения."
  },
  {
    "owner": "GrJsonViewer",
    "name": "--gr-json-viewer-number",
    "kind": "hook",
    "default": "var(--gr-azure-text)",
    "description": "Цвет числа. Взят от `azure`, а не от `info`: `info` — синий в двух шагах от индиго `primary`, и пара «ключ ↔ число» сливалась бы в одной строке."
  },
  {
    "owner": "GrJsonViewer",
    "name": "--gr-json-viewer-literal",
    "kind": "hook",
    "default": "var(--gr-warning-text)",
    "description": "Цвет литералов `true`, `false`, `null`."
  },
  {
    "owner": "GrJsonViewer",
    "name": "--gr-json-viewer-punctuation",
    "kind": "hook",
    "default": "var(--gr-fg)",
    "description": "Цвет двоеточия между ключом и значением."
  },
  {
    "owner": "GrJsonViewer",
    "name": "--gr-json-viewer-muted",
    "kind": "hook",
    "default": "var(--gr-muted-fg)",
    "description": "Цвет служебного: счётчика у свёрнутой ветки, заглушки «ещё N элементов», значений, которых в JSON не бывает."
  },
  {
    "owner": "GrLink",
    "name": "--gr-link-color",
    "kind": "inline",
    "default": "`-text`-роль выбранного тона",
    "description": "Цвет ссылки в покое."
  },
  {
    "owner": "GrLink",
    "name": "--gr-link-color-hover",
    "kind": "inline",
    "default": "подмес `--gr-fg` 8% к базовому цвету",
    "description": "Цвет ссылки под курсором."
  },
  {
    "owner": "GrLink",
    "name": "--gr-link-color-active",
    "kind": "inline",
    "default": "подмес `--gr-fg` 16% к базовому цвету",
    "description": "Цвет ссылки в момент нажатия."
  },
  {
    "owner": "GrLoading",
    "name": "--gr-loading-panel-bg",
    "kind": "theme",
    "default": "var(--gr-card)",
    "description": "Заливка панели с индикатором. Непрозрачная: подпись лежит поверх произвольного содержимого, и полупрозрачная панель не держала бы контраст текста."
  },
  {
    "owner": "GrLoading",
    "name": "--gr-loading-panel-radius",
    "kind": "theme",
    "default": "var(--gr-radius-md)",
    "description": "Скругление панели с индикатором."
  },
  {
    "owner": "GrLoading",
    "name": "--gr-loading-panel-shadow",
    "kind": "theme",
    "default": "var(--gr-shadow-2)",
    "description": "Тень панели с индикатором."
  },
  {
    "owner": "GrModal",
    "name": "--gr-modal-shadow",
    "kind": "theme",
    "default": "var(--gr-shadow-2)",
    "description": "Тень окна."
  },
  {
    "owner": "GrModal",
    "name": "--gr-modal-width-sm",
    "kind": "theme",
    "default": "420px",
    "description": "Наибольшая ширина окна размера `sm`."
  },
  {
    "owner": "GrModal",
    "name": "--gr-modal-width-md",
    "kind": "theme",
    "default": "560px",
    "description": "Наибольшая ширина окна размера `md`."
  },
  {
    "owner": "GrModal",
    "name": "--gr-modal-width-lg",
    "kind": "theme",
    "default": "720px",
    "description": "Наибольшая ширина окна размера `lg`."
  },
  {
    "owner": "GrModal",
    "name": "--gr-modal-width-xl",
    "kind": "theme",
    "default": "920px",
    "description": "Наибольшая ширина окна размера `xl`."
  },
  {
    "owner": "GrNavbar",
    "name": "--gr-navbar-height",
    "kind": "hook",
    "default": "56px",
    "description": "Высота шапки. Ею же считается отступ содержимого под прилипшей шапкой.",
    "literal": "Геометрия раскладки панели."
  },
  {
    "owner": "GrOtpInput",
    "name": "--gr-otp-input-cell-size",
    "kind": "hook",
    "default": "1.75rem / 2rem / 2.5rem / 2.75rem по ступеням xs…lg",
    "description": "Сторона ячейки. Повторяет высоту GrInput на той же ступени: код стоит в форме рядом с полями и обязан садиться с ними в одну линию. Через хук — квадратная ячейка это решение оформления, и макет вправе сделать её шире.",
    "literal": "Сторона ячейки по ступени `size` из карты компонента."
  },
  {
    "owner": "GrOtpInput",
    "name": "--gr-otp-input-active-brd",
    "kind": "hook",
    "default": "var(--gr-otp-input-focus-brd)",
    "description": "Цвет рамки активной ячейки — той, в которой стоит каретка."
  },
  {
    "owner": "GrOtpInput",
    "name": "--gr-otp-input-caret",
    "kind": "hook",
    "default": "var(--gr-otp-input-caret-color)",
    "description": "Цвет каретки. Она рисуется своей: настоящая скрыта вместе с текстом поля."
  },
  {
    "owner": "GrOtpInput",
    "name": "--gr-otp-input-focus-brd",
    "kind": "theme",
    "default": "var(--gr-primary)",
    "description": "Рамка ячейки, в которую идёт ввод, в теме. Хук `--gr-otp-input-active-brd` сильнее."
  },
  {
    "owner": "GrOtpInput",
    "name": "--gr-otp-input-caret-color",
    "kind": "theme",
    "default": "var(--gr-primary)",
    "description": "Цвет каретки в теме. Хук `--gr-otp-input-caret` сильнее."
  },
  {
    "owner": "GrPagination",
    "name": "--gr-pagination-page-fg",
    "kind": "theme",
    "default": "var(--gr-muted-fg)",
    "description": "Номер невыбранной страницы."
  },
  {
    "owner": "GrPagination",
    "name": "--gr-pagination-page-hover-bg",
    "kind": "theme",
    "default": "var(--gr-accent)",
    "description": "Подложка номера под указателем — в паре с подсветкой ghost-кнопок «назад/вперёд»."
  },
  {
    "owner": "GrPagination",
    "name": "--gr-pagination-page-hover-fg",
    "kind": "theme",
    "default": "var(--gr-accent-fg)",
    "description": "Номер под указателем."
  },
  {
    "owner": "GrPagination",
    "name": "--gr-pagination-page-weight",
    "kind": "theme",
    "default": "var(--gr-font-semibold)",
    "description": "Вес номеров страниц."
  },
  {
    "owner": "GrPopover",
    "name": "--gr-popover-max-width",
    "kind": "hook",
    "default": "22rem",
    "description": "Потолок ширины панели. Содержимое шире прозы — тулбар, палитра, сетка — снимает потолок значением `100vw`. Шире вьюпорта панель не станет и тогда: этот предел — второй операнд `min()` и снаружи не отключается.",
    "literal": "Геометрия раскладки панели."
  },
  {
    "owner": "GrPopover",
    "name": "--gr-popover-max-height",
    "kind": "hook",
    "default": "100vh",
    "description": "Потолок высоты панели. По умолчанию мнения нет — высоту диктует место, оставшееся до края вьюпорта (замер слоя `--gr-floating-available-height`). Значение задают, когда панель обязана быть ниже доступного места; выше него она не станет и тогда.",
    "literal": "Граница по высоте окна — механика позиционирования."
  },
  {
    "owner": "GrProgressBar",
    "name": "--gr-progress-bg",
    "kind": "theme",
    "default": "var(--gr-primary)",
    "description": "Заливка полосы прогресса по умолчанию."
  },
  {
    "owner": "GrProgressBar",
    "name": "--gr-progress-neutral-bg",
    "kind": "theme",
    "default": "var(--gr-muted-fg)",
    "description": "Заливка полосы тона `neutral`."
  },
  {
    "owner": "GrProgressBar",
    "name": "--gr-progress-success-bg",
    "kind": "theme",
    "default": "var(--gr-success)",
    "description": "Заливка полосы тона `success`."
  },
  {
    "owner": "GrProgressBar",
    "name": "--gr-progress-warning-bg",
    "kind": "theme",
    "default": "var(--gr-warning)",
    "description": "Заливка полосы тона `warning`."
  },
  {
    "owner": "GrProgressBar",
    "name": "--gr-progress-danger-bg",
    "kind": "theme",
    "default": "var(--gr-danger)",
    "description": "Заливка полосы тона `danger`."
  },
  {
    "owner": "GrProgressBar",
    "name": "--gr-progress-info-bg",
    "kind": "theme",
    "default": "var(--gr-info)",
    "description": "Заливка полосы тона `info`."
  },
  {
    "owner": "GrProgressBar",
    "name": "--gr-progress-slate-bg",
    "kind": "theme",
    "default": "var(--gr-slate)",
    "description": "Заливка полосы тона `slate`."
  },
  {
    "owner": "GrProgressBar",
    "name": "--gr-progress-azure-bg",
    "kind": "theme",
    "default": "var(--gr-azure)",
    "description": "Заливка полосы тона `azure`."
  },
  {
    "owner": "GrProgressBar",
    "name": "--gr-progress-buffer-bg",
    "kind": "theme",
    "default": "color-mix(in srgb, var(--gr-muted-fg) 40%, var(--gr-muted))",
    "description": "Слой буфера позади заливки. Тон не наследует: нейтральный слой между треком и заливкой читается у всех восьми тонов."
  },
  {
    "owner": "GrProgressBar",
    "name": "--gr-progress-indeterminate-bg",
    "kind": "theme",
    "default": "var(--gr-muted-fg)",
    "description": "Заливка неопределённого режима под `prefers-reduced-motion: reduce`, когда бегущая полоса остановлена."
  },
  {
    "owner": "GrProgressBar",
    "name": "--gr-progress-indeterminate-duration",
    "kind": "theme",
    "default": "1.4s",
    "description": "Период пробега полосы в неопределённом режиме."
  },
  {
    "owner": "GrProgressBar",
    "name": "--gr-progress-track-bg",
    "kind": "theme",
    "default": "var(--gr-muted)",
    "description": "Заливка дорожки."
  },
  {
    "owner": "GrProgressBar",
    "name": "--gr-progress-height-xs",
    "kind": "theme",
    "default": "0.25rem",
    "description": "Толщина полосы на ступени `xs`."
  },
  {
    "owner": "GrProgressBar",
    "name": "--gr-progress-height-sm",
    "kind": "theme",
    "default": "0.375rem",
    "description": "Толщина полосы на ступени `sm`."
  },
  {
    "owner": "GrProgressBar",
    "name": "--gr-progress-height-md",
    "kind": "theme",
    "default": "0.5rem",
    "description": "Толщина полосы на ступени `md`."
  },
  {
    "owner": "GrProgressBar",
    "name": "--gr-progress-height-lg",
    "kind": "theme",
    "default": "0.75rem",
    "description": "Толщина полосы на ступени `lg`."
  },
  {
    "owner": "GrProgressCircle",
    "name": "--gr-progress-circle-size",
    "kind": "hook",
    "default": "2rem / 3rem / 4rem / 6rem по ступеням `xs…lg`",
    "description": "Диаметр кольца. Геометрия дуги считается в единицах `viewBox`, поэтому масштаб можно менять свободно.",
    "literal": "Диаметр по ступени `size` из карты компонента."
  },
  {
    "owner": "GrProgressCircle",
    "name": "--gr-progress-circle-track",
    "kind": "hook",
    "default": "var(--gr-progress-circle-track-bg)",
    "description": "Цвет дорожки — непройденной части кольца."
  },
  {
    "owner": "GrProgressCircle",
    "name": "--gr-progress-circle-cap",
    "kind": "theme",
    "default": "round",
    "description": "Торец дуги значения: `round` или `butt` для строгой шкалы."
  },
  {
    "owner": "GrProgressCircle",
    "name": "--gr-progress-circle-value-size",
    "kind": "hook",
    "default": "кегль по ступени `size`",
    "description": "Кегль содержимого в центре кольца: свой формат значения может не влезть в дефолтный.",
    "literal": "Кегль по ступени `size` из карты компонента."
  },
  {
    "owner": "GrProgressCircle",
    "name": "--gr-progress-circle-track-bg",
    "kind": "theme",
    "default": "var(--gr-muted)",
    "description": "Цвет дорожки кольца в теме. Хук `--gr-progress-circle-track` сильнее."
  },
  {
    "owner": "GrRadio",
    "name": "--gr-radio-checked-bg",
    "kind": "theme",
    "default": "color-mix(in srgb, var(--gr-selected) 10%, var(--gr-bg))",
    "description": "Заливка кружка выбранного радио. Рамка у выбранного — всегда `--gr-selected`; заливка решает, контур это с точкой или сплошной кружок."
  },
  {
    "owner": "GrRadio",
    "name": "--gr-radio-checked-hover-bg",
    "kind": "theme",
    "default": "color-mix(in srgb, var(--gr-selected) 10%, var(--gr-bg))",
    "description": "Заливка кружка выбранного радио под указателем. У контурного радио совпадает с `--gr-radio-checked-bg`."
  },
  {
    "owner": "GrRadio",
    "name": "--gr-radio-dot",
    "kind": "theme",
    "default": "var(--gr-selected)",
    "description": "Точка выбранного радио. На сплошной заливке `--gr-selected` тема ставит сюда `--gr-selected-fg`, иначе точка сольётся с кружком."
  },
  {
    "owner": "GrRating",
    "name": "--gr-rating-color",
    "kind": "hook",
    "default": "насыщенный тон (`--gr-<tone>`)",
    "description": "Цвет заполненного символа. Перекрывает тон точечно, не трогая остальные компоненты."
  },
  {
    "owner": "GrRating",
    "name": "--gr-rating-void-color",
    "kind": "theme",
    "default": "color-mix(in srgb, var(--gr-muted-fg) 35%, transparent)",
    "description": "Цвет незаполненного символа: шкала обязана читаться целиком, а не только заполненной частью."
  },
  {
    "owner": "GrRating",
    "name": "--gr-rating-symbol-size",
    "kind": "hook",
    "default": "0.875rem / 1rem / 1.25rem / 1.5rem по ступеням `xs…lg`",
    "description": "Размер символа шкалы.",
    "literal": "Размер символа по ступени `size` из карты компонента."
  },
  {
    "owner": "GrRating",
    "name": "--gr-rating-font-size-lg",
    "kind": "hook",
    "default": "15px",
    "description": "Кегль подписи на ступени `lg`: между `md` и `lg` шкалы контролов.",
    "literal": "Кегль ступени `lg` из карты компонента."
  },
  {
    "owner": "GrRating",
    "name": "--gr-rating-void-fill",
    "kind": "theme",
    "default": "currentColor",
    "description": "Заливка пустой звезды: `currentColor` — цветом `--gr-rating-void-color`, `transparent` — контур."
  },
  {
    "owner": "GrRating",
    "name": "--gr-rating-void-stroke",
    "kind": "theme",
    "default": "transparent",
    "description": "Обводка пустой звезды: `currentColor` — цветом `--gr-rating-void-color`."
  },
  {
    "owner": "GrRating",
    "name": "--gr-rating-stroke-width",
    "kind": "theme",
    "default": "0",
    "description": "Толщина обводки звезды в единицах её сетки 24×24. Заполненная обводится своим цветом той же толщины."
  },
  {
    "owner": "GrScrollSpy",
    "name": "--gr-scroll-spy-offset",
    "kind": "inline",
    "default": "0px",
    "description": "Отступ линии активации от верха скроллпорта. Пишется инлайн из пропа `offset`; заданный в каскаде работает общим дефолтом и подхватывается замером. Почти всегда равен `--gr-affix-offset` липкой шапки."
  },
  {
    "owner": "GrScrollSpy",
    "name": "--gr-scroll-spy-marker",
    "kind": "hook",
    "default": "var(--gr-selected)",
    "description": "Цвет рельса у активного пункта. Один из трёх признаков активности — рядом с ним меняются вес и цвет текста."
  },
  {
    "owner": "GrScrollSpy",
    "name": "--gr-scroll-spy-rail",
    "kind": "hook",
    "default": "var(--gr-brd)",
    "description": "Цвет рельса у остальных пунктов."
  },
  {
    "owner": "GrScrollSpy",
    "name": "--gr-scroll-spy-indent",
    "kind": "hook",
    "default": "0.75rem",
    "description": "Шаг отступа для вложенного уровня оглавления.",
    "literal": "Геометрия раскладки вложенных пунктов."
  },
  {
    "owner": "GrSegmented",
    "name": "--gr-segmented-track-bg",
    "kind": "inline",
    "default": "var(--gr-muted); в варианте `button` — var(--gr-card)",
    "description": "Фон дорожки переключателя."
  },
  {
    "owner": "GrSegmented",
    "name": "--gr-segmented-track-brd",
    "kind": "inline",
    "default": "var(--gr-brd)",
    "description": "Цвет рамки дорожки."
  },
  {
    "owner": "GrSegmented",
    "name": "--gr-segmented-invalid-brd",
    "kind": "hook",
    "default": "var(--gr-invalid-brd)",
    "description": "Рамка дорожки при `invalid` — вердикт валидации."
  },
  {
    "owner": "GrSegmented",
    "name": "--gr-segmented-track-shadow",
    "kind": "inline",
    "default": "none; в варианте `button` — var(--gr-shadow-1)",
    "description": "Тень дорожки."
  },
  {
    "owner": "GrSegmented",
    "name": "--gr-segmented-indicator-bg",
    "kind": "inline",
    "default": "var(--gr-card); в варианте `button` — var(--gr-selected)",
    "description": "Заливка бегунка под выбранным пунктом."
  },
  {
    "owner": "GrSegmented",
    "name": "--gr-segmented-indicator-brd",
    "kind": "inline",
    "default": "подмес `--gr-fg` к фону дорожки",
    "description": "Цвет рамки бегунка."
  },
  {
    "owner": "GrSegmented",
    "name": "--gr-segmented-indicator-shadow",
    "kind": "inline",
    "default": "var(--gr-shadow-1); в варианте `button` — var(--gr-shadow-2)",
    "description": "Тень бегунка — она отделяет его от дорожки."
  },
  {
    "owner": "GrSegmented",
    "name": "--gr-segmented-indicator-highlight-shadow",
    "kind": "theme",
    "default": "0 0 0 0 transparent",
    "description": "Дополнительная подсветка бегунка поверх основной тени: в светлом режиме выключена, в тёмном — тонкое светлое кольцо."
  },
  {
    "owner": "GrSegmented",
    "name": "--gr-segmented-item-color",
    "kind": "inline",
    "default": "var(--gr-muted-fg)",
    "description": "Цвет невыбранного пункта."
  },
  {
    "owner": "GrSegmented",
    "name": "--gr-segmented-item-hover-color",
    "kind": "inline",
    "default": "var(--gr-fg)",
    "description": "Цвет пункта под курсором."
  },
  {
    "owner": "GrSegmented",
    "name": "--gr-segmented-item-selected-color",
    "kind": "inline",
    "default": "var(--gr-fg); в варианте `button` — var(--gr-selected-fg)",
    "description": "Цвет выбранного пункта."
  },
  {
    "owner": "GrSegmented",
    "name": "--gr-segmented-item-px",
    "kind": "inline",
    "default": "10px / 12px / 14px / 16px по ступеням `xs…lg`",
    "description": "Горизонтальные поля пункта."
  },
  {
    "owner": "GrSegmented",
    "name": "--gr-segmented-item-py",
    "kind": "inline",
    "default": "2px / 4px / 6px / 8px по ступеням `xs…lg`",
    "description": "Вертикальные поля пункта."
  },
  {
    "owner": "GrSegmented",
    "name": "--gr-segmented-min-height",
    "kind": "inline",
    "default": "20px / 24px / 32px / 36px по ступеням `xs…lg`",
    "description": "Минимальная высота дорожки: переключатель обязан вставать в строку с контролами той же ступени."
  },
  {
    "owner": "GrSegmented",
    "name": "--gr-segmented-padding",
    "kind": "inline",
    "default": "4px",
    "description": "Внутренний отступ дорожки вокруг бегунка."
  },
  {
    "owner": "GrSegmented",
    "name": "--gr-segmented-radius",
    "kind": "inline",
    "default": "9999px",
    "description": "Скругление дорожки и бегунка."
  },
  {
    "owner": "GrSegmented",
    "name": "--gr-segmented-font-size",
    "kind": "inline",
    "default": "0.75rem / 0.875rem / 0.9375rem по ступеням",
    "description": "Кегль подписи пункта."
  },
  {
    "owner": "GrSegmented",
    "name": "--gr-segmented-font-weight",
    "kind": "inline",
    "default": "var(--gr-segmented-label-weight)",
    "description": "Начертание подписи пункта."
  },
  {
    "owner": "GrSegmented",
    "name": "--gr-segmented-line-height",
    "kind": "inline",
    "default": "1rem / 1.25rem по ступеням",
    "description": "Межстрочный интервал подписи пункта."
  },
  {
    "owner": "GrSegmented",
    "name": "--gr-segmented-label-weight",
    "kind": "theme",
    "default": "var(--gr-font-semibold)",
    "description": "Вес подписи сегмента."
  },
  {
    "owner": "GrSelect",
    "name": "--gr-select-option-active-bg",
    "kind": "theme",
    "default": "color-mix(in srgb, var(--gr-muted) 30%, transparent)",
    "description": "Подсветка опции под указателем и активной с клавиатуры."
  },
  {
    "owner": "GrSidebar",
    "name": "--gr-sidebar-nest-indent",
    "kind": "hook",
    "default": "1rem",
    "description": "Отступ одного уровня вложенности у подпунктов. Отодвигается вся строка вместе с подсветкой, а не только текст.",
    "literal": "Геометрия раскладки вложенных пунктов."
  },
  {
    "owner": "GrSidebar",
    "name": "--gr-sidebar-item-active-bg",
    "kind": "theme",
    "default": "var(--gr-muted)",
    "description": "Заливка текущего пункта."
  },
  {
    "owner": "GrSidebar",
    "name": "--gr-sidebar-item-active-weight",
    "kind": "theme",
    "default": "var(--gr-font-semibold)",
    "description": "Вес подписи текущего пункта."
  },
  {
    "owner": "GrSidebar",
    "name": "--gr-sidebar-group-label-size",
    "kind": "theme",
    "default": "var(--gr-text-2xs)",
    "description": "Кегль заголовка группы."
  },
  {
    "owner": "GrSidebar",
    "name": "--gr-sidebar-group-label-leading",
    "kind": "theme",
    "default": "var(--gr-leading-2xs)",
    "description": "Интерлиньяж заголовка группы."
  },
  {
    "owner": "GrSidebar",
    "name": "--gr-sidebar-group-label-weight",
    "kind": "theme",
    "default": "var(--gr-font-bold)",
    "description": "Вес заголовка группы."
  },
  {
    "owner": "GrSidebar",
    "name": "--gr-sidebar-group-label-transform",
    "kind": "theme",
    "default": "uppercase",
    "description": "Регистр заголовка группы: `uppercase` или `none`."
  },
  {
    "owner": "GrSidebar",
    "name": "--gr-sidebar-group-label-tracking",
    "kind": "theme",
    "default": "0.025em",
    "description": "Разрядка заголовка группы. Капсу она нужна, строчным — нет."
  },
  {
    "owner": "GrSkeleton",
    "name": "--gr-skeleton-bg",
    "kind": "theme",
    "default": "var(--gr-muted)",
    "description": "Заливка заглушки."
  },
  {
    "owner": "GrSkeleton",
    "name": "--gr-skeleton-brd",
    "kind": "theme",
    "default": "var(--gr-brd)",
    "description": "Рамка заглушки."
  },
  {
    "owner": "GrSkeleton",
    "name": "--gr-skeleton-pulse-opacity",
    "kind": "theme",
    "default": "0.5",
    "description": "Нижняя точка пульса: 1 — пульса нет."
  },
  {
    "owner": "GrSkeleton",
    "name": "--gr-skeleton-shine",
    "kind": "theme",
    "default": "transparent",
    "description": "Цвет бегущего блика: `transparent` — блика нет."
  },
  {
    "owner": "GrSlider",
    "name": "--gr-slider-mark-offset",
    "kind": "inline",
    "default": "выступ бегунка за дорожку + 0.25rem, не меньше 0.625rem",
    "description": "Отступ подписей меток от дорожки. Считается от `--gr-slider-thumb-size`: крупная ручка не закрывает подписи."
  },
  {
    "owner": "GrSlider",
    "name": "--gr-slider-fill",
    "kind": "hook",
    "default": "var(--gr-selected)",
    "description": "Цвет пройденной части трека."
  },
  {
    "owner": "GrSlider",
    "name": "--gr-slider-rail",
    "kind": "hook",
    "default": "var(--gr-brd)",
    "description": "Цвет непройденной части трека."
  },
  {
    "owner": "GrSlider",
    "name": "--gr-slider-track-height",
    "kind": "hook",
    "default": "0.1875rem / 0.25rem / 0.375rem / 0.5rem по ступеням `xs…lg`",
    "description": "Толщина трека.",
    "literal": "Толщина дорожки по ступени `size` из карты компонента."
  },
  {
    "owner": "GrSlider",
    "name": "--gr-slider-thumb-size",
    "kind": "hook",
    "default": "0.75rem / 0.875rem / 1rem / 1.25rem по ступеням `xs…lg`",
    "description": "Диаметр ползунка.",
    "literal": "Размер бегунка по ступени `size` из карты компонента."
  },
  {
    "owner": "GrSlider",
    "name": "--gr-slider-thumb-bg",
    "kind": "hook",
    "default": "var(--gr-bg)",
    "description": "Заливка ползунка."
  },
  {
    "owner": "GrSlider",
    "name": "--gr-slider-thumb-border",
    "kind": "hook",
    "default": "var(--gr-slider-fill, var(--gr-selected))",
    "description": "Цвет рамки ползунка. По умолчанию совпадает с заливкой трека."
  },
  {
    "owner": "GrSlider",
    "name": "--gr-slider-length",
    "kind": "hook",
    "default": "10rem",
    "description": "Длина вертикального слайдера: горизонтальный тянется по ширине контейнера, вертикальному нужна явная высота.",
    "literal": "Геометрия раскладки вертикальной шкалы."
  },
  {
    "owner": "GrSortableList",
    "name": "--gr-sortable-handle-size",
    "kind": "hook",
    "default": "1.5rem",
    "description": "Размер ручки переноса.",
    "literal": "Зона захвата ручки — механика взаимодействия."
  },
  {
    "owner": "GrSortableList",
    "name": "--gr-sortable-handle-color",
    "kind": "hook",
    "default": "var(--gr-muted-fg)",
    "description": "Цвет ручки переноса."
  },
  {
    "owner": "GrSortableList",
    "name": "--gr-sortable-row-bg-active",
    "kind": "hook",
    "default": "var(--gr-muted)",
    "description": "Фон строки, которую переносят указателем или держат с клавиатуры."
  },
  {
    "owner": "GrSortableList",
    "name": "--gr-sortable-indicator",
    "kind": "hook",
    "default": "var(--gr-primary)",
    "description": "Цвет линии, показывающей место вставки."
  },
  {
    "owner": "GrSortableList",
    "name": "--gr-sortable-indicator-width",
    "kind": "theme",
    "default": "2px",
    "description": "Толщина линии места вставки."
  },
  {
    "owner": "GrSplitter",
    "name": "--gr-splitter-size",
    "kind": "hook",
    "default": "6px",
    "description": "Толщина полосы разделителя — ширина её грид-трека.",
    "literal": "Геометрия раскладки разделителя."
  },
  {
    "owner": "GrSplitter",
    "name": "--gr-splitter-hit",
    "kind": "hook",
    "default": "4px",
    "description": "Запас зоны захвата с каждой стороны полосы: мишень в шесть пикселей мышью не берётся.",
    "literal": "Зона захвата разделителя — механика взаимодействия."
  },
  {
    "owner": "GrSplitter",
    "name": "--gr-splitter-color",
    "kind": "hook",
    "default": "var(--gr-brd)",
    "description": "Цвет разделителя в покое."
  },
  {
    "owner": "GrSplitter",
    "name": "--gr-splitter-hover-color",
    "kind": "hook",
    "default": "var(--gr-muted-fg)",
    "description": "Цвет разделителя под курсором."
  },
  {
    "owner": "GrSplitter",
    "name": "--gr-splitter-active-color",
    "kind": "hook",
    "default": "var(--gr-primary)",
    "description": "Цвет разделителя во время перетаскивания."
  },
  {
    "owner": "GrSplitter",
    "name": "--gr-splitter-grip",
    "kind": "hook",
    "default": "24px",
    "description": "Длина насечки посередине разделителя. `0` убирает её.",
    "literal": "Геометрия ручки разделителя."
  },
  {
    "owner": "GrStatistic",
    "name": "--gr-statistic-title-color",
    "kind": "hook",
    "default": "var(--gr-muted-fg)",
    "description": "Цвет подписи над значением."
  },
  {
    "owner": "GrStatistic",
    "name": "--gr-statistic-value-color",
    "kind": "hook",
    "default": "`-text`-роль выбранного тона",
    "description": "Цвет самого значения."
  },
  {
    "owner": "GrSteps",
    "name": "--gr-steps-marker-size",
    "kind": "inline",
    "default": "1.25rem / 1.5rem / 1.75rem / 2rem по ступеням `xs…lg`",
    "description": "Диаметр маркера шага. Задаётся ступенью размера и служит опорой для соединителя: линия центруется по этому значению."
  },
  {
    "owner": "GrSteps",
    "name": "--gr-steps-connector-size",
    "kind": "theme",
    "default": "2px",
    "description": "Толщина линии между шагами."
  },
  {
    "owner": "GrSteps",
    "name": "--gr-steps-connector-done",
    "kind": "hook",
    "default": "var(--gr-steps-done-bg)",
    "description": "Цвет пройденного участка линии."
  },
  {
    "owner": "GrSteps",
    "name": "--gr-steps-connector-pending",
    "kind": "hook",
    "default": "var(--gr-brd)",
    "description": "Цвет непройденного участка линии."
  },
  {
    "owner": "GrSteps",
    "name": "--gr-steps-done-bg",
    "kind": "theme",
    "default": "var(--gr-primary-solid)",
    "description": "Заливка пройденного шага и обводка текущего: одна ось прогресса."
  },
  {
    "owner": "GrSteps",
    "name": "--gr-steps-done-fg",
    "kind": "theme",
    "default": "var(--gr-primary-solid-fg)",
    "description": "Знак на заливке пройденного шага."
  },
  {
    "owner": "GrSteps",
    "name": "--gr-steps-current-fg",
    "kind": "theme",
    "default": "var(--gr-primary-text)",
    "description": "Номер текущего шага в обводке."
  },
  {
    "owner": "GrSwitch",
    "name": "--gr-switch-track-bg",
    "kind": "inline",
    "default": "var(--gr-selected) во включённом состоянии, var(--gr-switch-off-bg) в выключенном, var(--gr-disabled-bg) в недоступном",
    "description": "Заливка дорожки переключателя."
  },
  {
    "owner": "GrSwitch",
    "name": "--gr-switch-track-brd",
    "kind": "inline",
    "default": "var(--gr-selected) / var(--gr-control-brd) / var(--gr-disabled-brd)",
    "description": "Цвет рамки дорожки переключателя."
  },
  {
    "owner": "GrSwitch",
    "name": "--gr-switch-state-text-fg",
    "kind": "hook",
    "default": "var(--gr-selected-fg) во включённом состоянии, var(--gr-muted-fg) в выключенном, var(--gr-disabled-fg) в недоступном",
    "description": "Цвет подписи состояния внутри дорожки. Задан для того, кто красит дорожку своим цветом: контраст текста на произвольной заливке библиотека не вычислит."
  },
  {
    "owner": "GrSwitch",
    "name": "--gr-switch-state-text-size",
    "kind": "hook",
    "default": "9px на md, 11px на lg",
    "description": "Кегль подписи состояния. Собственный, а не ступень шкалы: минимальный --gr-text-xs (12px) в дорожку не помещается. Один токен на обе ступени.",
    "literal": "Кегль подписи состояния по ступени `size` из карты компонента."
  },
  {
    "owner": "GrSwitch",
    "name": "--gr-switch-thumb-fg",
    "kind": "hook",
    "default": "var(--gr-muted-fg)",
    "description": "Цвет содержимого бегунка — один на спиннер загрузки и иконку действия. По состоянию не ветвится: заливка бегунка — `--gr-switch-thumb-bg` в любом из них."
  },
  {
    "owner": "GrSwitch",
    "name": "--gr-switch-off-bg",
    "kind": "theme",
    "default": "var(--gr-muted)",
    "description": "Заливка выключенной дорожки."
  },
  {
    "owner": "GrSwitch",
    "name": "--gr-switch-thumb-bg",
    "kind": "theme",
    "default": "var(--gr-card)",
    "description": "Заливка бегунка."
  },
  {
    "owner": "GrSwitch",
    "name": "--gr-switch-thumb-shadow",
    "kind": "theme",
    "default": "var(--gr-shadow-1)",
    "description": "Тень бегунка."
  },
  {
    "owner": "GrSwitch",
    "name": "--gr-switch-track-height-xs",
    "kind": "theme",
    "default": "1rem",
    "description": "Высота дорожки на ступени `xs`. Бегунок и отступ подписи выводятся из неё: бегунок — высота минус 4px (рамка и зазор с обеих сторон)."
  },
  {
    "owner": "GrSwitch",
    "name": "--gr-switch-track-width-xs",
    "kind": "theme",
    "default": "1.75rem",
    "description": "Ширина дорожки на ступени `xs` без подписи состояния."
  },
  {
    "owner": "GrSwitch",
    "name": "--gr-switch-track-height-sm",
    "kind": "theme",
    "default": "1.25rem",
    "description": "Высота дорожки на ступени `sm`. Бегунок и отступ подписи выводятся из неё: бегунок — высота минус 4px (рамка и зазор с обеих сторон)."
  },
  {
    "owner": "GrSwitch",
    "name": "--gr-switch-track-width-sm",
    "kind": "theme",
    "default": "2.25rem",
    "description": "Ширина дорожки на ступени `sm` без подписи состояния."
  },
  {
    "owner": "GrSwitch",
    "name": "--gr-switch-track-height-md",
    "kind": "theme",
    "default": "1.5rem",
    "description": "Высота дорожки на ступени `md`. Бегунок и отступ подписи выводятся из неё: бегунок — высота минус 4px (рамка и зазор с обеих сторон)."
  },
  {
    "owner": "GrSwitch",
    "name": "--gr-switch-track-width-md",
    "kind": "theme",
    "default": "2.75rem",
    "description": "Ширина дорожки на ступени `md` без подписи состояния."
  },
  {
    "owner": "GrSwitch",
    "name": "--gr-switch-track-height-lg",
    "kind": "theme",
    "default": "1.75rem",
    "description": "Высота дорожки на ступени `lg`. Бегунок и отступ подписи выводятся из неё: бегунок — высота минус 4px (рамка и зазор с обеих сторон)."
  },
  {
    "owner": "GrSwitch",
    "name": "--gr-switch-track-width-lg",
    "kind": "theme",
    "default": "3.5rem",
    "description": "Ширина дорожки на ступени `lg` без подписи состояния."
  },
  {
    "owner": "GrSwitch",
    "name": "--gr-switch-text-track-width-md",
    "kind": "theme",
    "default": "2.75rem",
    "description": "Ширина дорожки с подписью состояния на ступени `md`; в `autoWidth` — нижняя граница. Места под подпись — не меньше, чем в базовой теме: держит гейт."
  },
  {
    "owner": "GrSwitch",
    "name": "--gr-switch-text-track-width-lg",
    "kind": "theme",
    "default": "3.5rem",
    "description": "Ширина дорожки с подписью состояния на ступени `lg`; в `autoWidth` — нижняя граница. Места под подпись — не меньше, чем в базовой теме: держит гейт."
  },
  {
    "owner": "GrTable",
    "name": "--gr-table-sticky-column-shadow",
    "kind": "theme",
    "default": "4px 0 6px -4px rgba(0, 0, 0, 0.25)",
    "description": "Тень справа у прилипающей первой колонки (`stickyColumn`). Признак того, что под ней уезжает содержимое. Тень, а не рамка: рамка сдвинула бы сетку таблицы."
  },
  {
    "owner": "GrTable",
    "name": "--gr-table-head-bg",
    "kind": "theme",
    "default": "var(--gr-muted)",
    "description": "Заливка шапки таблицы. Липкой шапке и закреплённой колонке она нужна непрозрачной."
  },
  {
    "owner": "GrTable",
    "name": "--gr-table-hover-share",
    "kind": "theme",
    "default": "45%",
    "description": "Доля `--gr-muted` в подсветке строки под указателем."
  },
  {
    "owner": "GrTable",
    "name": "--gr-table-stripe-share",
    "kind": "theme",
    "default": "35%",
    "description": "Доля `--gr-muted` в чётной строке зебры."
  },
  {
    "owner": "GrTable",
    "name": "--gr-table-head-line",
    "kind": "theme",
    "default": "transparent",
    "description": "Цвет линии под шапкой. Линия — фоновым слоем по низу ячеек шапки и не зависит от рамок строк: видна и в пустой таблице, и под липкой шапкой."
  },
  {
    "owner": "GrTable",
    "name": "--gr-table-head-line-width",
    "kind": "theme",
    "default": "0px",
    "description": "Толщина линии под шапкой; 0 — линии нет."
  },
  {
    "owner": "GrTabs",
    "name": "--gr-tabs-scroll-fade",
    "kind": "hook",
    "default": "1.5rem",
    "description": "Ширина затухания у края горизонтального ряда вкладок — того края, за которым ряд продолжается. Тем же значением задан `scroll-padding` ряда, поэтому вкладка, подтянутая в видимую часть, не встаёт под затухание.",
    "literal": "Размер затухания у края прокрутки — механика ленты."
  },
  {
    "owner": "GrTabs",
    "name": "--gr-tabs-mask",
    "kind": "css",
    "default": "не задана, пока ряд влезает целиком",
    "description": "Маска затухания. Задаётся собственным CSS компонента по `data-overflow`: у какого края есть продолжение, тот и гаснет. Вертикальный ряд не прокручивается, и маски у него нет."
  },
  {
    "owner": "GrTabs",
    "name": "--gr-tabs-font-weight",
    "kind": "theme",
    "default": "var(--gr-font-semibold)",
    "description": "Вес подписи вкладки."
  },
  {
    "owner": "GrTabs",
    "name": "--gr-tabs-pills-list-bg",
    "kind": "theme",
    "default": "var(--gr-muted)",
    "description": "Заливка ряда вкладок `pills`. Тема без лотка ставит `transparent`."
  },
  {
    "owner": "GrTabs",
    "name": "--gr-tabs-pills-list-brd",
    "kind": "theme",
    "default": "var(--gr-brd)",
    "description": "Рамка ряда вкладок `pills`."
  },
  {
    "owner": "GrTabs",
    "name": "--gr-tabs-pills-radius",
    "kind": "theme",
    "default": "var(--gr-radius-md)",
    "description": "Скругление вкладки `pills`."
  },
  {
    "owner": "GrTabs",
    "name": "--gr-tabs-pills-active-bg",
    "kind": "theme",
    "default": "var(--gr-card)",
    "description": "Заливка выбранной вкладки `pills`."
  },
  {
    "owner": "GrTabs",
    "name": "--gr-tabs-pills-active-fg",
    "kind": "theme",
    "default": "var(--gr-fg)",
    "description": "Текст выбранной вкладки `pills`."
  },
  {
    "owner": "GrTabs",
    "name": "--gr-tabs-pills-active-brd",
    "kind": "theme",
    "default": "var(--gr-brd)",
    "description": "Рамка выбранной вкладки `pills`."
  },
  {
    "owner": "GrTabs",
    "name": "--gr-tabs-pills-hover-bg",
    "kind": "theme",
    "default": "color-mix(in srgb, var(--gr-card) 70%, transparent)",
    "description": "Подсветка невыбранной вкладки `pills` под указателем."
  },
  {
    "owner": "GrTimeline",
    "name": "--gr-timeline-axis-width",
    "kind": "theme",
    "default": "2px",
    "description": "Толщина оси ленты."
  },
  {
    "owner": "GrTimeline",
    "name": "--gr-timeline-axis-color",
    "kind": "hook",
    "default": "var(--gr-brd)",
    "description": "Цвет оси и пунктира у незавершённых событий."
  },
  {
    "owner": "GrTimeline",
    "name": "--gr-timeline-marker-size",
    "kind": "hook",
    "default": "10px",
    "description": "Диаметр точки события.",
    "literal": "Геометрия маркера."
  },
  {
    "owner": "GrTimeline",
    "name": "--gr-timeline-marker-ring",
    "kind": "theme",
    "default": "2px",
    "description": "Толщина обводки полой точки (`variant=\"outlined\"`, `pending`)."
  },
  {
    "owner": "GrTimeline",
    "name": "--gr-timeline-marker-top",
    "kind": "hook",
    "default": "0.35rem",
    "description": "Отступ точки сверху: выравнивает её по первой строке текста события.",
    "literal": "Геометрия маркера."
  },
  {
    "owner": "GrTimeline",
    "name": "--gr-timeline-gap",
    "kind": "hook",
    "default": "0.75rem",
    "description": "Расстояние между колонками ленты — осью, меткой времени и содержимым.",
    "literal": "Геометрия раскладки."
  },
  {
    "owner": "GrTimeline",
    "name": "--gr-timeline-line-min",
    "kind": "hook",
    "default": "0.75rem",
    "description": "Минимальная длина отрезка оси: без неё однострочное событие обрывало бы линию.",
    "literal": "Геометрия раскладки."
  },
  {
    "owner": "GrTimeline",
    "name": "--gr-timeline-time-width",
    "kind": "hook",
    "default": "5.5rem",
    "description": "Ширина колонки времени в `layout=\"time\"`.",
    "literal": "Геометрия раскладки."
  },
  {
    "owner": "GrTimeline",
    "name": "--gr-timeline-dash",
    "kind": "theme",
    "default": "4px",
    "description": "Шаг пунктира на отрезке оси после незавершённого события."
  },
  {
    "owner": "GrTimeline",
    "name": "--gr-timeline-item-min-width",
    "kind": "hook",
    "default": "12rem",
    "description": "Ширина колонки события в горизонтальной ленте.",
    "literal": "Геометрия раскладки."
  },
  {
    "owner": "GrTimeline",
    "name": "--gr-timeline-columns",
    "kind": "css",
    "default": "`auto minmax(0, 1fr)`, а по раскладкам — с колонкой времени либо симметричная",
    "description": "Сетка колонок ленты. Задаётся собственным CSS компонента по `layout`; строка события и заголовок группы делят её, чтобы ось у них совпадала. Гибкие треки объявлены `minmax(0, 1fr)`, а не `1fr`: голый `1fr` держит минимум по содержимому, и лента не сжималась бы в узкой колонке."
  },
  {
    "owner": "GrTimeline",
    "name": "--gr-timeline-neutral-marker",
    "kind": "theme",
    "default": "var(--gr-muted-fg)",
    "description": "Заливка точки тона `neutral`."
  },
  {
    "owner": "GrTimeline",
    "name": "--gr-timeline-neutral-outline",
    "kind": "theme",
    "default": "var(--gr-muted-fg)",
    "description": "Обводка полой точки тона `neutral`."
  },
  {
    "owner": "GrTimeline",
    "name": "--gr-timeline-title-weight",
    "kind": "theme",
    "default": "var(--gr-font-semibold)",
    "description": "Вес заголовка события."
  },
  {
    "owner": "GrTimeline",
    "name": "--gr-timeline-group-title-transform",
    "kind": "theme",
    "default": "uppercase",
    "description": "Регистр заголовка группы событий: `uppercase` или `none`."
  },
  {
    "owner": "GrTimeline",
    "name": "--gr-timeline-group-title-tracking",
    "kind": "theme",
    "default": "0.025em",
    "description": "Разрядка заголовка группы. Капсу она нужна, строчным — нет."
  },
  {
    "owner": "GrToaster",
    "name": "--gr-toaster-width",
    "kind": "css",
    "default": "360px",
    "description": "Ширина стека тостов. Проп `width` задаёт её же, поэтому одно и то же настраивается и разметкой, и темой."
  },
  {
    "owner": "GrToaster",
    "name": "--gr-toaster-stack-peek",
    "kind": "hook",
    "default": "12px",
    "description": "Насколько выглядывает из-под передней карточки каждая следующая в свёрнутой стопке.",
    "literal": "Геометрия стопки уведомлений — механика стопки."
  },
  {
    "owner": "GrToaster",
    "name": "--gr-toaster-stack-scale",
    "kind": "hook",
    "default": "0.05",
    "description": "На сколько уменьшается каждая следующая карточка стопки: глубина читается размером, а не только смещением.",
    "literal": "Масштаб карточек в стопке — механика стопки."
  },
  {
    "owner": "GrToaster",
    "name": "--gr-toaster-brd",
    "kind": "theme",
    "default": "var(--gr-brd)",
    "description": "Рамка уведомления. Тема, у которой уведомление держится тенью, ставит `transparent`."
  },
  {
    "owner": "GrToaster",
    "name": "--gr-toaster-shadow",
    "kind": "theme",
    "default": "var(--gr-shadow-2)",
    "description": "Тень уведомления."
  },
  {
    "owner": "GrToaster",
    "name": "--gr-toaster-title-weight",
    "kind": "theme",
    "default": "var(--gr-font-bold)",
    "description": "Вес заголовка уведомления."
  },
  {
    "owner": "GrToaster",
    "name": "--gr-toaster-icon-tone",
    "kind": "theme",
    "default": "100%",
    "description": "Доля насыщенного тона в значке и полосе времени: 100% — насыщенный тон, 0% — `-text` тона, который держит 3:1 к карточке у любого тона."
  },
  {
    "owner": "GrTooltip",
    "name": "--gr-tooltip-bg",
    "kind": "theme",
    "default": "var(--gr-popover)",
    "description": "Заливка подсказки."
  },
  {
    "owner": "GrTooltip",
    "name": "--gr-tooltip-fg",
    "kind": "theme",
    "default": "var(--gr-popover-fg)",
    "description": "Текст подсказки."
  },
  {
    "owner": "GrTooltip",
    "name": "--gr-tooltip-brd",
    "kind": "theme",
    "default": "var(--gr-brd)",
    "description": "Рамка подсказки. Тема с пузырём без рамки ставит сюда цвет заливки."
  },
  {
    "owner": "GrTooltip",
    "name": "--gr-tooltip-radius",
    "kind": "theme",
    "default": "var(--gr-radius-control)",
    "description": "Скругление подсказки."
  },
  {
    "owner": "GrTooltip",
    "name": "--gr-tooltip-shadow",
    "kind": "theme",
    "default": "var(--gr-shadow-1)",
    "description": "Тень подсказки."
  },
  {
    "owner": "GrTransfer",
    "name": "--gr-transfer-panel-max-h",
    "kind": "hook",
    "default": "18rem",
    "description": "Высота панели. Обе панели обязаны быть одной высоты и прокручиваться внутри себя — иначе перенос двигает вёрстку страницы под курсором.",
    "literal": "Геометрия раскладки панели."
  },
  {
    "owner": "GrTransfer",
    "name": "--gr-transfer-fade",
    "kind": "hook",
    "default": "1.25rem",
    "description": "Высота затухания у края списка. Полоса прокрутки панели на части систем невидима, и без затухания обрезанная посередине строка читается как дефект отрисовки.",
    "literal": "Размер затухания у края прокрутки — механика списка."
  },
  {
    "owner": "GrTransfer",
    "name": "--gr-transfer-list-mask",
    "kind": "css",
    "default": "не задана, пока список влезает целиком",
    "description": "Маска затухания списка. Задаётся собственным CSS компонента по `data-overflow`: у какого края есть продолжение, тот и гаснет."
  },
  {
    "owner": "GrTransfer",
    "name": "--gr-transfer-selected-bg",
    "kind": "theme",
    "default": "color-mix(in srgb, var(--gr-primary) 12%, transparent)",
    "description": "Подложка отмеченной строки. Тон, а не заливка: текст остаётся обычным `--gr-fg`, и контраст не приходится выверять заново."
  },
  {
    "owner": "GrTransfer",
    "name": "--gr-transfer-arrived-bg",
    "kind": "theme",
    "default": "color-mix(in srgb, var(--gr-primary) 32%, transparent)",
    "description": "Начальный кадр подсветки строки, только что приехавшей из соседней панели. Подсветка гаснет сама и под `prefers-reduced-motion` не показывается вовсе."
  },
  {
    "owner": "GrTransfer",
    "name": "--gr-transfer-dragging-bg",
    "kind": "hook",
    "default": "var(--gr-muted)",
    "description": "Подложка строк, которые сейчас переносят указателем: видно, что именно уедет."
  },
  {
    "owner": "GrTransfer",
    "name": "--gr-transfer-ghost-bg",
    "kind": "hook",
    "default": "var(--gr-card)",
    "description": "Подложка предпросмотра, который едет за курсором. Он и есть ответ на «где сейчас элемент»: без него строка оставалась на месте, и жест выглядел так, будто ничего не происходит."
  },
  {
    "owner": "GrTransfer",
    "name": "--gr-transfer-drop-bg",
    "kind": "theme",
    "default": "color-mix(in srgb, var(--gr-primary) 6%, transparent)",
    "description": "Подложка панели-приёмника. Одной рамки мало: на широком экране она за пределами взгляда, занятого курсором."
  },
  {
    "owner": "GrTransfer",
    "name": "--gr-transfer-drop-brd",
    "kind": "hook",
    "default": "var(--gr-primary)",
    "description": "Рамка панели под указателем во время переноса."
  },
  {
    "owner": "GrTransfer",
    "name": "--gr-transfer-indicator",
    "kind": "hook",
    "default": "var(--gr-primary)",
    "description": "Цвет линии, показывающей место вставки."
  },
  {
    "owner": "GrTransfer",
    "name": "--gr-transfer-indicator-width",
    "kind": "theme",
    "default": "3px",
    "description": "Толщина линии места вставки."
  },
  {
    "owner": "GrTree",
    "name": "--gr-tree-gap",
    "kind": "css",
    "default": "2px",
    "description": "Просвет между строками дерева."
  },
  {
    "owner": "GrTree",
    "name": "--gr-tree-children-pl",
    "kind": "css",
    "default": "10px",
    "description": "Отступ вложенного списка от левого края родителя."
  },
  {
    "owner": "GrTree",
    "name": "--gr-tree-indent-step",
    "kind": "css",
    "default": "calc(12px + var(--gr-tree-children-pl) + var(--gr-tree-branch-line-width))",
    "description": "Шаг отступа уровня. Складывается из переключателя, отступа вложенного списка и толщины направляющей — линия обязана попадать ровно между ними."
  },
  {
    "owner": "GrTree",
    "name": "--gr-tree-row-indent",
    "kind": "inline",
    "default": "шаг отступа × глубина узла",
    "description": "Готовый отступ конкретной строки: шаг уровня, умноженный на её глубину."
  },
  {
    "owner": "GrTree",
    "name": "--gr-tree-row-min-height",
    "kind": "inline",
    "default": "22px / 24px / 28px / 32px по ступеням `xs…lg`",
    "description": "Минимальная высота строки."
  },
  {
    "owner": "GrTree",
    "name": "--gr-tree-row-px",
    "kind": "inline",
    "default": "4px / 6px / 8px / 10px по ступеням `xs…lg`",
    "description": "Горизонтальные поля строки."
  },
  {
    "owner": "GrTree",
    "name": "--gr-tree-row-py",
    "kind": "inline",
    "default": "3px / 5px / 8px / 10px по ступеням `xs…lg`",
    "description": "Вертикальные поля строки."
  },
  {
    "owner": "GrTree",
    "name": "--gr-tree-row-pr",
    "kind": "css",
    "default": "var(--gr-tree-row-px)",
    "description": "Правое поле строки — отдельно от левого: справа часто стоят действия узла."
  },
  {
    "owner": "GrTree",
    "name": "--gr-tree-row-radius",
    "kind": "css",
    "default": "8px",
    "description": "Скругление подсветки строки."
  },
  {
    "owner": "GrTree",
    "name": "--gr-tree-row-color",
    "kind": "css",
    "default": "var(--gr-fg)",
    "description": "Цвет текста строки."
  },
  {
    "owner": "GrTree",
    "name": "--gr-tree-row-hover-bg",
    "kind": "css",
    "default": "color-mix(in srgb, var(--gr-selected) 10%, transparent)",
    "description": "Фон строки под курсором."
  },
  {
    "owner": "GrTree",
    "name": "--gr-tree-row-current-bg",
    "kind": "css",
    "default": "color-mix(in srgb, var(--gr-selected) 14%, transparent)",
    "description": "Фон текущей (выбранной) строки."
  },
  {
    "owner": "GrTree",
    "name": "--gr-tree-row-current-hover-bg",
    "kind": "css",
    "default": "color-mix(in srgb, var(--gr-selected) 16%, transparent)",
    "description": "Фон текущей строки под курсором."
  },
  {
    "owner": "GrTree",
    "name": "--gr-tree-row-current-color",
    "kind": "css",
    "default": "var(--gr-tree-row-color)",
    "description": "Цвет текста выбранной строки. Отдельно от --gr-tree-row-color, потому что насыщенная подложка выбора требует своего текста: без этого сплошную плашку выбора нельзя сделать читаемой."
  },
  {
    "owner": "GrTree",
    "name": "--gr-tree-row-current-bar-width",
    "kind": "css",
    "default": "0px",
    "description": "Ширина полосы у левого края выбранной строки. По умолчанию полосы нет; вид, отмечающий выбор без подложки, включает её одной строкой. Рисуется на самой строке, поэтому стоит у края списка, а не уезжает вправо с отступом уровня."
  },
  {
    "owner": "GrTree",
    "name": "--gr-tree-row-current-bar-color",
    "kind": "css",
    "default": "var(--gr-selected)",
    "description": "Цвет полосы у выбранной строки."
  },
  {
    "owner": "GrTree",
    "name": "--gr-tree-checkbox-brd-width",
    "kind": "css",
    "default": "1px",
    "description": "Толщина рамки квадрата отметки. Вынесена отдельно от размера: на увеличенном квадрате волосяная рамка перестаёт читаться как рамка."
  },
  {
    "owner": "GrTree",
    "name": "--gr-tree-branch-font-weight",
    "kind": "css",
    "default": "var(--gr-tree-branch-weight)",
    "description": "Начертание подписи ветки. Плотнее листа, чтобы ветка и лист не выглядели одинаково. Гасится там, где вес несёт уровень, а не ветвистость."
  },
  {
    "owner": "GrTree",
    "name": "--gr-tree-font-size",
    "kind": "inline",
    "default": "12px / 13px / inherit / 15px по ступеням `xs…lg`",
    "description": "Кегль подписи узла."
  },
  {
    "owner": "GrTree",
    "name": "--gr-tree-content-gap",
    "kind": "inline",
    "default": "4px / 6px / 8px / 10px по ступеням `xs…lg`",
    "description": "Просвет между иконкой и подписью узла."
  },
  {
    "owner": "GrTree",
    "name": "--gr-tree-icon-size",
    "kind": "inline",
    "default": "12px / 14px / 16px / 20px по ступеням `xs…lg`",
    "description": "Размер иконки узла."
  },
  {
    "owner": "GrTree",
    "name": "--gr-tree-toggle-size",
    "kind": "inline",
    "default": "18px / 20px / 24px / 28px по ступеням `xs…lg`",
    "description": "Размер кнопки разворота ветки."
  },
  {
    "owner": "GrTree",
    "name": "--gr-tree-toggle-mr",
    "kind": "css",
    "default": "0",
    "description": "Отступ кнопки разворота от содержимого узла."
  },
  {
    "owner": "GrTree",
    "name": "--gr-tree-toggle-radius",
    "kind": "css",
    "default": "6px",
    "description": "Скругление кнопки разворота."
  },
  {
    "owner": "GrTree",
    "name": "--gr-tree-toggle-color",
    "kind": "css",
    "default": "inherit",
    "description": "Цвет стрелки разворота."
  },
  {
    "owner": "GrTree",
    "name": "--gr-tree-toggle-hover-bg",
    "kind": "css",
    "default": "color-mix(in srgb, var(--gr-muted) 25%, transparent)",
    "description": "Фон кнопки разворота под курсором."
  },
  {
    "owner": "GrTree",
    "name": "--gr-tree-toggle-hover-color",
    "kind": "css",
    "default": "var(--gr-tree-toggle-color)",
    "description": "Цвет стрелки разворота под курсором."
  },
  {
    "owner": "GrTree",
    "name": "--gr-tree-drag-handle-size",
    "kind": "inline",
    "default": "18px / 20px / 24px / 28px по ступеням `xs…lg`",
    "description": "Размер ручки перетаскивания."
  },
  {
    "owner": "GrTree",
    "name": "--gr-tree-drag-handle-mr",
    "kind": "css",
    "default": "0",
    "description": "Отступ ручки перетаскивания от содержимого узла."
  },
  {
    "owner": "GrTree",
    "name": "--gr-tree-drag-handle-radius",
    "kind": "css",
    "default": "6px",
    "description": "Скругление ручки перетаскивания."
  },
  {
    "owner": "GrTree",
    "name": "--gr-tree-drag-handle-color",
    "kind": "css",
    "default": "inherit",
    "description": "Цвет ручки перетаскивания."
  },
  {
    "owner": "GrTree",
    "name": "--gr-tree-drag-handle-opacity",
    "kind": "css",
    "default": "0.55",
    "description": "Прозрачность ручки в покое: ручка не должна спорить с подписью узла."
  },
  {
    "owner": "GrTree",
    "name": "--gr-tree-drag-handle-hover-bg",
    "kind": "css",
    "default": "color-mix(in srgb, var(--gr-muted) 22%, transparent)",
    "description": "Фон ручки перетаскивания под курсором."
  },
  {
    "owner": "GrTree",
    "name": "--gr-tree-drag-handle-hover-color",
    "kind": "css",
    "default": "var(--gr-tree-drag-handle-color)",
    "description": "Цвет ручки перетаскивания под курсором."
  },
  {
    "owner": "GrTree",
    "name": "--gr-tree-drag-handle-hover-opacity",
    "kind": "css",
    "default": "0.9",
    "description": "Прозрачность ручки под курсором."
  },
  {
    "owner": "GrTree",
    "name": "--gr-tree-drag-handle-disabled-opacity",
    "kind": "css",
    "default": "0.25",
    "description": "Прозрачность ручки у узла, который перетаскивать нельзя."
  },
  {
    "owner": "GrTree",
    "name": "--gr-tree-checkbox-size",
    "kind": "css",
    "default": "16px",
    "description": "Сторона коробки чекбокса узла."
  },
  {
    "owner": "GrTree",
    "name": "--gr-tree-checkbox-radius",
    "kind": "css",
    "default": "4px",
    "description": "Скругление коробки чекбокса."
  },
  {
    "owner": "GrTree",
    "name": "--gr-tree-checkbox-mr",
    "kind": "css",
    "default": "4px",
    "description": "Отступ чекбокса от содержимого узла."
  },
  {
    "owner": "GrTree",
    "name": "--gr-tree-checkbox-bg",
    "kind": "css",
    "default": "transparent",
    "description": "Фон невыбранного чекбокса."
  },
  {
    "owner": "GrTree",
    "name": "--gr-tree-checkbox-brd",
    "kind": "css",
    "default": "var(--gr-brd)",
    "description": "Цвет рамки чекбокса."
  },
  {
    "owner": "GrTree",
    "name": "--gr-tree-checkbox-checked-bg",
    "kind": "css",
    "default": "var(--gr-selected)",
    "description": "Фон отмеченного чекбокса."
  },
  {
    "owner": "GrTree",
    "name": "--gr-tree-checkbox-checked-fg",
    "kind": "css",
    "default": "var(--gr-selected-fg)",
    "description": "Цвет галочки в отмеченном чекбоксе."
  },
  {
    "owner": "GrTree",
    "name": "--gr-tree-branch-line-width",
    "kind": "css",
    "default": "2px",
    "description": "Толщина направляющей линии уровня."
  },
  {
    "owner": "GrTree",
    "name": "--gr-tree-branch-elbow-width",
    "kind": "css",
    "default": "8px",
    "description": "Длина горизонтального колена от направляющей к строке при branchLine=\"elbow\". Колено соединяет узлы, а не только отмечает уровень."
  },
  {
    "owner": "GrTree",
    "name": "--gr-tree-branch-line-offset",
    "kind": "css",
    "default": "12px",
    "description": "Сдвиг направляющей от левого края строки."
  },
  {
    "owner": "GrTree",
    "name": "--gr-tree-branch-line-default-color",
    "kind": "css",
    "default": "var(--gr-tree-row-current-bg)",
    "description": "Цвет направляющей по умолчанию."
  },
  {
    "owner": "GrTree",
    "name": "--gr-tree-branch-line-color",
    "kind": "inline",
    "default": "var(--gr-tree-branch-line-default-color)",
    "description": "Цвет направляющей конкретной ветки — им подсвечивается путь до текущего узла."
  },
  {
    "owner": "GrTree",
    "name": "--gr-tree-branch-weight",
    "kind": "theme",
    "default": "var(--gr-font-semibold)",
    "description": "Вес подписи ветки в теме. Виды дерева (`compact`, `outline`) ставят свой вес поверх."
  },
  {
    "owner": "GrValue",
    "name": "--gr-value-prefix-color",
    "kind": "hook",
    "default": "цвет величины (наследуется)",
    "description": "Цвет приписки перед значением. По умолчанию наследует цвет величины: знак валюты — часть суммы, и краснеть при отрицательном значении обязан вместе с ней.",
    "literal": "Нейтральное значение: цвет величины."
  },
  {
    "owner": "GrValue",
    "name": "--gr-value-prefix-size",
    "kind": "hook",
    "default": "кегль величины (наследуется)",
    "description": "Кегль приписки перед значением. По умолчанию равен кеглю самой величины: приглушённый и уменьшенный знак валюты читается подписью рядом с числом, а не его частью.",
    "literal": "Нейтральное значение: кегль величины."
  },
  {
    "owner": "GrValue",
    "name": "--gr-value-prefix-gap",
    "kind": "hook",
    "default": "0",
    "description": "Отбивка между припиской и значением. По умолчанию нулевая: «$ 14,99» с зазором читается как опечатка.",
    "literal": "Нейтральное значение: без отступа."
  },
  {
    "owner": "GrValue",
    "name": "--gr-value-suffix-color",
    "kind": "hook",
    "default": "var(--gr-muted-fg)",
    "description": "Цвет приписки после значения. По умолчанию приглушён: там обычно единица измерения, а она величине не принадлежит. Валюта справа (`100 ₽`) — случай обратный, и цвет для неё снимают этим токеном."
  },
  {
    "owner": "GrValue",
    "name": "--gr-value-suffix-size",
    "kind": "hook",
    "default": "0.85em",
    "description": "Кегль приписки после значения. Доля от кегля величины, а не ступень шкалы: примитив своей шкалы размеров не имеет и набирается кеглем места, где стоит.",
    "literal": "Кегль суффикса относительно кегля величины."
  },
  {
    "owner": "GrValue",
    "name": "--gr-value-suffix-gap",
    "kind": "hook",
    "default": "0.25rem",
    "description": "Отбивка между значением и припиской после него. Задаётся логическим отступом, поэтому в RTL встаёт с нужной стороны.",
    "literal": "Геометрия раскладки суффикса."
  },
  {
    "owner": "composables",
    "name": "--gr-virtual-before",
    "kind": "inline",
    "default": "0px",
    "description": "Высота спейсера перед первым отрисованным элементом виртуального списка. Ставится `useVirtualList` и читается через `[data-gr-virtual]::before` — потребители (`GrList`, `GrSelect`, `GrTree`, `GrAutocomplete`, `GrCommandPalette`) свою копию не заводят."
  },
  {
    "owner": "composables",
    "name": "--gr-virtual-after",
    "kind": "inline",
    "default": "0px",
    "description": "Высота спейсера после последнего отрисованного элемента виртуального списка."
  },
  {
    "owner": "composables",
    "name": "--gr-floating-available-height",
    "kind": "inline",
    "default": "100vh",
    "description": "Место, оставшееся до края вьюпорта на той стороне, куда `useFloating` поставил панель. Ставится инлайново при каждом пересчёте позиции — в том числе на скролле и ресайзе — и читается панелью как второй операнд потолка высоты (`GrPopover`). Слой сообщает замер, но не применяет его: скролл принадлежит содержимому панели. Значение по умолчанию — фолбэк на первый кадр, пока позиция ещё не посчитана."
  }
]
