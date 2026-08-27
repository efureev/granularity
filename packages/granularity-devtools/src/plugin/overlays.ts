import type { PluginSetupFunction } from '@vue/devtools-kit'

import type { GrOverlaySnapshot } from '../internal/devChannel'
import { readGrOverlayLayers, subscribeToGrDevEvents } from '../internal/devChannel'
import type { GrIssueLog } from '../resolve/issues'
import { overlayState, overlayTimelineEvent, overlayTree } from '../resolve/overlayInspector'
import { buildReport } from '../resolve/report'

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

export function registerOverlays(api: DevtoolsApi, issues: GrIssueLog): void {
  let layers: GrOverlaySnapshot[] = []

  api.addInspector({
    id: INSPECTOR_ID,
    actions: [{
      icon: 'content_copy',
      tooltip: 'Copy a JSON report: layers, warnings, versions',
      action: () => {
        void copyReport(issues)
      },
    }],
    // Имя раздела начинается с пакета: в колонке разделов панели у плагинов
    // видны только иконки, а имя показывается тултипом и в шапке — без префикса
    // «Overlay layers» и «Issues» не отличить от чужих.
    label: 'Granularity overlays',
    // Панель разворачивает это имя в класс `custom-ic-baseline-<icon>`, то есть
    // ждёт имя из набора Material Icons.
    icon: 'layers',
    noSelectionText: 'Select a layer to see who owns Escape and which modals are inert',
  })

  api.addTimelineLayer({
    id: TIMELINE_ID,
    label: 'Granularity overlays',
    color: 0x7C3AED,
  })

  /**
   * Свежая картина, а не последняя присланная: фокус уходит из слоя от обычного
   * клика, и события стека при этом не происходит. Если ядро читалку не
   * предоставило (версия старее), обходимся тем, что пришло событием.
   */
  function currentLayers(): GrOverlaySnapshot[] {
    return readGrOverlayLayers() ?? layers
  }

  api.on.getInspectorTree((payload: { inspectorId: string, rootNodes: unknown[] }) => {
    if (payload.inspectorId === INSPECTOR_ID)
      payload.rootNodes = overlayTree(currentLayers())
  })

  api.on.getInspectorState((payload: { inspectorId: string, nodeId: string, state: unknown }) => {
    if (payload.inspectorId === INSPECTOR_ID)
      payload.state = overlayState(currentLayers(), payload.nodeId)
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

/**
 * Отчёт кладётся и в консоль, и в буфер обмена.
 *
 * Только буфера мало: в панели DevTools нет пользовательского жеста, и
 * `navigator.clipboard` там отказывает молча — из консоли отчёт хотя бы можно
 * забрать руками.
 */
async function copyReport(issues: GrIssueLog): Promise<void> {
  const report = JSON.stringify(buildReport(issues.list()), null, 2)

  console.warn('[granularity-devtools] report:\n%s', report)

  try {
    await globalThis.navigator?.clipboard?.writeText(report)
  }
  catch {
    // Буфер недоступен — отчёт уже в консоли.
  }
}
