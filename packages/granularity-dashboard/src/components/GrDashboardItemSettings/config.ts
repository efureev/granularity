import { defineGranumComponent } from '@feugene/granum/contract'

import { grDashboardItemSettingsSafelist } from './safelist'

export const grDashboardItemSettingsConfig = defineGranumComponent(import.meta.url, {
  name: 'GrDashboardItemSettings',
  group: 'GrDashboardFrame',
  safelist: grDashboardItemSettingsSafelist,
  dependencies: [{
    provider: '@feugene/granularity',
    components: ['GrDialog', 'GrButton', 'GrFormField', 'GrNumberInput'],
  }],
})
