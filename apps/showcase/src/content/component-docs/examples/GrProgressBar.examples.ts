import type { ShowcaseComponentExampleDoc } from '../types'

export const grProgressBarExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'progress-bar-basic-flow',
    title: 'Interactive determinate progress',
    description: 'Базовый сценарий: меняем `value`, переключаем `tone` и рядом выводим фактический процент выполнения.',
    status: 'ready',
    previewKey: 'gr-progress-bar-basic-flow',  },
  {
    id: 'progress-bar-clamped-values',
    title: 'Out-of-range inputs are clamped',
    description: 'Документируем важный edge-case: отрицательные и слишком большие значения безопасно ограничиваются диапазоном 0–100.',
    status: 'ready',
    previewKey: 'gr-progress-bar-clamped-values',  },
  {
    id: 'progress-bar-pipeline-stages',
    title: 'Stack of workflow stages',
    description: 'Data-display сценарий для pipelines/checklists: несколько progress bars в списке статусов одного workflow с семантическим `tone` у каждого этапа.',
    status: 'ready',
    previewKey: 'gr-progress-bar-pipeline-stages',  },
  {
    id: 'progress-bar-sizes',
    title: 'Шкала размеров',
    description: 'У линейного индикатора размер — это толщина трека и ничего больше: ширину задаёт контейнер.',
    status: 'ready',
    previewKey: 'gr-progress-bar-sizes',  },
]
