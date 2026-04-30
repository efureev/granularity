import type {LocaleLoaderCollection} from '@feugene/fint-i18n/core'
import {GRANULARITY_I18N_BLOCK} from "./const";

export const es: LocaleLoaderCollection = {
    es: {
        [GRANULARITY_I18N_BLOCK]: () => import('../locales/es.json'),
    },
}

export default es
