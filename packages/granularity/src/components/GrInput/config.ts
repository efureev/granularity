import { defineGranumComponent } from '@feugene/granum/contract'
import { grInputSafelist } from './safelist'

export const grInputConfig = defineGranumComponent(import.meta.url, {
  name: 'GrInput',
  safelist: grInputSafelist,
})
