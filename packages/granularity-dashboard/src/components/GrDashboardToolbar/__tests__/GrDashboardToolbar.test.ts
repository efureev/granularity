import { afterEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import { granularityGlobal, resetGranularityDom } from '@feugene/granularity/testing'

import GrDashboardToolbar from '../GrDashboardToolbar.vue'

afterEach(resetGranularityDom)

function toolbar(props: Record<string, unknown> = {}) {
  return mount(GrDashboardToolbar, { props, global: granularityGlobal() })
}

describe('grDashboardToolbar', () => {
  it('объявлен панелью инструментов с именем', () => {
    const wrapper = toolbar()
    const root = wrapper.element as HTMLElement

    expect(root.getAttribute('role')).toBe('toolbar')
    expect(root.getAttribute('aria-label')).toBeTruthy()
  })

  it('переключатель режима отражает состояние через aria-pressed', () => {
    expect(toolbar({ mode: 'edit' }).find('[aria-pressed="true"]').exists()).toBe(true)
    expect(toolbar({ mode: 'view' }).find('[aria-pressed="false"]').exists()).toBe(true)
  })

  it('нажатие переключает режим в обе стороны', async () => {
    const view = toolbar({ mode: 'view' })
    await view.find('[aria-pressed="false"]').trigger('click')
    expect(view.emitted('update:mode')?.[0]).toEqual(['edit'])

    const edit = toolbar({ mode: 'edit' })
    await edit.find('[aria-pressed="true"]').trigger('click')
    expect(edit.emitted('update:mode')?.[0]).toEqual(['view'])
  })

  it('кнопка сброса появляется только по просьбе', async () => {
    expect(toolbar().findAll('button')).toHaveLength(1)

    const wrapper = toolbar({ resettable: true })
    const buttons = wrapper.findAll('button')
    expect(buttons).toHaveLength(2)

    await buttons[0]?.trigger('click')
    expect(wrapper.emitted('reset')).toHaveLength(1)
  })

  it('disabled гасит обе кнопки', () => {
    const wrapper = toolbar({ resettable: true, disabled: true })

    expect(wrapper.findAll('button').every(button => button.attributes('disabled') !== undefined)).toBe(true)
  })

  it('вне дашборда работает от собственного пропа', () => {
    // Инжекта нет — компонент обязан остаться работоспособным: тулбар часто
    // стоит в шапке страницы, а сетка ниже по дереву.
    expect(() => toolbar({ mode: 'edit' })).not.toThrow()
  })
})

/**
 * На телефоне действия справа вылезали за край: группа — один элемент ряда и
 * сама не переносилась. Ширину меряет `apps/showcase/e2e/geometry.spec.ts`;
 * здесь — что группы переносятся внутри себя.
 */
describe('GrDashboardToolbar — группы переносятся', () => {
  it('и начальная, и конечная группа — `flex-wrap`', () => {
    const wrapper = mount(GrDashboardToolbar, {
      props: { mode: 'edit' },
      slots: { start: '<span>Sales overview</span>', end: '<button>Share</button>' },
      global: granularityGlobal(),
    })
    const groups = wrapper.findAll('span.flex')

    expect(groups.length).toBeGreaterThanOrEqual(2)
    for (const group of groups)
      expect(group.classes()).toContain('flex-wrap')
  })
})
