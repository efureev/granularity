/**
 * Aggregated locale loaders for the Granularity package.
 *
 * Imported via the dedicated sub-path `@feugene/granularity/i18n/all`.
 * Use it ONLY in environments where bundle size is not a concern
 * (demos, Storybook, e2e, localization tooling).
 *
 * For production builds always prefer per-locale imports from
 * `@feugene/granularity/i18n` so unused languages can be tree-shaken away.
 *
 * ```ts
 * import all from '@feugene/granularity/i18n/all'
 *
 * createFintI18n({
 *   locale: 'en',
 *   fallbackLocale: 'en',
 *   loaders: all, // == [en, ru, es]
 * })
 * ```
 */
import type { LocaleLoaderCollection } from '@feugene/fint-i18n/core'

import { en } from './messages/en'
import { ru } from './messages/ru'
import { es } from './messages/es'

export const all: LocaleLoaderCollection[] = [en, ru, es]

export default all
