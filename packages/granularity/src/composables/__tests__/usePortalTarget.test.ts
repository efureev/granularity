import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'

import GrConfigProvider from '../../components/GrConfigProvider/GrConfigProvider.vue'
import { GR_PORTAL_ID, ensurePortalRoot, getPortalRoot, resetPortalRoot } from '../internal/portalRoot'
import { usePortalTarget } from '../usePortalTarget'

afterEach(() => {
  resetPortalRoot()
  document.body.innerHTML = ''
})

describe('корень портала', () => {
  it('создаётся лениво и в единственном экземпляре', () => {
    expect(getPortalRoot()).toBeNull()

    const first = ensurePortalRoot()
    const second = ensurePortalRoot()

    expect(first).not.toBeNull()
    expect(second).toBe(first)
    expect(document.querySelectorAll(`#${GR_PORTAL_ID}`)).toHaveLength(1)
    expect(first!.parentElement).toBe(document.body)
  })

  it('не несёт ни стилей, ни классов', () => {
    // `transform`, `filter`, `contain` у корня сделали бы его containing block
    // для `position: fixed` — и все панели `useFloating` начали бы считать
    // позицию от портала, а не от вьюпорта.
    const root = ensurePortalRoot()!

    expect(root.getAttribute('style')).toBeNull()
    expect(root.className).toBe('')
    expect(root.hasAttribute('data-gr-portal')).toBe(true)
  })
})

/** Читает вычисленную цель телепорта из композабла. */
function mountTarget(options: { local?: string, provider?: string } = {}) {
  const seen: { target?: string | HTMLElement, enabled?: boolean } = {}

  const Probe = defineComponent({
    props: { local: { type: String, default: undefined } },
    setup(props) {
      const { target, enabled } = usePortalTarget(() => props.local)
      return () => {
        seen.target = target.value
        seen.enabled = enabled.value
        return null
      }
    },
  })

  const Harness = defineComponent({
    props: { local: { type: String, default: undefined }, provider: { type: String, default: undefined } },
    render() {
      const probe = h(Probe, { local: this.local })
      return this.provider
        ? h(GrConfigProvider, { portalTarget: this.provider }, { default: () => probe })
        : probe
    },
  })

  return { wrapper: mount(Harness, { props: options }), seen }
}

describe('usePortalTarget', () => {
  it('по умолчанию — общий корень портала', async () => {
    const { wrapper, seen } = mountTarget()
    await nextTick()

    expect(seen.target).toBe(getPortalRoot())

    wrapper.unmount()
  })

  it('`portalTarget` провайдера сильнее общего корня', async () => {
    const { wrapper, seen } = mountTarget({ provider: '#app-portal' })
    await nextTick()

    expect(seen.target).toBe('#app-portal')

    wrapper.unmount()
  })

  it('локальное переопределение компонента сильнее провайдера', async () => {
    const { wrapper, seen } = mountTarget({ provider: '#app-portal', local: '#inline-target' })
    await nextTick()

    expect(seen.target).toBe('#inline-target')

    wrapper.unmount()
  })

  it('первый рендер идёт без телепорта, дальше он включается', async () => {
    // Первый клиентский рендер обязан повторить серверный, иначе гидрация
    // разъезжается (см. `useTeleportEnabled`).
    const { wrapper, seen } = mountTarget()
    expect(seen.enabled).toBe(false)

    await nextTick()
    expect(seen.enabled).toBe(true)

    wrapper.unmount()
  })
})
