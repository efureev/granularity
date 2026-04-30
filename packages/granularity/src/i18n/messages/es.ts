import type {LocaleLoaderCollection} from '@feugene/fint-i18n/core'
import {GRANULARITY_I18N_BLOCK} from "./const";

export const es = {
    es: {
        [GRANULARITY_I18N_BLOCK]: () => import('../locales/es.json'),
    },
} satisfies LocaleLoaderCollection

export default es
