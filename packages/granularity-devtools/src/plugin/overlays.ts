import type { PluginSetupFunction } from '@vue/devtools-kit'

import type { GrOverlaySnapshot } from '../internal/devChannel'
import { subscribeToGrDevEvents } from '../internal/devChannel'
import { overlayState, overlayTimelineEvent, overlayTree } from '../resolve/overlayInspector'

const INSPECTOR_ID = 'granularity:overlays'
const TIMELINE_ID = 'granularity:overlays'

/**
 * Раздел «Overlay layers»: живой стек слоёв плюс лента событий.
 *
 * Инспектор и таймлайн питаются одним каналом и регистрируются вместе:
 * разделить их значило бы дважды прокрутить буфер прошлых событий.
 */
/**
 * Тип API берётся из сигнатуры `setup`: сам он из `@vue/devtools-kit` наружу не
 * экспортирован.
 */
type DevtoolsApi = Parameters<PluginSetupFunction>[0]

export function registerOverlays(api: DevtoolsApi): void {
  let layers: GrOverlaySnapshot[] = []

  api.addInspector({
    id: INSPECTOR_ID,
    label: 'Overlay layers',
    icon: 'layers',
    noSelectionText: 'Select a layer to see who owns Escape and which modals are inert',
  })

  api.addTimelineLayer({
    id: TIMELINE_ID,
    label: 'Granularity overlays',
    color: 0x7C3AED,
  })

  api.on.getInspectorTree((payload: { inspectorId: string, rootNodes: unknown[] }) => {
    if (payload.inspectorId === INSPECTOR_ID)
      payload.rootNodes = overlayTree(layers)
  })

  api.on.getInspectorState((payload: { inspectorId: string, nodeId: string, state: unknown }) => {
    if (payload.inspectorId === INSPECTOR_ID)
      payload.state = overlayState(layers, payload.nodeId)
  })

  subscribeToGrDevEvents((event) => {
    if (event.type === 'overlay:sync') {
      layers = event.layers
      api.sendInspectorTree(INSPECTOR_ID)
      api.sendInspectorState(INSPECTOR_ID)
      return
    }

    const described = overlayTimelineEvent(event)
    if (described) {
      api.addTimelineEvent({
        layerId: TIMELINE_ID,
        event: { time: api.now(), data: event, ...described },
      })
    }
  })
}
