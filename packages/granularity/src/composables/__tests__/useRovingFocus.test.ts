import { effectScope, ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'

import type { GrRovingEdge, GrRovingOrientation, UseRovingFocusOptions } from '../useRovingFocus'
import { useRovingFocus } from '../useRovingFocus'

/**
 * Набор адресуется строкой, а элементы существуют в DOM — иначе `focus()`
 * молча ничего не делает и тесты фокуса были бы тавтологией.
 */
type SetupOverrides = Partial<UseRovingFocusOptions<string>> & { disabledKeys?: string[] }

function setup(keys: string[], overrides: SetupOverrides = {}) {
  const list = ref(keys)
  const host = document.createElement('div')
  document.body.append(host)

  const nodes = new Map<string, HTMLElement>()
  for (const key of keys) {
    const el = document.createElement('button')
    el.dataset.key = key
    el.textContent = key
    host.append(el)
    nodes.set(key, el)
  }

  const scope = effectScope()
  const roving = scope.run(() => useRovingFocus<string>({
    items: () => list.value,
    elementFor: key => nodes.get(key) ?? null,
    isDisabled: key => overrides.disabledKeys?.includes(key) ?? false,
    ...overrides,
  }))!

  return {
    roving,
    list,
    nodes,
    focused: () => (document.activeElement as HTMLElement | null)?.dataset.key,
    dispose: () => {
      scope.stop()
      host.remove()
    },
  }
}

function key(name: string, init: KeyboardEventInit = {}): KeyboardEvent {
  return new KeyboardEvent('keydown', { key: name, cancelable: true, ...init })
}

describe('инвариант «ровно один tabindex=0»', () => {
  it('при непустом наборе роверный элемент есть всегда', () => {
    const { roving, dispose } = setup(['a', 'b', 'c'])

    expect(roving.rovingKey.value).toBe('a')
    expect(roving.tabindexFor('a')).toBe(0)
    expect(roving.tabindexFor('b')).toBe(-1)

    dispose()
  })

  it('пустой набор — роверного нет, и это не ошибка', () => {
    const { roving, dispose } = setup([])

    expect(roving.rovingKey.value).toBeUndefined()

    dispose()
  })

  it('стартовый ключ сильнее первого элемента', () => {
    const { roving, dispose } = setup(['a', 'b', 'c'], { initialKey: () => 'c' })

    expect(roving.rovingKey.value).toBe('c')

    dispose()
  })

  it('стартовый ключ вне набора игнорируется', () => {
    const { roving, dispose } = setup(['a', 'b'], { initialKey: () => 'zzz' })

    expect(roving.rovingKey.value).toBe('a')

    dispose()
  })

  it('исчезнувший из набора активный элемент не оставляет группу без остановки Tab', () => {
    // Ровно тот случай, ради которого `GrTree` держал нормализацию с
    // `watch(..., { flush: "sync" })`: свернули родителя — активный узел
    // пропал. Здесь это `computed`, поэтому самокоррекция бесплатна.
    const { roving, list, dispose } = setup(['a', 'b', 'c'])
    roving.setActive('c')
    expect(roving.rovingKey.value).toBe('c')

    list.value = ['a', 'b']
    expect(roving.rovingKey.value).toBe('a')

    dispose()
  })

  it('reset возвращает остановку к производной', () => {
    // Набор опустел и наполнился снова: без сброса всплыл бы ключ, наведённый
    // до опустошения, и остановка встала бы не туда.
    const { roving, list, dispose } = setup(['a', 'b', 'c'], { initialKey: () => 'a' })
    roving.setActive('c')
    expect(roving.rovingKey.value).toBe('c')

    list.value = []
    roving.reset()
    list.value = ['a', 'b', 'c']

    expect(roving.rovingKey.value).toBe('a')

    dispose()
  })

  it('при skipDisabled остановка Tab не встаёт на выключенный', () => {
    const { roving, dispose } = setup(['a', 'b', 'c'], {
      disabledKeys: ['a'],
      skipDisabled: () => true,
    })

    expect(roving.rovingKey.value).toBe('b')

    dispose()
  })

  it('без skipDisabled выключенный первый остаётся остановкой', () => {
    const { roving, dispose } = setup(['a', 'b'], { disabledKeys: ['a'] })

    expect(roving.rovingKey.value).toBe('a')

    dispose()
  })
})

describe('движение и кольцо', () => {
  it('moveBy переносит фокус и активность', async () => {
    const { roving, focused, dispose } = setup(['a', 'b', 'c'])

    roving.moveBy(1)
    expect(roving.rovingKey.value).toBe('b')
    expect(focused()).toBe('b')

    dispose()
  })

  it('кольцо замкнуто в обе стороны при wrap', () => {
    const { roving, dispose } = setup(['a', 'b', 'c'])

    roving.setActive('c')
    roving.moveBy(1)
    expect(roving.rovingKey.value).toBe('a')

    roving.moveBy(-1)
    expect(roving.rovingKey.value).toBe('c')

    dispose()
  })

  it('без wrap движение упирается в край и сообщает об этом', () => {
    const { roving, dispose } = setup(['a', 'b'], { wrap: () => false })

    roving.setActive('b')
    expect(roving.moveBy(1)).toBe(false)
    expect(roving.rovingKey.value).toBe('b')

    dispose()
  })

  it('onOverflow перехватывает упор в край — так GrInputTag отдаёт фокус полю', () => {
    const overflow = vi.fn<(edge: GrRovingEdge, delta: number) => boolean>(() => true)
    const { roving, dispose } = setup(['a', 'b'], { wrap: () => false, onOverflow: overflow })

    roving.setActive('b')
    expect(roving.moveBy(1)).toBe(true)
    expect(overflow).toHaveBeenCalledWith('end', 1)
    // Фокус остался на месте: увести его — дело компонента.
    expect(roving.rovingKey.value).toBe('b')

    dispose()
  })

  it('skipDisabled перешагивает выключенные, а без него они в кольце', () => {
    const skipping = setup(['a', 'b', 'c'], { disabledKeys: ['b'], skipDisabled: () => true })
    skipping.roving.setActive('a')
    skipping.roving.moveBy(1)
    expect(skipping.roving.rovingKey.value).toBe('c')
    skipping.dispose()

    const keeping = setup(['a', 'b', 'c'], { disabledKeys: ['b'] })
    keeping.roving.setActive('a')
    keeping.roving.moveBy(1)
    expect(keeping.roving.rovingKey.value).toBe('b')
    keeping.dispose()
  })

  it('весь набор выключен при skipDisabled — двигаться некуда, и это не зависание', () => {
    const { roving, dispose } = setup(['a', 'b'], {
      disabledKeys: ['a', 'b'],
      skipDisabled: () => true,
    })

    expect(roving.moveBy(1)).toBe(false)

    dispose()
  })

  it('onMove зовётся только на фактическом переезде', () => {
    const onMove = vi.fn()
    const { roving, dispose } = setup(['a', 'b'], { onMove })

    roving.moveBy(1)
    expect(onMove).toHaveBeenCalledWith('b', 'a')

    onMove.mockClear()
    void roving.focusKey('b')
    expect(onMove).not.toHaveBeenCalled()

    dispose()
  })
})

describe('ориентация', () => {
  const cases: Array<[GrRovingOrientation, string, boolean]> = [
    ['vertical', 'ArrowDown', true],
    ['vertical', 'ArrowUp', true],
    ['vertical', 'ArrowRight', false],
    ['vertical', 'ArrowLeft', false],
    ['horizontal', 'ArrowRight', true],
    ['horizontal', 'ArrowLeft', true],
    ['horizontal', 'ArrowDown', false],
    ['horizontal', 'ArrowUp', false],
    ['both', 'ArrowDown', true],
    ['both', 'ArrowRight', true],
  ]

  it.each(cases)('%s: %s обработана — %s', (orientation, keyName, handled) => {
    const { roving, dispose } = setup(['a', 'b', 'c'], { orientation: () => orientation })

    expect(roving.handleNavigationKeys(key(keyName))).toBe(handled)

    dispose()
  })

  it('клавиша с модификатором примитиву не принадлежит', () => {
    const { roving, dispose } = setup(['a', 'b'])

    expect(roving.handleNavigationKeys(key('ArrowDown', { metaKey: true }))).toBe(false)

    dispose()
  })

  it('обработанная клавиша гасится, необработанная — нет', () => {
    const { roving, dispose } = setup(['a', 'b'], { orientation: () => 'vertical' })

    const handled = key('ArrowDown')
    roving.handleNavigationKeys(handled)
    expect(handled.defaultPrevented).toBe(true)

    const ignored = key('ArrowRight')
    roving.handleNavigationKeys(ignored)
    expect(ignored.defaultPrevented).toBe(false)

    dispose()
  })
})

describe('сетка', () => {
  // 3×3: ключи по строкам.
  const grid = ['a1', 'a2', 'a3', 'b1', 'b2', 'b3', 'c1', 'c2', 'c3']

  function setupGrid(overrides: SetupOverrides = {}) {
    return setup(grid, { orientation: () => 'grid', columns: () => 3, ...overrides })
  }

  it('вертикаль ходит по строкам, горизонталь — по колонкам', () => {
    const { roving, dispose } = setupGrid()

    roving.setActive('a2')
    roving.handleNavigationKeys(key('ArrowDown'))
    expect(roving.rovingKey.value).toBe('b2')

    roving.handleNavigationKeys(key('ArrowRight'))
    expect(roving.rovingKey.value).toBe('b3')

    roving.handleNavigationKeys(key('ArrowUp'))
    expect(roving.rovingKey.value).toBe('a3')

    dispose()
  })

  it('Home и End — края строки, а не всего набора', () => {
    // В календаре это начало и конец недели.
    const { roving, dispose } = setupGrid()

    roving.setActive('b2')
    roving.handleNavigationKeys(key('Home'))
    expect(roving.rovingKey.value).toBe('b1')

    roving.handleNavigationKeys(key('End'))
    expect(roving.rovingKey.value).toBe('b3')

    dispose()
  })

  it('в линейном режиме Home и End — края всего набора', () => {
    const { roving, dispose } = setup(['a', 'b', 'c'])

    roving.setActive('b')
    roving.handleNavigationKeys(key('End'))
    expect(roving.rovingKey.value).toBe('c')

    roving.handleNavigationKeys(key('Home'))
    expect(roving.rovingKey.value).toBe('a')

    dispose()
  })

  it('вертикальное зацикливание сохраняет колонку, когда длина кратна ширине', () => {
    const { roving, dispose } = setupGrid()

    roving.setActive('c2')
    roving.handleNavigationKeys(key('ArrowDown'))
    expect(roving.rovingKey.value).toBe('a2')

    dispose()
  })

  it('без wrap выход за нижний край отдаётся компоненту — так календарь листает месяц', () => {
    const overflow = vi.fn(() => true)
    const { roving, dispose } = setupGrid({ wrap: () => false, onOverflow: overflow })

    roving.setActive('c2')
    expect(roving.handleNavigationKeys(key('ArrowDown'))).toBe(true)
    expect(overflow).toHaveBeenCalledWith('end', 3)

    dispose()
  })

  it('выключенная ячейка перешагивается по вертикали без смены колонки', () => {
    const { roving, dispose } = setupGrid({ disabledKeys: ['b2'], skipDisabled: () => true })

    roving.setActive('a2')
    roving.handleNavigationKeys(key('ArrowDown'))
    expect(roving.rovingKey.value).toBe('c2')

    dispose()
  })
})

describe('перенос фокуса', () => {
  it('setActive меняет остановку Tab, но фокус не трогает', () => {
    const { roving, focused, dispose } = setup(['a', 'b'])
    document.body.focus()

    roving.setActive('b')
    expect(roving.rovingKey.value).toBe('b')
    expect(focused()).toBeUndefined()

    dispose()
  })

  it('focusKey без beforeFocus переносит фокус синхронно', () => {
    // Синхронность — часть контракта: `GrDropdown` фокусирует пункт прямо в
    // обработчике клавиши, и переход на микрозадачу сломал бы его тесты.
    const { roving, focused, dispose } = setup(['a', 'b'])

    void roving.focusKey('b')
    expect(focused()).toBe('b')

    dispose()
  })

  it('асинхронный beforeFocus откладывает фокус до готовности — случай виртуализации', async () => {
    let resolve: (() => void) | undefined
    const beforeFocus = vi.fn(() => new Promise<void>((r) => { resolve = r }))
    const { roving, focused, dispose } = setup(['a', 'b'], { beforeFocus })

    const pending = roving.focusKey('b')
    expect(beforeFocus).toHaveBeenCalledWith('b')
    // Узел ещё не отрисован — фокус ставить рано.
    expect(focused()).not.toBe('b')

    resolve!()
    await pending
    expect(focused()).toBe('b')

    dispose()
  })

  it('движение стартует от роверного элемента, даже если фокуса в группе ещё не было', () => {
    // Отдельной ветки «активного нет» в `moveBy` нет и быть не может:
    // при непустом наборе `rovingKey` всегда кто-то, это и есть инвариант.
    const { roving, focused, dispose } = setup(['a', 'b', 'c'], {
      disabledKeys: ['a'],
      skipDisabled: () => true,
    })

    expect(roving.rovingKey.value).toBe('b')
    roving.moveBy(1)
    expect(focused()).toBe('c')

    dispose()
  })

  it('на пустом наборе движение невозможно', () => {
    const { roving, dispose } = setup([])

    expect(roving.moveBy(1)).toBe(false)
    expect(roving.moveToEdge('end')).toBe(false)

    dispose()
  })
})
