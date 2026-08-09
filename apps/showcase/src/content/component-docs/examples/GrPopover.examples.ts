import type { ShowcaseComponentExampleDoc } from '../types'

export const grPopoverExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'popover-form',
    title: 'Настройки в поповере',
    description: 'Форма прямо у кнопки, без ухода в модалку: поповер держит фокус, закрывается по Esc и клику вне, а клик внутри его не роняет — иначе первое же поле закрывало бы форму.',
    status: 'ready',
    previewKey: 'gr-popover-form',  },
  {
    id: 'popover-confirm',
    title: 'Подтверждение действия',
    description: 'Лёгкая альтернатива диалогу для необратимых мелочей: подтверждение появляется у самой кнопки, а не перекрывает экран.',
    status: 'ready',
    previewKey: 'gr-popover-confirm',  },
  {
    id: 'popover-placement',
    title: 'Сторона и переворот у края',
    description: 'Сторона задаётся пропом placement; у границы экрана панель сама переворачивается и сдвигается, оставаясь видимой целиком.',
    status: 'ready',
    previewKey: 'gr-popover-placement',  },
]
