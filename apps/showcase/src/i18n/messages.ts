import type { LocaleLoaderCollection } from '@feugene/fint-i18n/core'

export const SHOWCASE_I18N_BLOCK = 'showcase'

export const showcaseLocaleLoaders = {
  en: {
    [SHOWCASE_I18N_BLOCK]: () => import('./locales/en/showcase.json'),
    ['components.GrButton']: () => import('./locales/en/components/GrButton.json'),
    ['components.GrResponseErrorBanner']: () => import('./locales/en/components/GrResponseErrorBanner.json'),
  },
  ru: {
    [SHOWCASE_I18N_BLOCK]: () => import('./locales/ru/showcase.json'),
    ['components.GrButton']: () => import('./locales/ru/components/GrButton.json'),
    ['components.GrResponseErrorBanner']: () => import('./locales/ru/components/GrResponseErrorBanner.json'),
  },
} satisfies LocaleLoaderCollection
