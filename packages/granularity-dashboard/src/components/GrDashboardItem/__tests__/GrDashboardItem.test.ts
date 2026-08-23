import { afterEach, describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'

import { granularityGlobal, keydown, resetGranularityDom } from '@feugene/granularity/testing'
import { stubElementRects } from '@feugene/granularity-test-kit/vue'

import type { GrDashboardResponsiveLayout } from '../../../layout'
import type { GrDashboardContext } from '../../GrDashboard/context'
import { useGrDashboardContext } from '../../GrDashboard/context'
import GrDashboard from '../../GrDashboard/GrDashboard.vue'
import GrDashboardItem from '../GrDashboardItem.vue'

afterEach(resetGranularityDom)

interface StandOptions {
  mode?: 'view' | 'edit'
  props?: Record<string, unknown>
  slots?: Record<string, () => unknown>
}

function stand(options: StandOptions = {}) {
  const layout = ref<GrDashboardResponsiveLayout>({ lg: [{ id: 'solo', x: 0, y: 0, w: 6, h: 3 }] })

  const Stand = defineComponent({
    setup: () => () => h(
      GrDashboard,
      {
        'layout': layout.value,
        'mode': options.mode ?? 'edit',
        'onUpdate:layout': (value: GrDashboardResponsiveLayout) => { layout.value = value },
      },
      () => [
        h(
          GrDashboardItem,
          { itemId: 'solo', ...options.props },
          { default: () => 'содержимое', ...options.slots },
        ),
      ],
    ),
  })

  const restore = stubElementRects({ width: 1200 })
  const wrapper = mount(Stand, { attachTo: document.body, global: granularityGlobal() })
  restore()

  return { root: wrapper.element as HTMLElement, layout }
}

const query = (root: HTMLElement, selector: string) => root.querySelector<HTMLElement>(selector)

describe('grDashboardItem: виджет без шапки', () => {
  it('шапки нет ни в одном режиме, если показывать в ней нечего', () => {
    // Раньше в режиме редактирования шапка появлялась ради одной ручки, и
    // содержимое сжималось на её высоту при каждом переключении режима.
    expect(query(stand({ mode: 'view' }).root, '[data-gr-card-header]')).toBeNull()
    expect(query(stand({ mode: 'edit' }).root, '[data-gr-card-header]')).toBeNull()
  })

  it('заголовок, слот шапки или действия — каждый включает шапку', () => {
    expect(query(stand({ props: { title: 'Отчёт' } }).root, '[data-gr-card-header]')).not.toBeNull()
    expect(query(stand({ slots: { header: () => 'своя шапка' } }).root, '[data-gr-card-header]')).not.toBeNull()
    expect(query(stand({ slots: { actions: () => 'кнопка' } }).root, '[data-gr-card-header]')).not.toBeNull()
  })

  it('ручка переноса переезжает в панель поверх содержимого', () => {
    const { root } = stand()
    const overlay = query(root, '[data-gr-dashboard-overlay-header]')

    expect(overlay).not.toBeNull()
    expect(overlay?.querySelector('[data-gr-dashboard-drag-handle]')).not.toBeNull()
  })

  it('в режиме просмотра панели нет вовсе', () => {
    expect(query(stand({ mode: 'view' }).root, '[data-gr-dashboard-overlay-header]')).toBeNull()
  })

  it('у статичного виджета панели нет: тащить его нельзя, а действий не объявлено', () => {
    expect(query(stand({ props: { static: true } }).root, '[data-gr-dashboard-overlay-header]')).toBeNull()
  })

  it('клавиатурный перенос работает так же, как у виджета с шапкой', async () => {
    const { root, layout } = stand()
    const handle = query(root, '[data-gr-dashboard-drag-handle]')!

    keydown(handle, ' ')
    keydown(handle, 'ArrowRight')
    await nextTick()

    expect(layout.value.lg?.[0]?.x).toBe(1)
  })
})

describe('grDashboardItem: запрет переноса и растягивания', () => {
  const dragHandle = (root: HTMLElement) => query(root, '[data-gr-dashboard-drag-handle]')
  const resizeHandle = (root: HTMLElement) => query(root, '[data-gr-dashboard-resize-handle]')

  it('resizable=false убирает уголок, но тащить виджет по-прежнему можно', async () => {
    const { root, layout } = stand({ props: { resizable: false } })

    expect(resizeHandle(root)).toBeNull()
    expect(dragHandle(root)).not.toBeNull()

    keydown(dragHandle(root)!, ' ')
    keydown(dragHandle(root)!, 'ArrowRight')
    await nextTick()

    expect(layout.value.lg?.[0]?.x).toBe(1)
  })

  it('запрет живёт в сетке, а не в разметке: обработчик отказывает и без ручки', async () => {
    // Спрятать кнопку мало. Жест и клавиатура идут через контекст, и запрет,
    // который держится на «кнопку не отрисовали», снимается первым же прямым
    // вызовом — поэтому спрашиваем сам контекст.
    let context: GrDashboardContext | null = null
    const layout = ref<GrDashboardResponsiveLayout>({ lg: [{ id: 'solo', x: 0, y: 0, w: 6, h: 3 }] })

    const Spy = defineComponent({
      setup: () => {
        context = useGrDashboardContext()

        return () => null
      },
    })

    const Stand = defineComponent({
      setup: () => () => h(
        GrDashboard,
        {
          'layout': layout.value,
          'mode': 'edit',
          'onUpdate:layout': (value: GrDashboardResponsiveLayout) => { layout.value = value },
        },
        () => [
          h(GrDashboardItem, { itemId: 'solo', resizable: false }),
          h(Spy),
        ],
      ),
    })

    const restore = stubElementRects({ width: 1200 })
    mount(Stand, { attachTo: document.body, global: granularityGlobal() })
    restore()
    await nextTick()

    context!.onResizeKeydown('solo', new KeyboardEvent('keydown', { key: 'ArrowRight' }))
    await nextTick()

    expect(layout.value.lg?.[0]?.w).toBe(6)
  })

  it('draggable=false убирает ручку, но растягивать можно', async () => {
    const { root, layout } = stand({ props: { draggable: false } })

    expect(dragHandle(root)).toBeNull()
    expect(resizeHandle(root)).not.toBeNull()

    keydown(resizeHandle(root)!, 'ArrowRight')
    await nextTick()

    expect(layout.value.lg?.[0]?.w).toBe(7)
  })

  it('static сильнее обоих: ни ручки, ни уголка', () => {
    const { root } = stand({ props: { static: true, draggable: true, resizable: true } })

    expect(dragHandle(root)).toBeNull()
    expect(resizeHandle(root)).toBeNull()
  })

  it('без своих пропов виджет слушается сетки', () => {
    const both = stand()
    expect(dragHandle(both.root)).not.toBeNull()
    expect(resizeHandle(both.root)).not.toBeNull()
  })
})

describe('grDashboardItem: видимость панели', () => {
  function overlayOf(root: HTMLElement): HTMLElement {
    return query(root, '[data-gr-dashboard-overlay-header]')!
  }

  it('без наведения панель скрыта, но остаётся в таб-порядке', () => {
    // Убрать её из DOM значило бы убрать ручку из обхода клавиатурой.
    const { root } = stand()

    expect(overlayOf(root).className).toContain('opacity-0')
    expect(overlayOf(root).querySelector('[data-gr-dashboard-drag-handle]')).not.toBeNull()
  })

  it('наведение показывает панель, увод — прячет', async () => {
    const { root } = stand()
    const item = query(root, '[data-gr-dashboard-item]')!

    item.dispatchEvent(new MouseEvent('pointerenter', { bubbles: false }))
    await nextTick()
    expect(overlayOf(root).className).toContain('opacity-100')

    item.dispatchEvent(new MouseEvent('pointerleave', { bubbles: false }))
    await nextTick()
    expect(overlayOf(root).className).toContain('opacity-0')
  })

  it('фокус внутри показывает панель: иначе клавиатура вела бы фокус в пустоту', async () => {
    const { root } = stand()
    const item = query(root, '[data-gr-dashboard-item]')!

    item.dispatchEvent(new FocusEvent('focusin', { bubbles: true }))
    await nextTick()

    expect(overlayOf(root).className).toContain('opacity-100')
  })

  it('взятый с клавиатуры виджет держит панель открытой', async () => {
    const { root } = stand()
    const handle = query(root, '[data-gr-dashboard-drag-handle]')!

    keydown(handle, ' ')
    await nextTick()

    expect(overlayOf(root).className).toContain('opacity-100')
  })
})

describe('grDashboardItem: отступы и прокрутка', () => {
  const bodyOf = (root: HTMLElement) => query(root, '[data-gr-card-body] > div')!

  it('по умолчанию отступы берутся от размера', () => {
    expect(bodyOf(stand({ props: { size: 'md' } }).root).className).toContain('p-4')
    expect(bodyOf(stand({ props: { size: 'sm' } }).root).className).toContain('p-3')
  })

  it('padding="none" отдаёт виджет содержимому целиком', () => {
    const body = bodyOf(stand({ props: { padding: 'none' } }).root)

    expect(body.className).not.toMatch(/(?:^|\s)p-\d/)
  })

  it('padding не трогает подвал: он остаётся служебной полосой', () => {
    const { root } = stand({ props: { padding: 'none' }, slots: { footer: () => 'подпись' } })
    const footer = query(root, '[data-gr-card-footer] > div')!

    expect(footer.className).toMatch(/(?:^|\s)p-\d/)
  })

  it('overflow="hidden" снимает прокрутку', () => {
    const body = bodyOf(stand({ props: { overflow: 'hidden' } }).root)

    expect(body.className).toContain('overflow-hidden')
    expect(body.className).not.toContain('overflow-auto')
  })

  it('overflow="hidden" не даёт телу остановку Tab даже при переполнении', () => {
    // Обратная половина гейта `scrollable-region-focusable`: там, где прокрутки
    // нет, остановка `Tab` — лишний шум в обходе.
    const scroll = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'scrollHeight')
    const client = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientHeight')
    Object.defineProperty(HTMLElement.prototype, 'scrollHeight', { configurable: true, value: 400 })
    Object.defineProperty(HTMLElement.prototype, 'clientHeight', { configurable: true, value: 200 })

    const body = bodyOf(stand({ props: { overflow: 'hidden' } }).root)

    if (scroll)
      Object.defineProperty(HTMLElement.prototype, 'scrollHeight', scroll)
    if (client)
      Object.defineProperty(HTMLElement.prototype, 'clientHeight', client)

    expect(body.getAttribute('tabindex')).toBeNull()
  })
})

describe('grDashboardItem: имя виджета', () => {
  it('безымянный виджет не объявляется группой', () => {
    // `role="group"` без имени скринридер прочтёт как «группа» и ничего больше.
    expect(query(stand().root, '[data-gr-dashboard-item]')?.getAttribute('role')).toBeNull()
  })

  it('заголовок и ariaLabel дают роль с именем', () => {
    const titled = query(stand({ props: { title: 'Отчёт' } }).root, '[data-gr-dashboard-item]')!
    expect(titled.getAttribute('role')).toBe('group')
    expect(titled.getAttribute('aria-labelledby')).toBeTruthy()

    const labelled = query(stand({ props: { ariaLabel: 'Карта' } }).root, '[data-gr-dashboard-item]')!
    expect(labelled.getAttribute('role')).toBe('group')
    expect(labelled.getAttribute('aria-label')).toBe('Карта')
  })
})

describe('grDashboardItem: действия режима редактирования', () => {
  it('слот editActions живёт в панели, когда шапки нет', () => {
    const { root } = stand({ slots: { editActions: () => h('button', { 'data-remove': '' }, '×') } })

    expect(query(root, '[data-gr-dashboard-overlay-header] [data-remove]')).not.toBeNull()
  })

  it('при своей шапке действия редактирования едут в неё', () => {
    const { root } = stand({
      props: { title: 'Отчёт' },
      slots: { editActions: () => h('button', { 'data-remove': '' }, '×') },
    })

    expect(query(root, '[data-gr-dashboard-overlay-header]')).toBeNull()
    expect(query(root, '[data-gr-card-header] [data-remove]')).not.toBeNull()
  })

  it('в режиме просмотра действий редактирования нет', () => {
    const { root } = stand({
      mode: 'view',
      props: { title: 'Отчёт' },
      slots: { editActions: () => h('button', { 'data-remove': '' }, '×') },
    })

    expect(query(root, '[data-remove]')).toBeNull()
  })
})

describe('grDashboardItem: кнопка настроек', () => {
  const settingsButton = (root: HTMLElement) => query(root, '[data-gr-dashboard-settings-button]')

  it('появляется только в режиме редактирования', () => {
    expect(settingsButton(stand({ mode: 'view', props: { showSettings: true } }).root)).toBeNull()
    expect(settingsButton(stand({ mode: 'edit', props: { showSettings: true } }).root)).not.toBeNull()
  })

  it('едет в шапку, когда шапка есть, и в панель, когда её нет', () => {
    const withHeader = stand({ props: { showSettings: true, title: 'Продажи' } }).root
    expect(withHeader.querySelector('[data-gr-card-header] [data-gr-dashboard-settings-button]')).not.toBeNull()

    const headless = stand({ props: { showSettings: true } }).root
    expect(headless.querySelector('[data-gr-dashboard-overlay-header] [data-gr-dashboard-settings-button]')).not.toBeNull()
  })

  it('сама шапку не включает: переключение режима не должно сдвигать содержимое', () => {
    const { root } = stand({ props: { showSettings: true } })

    expect(query(root, '[data-gr-card-header]')).toBeNull()
  })

  it('нажатие эмитит settings у виджета и уходит в сетку', async () => {
    const seen: string[] = []
    const { root } = stand({ props: { showSettings: true, onSettings: (id: string) => seen.push(id) } })

    settingsButton(root)?.click()
    await nextTick()

    expect(seen).toEqual(['solo'])
  })

  it('имя кнопки содержит заголовок виджета, а окно объявлено через aria-haspopup', () => {
    const { root } = stand({ props: { showSettings: true, title: 'Продажи' } })
    const button = settingsButton(root)

    expect(button?.getAttribute('aria-label')).toContain('Продажи')
    expect(button?.getAttribute('aria-haspopup')).toBe('dialog')
  })

  it('скрытая панель оставляет кнопку в DOM и в таб-порядке', () => {
    // Панель гаснет прозрачностью, а не `v-if`: убери её из разметки — и фокус
    // после закрытия окна возвращать будет некуда.
    const { root } = stand({ props: { showSettings: true } })
    const button = settingsButton(root)

    expect(button).not.toBeNull()
    expect(button?.hasAttribute('disabled')).toBe(false)
    expect(button?.getAttribute('tabindex')).toBeNull()
  })
})
