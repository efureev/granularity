import type { LocaleLoaderCollection } from '@feugene/fint-i18n/core'

import { GR_CHRONO_I18N_BLOCK } from './const'

export const ru = {
  ru: {
    [GR_CHRONO_I18N_BLOCK]: async () => import('../locales/ru.json'),
  },
} satisfies LocaleLoaderCollection

export default ru
