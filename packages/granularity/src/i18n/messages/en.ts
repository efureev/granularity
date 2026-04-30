import type {LocaleLoaderCollection} from '@feugene/fint-i18n/core'
import {GRANULARITY_I18N_BLOCK} from "./const";

/**
 * English locale loaders for the playground app.
 *
 * Exported separately from other locales so that consumers (and bundlers)
 * can import only the languages they actually need — see the
 * "Authoring localization packages" guide in the docs.
 */
export const en: LocaleLoaderCollection = {
    en: {
        [GRANULARITY_I18N_BLOCK]: () => import('../locales/en.json'),
    },
}

export default en
