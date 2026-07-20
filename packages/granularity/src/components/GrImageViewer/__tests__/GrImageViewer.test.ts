import { mount } from '@vue/test-utils'
import { defineComponent, nextTick, ref } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { resetScrollLock } from '../../../composables/internal/useScrollLock'

vi.mock('@headlessui/vue', async () => {
  const { defineComponent } = await import('vue')
  const pass = (name: string, testid: string) => defineComponent({ name, template: `<div data-testid="${testid}"><slot /></div>` })
  return {
    Dialog: pass('Dialog', 'hu-dialog'),
    DialogPanel: pass('DialogPanel', 'hu-panel'),
    TransitionChild: pass('TransitionChild', 'hu-child'),
    TransitionRoot: defineComponent({
      name: 'TransitionRoot',
      props: { show: { type: Boolean, default: false } },
      template: '<div v-if="show"><slot /></div>',
    }),
  }
})

import GrImageViewer from '../GrImageViewer.vue'

afterEach(() => resetScrollLock())

function mountViewer(extra: Record<string, unknown> = {}) {
  const Harness = defineComponent({
    components: { GrImageViewer },
    setup() {
      const open = ref(true)
      return { open }
    },
    template: `<GrImageViewer v-model="open" :url-list="['/a.jpg','/b.jpg']" show-progress v-bind="$attrs" />`,
    inheritAttrs: false,
  })
  // Стаб teleport: рендерим контент инлайн, чтобы `wrapper.find` его видел.
  return mount(Harness, { attrs: extra, global: { stubs: { teleport: true } } })
}

describe('GrImageViewer (decomposed)', () => {
  it('renders the current image, progress and zoom value', () => {
    const wrapper = mountViewer()
    expect(wrapper.find('[data-gr-image-viewer-image]').attributes('src')).toBe('/a.jpg')
    expect(wrapper.find('[data-gr-image-viewer-progress]').text()).toBe('1 / 2')
    expect(wrapper.find('[data-gr-image-viewer-zoom-value]').text()).toBe('100%')
  })

  it('zoom in/out updates the zoom value (useZoomPan)', async () => {
    const wrapper = mountViewer()
    await wrapper.find('[data-gr-image-viewer-zoom-in]').trigger('click')
    expect(wrapper.find('[data-gr-image-viewer-zoom-value]').text()).toBe('120%')
    await wrapper.find('[data-gr-image-viewer-zoom-reset]').trigger('click')
    expect(wrapper.find('[data-gr-image-viewer-zoom-value]').text()).toBe('100%')
  })

  it('rotate buttons emit rotate with cumulative degrees', async () => {
    const wrapper = mountViewer()
    const viewer = wrapper.findComponent(GrImageViewer)
    await wrapper.find('[data-gr-image-viewer-rotate-right]').trigger('click')
    await wrapper.find('[data-gr-image-viewer-rotate-right]').trigger('click')
    expect(viewer.emitted('rotate')?.at(-1)).toEqual([180])
  })

  it('switches image via next/prev (index management)', async () => {
    const wrapper = mountViewer()
    await wrapper.find('[data-gr-image-viewer-next]').trigger('click')
    expect(wrapper.find('[data-gr-image-viewer-image]').attributes('src')).toBe('/b.jpg')
    expect(wrapper.find('[data-gr-image-viewer-progress]').text()).toBe('2 / 2')
  })

  it('keyboard: ArrowRight switches, Escape closes (useViewerKeyboard)', async () => {
    const wrapper = mountViewer()
    const dialog = wrapper.find('[data-testid="hu-dialog"]')

    await dialog.trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.find('[data-gr-image-viewer-image]').attributes('src')).toBe('/b.jpg')

    await dialog.trigger('keydown', { key: 'Escape' })
    await nextTick()
    expect(wrapper.find('[data-gr-image-viewer-image]').exists()).toBe(false)
  })

  it('close button closes the viewer', async () => {
    const wrapper = mountViewer()
    await wrapper.find('[data-gr-image-viewer-close]').trigger('click')
    await nextTick()
    expect(wrapper.find('[data-gr-image-viewer-image]').exists()).toBe(false)
  })
})
