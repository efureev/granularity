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

import DsModal from '../DsModal.vue'

function mountHarness(options: { closeOnBackdrop: boolean, size?: 'sm' | 'md' | 'lg' | 'xl' | 'full' }) {
  const Harness = defineComponent({
    name: 'Harness',
    components: { DsModal },
    props: {
      closeOnBackdrop: {
        type: Boolean,
        required: true,
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
      <DsModal
        v-model="open"
        :close-on-backdrop="closeOnBackdrop"
        :size="size"
      >
        <div data-testid="modal-body">Body</div>
      </DsModal>
    `,
  })

  return mount(Harness, {
    props: {
      closeOnBackdrop: options.closeOnBackdrop,
      size: options.size ?? 'md',
    },
    global: {
      stubs: {
        teleport: true,
      },
    },
  })
}

describe('granularity/DsModal (unit)', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('рендерит оверлей ниже панели, aria-hidden и дефолтный размер md', () => {
    const wrapper = mountHarness({ closeOnBackdrop: true })

    const overlay = wrapper.find('[data-ds-modal-overlay]')
    const panel = wrapper.find('[data-ds-modal-panel]')

    expect(overlay.exists()).toBe(true)
    expect(panel.exists()).toBe(true)

    expect(overlay.attributes('class')).toContain('z-0')
    expect(overlay.attributes('aria-hidden')).toBe('true')

    expect(panel.attributes('class')).toContain('relative')
    expect(panel.attributes('class')).toContain('z-10')
    expect(panel.attributes('class')).toContain('max-w-[560px]')

    wrapper.unmount()
  })

  it('закрывается по ESC (keydown.esc)', async () => {
    const wrapper = mountHarness({ closeOnBackdrop: true })

    expect(wrapper.find('[data-ds-modal-panel]').exists()).toBe(true)

    await wrapper.find('[data-testid="hu-dialog"]').trigger('keydown', { key: 'Escape' })
    await nextTick()

    expect(wrapper.find('[data-ds-modal-panel]').exists()).toBe(false)

    wrapper.unmount()
  })

  it('закрывается по @close, если closeOnBackdrop=true', async () => {
    const wrapper = mountHarness({ closeOnBackdrop: true })

    wrapper.findComponent({ name: 'Dialog' }).vm.$emit('close')
    await nextTick()

    expect(wrapper.find('[data-ds-modal-panel]').exists()).toBe(false)

    wrapper.unmount()
  })

  it('не закрывается по @close, если closeOnBackdrop=false', async () => {
    const wrapper = mountHarness({ closeOnBackdrop: false })

    wrapper.findComponent({ name: 'Dialog' }).vm.$emit('close')
    await nextTick()

    expect(wrapper.find('[data-ds-modal-panel]').exists()).toBe(true)

    wrapper.unmount()
  })

  it('применяет full-size модификатор для edge-case размера full', () => {
    const wrapper = mountHarness({ closeOnBackdrop: true, size: 'full' })

    const panelClass = wrapper.find('[data-ds-modal-panel]').attributes('class')

    expect(panelClass).toContain('max-w-none')
    expect(panelClass).toContain('h-[100svh]')
    expect(panelClass).toContain('sm:h-auto')
    expect(panelClass).toContain('rounded-none')

    wrapper.unmount()
  })

  it('рендерит контент напрямую внутри панели без header/footer и кнопки закрытия', () => {
    const wrapper = mountHarness({ closeOnBackdrop: true })

    expect(wrapper.find('[data-ds-dialog-header]').exists()).toBe(false)
    expect(wrapper.find('[data-ds-dialog-footer]').exists()).toBe(false)
    expect(wrapper.find('button[aria-label="Close"]').exists()).toBe(false)
    expect(wrapper.find('[data-ds-modal-panel] [data-testid="modal-body"]').exists()).toBe(true)

    wrapper.unmount()
  })
})