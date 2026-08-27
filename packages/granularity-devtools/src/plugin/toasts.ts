import type { PluginSetupFunction } from '@vue/devtools-kit'
import type { App } from 'vue'
import { GRANULARITY_TOAST_STATE } from '@feugene/granularity/composables/useToast'

import type { ToastStateLike } from '../resolve/toasts'
import { toastQueue } from '../resolve/toasts'

type DevtoolsApi = Parameters<PluginSetupFunction>[0]

const INSPECTOR_ID = 'granularity:toasts'
const NO_STATE_NODE = 'toasts:no-state'

/**
 * Раздел «Granularity toasts».
 *
 * Состояние лежит под глобальным ключом `Symbol.for(...)`, поэтому читается из
 * `provides` приложения без единой правки ядра — тем же приёмом, что тема и
 * i18n-адаптер.
 */
export function registerToasts(api: DevtoolsApi, app: App): void {
  function state(): ToastStateLike | undefined {
    const provides = (app._context?.provides ?? {}) as Record<symbol, ToastStateLike | undefined>
    return provides[GRANULARITY_TOAST_STATE as symbol]
  }

  api.addInspector({
    id: INSPECTOR_ID,
    label: 'Granularity toasts',
    icon: 'notifications',
    noSelectionText: 'Select a toast to see its tone and remaining time',
  })

  api.on.getInspectorTree((payload: { inspectorId: string, rootNodes: unknown[] }) => {
    if (payload.inspectorId !== INSPECTOR_ID)
      return

    const queue = toastQueue(state())
    if (!queue) {
      // Без плагина состояние живёт в модульном синглтоне и снаружи недоступно.
      // Молчать здесь нельзя: пустой раздел читается как «тостов нет», а на
      // самом деле их просто не видно.
      payload.rootNodes = [{
        id: NO_STATE_NODE,
        label: 'Toast state is not provided',
        tags: [{ label: 'setup', textColor: 0xFFFFFF, backgroundColor: 0xF97316 }],
      }]
      return
    }

    payload.rootNodes = queue.entries.map(entry => ({
      id: entry.id,
      label: entry.title || entry.id,
      tags: [
        { label: entry.tone, textColor: 0xFFFFFF, backgroundColor: 0x64748B },
        ...(entry.dedupeKey ? [{ label: 'deduped', textColor: 0xFFFFFF, backgroundColor: 0x7C3AED }] : []),
      ],
    }))
  })

  api.on.getInspectorState((payload: { inspectorId: string, nodeId: string, state: unknown }) => {
    if (payload.inspectorId !== INSPECTOR_ID)
      return

    const queue = toastQueue(state())
    if (!queue) {
      payload.state = {
        Setup: [{
          key: 'why empty',
          value: 'Without `app.use(granularityToastPlugin)` the queue lives in a module singleton and is not readable from outside',
        }],
      }
      return
    }

    const entry = queue.entries.find(item => item.id === payload.nodeId)
    if (!entry) {
      payload.state = {}
      return
    }

    payload.state = {
      Toast: [
        { key: 'tone', value: entry.tone },
        { key: 'auto-close', value: entry.timeoutMs === 0 ? 'off' : `${entry.timeoutMs} ms` },
        { key: 'remaining', value: entry.remainingMs === null ? '—' : `${Math.round(entry.remainingMs)} ms` },
        { key: 'dedupe key', value: entry.dedupeKey ?? '—' },
      ],
      Queue: [
        { key: 'alive', value: queue.size },
        { key: 'limit', value: queue.limit },
        // Отвечает на «куда делись мои уведомления»: сверх потолка старые вытесняются.
        { key: 'at limit', value: queue.atLimit },
      ],
    }
  })
}
