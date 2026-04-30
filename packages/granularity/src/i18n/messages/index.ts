/**
 * Per-locale entry points for the Granularity package.
 *
 * Each locale lives in its own module and is re-exported by name so that
 * bundlers can tree-shake unused languages out of the final build.
 *
 * Usage from the consumer side:
 *
 * ```ts
 * import { en, ru } from '@feugene/granularity/i18n'
 *
 * createFintI18n({
 *   locale: 'en',
 *   fallbackLocale: 'en',
 *   loaders: [en, ru],
 * })
 * ```
 *
 * If you really need every locale at once (demos, e2e, tooling), import
 * the dedicated aggregate sub-path instead — `@feugene/granularity/i18n/all`.
 */
export { GRANULARITY_I18N_BLOCK } from './const'
export { en } from './en'
export { ru } from './ru'
export { es } from './es'
