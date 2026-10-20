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
    "default": "var(--gr-shadow-2), при `placement=\"bottom\"` — зеркальная тень вверх подмесом `--gr-fg`",
    "description": "Тень прилипшей панели: она отделяет панель от уезжающего содержимого. Тенью, а не рамкой — рамка меняет высоту в момент прилипания и сдвигает раскладку."
  },
  {
    "owner": "GrAffix",
    "name": "--gr-affix-z",
    "kind": "hook",
    "default": "10",
    "description": "Порядок внутри своего stacking-контекста. Не глобальный слой: приложение, которому аффикс нужен на шкале, ставит сюда `var(--gr-z-navbar)` — шаг между слоями шкалы оставлен ровно под это (`docs/z-index.md`)."
  },
  {
    "owner": "GrAlert",
    "name": "--gr-alert-bg",
    "kind": "inline",
    "default": "подложка тона (`--gr-<tone>-light`); у `outline` — прозрачный",
    "description": "Фон полосы уведомления."
  },
  {
    "owner": "GrAlert",
    "name": "--gr-alert-brd",
    "kind": "inline",
    "default": "подмес тона к подложке",
    "description": "Цвет рамки уведомления."
  },
  {
    "owner": "GrAlert",
    "name": "--gr-alert-text-color",
    "kind": "inline",
    "default": "`--gr-<tone>-text`",
    "description": "Цвет основного текста уведомления."
  },
  {
    "owner": "GrAlert",
    "name": "--gr-alert-title-color",
    "kind": "inline",
    "default": "`--gr-<tone>-text`",
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
    "owner": "GrAvatar",
    "name": "--gr-avatar-square-radius",
    "kind": "hook",
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
    "owner": "GrBadge",
    "name": "--gr-badge-semi-radius-xs",
    "kind": "hook",
    "default": "3px",
    "description": "Скругление бейджа `radius=\"semi\"` на ступени `xs`."
  },
  {
    "owner": "GrBadge",
    "name": "--gr-badge-semi-radius-sm",
    "kind": "hook",
    "default": "3px",
    "description": "Скругление бейджа `radius=\"semi\"` на ступени `sm`."
  },
  {
    "owner": "GrBadge",
    "name": "--gr-badge-semi-radius-md",
    "kind": "hook",
    "default": "5px",
    "description": "Скругление бейджа `radius=\"semi\"` на ступени `md`."
  },
  {
    "owner": "GrBadge",
    "name": "--gr-badge-semi-radius-lg",
    "kind": "hook",
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
    "owner": "GrBadgeWrap",
    "name": "--gr-badge-wrap-offset-x",
    "kind": "hook",
    "default": "-0.5rem (для `dot` — 0)",
    "description": "Горизонтальный сдвиг метки относительно угла обёртки."
  },
  {
    "owner": "GrBadgeWrap",
    "name": "--gr-badge-wrap-offset-y",
    "kind": "hook",
    "default": "-0.5rem (для `dot` — 0)",
    "description": "Вертикальный сдвиг метки относительно угла обёртки."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-radius",
    "kind": "hook",
    "default": "0.375rem",
    "description": "Скругление кнопки. Его же по умолчанию наследуют внешние углы `GrButtonGroup`."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-radius-ss",
    "kind": "hook",
    "default": "var(--gr-button-radius)",
    "description": "Скругление одного угла (начало блока, начало строки). Прикреплённая `GrButtonGroup` гасит им внутренние углы звеньев."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-radius-se",
    "kind": "hook",
    "default": "var(--gr-button-radius)",
    "description": "Скругление одного угла (начало блока, конец строки). Прикреплённая `GrButtonGroup` гасит им внутренние углы звеньев."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-radius-ee",
    "kind": "hook",
    "default": "var(--gr-button-radius)",
    "description": "Скругление одного угла (конец блока, конец строки). Прикреплённая `GrButtonGroup` гасит им внутренние углы звеньев."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-radius-es",
    "kind": "hook",
    "default": "var(--gr-button-radius)",
    "description": "Скругление одного угла (конец блока, начало строки). Прикреплённая `GrButtonGroup` гасит им внутренние углы звеньев."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-square-size",
    "kind": "hook",
    "default": "высота кнопки текущей ступени",
    "description": "Сторона квадратной кнопки (`square`): иконка без подписи обязана остаться квадратом на любой ступени."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-font-weight",
    "kind": "hook",
    "default": "var(--gr-font-medium)",
    "description": "Начертание подписи. Кнопка читается как действие, а не как текст рядом с полем, поэтому по умолчанию — medium."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-touch-size",
    "kind": "hook",
    "default": "2.75rem",
    "description": "Высота зоны касания на грубом указателе (`pointer: coarse`). Кнопка ниже неё добирает высоту невидимым `::after`, вид не меняется."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-divider",
    "kind": "hook",
    "default": "нет (`0 0 transparent`)",
    "description": "Шов solid-кнопки внутри прикреплённой `GrButtonGroup`: группа ставит его второму из соседних primary-звеньев, кнопка рисует его своей тенью."
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
    "kind": "hook",
    "default": "var(--gr-secondary)",
    "description": "Заливка solid-кнопки тона `neutral`. Тема задаёт её, когда главная кнопка — не серая плашка: у «Глины» это графит, в тёмном режиме — светлая заливка."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-neutral-bg-hover",
    "kind": "hook",
    "default": "var(--gr-secondary-hover)",
    "description": "Заливка solid-кнопки `neutral` под указателем."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-neutral-bg-active",
    "kind": "hook",
    "default": "var(--gr-secondary-active)",
    "description": "Заливка solid-кнопки `neutral` в нажатии."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-neutral-fg",
    "kind": "hook",
    "default": "var(--gr-secondary-fg)",
    "description": "Подпись solid-кнопки `neutral`. Задаётся вместе с её заливкой."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-ghost-bg-hover",
    "kind": "hook",
    "default": "var(--gr-button-<тон>-soft-bg-hover)",
    "description": "Подложка прозрачных весов (`outline`, `ghost`, `ghost-border`) под указателем — одна на все тоны. Без неё — подложка тона; у «Глины» — оттенок бумаги."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-ghost-bg-active",
    "kind": "hook",
    "default": "var(--gr-button-<тон>-soft-bg-active)",
    "description": "Подложка прозрачных весов в нажатии — одна на все тоны."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-shimmer-duration",
    "kind": "hook",
    "default": "1.8s",
    "description": "Один проход света по подписи при `loadingIndicator=\"shimmer\"`."
  },
  {
    "owner": "GrButtonGroup",
    "name": "--gr-button-group-radius",
    "kind": "css",
    "default": "var(--gr-button-radius, 0.375rem)",
    "description": "Скругление внешних углов группы. По умолчанию наследует радиус кнопки — внутренние углы группа гасит сама."
  },
  {
    "owner": "GrButtonGroup",
    "name": "--gr-button-group-tray-bg",
    "kind": "hook",
    "default": "var(--gr-muted)",
    "description": "Подложка лотка (`appearance=\"tray\"`), на которой лежат звенья группы."
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
    "description": "Просвет между переключателями в полосе."
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
    "kind": "hook",
    "default": "2px",
    "description": "Толщина обвода вокруг текущей точки. Обвод — второй признак текущего кадра помимо заливки: при диаметре в 8 пикселей одного оттенка мало, и на приглушённом тоне разница почти пропадает."
  },
  {
    "owner": "GrCarousel",
    "name": "--gr-carousel-dot-ring-offset",
    "kind": "hook",
    "default": "2px",
    "description": "Зазор между точкой и её обводом."
  },
  {
    "owner": "GrCarousel",
    "name": "--gr-carousel-dot-size",
    "kind": "hook",
    "default": "0.5rem",
    "description": "Диаметр точки-индикатора."
  },
  {
    "owner": "GrCarousel",
    "name": "--gr-carousel-thumb-width",
    "kind": "hook",
    "default": "4rem",
    "description": "Ширина миниатюры в полосе."
  },
  {
    "owner": "GrCarousel",
    "name": "--gr-carousel-thumb-height",
    "kind": "hook",
    "default": "2.5rem",
    "description": "Высота миниатюры. Пропорцию задаёт потребитель парой с шириной: у галереи товара и у ленты обложек она разная."
  },
  {
    "owner": "GrCarousel",
    "name": "--gr-carousel-thumbs-fade",
    "kind": "hook",
    "default": "1.5rem",
    "description": "Ширина затухания у края полосы миниатюр. Она же — отступ прокрутки, иначе фокус-кольцо крайней миниатюры оказывается под затуханием."
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
    "owner": "GrColorPicker",
    "name": "--gr-color-picker-checker-size",
    "kind": "hook",
    "default": "6px",
    "description": "Сторона клетки шахматной подложки под прозрачным цветом."
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
    "description": "Диаметр ручки на области насыщенность × светлота."
  },
  {
    "owner": "GrColorPicker",
    "name": "--gr-color-picker-area-thumb-border",
    "kind": "hook",
    "default": "#fff",
    "description": "Внешний обвод ручки области. От темы не зависит намеренно: под ручкой лежит выбираемый цвет, а не подложка компонента."
  },
  {
    "owner": "GrColorPicker",
    "name": "--gr-color-picker-area-thumb-ring",
    "kind": "hook",
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
    "owner": "GrCommandPalette",
    "name": "--gr-command-active-bg",
    "kind": "hook",
    "default": "color-mix(in srgb, var(--gr-muted) 45%, transparent)",
    "description": "Фон активного пункта палитры (наведение и клавиатурный курсор)."
  },
  {
    "owner": "GrCommandPalette",
    "name": "--gr-command-match-bg",
    "kind": "hook",
    "default": "color-mix(in srgb, var(--gr-primary) 22%, transparent)",
    "description": "Подсветка совпавшей подстроки в подписи пункта."
  },
  {
    "owner": "GrCommandPalette",
    "name": "--gr-command-item-radius",
    "kind": "hook",
    "default": "10px",
    "description": "Скругление пункта палитры."
  },
  {
    "owner": "GrCommandPalette",
    "name": "--gr-command-input-font-size",
    "kind": "hook",
    "default": "15px",
    "description": "Кегль строки поиска: крупнее пунктов списка, потому что это единственное поле ввода в оверлее."
  },
  {
    "owner": "GrCommandPalette",
    "name": "--gr-command-list-max-height",
    "kind": "hook",
    "default": "значение пропа `maxHeight` в пикселях",
    "description": "Максимальная высота списка; дальше список скроллится."
  },
  {
    "owner": "GrCommandPalette",
    "name": "--gr-command-results-min-height",
    "kind": "hook",
    "default": "0px",
    "description": "Резерв высоты области результатов — чтобы окно не схлопывалось между «ищем» и «нашлось». Состояние «Ничего не найдено» и загрузка встают по центру резерва."
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
    "kind": "hook",
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
    "description": "Толщина полосы изменения ширины колонки."
  },
  {
    "owner": "GrDataTable",
    "name": "--gr-datatable-pinned-shadow",
    "kind": "hook",
    "default": "4px 0 6px -4px rgba(0, 0, 0, 0.25)",
    "description": "Тень на границе группы колонок, закреплённых слева."
  },
  {
    "owner": "GrDataTable",
    "name": "--gr-datatable-pinned-shadow-end",
    "kind": "hook",
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
    "owner": "GrDelta",
    "name": "--gr-delta-arrow-size",
    "kind": "hook",
    "default": "0.875em",
    "description": "Сторона стрелки направления. Доля от кегля величины, а не ступень шкалы: на ступени md у дельты своего кегля нет — она набирается кеглем строки, в которой стоит, и пиксельный размер оставил бы стрелку мелкой внутри заголовка."
  },
  {
    "owner": "GrDelta",
    "name": "--gr-delta-arrow-gap",
    "kind": "hook",
    "default": "0.125rem",
    "description": "Отбивка стрелки от величины. Логическая: в RTL встаёт с нужной стороны."
  },
  {
    "owner": "GrDelta",
    "name": "--gr-delta-suffix-color",
    "kind": "hook",
    "default": "currentColor",
    "description": "Цвет приписки после величины. У дельты она приглушения не получает: «−15 %» набирается цветом строки целиком, иначе процент читается подписью. Токен возвращает приглушение тому, кому оно нужно — переопределение GrValue ссылается на него, а не задаёт цвет инлайном."
  },
  {
    "owner": "GrDelta",
    "name": "--gr-delta-suffix-size",
    "kind": "hook",
    "default": "1em",
    "description": "Кегль приписки после величины. По умолчанию равен кеглю самой величины: уменьшённый процент оказался бы мельче окружающих слов."
  },
  {
    "owner": "GrDescriptionList",
    "name": "--gr-description-list-column-min",
    "kind": "hook",
    "default": "12rem",
    "description": "Минимальная ширина колонки. Ниже неё сетка отдаёт колонку целиком, а не делит её: в тесной колонке значение переносится посимвольно, и число «30» читается как «3» и «0». Порог считается от ширины контейнера, а не вьюпорта."
  },
  {
    "owner": "GrDescriptionList",
    "name": "--gr-description-list-value-min",
    "kind": "hook",
    "default": "5rem",
    "description": "Сколько места остаётся значению рядом с подписью при `inline`. Складывается с `labelWidth` в минимальную ширину колонки: колонка шириной с одну подпись выжимает значение в букву на строку."
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
    "default": "0.375rem (`density=\"compact\"` — 0.125rem)",
    "description": "Зазор между парами. Не ступень общей шкалы: плотность списка характеристик настраивается отдельно от отступов раскладки."
  },
  {
    "owner": "GrDescriptionList",
    "name": "--gr-description-list-divider",
    "kind": "hook",
    "default": "var(--gr-brd)",
    "description": "Цвет линии между парами при `divided`."
  },
  {
    "owner": "GrDivider",
    "name": "--gr-divider-thickness",
    "kind": "hook",
    "default": "1px",
    "description": "Толщина разделителя — общая для горизонтального и вертикального."
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
    "owner": "GrNavbar",
    "name": "--gr-navbar-height",
    "kind": "hook",
    "default": "56px",
    "description": "Высота шапки. Ею же считается отступ содержимого под прилипшей шапкой."
  },
  {
    "owner": "GrOtpInput",
    "name": "--gr-otp-input-cell-size",
    "kind": "hook",
    "default": "1.75rem / 2rem / 2.5rem / 2.75rem по ступеням xs…lg",
    "description": "Сторона ячейки. Повторяет высоту GrInput на той же ступени: код стоит в форме рядом с полями и обязан садиться с ними в одну линию. Через хук — квадратная ячейка это решение оформления, и макет вправе сделать её шире."
  },
  {
    "owner": "GrOtpInput",
    "name": "--gr-otp-input-active-brd",
    "kind": "hook",
    "default": "var(--gr-primary)",
    "description": "Цвет рамки активной ячейки — той, в которой стоит каретка."
  },
  {
    "owner": "GrOtpInput",
    "name": "--gr-otp-input-caret",
    "kind": "hook",
    "default": "var(--gr-primary)",
    "description": "Цвет каретки. Она рисуется своей: настоящая скрыта вместе с текстом поля."
  },
  {
    "owner": "GrPopover",
    "name": "--gr-popover-max-width",
    "kind": "hook",
    "default": "22rem",
    "description": "Потолок ширины панели. Содержимое шире прозы — тулбар, палитра, сетка — снимает потолок значением `100vw`. Шире вьюпорта панель не станет и тогда: этот предел — второй операнд `min()` и снаружи не отключается."
  },
  {
    "owner": "GrPopover",
    "name": "--gr-popover-max-height",
    "kind": "hook",
    "default": "100vh",
    "description": "Потолок высоты панели. По умолчанию мнения нет — высоту диктует место, оставшееся до края вьюпорта (замер слоя `--gr-floating-available-height`). Значение задают, когда панель обязана быть ниже доступного места; выше него она не станет и тогда."
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
    "kind": "hook",
    "default": "1.4s",
    "description": "Период пробега полосы в неопределённом режиме."
  },
  {
    "owner": "GrProgressCircle",
    "name": "--gr-progress-circle-size",
    "kind": "hook",
    "default": "2rem / 3rem / 4rem / 6rem по ступеням `xs…lg`",
    "description": "Диаметр кольца. Геометрия дуги считается в единицах `viewBox`, поэтому масштаб можно менять свободно."
  },
  {
    "owner": "GrProgressCircle",
    "name": "--gr-progress-circle-track",
    "kind": "hook",
    "default": "var(--gr-muted)",
    "description": "Цвет дорожки — непройденной части кольца."
  },
  {
    "owner": "GrProgressCircle",
    "name": "--gr-progress-circle-cap",
    "kind": "hook",
    "default": "round",
    "description": "Торец дуги значения: `round` или `butt` для строгой шкалы."
  },
  {
    "owner": "GrProgressCircle",
    "name": "--gr-progress-circle-value-size",
    "kind": "hook",
    "default": "кегль по ступени `size`",
    "description": "Кегль содержимого в центре кольца: свой формат значения может не влезть в дефолтный."
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
    "kind": "hook",
    "default": "color-mix(in srgb, var(--gr-muted-fg) 35%, transparent)",
    "description": "Цвет незаполненного символа: шкала обязана читаться целиком, а не только заполненной частью."
  },
  {
    "owner": "GrRating",
    "name": "--gr-rating-symbol-size",
    "kind": "hook",
    "default": "0.875rem / 1rem / 1.25rem / 1.5rem по ступеням `xs…lg`",
    "description": "Размер символа шкалы."
  },
  {
    "owner": "GrRating",
    "name": "--gr-rating-font-size-lg",
    "kind": "hook",
    "default": "15px",
    "description": "Кегль подписи на ступени `lg`: между `md` и `lg` шкалы контролов."
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
    "default": "var(--gr-primary)",
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
    "description": "Шаг отступа для вложенного уровня оглавления."
  },
  {
    "owner": "GrSegmented",
    "name": "--gr-segmented-track-bg",
    "kind": "inline",
    "default": "var(--gr-muted); в варианте `solid` — var(--gr-card)",
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
    "default": "none; в варианте `solid` — var(--gr-shadow-1)",
    "description": "Тень дорожки."
  },
  {
    "owner": "GrSegmented",
    "name": "--gr-segmented-indicator-bg",
    "kind": "inline",
    "default": "var(--gr-card); в варианте `primary` — var(--gr-primary)",
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
    "default": "var(--gr-shadow-1); в варианте `solid` — var(--gr-shadow-2)",
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
    "default": "var(--gr-fg); в варианте `primary` — var(--gr-primary-fg)",
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
    "default": "600",
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
    "owner": "GrSidebar",
    "name": "--gr-sidebar-nest-indent",
    "kind": "hook",
    "default": "1rem",
    "description": "Отступ одного уровня вложенности у подпунктов. Отодвигается вся строка вместе с подсветкой, а не только текст."
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
    "default": "var(--gr-primary)",
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
    "description": "Толщина трека."
  },
  {
    "owner": "GrSlider",
    "name": "--gr-slider-thumb-size",
    "kind": "hook",
    "default": "0.75rem / 0.875rem / 1rem / 1.25rem по ступеням `xs…lg`",
    "description": "Диаметр ползунка."
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
    "default": "var(--gr-slider-fill, var(--gr-primary))",
    "description": "Цвет рамки ползунка. По умолчанию совпадает с заливкой трека."
  },
  {
    "owner": "GrSlider",
    "name": "--gr-slider-length",
    "kind": "hook",
    "default": "10rem",
    "description": "Длина вертикального слайдера: горизонтальный тянется по ширине контейнера, вертикальному нужна явная высота."
  },
  {
    "owner": "GrSortableList",
    "name": "--gr-sortable-handle-size",
    "kind": "hook",
    "default": "1.5rem",
    "description": "Размер ручки переноса."
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
    "kind": "hook",
    "default": "2px",
    "description": "Толщина линии места вставки."
  },
  {
    "owner": "GrSplitter",
    "name": "--gr-splitter-size",
    "kind": "hook",
    "default": "6px",
    "description": "Толщина полосы разделителя — ширина её грид-трека."
  },
  {
    "owner": "GrSplitter",
    "name": "--gr-splitter-hit",
    "kind": "hook",
    "default": "4px",
    "description": "Запас зоны захвата с каждой стороны полосы: мишень в шесть пикселей мышью не берётся."
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
    "description": "Длина насечки посередине разделителя. `0` убирает её."
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
    "kind": "hook",
    "default": "2px",
    "description": "Толщина линии между шагами."
  },
  {
    "owner": "GrSteps",
    "name": "--gr-steps-connector-done",
    "kind": "hook",
    "default": "var(--gr-primary-solid)",
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
    "owner": "GrSwitch",
    "name": "--gr-switch-track-bg",
    "kind": "inline",
    "default": "var(--gr-primary) во включённом состоянии, var(--gr-muted) в выключенном, var(--gr-disabled-bg) в недоступном",
    "description": "Заливка дорожки переключателя."
  },
  {
    "owner": "GrSwitch",
    "name": "--gr-switch-track-brd",
    "kind": "inline",
    "default": "var(--gr-primary) / var(--gr-control-brd) / var(--gr-disabled-brd)",
    "description": "Цвет рамки дорожки переключателя."
  },
  {
    "owner": "GrSwitch",
    "name": "--gr-switch-state-text-fg",
    "kind": "hook",
    "default": "var(--gr-primary-fg) во включённом состоянии, var(--gr-muted-fg) в выключенном, var(--gr-disabled-fg) в недоступном",
    "description": "Цвет подписи состояния внутри дорожки. Задан для того, кто красит дорожку своим цветом: контраст текста на произвольной заливке библиотека не вычислит."
  },
  {
    "owner": "GrSwitch",
    "name": "--gr-switch-state-text-size",
    "kind": "hook",
    "default": "9px на md, 11px на lg",
    "description": "Кегль подписи состояния. Собственный, а не ступень шкалы: минимальный --gr-text-xs (12px) в дорожку не помещается. Один токен на обе ступени."
  },
  {
    "owner": "GrSwitch",
    "name": "--gr-switch-thumb-fg",
    "kind": "hook",
    "default": "var(--gr-muted-fg)",
    "description": "Цвет содержимого бегунка — один на спиннер загрузки и иконку действия. По состоянию не ветвится: бегунок остаётся var(--gr-card) в любом из них."
  },
  {
    "owner": "GrTable",
    "name": "--gr-table-sticky-column-shadow",
    "kind": "hook",
    "default": "4px 0 6px -4px rgba(0, 0, 0, 0.25)",
    "description": "Тень справа у прилипающей первой колонки (`stickyColumn`). Признак того, что под ней уезжает содержимое. Тень, а не рамка: рамка сдвинула бы сетку таблицы."
  },
  {
    "owner": "GrTabs",
    "name": "--gr-tabs-scroll-fade",
    "kind": "hook",
    "default": "1.5rem",
    "description": "Ширина затухания у края горизонтального ряда вкладок — того края, за которым ряд продолжается. Тем же значением задан `scroll-padding` ряда, поэтому вкладка, подтянутая в видимую часть, не встаёт под затухание."
  },
  {
    "owner": "GrTabs",
    "name": "--gr-tabs-mask",
    "kind": "css",
    "default": "не задана, пока ряд влезает целиком",
    "description": "Маска затухания. Задаётся собственным CSS компонента по `data-overflow`: у какого края есть продолжение, тот и гаснет. Вертикальный ряд не прокручивается, и маски у него нет."
  },
  {
    "owner": "GrTimeline",
    "name": "--gr-timeline-axis-width",
    "kind": "hook",
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
    "description": "Диаметр точки события."
  },
  {
    "owner": "GrTimeline",
    "name": "--gr-timeline-marker-ring",
    "kind": "hook",
    "default": "2px",
    "description": "Толщина обводки полой точки (`variant=\"outlined\"`, `pending`)."
  },
  {
    "owner": "GrTimeline",
    "name": "--gr-timeline-marker-top",
    "kind": "hook",
    "default": "0.35rem",
    "description": "Отступ точки сверху: выравнивает её по первой строке текста события."
  },
  {
    "owner": "GrTimeline",
    "name": "--gr-timeline-gap",
    "kind": "hook",
    "default": "0.75rem",
    "description": "Расстояние между колонками ленты — осью, меткой времени и содержимым."
  },
  {
    "owner": "GrTimeline",
    "name": "--gr-timeline-line-min",
    "kind": "hook",
    "default": "0.75rem",
    "description": "Минимальная длина отрезка оси: без неё однострочное событие обрывало бы линию."
  },
  {
    "owner": "GrTimeline",
    "name": "--gr-timeline-time-width",
    "kind": "hook",
    "default": "5.5rem",
    "description": "Ширина колонки времени в `layout=\"time\"`."
  },
  {
    "owner": "GrTimeline",
    "name": "--gr-timeline-dash",
    "kind": "hook",
    "default": "4px",
    "description": "Шаг пунктира на отрезке оси после незавершённого события."
  },
  {
    "owner": "GrTimeline",
    "name": "--gr-timeline-item-min-width",
    "kind": "hook",
    "default": "12rem",
    "description": "Ширина колонки события в горизонтальной ленте."
  },
  {
    "owner": "GrTimeline",
    "name": "--gr-timeline-columns",
    "kind": "css",
    "default": "`auto minmax(0, 1fr)`, а по раскладкам — с колонкой времени либо симметричная",
    "description": "Сетка колонок ленты. Задаётся собственным CSS компонента по `layout`; строка события и заголовок группы делят её, чтобы ось у них совпадала. Гибкие треки объявлены `minmax(0, 1fr)`, а не `1fr`: голый `1fr` держит минимум по содержимому, и лента не сжималась бы в узкой колонке."
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
    "description": "Насколько выглядывает из-под передней карточки каждая следующая в свёрнутой стопке."
  },
  {
    "owner": "GrToaster",
    "name": "--gr-toaster-stack-scale",
    "kind": "hook",
    "default": "0.05",
    "description": "На сколько уменьшается каждая следующая карточка стопки: глубина читается размером, а не только смещением."
  },
  {
    "owner": "GrTransfer",
    "name": "--gr-transfer-panel-max-h",
    "kind": "hook",
    "default": "18rem",
    "description": "Высота панели. Обе панели обязаны быть одной высоты и прокручиваться внутри себя — иначе перенос двигает вёрстку страницы под курсором."
  },
  {
    "owner": "GrTransfer",
    "name": "--gr-transfer-fade",
    "kind": "hook",
    "default": "1.25rem",
    "description": "Высота затухания у края списка. Полоса прокрутки панели на части систем невидима, и без затухания обрезанная посередине строка читается как дефект отрисовки."
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
    "kind": "hook",
    "default": "12 % от `--gr-primary` через `color-mix`",
    "description": "Подложка отмеченной строки. Тон, а не заливка: текст остаётся обычным `--gr-fg`, и контраст не приходится выверять заново."
  },
  {
    "owner": "GrTransfer",
    "name": "--gr-transfer-arrived-bg",
    "kind": "hook",
    "default": "32 % от `--gr-primary` через `color-mix`",
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
    "kind": "hook",
    "default": "6 % от `--gr-primary` через `color-mix`",
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
    "kind": "hook",
    "default": "2px",
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
    "default": "color-mix(in srgb, var(--gr-primary) 10%, transparent)",
    "description": "Фон строки под курсором."
  },
  {
    "owner": "GrTree",
    "name": "--gr-tree-row-current-bg",
    "kind": "css",
    "default": "color-mix(in srgb, var(--gr-primary) 14%, transparent)",
    "description": "Фон текущей (выбранной) строки."
  },
  {
    "owner": "GrTree",
    "name": "--gr-tree-row-current-hover-bg",
    "kind": "css",
    "default": "color-mix(in srgb, var(--gr-primary) 16%, transparent)",
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
    "default": "var(--gr-primary)",
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
    "default": "600",
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
    "default": "var(--gr-primary)",
    "description": "Фон отмеченного чекбокса."
  },
  {
    "owner": "GrTree",
    "name": "--gr-tree-checkbox-checked-fg",
    "kind": "css",
    "default": "var(--gr-primary-fg)",
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
    "owner": "GrValue",
    "name": "--gr-value-prefix-color",
    "kind": "hook",
    "default": "цвет величины (наследуется)",
    "description": "Цвет приписки перед значением. По умолчанию наследует цвет величины: знак валюты — часть суммы, и краснеть при отрицательном значении обязан вместе с ней."
  },
  {
    "owner": "GrValue",
    "name": "--gr-value-prefix-size",
    "kind": "hook",
    "default": "кегль величины (наследуется)",
    "description": "Кегль приписки перед значением. По умолчанию равен кеглю самой величины: приглушённый и уменьшенный знак валюты читается подписью рядом с числом, а не его частью."
  },
  {
    "owner": "GrValue",
    "name": "--gr-value-prefix-gap",
    "kind": "hook",
    "default": "0",
    "description": "Отбивка между припиской и значением. По умолчанию нулевая: «$ 14,99» с зазором читается как опечатка."
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
    "description": "Кегль приписки после значения. Доля от кегля величины, а не ступень шкалы: примитив своей шкалы размеров не имеет и набирается кеглем места, где стоит."
  },
  {
    "owner": "GrValue",
    "name": "--gr-value-suffix-gap",
    "kind": "hook",
    "default": "0.25rem",
    "description": "Отбивка между значением и припиской после него. Задаётся логическим отступом, поэтому в RTL встаёт с нужной стороны."
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
