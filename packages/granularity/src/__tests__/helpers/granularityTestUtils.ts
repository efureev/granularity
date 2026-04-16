import { Buffer } from 'node:buffer'
import { readFileSync } from 'node:fs'

export const lightAppBaseFile = '../../apps/playground/src/styles/base.css'
export const lightAppTokensFile = '../../apps/playground/src/styles/tokens.css'
export const lightAppThemeFile = '../../apps/playground/src/styles/light-app.css'
export const granularityDirectivesIndexSource = readFileSync('src/directives/index.ts', 'utf8')
export const granularityViteConfigSource = readFileSync('vite.config.ts', 'utf8')
export const inlineBaseCssDataUrl = `data:text/css;base64,${Buffer.from(':root { --inline-base: 1; }').toString('base64')}`
export const inlineTokensCssDataUrl = `data:text/css,${encodeURIComponent(':root { --inline-token: 1; }')}`
export const inlineThemeCssDataUrl = `data:text/css;base64,${Buffer.from("[data-theme='inline'] { --inline-theme: 1; }").toString('base64')}`

export function normalizeCss(css: string): string {
  return css.replace(/\s+/g, '')
}