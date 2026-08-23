/**
 * Локали пакета в форме, которую понимает `fint-i18n`.
 *
 * Блок — свой (`grMedia`), а не `gr` ядра: чужой блок companion-пакету брать
 * нельзя, иначе словари столкнутся на первом же совпавшем верхнем ключе. Ключи
 * компонентов выглядят как `grMedia.imageCrop.apply`.
 *
 * ```ts
 * import { en, GR_MEDIA_I18N_BLOCK, ru } from '@feugene/granularity-media/i18n'
 * import { en as coreEn, GRANULARITY_I18N_BLOCK, ru as coreRu } from '@feugene/granularity/i18n'
 *
 * const i18n = createFintI18n({ locale: 'ru', loaders: [coreEn, coreRu, en, ru] })
 * i18n.registerBlocks([GRANULARITY_I18N_BLOCK, GR_MEDIA_I18N_BLOCK])
 * ```
 *
 * Нужны все языки разом (демо, e2e, инструменты) — есть агрегат
 * `@feugene/granularity-media/i18n/all`.
 */
export { GR_MEDIA_I18N_BLOCK } from './const'
export { en } from './en'
export { es } from './es'
export { ru } from './ru'
