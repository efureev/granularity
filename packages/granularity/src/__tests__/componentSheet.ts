import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * Каскад листа компонента без браузера: вид компонента — правила по атрибутам в
 * его `<style>` (`docs/markup-weight.md`), и тесты читают их, а не строку классов.
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

export interface SheetState {
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

export interface ComponentSheet {
  /** Объявления листа, которые выигрывают у элемента в состоянии `state`. */
  cascade: (element: Element, state?: SheetState) => Record<string, string>
  /**
   * То же, но чтение переменной, которую лист ставит элементу или его предку
   * (`--gr-button-tone-bg: var(--gr-button-primary-bg)`), подставлено её значением:
   * тест сравнивает с токенами темы и ручками, а не с внутренними переменными.
   */
  look: (element: Element, state?: SheetState) => Record<string, string>
}

/**
 * Лист компонента: пути от `src/components`, например `GrButton/GrButton.vue`.
 * Несколько файлов — когда вид собирают листы нескольких компонентов: палитру
 * `GrChip` красит лист `GrBadge`.
 */
export function componentSheet(...files: string[]): ComponentSheet {
  // Пути — от cwd пакета: в vitest `import.meta.url` не всегда file-scheme.
  const sheet = files
    .map(file => /<style>([\s\S]*)<\/style>/.exec(readFileSync(resolve(process.cwd(), 'src/components', file), 'utf8'))![1])
    .join('\n')
    .replace(/\/\*[\s\S]*?\*\//g, '')
  const rules: Record<Motion, Rule[]> = {
    'no-preference': parse(sheet, [], 'no-preference'),
    'reduce': parse(sheet, [], 'reduce'),
  }

  function cascade(element: Element, state: SheetState = {}): Record<string, string> {
    // `:hover` и `:active` достаются и предкам элемента — так подпись откликается за коробку.
    const markedNodes = [] as [Element, string][]
    for (const key of Object.keys(MARKERS) as (keyof typeof MARKERS)[]) {
      if (!state[key])
        continue
      for (let node: Element | null = element; node; node = key === 'focus' ? null : node.parentElement) {
        node.setAttribute(MARKERS[key], '')
        markedNodes.push([node, MARKERS[key]])
      }
    }
    const winners = new Map<string, { value: string, rank: Specificity, order: number }>()
    for (const rule of rules[state.reducedMotion ? 'reduce' : 'no-preference']) {
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
    for (const [node, marker] of markedNodes)
      node.removeAttribute(marker)
    return Object.fromEntries([...winners].map(([property, { value }]) => [property, value]))
  }

  /** Пользовательские свойства наследуются: ближайший предок, объявивший переменную, задаёт её значение. */
  function variables(element: Element, own: Record<string, string>): Record<string, string> {
    const found = Object.fromEntries(Object.entries(own).filter(([name]) => name.startsWith('--')))
    for (let node = element.parentElement; node; node = node.parentElement) {
      for (const [name, value] of Object.entries(cascade(node))) {
        if (name.startsWith('--') && !(name in found))
          found[name] = value
      }
    }
    return found
  }

  function look(element: Element, state: SheetState = {}): Record<string, string> {
    const style = cascade(element, state)
    const vars = variables(element, style)
    const expand = (value: string, depth = 0): string => (depth > 8
      ? value
      : value.replace(/var\((--[\w-]+)\)/g, (whole, variable: string) => (variable in vars ? expand(vars[variable], depth + 1) : whole)))
    return Object.fromEntries(Object.entries(style).map(([name, value]) => [name, expand(value)]))
  }

  return { cascade, look }
}

/** Элемент с атрибутами вида — без монтирования компонента. */
export function lookElement(tag: string, attrs: Record<string, string | undefined>): HTMLElement {
  const element = document.createElement(tag)
  for (const [name, value] of Object.entries(attrs)) {
    if (value !== undefined)
      element.setAttribute(name, value)
  }
  return element
}
