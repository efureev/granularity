import { marked, type Tokens } from 'marked'

import buttonComponent from '../../../../packages/granularity/docs/components/GrButton.md?raw'
import buttonDesign from '../../../../packages/granularity/docs/design/GrButton.md?raw'

/**
 * Тексты берутся из документации пакета сборкой, а не копируются: документ в
 * репозитории и страница приложения не могут разойтись. Компонент в темах
 * каталога — `docs/design/*.md`, поведение компонента — `docs/components/*.md`.
 */
const designDocs: Record<string, string> = {
  button: buttonDesign,
}

const componentDocs: Record<string, string> = {
  button: buttonComponent,
}

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

export function designDoc(componentId: string): DesignDoc | undefined {
  const markdown = designDocs[componentId]
  return markdown ? splitSections(markdown) : undefined
}

export function componentDoc(componentId: string): DesignDoc | undefined {
  const markdown = componentDocs[componentId]
  return markdown ? splitSections(markdown) : undefined
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
