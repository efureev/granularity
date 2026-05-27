import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

export const grResponseErrorBannerConfig = defineGranularComponent(import.meta.url, {
  name: 'GrResponseErrorBanner',
  dependencies: ['GrAlert', 'GrButton'],
})
