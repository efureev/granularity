import type { PluginSetupFunction } from '@vue/devtools-kit'
import type { App } from 'vue'
import { GRANULARITY_THEME_STATE } from '@feugene/granularity/composables/useTheme'
import { GRANULARITY_TOAST_STATE } from '@feugene/granularity/composables/useToast'

import type { ThemeStateLike } from '../resolve/theme'
import type { ToastStateLike } from '../resolve/toasts'
import { themeReport, themeState } from '../resolve/theme'
import { toastQueue } from '../resolve/toasts'

type DevtoolsApi = Parameters<PluginSetupFunction>[0]

const INSPECTOR_ID = 'granularity:app'

const NODE_THEME = 'app:theme'
const NODE_TOASTS = 'app:toasts'

/**
 * Раздел «Granularity app»: то, что принадлежит приложению целиком, а не
 * отдельному компоненту, — тема и очередь тостов.
 *
 * Одним разделом, а не двумя: в колонке плагинов видны только иконки, и
 * заводить по иконке на пять строк состояния — плохой обмен.
 */
export function registerAppState(api: DevtoolsApi, app: App): void {
  function provides<T>(key: symbol): T | undefined {
    return (app._context?.provides as Record<symbol, T | undefined> | undefined)?.[key]
  }

  function theme() {
    return themeReport(provides<ThemeStateLike>(GRANULARITY_THEME_STATE), {
      readStored: (key) => {
        // Доступ к `localStorage` бросает в Safari private mode и при
        // отключённых cookies — ядро оборачивает его по той же причине.
        try {
          return globalThis.localStorage?.getItem(key) ?? null
        }
        catch {
          return null
        }
      },
      prefersDark: () => globalThis.matchMedia?.('(prefers-color-scheme: dark)')?.matches ?? null,
    })
  }

  function toasts() {
    return toastQueue(provides<ToastStateLike>(GRANULARITY_TOAST_STATE))
  }

  api.addInspector({
    id: INSPECTOR_ID,
    label: 'Granularity app',
    icon: 'settings',
    noSelectionText: 'Theme and toast queue — the state that belongs to the application, not to a component',
  })

  api.on.getInspectorTree((payload: { inspectorId: string, rootNodes: unknown[] }) => {
    if (payload.inspectorId !== INSPECTOR_ID)
      return

    const queue = toasts()

    payload.rootNodes = [
      { id: NODE_THEME, label: 'Theme' },
      {
        id: NODE_TOASTS,
        label: queue ? `Toasts (${queue.size}/${queue.limit})` : 'Toasts',
        tags: queue?.atLimit ? [{ label: 'at limit', textColor: 0xFFFFFF, backgroundColor: 0xF97316 }] : [],
        children: (queue?.entries ?? []).map(entry => ({
          id: entry.id,
          label: entry.title || entry.id,
          tags: [{ label: entry.tone, textColor: 0xFFFFFF, backgroundColor: 0x64748B }],
        })),
      },
    ]
  })

  api.on.getInspectorState((payload: { inspectorId: string, nodeId: string, state: unknown }) => {
    if (payload.inspectorId !== INSPECTOR_ID)
      return

    if (payload.nodeId === NODE_THEME) {
      const report = theme()
      payload.state = report
        ? { Theme: themeState(report) }
        : { Theme: [{ key: 'state', value: 'not provided — is `granularityThemePlugin` installed?' }] }
      return
    }

    const queue = toasts()
    if (payload.nodeId === NODE_TOASTS) {
      payload.state = queue
        ? { Queue: [{ key: 'alive', value: queue.size }, { key: 'limit', value: queue.limit }, { key: 'at limit', value: queue.atLimit }] }
        // Без плагина очередь живёт в модульном синглтоне и снаружи не читается.
        // Пустой список читался бы как «тостов нет» — это разные вещи.
        : { Queue: [{ key: 'state', value: 'not provided — without `granularityToastPlugin` the queue lives in a module singleton' }] }
      return
    }

    const entry = queue?.entries.find(item => item.id === payload.nodeId)
    payload.state = entry
      ? {
          Toast: [
            { key: 'tone', value: entry.tone },
            { key: 'auto-close', value: entry.timeoutMs === 0 ? 'off' : `${entry.timeoutMs} ms` },
            { key: 'remaining', value: entry.remainingMs === null ? '—' : `${Math.round(entry.remainingMs)} ms` },
            { key: 'dedupe key', value: entry.dedupeKey ?? '—' },
          ],
        }
      : {}
  })
}
