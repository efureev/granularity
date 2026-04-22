import {defineGranularComponent} from '@feugene/unocss-preset-granular/contract'

import { dsProgressBarSafelist } from './safelist'
import {tokenDefinitionsFromCssSync} from "@feugene/unocss-preset-granular/node";

const lightCssUrl = new URL('./themes/light.css', import.meta.url).href
const darkCssUrl = new URL('./themes/dark.css', import.meta.url).href

export const dsProgressBarConfig = defineGranularComponent(import.meta.url, {
  name: 'DsProgressBar',
  safelist: dsProgressBarSafelist,
  tokenDefinitions: {
    light: tokenDefinitionsFromCssSync(lightCssUrl, { selector: ':root' }),
    dark: tokenDefinitionsFromCssSync(darkCssUrl, { as: '.dark, [data-theme="dark"]' }),
  },
})