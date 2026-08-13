import { readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'

import { describe, expect, it } from 'vitest'

/**
 * Гейт на самый тихий баг графиков: **SVG не красится `color`**.
 *
 * `text-[var(--gr-fg)]` на `<text>` или `<path>` выглядит как остальной пакет,
 * проходит и `styleTokens`, и типы, и сборку — а рисунок остаётся чёрным в
 * тёмной теме, потому что фигуры красятся `fill` и `stroke`. Ни один
 * существующий гейт этого класса не ловит: для него это законная утилита с
 * законным токеном.
 *
 * Поэтому правило от разметки: каждая рисующая фигура обязана нести `fill`
 * либо `stroke` — атрибутом, а не классом.
 */

const componentsDir = resolve(process.cwd(), 'src/components')

/** Фигуры, у которых заливка и обводка имеют смысл. */
const PAINTED = /<(path|text|line|circle|rect|polyline|polygon|ellipse)\b([^>]*)>/g

/** Разметочные элементы: у них краска не нужна и не должна требоваться. */
const STRUCTURAL = /^(?:g|svg|defs|clipPath|title|desc)$/

/**
 * Из разбора выбрасываются комментарии и содержимое `<defs>`.
 *
 * В комментариях те же теги встречаются в прозе — гейт ловил бы объяснение
 * решения как нарушение. Фигуры внутри `<defs>` (обтравка, маски, узоры)
 * не рисуются вовсе: краска у них не просто не нужна, а бессмысленна.
 */
function stripUnpainted(source: string): string {
  return source
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '')
    .replace(/<defs>[\s\S]*?<\/defs>/g, '')
}

function templates(): { path: string, source: string }[] {
  function walk(dir: string): { path: string, source: string }[] {
    return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      const full = resolve(dir, entry.name)

      if (entry.isDirectory())
        return entry.name === '__tests__' ? [] : walk(full)

      return entry.name.endsWith('.vue')
        ? [{ path: full.slice(process.cwd().length + 1), source: stripUnpainted(readFileSync(full, 'utf8')) }]
        : []
    })
  }

  return walk(componentsDir)
}

describe('покраска SVG', () => {
  const files = templates()

  it('шаблоны компонентов найдены — иначе гейт зелен всегда', () => {
    expect(files.length).toBeGreaterThan(3)
  })

  it('каждая рисующая фигура несёт fill или stroke', () => {
    const offenders: string[] = []

    for (const { path, source } of files) {
      for (const match of source.matchAll(PAINTED)) {
        const [tag, attributes] = [match[1]!, match[2]!]

        if (STRUCTURAL.test(tag))
          continue

        const painted = /(?::|\s)(?:fill|stroke)=/.test(attributes)

        if (!painted)
          offenders.push(`<${tag}> (${path})`)
      }
    }

    expect(offenders, 'фигура без `fill`/`stroke` — чёрная в тёмной теме').toEqual([])
  })

  it('краска не задаётся утилитой текста: SVG её не слышит', () => {
    const offenders: string[] = []

    for (const { path, source } of files) {
      for (const match of source.matchAll(PAINTED)) {
        const attributes = match[2]!

        if (/class="[^"]*text-\[(?!length:)/.test(attributes))
          offenders.push(`<${match[1]}> (${path})`)
      }
    }

    expect(offenders, 'цвет фигуры задан через `text-[…]` — красит `color`, а не `fill`').toEqual([])
  })
})
