// @vitest-environment node

import { effectScope, nextTick, ref } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'

import { useOverlayLayer } from '../useOverlayLayer'
import { overlayStackSize, resetOverlayStack } from '../internal/overlayStack'

/**
 * Стек слоёв на сервере.
 *
 * Окружение здесь — настоящий Node, а не jsdom: `useOverlayLayer` отличает
 * сервер от клиента через `typeof window === 'undefined'`, и в jsdom `window`
 * есть, то есть серверная ветка не исполнялась бы вовсе.
 *
 * Дефект, ради которого написан: `onUnmounted` при `renderToString` не
 * вызывается, поэтому слой, заведённый на сервере, из модульного массива уже не
 * уходит. Каждый серверный рендер открытого оверлея копил бы там замыкание со
 * ссылками на компоненты своего запроса — медленная утечка памяти, которую по
 * отданному HTML не видно: оверлеи на сервере не рендерятся вовсе.
 */

afterEach(() => {
  resetOverlayStack()
})

describe('useOverlayLayer на сервере', () => {
  it('не заводит слой, даже когда оверлей открывается', async () => {
    const open = ref(false)
    const scope = effectScope()
    scope.run(() => useOverlayLayer(open, () => {}))

    expect(overlayStackSize()).toBe(0)

    open.value = true
    await nextTick()

    // Без гарда здесь был бы слой — и остался бы навсегда.
    expect(overlayStackSize()).toBe(0)

    scope.stop()
  })

  it('оверлей, открытый с самого начала, тоже не попадает в стек', async () => {
    const scope = effectScope()
    scope.run(() => useOverlayLayer(ref(true), () => {}))
    await nextTick()

    expect(overlayStackSize()).toBe(0)
    scope.stop()
  })
})
