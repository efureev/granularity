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

import DsConfirmDialog from '../DsConfirmDialog.vue'

afterEach(() => {
  document.body.innerHTML = ''
})

describe('DsConfirmDialog', () => {
  it('рендерит описание и дефолтные тексты, а confirm/cancel закрывают диалог', async () => {
    const Harness = defineComponent({
      name: 'HarnessConfirmDialogActions',
      components: { DsConfirmDialog },
      setup() {
        const open = ref(true)
        const onConfirm = vi.fn()
        const onCancel = vi.fn()

        return { open, onConfirm, onCancel }
      },
      template: `
        <DsConfirmDialog
          v-model="open"
          description="Delete the current item?"
          @confirm="onConfirm"
          @cancel="onCancel"
        />
      `,
    })

    const wrapper = mount(Harness, {
      global: {
        stubs: {
          teleport: true,
        },
      },
    })

    expect(wrapper.text()).toContain('Confirm')
    expect(wrapper.text()).toContain('Delete the current item?')
    expect(wrapper.find('[data-testid="ds-confirm-cancel"]').text()).toBe('Cancel')
    expect(wrapper.find('[data-testid="ds-confirm-confirm"]').text()).toBe('Confirm')

    await wrapper.find('[data-testid="ds-confirm-cancel"]').trigger('click')
    await nextTick()

    expect((wrapper.vm as any).onCancel).toHaveBeenCalledTimes(1)
    expect((wrapper.vm as any).open).toBe(false)

    ;(wrapper.vm as any).open = true
    await nextTick()
    await wrapper.find('[data-testid="ds-confirm-confirm"]').trigger('click')
    await nextTick()

    expect((wrapper.vm as any).onConfirm).toHaveBeenCalledTimes(1)
    expect((wrapper.vm as any).open).toBe(false)

    wrapper.unmount()
  })

  it('пробрасывает headerConfig, footerConfig и buttonSize в базовые компоненты', () => {
    const wrapper = mount(
      defineComponent({
        name: 'HarnessConfirmDialogConfig',
        components: { DsConfirmDialog },
        setup() {
          const open = ref(true)

          return { open }
        },
        template: `
          <DsConfirmDialog
            v-model="open"
            title="Archive item"
            button-size="xs"
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

    expect(wrapper.find('[data-testid="ds-confirm-cancel"]').classes()).toContain('h-7')
    expect(wrapper.find('[data-testid="ds-confirm-cancel"]').classes()).toContain('px-2.5')
    expect(wrapper.find('[data-testid="ds-confirm-confirm"]').classes()).toContain('h-7')
    expect(wrapper.find('[data-testid="ds-confirm-confirm"]').classes()).toContain('px-2.5')

    wrapper.unmount()
  })
})