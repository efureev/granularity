import { afterEach, describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'

import { granularityGlobal, resetGranularityDom } from '@feugene/granularity/testing'
import { stubElementRects } from '@feugene/granularity-test-kit/vue'

import type { GrDashboardResponsiveLayout } from '../../../layout'
import GrDashboard from '../../GrDashboard/GrDashboard.vue'
import GrDashboardItem from '../../GrDashboardItem/GrDashboardItem.vue'
import GrDashboardItemSettings from '../GrDashboardItemSettings.vue'

afterEach(resetGranularityDom)

interface StandOptions {
  mode?: 'view' | 'edit'
  layout?: GrDashboardResponsiveLayout
  itemProps?: Record<string, unknown>
  dialogProps?: Record<string, unknown>
  slots?: Record<string, (...args: never[]) => unknown>
  preventCollision?: boolean
  /** Окно снаружи сетки: контекста у него нет, и блока размера тоже. */
  detached?: boolean
}

function defaultLayout(): GrDashboardResponsiveLayout {
  return { lg: [{ id: 'sales', x: 0, y: 0, w: 4, h: 2 }] }
}

function stand(options: StandOptions = {}) {
  const layout = ref(options.layout ?? defaultLayout())
  const open = ref(true)
  const applied: Array<{ id: string, span: { w: number, h: number } }> = []
  const cancelled: string[] = []

  const dialog = () => h(
    GrDashboardItemSettings,
    {
      'modelValue': open.value,
      'itemId': 'sales',
      'onUpdate:modelValue': (value: boolean) => { open.value = value },
      'onApply': (id: string, span: { w: number, h: number }) => applied.push({ id, span }),
      'onCancel': (id: string) => cancelled.push(id),
      ...options.dialogProps,
    },
    options.slots,
  )

  const Stand = defineComponent({
    setup: () => () => {
      const grid = h(
        GrDashboard,
        {
          'layout': layout.value,
          'mode': options.mode ?? 'edit',
          'preventCollision': options.preventCollision,
          'onUpdate:layout': (value: GrDashboardResponsiveLayout) => { layout.value = value },
        },
        () => [
          h(GrDashboardItem, { itemId: 'sales', title: 'Продажи', ...options.itemProps }, { default: () => 'график' }),
          ...(options.detached ? [] : [dialog()]),
        ],
      )

      return options.detached ? h('div', [grid, dialog()]) : grid
    },
  })

  const restore = stubElementRects({ width: 1200 })
  const wrapper = mount(Stand, {
    attachTo: document.body,
    global: { ...granularityGlobal(), stubs: { teleport: true, transition: false } },
  })
  restore()

  return { wrapper, layout, open, applied, cancelled }
}

function width(wrapper: ReturnType<typeof stand>['wrapper']) {
  return wrapper.find('input[data-gr-dashboard-settings-width]')
}

function height(wrapper: ReturnType<typeof stand>['wrapper']) {
  return wrapper.find('input[data-gr-dashboard-settings-height]')
}

function buttonByText(wrapper: ReturnType<typeof stand>['wrapper'], text: string): HTMLElement {
  const found = wrapper.findAll('button').find(button => button.text().trim() === text)
  if (!found)
    throw new Error(`кнопка не найдена: ${text}`)

  return found.element
}

describe('grDashboardItemSettings: размер виджета', () => {
  it('поля наполняются текущим размером виджета', async () => {
    const { wrapper } = stand()
    await nextTick()

    expect((width(wrapper).element as HTMLInputElement).value).toBe('4')
    expect((height(wrapper).element as HTMLInputElement).value).toBe('2')
  })

  it('верхняя граница ширины — не число колонок, а то, что осталось до правого края', async () => {
    // `resizeItem` режет ширину по `cols - x`: виджет растёт вправо. Поле,
    // предлагающее двенадцать при `x = 8`, молча отдало бы четыре.
    const { wrapper } = stand({ layout: { lg: [{ id: 'sales', x: 8, y: 0, w: 2, h: 2 }] } })
    await nextTick()

    expect(width(wrapper).attributes('aria-valuemax')).toBe('4')
  })

  it('границы виджета сужают поля', async () => {
    const { wrapper } = stand({ itemProps: { minW: 3, maxW: 6, minH: 2, maxH: 5 } })
    await nextTick()

    expect(width(wrapper).attributes('aria-valuemin')).toBe('3')
    expect(width(wrapper).attributes('aria-valuemax')).toBe('6')
    expect(height(wrapper).attributes('aria-valuemin')).toBe('2')
    expect(height(wrapper).attributes('aria-valuemax')).toBe('5')
  })

  it('«Применить» коммитит размер через сетку и закрывает окно', async () => {
    const { wrapper, layout, open, applied } = stand()
    await nextTick()

    await width(wrapper).setValue('6')
    buttonByText(wrapper, 'Apply').click()
    await nextTick()

    expect(layout.value.lg?.find(item => item.id === 'sales')?.w).toBe(6)
    expect(applied).toEqual([{ id: 'sales', span: { w: 6, h: 2 } }])
    expect(open.value).toBe(false)
  })

  it('«Отмена» не коммитит ничего, а черновик набирается заново', async () => {
    const { wrapper, layout, open, cancelled } = stand()
    await nextTick()

    await width(wrapper).setValue('6')
    buttonByText(wrapper, 'Cancel').click()
    await nextTick()

    expect(layout.value.lg?.find(item => item.id === 'sales')?.w).toBe(4)
    expect(cancelled).toEqual(['sales'])
    expect(open.value).toBe(false)

    open.value = true
    await nextTick()
    expect((width(wrapper).element as HTMLInputElement).value).toBe('4')
  })

  it('отказ оставляет окно открытым и объясняет себя', async () => {
    const { wrapper, open } = stand({
      preventCollision: true,
      layout: {
        lg: [
          { id: 'sales', x: 0, y: 0, w: 4, h: 2 },
          { id: 'wall', x: 4, y: 0, w: 8, h: 2 },
        ],
      },
    })
    await nextTick()

    await width(wrapper).setValue('8')
    buttonByText(wrapper, 'Apply').click()
    await nextTick()

    expect(open.value).toBe(true)
    expect(wrapper.find('[data-gr-dashboard-settings-refusal]').exists()).toBe(true)
  })
})

describe('grDashboardItemSettings: когда блока размера нет', () => {
  const hasSize = (wrapper: ReturnType<typeof stand>['wrapper']) =>
    wrapper.find('input[data-gr-dashboard-settings-width]').exists()

  it('в режиме просмотра, у статики и при resizable=false', async () => {
    const viewing = stand({ mode: 'view' })
    const pinned = stand({ itemProps: { static: true } })
    const fixed = stand({ itemProps: { resizable: false } })
    await nextTick()

    expect(hasSize(viewing.wrapper)).toBe(false)
    expect(hasSize(pinned.wrapper)).toBe(false)
    expect(hasSize(fixed.wrapper)).toBe(false)
  })

  it('по пропу hideSize', async () => {
    const { wrapper } = stand({ dialogProps: { hideSize: true } })
    await nextTick()

    expect(hasSize(wrapper)).toBe(false)
  })

  it('вне сетки окно не падает, а слот приложения продолжает работать', async () => {
    const { wrapper } = stand({
      detached: true,
      slots: { default: () => h('p', { 'data-app-fields': '' }, 'период') },
    })
    await nextTick()

    expect(wrapper.findAll('[data-app-fields]').length).toBeGreaterThan(0)
  })
})

describe('grDashboardItemSettings: слоты', () => {
  it('поля приложения рисуются над размером', async () => {
    const { wrapper } = stand({ slots: { default: () => h('p', { 'data-app-fields': '' }, 'период') } })
    await nextTick()

    const body = wrapper.find('[data-gr-dashboard-item-settings]').element
    const html = body.innerHTML

    expect(html.indexOf('data-app-fields')).toBeLessThan(html.indexOf('data-gr-dashboard-settings-width'))
  })

  it('слот подвала заменяет кнопки целиком', async () => {
    const { wrapper } = stand({ slots: { footer: () => h('button', { 'data-own-footer': '' }, 'Своя') } })
    await nextTick()

    expect(wrapper.find('[data-own-footer]').exists()).toBe(true)
    expect(wrapper.findAll('button').some(button => button.text().trim() === 'Apply')).toBe(false)
  })
})
