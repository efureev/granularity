import type { ShowcaseComponentExampleDoc } from '../types'

export const grFormFileExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'form-file-basic-selection',
    title: 'Single file selection with summary state',
    description: 'Базовый сценарий показывает single-file поток: поле управляет выбором/заменой файла, а экран отдельно отображает business-friendly summary.',
    status: 'ready',
    previewKey: 'gr-form-file-basic-selection',
  },
  {
    id: 'form-file-custom-validation',
    title: 'Custom validation with surfaced errors',
    description: 'Отдельно фиксируем `validate`/`update:errors`: showcase должен показать, что `GrFormFile` подходит и для domain-specific upload rules, а не только для `accept`.',
    status: 'ready',
    previewKey: 'gr-form-file-custom-validation',
  },
  {
    id: 'form-file-multiple-queue',
    title: 'Multiple attachment queue',
    description: 'Многофайловый режим раскрывает список выбранных файлов и подходит для attachment-очередей в support/review-формах.',
    status: 'ready',
    previewKey: 'gr-form-file-multiple-queue',
  },
  {
    id: 'form-file-preview',
    title: 'Image thumbnails and a read-only set',
    description: 'Превью показываются только у картинок — файл другого типа остаётся строкой. Переключатель рядом делает поле read-only: набор виден и уходит в форму, но менять его нечем.',
    status: 'ready',
    previewKey: 'gr-form-file-preview',
  },
  {
    id: 'form-file-sizes',
    title: 'Шкала размеров',
    description: 'Размер доезжает до вложенных кнопок и иконок, поэтому поле выбора файла встаёт в один ряд с остальными контролами формы.',
    status: 'ready',
    previewKey: 'gr-form-file-sizes',
  },
  {
    id: 'form-file-server-errors',
    title: 'Server errors and limit',
    description: '`v-model:errors` — двусторонний канал: в него пишет и внутренняя валидация, и ответ сервера. `limit` отбивает лишние файлы тем же правилом, что и остальные.',
    status: 'ready',
    previewKey: 'gr-form-file-server-errors',
  },
]
