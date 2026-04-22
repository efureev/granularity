import { mount } from '@vue/test-utils'
import { defineComponent, nextTick, ref } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('@headlessui/vue', async () => {
  const { defineComponent } = await import('vue')

  return {
    // `Dialog` эмулирует поведение HeadlessUI: при нажатии Esc
    // эмитит `close`, а сам `class`/`initial-focus` пробрасывает вниз.
    Dialog: defineComponent({
      name: 'Dialog',
      emits: ['close'],
      props: {
        as: { type: String, default: 'div' },
        initialFocus: { type: Object, default: null },
      },
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

import DsModal from '../DsModal.vue'

interface HarnessOptions {
  closeOnBackdrop?: boolean
  closeOnEsc?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  withTitleSlot?: boolean
  withDescriptionSlot?: boolean
}

function mountHarness(options: HarnessOptions = {}) {
  const slots: Record<string, string> = {
    default: '<div data-testid="modal-body">Body</div>',
  }
  if (options.withTitleSlot)
    slots.title = '<span data-testid="title-slot">Title</span>'
  if (options.withDescriptionSlot)
    slots.description = '<span data-testid="description-slot">Desc</span>'

  const Harness = defineComponent({
    name: 'Harness',
    components: { DsModal },
    props: {
      closeOnBackdrop: { type: Boolean, default: true },
      closeOnEsc: { type: Boolean, default: true },
      size: { type: String, default: 'md' },
    },
    setup() {
      const open = ref(true)
      return { open }
    },
    template: `
      <DsModal
        v-model="open"
        :close-on-backdrop="closeOnBackdrop"
        :close-on-esc="closeOnEsc"
        :size="size"
      >
        ${Object.entries(slots)
          .map(([name, html]) =>
            name === 'default'
              ? html
              : `<template #${name}>${html}</template>`,
          )
          .join('\n')}
      </DsModal>
    `,
  })

  return mount(Harness, {
    props: {
      closeOnBackdrop: options.closeOnBackdrop ?? true,
      closeOnEsc: options.closeOnEsc ?? true,
      size: options.size ?? 'md',
    },
    global: {
      stubs: { teleport: true },
    },
  })
}

describe('granularity/DsModal (unit)', () => {
  afterEach(() => {
    document.body.innerHTML = ''
    document.body.style.overflow = ''
  })

  it('рендерит оверлей ниже панели, aria-hidden и дефолтный размер md', () => {
    const wrapper = mountHarness()

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

  it('закрывается по Esc, когда closeOnEsc=true (по умолчанию)', async () => {
    const wrapper = mountHarness()

    await wrapper.find('[data-testid="hu-dialog"]').trigger('keydown', { key: 'Escape' })
    await nextTick()

    expect(wrapper.find('[data-ds-modal-panel]').exists()).toBe(false)

    wrapper.unmount()
  })

  it('не закрывается по Esc, если closeOnEsc=false', async () => {
    const wrapper = mountHarness({ closeOnEsc: false })

    await wrapper.find('[data-testid="hu-dialog"]').trigger('keydown', { key: 'Escape' })
    await nextTick()

    expect(wrapper.find('[data-ds-modal-panel]').exists()).toBe(true)

    wrapper.unmount()
  })

  it('Esc закрывает даже при closeOnBackdrop=false (независимость флагов)', async () => {
    const wrapper = mountHarness({ closeOnBackdrop: false, closeOnEsc: true })

    await wrapper.find('[data-testid="hu-dialog"]').trigger('keydown', { key: 'Escape' })
    await nextTick()

    expect(wrapper.find('[data-ds-modal-panel]').exists()).toBe(false)

    wrapper.unmount()
  })

  it('закрывается по клику на оверлей, если closeOnBackdrop=true', async () => {
    const wrapper = mountHarness({ closeOnBackdrop: true })

    await wrapper.find('[data-ds-modal-overlay]').trigger('pointerdown')
    wrapper.findComponent({ name: 'Dialog' }).vm.$emit('close')
    await nextTick()

    expect(wrapper.find('[data-ds-modal-panel]').exists()).toBe(false)

    wrapper.unmount()
  })

  it('не закрывается по клику на оверлей, если closeOnBackdrop=false', async () => {
    const wrapper = mountHarness({ closeOnBackdrop: false })

    await wrapper.find('[data-ds-modal-overlay]').trigger('pointerdown')
    wrapper.findComponent({ name: 'Dialog' }).vm.$emit('close')
    await nextTick()

    expect(wrapper.find('[data-ds-modal-panel]').exists()).toBe(true)

    wrapper.unmount()
  })

  it('применяет full-size модификатор для edge-case размера full', () => {
    const wrapper = mountHarness({ size: 'full' })

    const panelClass = wrapper.find('[data-ds-modal-panel]').attributes('class')

    expect(panelClass).toContain('max-w-none')
    expect(panelClass).toContain('h-[100svh]')
    expect(panelClass).toContain('sm:h-auto')
    expect(panelClass).toContain('rounded-none')

    wrapper.unmount()
  })

  it('рендерит контент напрямую внутри панели без header/footer и кнопки закрытия', () => {
    const wrapper = mountHarness()

    expect(wrapper.find('[data-ds-dialog-header]').exists()).toBe(false)
    expect(wrapper.find('[data-ds-dialog-footer]').exists()).toBe(false)
    expect(wrapper.find('button[aria-label="Close"]').exists()).toBe(false)
    expect(wrapper.find('[data-ds-modal-panel] [data-testid="modal-body"]').exists()).toBe(true)

    wrapper.unmount()
  })

  it('рендерит слоты #title и #description как DialogTitle/Description, только если переданы', () => {
    const wrapperEmpty = mountHarness()
    expect(wrapperEmpty.find('[data-ds-modal-title]').exists()).toBe(false)
    expect(wrapperEmpty.find('[data-ds-modal-description]').exists()).toBe(false)
    wrapperEmpty.unmount()

    const wrapper = mountHarness({ withTitleSlot: true, withDescriptionSlot: true })
    expect(wrapper.find('[data-ds-modal-title]').exists()).toBe(true)
    expect(wrapper.find('[data-ds-modal-description]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="title-slot"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="description-slot"]').exists()).toBe(true)
    wrapper.unmount()
  })

  it('блокирует прокрутку body при открытии и восстанавливает при закрытии', async () => {
    document.body.style.overflow = 'auto'

    const Harness = defineComponent({
      components: { DsModal },
      setup() {
        const open = ref(false)
        return { open }
      },
      template: `<DsModal v-model="open"><div>body</div></DsModal>`,
    })

    const wrapper = mount(Harness, {
      global: { stubs: { teleport: true } },
    })

    expect(document.body.style.overflow).toBe('auto')

    wrapper.vm.open = true
    await nextTick()
    expect(document.body.style.overflow).toBe('hidden')

    wrapper.vm.open = false
    await nextTick()
    expect(document.body.style.overflow).toBe('auto')

    wrapper.unmount()
  })
})
