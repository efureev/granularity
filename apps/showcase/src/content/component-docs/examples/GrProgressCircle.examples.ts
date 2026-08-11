import type { ShowcaseComponentExampleDoc } from '../types'

export const grProgressCircleExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'progress-circle-basic',
    title: 'Размеры и тона',
    description: 'Диаметр — по шкале пакета, толщина обводки идёт следом. Тона берутся из той же темы, что и у линейного индикатора: перекрасив `--gr-progress-bg`, вы перекрасите оба.',
    status: 'ready',
    previewKey: 'gr-progress-circle-basic',
  },
  {
    id: 'progress-circle-dashboard',
    title: 'Плитка метрики',
    description: '`shape="dashboard"` оставляет вырез снизу — под значением освобождается место для подписи, а шкала читается как спидометр.',
    status: 'ready',
    previewKey: 'gr-progress-circle-dashboard',
  },
  {
    id: 'progress-circle-upload',
    title: 'Аплоад: от «соединяемся» до галочки',
    description: 'Пока доли прогресса нет — `indeterminate`; дальше значение, а на завершении `statusIcon` меняет число на галочку. Кнопка отмены живёт в центре кольца и остаётся кликабельной: центр лежит рядом с `role="progressbar"`, а не внутри него.',
    status: 'ready',
    previewKey: 'gr-progress-circle-upload',
  },
]
