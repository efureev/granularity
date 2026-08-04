import {defineGranularComponent} from '@feugene/unocss-preset-granular/contract'

import { grTabsSafelist } from './safelist'

export const grTabsConfig = defineGranularComponent(import.meta.url, {
    name: 'GrTabs',
    safelist: grTabsSafelist,
})
