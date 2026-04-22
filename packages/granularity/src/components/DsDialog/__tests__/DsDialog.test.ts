import { mount } from '@vue/test-utils'
import { defineComponent, nextTick, ref } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'

// Мокаем HeadlessUI, чтобы избавиться от teleport/focus-trap и иметь
// возможность дёргать `close` через Esc. Эмулируем тот же контракт, что в
// тестах `DsModal` (Esc → emit('close')).
import { vi } from 'vitest'
vi.mock('@headlessui/vue', async () => {
  const { defineComponent } = await import('vue')
  return {
    Dialog: defineComponent({
      name: 'Dialog',
      emits: ['close'],
      props: { as: { type: String, default: 'div' } },
      setup(_, { emit }) {
        function onKeydown(event: KeyboardEvent) {
          if (event.key === 'Escape') emit('close')
        }
        return { onKeydown }
      },
      template: '<div data-testid="hu-dialog" @keydown="onKeydown"><slot /></div>',
    }),
    DialogPanel: defineComponent({
      name: 'DialogPanel',
      template: '<div data-testid="hu-panel"><slot /></div>',
    }),
    DialogTitle: defineComponent({
      name: 'DialogTitle',
      template: '<div data-testid="hu-title"><slot /></div>',
    }),
    DialogDescription: defineComponent({
      name: 'DialogDescription',
      template: '<div data-testid="hu-description"><slot /></div>',
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

import DsDialog from '../DsDialog.vue'

afterEach(() => {
  document.body.innerHTML = ''
})

function makeHarness(template: string) {
  return defineComponent({
    name: 'HarnessDsDialog',
    components: { DsDialog },
    setup() {
      const open = ref(true)
      return { open }
    },
    template,
  })
}

function mountHarness(template: string) {
  return mount(makeHarness(template), { global: { stubs: { teleport: true } } })
}

describe('DsDialog', () => {
  it('рендерит видимый title в хедере и кнопку закрытия по умолчанию', () => {
    const wrapper = mountHarness(`
      <DsDialog v-model="open" title="Settings">
        <div data-testid="body">Body</div>
      </DsDialog>
    `)

    const header = wrapper.find('[data-ds-dialog-header]')
    expect(header.exists()).toBe(true)
    expect(header.text()).toContain('Settings')
    expect(wrapper.find('[data-ds-dialog-close]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="body"]').exists()).toBe(true)
  })

  it('при showHeader=false хедер не рендерится, а sr-only title уходит в #title слот DsModal', () => {
    const wrapper = mountHarness(`
      <DsDialog v-model="open" title="Hidden header title" :show-header="false">
        Body
      </DsDialog>
    `)

    expect(wrapper.find('[data-ds-dialog-header]').exists()).toBe(false)
    const huTitle = wrapper.find('[data-testid="hu-title"]')
    expect(huTitle.exists()).toBe(true)
    expect(huTitle.text()).toBe('Hidden header title')
    // sr-only класс навешен на обёртку заголовка.
    expect(huTitle.html()).toContain('sr-only')
  })

  it('футер рендерится только если передан слот #footer', () => {
    const withoutFooter = mountHarness(`
      <DsDialog v-model="open" title="T">Body</DsDialog>
    `)
    expect(withoutFooter.find('[data-ds-dialog-footer]').exists()).toBe(false)

    const withFooter = mountHarness(`
      <DsDialog v-model="open" title="T">
        <template #footer><button data-testid="ok">OK</button></template>
        Body
      </DsDialog>
    `)
    expect(withFooter.find('[data-ds-dialog-footer]').exists()).toBe(true)
    expect(withFooter.find('[data-testid="ok"]').exists()).toBe(true)
  })

  it('клик по кнопке закрытия эмитит update:modelValue=false', async () => {
    const wrapper = mountHarness(`
      <DsDialog v-model="open" title="T">Body</DsDialog>
    `)
    await wrapper.find('[data-ds-dialog-close]').trigger('click')
    await nextTick()
    expect((wrapper.vm as any).open).toBe(false)
  })

  it('проп closeLabel прокидывается на кнопку закрытия как aria-label', () => {
    const wrapper = mountHarness(`
      <DsDialog v-model="open" title="T" close-label="Закрыть">Body</DsDialog>
    `)
    const btn = wrapper.find('[data-ds-dialog-close]')
    expect(btn.attributes('aria-label')).toBe('Закрыть')
  })

  it('кастомный слот #header подменяет видимый заголовок; a11y-title остаётся через DsModal', () => {
    const wrapper = mountHarness(`
      <DsDialog v-model="open" title="A11y only">
        <template #header="{ title }">
          <div data-testid="custom-header">Custom: {{ title }}</div>
        </template>
        Body
      </DsDialog>
    `)

    const customHeader = wrapper.find('[data-testid="custom-header"]')
    expect(customHeader.exists()).toBe(true)
    expect(customHeader.text()).toBe('Custom: A11y only')

    // sr-only title идёт через #title слот DsModal (проверяем, что это тот hu-title,
    // который внутри DsModal DialogPanel, и у него есть `sr-only`).
    const huTitles = wrapper.findAll('[data-testid="hu-title"]')
    const srOnly = huTitles.find(w => w.html().includes('sr-only'))
    expect(srOnly).toBeTruthy()
    expect(srOnly!.text()).toBe('A11y only')
  })

  it('Esc закрывает при closeOnEsc=true и не закрывает при closeOnEsc=false', async () => {
    const withEsc = mountHarness(`
      <DsDialog v-model="open" title="T">Body</DsDialog>
    `)
    await withEsc.find('[data-testid="hu-dialog"]').trigger('keydown', { key: 'Escape' })
    await nextTick()
    expect((withEsc.vm as any).open).toBe(false)

    const withoutEsc = mountHarness(`
      <DsDialog v-model="open" title="T" :close-on-esc="false">Body</DsDialog>
    `)
    await withoutEsc.find('[data-testid="hu-dialog"]').trigger('keydown', { key: 'Escape' })
    await nextTick()
    expect((withoutEsc.vm as any).open).toBe(true)
  })
})
