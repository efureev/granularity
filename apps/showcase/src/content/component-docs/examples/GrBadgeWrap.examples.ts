import type { ShowcaseComponentExampleDoc } from '../types'

export const grBadgeWrapExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'badge-wrap-counter',
    title: 'Numeric overlays on buttons and icons',
    description: 'Счётчик живёт поверх любого контрола и не требует менять его самого. `max` сворачивает крупные числа в «99+», `showZero` оставляет ноль на виду, `tone` и `placement` подбирают цвет и угол.',
    status: 'ready',
    previewKey: 'gr-badge-wrap-counter',
  },
  {
    id: 'badge-wrap-dot-status',
    title: 'Dot mode for attention indicators',
    description: 'Когда важно не количество, а сам факт нового события, точка работает легче. Она декоративна, пока ей не дали `aria-label` — тогда её слышит и скринридер.',
    status: 'ready',
    previewKey: 'gr-badge-wrap-dot-status',
  },
  {
    id: 'badge-wrap-live-count',
    title: 'Marking a count that just arrived',
    description: 'С `animate` счётчик отмечает «попом» то, о чём пользователь ещё не знает: своё появление и рост числа. Убыль молчит — это след его собственного действия. Пачка изменений даёт один «поп», а не пять: пока анимация играет, новое значение её не перезапускает.',
    status: 'ready',
    previewKey: 'gr-badge-wrap-live-count',
  },
  {
    id: 'badge-wrap-tab-notification',
    title: 'Navigation and tab decorations',
    description: 'Компонент работает через слот, поэтому счётчик вешается на вкладку, кнопку или пункт навигации без специального API на их стороне.',
    status: 'ready',
    previewKey: 'gr-badge-wrap-tab-notification',
  },
]
