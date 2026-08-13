import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

import { grDashboardSafelist } from './safelist'

/**
 * `group` — штатный механизм пресета под общие SFC: шаблоны рамы
 * (`GrDashboardFrame/shared/**`) не лежат ни в одной директории компонента, и
 * без него их классы молча выпали бы из CSS. Пресет добавит в скан
 * `dist/groups/GrDashboardFrame/shared/`.
 */
export const grDashboardConfig = defineGranularComponent(import.meta.url, {
  name: 'GrDashboard',
  group: 'GrDashboardFrame',
  safelist: grDashboardSafelist,
})
