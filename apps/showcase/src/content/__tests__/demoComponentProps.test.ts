import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'

import { describe, expect, it } from 'vitest'

import componentApi from '../generated/componentApi.generated.json'

/**
 * Демо не должно передавать компоненту пакета проп, которого у него нет.
 *
 * Незнакомый атрибут Vue не отвергает: он уходит в `$attrs` и садится на
 * корневой узел. Ни типы, ни рантайм не возражают — `vue-tsc` лишние атрибуты
 * не проверяет, принимать их вправе любой компонент. Демо продолжает
 * собираться, а показывает не то, что заявляет.
 *
 * Так на витрине жили два случая: `<GrModal title="…">` (имя окна берётся из
 * слота `#title` или пропа `ariaLabel`, поэтому окна были безымянные и печатали
 * предупреждение) и `<GrTooltip content="…">` (текст задаётся пропом `text`,
 * а `content` — имя слота, поэтому подсказка не показывалась вовсе). Оба нашлись
 * глазами, а не гейтом: сборка была зелёной.
 *
 * Проверка идёт по сгенерированному API (`componentApi.generated.json`) — тому
 * же источнику, из которого витрина рисует таблицу пропов.
 */

const demosRoot = fileURLToPath(new URL('../../demos/', import.meta.url))

/** Атрибуты, законные на любом компоненте: они и предназначены для fallthrough. */
const PASSTHROUGH = new Set([
  'class',
  'style',
  'id',
  'ref',
  'key',
  'slot',
  'role',
  'tabindex',
  'is',
  'lang',
  'dir',
  'hidden',
  'contenteditable',
])

/**
 * `title` в этот список не входит намеренно: HTML-подсказка по наведению
 * недоступна с клавиатуры и не читается диктором, для неё есть `GrTooltip`.
 * А ещё именно она однажды притворилась заголовком окна.
 */

function isPassthrough(name: string): boolean {
  return PASSTHROUGH.has(name) || name.startsWith('data-') || name.startsWith('aria-')
}

function toCamel(name: string): string {
  return name.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase())
}

function collectDemoFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = `${dir}${entry.name}`

    if (entry.isDirectory())
      return collectDemoFiles(`${path}/`)

    return entry.name.endsWith('.vue') ? [path] : []
  })
}

/** Тег целиком: от `<GrX` до закрывающей `>`, не считая её внутри кавычек. */
function readTag(source: string, start: number): { body: string, end: number } | null {
  let quote: string | null = null

  for (let index = start; index < source.length; index += 1) {
    const char = source[index]

    if (quote) {
      if (char === quote)
        quote = null
      continue
    }

    if (char === '"' || char === '\'') {
      quote = char
      continue
    }

    if (char === '>')
      return { body: source.slice(start, index), end: index }
  }

  return null
}

// Двоеточие — часть имени (`v-model:page`, `@update:page`), а не разделитель.
const ATTR_RE = /([@:#]?[\w.\-[\]:]+)(?:=(?:"[^"]*"|'[^']*'))?/g

/** Имя пропа, к которому сводится атрибут, либо `null` — если это не проп. */
function propNameOf(raw: string): string | null {
  if (raw.startsWith('@') || raw.startsWith('#'))
    return null

  if (raw === 'v-model')
    return 'modelValue'

  if (raw.startsWith('v-model:'))
    return toCamel(raw.slice('v-model:'.length).split('.')[0])

  if (raw.startsWith('v-bind:'))
    return toCamel(raw.slice('v-bind:'.length).split('.')[0])

  // Динамическое имя (`:[key]`) статически не разрешить — и не надо.
  if (raw.startsWith(':['))
    return null

  if (raw.startsWith(':'))
    return toCamel(raw.slice(1).split('.')[0])

  if (raw.startsWith('v-'))
    return null

  return toCamel(raw.split('.')[0])
}

/**
 * Что компонент принимает: пропы плюс `onXxx` на каждый эмит — Vue разрешает
 * подписываться и так (`:on-exceed="fn"` вместо `@exceed="fn"`), и это рабочая
 * форма, а не опечатка.
 */
function acceptedBy(component: string): Set<string> | null {
  const entry = (componentApi as Record<string, { sections: Array<{ key: string, items: Array<{ name: string }> }> }>)[component]
  if (!entry)
    return null

  const section = (key: string) => entry.sections.find(item => item.key === key)?.items ?? []
  const handlerOf = (event: string) => `on${event.charAt(0).toUpperCase()}${event.slice(1)}`

  return new Set([
    ...section('props').map(item => item.name),
    ...section('events').map(item => handlerOf(toCamel(item.name.replace(':', '-')))),
  ])
}

type Violation = { file: string, component: string, attr: string }

function scan(file: string): Violation[] {
  const source = readFileSync(file, 'utf8')
  const found: Violation[] = []
  const tagRe = /<(Gr[A-Za-z0-9]*)[\s/>]/g

  for (const match of source.matchAll(tagRe)) {
    const component = match[1]
    const accepted = acceptedBy(component)
    // Компонент не из пакета (локальный или компаньон вне витринного API).
    if (!accepted)
      continue

    const tag = readTag(source, match.index + component.length + 1)
    if (!tag)
      continue

    for (const attr of tag.body.matchAll(ATTR_RE)) {
      const raw = attr[1]
      const name = propNameOf(raw)
      if (name === null || accepted.has(name))
        continue

      // Проверять fallthrough нужно по имени без префикса: `:key` и `key` —
      // один и тот же атрибут, привязка не меняет его природы.
      if (isPassthrough(raw.replace(/^(?:v-bind)?:/, '')))
        continue

      found.push({ file: file.slice(demosRoot.length), component, attr: raw })
    }
  }

  return found
}

describe('демо и пропы компонентов', () => {
  const files = collectDemoFiles(demosRoot)

  it('демо-файлы найдены', () => {
    expect(files.length).toBeGreaterThan(200)
  })

  it('ни одно демо не передаёт компоненту несуществующий проп', () => {
    const violations = files.flatMap(scan)

    expect(
      violations.map(v => `${v.file}: <${v.component} ${v.attr}>`),
      'атрибут уйдёт в $attrs и сядет на корневой узел — компонент нарисуется дефолтом',
    ).toEqual([])
  })
})
