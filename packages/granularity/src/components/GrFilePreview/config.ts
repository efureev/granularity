import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

import { grFilePreviewSafelist } from './safelist'

export const grFilePreviewConfig = defineGranularComponent(import.meta.url, {
  name: 'GrFilePreview',
  safelist: grFilePreviewSafelist,
})
