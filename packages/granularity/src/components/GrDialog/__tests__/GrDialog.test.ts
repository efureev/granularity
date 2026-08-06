import { mount } from '@vue/test-utils'
import { defineComponent, nextTick, ref } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'

// Мокаем HeadlessUI, чтобы избавиться от teleport/focus-trap. Escape мок в
// `close` не превращает: общий стек слоёв гасит нажатие в capture-фазе на
// `window`, и до `<Dialog>` оно не доходит (тот же контракт в тестах `GrModal`).
vi.mock('@headlessui/vue', async () => {
  const { defineComponent } = await import('vue')
  return {
    Dialog: defineComponent({
      name: 'Dialog',
      emits: ['close'],
      props: {
        as: { type: String, default: 'div' },
        initialFocus: { type: Object, default: null },
      },
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

import GrDialog from '../GrDialog.vue'

afterEach(() => {
  document.body.innerHTML = ''
})

function makeHarness(template: string) {
  return defineComponent({
    name: 'HarnessGrDialog',
    components: { GrDialog },
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

describe('GrDialog', () => {
  it('рендерит видимый title в хедере и кнопку закрытия по умолчанию', () => {
    const wrapper = mountHarness(`
      <GrDialog v-model="open" title="Settings">
        <div data-testid="body">Body</div>
      </GrDialog>
    `)

    const header = wrapper.find('[data-gr-dialog-header]')
    expect(header.exists()).toBe(true)
    expect(header.text()).toContain('Settings')
    expect(wrapper.find('[data-gr-dialog-close]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="body"]').exists()).toBe(true)
  })

  it('при showHeader=false хедер не рендерится, а sr-only title уходит в #title слот GrModal', () => {
    const wrapper = mountHarness(`
      <GrDialog v-model="open" title="Hidden header title" :show-header="false">
        Body
      </GrDialog>
    `)

    expect(wrapper.find('[data-gr-dialog-header]').exists()).toBe(false)
    const huTitle = wrapper.find('[data-testid="hu-title"]')
    expect(huTitle.exists()).toBe(true)
    expect(huTitle.text()).toBe('Hidden header title')
    // sr-only класс навешен на обёртку заголовка.
    expect(huTitle.html()).toContain('sr-only')
  })

  it('футер рендерится только если передан слот #footer', () => {
    const withoutFooter = mountHarness(`
      <GrDialog v-model="open" title="T">Body</GrDialog>
    `)
    expect(withoutFooter.find('[data-gr-dialog-footer]').exists()).toBe(false)

    const withFooter = mountHarness(`
      <GrDialog v-model="open" title="T">
        <template #footer><button data-testid="ok">OK</button></template>
        Body
      </GrDialog>
    `)
    expect(withFooter.find('[data-gr-dialog-footer]').exists()).toBe(true)
    expect(withFooter.find('[data-testid="ok"]').exists()).toBe(true)
  })

  it('клик по кнопке закрытия эмитит update:modelValue=false', async () => {
    const wrapper = mountHarness(`
      <GrDialog v-model="open" title="T">Body</GrDialog>
    `)
    await wrapper.find('[data-gr-dialog-close]').trigger('click')
    await nextTick()
    expect((wrapper.vm as any).open).toBe(false)
  })

  it('проп closeLabel прокидывается на кнопку закрытия как aria-label', () => {
    const wrapper = mountHarness(`
      <GrDialog v-model="open" title="T" close-label="Закрыть">Body</GrDialog>
    `)
    const btn = wrapper.find('[data-gr-dialog-close]')
    expect(btn.attributes('aria-label')).toBe('Закрыть')
  })

  it('кастомный слот #header подменяет видимый заголовок; a11y-title остаётся через GrModal', () => {
    const wrapper = mountHarness(`
      <GrDialog v-model="open" title="A11y only">
        <template #header="{ title }">
          <div data-testid="custom-header">Custom: {{ title }}</div>
        </template>
        Body
      </GrDialog>
    `)

    const customHeader = wrapper.find('[data-testid="custom-header"]')
    expect(customHeader.exists()).toBe(true)
    expect(customHeader.text()).toBe('Custom: A11y only')

    // sr-only title идёт через #title слот GrModal (проверяем, что это тот hu-title,
    // который внутри GrModal DialogPanel, и у него есть `sr-only`).
    const huTitles = wrapper.findAll('[data-testid="hu-title"]')
    const srOnly = huTitles.find(w => w.html().includes('sr-only'))
    expect(srOnly).toBeTruthy()
    expect(srOnly!.text()).toBe('A11y only')
  })

  it('Esc закрывает при closeOnEsc=true и не закрывает при closeOnEsc=false', async () => {
    function pressEscape(): void {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }))
    }

    const withEsc = mountHarness(`
      <GrDialog v-model="open" title="T">Body</GrDialog>
    `)
    pressEscape()
    await nextTick()
    expect((withEsc.vm as any).open).toBe(false)
    withEsc.unmount()

    const withoutEsc = mountHarness(`
      <GrDialog v-model="open" title="T" :close-on-esc="false">Body</GrDialog>
    `)
    pressEscape()
    await nextTick()
    expect((withoutEsc.vm as any).open).toBe(true)
    withoutEsc.unmount()
  })

  it('передаёт имя окна вниз, чтобы GrModal не подставлял обобщённое', () => {
    const wrapper = mountHarness(`
      <GrDialog v-model="open" title="Профиль">Body</GrDialog>
    `)

    expect(wrapper.find('[data-testid="hu-dialog"]').attributes('aria-label')).toBe('Профиль')
    wrapper.unmount()
  })

  it('ariaLabel даёт имя окну без заголовка вовсе', () => {
    const wrapper = mountHarness(`
      <GrDialog v-model="open" :show-header="false" aria-label="Мастер импорта">Body</GrDialog>
    `)

    expect(wrapper.find('[data-testid="hu-dialog"]').attributes('aria-label')).toBe('Мастер импорта')
    wrapper.unmount()
  })
})
