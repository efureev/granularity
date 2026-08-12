import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

import { grCalendarSafelist } from './safelist'

export const grCalendarConfig = defineGranularComponent(import.meta.url, {
  name: 'GrCalendar',
  safelist: grCalendarSafelist,
})
