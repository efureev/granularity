import { isGrCodeRole, type GrCodeRole } from './palette'

/**
 * Мост от подсветки CodeMirror к нашим ролям.
 *
 * CodeMirror красит через `HighlightStyle`, где каждому тегу Lezer сопоставлен
 * класс. Мы сопоставляем классы `gr-code-<role>` — тогда цвет приходит из тех
 * же токенов, что у блока и диффа, а готовая тема CodeMirror не берётся вовсе.
 *
 * Модуль **не импортирует CodeMirror**: он отдаёт только имена классов и разбор
 * обратно. Сборка `HighlightStyle` живёт в компоненте редактора — там, где CM6
 * уже подключён как peer.
 */

/** Имя класса роли. Одно на пакет: блок, дифф и редактор красятся им же. */
export function classForRole(role: GrCodeRole): string {
  return `gr-code-${role}`
}

/** Класс обратно в роль. Чужой класс — `plain`, а не исключение. */
export function roleForClass(className: string): GrCodeRole {
  const role = className.startsWith('gr-code-') ? className.slice('gr-code-'.length) : ''

  return isGrCodeRole(role) ? role : 'plain'
}

/**
 * Имена тегов Lezer по ролям — строками, а не значениями `@lezer/highlight`.
 *
 * Строками именно потому, что модуль не тянет CodeMirror: компонент редактора
 * разворачивает их в теги сам, когда библиотека уже есть. Имена — из
 * `@lezer/highlight`, где `tags` это плоский объект.
 */
export const LEZER_TAGS_BY_ROLE: Record<Exclude<GrCodeRole, 'plain'>, string[]> = {
  key: ['propertyName', 'attributeName'],
  string: ['string', 'special(string)'],
  number: ['number', 'integer', 'float'],
  literal: ['bool', 'null', 'atom'],
  punctuation: ['punctuation', 'separator', 'bracket', 'operator'],
  keyword: ['keyword', 'controlKeyword', 'moduleKeyword', 'definitionKeyword'],
  comment: ['comment', 'lineComment', 'blockComment', 'docComment'],
  type: ['typeName', 'className', 'namespace'],
  function: ['function(variableName)', 'function(propertyName)'],
  variable: ['variableName', 'labelName'],
}
