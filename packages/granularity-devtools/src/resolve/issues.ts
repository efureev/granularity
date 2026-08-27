/**
 * Предупреждения дизайн-системы, собранные в одно место.
 *
 * Ядро печатает их в консоль под `__GR_DEV__` — три десятка сообщений в трёх
 * десятках файлов. В логе приложения они тонут между сетевыми запросами и
 * чужими логами; здесь у них свой список со счётчиком повторов.
 */

/** `[granularity]` — общий префикс пакета, `[GrModal]` — покомпонентный. */
const GR_PREFIX = /^\[(granularity|Gr[A-Z]\w*)\]\s*/

export type GrIssueKind = 'warning' | 'error'

export interface GrIssue {
  /** Ключ дедупликации: один и тот же текст из ста экземпляров списка — одна запись. */
  key: string
  kind: GrIssueKind
  /** `GrModal` для покомпонентных сообщений, `null` для общепакетных. */
  component: string | null
  message: string
  count: number
}

export interface ParsedGrMessage {
  component: string | null
  message: string
}

/**
 * Признаёт сообщение своим по префиксу и отделяет от него имя компонента.
 *
 * Читается только первый аргумент: у всех предупреждений пакета это строка
 * целиком, а разбирать произвольную склейку значило бы угадывать.
 */
export function parseGrConsoleMessage(args: readonly unknown[]): ParsedGrMessage | null {
  const first = args[0]
  if (typeof first !== 'string')
    return null

  const match = GR_PREFIX.exec(first)
  if (!match)
    return null

  const source = match[1]!
  return {
    component: source === 'granularity' ? null : source,
    message: first.slice(match[0].length).trim(),
  }
}

export interface GrIssueLog {
  /** Запись из перехваченной консоли: чужое сообщение отбрасывается. */
  add: (kind: GrIssueKind, args: readonly unknown[]) => boolean
  /** Запись, найденная самой панелью, — например недостающий обязательный проп. */
  record: (kind: GrIssueKind, component: string | null, message: string) => boolean
  list: () => GrIssue[]
  clear: () => void
  /**
   * Уведомление об изменении. Журнал наполняется независимо от того, открыта ли
   * панель (перехват консоли живёт в `install`), поэтому её обновление —
   * подписка, а не вызов изнутри записи.
   */
  subscribe: (listener: () => void) => () => void
}

export function createGrIssueLog(): GrIssueLog {
  const issues = new Map<string, GrIssue>()
  const listeners = new Set<() => void>()

  function notify(): void {
    for (const listener of listeners) {
      // Подписчик — код панели; его исключение не должно ломать сбор.
      try {
        listener()
      }
      catch {
        // ignore
      }
    }
  }

  function record(kind: GrIssueKind, component: string | null, message: string): boolean {
    const key = `${kind}:${component ?? ''}:${message}`
    const existing = issues.get(key)
    if (existing)
      existing.count += 1
    else issues.set(key, { key, kind, component, message, count: 1 })

    notify()
    return true
  }

  return {
    add(kind, args) {
      const parsed = parseGrConsoleMessage(args)
      if (!parsed)
        return false

      return record(kind, parsed.component, parsed.message)
    },
    record,
    list: () => [...issues.values()],
    clear: () => {
      issues.clear()
      notify()
    },
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
}
