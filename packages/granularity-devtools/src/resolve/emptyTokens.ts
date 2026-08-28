/**
 * Токены, которые правила компонента читают, а браузер разрешает в пустоту.
 *
 * `var(--gr-x)` без запасного значения при пустом токене не красит вовсе:
 * свойство отбраковывается на этапе вычисления, и компонент выходит без фона,
 * без рамки, с прямыми углами. Сборка при этом зелёная — CSS валиден.
 *
 * Статический `granular doctor` отвечает на смежный вопрос («какой токен не
 * задаёт ни один granular-слой») и слеп ровно там, где ошибаются чаще всего:
 * `themes.tokensFile` **заменяет** `tokens.css` пакета, но доктор считает
 * заданным объединение обоих файлов — и подмену базовых токенов приложением не
 * замечает. Здесь источник истины — сам браузер: читается то, что получилось.
 *
 * Секция `unset` из `tokenUsage` отвечает на другой вопрос: там объявленные
 * токены компонента, и пустота в них — норма (`kind: 'hook'`, состояния
 * `:hover`). Здесь наоборот: пусто И потребляется без запаса.
 */

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
  consumed: ReadonlyMap<string, ReadonlySet<string>>,
  probe: EmptyTokenProbe,
): EmptyTokenReport {
  const empty: EmptyToken[] = []
  const seen = new Set<string>()
  let checked = 0

  for (const element of [root, ...root.querySelectorAll('*')]) {
    for (const className of element.classList) {
      for (const token of consumed.get(className) ?? []) {
        if (!token.startsWith(OWN_PREFIX))
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
