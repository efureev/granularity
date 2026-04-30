import type {LocaleLoaderCollection} from '@feugene/fint-i18n/core'
import {GRANULARITY_I18N_BLOCK} from "./const";

export const ru: LocaleLoaderCollection = {
    ru: {
        [GRANULARITY_I18N_BLOCK]: () => import('../locales/ru.json'),
    },
}

export default ru
