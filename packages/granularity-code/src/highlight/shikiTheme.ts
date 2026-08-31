import { isGrCodeRole, type GrCodeRole } from './palette'
import { GR_CODE_ROLES } from './palette'

/**
 * Тема-метка для Shiki: определение нашей палитры, записанное на его языке.
 *
 * Зачем так. Токены Shiki несут **цвет, а не смысл**: `codeToTokensBase`
 * возвращает `{ content, color }`, где цвет пришёл из темы. Семантические
 * scope'ы доступны только с `includeExplanation`, и он документирован как
 * дорогой — на каждый токен приезжает разбор его области видимости.
 *
 * Поэтому мы отдаём Shiki тему, где каждой группе TextMate-scope'ов
 * сопоставлен **служебный цвет-метка**, по одному на роль, и разбираем цвет
 * обратно в роль. Разбор идёт обычным быстрым путём, а список scope'ов на
 * одиннадцать ролей — работа, которую всё равно кто-то обязан сделать, и лучше
 * один раз у нас, чем в каждом приложении.
 *
 * **Цвета отсюда на экран не попадают.** Красит наш CSS по роли — иначе код
 * стал бы единственным элементом страницы, не слушающимся темы приложения.
 */

/** Цвет-метка роли: `#000001` для первой роли, `#00000b` для одиннадцатой. */
export function markerFor(role: GrCodeRole): string {
  const index = GR_CODE_ROLES.indexOf(role)

  return `#${(index + 1).toString(16).padStart(6, '0')}`
}

const ROLE_BY_MARKER: Record<string, GrCodeRole> = Object.fromEntries(
  GR_CODE_ROLES.map(role => [markerFor(role), role]),
)

/**
 * Цвет-метка обратно в роль.
 *
 * Не метка — `plain`: у токена может не быть цвета вовсе (Shiki не всё
 * раскрашивает), и терять такой текст нельзя.
 */
export function roleForMarker(color: string | undefined): GrCodeRole {
  if (!color)
    return 'plain'

  const role = ROLE_BY_MARKER[color.toLowerCase()]

  return isGrCodeRole(role) ? role : 'plain'
}

/**
 * Scope'ы TextMate по ролям.
 *
 * Порядок внутри роли значения не имеет, между ролями — имеет: TextMate
 * выбирает правило по длине совпавшего scope'а, поэтому `keyword.operator`
 * (пунктуация) выигрывает у `keyword` (ключевое слово), а не наоборот.
 */
const SCOPES: Record<Exclude<GrCodeRole, 'plain'>, string[]> = {
  key: [
    'support.type.property-name',
    'meta.object-literal.key',
    'entity.name.tag.yaml',
    'variable.other.object.property',
  ],
  string: ['string', 'string.quoted', 'constant.other.symbol'],
  number: ['constant.numeric'],
  literal: ['constant.language', 'constant.character'],
  punctuation: ['punctuation', 'keyword.operator', 'meta.brace'],
  keyword: ['keyword', 'storage', 'storage.type', 'storage.modifier', 'keyword.control'],
  comment: ['comment', 'punctuation.definition.comment'],
  type: ['entity.name.type', 'entity.name.class', 'support.type', 'support.class'],
  function: ['entity.name.function', 'support.function', 'meta.function-call'],
  variable: ['variable', 'variable.other', 'variable.parameter', 'entity.name.variable'],
}

/**
 * Тема в формате Shiki. `type: 'dark'` выбран произвольно и ни на что не
 * влияет: цвета отсюда служебные, а настоящие приходят из наших токенов.
 */
export const GR_CODE_SHIKI_THEME = {
  name: 'granularity-code-marker',
  type: 'dark' as const,
  colors: {
    'editor.foreground': markerFor('plain'),
    'editor.background': '#000000',
  },
  settings: [
    { settings: { foreground: markerFor('plain') } },
    ...Object.entries(SCOPES).map(([role, scopes]) => ({
      scope: scopes,
      settings: { foreground: markerFor(role as GrCodeRole) },
    })),
  ],
}
