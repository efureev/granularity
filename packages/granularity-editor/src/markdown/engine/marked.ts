import type { TokenizerAndRendererExtension } from 'marked'
import { Marked } from 'marked'

import { decodeEntities } from '../entities'
import { createSlugRegistry } from '../headings'
import { blockKey } from '../hash'
import { isExternalUrl, safeUrl } from '../linkPolicy'
import type {
  GrMarkdownEngine,
  GrMarkdownParseOptions,
  GrMdAlertTone,
  GrMdBlock,
  GrMdBlockNode,
  GrMdFootnote,
  GrMdInline,
  GrMdListItem,
  GrMdTableCell,
} from '../types'
import { footnoteExtensions } from './footnotes'

/**
 * Единственный модуль пакета, знающий `marked` в лицо.
 *
 * Всё остальное работает с нормализованным деревом, поэтому смена движка стоит
 * одного файла: интерфейс `GrMarkdownEngine` не упоминает ни одного его типа.
 */

interface RawToken {
  type: string
  raw: string
  [key: string]: unknown
}

/** Поля самого `marked`; расширению принадлежит всё остальное. */
const RESERVED_TOKEN_FIELDS = new Set(['type', 'raw', 'tokens', 'text', 'loose'])

function customData(token: RawToken): Record<string, unknown> {
  const data: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(token)) {
    if (!RESERVED_TOKEN_FIELDS.has(key))
      data[key] = value
  }
  return data
}

const ALERT_MARKER = /^>[ \t]*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\][ \t]*(?:\n|$)/i
const TASK_MARKER = /\[(?: |x)\]/i

/**
 * Окно поиска — ближайший вверх по дереву `raw`, который ещё является точным
 * куском исходника, вместе с его абсолютным офсетом.
 *
 * Складывать длины `raw` внутри блока нельзя: вложенный список приезжает от
 * `marked` без отступа, цитата — без `>`, и позиция, посчитанная накоплением,
 * разъезжается на всё снятое строками выше. Поэтому пункт ищется в окне
 * поиском, а курсор держит порядок, когда пункты совпадают текстом.
 */
interface SourceWindow {
  readonly raw: string
  readonly offset: number
  cursor: number
}

/** Первая строка пункта — единственная его часть, которая доживает до исходника без изменений. */
function firstLine(raw: string): string {
  const nl = raw.indexOf('\n')
  return nl === -1 ? raw : raw.slice(0, nl + 1)
}

/**
 * Снять начальный отступ.
 *
 * `marked` разворачивает табуляцию в пробелы, и отступ в `raw` вложенного
 * пункта не совпадает с исходником посимвольно. Сравнивать поэтому нужно
 * содержимое строки, а отступ перед ней разрешает `indexOfAtLineStart`.
 */
function stripIndent(value: string): string {
  return value.replace(/^[ \t]+/, '')
}

/**
 * Найти подстроку, стоящую в начале своей строки — с точностью до отступа.
 *
 * Пункт списка всегда начинается со строки, а совпадение посреди абзаца
 * означало бы офсет, указывающий в чужой текст.
 */
function indexOfAtLineStart(haystack: string, needle: string, from: number): number {
  for (let at = haystack.indexOf(needle, from); at !== -1; at = haystack.indexOf(needle, at + 1)) {
    let back = at - 1
    // Отступ и маркеры цитаты — всё, что вправе стоять перед пунктом на его строке.
    while (back >= 0 && (haystack[back] === ' ' || haystack[back] === '\t' || haystack[back] === '>'))
      back--
    if (back < 0 || haystack[back] === '\n')
      return at
  }
  return -1
}

interface Located {
  /** Абсолютный офсет в исходнике либо `-1`, если опоры нет. */
  offset: number
  /** Найденный текст — он же годится окном, потому что совпал с исходником. */
  raw: string
  /** `raw` нашёлся целиком — значит, внутри него можно искать дальше. */
  exact: boolean
}

function locate(win: SourceWindow | null, raw: string): Located {
  const whole = stripIndent(raw)
  if (!win)
    return { offset: -1, raw: whole, exact: false }

  const at = indexOfAtLineStart(win.raw, whole, win.cursor)
  if (at !== -1) {
    win.cursor = at + whole.length
    return { offset: win.offset + at, raw: whole, exact: true }
  }

  const line = stripIndent(firstLine(raw))
  const lineAt = line === '' ? -1 : indexOfAtLineStart(win.raw, line, win.cursor)
  if (lineAt === -1)
    return { offset: -1, raw: whole, exact: false }

  win.cursor = lineAt + line.length
  return { offset: win.offset + lineAt, raw: whole, exact: false }
}

interface Context {
  options: GrMarkdownParseOptions
  slug: (text: string) => string
  footnoteIndex: Map<string, number>
  footnoteDefs: Map<string, RawToken[]>
  /** Порядок первого упоминания — им нумеруются сноски. */
  footnoteOrder: string[]
}

function text(value: string): GrMdInline {
  return { type: 'text', value: decodeEntities(value) }
}

function inlineToPlainText(nodes: GrMdInline[]): string {
  let out = ''
  for (const node of nodes) {
    switch (node.type) {
      case 'text': out += node.value; break
      case 'codeSpan': out += node.value; break
      case 'image': out += node.alt; break
      case 'br': out += ' '; break
      case 'footnoteRef': break
      case 'custom': out += node.children.length > 0 ? inlineToPlainText(node.children) : node.raw; break
      case 'strong':
      case 'em':
      case 'del':
      case 'link': out += inlineToPlainText(node.children)
    }
  }
  return out
}

function normalizeInline(tokens: RawToken[] | undefined, ctx: Context): GrMdInline[] {
  if (!tokens)
    return []

  const out: GrMdInline[] = []
  for (const token of tokens) {
    const children = () => normalizeInline(token.tokens as RawToken[] | undefined, ctx)

    switch (token.type) {
      case 'text':
      case 'escape':
        // Вложенные токены есть, когда внутри текста нашлась разметка.
        out.push(...(token.tokens ? children() : [text(token.text as string)]))
        break
      case 'strong': out.push({ type: 'strong', children: children() }); break
      case 'em': out.push({ type: 'em', children: children() }); break
      case 'del': out.push({ type: 'del', children: children() }); break
      case 'codespan': out.push({ type: 'codeSpan', value: decodeEntities(token.text as string) }); break
      case 'br': out.push({ type: 'br' }); break
      case 'link': {
        const href = safeUrl(token.href as string, ctx.options.allowedProtocols)
        out.push({
          type: 'link',
          href,
          title: (token.title as string) ?? null,
          external: isExternalUrl(href),
          children: children(),
        })
        break
      }
      case 'image': {
        const alt = decodeEntities((token.text as string) ?? '')
        if (ctx.options.preset === 'minimal') {
          // Картинка в комментарии превращается в свою подпись, а не исчезает.
          if (alt)
            out.push(text(alt))
          break
        }
        out.push({
          type: 'image',
          src: safeUrl(token.href as string, ctx.options.allowedProtocols),
          alt,
          title: (token.title as string) ?? null,
        })
        break
      }
      case 'grFootnoteReference': {
        const label = token.label as string
        if (!ctx.footnoteIndex.has(label)) {
          ctx.footnoteOrder.push(label)
          ctx.footnoteIndex.set(label, ctx.footnoteOrder.length)
        }
        out.push({ type: 'footnoteRef', label, index: ctx.footnoteIndex.get(label)! })
        break
      }
      case 'html':
        if (ctx.options.html !== 'strip')
          out.push(text(token.raw))
        break
      default:
        // Токен чужого расширения. Раньше он превращался в свой же исходный
        // текст, и точка расширения, обещанная в доке, не работала вовсе.
        out.push({
          type: 'custom',
          name: token.type,
          raw: token.raw,
          data: customData(token),
          children: normalizeInline(token.tokens as RawToken[] | undefined, ctx),
        })
    }
  }
  return out
}

function alertToneOf(raw: string): GrMdAlertTone | null {
  const match = ALERT_MARKER.exec(raw)
  return match?.[1] ? (match[1].toLowerCase() as GrMdAlertTone) : null
}

/**
 * Снять строку `[!NOTE]` с первого абзаца цитаты.
 *
 * Маркер разбирается обычным текстом, поэтому он приезжает внутрь первого
 * инлайнового узла, а не отдельным токеном.
 */
function stripAlertMarker(children: GrMdBlockNode[]): GrMdBlockNode[] {
  const first = children[0]
  if (!first || first.type !== 'paragraph')
    return children

  const head = first.children[0]
  if (!head || head.type !== 'text')
    return children

  const rest = head.value.replace(/^\[![a-z]+\][ \t]*\n?/i, '')
  const inlines = rest === ''
    ? first.children.slice(1)
    : [{ type: 'text', value: rest } as GrMdInline, ...first.children.slice(1)]

  return inlines.length === 0
    ? children.slice(1)
    : [{ type: 'paragraph', children: inlines }, ...children.slice(1)]
}

function normalizeListItems(token: RawToken, ctx: Context, win: SourceWindow | null): GrMdListItem[] {
  const items = (token.items ?? []) as RawToken[]

  return items.map((item) => {
    const located = locate(win, item.raw)
    const itemOffset = located.offset

    const checked = typeof item.checked === 'boolean' ? item.checked : null
    let taskOffset: number | null = null
    if (checked !== null && itemOffset !== -1) {
      // По первой строке без отступа: `itemOffset` указывает на её начало,
      // и маркер может стоять только на ней.
      const marker = TASK_MARKER.exec(stripIndent(firstLine(item.raw)))
      if (marker)
        taskOffset = itemOffset + marker.index
    }

    // `checkbox` уже выражен полем `checked` — второй раз он не нужен.
    const inner = ((item.tokens ?? []) as RawToken[]).filter(t => t.type !== 'checkbox')
    // Своим окном пункт становится, только если нашёлся целиком: у пункта с
    // продолжением строки `raw` тоже без отступа, и опорой он быть не может.
    // Курсор — за первой строкой: иначе вложенный пункт находит маркер самого
    // родителя, когда текст у них совпадает.
    const innerWin = located.exact
      ? { raw: located.raw, offset: itemOffset, cursor: firstLine(located.raw).length }
      : win

    return { children: normalizeBlocks(inner, ctx, innerWin), checked, taskOffset }
  })
}

function normalizeTableCells(cells: RawToken[] | undefined, align: (string | null)[], ctx: Context): GrMdTableCell[] {
  return (cells ?? []).map((cell, index) => ({
    children: normalizeInline(cell.tokens as RawToken[] | undefined, ctx),
    align: (align[index] as GrMdTableCell['align']) ?? null,
  }))
}

function normalizeBlock(token: RawToken, ctx: Context, win: SourceWindow | null): GrMdBlockNode | null {
  switch (token.type) {
    case 'space':
    case 'def':
      return null

    case 'heading': {
      const children = normalizeInline(token.tokens as RawToken[], ctx)
      const plain = inlineToPlainText(children)
      return {
        type: 'heading',
        depth: token.depth as 1 | 2 | 3 | 4 | 5 | 6,
        id: ctx.slug(plain),
        text: plain,
        children,
      }
    }

    case 'paragraph':
      return { type: 'paragraph', children: normalizeInline(token.tokens as RawToken[], ctx) }

    // Пункт тесного списка: инлайн без обёртки абзацем.
    case 'text':
      return { type: 'inline', children: normalizeInline((token.tokens as RawToken[]) ?? [{ type: 'text', raw: token.raw, text: token.text }], ctx) }

    case 'code':
      return { type: 'code', lang: ((token.lang as string) || '').split(/\s+/)[0] || null, text: token.text as string }

    case 'blockquote': {
      const children = normalizeBlocks((token.tokens ?? []) as RawToken[], ctx, win)
      const tone = alertToneOf(token.raw)
      return tone
        ? { type: 'alert', tone, children: stripAlertMarker(children) }
        : { type: 'blockquote', children }
    }

    case 'list':
      return {
        type: 'list',
        ordered: Boolean(token.ordered),
        start: typeof token.start === 'number' ? token.start : 1,
        tight: !token.loose,
        items: normalizeListItems(token, ctx, win),
      }

    case 'table': {
      const align = (token.align ?? []) as (string | null)[]
      return {
        type: 'table',
        header: normalizeTableCells(token.header as RawToken[], align, ctx),
        rows: ((token.rows ?? []) as RawToken[][]).map(row => normalizeTableCells(row, align, ctx)),
      }
    }

    case 'hr':
      return { type: 'hr' }

    case 'html':
      return ctx.options.html === 'strip' ? null : { type: 'html', value: token.raw }

    case 'grFootnoteDefinition':
      ctx.footnoteDefs.set(token.label as string, (token.tokens ?? []) as RawToken[])
      return null

    default:
      if (!token.raw)
        return null
      return {
        type: 'custom',
        name: token.type,
        raw: token.raw,
        data: customData(token),
        children: normalizeBlocks((token.tokens ?? []) as RawToken[], ctx, win),
      }
  }
}

function normalizeBlocks(tokens: RawToken[], ctx: Context, win: SourceWindow | null): GrMdBlockNode[] {
  const out: GrMdBlockNode[] = []
  for (const token of tokens) {
    const node = normalizeBlock(token, ctx, win)
    if (node)
      out.push(node)
  }
  return out
}

function collectFootnotes(ctx: Context): GrMdFootnote[] {
  const items: GrMdFootnote[] = []
  for (const label of ctx.footnoteOrder) {
    const tokens = ctx.footnoteDefs.get(label)
    if (!tokens)
      continue
    items.push({
      label,
      index: ctx.footnoteIndex.get(label)!,
      // Опоры в исходнике у сноски нет: она разбирается вне основного потока.
      children: normalizeBlocks(tokens, ctx, null),
    })
  }
  return items
}

export interface GrMarkedEngineOptions {
  /**
   * Расширения `marked` — **только токенайзеры**.
   *
   * Их `renderer` не вызывается никогда: разметку строит наш `renderNodes` из
   * VNode, строки HTML в пакете не возникает вовсе. Новый тип токена приезжает
   * узлом `custom`, и рисует его компонент из пропа `components` по имени
   * токена. Так подключаются `marked-katex-extension`, `marked-emoji`,
   * `marked-directive` — без единой зависимости у самого пакета.
   */
  extensions?: TokenizerAndRendererExtension[]
}

export function createMarkedEngine(options: GrMarkedEngineOptions = {}): GrMarkdownEngine {
  const extensions = [...footnoteExtensions, ...(options.extensions ?? [])]
  const gfm = new Marked({ gfm: true, extensions })
  const strict = new Marked({ gfm: false, extensions })

  return {
    lex(source, options) {
      const commonmark = options.preset === 'commonmark' || options.preset === 'minimal'
      const tokens = (commonmark ? strict : gfm).lexer(source) as unknown as RawToken[]

      const ctx: Context = {
        options,
        slug: createSlugRegistry(options.idPrefix ?? ''),
        footnoteIndex: new Map(),
        footnoteDefs: new Map(),
        footnoteOrder: [],
      }

      const blocks: GrMdBlock[] = []
      let offset = 0

      for (const token of tokens) {
        const raw = token.raw ?? ''
        const node = normalizeBlock(token, ctx, { raw, offset, cursor: 0 })
        if (node) {
          blocks.push({
            // `id` заголовка в ключе: он зависит от заголовков выше, и без него
            // блок с изменившимся якорем не перерисовался бы.
            key: blockKey(node.type === 'heading' ? `${raw}#${node.id}` : raw),
            offset,
            end: offset + raw.length,
            node,
          })
        }
        offset += raw.length
      }

      const footnotes = collectFootnotes(ctx)
      if (footnotes.length > 0) {
        blocks.push({
          key: blockKey(footnotes.map(f => `${f.label}:${f.index}`).join('|')),
          offset: source.length,
          end: source.length,
          node: { type: 'footnotes', items: footnotes },
        })
      }

      return blocks
    },
  }
}

export const markedEngine = createMarkedEngine()
