import type { PluginSetupFunction } from '@vue/devtools-kit'

import { stylesheetIndex } from '../internal/stylesheetIndex'
import { collectClassNames, unstyledClasses } from '../resolve/unstyledClasses'

type DevtoolsApi = Parameters<PluginSetupFunction>[0]

interface InspectPayload {
  componentInstance: { type?: { __name?: string, name?: string }, vnode?: { el?: unknown } }
  instanceData: { state: unknown[] }
}

/**
 * Секция «классы без правил».
 *
 * Проверяются классы корня компонента и его потомков: промах safelist обычно
 * живёт не на корне, а на внутреннем элементе — на кнопке-иконке, на чипе, на
 * строке списка.
 */
export function registerComponentStyles(api: DevtoolsApi): void {
  api.on.inspectComponent((payload: InspectPayload) => {
    const name = payload.componentInstance?.type?.__name ?? payload.componentInstance?.type?.name
    if (!name?.startsWith('Gr'))
      return

    const el = payload.componentInstance.vnode?.el
    if (!(el instanceof HTMLElement))
      return

    const index = stylesheetIndex()
    const report = unstyledClasses(collectClassNames(el), index.styled, index.unreadableSheets)

    const rows: { key: string, value: unknown }[] = report.unstyled.length > 0
      ? report.unstyled.map((className, position) => ({ key: `#${position + 1}`, value: className }))
      : [{ key: 'result', value: `all ${report.checked} classes have rules` }]

    if (report.unreadableSheets > 0) {
      // Молчать нельзя: часть правил не прочитана, и «без правил» может
      // означать «в недоступном листе».
      rows.push({
        key: 'note',
        value: `${report.unreadableSheets} stylesheet(s) unreadable (cross-origin) — the list may be incomplete`,
      })
    }

    payload.instanceData.state.push(...rows.map(row => ({
      type: 'granularity classes without rules',
      key: row.key,
      value: row.value,
      editable: false,
    })))
  })
}
