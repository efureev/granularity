import type { ShowcaseComponentExampleDoc } from '../types'

export const grModalExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'modal-basic-flow',
    title: 'Bare modal flow',
    description: 'Базовый сценарий для `GrModal`: минимальный контейнер, открытие по кнопке и явное закрытие из пользовательского контента.',
    status: 'ready',
    previewKey: 'gr-modal-basic-flow',
    note: 'Панель без внутренних отступов — так и задумано: `GrModal` даёт только рамку и механику окна, а содержимое кладёт как есть. Поля, шапку и подвал добавляет `GrDialog` поверх него.',
  },
  {
    id: 'modal-backdrop-guard',
    title: 'Backdrop guard for critical flows',
    description: 'Показываем `closeOnBackdrop=false` для кейсов, где нельзя случайно потерять прогресс черновика или подтверждения.',
    status: 'ready',
    previewKey: 'gr-modal-backdrop-guard',
    note: 'Этот сценарий полезен для проверки focus-trap и поведения backdrop в критичных формах/confirm flows.',
  },
  {
    id: 'modal-size-switcher',
    title: 'Size variants for different payloads',
    description: 'Изолируем влияние `size` на layout: один и тот же entry point может открывать compact review или широкую review-панель.',
    status: 'ready',
    previewKey: 'gr-modal-size-switcher',
  },
  {
    id: 'modal-dialog-service',
    title: 'Imperative dialogs from an open modal',
    description: 'Запускаем `useDialogService` (`confirm` / `alert` / `prompt`) прямо из открытой `GrModal`. Сервис монтирует собственный host в `document.body` поверх окна, поэтому закрытие диалога не закрывает исходную модалку — решение возвращается через `Promise`.',
    status: 'ready',
    previewKey: 'gr-modal-dialog-service',
    note: 'Закрытие confirm/alert/prompt не закрывает исходную модалку — это удобно для подтверждений и быстрых вводов внутри сложных форм.',
  },
  {
    id: 'modal-nested-poppers',
    title: 'Poppers inside a modal',
    description: 'Селект, автокомплит, дата и меню внутри окна: их панели телепортируются в общий портал и лежат рядом с корнем окна, а высоту получают из стека слоёв.',
    status: 'ready',
    previewKey: 'gr-modal-nested-poppers',
    note: 'Esc закрывает сначала панель, потом окно. Пока панель открыта, ловушка фокуса окна считает её своей.',
  },
  {
    id: 'modal-stack',
    title: 'Windows stacked on top of each other',
    description: 'Четыре окна лесенкой и диалог поверх них: высоту слоя даёт стек, а не порядок узлов в портале.',
    status: 'ready',
    previewKey: 'gr-modal-stack',
    note: 'Все окна объявлены статически, то есть в контейнер портала попадают в порядке создания, а открываются по очереди. Пока высота была одна на всех, порядок отрисовки решал портал: диалог, объявленный раньше, оказывался под окном, открытым позже, — и оставался невидимым, хотя стек считал верхним именно его и гасил окно `inert`. Теперь высота считается от позиции в стеке, и «верхний» для отрисовки совпадает с «верхним» для Esc и `inert`.',
  },
  {
    id: 'modal-scroll-lifecycle',
    title: 'Scrolling long content and lifecycle events',
    description: '`scrollBehavior` решает, кто скроллится — панель или весь оверлей; `opened`/`closed` приходят после анимации, и только по `closed` безопасно размонтировать содержимое.',
    status: 'ready',
    previewKey: 'gr-modal-scroll-lifecycle',
  },
]
