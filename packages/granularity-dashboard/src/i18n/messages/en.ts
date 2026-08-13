import type { LocaleLoaderCollection } from '@feugene/fint-i18n/core'

import { GR_DASHBOARD_I18N_BLOCK } from './const'

export const en = {
  en: {
    [GR_DASHBOARD_I18N_BLOCK]: async () => import('../locales/en.json'),
  },
} satisfies LocaleLoaderCollection

export default en
