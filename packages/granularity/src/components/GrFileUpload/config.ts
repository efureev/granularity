import { defineGranumComponent } from '@feugene/granum/contract'

import { grFileUploadSafelist } from './safelist'

export const grFileUploadConfig = defineGranumComponent(import.meta.url, {
  name: 'GrFileUpload',
  dependencies: ['GrIcon', 'GrProgressBar'],
  safelist: grFileUploadSafelist,
})
