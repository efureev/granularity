/**
 * Локали пакета в форме, которую понимает `fint-i18n`.
 *
 * Блок — свой (`grCode`), а не `gr` ядра: чужой блок companion-пакету брать
 * нельзя, иначе словари столкнутся на первом же совпавшем верхнем ключе. Ключи
 * компонентов выглядят как `grCode.block.copy`.
 *
 * Нужны все языки разом (демо, e2e, инструменты) — есть агрегат
 * `@feugene/granularity-code/i18n/all`.
 */
export { GR_CODE_I18N_BLOCK } from './const'
export { en } from './en'
export { es } from './es'
export { ru } from './ru'
