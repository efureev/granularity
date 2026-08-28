import { classNamesFromSelector } from '../resolve/unstyledClasses'

/**
 * Множество классов, для которых в документе есть хоть одно правило.
 *
 * Строится лениво и кэшируется: на витрине это тысячи правил, и обходить их на
 * каждый выбор компонента незачем. Кэш сбрасывается, когда меняется набор
 * `<style>`/`<link>` — в dev это происходит на каждой правке стилей.
 */

export interface StylesheetIndex {
  styled: Set<string>
  /**
   * Класс → токены, которые его правила читают БЕЗ запасного значения.
   *
   * `var(--x)` без запасного значения — валидный CSS, который при пустом
   * токене не красит вовсе: свойство становится недействительным на этапе
   * вычисления. С запасным значением такого класса отказов нет, поэтому
   * `var(--x, …)` сюда не попадает.
   */
  consumed: Map<string, Set<string>>
  /** Листы, которые не удалось прочитать: кросс-доменные бросают `SecurityError`. */
  unreadableSheets: number
}

/**
 * Токены, читаемые объявлением без запасного значения.
 *
 * Различает `var(--x)` и `var(--x, …)` по символу за именем: запятая — запас
 * есть. Вложенные `var()` внутри запасного значения находятся тем же проходом,
 * потому что разбор идёт по всем вхождениям, а не по одному верхнему.
 */
function tokensWithoutFallback(value: string, into: Set<string>): void {
  for (const match of value.matchAll(/var\(\s*(--[\w-]+)\s*([,)])/g)) {
    if (match[2] === ')')
      into.add(match[1]!)
  }
}

let cached: StylesheetIndex | null = null
let observer: MutationObserver | null = null

/**
 * Обход по индексам, а не `for…of`: `CSSRuleList` и `StyleSheetList` —
 * коллекции старого образца, и итератора у них нет ни в jsdom, ни в части
 * браузерных сред.
 */
function collectFromRules(rules: CSSRuleList, styled: Set<string>, consumed: Map<string, Set<string>>): void {
  for (let index = 0; index < rules.length; index += 1) {
    const rule = rules.item(index)
    if (!rule)
      continue

    // Сначала селектор, потом вложенность — не наоборот: в реализации CSSOM,
    // которой пользуется jsdom, поле `cssRules` есть и у обычного правила, и
    // проверка «есть cssRules — значит группа» уводила рекурсию в пустой
    // список, теряя все селекторы разом.
    const selector = (rule as CSSStyleRule).selectorText
    if (selector) {
      const names = classNamesFromSelector(selector)
      for (const name of names)
        styled.add(name)

      const read = new Set<string>()
      const declarations = (rule as CSSStyleRule).style
      for (let property = 0; property < (declarations?.length ?? 0); property += 1)
        tokensWithoutFallback(declarations.getPropertyValue(declarations.item(property)), read)

      if (read.size) {
        for (const name of names) {
          const bucket = consumed.get(name) ?? new Set<string>()
          for (const token of read)
            bucket.add(token)
          consumed.set(name, bucket)
        }
      }
      continue
    }

    // Вложенные группы (`@media`, `@supports`, `@layer`) держат свои правила
    // отдельным списком: без обхода вглубь адаптивные утилиты числились бы
    // «без правил».
    const grouping = rule as CSSGroupingRule
    if (grouping.cssRules)
      collectFromRules(grouping.cssRules, styled, consumed)
  }
}

function build(): StylesheetIndex {
  const styled = new Set<string>()
  const consumed = new Map<string, Set<string>>()
  let unreadableSheets = 0

  const sheets = document.styleSheets
  for (let index = 0; index < sheets.length; index += 1) {
    try {
      const sheet = sheets.item(index)
      if (sheet)
        collectFromRules(sheet.cssRules, styled, consumed)
    }
    catch {
      // Кросс-доменный лист без CORS: `cssRules` бросает `SecurityError`.
      unreadableSheets += 1
    }
  }

  return { styled, consumed, unreadableSheets }
}

function watchStylesheets(): void {
  if (observer || typeof MutationObserver === 'undefined')
    return

  observer = new MutationObserver((mutations) => {
    const touchesStyles = mutations.some(mutation =>
      [...mutation.addedNodes, ...mutation.removedNodes].some(node =>
        node instanceof Element && (node.tagName === 'STYLE' || node.tagName === 'LINK'),
      ),
    )

    if (touchesStyles)
      cached = null
  })

  observer.observe(document.documentElement, { childList: true, subtree: true })
}

export function stylesheetIndex(): StylesheetIndex {
  watchStylesheets()
  cached ??= build()
  return cached
}

/** Сброс кэша между тестами. */
export function resetStylesheetIndex(): void {
  cached = null
  observer?.disconnect()
  observer = null
}
