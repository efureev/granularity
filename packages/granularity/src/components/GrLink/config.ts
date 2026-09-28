import { defineGranumComponent } from '@feugene/granum/contract'

import { grLinkSafelist } from './safelist'

/**
 * `dynamicTokens` — имена, которые собираются в рантайме: цвет тона читается как
 * `var(--gr-${tone}-text)`, и статический анализ видит от имени только префикс
 * `--gr-`. Объявление снимает находку `token-undefined` на этом префиксе и
 * сообщает обрезке токенов, что весь набор `-text` компоненту нужен.
 */
export const grLinkConfig = defineGranumComponent(import.meta.url, {
  name: 'GrLink',
  dependencies: ['GrIcon'],
  safelist: grLinkSafelist,
  dynamicTokens: [
    'gr-primary-text',
    'gr-success-text',
    'gr-warning-text',
    'gr-danger-text',
    'gr-info-text',
    'gr-slate-text',
    'gr-azure-text',
  ],
})
