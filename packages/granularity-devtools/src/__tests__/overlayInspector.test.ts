import { describe, expect, it } from 'vitest'

import type { GrOverlaySnapshot } from '../internal/devChannel'
import { overlayNodeId, overlayState, overlayTimelineEvent, overlayTree } from '../resolve/overlayInspector'

function layer(patch: Partial<GrOverlaySnapshot> & { id: number }): GrOverlaySnapshot {
  return {
    owner: null,
    focus: null,
    modal: false,
    topmostForEscape: false,
    inert: false,
    depth: null,
    closesOnEscape: true,
    ...patch,
  }
}

/** Дропдаун, открытый внутри второй модалки: все три метки сразу. */
const STACK: GrOverlaySnapshot[] = [
  layer({ id: 1, modal: true, inert: true, depth: 0 }),
  layer({ id: 2, modal: true, depth: 1 }),
  layer({ id: 3, topmostForEscape: true }),
]

describe('дерево слоёв', () => {
  it('модалка и обычный слой различаются подписью', () => {
    expect(overlayTree(STACK).map(node => node.label)).toEqual(['Modal #1', 'Modal #2', 'Layer #3'])
  })

  it('метки показывают, кому Esc и кто в inert', () => {
    const tags = overlayTree(STACK).map(node => node.tags?.map(tag => tag.label) ?? [])

    expect(tags).toEqual([['modal', 'inert'], ['modal'], ['Esc']])
  })

  it('порядок узлов повторяет порядок слоёв', () => {
    expect(overlayTree(STACK).map(node => node.id)).toEqual([1, 2, 3].map(overlayNodeId))
  })
})

describe('состояние слоя', () => {
  it('показывает глубину только у модальных', () => {
    expect(overlayState(STACK, overlayNodeId(2)).Layer).toContainEqual({ key: 'depth among modals', value: 1 })
    expect(overlayState(STACK, overlayNodeId(3)).Layer).toContainEqual({ key: 'depth among modals', value: null })
  })

  it('разделяет «слою адресован Esc» и «слой по нему закроется»', () => {
    const behaviour = overlayState([layer({ id: 7, topmostForEscape: true, closesOnEscape: false })], overlayNodeId(7)).Behaviour

    expect(behaviour).toContainEqual({ key: 'owns Escape', value: true })
    expect(behaviour).toContainEqual({ key: 'closes on Escape', value: false })
  })

  it('исчезнувший слой не даёт состояния от соседа', () => {
    expect(overlayState(STACK, overlayNodeId(99))).toEqual({})
  })
})

describe('лента событий', () => {
  it('снимок в ленту не идёт: это состояние, а не происшествие', () => {
    expect(overlayTimelineEvent({ type: 'overlay:sync', layers: STACK })).toBeNull()
  })

  it('открытие модалки и обычного слоя подписаны по-разному', () => {
    expect(overlayTimelineEvent({ type: 'overlay:push', id: 1, modal: true, owner: null })?.title).toBe('Modal #1 opened')
    expect(overlayTimelineEvent({ type: 'overlay:push', id: 2, modal: false, owner: null })?.title).toBe('Layer #2 opened')
    // Владелец информативнее вида слоя: в приложении «Modal #1» ничего не говорит.
    expect(overlayTimelineEvent({ type: 'overlay:push', id: 3, modal: true, owner: 'GrPromptDialog' })?.title).toBe('GrPromptDialog #3 opened')
  })

  it('съеденный Esc помечен предупреждением: так же выглядит жалоба «Esc не работает»', () => {
    expect(overlayTimelineEvent({ type: 'overlay:escape', id: 1, closed: false })).toMatchObject({ logType: 'warning' })
    expect(overlayTimelineEvent({ type: 'overlay:escape', id: 1, closed: true })?.logType).toBeUndefined()
  })
})

describe('владелец и фокус в разделе', () => {
  it('подпись берёт имя открывшего компонента', () => {
    const nodes = overlayTree([layer({ id: 4, modal: true, owner: 'GrPromptDialog' })])

    expect(nodes[0]?.label).toBe('GrPromptDialog #4')
  })

  it('без владельца остаётся вид слоя: номер лучше пустоты', () => {
    expect(overlayTree([layer({ id: 5, modal: true })])[0]?.label).toBe('Modal #5')
  })

  it('состояние показывает, вернётся ли фокус и куда', () => {
    const layers = [layer({ id: 6, focus: { inside: true, willRestore: true, restoreTo: 'button «Открыть»' } })]
    const behaviour = overlayState(layers, overlayNodeId(6)).Behaviour

    expect(behaviour).toContainEqual({ key: 'will restore focus', value: true })
    expect(behaviour).toContainEqual({ key: 'restore to', value: 'button «Открыть»' })
  })

  it('«фокус внутри» и «фокус вернётся» — разные строки', () => {
    // Так выглядит слой с `restoreFocus: false`: фокус внутри, но возврата не будет.
    const layers = [layer({ id: 7, focus: { inside: true, willRestore: false, restoreTo: null } })]
    const behaviour = overlayState(layers, overlayNodeId(7)).Behaviour

    expect(behaviour).toContainEqual({ key: 'focus inside layer', value: true })
    expect(behaviour).toContainEqual({ key: 'will restore focus', value: false })
    expect(behaviour).toContainEqual({ key: 'restore to', value: '—' })
  })

  it('слой без данных о фокусе не добавляет пустых строк', () => {
    const behaviour = overlayState([layer({ id: 8 })], overlayNodeId(8)).Behaviour

    expect(behaviour.map(entry => entry.key)).toEqual(['owns Escape', 'closes on Escape', 'inert'])
  })
})
