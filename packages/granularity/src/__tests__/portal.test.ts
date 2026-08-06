import { mount } from '@vue/test-utils'
import { defineComponent, nextTick, ref } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'

import GrModal from '../components/GrModal/GrModal.vue'
import GrSelect from '../components/GrSelect/GrSelect.vue'
import GrToaster from '../components/GrToaster/GrToaster.vue'
import { GR_PORTAL_ID, getPortalRoot, resetPortalRoot } from '../composables/internal/portalRoot'
import { resetOverlayStack } from '../composables/internal/overlayStack'
import { resetScrollLock } from '../composables/internal/useScrollLock'

/**
 * Единая точка монтирования оверлеев.
 *
 * Тесты специально идут **без** стаба телепорта: смысл портала именно в том,
 * куда компонент уезжает в реальном DOM.
 */

afterEach(() => {
  resetOverlayStack()
  resetScrollLock()
  resetPortalRoot()
  document.body.innerHTML = ''
})

const portal = () => getPortalRoot()

describe('портал оверлеев', () => {
  it('модальное окно уезжает в портал, а не в body напрямую', async () => {
    const wrapper = mount(GrModal, {
      props: { modelValue: true, ariaLabel: 'X' },
      slots: { default: '<div data-testid="body">Body</div>' },
      attachTo: document.body,
    })
    await nextTick()

    const root = document.querySelector('[data-gr-overlay-root]')!

    expect(portal()).not.toBeNull()
    expect(root.parentElement).toBe(portal())
    expect(root.parentElement).not.toBe(document.body)

    wrapper.unmount()
  })

  it('панель селекта — в том же портале, что и окна', async () => {
    // Панель существует только в кастомном режиме: нативный `<select>` ничего
    // не телепортирует.
    const wrapper = mount(GrSelect, {
      props: { modelValue: '', options: [{ value: 'a', label: 'A' }], optionsView: 'panel' },
      attachTo: document.body,
    })
    await nextTick()

    const panel = document.querySelector('[data-testid="gr-select-panel"]')
    expect(panel).not.toBeNull()
    expect(portal()!.contains(panel)).toBe(true)

    wrapper.unmount()
  })

  it('тостер тоже живёт в портале', async () => {
    const wrapper = mount(GrToaster, { attachTo: document.body })
    await nextTick()

    const toaster = document.querySelector('[data-gr-toaster]')
    expect(toaster).not.toBeNull()
    expect(portal()!.contains(toaster)).toBe(true)

    wrapper.unmount()
  })

  it('порядок в портале совпадает с порядком открытия', async () => {
    const Harness = defineComponent({
      components: { GrModal },
      setup: () => ({ first: ref(true), second: ref(false) }),
      template: `
        <div>
          <GrModal v-model="first" aria-label="Первое"><span data-testid="first" /></GrModal>
          <GrModal v-model="second" aria-label="Второе"><span data-testid="second" /></GrModal>
        </div>
      `,
    })

    const wrapper = mount(Harness, { attachTo: document.body })
    await nextTick()

    ;(wrapper.vm as unknown as { second: boolean }).second = true
    await nextTick()

    const roots = [...portal()!.querySelectorAll('[data-gr-overlay-root]')]
    expect(roots).toHaveLength(2)
    // Кто открыт позже — тот ниже по документу, то есть выше на экране. Тот же
    // порядок держит стек слоёв для Esc и `inert`.
    expect(roots[0].querySelector('[data-testid="first"]')).not.toBeNull()
    expect(roots[1].querySelector('[data-testid="second"]')).not.toBeNull()

    wrapper.unmount()
  })

  it('тост остаётся живым при открытой модалке', async () => {
    const toaster = mount(GrToaster, { attachTo: document.body })
    await nextTick()

    const modal = mount(GrModal, {
      props: { modelValue: true, ariaLabel: 'X' },
      slots: { default: '<div />' },
      attachTo: document.body,
    })
    await nextTick()

    // Тостер сидит на самом верхнем слое шкалы именно затем, чтобы сообщение об
    // ошибке фонового запроса дошло и при открытом окне. Пометь его `inert` —
    // и оно не читается диктором, а кнопка в тосте недостижима.
    const region = document.querySelector('[data-gr-toaster]')!
    expect(region.hasAttribute('inert')).toBe(false)
    expect(region.getAttribute('aria-hidden')).toBeNull()

    modal.unmount()
    toaster.unmount()
  })

  it('страница под окном инертна, а сам портал — нет', async () => {
    const page = document.createElement('main')
    document.body.appendChild(page)

    const wrapper = mount(GrModal, {
      props: { modelValue: true, ariaLabel: 'X' },
      slots: { default: '<div />' },
      attachTo: document.body,
    })
    await nextTick()

    expect(page.hasAttribute('inert')).toBe(true)
    expect(portal()!.hasAttribute('inert')).toBe(false)
    expect(document.getElementById(GR_PORTAL_ID)!.hasAttribute('aria-hidden')).toBe(false)

    wrapper.unmount()
    await nextTick()

    expect(page.hasAttribute('inert')).toBe(false)
  })
})
