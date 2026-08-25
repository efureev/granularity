import type { ShowcaseComponentExampleDoc } from '../types'

export const grPopoverExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'popover-form',
    title: 'Настройки в поповере',
    description: 'Форма прямо у кнопки, без ухода в модалку: поповер держит фокус, закрывается по Esc и клику вне, а клик внутри его не роняет — иначе первое же поле закрывало бы форму.',
    status: 'ready',
    previewKey: 'gr-popover-form',
  },
  {
    id: 'popover-confirm',
    title: 'Подтверждение действия',
    description: 'Лёгкая альтернатива диалогу для необратимых мелочей: подтверждение появляется у самой кнопки, а не перекрывает экран.',
    status: 'ready',
    previewKey: 'gr-popover-confirm',
  },
  {
    id: 'popover-modal',
    title: 'Модальный режим: изоляция фона',
    description: 'Поповер с формой внутри выключает страницу под собой: фон уходит в `inert`, Tab ходит по кругу внутри панели, скролл блокируется. Без `modal` всё это остаётся доступным — переключатель показывает разницу на живом фоне.',
    status: 'ready',
    previewKey: 'gr-popover-modal',
  },
  {
    id: 'popover-placement',
    title: 'Сторона и переворот у края',
    description: 'Сторона задаётся пропом placement; у границы экрана панель сама переворачивается и сдвигается, оставаясь видимой целиком.',
    status: 'ready',
    previewKey: 'gr-popover-placement',
  },
  {
    id: 'popover-width',
    title: 'Ширина: потолок и источник',
    description: 'Две независимые оси. Потолок содержимого — CSS-хук `--gr-popover-max-width`, источник ширины — проп `matchWidth`. Сочетаются, а не спорят: «шириной с триггер, но не шире читаемого».',
    status: 'ready',
    previewKey: 'gr-popover-width',
  },
  {
    id: 'popover-trigger',
    title: 'Чем открывается и что считается триггером',
    description: 'Клик и наведение с задержками. Триггером считается элемент с `triggerProps`, а не весь слот: соседняя кнопка внутри слота панель не открывает.',
    status: 'ready',
    previewKey: 'gr-popover-trigger',
  },
]
