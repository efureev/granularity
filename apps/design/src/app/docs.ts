import { marked, type Tokens } from 'marked'

import buttonComponent from '../../../../packages/granularity/docs/components/GrButton.md?raw'
import buttonDesign from '../../../../packages/granularity/docs/design/GrButton.md?raw'

/**
 * Тексты берутся из документации пакета сборкой, а не копируются: документ в
 * репозитории и страница приложения не могут разойтись. Дизайн версий —
 * `docs/design/*.md`, поведение компонента — `docs/components/*.md`.
 */
const designDocs: Record<string, string> = {
  button: buttonDesign,
}

const componentDocs: Record<string, string> = {
  button: buttonComponent,
}

/** «Четыре версии рядом», «Три версии рядом» — число зависит от компонента. */
const COMPARISON_HEADING = /версии рядом$/i

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

/** Таблица сравнения версий как данные: столбец выбранной версии подсвечивается. */
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
