import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

import { grDashboardItemSettingsSafelist } from './safelist'

export const grDashboardItemSettingsConfig = defineGranularComponent(import.meta.url, {
  name: 'GrDashboardItemSettings',
  group: 'GrDashboardFrame',
  safelist: grDashboardItemSettingsSafelist,
  dependencies: [{
    provider: '@feugene/granularity',
    components: ['GrDialog', 'GrButton', 'GrFormField', 'GrNumberInput'],
  }],
})
