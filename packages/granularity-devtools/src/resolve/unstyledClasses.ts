/**
 * Классы, для которых в документе нет ни одного правила.
 *
 * Самый частый тихий баг пакета: класс попал в разметку, но не попал в CSS —
 * размеры работают, цвета прозрачные, фокус-кольца нет. Статический
 * `granular why-css` отвечает на обратный вопрос («кто затащил класс в CSS»),
 * а гейт `safelist.test.ts` ловит случаи, видимые из исходников. Здесь — то,
 * что видно только в браузере: имена, собранные в рантайме, и классы самого
 * приложения поверх наших компонентов.
 */

/**
 * Классы из селектора.
 *
 * Экранирование снимается: UnoCSS пишет `.hover\:bg-red` и `.text-\[13px\]`, а
 * в `class` живут `hover:bg-red` и `text-[13px]`. Без этого совпадений не было
 * бы вовсе, и раздел объявил бы «без правил» весь UnoCSS.
 */
export function classNamesFromSelector(selector: string): string[] {
  const names: string[] = []
  const pattern = /\.((?:[\w-]|\\.)+)/g

  for (const match of selector.matchAll(pattern))
    names.push(match[1]!.replace(/\\(.)/g, '$1'))

  return names
}

/** Классы элемента и его потомков — в порядке первого появления. */
export function collectClassNames(root: Element): string[] {
  const seen = new Set<string>()

  for (const element of [root, ...root.querySelectorAll('*')]) {
    for (const name of element.classList)
      seen.add(name)
  }

  return [...seen]
}

export interface UnstyledReport {
  /** Классы, для которых в документе нет ни одного правила. */
  unstyled: string[]
  /** Сколько классов проверено — без него «ничего не найдено» неотличимо от «нечего проверять». */
  checked: number
  /**
   * Листы, которые прочитать не удалось (кросс-доменные — `SecurityError`).
   * Пока они есть, вывод неполон, и об этом надо говорить, а не молчать.
   */
  unreadableSheets: number
}

export function unstyledClasses(classNames: readonly string[], styled: ReadonlySet<string>, unreadableSheets: number): UnstyledReport {
  return {
    unstyled: classNames.filter(name => !styled.has(name)),
    checked: classNames.length,
    unreadableSheets,
  }
}
