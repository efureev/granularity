// <granularity:components> — блок генерируется `yarn generate:registry`
export * from './components/GrCodeBlock'
export * from './components/GrCodeEditor'
export * from './components/GrDiff'
// </granularity:components>

// Палитра и контракт подсветки. Публичны намеренно: подключить Shiki, Prism
// или серверную подсветку потребитель обязан уметь без доступа к внутренностям.
export type { GrCodeLine, GrCodeRole, GrCodeToken, GrCodeTokenizer } from './highlight'
export {
  classForRole,
  createShikiTokenizer,
  GR_CODE_HIGHLIGHTER_KEY,
  GR_CODE_ROLES,
  GR_CODE_SHIKI_THEME,
  isGrCodeRole,
  LEZER_TAGS_BY_ROLE,
  markerFor,
  plainLines,
  roleForClass,
  roleForMarker,
} from './highlight'
export type { ShikiLike } from './highlight'

// Строки интерфейса пакета.
export type { GrCodeLocale } from './i18n'
export { grCodeMessages } from './i18n'
