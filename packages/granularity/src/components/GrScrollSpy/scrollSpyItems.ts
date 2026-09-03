/**
 * Арифметика пунктов оглавления: всё, что следует из того, что пункт —
 * **ссылка**, а не из положения прокрутки. Положение живёт в
 * `composables/internal/scrollSpyGeometry.ts`.
 */

/** Раздел в оглавлении. */
export interface GrScrollSpySection {
  id: string
  label: string
  /** Уровень вложенности, 1 — верхний. Влияет на отступ и цепочку предков. */
  level?: number
}

/**
 * Значение пропа `offset` в CSS-длину для инлайновой переменной.
 *
 * Строка уходит как есть и намеренно не валидируется: `4rem`,
 * `var(--gr-navbar-height)`, `calc(…)` обязаны работать — иначе проп проигрывает
 * голому `style`. Отрицательное зажимается в ноль: линия активации выше верха
 * скроллпорта смысла не имеет.
 */
export function scrollSpyOffsetLength(value: number | string | undefined): string | undefined {
  if (value == null)
    return undefined

  if (typeof value === 'number') {
    if (!Number.isFinite(value))
      return undefined

    // Число выносится в переменную, чтобы литерал остался одним токеном: гейт
    // safelist разбирает шаблонные строки по пробелам и обломок вида `value)}px`
    // принимает за утилиту UnoCSS — которой он, по совпадению, и оказывается.
    const px = Math.max(0, value)

    return `${px}px`
  }

  const trimmed = value.trim()

  return trimmed === '' ? undefined : trimmed
}

/**
 * Наш ли это клик.
 *
 * Пункт остаётся `<a href="#id">` ровно ради того, что браузер умеет с ссылкой
 * сам: `Cmd`-клик открывает в новой вкладке, средняя кнопка — тоже. Перехватив
 * их, компонент отнял бы у пользователя работающее поведение и ничего не дал
 * взамен.
 */
export function anchorClickHandled(event: {
  button: number
  metaKey: boolean
  ctrlKey: boolean
  shiftKey: boolean
  altKey: boolean
  defaultPrevented: boolean
}): boolean {
  if (event.defaultPrevented || event.button !== 0)
    return false

  return !(event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
}

/**
 * Предки активного пункта — те разделы выше по списку, чей уровень мельче.
 *
 * Считается по документному порядку массива, а не по дереву: дерево позволило
 * бы объявить вложенность, противоречащую порядку разделов на странице.
 */
export function ancestorSectionIds(
  sections: readonly GrScrollSpySection[],
  activeId: string | null,
): Set<string> {
  const ancestors = new Set<string>()

  if (activeId === null)
    return ancestors

  const index = sections.findIndex(section => section.id === activeId)

  if (index < 0)
    return ancestors

  let level = sections[index].level ?? 1

  for (let cursor = index - 1; cursor >= 0; cursor -= 1) {
    const candidate = sections[cursor].level ?? 1

    if (candidate < level) {
      ancestors.add(sections[cursor].id)
      level = candidate
    }
  }

  return ancestors
}
