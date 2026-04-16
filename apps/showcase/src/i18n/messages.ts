import type { LocaleLoaderCollection } from '@feugene/fint-i18n/core'

export const SHOWCASE_I18N_BLOCK = 'showcase'

export const showcaseLocaleLoaders = {
  en: {
    [SHOWCASE_I18N_BLOCK]: () => import('./locales/en/showcase.json'),
    ['components.DsButton']: () => import('./locales/en/components/DsButton.json'),
  },
  ru: {
    [SHOWCASE_I18N_BLOCK]: () => import('./locales/ru/showcase.json'),
    ['components.DsButton']: () => import('./locales/ru/components/DsButton.json'),
  },
} satisfies LocaleLoaderCollection
