import { defineGranumComponent } from '@feugene/granum/contract'

import { grDashboardItemSafelist } from './safelist'

/**
 * `GrCard` объявлен зависимостью потому, что виджет его **рендерит**: поверхность,
 * шапка и подвал уже есть в ядре, и своя копия разошлась бы с карточками
 * остального приложения.
 */
export const grDashboardItemConfig = defineGranumComponent(import.meta.url, {
  name: 'GrDashboardItem',
  group: 'GrDashboardFrame',
  safelist: grDashboardItemSafelist,
  dependencies: [{ provider: '@feugene/granularity', components: ['GrCard'] }],
  // Смещение перетаскивания и размер — инлайном ставит `GrDashboard` на время
  // жеста; слоем granum их не задаёт никто, и это не забытые токены.
  hookTokens: ['--gr-dashboard-drag-x', '--gr-dashboard-drag-y', '--gr-dashboard-resize-w', '--gr-dashboard-resize-h'],
})
