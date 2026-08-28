import type { PluginSetupFunction } from '@vue/devtools-kit'

import type { TokenReading } from '../resolve/tokenUsage'
import { stylesheetIndex } from '../internal/stylesheetIndex'
import { emptyTokens } from '../resolve/emptyTokens'
import { tokenSections } from '../resolve/tokenUsage'

type DevtoolsApi = Parameters<PluginSetupFunction>[0]

interface InspectPayload {
  componentInstance: { type?: { __name?: string, name?: string }, vnode?: { el?: unknown } }
  instanceData: { state: unknown[] }
}

/**
 * Корневой элемент компонента. У фрагмента и текстового узла его нет — и это не
 * ошибка: читать вычисленный стиль тогда не с чего.
 */
function rootElement(instance: InspectPayload['componentInstance']): HTMLElement | null {
  const el = instance?.vnode?.el
  return el instanceof HTMLElement ? el : null
}

function entries(type: string, readings: TokenReading[]): unknown[] {
  return readings.map(reading => ({
    type,
    key: reading.name,
    value: reading.value || '(empty)',
    editable: false,
  }))
}

/**
 * Секции токенов: что применилось на самом деле.
 *
 * Значение берётся из вычисленного стиля, а не из `tokens.json`, — там только
 * объявленный дефолт, и он расходится с реальностью ровно тогда, когда это
 * интересно: при смене темы, переопределении потребителем или промахе каскада.
 */
export function registerComponentTokens(api: DevtoolsApi): void {
  api.on.inspectComponent((payload: InspectPayload) => {
    const name = payload.componentInstance?.type?.__name ?? payload.componentInstance?.type?.name
    if (!name?.startsWith('Gr'))
      return

    const el = rootElement(payload.componentInstance)
    if (!el)
      return

    const computed = getComputedStyle(el)
    const sections = tokenSections(name, {
      read: (token: string) => computed.getPropertyValue(token),
      inlineNames: Array.from(el.style),
    })

    const index = stylesheetIndex()
    const resolved = emptyTokens(el, index.consumed, {
      read: (element, token) => getComputedStyle(element).getPropertyValue(token),
    })

    payload.instanceData.state.push(
      ...entries('granularity tokens', sections.applied),
      ...entries('granularity tokens · unset', sections.unset),
      ...entries('granularity tokens · not declared', sections.unknown),
      ...resolved.empty.map(finding => ({
        type: 'granularity tokens · consumed but empty',
        key: finding.token,
        value: `read by .${finding.className} without a fallback — the declaration is dropped`,
        editable: false,
      })),
    )
  })
}
