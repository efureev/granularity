import { afterEach, describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'

import { granularityGlobal, keydown, resetGranularityDom } from '@feugene/granularity/testing'

import type { GrDashboardResponsiveLayout } from '../../../layout'
import GrDashboard from '../../GrDashboard/GrDashboard.vue'
import GrDashboardItem from '../GrDashboardItem.vue'

afterEach(resetGranularityDom)

/** Ширины в jsdom нет, а от неё зависит выбор брейкпоинта. */
function stubWidth(width: number): () => void {
  const original = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'getBoundingClientRect')

  Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', {
    configurable: true,
    value: (): DOMRect => new DOMRect(0, 0, width, 0),
  })

  return () => {
    if (original) Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', original)
  }
}

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

  const restore = stubWidth(1200)
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

    if (scroll) Object.defineProperty(HTMLElement.prototype, 'scrollHeight', scroll)
    if (client) Object.defineProperty(HTMLElement.prototype, 'clientHeight', client)

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
