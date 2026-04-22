import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'
import { tokenDefinitionsFromCssSync } from '@feugene/unocss-preset-granular/node'
import { dsButtonSafelist } from './safelist'

const lightCssUrl = new URL('./themes/light.css', import.meta.url).href
const darkCssUrl = new URL('./themes/dark.css', import.meta.url).href

export const dsButtonConfig = defineGranularComponent(import.meta.url, {
  name: 'DsButton',
  safelist: dsButtonSafelist,
  tokenDefinitions: {
    light: tokenDefinitionsFromCssSync(lightCssUrl, { selector: ':root' }),
    dark: tokenDefinitionsFromCssSync(darkCssUrl, { as: '.dark, [data-theme="dark"]' }),
  },
})
