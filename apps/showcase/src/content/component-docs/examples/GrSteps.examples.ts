import type { ShowcaseComponentExampleDoc } from '../types'

export const grStepsExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'steps-wizard',
    title: 'Мастер с проверкой шага',
    description: 'Шаг не отпускает, пока его поля не сойдутся; шаг с ошибкой помечен.',
    status: 'ready',
    previewKey: 'gr-steps-wizard',
    note: '`GrSteps` про `GrForm` ничего не знает: проверку ставит приложение в `beforeLeave`.',
  },
  {
    id: 'steps-orientation',
    title: 'Горизонтально и вертикально',
    description: 'Лента для шапки мастера и колонка для боковой панели.',
    status: 'ready',
    previewKey: 'gr-steps-orientation',
  },
  {
    id: 'steps-compact',
    title: 'Компактный вид',
    description: 'Семь этапов в узкой колонке: подпись, счётчик и полоса вместо ленты.',
    status: 'ready',
    previewKey: 'gr-steps-compact',
  },
]
