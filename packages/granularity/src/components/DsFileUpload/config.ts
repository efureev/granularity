import { defineGranularityComponentConfig } from '../../registry/componentConfig'

import { dsFileUploadSafelist } from './safelist'

export const dsFileUploadConfig = defineGranularityComponentConfig(import.meta.url, {
  name: 'DsFileUpload',
  safelist: dsFileUploadSafelist,
})