import type { Component } from 'vue'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { h, nextTick } from 'vue'

import GrDrawer from '../components/GrDrawer'
import GrImageViewer from '../components/GrImageViewer'
import GrModal from '../components/GrModal'
import GrSidebar from '../components/GrSidebar'
import { resetScrollLock } from '../composables/internal/useScrollLock'
import { resetGranularityDom } from '../testing'

/**
 * Модальный слой доигрывает уход в DOM, растянутым на вьюпорт, — и всё это время
 * не адресован указателю: клик достаётся элементу под ним, а не исчезающему слою.
 * `inert` снимает с поддерева попадаемость целиком, включая потомков с
 * `pointer-events: auto` (тулбары просмотрщика, панель немодального дровера), —
 * `pointer-events: none` на корне их бы не остановил.
 *
 * Наблюдаемо в jsdom потому, что VTU заглушает `<Transition>` и `@after-leave`
 * не приходит: слой залипает ровно в состоянии «идёт уход».
 */
interface OverlayCase {
  name: string
  component: Component
  openProps: Record<string, unknown>
  closeProps: Record<string, unknown>
  root: string
}

const CASES: OverlayCase[] = [
  { name: 'GrModal', component: GrModal, openProps: { modelValue: true, ariaLabel: 'Окно' }, closeProps: { modelValue: false }, root: '[data-gr-overlay-root]' },
  { name: 'GrDrawer', component: GrDrawer, openProps: { modelValue: true, ariaLabel: 'Панель' }, closeProps: { modelValue: false }, root: '[data-gr-drawer]' },
  { name: 'GrDrawer :modal="false"', component: GrDrawer, openProps: { modelValue: true, modal: false, ariaLabel: 'Панель' }, closeProps: { modelValue: false }, root: '[data-gr-drawer]' },
  { name: 'GrImageViewer', component: GrImageViewer, openProps: { modelValue: true, urlList: ['a.png', 'b.png'] }, closeProps: { modelValue: false }, root: '[data-gr-overlay-root]' },
  { name: 'GrSidebar overlay', component: GrSidebar, openProps: { overlay: true, open: true, ariaLabel: 'Меню' }, closeProps: { open: false }, root: '[data-gr-sidebar-layer]' },
]

async function settle(): Promise<void> {
  for (let i = 0; i < 3; i++) {
    await new Promise(resolve => requestAnimationFrame(() => resolve(null)))
    await nextTick()
  }
}

afterEach(() => {
  resetScrollLock()
  resetGranularityDom()
})

describe('уходящий модальный слой не перехватывает указатель', () => {
  it.each(CASES)('$name: открытый корень живой, уходящий — inert', async ({ component, openProps, closeProps, root }) => {
    const wrapper = mount(component, {
      attachTo: document.body,
      props: openProps,
      slots: { default: () => h('button', 'Внутри') },
    })
    await settle()

    const layer = () => document.querySelector(root)

    expect(layer(), 'слой открыт').not.toBeNull()
    expect(layer()!.hasAttribute('inert')).toBe(false)

    await wrapper.setProps(closeProps)
    await nextTick()

    expect(layer(), 'слой обязан оставаться в DOM до конца анимации').not.toBeNull()
    expect(layer()!.hasAttribute('inert')).toBe(true)

    wrapper.unmount()
  })

  it('GrSidebar вне overlay: корень в потоке страницы не гаснет никогда', async () => {
    const wrapper = mount(GrSidebar, {
      attachTo: document.body,
      props: { overlay: true, open: true, ariaLabel: 'Меню' },
      slots: { default: () => h('button', 'Внутри') },
    })
    await settle()

    // Режим сменился, пока слой был открыт: ухода нет — панель осталась в раскладке.
    await wrapper.setProps({ overlay: false })
    await settle()

    expect(document.querySelector('[inert]')).toBeNull()

    wrapper.unmount()
  })
})
