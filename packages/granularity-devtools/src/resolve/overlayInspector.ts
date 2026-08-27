import type { CustomInspectorNode, CustomInspectorState } from '@vue/devtools-kit'

import type { GrDevEvent, GrOverlaySnapshot } from '../internal/devChannel'

/**
 * Перевод картины стека в дерево и состояние инспектора.
 *
 * Вынесено из плагина отдельным модулем не ради слоёв: это единственная часть
 * раздела, которую можно проверить тестом, — всё остальное сводится к вызовам
 * DevTools API.
 */

const TAG_MODAL = { label: 'modal', textColor: 0xFFFFFF, backgroundColor: 0x7C3AED }
const TAG_ESCAPE = { label: 'Esc', textColor: 0xFFFFFF, backgroundColor: 0x16A34A, tooltip: 'Escape is addressed to this layer' }
const TAG_INERT = { label: 'inert', textColor: 0xFFFFFF, backgroundColor: 0x64748B, tooltip: 'A modal below the topmost modal: made inert' }

export function overlayNodeId(id: number): string {
  return `layer:${id}`
}

/** Подпись слоя: имя открывшего компонента информативнее номера. */
function layerLabel(layer: GrOverlaySnapshot): string {
  const kind = layer.modal ? 'Modal' : 'Layer'
  return layer.owner ? `${layer.owner} #${layer.id}` : `${kind} #${layer.id}`
}

export function overlayTree(layers: GrOverlaySnapshot[]): CustomInspectorNode[] {
  return layers.map(layer => ({
    id: overlayNodeId(layer.id),
    label: layerLabel(layer),
    tags: [
      ...(layer.modal ? [TAG_MODAL] : []),
      ...(layer.topmostForEscape ? [TAG_ESCAPE] : []),
      ...(layer.inert ? [TAG_INERT] : []),
    ],
  }))
}

export function overlayState(layers: GrOverlaySnapshot[], nodeId: string): CustomInspectorState {
  const layer = layers.find(item => overlayNodeId(item.id) === nodeId)
  if (!layer)
    return {}

  const focus = layer.focus
    ? [
        { key: 'focus inside layer', value: layer.focus.inside },
        // Разделено намеренно: «фокус внутри» и «фокус вернётся» расходятся,
        // когда слой открыт с `restoreFocus: false`.
        { key: 'will restore focus', value: layer.focus.willRestore },
        { key: 'restore to', value: layer.focus.restoreTo ?? '—' },
      ]
    : []

  return {
    Layer: [
      { key: 'id', value: layer.id },
      { key: 'opened by', value: layer.owner ?? '—' },
      { key: 'modal', value: layer.modal },
      // Немодальные слои в этой арифметике не участвуют вовсе, и `null` здесь
      // честнее нуля: нулевая глубина — это «самое нижнее окно», а не «не окно».
      { key: 'depth among modals', value: layer.depth },
    ],
    Behaviour: [
      { key: 'owns Escape', value: layer.topmostForEscape },
      { key: 'closes on Escape', value: layer.closesOnEscape },
      { key: 'inert', value: layer.inert },
      ...focus,
    ],
  }
}

/** Подпись события для таймлайна: заголовок, пояснение и цвет строки. */
export function overlayTimelineEvent(event: GrDevEvent): { title: string, subtitle?: string, logType?: 'default' | 'warning' } | null {
  switch (event.type) {
    case 'overlay:push':
      return { title: `${event.owner ?? (event.modal ? 'Modal' : 'Layer')} #${event.id} opened` }
    case 'overlay:remove':
      return { title: `Layer #${event.id} closed` }
    case 'overlay:escape':
      return event.closed
        ? { title: `Escape closed layer #${event.id}` }
        // Слой съел нажатие и остался открытым — это законно (`closeOnEsc: false`),
        // но именно так выглядит и жалоба «Esc не работает», поэтому предупреждение.
        : { title: `Escape went to layer #${event.id}`, subtitle: 'the layer kept it: closeOnEsc is off', logType: 'warning' }
    // Снимок — состояние, а не происшествие: ему место в инспекторе.
    case 'overlay:sync':
      return null
  }
}
