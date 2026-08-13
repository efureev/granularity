import type { LocaleLoaderCollection } from '@feugene/fint-i18n/core'

import { GR_DASHBOARD_I18N_BLOCK } from './const'

export const es = {
  es: {
    [GR_DASHBOARD_I18N_BLOCK]: async () => import('../locales/es.json'),
  },
} satisfies LocaleLoaderCollection

export default es
