import type { ShowcaseComponentExampleDoc } from '../types'

export const grDialogExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'dialog-basic-flow',
    title: 'Basic dialog shell',
    description: 'Показываем базовый слой над `GrModal`: готовый header/footer shell для review, approval и confirm-like сценариев.',
    status: 'ready',
    previewKey: 'gr-dialog-basic-flow',  },
  {
    id: 'dialog-section-config',
    title: 'Section config and internal state',
    description: 'Демонстрируем `headerConfig` / `footerConfig` и локальное состояние формы внутри dialog-shell.',
    status: 'ready',
    previewKey: 'gr-dialog-section-config',  },
  {
    id: 'dialog-guarded-backdrop',
    title: 'Guarded backdrop for critical flows',
    description: 'Отдельный сценарий для `closeOnBackdrop=false`, когда закрытие должно происходить только по явным действиям.',
    status: 'ready',
    previewKey: 'gr-dialog-guarded-backdrop',    note: 'Сценарий полезен для финальных шагов publish/delete/release flows.',
  },
  {
    id: 'dialog-scrollable-body',
    title: 'Long form with a pinned header and footer',
    description: '`scrollBehavior: "inside"` оставляет шапку и подвал на месте и скроллит только тело — форма на двадцать полей не уносит кнопки за экран. Переключатель показывает разницу с дефолтным `outside`.',
    status: 'ready',
    previewKey: 'gr-dialog-scrollable-body',  },
]
