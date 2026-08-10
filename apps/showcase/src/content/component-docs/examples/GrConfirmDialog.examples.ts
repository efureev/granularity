import type { ShowcaseComponentExampleDoc } from '../types'

export const grConfirmDialogExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'confirm-dialog-destructive',
    title: 'Destructive confirmation',
    description: 'Главный сценарий для `GrConfirmDialog`: destructive action с кастомным текстом и semantic `confirmTone` у confirm-кнопки.',
    status: 'ready',
    previewKey: 'gr-confirm-dialog-destructive',
  },
  {
    id: 'confirm-dialog-button-matrix',
    title: 'Compact action sizes',
    description: 'Отдельно проверяем `buttonSize`, `cancelText` и плотные approval flows.',
    status: 'ready',
    previewKey: 'gr-confirm-dialog-button-matrix',
  },
  {
    id: 'confirm-dialog-imperative-service-link',
    title: 'Imperative service (useDialogService)',
    description: 'Императивный вызов диалогов (`confirm`/`prompt`/`alert`) из `<script>`/`.ts` без вставки компонента в шаблон вынесен на отдельную страницу composable `useDialogService` — там собраны живые примеры и обработка ошибок сервера.',
    status: 'ready',
    previewKey: 'gr-confirm-dialog-service-link',    note: 'Полный набор императивных сценариев (confirm/prompt/alert, async-onConfirm, ошибки сети и валидации) — на странице composable useDialogService.',
  },
  {
    id: 'confirm-dialog-custom-body',
    title: 'Custom summary body',
    description: 'Подтверждаем, что в confirm-shell можно выводить richer body через default slot, а не только plain description.',
    status: 'ready',
    previewKey: 'gr-confirm-dialog-custom-body',
  },
  {
    id: 'confirm-dialog-async-confirm',
    title: 'Async confirmation with server error',
    description: '`closeOnConfirm: false` отдаёт закрытие наружу, `confirmLoading` держит кнопку, `persistent` снимает Esc и бэкдроп на время операции, а `error` рисует ответ сервера, не закрывая окно. `focusAction` выбирает, какое действие получает фокус при открытии.',
    status: 'ready',
    previewKey: 'gr-confirm-dialog-async-confirm',
  },
]
