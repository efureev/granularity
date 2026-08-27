import type { PluginSetupFunction } from '@vue/devtools-kit'

import { readGrVirtualLists } from '../internal/devChannel'
import { virtualListFor, virtualListState } from '../resolve/virtualList'

type DevtoolsApi = Parameters<PluginSetupFunction>[0]

interface InspectPayload {
  componentInstance: { uid?: number, type?: { __name?: string, name?: string } }
  instanceData: { state: unknown[] }
}

/**
 * Секция виртуализатора на компоненте.
 *
 * Списки читаются из реестра канала по `uid` инстанса: у одного компонента
 * список один, а на странице их может быть несколько — таблица, дерево и
 * открытый селект одновременно.
 */
export function registerComponentVirtualList(api: DevtoolsApi): void {
  api.on.inspectComponent((payload: InspectPayload) => {
    const list = virtualListFor(readGrVirtualLists(), payload.componentInstance?.uid)
    if (!list)
      return

    payload.instanceData.state.push(
      ...virtualListState(list).map(entry => ({
        type: 'granularity virtual list',
        key: entry.key,
        value: entry.value,
        editable: false,
      })),
    )
  })
}
