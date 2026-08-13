import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

import { grDashboardItemSafelist } from './safelist'

/**
 * `GrCard` объявлен зависимостью потому, что виджет его **рендерит**: поверхность,
 * шапка и подвал уже есть в ядре, и своя копия разошлась бы с карточками
 * остального приложения.
 */
export const grDashboardItemConfig = defineGranularComponent(import.meta.url, {
  name: 'GrDashboardItem',
  group: 'GrDashboardFrame',
  safelist: grDashboardItemSafelist,
  dependencies: [{ provider: '@feugene/granularity', components: ['GrCard'] }],
})
