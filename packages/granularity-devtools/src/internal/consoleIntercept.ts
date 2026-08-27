import type { GrIssueLog } from '../resolve/issues'

/**
 * Перехват предупреждений пакета.
 *
 * Живёт в `install`, а не в разделе панели: журнал наполняется и когда панель
 * не открыта — иначе консольный мост показал бы тесту пустой список, хотя
 * предупреждения были. Плата — обезьяний патч консоли на всю dev-сессию,
 * поэтому оригинал зовётся всегда и снимается вместе с панелью.
 */
export function interceptConsole(log: GrIssueLog): () => void {
  const kinds = { warn: 'warning', error: 'error' } as const
  const restore: (() => void)[] = []

  for (const method of Object.keys(kinds) as (keyof typeof kinds)[]) {
    // Сохраняем саму ссылку, а не `bind(console)`: связанная копия не равна
    // оригиналу, и восстановление ею наслаивало бы обёртки на каждом цикле
    // подключения — это ловил тест на идентичность. Правило `unbound-method`
    // предупреждает ровно о потере `this`, а мы возвращаем его вызовом
    // `.apply(console, …)` ниже.
    // eslint-disable-next-line ts/unbound-method
    const original = console[method]

    console[method] = (...args: unknown[]) => {
      original.apply(console, args)
      log.add(kinds[method], args)
    }

    restore.push(() => {
      console[method] = original
    })
  }

  return () => {
    for (const undo of restore)
      undo()
  }
}
