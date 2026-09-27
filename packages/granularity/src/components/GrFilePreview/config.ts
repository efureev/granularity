import { defineGranumComponent } from '@feugene/granum/contract'

import { grFilePreviewSafelist } from './safelist'

export const grFilePreviewConfig = defineGranumComponent(import.meta.url, {
  name: 'GrFilePreview',
  dependencies: ['GrSkeleton'],
  safelist: grFilePreviewSafelist,
})
