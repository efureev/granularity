import { defineGranumComponent } from '@feugene/granum/contract'

import { grCalendarSafelist } from './safelist'

export const grCalendarConfig = defineGranumComponent(import.meta.url, {
  name: 'GrCalendar',
  safelist: grCalendarSafelist,
})
