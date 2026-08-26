/**
 * Локали пакета в форме, которую понимает `fint-i18n`.
 *
 * Блок — свой (`grEditor`), а не `gr` ядра: чужой блок companion-пакету брать
 * нельзя, иначе словари столкнутся на первом же совпавшем верхнем ключе. Ключи
 * компонентов выглядят как `grEditor.richText.toolbar`.
 *
 * ```ts
 * import { en, ru, GR_EDITOR_I18N_BLOCK } from '@feugene/granularity-editor/i18n'
 * import { GRANULARITY_I18N_BLOCK, en as coreEn, ru as coreRu } from '@feugene/granularity/i18n'
 *
 * const i18n = createFintI18n({ locale: 'ru', loaders: [coreEn, coreRu, en, ru] })
 * i18n.registerBlocks([GRANULARITY_I18N_BLOCK, GR_EDITOR_I18N_BLOCK])
 * ```
 *
 * Нужны все языки разом (демо, e2e, инструменты) — есть агрегат
 * `@feugene/granularity-editor/i18n/all`.
 */
export { GR_EDITOR_I18N_BLOCK } from './const'
export { en } from './en'
export { es } from './es'
export { ru } from './ru'
