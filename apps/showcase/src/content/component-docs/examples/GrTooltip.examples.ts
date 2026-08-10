import type { ShowcaseComponentExampleDoc } from '../types'

export const grTooltipExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'tooltip-inline-help',
    title: 'Inline help near form labels',
    description: 'Самый частый сценарий для `GrTooltip` — короткое пояснение рядом с label или small helper-control.',
    status: 'ready',
    previewKey: 'gr-tooltip-inline-help',
  },
  {
    id: 'tooltip-custom-trigger',
    title: 'Custom trigger via default slot',
    description: 'Показываем, что tooltip не ограничен встроенной info-иконкой: любой trigger можно прокинуть через default slot.',
    status: 'ready',
    previewKey: 'gr-tooltip-custom-trigger',
  },
  {
    id: 'tooltip-custom-tone',
    title: 'Editable copy and icon tone',
    description: 'Выделяем вторую важную возможность компонента: управлять plain-text сообщением и цветом trigger-иконки из внешнего state.',
    status: 'ready',
    previewKey: 'gr-tooltip-custom-tone',
  },
  {
    id: 'tooltip-sizes',
    title: 'Шкала размеров',
    description: 'Масштабируются и панель, и дефолтная триггер-иконка; предельная ширина растёт вместе с кеглем, чтобы строка не рвалась.',
    status: 'ready',
    previewKey: 'gr-tooltip-sizes',
  },
  {
    id: 'tooltip-placement',
    title: 'Сторона, задержка и disabled',
    description: 'Подсказка встаёт с любой стороны, `openDelay` убирает мигание на плотной панели кнопок, а слот-триггер не добавляет второй остановки `Tab`.',
    status: 'ready',
    previewKey: 'gr-tooltip-placement',
  },
]
