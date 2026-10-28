import { marked, type Tokens } from 'marked'

/**
 * Тексты берутся из документации пакета сборкой, а не копируются: документ в
 * репозитории и страница приложения не могут разойтись. Компонент в темах
 * каталога — `docs/design/*.md`, поведение компонента — `docs/components/*.md`
 * ядра и спутников; ключ — имя компонента (`GrButton`, `GrCalendar`): имена уникальны
 * во всей экосистеме.
 */
function byComponent(sources: Record<string, string>): Record<string, string> {
  return Object.fromEntries(Object.entries(sources).map(([path, source]) => [path.slice(path.lastIndexOf('/') + 1, -'.md'.length), source]))
}

const designDocs = byComponent(import.meta.glob<string>('../../../../packages/granularity/docs/design/Gr*.md', { query: '?raw', import: 'default', eager: true }))
const componentDocs = byComponent({
  ...import.meta.glob<string>('../../../../packages/granularity/docs/components/Gr*.md', { query: '?raw', import: 'default', eager: true }),
  ...import.meta.glob<string>('../../../../packages/granularity-*/docs/components/Gr*.md', { query: '?raw', import: 'default', eager: true }),
})

/** «Четыре темы рядом» — число растёт вместе с каталогом. */
const COMPARISON_HEADING = /темы рядом$/i

export interface DesignDoc {
  intro: string
  sections: Map<string, string>
}

export function splitSections(markdown: string): DesignDoc {
  const [head = '', ...rest] = markdown.split(/^## /m)
  const sections = new Map<string, string>()

  for (const chunk of rest) {
    const newline = chunk.indexOf('\n')
    sections.set(chunk.slice(0, newline).trim(), chunk.slice(newline + 1).trim())
  }

  return { intro: head.replace(/^# .*$/m, '').trim(), sections }
}

export function designDoc(name: string): DesignDoc | undefined {
  const markdown = designDocs[name]
  return markdown ? splitSections(markdown) : undefined
}

export function componentDoc(name: string): DesignDoc | undefined {
  const markdown = componentDocs[name]
  return markdown ? splitSections(markdown) : undefined
}

/** Строка документа без разметки: код — как текст, ссылка — её текст. */
export function plainText(markdown: string): string {
  return markdown
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
}

export interface ComparisonTable {
  columns: string[]
  rows: { label: string, cells: string[] }[]
}

/**
 * Раздел темы в документе дизайна: заголовок кончается её id — «Чертёж — тема
 * `blueprint`». По id, а не по названию: название темы переводится и правится.
 */
export function themeDocSection(doc: DesignDoc, themeId: string): string | undefined {
  const suffix = `тема \`${themeId}\``
  return [...doc.sections].find(([heading]) => heading.endsWith(suffix))?.[1]
}

/** Таблица сравнения тем как данные: столбец выбранной темы подсвечивается. */
export function comparisonTable(doc: DesignDoc): ComparisonTable | undefined {
  const section = [...doc.sections].find(([heading]) => COMPARISON_HEADING.test(heading))?.[1]
  if (!section)
    return undefined

  const table = marked.lexer(section).find((token): token is Tokens.Table => token.type === 'table')
  if (!table)
    return undefined

  return {
    columns: table.header.slice(1).map(cell => cell.text),
    rows: table.rows.map(row => ({
      label: row[0]?.text ?? '',
      cells: row.slice(1).map(cell => cell.text),
    })),
  }
}

/**
 * Ссылки документа ведут по файлам репозитория (`../tokens.md`) — в приложении
 * им некуда вести, поэтому остаётся текст ссылки.
 */
const renderer = new marked.Renderer()
renderer.link = function ({ tokens }) {
  return this.parser.parseInline(tokens)
}

export function renderMarkdown(markdown: string): string {
  return marked.parse(markdown, { async: false, renderer })
}

export function renderInline(markdown: string): string {
  return marked.parseInline(markdown, { async: false, renderer })
}

/** Строка таблицы сравнения по столбцам: название темы → ячейка. */
export function comparisonRow(table: ComparisonTable, label: string): ReadonlyMap<string, string> | undefined {
  const row = table.rows.find(item => item.label === label)
  return row ? new Map(table.columns.map((column, index) => [column, row.cells[index] ?? ''])) : undefined
}
