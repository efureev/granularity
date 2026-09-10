/**
 * Нормализованное дерево markdown — то, что видит рендерер.
 *
 * Своё, а не токены `marked`: движок объявлен подменяемым (`GrMarkdownEngine`),
 * и дерево, повторяющее чужую форму, привязало бы к ней и рендерер, и тесты.
 */

export type GrMdAlertTone = 'note' | 'tip' | 'important' | 'warning' | 'caution'

export type GrMdAlign = 'left' | 'center' | 'right' | null

export type GrMdInline
  = | { type: 'text', value: string }
    | { type: 'strong', children: GrMdInline[] }
    | { type: 'em', children: GrMdInline[] }
    | { type: 'del', children: GrMdInline[] }
    | { type: 'codeSpan', value: string }
    | { type: 'link', href: string | null, title: string | null, external: boolean, children: GrMdInline[] }
    | { type: 'image', src: string | null, alt: string, title: string | null }
    | { type: 'br' }
    | { type: 'footnoteRef', label: string, index: number }
  /**
   * Токен чужого расширения `marked`. Рендерер ищет его по `name` в пропе
   * `components`; не нашёл — печатает `raw` текстом, как и раньше.
   */
    | { type: 'custom', name: string, raw: string, data: Record<string, unknown>, children: GrMdInline[] }

export interface GrMdListItem {
  children: GrMdBlockNode[]
  /** `null` — обычный пункт, иначе список задач. */
  checked: boolean | null
  /** Офсет маркера `[ ]` в исходнике: по нему приложение перепишет сам markdown. */
  taskOffset: number | null
}

export interface GrMdTableCell {
  children: GrMdInline[]
  align: GrMdAlign
}

export interface GrMdFootnote {
  label: string
  index: number
  children: GrMdBlockNode[]
}

export type GrMdBlockNode
  = | { type: 'heading', depth: 1 | 2 | 3 | 4 | 5 | 6, id: string, text: string, children: GrMdInline[] }
    | { type: 'paragraph', children: GrMdInline[] }
  /**
   * Инлайновый ряд без обёртки абзацем — содержимое пункта тесного списка.
   * Без этого узла тесный список пришлось бы рисовать абзацем, и он раздулся бы
   * ровно тем отступом, отсутствие которого его и определяет.
   */
    | { type: 'inline', children: GrMdInline[] }
    | { type: 'code', lang: string | null, text: string }
    | { type: 'blockquote', children: GrMdBlockNode[] }
    | { type: 'alert', tone: GrMdAlertTone, children: GrMdBlockNode[] }
    | { type: 'list', ordered: boolean, start: number, tight: boolean, items: GrMdListItem[] }
    | { type: 'table', header: GrMdTableCell[], rows: GrMdTableCell[][] }
    | { type: 'hr' }
  /** Сырой HTML. Разметкой не становится никогда — только текстом либо ничем. */
    | { type: 'html', value: string }
    | { type: 'footnotes', items: GrMdFootnote[] }
  /** Блочный токен чужого расширения. Правила те же, что у инлайнового. */
    | { type: 'custom', name: string, raw: string, data: Record<string, unknown>, children: GrMdBlockNode[] }

export interface GrMdBlock {
  /**
   * Ключ кэша VNode. Считается от исходного текста блока, **не от индекса**:
   * вставка абзаца в начало документа не должна инвалидировать хвост.
   */
  key: string
  /** Границы блока в исходнике — для `taskToggle` и синхронизации с редактором. */
  offset: number
  end: number
  node: GrMdBlockNode
}

export interface GrMdHeading {
  id: string
  level: number
  text: string
}

export type GrMdHtmlMode = 'escape' | 'strip'

export interface GrMarkdownParseOptions {
  /** Что делать с сырым HTML. Рендера в разметку нет ни при каком значении. */
  html?: GrMdHtmlMode
  /** Разрешённые протоколы ссылок и картинок. */
  allowedProtocols?: readonly string[]
  /** Префикс `id` заголовков и сносок — когда документов на странице несколько. */
  idPrefix?: string
  /** Выключить таблицы, картинки и блоки кода. */
  preset?: 'gfm' | 'commonmark' | 'minimal'
}

/**
 * Движок разбора. Пакет объявляет потребность, а не поставщика: за интерфейсом
 * стоит `marked`, но remark или свой парсер встают на его место, не заставляя
 * трогать ни рендерер, ни компонент.
 */
export interface GrMarkdownEngine {
  lex: (source: string, options: GrMarkdownParseOptions) => GrMdBlock[]
}
