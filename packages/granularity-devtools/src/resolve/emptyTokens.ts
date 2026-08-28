/**
 * Токены, которые правила компонента читают, а браузер разрешает в пустоту.
 *
 * `var(--gr-x)` без запасного значения при пустом токене не красит вовсе:
 * свойство отбраковывается на этапе вычисления, и компонент выходит без фона,
 * без рамки, с прямыми углами. Сборка при этом зелёная — CSS валиден.
 *
 * Статический `granular doctor` отвечает на смежный вопрос — «задаёт ли токен
 * хоть один granular-слой в этой конфигурации». Здесь вопрос другой: «пуст ли он
 * сейчас, на этом элементе». Разница видна на живом стенде: токен, который
 * компонент выставляет себе сам инлайновым стилем, статике неотличим от
 * незаданного, а браузеру — заданный.
 *
 * Секция `unset` из `tokenUsage` отвечает на другой вопрос: там объявленные
 * токены компонента, и пустота в них — норма (`kind: 'hook'`, состояния
 * `:hover`). Здесь наоборот: пусто И потребляется без запаса.
 */

import type { ConsumedToken } from '../internal/stylesheetIndex'

export interface EmptyToken {
  token: string
  /** Класс, чьё правило читает токен, — с него начинать поиск причины. */
  className: string
}

export interface EmptyTokenReport {
  empty: EmptyToken[]
  /** Сколько пар «класс × токен» проверено: без счётчика пустой список нечитаем. */
  checked: number
}

/**
 * Считаются только токены дизайн-системы.
 *
 * UnoCSS ведёт свои переменные (`--un-shadow-inset`, `--un-ring-inset`,
 * `--un-space-y-reverse`) и читает их без запасного значения по всей утилитной
 * раскладке: на чистом стенде их набирается три штуки, и каждая — не дефект, а
 * внутренняя механика чужого генератора. Панель разбирает свою систему, и
 * чужие переменные в ней только заслоняют настоящую находку.
 */
const OWN_PREFIX = '--gr-'

export type ConsumedIndex = ReadonlyMap<string, ReadonlyMap<string, ConsumedToken>>

export interface EmptyTokenProbe {
  /** Значение токена в вычисленном стиле конкретного элемента. */
  read: (element: Element, token: string) => string
}

/**
 * Обход идёт по элементу и потомкам, а токен читается на том элементе, чьё
 * правило его требует: пользовательские свойства наследуются, и замер с корня
 * соврал бы там, где значение переопределено внутри.
 */
export function emptyTokens(
  root: Element,
  consumed: ConsumedIndex,
  probe: EmptyTokenProbe,
): EmptyTokenReport {
  const empty: EmptyToken[] = []
  const seen = new Set<string>()
  let checked = 0

  for (const element of [root, ...root.querySelectorAll('*')]) {
    for (const className of element.classList) {
      for (const [token, usage] of consumed.get(className) ?? []) {
        // Потребление с запасом при пустом токене не ломается — оно рисует
        // запасным значением, и находкой быть не может.
        if (!usage.strict || !token.startsWith(OWN_PREFIX))
          continue

        checked += 1
        if (seen.has(token) || probe.read(element, token).trim())
          continue

        seen.add(token)
        empty.push({ token, className })
      }
    }
  }

  return { empty, checked }
}
