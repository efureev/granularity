import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

import { grOtpInputSafelist } from './safelist'

export const grOtpInputConfig = defineGranularComponent(import.meta.url, {
  name: 'GrOtpInput',
  safelist: grOtpInputSafelist,
})
