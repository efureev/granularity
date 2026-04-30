import {defineGranularComponent} from '@feugene/unocss-preset-granular/contract'

import { grProgressBarSafelist } from './safelist'
import {tokenDefinitionsFromCssSync} from "@feugene/unocss-preset-granular/node";

const lightCssUrl = new URL('./themes/light.css', import.meta.url).href
const darkCssUrl = new URL('./themes/dark.css', import.meta.url).href

export const grProgressBarConfig = defineGranularComponent(import.meta.url, {
  name: 'GrProgressBar',
  safelist: grProgressBarSafelist,
  tokenDefinitions: {
    light: tokenDefinitionsFromCssSync(lightCssUrl, { selector: ':root' }),
    dark: tokenDefinitionsFromCssSync(darkCssUrl, { as: '.dark, [data-theme="dark"]' }),
  },
})