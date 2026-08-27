import type { GrIssue, GrIssueLog } from '../resolve/issues'
import type { GrOverlaySnapshot } from './devChannel'
import { readGrOverlayLayers, subscribeToGrDevEvents } from './devChannel'

/**
 * Консольный мост: то же состояние, что у панели, — но доступное коду.
 *
 * Заведён ради тестов. Playwright и Cypress видят только DOM, поэтому «дождаться,
 * что слой открылся» пишется как «подождать 300 мс», а «убедиться, что пакет не
 * ругался» — никак. Мост отвечает на оба вопроса тем же снимком, который панель
 * рисует человеку.
 *
 * Живёт независимо от панели: журнал предупреждений и подписка на канал ядра
 * ставятся в `installGranularityDevtools()`, а не в момент открытия вкладки
 * DevTools — иначе тест, который её не открывает, получал бы пустую картину.
 */

export interface GrDevtoolsSnapshot {
  /** Версия пакета панели — чтобы тест мог сказать, с чем именно он говорит. */
  version: string
  /** Стек слоёв в порядке регистрации. */
  layers: GrOverlaySnapshot[]
  /** Предупреждения пакета, собранные с начала сессии. */
  issues: GrIssue[]
}

export interface GrDevtoolsBridge {
  version: string
  snapshot: () => GrDevtoolsSnapshot
  /**
   * Ждёт, пока снимок удовлетворит условию. Проверяет сразу и затем на каждое
   * событие канала, поэтому уже выполненное условие не ждёт таймаута.
   */
  waitFor: (predicate: (snapshot: GrDevtoolsSnapshot) => boolean, options?: { timeout?: number }) => Promise<GrDevtoolsSnapshot>
}

type GlobalWithBridge = typeof globalThis & { __GR_DEVTOOLS__?: GrDevtoolsBridge }

const DEFAULT_TIMEOUT = 2000

export function installGrDevtoolsBridge(issues: GrIssueLog): () => void {
  let layers: GrOverlaySnapshot[] = []

  const stopChannel = subscribeToGrDevEvents((event) => {
    if (event.type === 'overlay:sync')
      layers = event.layers
  })

  function snapshot(): GrDevtoolsSnapshot {
    // Читалка ядра знает про фокус «сейчас»; события — только про момент
    // изменения стека. Копию делаем в любом случае: снимок отдаётся наружу.
    return { version: __GR_DEVTOOLS_VERSION__, layers: [...(readGrOverlayLayers() ?? layers)], issues: issues.list() }
  }

  const bridge: GrDevtoolsBridge = {
    version: __GR_DEVTOOLS_VERSION__,
    snapshot,
    async waitFor(predicate, options = {}) {
      const current = snapshot()
      if (predicate(current))
        return current

      const timeout = options.timeout ?? DEFAULT_TIMEOUT
      const unsubscribe: (() => void)[] = []
      let timer: ReturnType<typeof setTimeout> | undefined

      function stopWaiting(): void {
        if (timer !== undefined)
          clearTimeout(timer)
        for (const stop of unsubscribe)
          stop()
      }

      return new Promise<GrDevtoolsSnapshot>((resolve, reject) => {
        function check(): void {
          const next = snapshot()
          if (!predicate(next))
            return
          stopWaiting()
          resolve(next)
        }

        // Ждём и события стека, и записи в журнал: условие может быть про
        // предупреждение, которого в канале нет вовсе.
        unsubscribe.push(subscribeToGrDevEvents(check), issues.subscribe(check))

        timer = setTimeout(() => {
          stopWaiting()
          // В сообщение кладём снимок: иначе упавший тест сообщает только
          // «истекло время», и разбирать его приходится вручную.
          reject(new Error(`[granularity-devtools] waitFor: условие не выполнилось за ${timeout} мс. Снимок: ${JSON.stringify(snapshot())}`))
        }, timeout)
      })
    },
  }

  const target = globalThis as GlobalWithBridge
  target.__GR_DEVTOOLS__ = bridge

  return () => {
    stopChannel()
    if (target.__GR_DEVTOOLS__ === bridge)
      target.__GR_DEVTOOLS__ = undefined
  }
}
