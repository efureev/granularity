/**
 * Подсветка кода: палитра, контракт и мосты к производителям.
 *
 * Подпуть `@feugene/granularity-code/highlight` — чистые модули без Vue и без
 * CodeMirror, поэтому берутся и без компонентов: собрать токенизатор для
 * своего рендера или для отчёта.
 */
export type { GrCodeLine, GrCodeRole, GrCodeToken, GrCodeTokenizer } from './palette'
export { GR_CODE_ROLES, isGrCodeRole, plainLines } from './palette'

export { GR_CODE_HIGHLIGHTER_KEY } from './key'

export type { ShikiLike } from './fromShiki'
export { createShikiTokenizer } from './fromShiki'
export { GR_CODE_SHIKI_THEME, markerFor, roleForMarker } from './shikiTheme'

export { classForRole, LEZER_TAGS_BY_ROLE, roleForClass } from './fromLezer'

// Встроенный разбор — тот же, которым красят блок, серверная разметка редактора
// и мост в декорации CodeMirror. Открыт затем, чтобы приложение могло дополнить
// его своим языком, не переписывая разбор JSON заново.
export { builtInLine, builtInLines, builtInLineTokenizer } from './builtIn'
export { tokenizeJson } from './tokenizeJson'
