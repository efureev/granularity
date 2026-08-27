import { afterEach, describe, expect, it, vi } from 'vitest'

import type { GrDevEvent } from '../internal/devChannel'
import type { GrDevtoolsBridge } from '../internal/bridge'
import { installGrDevtoolsBridge } from '../internal/bridge'
import { createGrIssueLog } from '../resolve/issues'

type Hook = { events: GrDevEvent[], listeners: Set<(event: GrDevEvent) => void> }
type Global = typeof globalThis & { __GR_DEV_HOOK__?: Hook, __GR_DEVTOOLS__?: GrDevtoolsBridge }

function hook(): Hook {
  return (globalThis as Global).__GR_DEV_HOOK__!
}

function emit(event: GrDevEvent): void {
  // Хук создаёт та сторона, которая пришла первой, — здесь это «ядро».
  const target = globalThis as Global
  target.__GR_DEV_HOOK__ ??= { events: [], listeners: new Set() }

  hook().events.push(event)
  for (const listener of hook().listeners)
    listener(event)
}

function layer(id: number) {
  return { id, modal: true, topmostForEscape: true, inert: false, depth: 0, closesOnEscape: true }
}

function bridge(): GrDevtoolsBridge {
  return (globalThis as Global).__GR_DEVTOOLS__!
}

afterEach(() => {
  const target = globalThis as Global
  target.__GR_DEV_HOOK__ = undefined
  target.__GR_DEVTOOLS__ = undefined
  vi.useRealTimers()
})

describe('консольный мост', () => {
  it('ставит себя в `window` и знает свою версию', () => {
    installGrDevtoolsBridge(createGrIssueLog())

    expect(bridge().version).toMatch(/^\d+\.\d+\.\d+$/)
  })

  it('снимок отражает стек и журнал', () => {
    const issues = createGrIssueLog()
    installGrDevtoolsBridge(issues)

    emit({ type: 'overlay:sync', layers: [layer(1)] })
    issues.add('warning', ['[GrModal] окно без имени'])

    const snapshot = bridge().snapshot()
    expect(snapshot.layers).toHaveLength(1)
    expect(snapshot.issues[0]).toMatchObject({ component: 'GrModal' })
  })

  it('снимок отдаёт копию: правка результата не трогает мост', () => {
    installGrDevtoolsBridge(createGrIssueLog())
    emit({ type: 'overlay:sync', layers: [layer(1)] })

    bridge().snapshot().layers.length = 0

    expect(bridge().snapshot().layers).toHaveLength(1)
  })

  it('видит то, что случилось до его установки', () => {
    const issues = createGrIssueLog()
    // Событие ушло в канал раньше, чем панель подключилась, — его держит буфер ядра.
    emit({ type: 'overlay:sync', layers: [layer(7)] })
    installGrDevtoolsBridge(issues)

    expect(bridge().snapshot().layers[0]?.id).toBe(7)
  })
})

describe('waitFor', () => {
  it('не ждёт, если условие уже выполнено', async () => {
    installGrDevtoolsBridge(createGrIssueLog())
    emit({ type: 'overlay:sync', layers: [layer(1)] })

    await expect(bridge().waitFor(s => s.layers.length === 1)).resolves.toMatchObject({ layers: [{ id: 1 }] })
  })

  it('дожидается события стека', async () => {
    installGrDevtoolsBridge(createGrIssueLog())

    const waiting = bridge().waitFor(s => s.layers.length === 1)
    emit({ type: 'overlay:sync', layers: [layer(2)] })

    await expect(waiting).resolves.toMatchObject({ layers: [{ id: 2 }] })
  })

  it('дожидается предупреждения, которого в канале нет вовсе', async () => {
    const issues = createGrIssueLog()
    installGrDevtoolsBridge(issues)

    const waiting = bridge().waitFor(s => s.issues.length > 0)
    issues.add('warning', ['[GrSlider] обязательный проп'])

    await expect(waiting).resolves.toMatchObject({ issues: [{ component: 'GrSlider' }] })
  })

  it('по таймауту объясняет, чего дождался вместо ожидаемого', async () => {
    installGrDevtoolsBridge(createGrIssueLog())
    emit({ type: 'overlay:sync', layers: [layer(3)] })

    const waiting = bridge().waitFor(s => s.layers.length === 2, { timeout: 10 })

    await expect(waiting).rejects.toThrow(/условие не выполнилось за 10 мс.*"id":3/s)
  })

  it('снятие моста убирает его из `window`', () => {
    const detach = installGrDevtoolsBridge(createGrIssueLog())
    detach()

    expect((globalThis as Global).__GR_DEVTOOLS__).toBeUndefined()
  })
})
