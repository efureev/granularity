import {defineGranularComponent} from '@feugene/unocss-preset-granular/contract'

import { dsFileUploadSafelist } from './safelist'

export const dsFileUploadConfig = defineGranularComponent(import.meta.url, {
  name: 'DsFileUpload',
  safelist: dsFileUploadSafelist,
})