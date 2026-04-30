import { mount } from '@vue/test-utils'
import { defineComponent, nextTick, ref } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('@headlessui/vue', async () => {
  const { defineComponent } = await import('vue')

  return {
    Dialog: defineComponent({
      name: 'Dialog',
      emits: ['close'],
      template: '<div data-testid="hu-dialog"><slot /></div>',
    }),
    DialogPanel: defineComponent({
      name: 'DialogPanel',
      template: '<div data-testid="hu-panel"><slot /></div>',
    }),
    DialogTitle: defineComponent({
      name: 'DialogTitle',
      template: '<div data-testid="hu-title"><slot /></div>',
    }),
    TransitionRoot: defineComponent({
      name: 'TransitionRoot',
      props: { show: { type: Boolean, default: false } },
      template: '<div v-if="show"><slot /></div>',
    }),
    TransitionChild: defineComponent({
      name: 'TransitionChild',
      template: '<div><slot /></div>',
    }),
  }
})

import GrDrawer from '../GrDrawer.vue'

function mountHarness(options: { closeOnBackdrop: boolean, side?: 'left' | 'right', size?: 'sm' | 'md' | 'lg' | 'full' }) {
  const Harness = defineComponent({
    name: 'Harness',
    components: { GrDrawer },
    props: {
      closeOnBackdrop: {
        type: Boolean,
        required: true,
      },
      side: {
        type: String,
        default: 'right',
      },
      size: {
        type: String,
        default: 'md',
      },
    },
    setup() {
      const open = ref(true)
      return { open }
    },
    template: `
      <GrDrawer
        v-model="open"
        title="Filters"
        :close-on-backdrop="closeOnBackdrop"
        :side="side"
        :size="size"
      >
        <div data-testid="drawer-body">Body</div>
      </GrDrawer>
    `,
  })

  return mount(Harness, {
    props: {
      closeOnBackdrop: options.closeOnBackdrop,
      side: options.side ?? 'right',
      size: options.size ?? 'md',
    },
    global: {
      stubs: {
        teleport: true,
      },
    },
  })
}

describe('granularity/GrDrawer (unit)', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('рендерит правую панель по умолчанию с md-размером и заголовком', () => {
    const wrapper = mountHarness({ closeOnBackdrop: true })

    const overlay = wrapper.find('[data-ds-drawer-overlay]')
    const panel = wrapper.find('[data-ds-drawer-panel]')

    expect(overlay.exists()).toBe(true)
    expect(overlay.attributes('class')).toContain('bg-black/40')
    expect(overlay.attributes('aria-hidden')).toBe('true')

    expect(panel.attributes('class')).toContain('right-0')
    expect(panel.attributes('class')).toContain('border-l')
    expect(panel.attributes('class')).toContain('w-[420px]')
    expect(panel.text()).toContain('Filters')
    expect(panel.find('[data-testid="drawer-body"]').exists()).toBe(true)

    wrapper.unmount()
  })

  it('закрывается по backdrop и ESC, если closeOnBackdrop=true', async () => {
    const wrapper = mountHarness({ closeOnBackdrop: true, side: 'left', size: 'lg' })

    expect(wrapper.find('[data-ds-drawer-panel]').attributes('class')).toContain('left-0')
    expect(wrapper.find('[data-ds-drawer-panel]').attributes('class')).toContain('w-[560px]')

    await wrapper.find('[data-ds-drawer-overlay]').trigger('click')
    await nextTick()

    expect(wrapper.find('[data-ds-drawer-panel]').exists()).toBe(false)

    wrapper.unmount()

    const escWrapper = mountHarness({ closeOnBackdrop: true })

    await escWrapper.find('[data-testid="hu-dialog"]').trigger('keydown', { key: 'Escape' })
    await nextTick()

    expect(escWrapper.find('[data-ds-drawer-panel]').exists()).toBe(false)

    escWrapper.unmount()
  })

  it('не закрывается по backdrop-close, если closeOnBackdrop=false, но кнопка закрытия работает', async () => {
    const wrapper = mountHarness({ closeOnBackdrop: false, size: 'full' })

    expect(wrapper.find('[data-ds-drawer-panel]').attributes('class')).toContain('w-[100vw]')

    await wrapper.find('[data-ds-drawer-overlay]').trigger('click')
    await nextTick()

    expect(wrapper.find('[data-ds-drawer-panel]').exists()).toBe(true)

    await wrapper.find('button[aria-label="Close"]').trigger('click')
    await nextTick()

    expect(wrapper.find('[data-ds-drawer-panel]').exists()).toBe(false)

    wrapper.unmount()
  })
})