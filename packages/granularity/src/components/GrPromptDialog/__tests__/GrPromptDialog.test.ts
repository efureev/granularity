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

import GrPromptDialog from '../GrPromptDialog.vue'

afterEach(() => {
  document.body.innerHTML = ''
})


describe('GrPromptDialog', () => {
  it('показывает ошибку при пустом значении и подтверждает при заполнении', async () => {
    const Harness = defineComponent({
      name: 'HarnessPrompt',
      components: { GrPromptDialog },
      setup() {
        const open = ref(true)
        const value = ref('')
        const onConfirm = vi.fn()
        return { open, value, onConfirm }
      },
      template:
        '<GrPromptDialog v-model="open" v-model:value="value" title="T" confirm-text="Save" cancel-text="Cancel" @confirm="onConfirm" />',
    })

    const wrapper = mount(Harness, {
      global: {
        stubs: {
          teleport: true,
        },
      },
    })

    expect(wrapper.find('[data-testid="ds-prompt-confirm"]').text()).toContain('Save')

    await wrapper.find('[data-testid="ds-prompt-confirm"]').trigger('click')
    await nextTick()

    expect((wrapper.vm as any).onConfirm).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('Enter a value.')

    await wrapper.find('[data-testid="ds-prompt-input"]').setValue('New name')
    await wrapper.find('[data-testid="ds-prompt-confirm"]').trigger('click')
    await nextTick()

    expect((wrapper.vm as any).onConfirm).toHaveBeenCalledWith('New name')
    expect((wrapper.vm as any).open).toBe(false)

    wrapper.unmount()
  })

  it('пробрасывает headerConfig и footerConfig в базовый GrDialog', () => {
    const wrapper = mount(
      defineComponent({
        name: 'HarnessPromptSectionConfig',
        components: { GrPromptDialog },
        setup() {
          const open = ref(true)
          const value = ref('Value')
          return { open, value }
        },
        template: `
          <GrPromptDialog
            v-model="open"
            v-model:value="value"
            title="T"
            :header-config="{ paddingX: 'px-4', paddingY: 'py-2', bordered: false }"
            :footer-config="{ paddingX: 'px-3', paddingY: 'py-1', bordered: false }"
          />
        `,
      }),
      {
        global: {
          stubs: {
            teleport: true,
          },
        },
      },
    )

    expect(wrapper.find('[data-ds-dialog-header]').classes()).toContain('px-4')
    expect(wrapper.find('[data-ds-dialog-header]').classes()).toContain('py-2')
    expect(wrapper.find('[data-ds-dialog-header]').classes()).not.toContain('border-b')

    expect(wrapper.find('[data-ds-dialog-footer]').classes()).toContain('px-3')
    expect(wrapper.find('[data-ds-dialog-footer]').classes()).toContain('py-1')
    expect(wrapper.find('[data-ds-dialog-footer]').classes()).not.toContain('border-t')

    wrapper.unmount()
  })

  it('пробрасывает buttonSize в action-кнопки', () => {
    const wrapper = mount(
      defineComponent({
        name: 'HarnessPromptButtonSize',
        components: { GrPromptDialog },
        setup() {
          const open = ref(true)
          const value = ref('Value')
          return { open, value }
        },
        template: '<GrPromptDialog v-model="open" v-model:value="value" title="T" button-size="xs" />',
      }),
      {
        global: {
          stubs: {
            teleport: true,
          },
        },
      },
    )

    expect(wrapper.find('[data-testid="ds-prompt-cancel"]').classes()).toContain('h-7')
    expect(wrapper.find('[data-testid="ds-prompt-cancel"]').classes()).toContain('px-2.5')
    expect(wrapper.find('[data-testid="ds-prompt-confirm"]').classes()).toContain('h-7')
    expect(wrapper.find('[data-testid="ds-prompt-confirm"]').classes()).toContain('px-2.5')

    wrapper.unmount()
  })
})
