import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { grButtonLookAttrs, type GrButtonLookOptions } from '../grButtonStyles'

/**
 * Каскад листа кнопки без браузера: вид кнопки — правила по атрибутам в
 * `<style>` `GrButton.vue`, и тесты читают их, а не строку классов.
 *
 * Правило применяется, если селектор совпал с элементом (`element.matches`);
 * у свойства выигрывает правило с большей специфичностью, при равной — позднее.
 * `:hover`, `:active` и `:focus-visible` jsdom не умеет, поэтому состояние
 * ставится атрибутом-меткой той же специфичности. Из медиазапросов читается
 * только `prefers-reduced-motion`: по умолчанию — `no-preference`, со
 * `state.reducedMotion` — `reduce`.
 */

interface Rule {
  selectors: string[]
  declarations: [string, string][]
  order: number
}

type Specificity = [number, number, number]

// Пути — от cwd пакета: в vitest `import.meta.url` не всегда file-scheme.
const source = readFileSync(resolve(process.cwd(), 'src/components/GrButton/GrButton.vue'), 'utf8')
const sheet = /<style>([\s\S]*)<\/style>/.exec(source)![1].replace(/\/\*[\s\S]*?\*\//g, '')

function splitTopLevel(text: string): string[] {
  const parts: string[] = []
  let depth = 0
  let start = 0
  for (let i = 0; i < text.length; i++) {
    if (text[i] === '(') {
      depth++
    }
    else if (text[i] === ')') {
      depth--
    }
    else if (text[i] === ',' && depth === 0) {
      parts.push(text.slice(start, i).trim())
      start = i + 1
    }
  }
  parts.push(text.slice(start).trim())
  return parts.filter(Boolean)
}

type Motion = 'no-preference' | 'reduce'

function parse(text: string, rules: Rule[], motion: Motion): Rule[] {
  let i = 0
  while (i < text.length) {
    const open = text.indexOf('{', i)
    if (open < 0)
      break
    const head = text.slice(i, open).trim()
    let depth = 1
    let j = open + 1
    while (depth > 0) {
      if (text[j] === '{')
        depth++
      else if (text[j] === '}')
        depth--
      j++
    }
    const body = text.slice(open + 1, j - 1)
    if (head.startsWith('@media')) {
      if (new RegExp(`prefers-reduced-motion:\\s*${motion}`).test(head))
        parse(body, rules, motion)
    }
    else if (!head.startsWith('@')) {
      rules.push({
        selectors: splitTopLevel(head),
        declarations: body.split(';').map(part => part.trim()).filter(Boolean).map((part) => {
          const colon = part.indexOf(':')
          return [part.slice(0, colon).trim(), part.slice(colon + 1).trim()]
        }),
        order: rules.length,
      })
    }
    i = j
  }
  return rules
}

const RULES: Record<Motion, Rule[]> = {
  'no-preference': parse(sheet, [], 'no-preference'),
  'reduce': parse(sheet, [], 'reduce'),
}

const compare = (x: Specificity, y: Specificity): number => x[0] - y[0] || x[1] - y[1] || x[2] - y[2]

export function specificity(selector: string): Specificity {
  const total: Specificity = [0, 0, 0]
  let i = 0
  while (i < selector.length) {
    const char = selector[i]
    if (char === '[') {
      total[1]++
      i = selector.indexOf(']', i) + 1
    }
    else if (char === ':' && selector[i + 1] === ':') {
      total[2]++
      i += 2
      while (/[\w-]/.test(selector[i] ?? ''))
        i++
    }
    else if (char === ':') {
      const match = /^:([\w-]+)(\()?/.exec(selector.slice(i))!
      i += match[0].length
      if (!match[2]) {
        total[1]++
        continue
      }
      let depth = 1
      const start = i
      while (depth > 0) {
        if (selector[i] === '(')
          depth++
        else if (selector[i] === ')')
          depth--
        i++
      }
      if (['not', 'is', 'has'].includes(match[1])) {
        const best = splitTopLevel(selector.slice(start, i - 1)).map(specificity).sort(compare).at(-1)!
        total[0] += best[0]
        total[1] += best[1]
        total[2] += best[2]
      }
      else if (match[1] !== 'where') {
        total[1]++
      }
    }
    else if (/[a-z]/i.test(char)) {
      total[2]++
      while (/[\w-]/.test(selector[i] ?? ''))
        i++
    }
    else {
      i++
    }
  }
  return total
}

export interface ButtonState {
  hover?: boolean
  active?: boolean
  focus?: boolean
  /** Пользователь с `prefers-reduced-motion: reduce`. */
  reducedMotion?: boolean
}

const MARKERS = { hover: 'data-test-hover', active: 'data-test-active', focus: 'data-test-focus' } as const

function marked(selector: string): string {
  return selector
    .replaceAll(':hover', `[${MARKERS.hover}]`)
    .replaceAll(':active', `[${MARKERS.active}]`)
    .replaceAll(':focus-visible', `[${MARKERS.focus}]`)
}

/** Объявления листа, которые выигрывают у элемента в состоянии `state`. */
export function cascade(element: Element, state: ButtonState = {}): Record<string, string> {
  for (const key of Object.keys(MARKERS) as (keyof typeof MARKERS)[]) {
    if (state[key])
      element.setAttribute(MARKERS[key], '')
  }
  const winners = new Map<string, { value: string, rank: Specificity, order: number }>()
  for (const rule of RULES[state.reducedMotion ? 'reduce' : 'no-preference']) {
    const matching = rule.selectors.filter(selector => !selector.includes('::') && element.matches(marked(selector)))
    if (matching.length === 0)
      continue
    const rank = matching.map(specificity).sort(compare).at(-1)!
    for (const [property, value] of rule.declarations) {
      const current = winners.get(property)
      if (!current || compare(rank, current.rank) > 0 || (compare(rank, current.rank) === 0 && rule.order > current.order))
        winners.set(property, { value, rank, order: rule.order })
    }
  }
  for (const marker of Object.values(MARKERS))
    element.removeAttribute(marker)
  return Object.fromEntries([...winners].map(([property, { value }]) => [property, value]))
}

/** Кнопка без монтирования — элемент с атрибутами вида. */
export function lookElement(options: GrButtonLookOptions & { pressed?: boolean, disabled?: boolean }): HTMLButtonElement {
  const element = document.createElement('button')
  element.setAttribute('data-gr-button', '')
  for (const [name, value] of Object.entries(grButtonLookAttrs(options))) {
    if (value !== undefined)
      element.setAttribute(name, value)
  }
  if (options.pressed)
    element.setAttribute('data-gr-pressed', '')
  if (options.disabled)
    element.disabled = true
  return element
}

function expand(value: string, style: Record<string, string>): string {
  return value.replace(/var\((--gr-button-tone-[\w-]+)\)/g, (whole, name: string) => style[name] ?? whole)
}

/** Вид из листа кнопки, где переменные тона подставлены своими значениями. */
export function look(element: Element, state: ButtonState = {}): Record<string, string> {
  const style = cascade(element, state)
  return Object.fromEntries(Object.entries(style).map(([name, value]) => [name, expand(value, style)]))
}
