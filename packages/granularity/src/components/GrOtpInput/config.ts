import { defineGranumComponent } from '@feugene/granum/contract'

import { grOtpInputSafelist } from './safelist'

export const grOtpInputConfig = defineGranumComponent(import.meta.url, {
  name: 'GrOtpInput',
  safelist: grOtpInputSafelist,
})
