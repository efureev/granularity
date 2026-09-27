import { defineGranumComponent } from '@feugene/granum/contract'

export const grResponseErrorBannerConfig = defineGranumComponent(import.meta.url, {
  name: 'GrResponseErrorBanner',
  dependencies: ['GrAlert', 'GrButton'],
})
