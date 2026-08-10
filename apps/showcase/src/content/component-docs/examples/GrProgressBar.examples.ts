import type { ShowcaseComponentExampleDoc } from '../types'

export const grProgressBarExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'progress-bar-basic-flow',
    title: 'Interactive determinate progress',
    description: 'Базовый сценарий: меняем `value`, переключаем `tone` и рядом выводим фактический процент выполнения.',
    status: 'ready',
    previewKey: 'gr-progress-bar-basic-flow',
  },
  {
    id: 'progress-bar-clamped-values',
    title: 'Out-of-range inputs are clamped',
    description: 'Документируем важный edge-case: отрицательные и слишком большие значения безопасно ограничиваются диапазоном 0–100.',
    status: 'ready',
    previewKey: 'gr-progress-bar-clamped-values',
  },
  {
    id: 'progress-bar-indeterminate',
    title: 'Прогресс неизвестен',
    description: 'Запрос ушёл, а размер ответа сервер не сообщил: полоса бежит вместо того, чтобы врать про нуль. Как только процент известен, тот же компонент показывает значение.',
    status: 'ready',
    previewKey: 'gr-progress-bar-indeterminate',
  },
  {
    id: 'progress-bar-pipeline-stages',
    title: 'Stack of workflow stages',
    description: 'Data-display сценарий для pipelines/checklists: несколько progress bars в списке статусов одного workflow с семантическим `tone` у каждого этапа.',
    status: 'ready',
    previewKey: 'gr-progress-bar-pipeline-stages',
  },
  {
    id: 'progress-bar-sizes',
    title: 'Шкала размеров',
    description: 'У линейного индикатора размер — это толщина трека и ничего больше: ширину задаёт контейнер.',
    status: 'ready',
    previewKey: 'gr-progress-bar-sizes',
  },
  {
    id: 'progress-bar-value-and-buffer',
    title: 'Подпись значения и буфер',
    description: 'Процент печатает сам компонент — считать и верстать подпись рядом больше не нужно. Буфер добавляет второй слой: воспроизведено против загружено, залито против подтверждено.',
    status: 'ready',
    previewKey: 'gr-progress-bar-value-and-buffer',
  },
]
